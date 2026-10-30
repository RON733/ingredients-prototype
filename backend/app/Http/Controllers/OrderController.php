<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Ingredient;
use App\Models\AuditLog;
use App\Models\User;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['items', 'driver:id,name,phone,avatar'])->latest();

        if ($request->filled('status')) {
            $status = $request->status;
            if ($status === 'active') {
                $query->whereIn('status', ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery']);
            } elseif ($status === 'completed') {
                $query->where('status', 'Completed');
            } else {
                $query->where('status', $status);
            }
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                  ->orWhere('customer_name', 'like', "%{$s}%")
                  ->orWhere('customer_phone', 'like', "%{$s}%");
            });
        }

        $orders = $query->paginate($request->input('per_page', 50));
        return response()->json($orders);
    }

    public function show($id)
    {
        $cleanId = ltrim(trim($id), '#');
        $order = Order::with(['items', 'driver:id,name,phone,avatar'])
            ->where('id', $cleanId)
            ->orWhere('order_number', $cleanId)
            ->orWhere('order_number', '#' . $cleanId)
            ->firstOrFail();

        return response()->json($order);
    }

    public function activeOrder(Request $request)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        $userId = $user?->id ?? $request->query('user_id');

        $query = Order::with(['items', 'driver:id,name,phone,avatar'])
            ->whereIn('status', ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'])
            ->latest();

        if ($userId) {
            $targetUser = User::find($userId);
            $query->where(function ($q) use ($userId, $targetUser) {
                $q->where('user_id', $userId);
                if ($targetUser) {
                    $q->orWhere(function ($sub) use ($targetUser) {
                        $sub->whereNull('user_id')
                            ->where(function ($match) use ($targetUser) {
                                $match->where('customer_name', $targetUser->name);
                                if (!empty($targetUser->phone)) {
                                    $match->orWhere('customer_phone', $targetUser->phone);
                                }
                            });
                    });
                }
            });
        }

        $order = $query->first();

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string',
            'order_type' => 'required|in:Delivery,Store Pickup,Walk-in',
            'delivery_address' => 'nullable|string',
            'customer_lat' => 'nullable|numeric',
            'customer_lng' => 'nullable|numeric',
            'payment_method' => 'required|in:Cash,GCash',
            'gcash_ref' => 'nullable|string',
            'proof_image' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.customization' => 'nullable|array',
        ]);

        // 1. Phone number validation (numbers only, standard 11 digits)
        $cleanPhone = preg_replace('/\D/', '', $validated['customer_phone']);
        if (strlen($cleanPhone) < 10 || strlen($cleanPhone) > 11) {
            return response()->json([
                'message' => 'Please provide a valid 11-digit contact number (numbers only, e.g. 09123456789).'
            ], 422);
        }
        $validated['customer_phone'] = $cleanPhone;

        // 2. Delivery address check
        if ($validated['order_type'] === 'Delivery' && empty(trim($validated['delivery_address'] ?? ''))) {
            return response()->json([
                'message' => 'Delivery address is required for Delivery orders.'
            ], 422);
        }

        // 3. GCash Payment verification: BOTH Reference Number AND Receipt Screenshot are strictly required
        if ($validated['payment_method'] === 'GCash') {
            $ref = trim($validated['gcash_ref'] ?? '');
            $proof = trim($validated['proof_image'] ?? '');

            if (empty($ref) && empty($proof)) {
                return response()->json([
                    'message' => 'GCash payment requires BOTH the Reference Number (9 to 13 digits) and an uploaded receipt screenshot.'
                ], 422);
            }

            if (empty($ref)) {
                return response()->json([
                    'message' => 'GCash Reference Number is required for online GCash payments.'
                ], 422);
            }

            if (empty($proof)) {
                return response()->json([
                    'message' => 'GCash Receipt Screenshot is required. Please upload a clear photo or screenshot of your GCash receipt.'
                ], 422);
            }

            $cleanRef = preg_replace('/\D/', '', $ref);
            if (strlen($cleanRef) < 9 || strlen($cleanRef) > 13) {
                return response()->json([
                    'message' => 'GCash reference number must contain only numbers and be 9 to 13 digits (standard Philippine GCash reference code).'
                ], 422);
            }
            $validated['gcash_ref'] = $cleanRef;
        }

        return DB::transaction(function () use ($validated, $request) {
            // 1. Gather all product IDs and batch-fetch products with recipes
            $productIds = array_unique(array_column($validated['items'], 'product_id'));
            $products = Product::with('recipes.ingredient')->whereIn('id', $productIds)->get()->keyBy('id');

            $ingredientDeductions = [];
            foreach ($validated['items'] as $item) {
                $product = $products->get($item['product_id']);
                if (!$product) {
                    return response()->json([
                        'message' => "Selected product ({$item['product_id']}) is no longer available in the menu."
                    ], 422);
                }
                $qty = (int)$item['quantity'];
                foreach ($product->recipes as $recipe) {
                    $ingId = $recipe->ingredient_id;
                    $needed = $recipe->qty * $qty;
                    $ingredientDeductions[$ingId] = ($ingredientDeductions[$ingId] ?? 0) + $needed;
                }
            }

            // 2. Batch-fetch all required ingredients in ONE single query
            $ingIds = array_keys($ingredientDeductions);
            $ingredients = Ingredient::whereIn('id', $ingIds)->get()->keyBy('id');

            // Verify stock sufficiency
            $depletedAlerts = [];
            foreach ($ingredientDeductions as $ingId => $totalNeeded) {
                $ingredient = $ingredients->get($ingId);
                if (!$ingredient || $ingredient->stock < $totalNeeded) {
                    $available = $ingredient ? $ingredient->stock : 0;
                    $unit = $ingredient ? $ingredient->unit : 'units';
                    $name = $ingredient ? $ingredient->name : $ingId;
                    $depletedAlerts[] = "{$name} (Needed: {$totalNeeded} {$unit}, Available: {$available} {$unit})";
                }
            }

            if (!empty($depletedAlerts)) {
                return response()->json([
                    'message' => 'Cannot place order: Insufficient kitchen stock for ' . implode(', ', $depletedAlerts) . '.',
                    'insufficient_ingredients' => $depletedAlerts,
                ], 422);
            }

            // 3. High-Performance Bulk Deduct: Single batch query instead of N sequential round-trips to cloud DB
            if (!empty($ingredientDeductions)) {
                $cases = [];
                $bindings = [];
                foreach ($ingredientDeductions as $ingId => $totalNeeded) {
                    $ingredient = $ingredients->get($ingId);
                    if ($ingredient) {
                        $newStock = max(0, (float)$ingredient->stock - (float)$totalNeeded);
                        $cases[] = "WHEN id = ? THEN ?::numeric";
                        $bindings[] = (string)$ingId;
                        $bindings[] = $newStock;
                    }
                }
                if (!empty($cases)) {
                    $caseSql = implode(' ', $cases);
                    $ids = array_keys($ingredientDeductions);
                    $placeholders = implode(',', array_fill(0, count($ids), '?'));
                    $bindings = array_merge($bindings, $ids);
                    DB::update("UPDATE ingredients SET stock = CASE {$caseSql} ELSE stock END, updated_at = NOW() WHERE id IN ({$placeholders})", $bindings);
                }
                \Illuminate\Support\Facades\Cache::forget('ingredients_all');
                \Illuminate\Support\Facades\Cache::forget('products_catalog_default');
            }

            // 4. Calculate pricing
            $subtotal = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = $products->get($item['product_id']);
                $unitPrice = $product->price;
                $quantity = (int)$item['quantity'];

                // Dynamic pricing additions for customizations (e.g. Large size +20, extra toppings)
                $customization = $item['customization'] ?? [];
                if (!empty($customization['size']) && strtolower($customization['size']) === 'large') {
                    $unitPrice += 20;
                }
                if (!empty($customization['toppings']) && is_array($customization['toppings'])) {
                    $unitPrice += count($customization['toppings']) * 15;
                }

                $itemSubtotal = $unitPrice * $quantity;
                $subtotal += $itemSubtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'subtotal' => $itemSubtotal,
                    'customization' => $customization,
                ];
            }

            $deliveryFee = ($validated['order_type'] === 'Delivery') ? 40.00 : 0.00;
            $totalAmount = $subtotal + $deliveryFee;

            // Generate unique order number (prevents duplicate key collisions with existing / seeded orders)
            $existingNumbers = Order::pluck('order_number')->map(function ($num) {
                return preg_match('/(\d+)/', (string)$num, $m) ? (int)$m[1] : 0;
            })->filter()->all();

            $maxExisting = !empty($existingNumbers) ? max($existingNumbers) : 0;
            $nextNum = max($maxExisting + 1, 31);

            do {
                $orderNumber = '#' . $nextNum;
                $nextNum++;
            } while (Order::where('order_number', $orderNumber)->exists());

            // 5. Create Order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => auth('sanctum')->user()?->id ?? $request->user()?->id ?? $request->input('user_id') ?? null,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'order_type' => $validated['order_type'],
                'delivery_address' => $validated['delivery_address'] ?? 'Store Pickup',
                'customer_lat' => $validated['customer_lat'] ?? null,
                'customer_lng' => $validated['customer_lng'] ?? null,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'Pending',
                'gcash_ref' => $validated['gcash_ref'] ?? null,
                'proof_image' => $validated['proof_image'] ?? null,
                'status' => 'Pending',
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? null,
            ]);

            $order->items()->createMany($itemsData);

            $placingRole = $request->user()?->role;
            if ($placingRole && in_array($placingRole, ['staff', 'admin', 'super_admin'])) {
                AuditLog::create([
                    'user_id' => $request->user()?->id,
                    'user_name' => $request->user()?->name ?? $validated['customer_name'],
                    'user_role' => $placingRole,
                    'action' => 'POS Order Placed',
                    'details' => "Order {$orderNumber} processed by staff for ₱{$totalAmount} ({$validated['order_type']}, {$validated['payment_method']}). Raw ingredients depleted automatically.",
                    'ip_address' => $request->ip(),
                ]);
            }

            return response()->json([
                'message' => 'Order placed successfully!',
                'order' => $order->load('items'),
            ], 201);
        });
    }

    public function updateStatus(Request $request, $id)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        $order = Order::with(['items', 'driver:id,name,phone,avatar'])->findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:Pending,Preparing,Ready for Pickup,Out for Delivery,Completed,Cancelled',
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        // Rider delivery constraint:
        // When a delivery order is Out for Delivery, ONLY the assigned rider has the authority to confirm and complete it!
        if ($order->order_type === 'Delivery' && $oldStatus === 'Out for Delivery' && $newStatus === 'Completed') {
            if ($user && $user->role === 'staff') {
                return response()->json([
                    'message' => 'Staff cannot complete a dispatched delivery. Only the assigned delivery rider has the authority to confirm delivery upon arrival.'
                ], 403);
            }
            if ($user && $user->role === 'driver' && $order->driver_id && $order->driver_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized. This delivery is assigned to another rider.'
                ], 403);
            }
        }

        // Customer constraint from capstone document:
        // "Customers may cancel an order only if it has not yet been approved or started by the staff. A system constraint prevents cancellation once the order is in the preparation stage."
        if ($user && $user->role === 'customer' && $newStatus === 'Cancelled') {
            if ($oldStatus !== 'Pending') {
                return response()->json([
                    'message' => 'Cancellation is not allowed once preparation has commenced.'
                ], 403);
            }
        }

        // If order was cancelled before preparing, restore ingredients!
        if ($newStatus === 'Cancelled' && $oldStatus === 'Pending') {
            foreach ($order->items as $item) {
                $product = Product::with('recipes')->find($item->product_id);
                if ($product) {
                    foreach ($product->recipes as $recipe) {
                        $ing = Ingredient::find($recipe->ingredient_id);
                        if ($ing) {
                            $ing->stock += ($recipe->qty * $item->quantity);
                            $ing->save();
                        }
                    }
                }
            }
        }

        if ($newStatus === 'Completed' && $order->payment_method === 'Cash') {
            $order->payment_status = 'Paid';
        }

        $order->status = $newStatus;
        $order->save();

        try {
            broadcast(new \App\Events\OrderStatusUpdated(
                $order->id,
                $order->status,
                $order->driver_id,
                $order->driver ? [
                    'id' => $order->driver->id,
                    'name' => $order->driver->name,
                    'phone' => $order->driver->phone,
                    'avatar' => $order->driver->avatar
                ] : null
            ));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Reverb broadcast warning: ' . $e->getMessage());
        }

        $actionName = ($user?->role === 'driver') ? 'Delivery Completed' : 'Order Status Changed';
        $actionDetails = ($user?->role === 'driver')
            ? "Order {$order->order_number} successfully delivered to {$order->customer_name} and marked Completed by driver {$user->name}." . ($order->payment_method === 'Cash' ? " Collected ?" . number_format($order->total_amount, 2) . " COD cash." : "")
            : "Order {$order->order_number} transitioned from {$oldStatus} to {$newStatus}";

        AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'Staff',
            'user_role' => $user?->role ?? 'staff',
            'action' => $actionName,
            'details' => $actionDetails,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Order status updated to {$newStatus}",
            'order' => $order,
        ]);
    }

    public function verifyPayment(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->payment_status = 'Verified';
        $order->save();

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Staff',
            'user_role' => $request->user()?->role ?? 'staff',
            'action' => 'Payment Verified',
            'details' => "Verified payment for order {$order->order_number} ({$order->payment_method})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Payment verified successfully.',
            'order' => $order,
        ]);
    }

    public function updateDriverLocation(Request $request, $id)
    {
        $validated = $request->validate([
            'driver_lat' => 'required|numeric',
            'driver_lng' => 'required|numeric',
            'driver_notes' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);
        $order->driver_lat = $validated['driver_lat'];
        $order->driver_lng = $validated['driver_lng'];
        if (isset($validated['driver_notes'])) {
            $order->driver_notes = $validated['driver_notes'];
        }
        $order->save();

        try {
            broadcast(new \App\Events\DriverLocationUpdated(
                $order->id,
                $order->driver_lat,
                $order->driver_lng,
                $order->driver_notes
            ));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Reverb broadcast warning: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Driver GPS location updated.',
            'order' => $order,
        ]);
    }

    public function updateCustomerLocation(Request $request, $id)
    {
        $validated = $request->validate([
            'customer_lat' => 'required|numeric',
            'customer_lng' => 'required|numeric',
            'delivery_address' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);
        $order->customer_lat = $validated['customer_lat'];
        $order->customer_lng = $validated['customer_lng'];
        if (!empty($validated['delivery_address'])) {
            $order->delivery_address = $validated['delivery_address'];
        }
        $order->save();

        return response()->json([
            'message' => 'Delivery location updated successfully.',
            'order' => $order,
        ]);
    }

    public function assignDriver(Request $request, $id)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:users,id',
        ]);

        $order = Order::findOrFail($id);
        $order->driver_id = $validated['driver_id'];
        $order->status = 'Out for Delivery';
        $order->save();

        $driver = User::find($validated['driver_id']);

        try {
            broadcast(new \App\Events\OrderStatusUpdated(
                $order->id,
                $order->status,
                $driver?->id,
                $driver ? [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'phone' => $driver->phone,
                    'avatar' => $driver->avatar
                ] : null
            ));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Reverb broadcast warning: ' . $e->getMessage());
        }

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Staff',
            'user_role' => $request->user()?->role ?? 'staff',
            'action' => 'Driver Assigned',
            'details' => "Order {$order->order_number} assigned to driver {$driver?->name} and dispatched for delivery.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Order assigned to driver {$driver?->name}",
            'order' => $order->load(['items', 'driver:id,name,phone,avatar']),
        ]);
    }

    public function getDrivers(Request $request)
    {
        $drivers = User::where('role', 'driver')
            ->where('status', 'active')
            ->select('id', 'name', 'email', 'phone', 'is_available', 'driver_status', 'avatar')
            ->get()
            ->map(function ($driver) {
                $driver->active_deliveries_count = Order::where('driver_id', $driver->id)
                    ->where('status', 'Out for Delivery')
                    ->count();
                return $driver;
            });

        return response()->json($drivers);
    }

    public function toggleDriverAvailability(Request $request)
    {
        $user = $request->user();
        if ($request->filled('driver_id')) {
            $found = User::find($request->input('driver_id'));
            if ($found) $user = $found;
        }
        if (!$user) {
            $user = User::where('role', 'driver')->first();
        }

        if (!$user) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        if ($request->has('is_available')) {
            $user->is_available = filter_var($request->input('is_available'), FILTER_VALIDATE_BOOLEAN);
        } else {
            $user->is_available = !$user->is_available;
        }

        $user->driver_status = $user->is_available ? 'available' : 'offline';
        $user->save();

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => 'driver',
            'action' => 'Driver Availability Changed',
            'details' => "Driver {$user->name} is now " . ($user->is_available ? 'Available' : 'Unavailable / On Break'),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Availability updated successfully.',
            'is_available' => $user->is_available,
            'driver_status' => $user->driver_status,
            'user' => $user,
        ]);
    }

    public function driverOrders(Request $request)
    {
        $user = $request->user();
        $driverId = $user ? $user->id : $request->query('driver_id');

        if (!$driverId) {
            $firstDriver = User::where('role', 'driver')->first();
            $driverId = $firstDriver?->id;
        }

        $query = Order::with(['items', 'driver:id,name,phone,avatar'])
            ->where('driver_id', $driverId)
            ->where('order_type', 'Delivery');

        if ($request->query('tab') === 'completed') {
            $orders = $query->where('status', 'Completed')->latest()->limit(50)->get();
        } else {
            // ONLY see orders that staff dispatched to this specific rider
            $orders = $query->where('status', 'Out for Delivery')->latest()->get();
        }

        return response()->json($orders);
    }
}
