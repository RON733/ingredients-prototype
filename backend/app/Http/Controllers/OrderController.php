<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Ingredient;
use App\Models\AuditLog;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('items')->latest();

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
        $order = Order::with('items')->where('id', $id)
            ->orWhere('order_number', $id)
            ->orWhere('order_number', '#' . $id)
            ->firstOrFail();

        return response()->json($order);
    }

    public function activeOrder(Request $request)
    {
        $userId = $request->user()?->id ?? $request->query('user_id');

        $query = Order::with('items')
            ->whereIn('status', ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'])
            ->latest();

        if ($userId) {
            $query->where('user_id', $userId);
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
            'payment_method' => 'required|in:Cash,GCash',
            'gcash_ref' => 'nullable|string',
            'proof_image' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.customization' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // 1. Gather all required ingredients across items
            $ingredientDeductions = [];
            $products = [];

            foreach ($validated['items'] as $item) {
                $product = Product::with('recipes.ingredient')->findOrFail($item['product_id']);
                $products[$product->id] = $product;
                $qty = (int)$item['quantity'];

                foreach ($product->recipes as $recipe) {
                    $ingId = $recipe->ingredient_id;
                    $needed = $recipe->qty * $qty;
                    $ingredientDeductions[$ingId] = ($ingredientDeductions[$ingId] ?? 0) + $needed;
                }
            }

            // 2. Verify stock sufficiency
            $depletedAlerts = [];
            foreach ($ingredientDeductions as $ingId => $totalNeeded) {
                $ingredient = Ingredient::lockForUpdate()->find($ingId);
                if (!$ingredient || $ingredient->stock < $totalNeeded) {
                    $available = $ingredient ? $ingredient->stock : 0;
                    $unit = $ingredient ? $ingredient->unit : 'units';
                    $name = $ingredient ? $ingredient->name : $ingId;
                    $depletedAlerts[] = "{$name} (Needed: {$totalNeeded} {$unit}, Available: {$available} {$unit})";
                }
            }

            if (!empty($depletedAlerts)) {
                return response()->json([
                    'message' => 'Cannot place order: Some ingredients have insufficient kitchen stock.',
                    'insufficient_ingredients' => $depletedAlerts,
                ], 422);
            }

            // 3. Deduct ingredients
            foreach ($ingredientDeductions as $ingId => $totalNeeded) {
                $ingredient = Ingredient::find($ingId);
                $ingredient->stock = max(0, $ingredient->stock - $totalNeeded);
                $ingredient->save();
            }

            // 4. Calculate pricing
            $subtotal = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = $products[$item['product_id']];
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

            // Generate order number
            $lastOrder = Order::latest('id')->first();
            $nextNum = $lastOrder ? ($lastOrder->id + 1) : 31;
            $orderNumber = '#' . $nextNum;

            // 5. Create Order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $request->user()?->id ?? null,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'order_type' => $validated['order_type'],
                'delivery_address' => $validated['delivery_address'] ?? 'Store Pickup',
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === 'GCash' ? 'Pending' : 'Pending',
                'gcash_ref' => $validated['gcash_ref'] ?? null,
                'proof_image' => $validated['proof_image'] ?? null,
                'status' => 'Pending',
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($itemsData as $it) {
                $order->items()->create($it);
            }

            AuditLog::create([
                'user_name' => $validated['customer_name'],
                'user_role' => $request->user()?->role ?? 'customer',
                'action' => 'Order Placed',
                'details' => "Order {$orderNumber} placed for ₱{$totalAmount} ({$validated['order_type']}, {$validated['payment_method']}). Raw ingredients depleted automatically.",
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Order placed successfully!',
                'order' => $order->load('items'),
            ], 201);
        });
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::with('items')->findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:Pending,Preparing,Ready for Pickup,Out for Delivery,Completed,Cancelled',
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        // Customer constraint from capstone document:
        // "Customers may cancel an order only if it has not yet been approved or started by the staff. A system constraint prevents cancellation once the order is in the preparation stage."
        $user = $request->user();
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

        AuditLog::create([
            'user_name' => $user?->name ?? 'Staff',
            'user_role' => $user?->role ?? 'staff',
            'action' => 'Order Status Changed',
            'details' => "Order {$order->order_number} transitioned from {$oldStatus} to {$newStatus}",
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
}
