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
use App\Models\RiderNotice;

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

        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }

        if ($request->filled('order_type')) {
            $query->where('order_type', $request->order_type);
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
        // Resolve acting user via Sanctum token, session, or verified user_id
        $actingUser = auth('sanctum')->user() ?? $request->user();
        if (!$actingUser && $request->filled('user_id')) {
            $actingUser = User::find($request->input('user_id'));
        }

        $isPosOrder = $request->boolean('is_pos') || $request->input('source') === 'pos' || $request->input('order_type') === 'Walk-in';

        // 1. Customer storefront checkout strictly requires being signed in
        if (!$isPosOrder && !$actingUser) {
            return response()->json([
                'message' => 'You must be signed in to check out and place an order. Please log in or create an account.'
            ], 401);
        }

        // 2. Workers and operational personnel cannot place customer storefront orders (POS orders permitted)
        if (!$isPosOrder && $actingUser && in_array($actingUser->role, ['staff', 'admin', 'super_admin', 'driver'])) {
            return response()->json([
                'message' => 'Store personnel and operational accounts cannot place customer storefront orders. Workers only require the Operations Dashboard.'
            ], 403);
        }

        // Maintenance Mode Check: If the website has been shut down by Super Admin, block new orders
        $maintenance = \App\Models\SystemSetting::where('key', 'maintenance_mode')->value('value');
        if ($maintenance === 'true' || $maintenance === '1') {
            return response()->json([
                'message' => 'The website is currently undergoing scheduled maintenance. New customer orders are temporarily disabled.'
            ], 503);
        }

        $validated = $request->validate([
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string',
            'order_type' => 'required|in:Delivery,Store Pickup,Walk-in',
            'delivery_address' => 'nullable|string',
            'customer_lat' => 'nullable|numeric',
            'customer_lng' => 'nullable|numeric',
            'payment_method' => 'required|in:Cash,PayMongo',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.customization' => 'nullable|array',
        ]);

        // 1. Phone number validation (numbers only, standard 11 digits, with 63->0 normalization)
        $cleanPhone = preg_replace('/\D/', '', $validated['customer_phone']);
        if (str_starts_with($cleanPhone, '63') && strlen($cleanPhone) === 12) {
            $cleanPhone = '0' . substr($cleanPhone, 2);
        }
        if (strlen($cleanPhone) !== 11) {
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

        // 2.5 PayMongo Availability check
        if ($validated['payment_method'] === 'PayMongo') {
            $pmAvail = \App\Models\SystemSetting::where('key', 'paymongo_available')->value('value');
            if ($pmAvail !== null && in_array(strtolower((string)$pmAvail), ['false', '0', 'no', 'off'], true)) {
                return response()->json([
                    'message' => 'Online payment is currently unavailable. Please select Cash on Delivery or Cash at Counter.'
                ], 422);
            }
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
                'user_id' => $actingUser?->id ?? auth('sanctum')->user()?->id ?? $request->user()?->id ?? $request->input('user_id') ?? null,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'order_type' => $validated['order_type'],
                'delivery_address' => $validated['delivery_address'] ?? 'Store Pickup',
                'customer_lat' => $validated['customer_lat'] ?? null,
                'customer_lng' => $validated['customer_lng'] ?? null,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'Pending',
                'status' => 'Pending',
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? null,
            ]);

            $order->items()->createMany($itemsData);

            $checkoutUrl = null;
            $qrImage = null;
            if ($validated['payment_method'] === 'PayMongo') {
                try {
                    $paymongoService = app(\App\Services\PayMongoService::class);

                    // 1. Generate Direct QR Ph payment code via PayMongo
                    $qrData = $paymongoService->createQrPhPayment($order);
                    if ($qrData && !empty($qrData['qr_image'])) {
                        $qrImage = $qrData['qr_image'];
                    }

                    // 2. Generate Hosted Checkout URL as fallback/alternative
                    $origin = $request->header('origin') ?: $request->header('referer') ?: config('app.url', 'http://127.0.0.1:8000');
                    $origin = rtrim($origin, '/');
                    if (filter_var($origin, FILTER_VALIDATE_URL)) {
                        $parsed = parse_url($origin);
                        $port = !empty($parsed['port']) ? (':' . $parsed['port']) : '';
                        $scheme = !empty($parsed['scheme']) ? $parsed['scheme'] : 'https';
                        $origin = $scheme . '://' . $parsed['host'] . $port;
                    } else {
                        $origin = config('app.url', 'http://127.0.0.1:8000');
                    }
                    $successUrl = $origin . '/?paymongo_status=success&order_id=' . $order->id;
                    $cancelUrl = $origin . '/?paymongo_status=cancelled&order_id=' . $order->id;

                    $sessionData = $paymongoService->createCheckoutSession($order, $successUrl, $cancelUrl);

                    $order->paymongo_session_id = $sessionData['session_id'];
                    $order->paymongo_checkout_url = $sessionData['checkout_url'];
                    $order->save();

                    $checkoutUrl = $sessionData['checkout_url'];
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error("PayMongo initialization error: " . $e->getMessage());
                    if (!$qrImage) {
                        throw new \Exception("Unable to initialize PayMongo checkout: " . $e->getMessage());
                    }
                }
            }

            // Automatically push order to Loyverse POS ONLY if already Completed or Paid (e.g. staff created POS order)
            // Online pending orders will sync upon approval / completion
            if ($order->status === 'Completed' || in_array($order->payment_status, ['Paid', 'Verified'])) {
                try {
                    app(\App\Services\LoyverseService::class)->pushOrderToLoyverse($order);
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Loyverse auto-sync warning: " . $e->getMessage());
                }
            }

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
                'checkout_url' => $checkoutUrl,
                'qr_image' => $qrImage ?? $order->paymongo_qr_image,
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

        // Payment Pre-condition constraint:
        // Online orders (PayMongo) MUST be Paid/Verified before kitchen preparation can begin!
        if ($newStatus === 'Preparing' && $order->payment_method !== 'Cash' && !in_array($order->payment_status, ['Paid', 'Verified'])) {
            return response()->json([
                'message' => "Cannot start preparation. Online payment for order {$order->order_number} ({$order->payment_method}) is still pending and must be verified first."
            ], 422);
        }

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

        // Restore ingredients on cancellation (any status except already Cancelled/Completed)
        if ($newStatus === 'Cancelled' && !in_array($oldStatus, ['Cancelled', 'Completed'])) {
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

        if ($newStatus === 'Completed') {
            if ($order->payment_method === 'Cash') {
                $order->payment_status = 'Paid';
            }
            if (empty($order->delivered_at)) {
                $order->delivered_at = now();
            }
        }

        $order->status = $newStatus;
        $order->save();

        // Push to Loyverse POS when order is completed
        if ($newStatus === 'Completed' && empty($order->loyverse_receipt_id) && $order->source !== 'loyverse_pos') {
            try {
                app(\App\Services\LoyverseService::class)->pushOrderToLoyverse($order);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Loyverse push on completion warning: ' . $e->getMessage());
            }
        }

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
            ? "Order {$order->order_number} successfully delivered to {$order->customer_name} and marked Completed by driver {$user->name}." . ($order->payment_method === 'Cash' ? " Collected ₱" . number_format($order->total_amount, 2) . " COD cash." : "")
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

    public function notifyOnTheWay(Request $request, $id)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        $order = Order::with(['items', 'driver:id,name,phone,avatar'])->findOrFail($id);

        $validated = $request->validate([
            'driver_lat' => 'nullable|numeric',
            'driver_lng' => 'nullable|numeric',
            'nav_app' => 'nullable|string',
            'force' => 'nullable|boolean',
        ]);

        $alreadyNotified = !empty($order->on_the_way_notified_at);
        $shouldNotify = !$alreadyNotified || (!empty($validated['force']) && $validated['force'] === true);

        // If driver coordinates are passed, update location
        if (isset($validated['driver_lat']) && isset($validated['driver_lng'])) {
            $order->driver_lat = $validated['driver_lat'];
            $order->driver_lng = $validated['driver_lng'];
        }

        // If driver wasn't explicitly assigned yet, assign the requesting driver
        if ($user && ($user->role === 'driver' || $user->role === 'rider') && empty($order->driver_id)) {
            $order->driver_id = $user->id;
        }

        // Ensure order status is Out for Delivery
        if ($order->status === 'Preparing' || $order->status === 'Ready for Pickup') {
            $order->status = 'Out for Delivery';
        }

        if ($shouldNotify) {
            $order->on_the_way_notified_at = now();
        }

        $order->save();
        $order->load(['driver:id,name,phone,avatar']);

        $driverName = $order->driver?->name ?? ($user?->name ?? 'G Shot Delivery Partner');
        $driverPhone = $order->driver?->phone ?? ($user?->phone ?? null);

        // Broadcast if newly notified or forced
        if ($shouldNotify) {
            try {
                broadcast(new \App\Events\DriverOnTheWay(
                    $order->id,
                    $order->order_number,
                    $order->driver_id,
                    $driverName,
                    $driverPhone,
                    $order->driver_lat,
                    $order->driver_lng,
                    $order->on_the_way_notified_at ? $order->on_the_way_notified_at->toIso8601String() : now()->toIso8601String(),
                    false,
                    "Rider {$driverName} is on the way to your doorstep!"
                ));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Reverb DriverOnTheWay broadcast warning: ' . $e->getMessage());
            }

            try {
                broadcast(new \App\Events\OrderStatusUpdated(
                    $order->id,
                    $order->status,
                    $order->driver_id,
                    $order->driver ? [
                        'id' => $order->driver->id,
                        'name' => $order->driver->name,
                        'phone' => $order->driver->phone,
                    ] : null
                ));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Reverb OrderStatusUpdated broadcast warning: ' . $e->getMessage());
            }

            // Create audit log
            try {
                AuditLog::create([
                    'user_id' => $user?->id,
                    'user_name' => $user?->name ?? $driverName,
                    'user_role' => $user?->role ?? 'driver',
                    'action' => 'driver_on_the_way',
                    'details' => "Rider {$driverName} alerted customer for Order {$order->order_number} (On the way via " . ($validated['nav_app'] ?? 'Navigation') . ")",
                ]);
            } catch (\Throwable $e) {}
        }

        return response()->json([
            'message' => $alreadyNotified && !$shouldNotify
                ? 'Navigation resumed. Customer was previously notified.'
                : 'Customer successfully notified that driver is on the way!',
            'order' => $order,
            'already_notified' => $alreadyNotified,
            'on_the_way_notified_at' => $order->on_the_way_notified_at,
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

        $driver = User::find($validated['driver_id']);
        if (!$driver) {
            return response()->json(['message' => 'Driver not found.'], 404);
        }

        if (!$driver->is_available) {
            $reasonText = $driver->availability_reason ? ": {$driver->availability_reason}" : '';
            return response()->json([
                'message' => "Cannot dispatch order to {$driver->name}. Rider is currently flagged unavailable{$reasonText}.",
            ], 422);
        }

        $order = Order::findOrFail($id);
        $order->driver_id = $validated['driver_id'];
        $order->status = 'Out for Delivery';
        $order->save();

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
            ->select('id', 'name', 'email', 'phone', 'is_available', 'driver_status', 'avatar', 'availability_reason', 'availability_proof_image', 'availability_updated_at')
            ->get()
            ->map(function ($driver) {
                $driver->active_deliveries_count = Order::where('driver_id', $driver->id)
                    ->where('status', 'Out for Delivery')
                    ->count();
                $driver->active_orders = Order::with('items')
                    ->where('driver_id', $driver->id)
                    ->where('status', 'Out for Delivery')
                    ->latest()
                    ->get();
                $driver->completed_today_count = Order::where('driver_id', $driver->id)
                    ->where('order_type', 'Delivery')
                    ->where('status', 'Completed')
                    ->whereDate('created_at', today())
                    ->count();
                $driver->total_completed_count = Order::where('driver_id', $driver->id)
                    ->where('order_type', 'Delivery')
                    ->where('status', 'Completed')
                    ->count();
                $driver->pending_notice = \App\Models\RiderNotice::where('driver_id', $driver->id)
                    ->where('is_acknowledged', false)
                    ->latest()
                    ->first();
                $driver->unremitted_cash = round((float) Order::where('driver_id', $driver->id)
                    ->where('order_type', 'Delivery')
                    ->where('status', 'Completed')
                    ->whereIn('payment_method', ['Cash', 'Cash on Delivery', 'COD'])
                    ->whereNull('remitted_at')
                    ->sum('total_amount'), 2);
                $driver->pending_remittance = \App\Models\RiderRemittance::where('driver_id', $driver->id)
                    ->where('status', 'pending')
                    ->latest()
                    ->first();
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

    public function submitRiderNotice(Request $request)
    {
        $request->validate([
            'reason' => 'required|string|min:2|max:1000',
            'is_available' => 'nullable',
            'driver_id' => 'nullable|integer',
        ]);

        $driver = $request->user();
        if ($request->filled('driver_id')) {
            $found = User::find($request->input('driver_id'));
            if ($found) $driver = $found;
        }
        if (!$driver) {
            $driver = User::where('role', 'driver')->first();
        }
        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $isAvailable = $request->has('is_available') ? filter_var($request->input('is_available'), FILTER_VALIDATE_BOOLEAN) : false;
        $reason = trim((string) $request->input('reason'));
        $proofImageUrl = null;

        if ($request->hasFile('proof_image') || $request->hasFile('proof_file')) {
            $fileObj = $request->file('proof_image') ?? $request->file('proof_file');
            $uploadDir = public_path('uploads/rider_notices');
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $ext = $fileObj->getClientOriginalExtension() ?: 'jpg';
            $filename = 'proof_' . $driver->id . '_' . time() . '.' . $ext;
            $fileObj->move($uploadDir, $filename);
            $proofImageUrl = '/uploads/rider_notices/' . $filename;
        } elseif ($request->filled('proof_image')) {
            $rawImage = $request->input('proof_image');
            if (preg_match('/^data:image\/(\w+);base64,/', $rawImage, $type)) {
                $imageData = substr($rawImage, strpos($rawImage, ',') + 1);
                $type = strtolower($type[1]);
                $imageData = base64_decode($imageData);
                if ($imageData !== false) {
                    $uploadDir = public_path('uploads/rider_notices');
                    if (!file_exists($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }
                    $filename = 'proof_' . $driver->id . '_' . time() . '.' . ($type === 'jpeg' ? 'jpg' : $type);
                    file_put_contents($uploadDir . '/' . $filename, $imageData);
                    $proofImageUrl = '/uploads/rider_notices/' . $filename;
                }
            } elseif (filter_var($rawImage, FILTER_VALIDATE_URL) || str_starts_with($rawImage, '/')) {
                $proofImageUrl = $rawImage;
            }
        }

        if ($isAvailable) {
            // Rider returning online / available
            $driver->is_available = true;
            $driver->driver_status = 'available';
            $driver->availability_reason = null;
            $driver->availability_proof_image = null;
            $driver->availability_updated_at = now();
            $driver->save();

            RiderNotice::where('driver_id', $driver->id)
                ->where('is_acknowledged', false)
                ->update([
                    'is_acknowledged' => true,
                    'status' => 'resolved_online',
                    'acknowledged_at' => now(),
                ]);

            $notice = RiderNotice::create([
                'driver_id' => $driver->id,
                'driver_name' => $driver->name,
                'driver_phone' => $driver->phone,
                'status' => 'available',
                'reason' => $reason ?: 'Rider returned to duty / Available for orders',
                'proof_image' => null,
                'is_acknowledged' => true,
                'acknowledged_at' => now(),
            ]);

            AuditLog::create([
                'user_id' => $driver->id,
                'user_name' => $driver->name,
                'user_role' => 'driver',
                'action' => 'Rider Back Online',
                'details' => "Rider {$driver->name} returned to duty and is now available for orders.",
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Welcome back! You are now Available for orders.',
                'notice' => $notice,
                'driver' => $driver,
            ], 200);
        }

        // Rider requesting to flag account unavailable:
        // Notice is recorded as pending acceptance by staff, admin or super admin!
        $notice = RiderNotice::create([
            'driver_id' => $driver->id,
            'driver_name' => $driver->name,
            'driver_phone' => $driver->phone,
            'status' => 'pending_unavailable',
            'reason' => $reason,
            'proof_image' => $proofImageUrl,
            'is_acknowledged' => false,
        ]);

        $driver->availability_reason = $reason;
        $driver->availability_proof_image = $proofImageUrl;
        $driver->availability_updated_at = now();
        $driver->save();

        AuditLog::create([
            'user_id' => $driver->id,
            'user_name' => $driver->name,
            'user_role' => 'driver',
            'action' => 'Rider Unavailable Notice Submitted',
            'details' => "Rider {$driver->name} submitted notice requesting unavailability: '{$reason}'" . ($proofImageUrl ? ' [Proof Photo Attached]' : '') . ". Awaiting staff acceptance.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Notice submitted successfully. Waiting for staff, admin, or super admin to click Accept Notice.',
            'notice' => $notice,
            'driver' => $driver,
            'pending' => true,
        ], 201);
    }

    public function getRiderNotices(Request $request)
    {
        $query = RiderNotice::query()->orderBy('created_at', 'desc');

        if ($request->query('unread_only') || $request->query('pending_only')) {
            $query->where('is_acknowledged', false);
        }

        $limit = min((int)$request->query('limit', 50), 100);
        $notices = $query->take($limit)->get();
        $unreadCount = RiderNotice::where('is_acknowledged', false)->count();

        return response()->json([
            'notices' => $notices,
            'unread_count' => $unreadCount,
        ]);
    }

    public function acknowledgeRiderNotice(Request $request, $id)
    {
        $notice = RiderNotice::findOrFail($id);
        $user = $request->user();

        $notice->is_acknowledged = true;
        $notice->status = 'unavailable';
        $notice->acknowledged_by = $user?->id;
        $notice->acknowledged_at = now();
        $notice->save();

        // Flag the rider's account unavailable so workers will not dispatch orders to him
        $driver = User::find($notice->driver_id);
        if ($driver) {
            $driver->is_available = false;
            $driver->driver_status = 'offline';
            $driver->availability_reason = $notice->reason;
            $driver->availability_proof_image = $notice->proof_image;
            $driver->availability_updated_at = now();
            $driver->save();
        }

        $operatorName = $user ? $user->name : 'Staff / Admin';
        $operatorRole = $user ? $user->role : 'staff';

        AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $operatorName,
            'user_role' => $operatorRole,
            'action' => 'Rider Notice Accepted',
            'details' => "{$operatorRole} {$operatorName} accepted notice for rider {$notice->driver_name}. Account is now flagged unavailable so workers will not dispatch orders to him. Reason: {$notice->reason}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Notice accepted. {$notice->driver_name}'s account has been flagged unavailable.",
            'notice' => $notice,
            'driver' => $driver,
        ]);
    }

    public function cancelRiderNotice(Request $request, $id)
    {
        $notice = RiderNotice::findOrFail($id);
        if (!$notice->is_acknowledged) {
            $driver = User::find($notice->driver_id);
            if ($driver && $driver->availability_reason === $notice->reason) {
                $driver->availability_reason = null;
                $driver->availability_proof_image = null;
                $driver->save();
            }
            $notice->delete();

            return response()->json([
                'message' => 'Pending notice cancelled successfully.',
                'driver' => $driver,
            ]);
        }

        return response()->json(['message' => 'Cannot cancel a notice that has already been accepted.'], 400);
    }

    public function getActiveRiderNotice(Request $request)
    {
        $user = $request->user();
        $driverId = $user ? $user->id : $request->query('driver_id');
        if (!$driverId) {
            $firstDriver = User::where('role', 'driver')->first();
            $driverId = $firstDriver?->id;
        }

        $pendingNotice = RiderNotice::where('driver_id', $driverId)
            ->where('is_acknowledged', false)
            ->latest()
            ->first();

        $latestNotice = RiderNotice::where('driver_id', $driverId)
            ->latest()
            ->first();

        $driver = User::find($driverId);

        return response()->json([
            'pending_notice' => $pendingNotice,
            'latest_notice' => $latestNotice,
            'is_available' => $driver ? (bool)$driver->is_available : true,
            'driver' => $driver,
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

