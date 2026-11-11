<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Order;
use App\Models\User;
use App\Models\RiderRemittance;
use App\Models\AuditLog;

class RemittanceController extends Controller
{
    private const CASH_METHODS = ['Cash', 'Cash on Delivery', 'COD'];

    public function index(Request $request)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        $isDriverUser = $user && $user->role === 'driver';

        $targetDriverId = null;
        if ($isDriverUser) {
            $targetDriverId = $user->id;
        } elseif ($request->filled('driver_id') && $request->input('driver_id') !== 'all') {
            $targetDriverId = (int) $request->input('driver_id');
        }

        $query = RiderRemittance::with([
            'driver:id,name,phone,avatar',
            'acceptedByUser:id,name,role',
            'rejectedByUser:id,name,role',
            'orders:id,order_number,customer_name,total_amount,delivered_at,created_at,remittance_id,remitted_at',
        ])->orderBy('created_at', 'desc');

        if ($targetDriverId) {
            $query->where('driver_id', $targetDriverId);
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }

        if ($request->filled('search')) {
            $s = trim((string) $request->input('search'));
            $query->where(function ($q) use ($s) {
                $q->where('reference_number', 'like', "%{$s}%")
                  ->orWhere('driver_name', 'like', "%{$s}%")
                  ->orWhere('accepted_by_name', 'like', "%{$s}%")
                  ->orWhere('rider_notes', 'like', "%{$s}%");
            });
        }

        $limit = min((int) $request->query('limit', 100), 200);
        $remittances = $query->take($limit)->get();

        $pendingCountQuery = RiderRemittance::where('status', 'pending');
        if ($targetDriverId) {
            $pendingCountQuery->where('driver_id', $targetDriverId);
        }
        $pendingCount = $pendingCountQuery->count();

        $response = [
            'remittances' => $remittances,
            'pending_count' => $pendingCount,
        ];

        if ($targetDriverId) {
            $unremittedOrders = Order::where('driver_id', $targetDriverId)
                ->where('order_type', 'Delivery')
                ->where('status', 'Completed')
                ->whereIn('payment_method', self::CASH_METHODS)
                ->whereNull('remitted_at')
                ->orderBy('delivered_at', 'desc')
                ->orderBy('created_at', 'desc')
                ->get(['id', 'order_number', 'customer_name', 'delivery_address', 'total_amount', 'payment_method', 'delivered_at', 'created_at', 'remittance_id', 'remitted_at']);

            $readyToRemitOrders = $unremittedOrders->whereNull('remittance_id')->values();
            $pendingRemittance = RiderRemittance::with('orders:id,order_number,customer_name,total_amount,delivered_at,created_at,remittance_id,remitted_at')
                ->where('driver_id', $targetDriverId)
                ->where('status', 'pending')
                ->latest()
                ->first();

            $response['unremitted_amount'] = round((float) $unremittedOrders->sum('total_amount'), 2);
            $response['unremitted_orders_count'] = $unremittedOrders->count();
            $response['ready_to_remit_amount'] = round((float) $readyToRemitOrders->sum('total_amount'), 2);
            $response['ready_to_remit_orders'] = $readyToRemitOrders;
            $response['pending_remittance'] = $pendingRemittance;
        } else {
            // Management summary across all riders
            $pendingAmount = (float) RiderRemittance::where('status', 'pending')->sum('amount');
            $acceptedTodayAmount = (float) RiderRemittance::where('status', 'accepted')
                ->whereDate('accepted_at', today())
                ->sum('amount');
            $totalAcceptedAmount = (float) RiderRemittance::where('status', 'accepted')->sum('amount');

            $ridersUnremitted = User::where('role', 'driver')
                ->where('status', 'active')
                ->select('id', 'name', 'phone', 'is_available')
                ->get()
                ->map(function ($driver) {
                    $unremitted = Order::where('driver_id', $driver->id)
                        ->where('order_type', 'Delivery')
                        ->where('status', 'Completed')
                        ->whereIn('payment_method', self::CASH_METHODS)
                        ->whereNull('remitted_at')
                        ->get(['id', 'total_amount', 'remittance_id']);

                    $driver->unremitted_amount = round((float) $unremitted->sum('total_amount'), 2);
                    $driver->unremitted_orders_count = $unremitted->count();
                    $driver->pending_remittance = RiderRemittance::where('driver_id', $driver->id)
                        ->where('status', 'pending')
                        ->latest()
                        ->first();
                    return $driver;
                });

            $response['summary'] = [
                'pending_count' => $pendingCount,
                'pending_amount' => round($pendingAmount, 2),
                'accepted_today_amount' => round($acceptedTodayAmount, 2),
                'total_accepted_amount' => round($totalAcceptedAmount, 2),
                'riders_unremitted' => $ridersUnremitted,
            ];
        }

        return response()->json($response);
    }

    public function store(Request $request)
    {
        $request->validate([
            'rider_notes' => 'nullable|string|max:500',
            'driver_id' => 'nullable|integer',
        ]);

        $user = auth('sanctum')->user() ?? $request->user();
        $driver = $user;

        if ($request->filled('driver_id') && (!$user || $user->role !== 'driver')) {
            $found = User::find($request->input('driver_id'));
            if ($found) {
                $driver = $found;
            }
        }
        if (!$driver || ($driver->role !== 'driver' && !$request->filled('driver_id'))) {
            $driver = User::where('role', 'driver')->first();
        }
        if (!$driver) {
            return response()->json(['message' => 'Delivery rider not found.'], 404);
        }

        $existingPending = RiderRemittance::where('driver_id', $driver->id)
            ->where('status', 'pending')
            ->first();

        if ($existingPending) {
            return response()->json([
                'message' => "You already have a pending remittance handover ({$existingPending->reference_number} • ₱" . number_format($existingPending->amount, 2) . ") awaiting staff or admin acceptance.",
                'pending_remittance' => $existingPending,
            ], 422);
        }

        return DB::transaction(function () use ($request, $driver) {
            $orders = Order::where('driver_id', $driver->id)
                ->where('order_type', 'Delivery')
                ->where('status', 'Completed')
                ->whereIn('payment_method', self::CASH_METHODS)
                ->whereNull('remitted_at')
                ->whereNull('remittance_id')
                ->lockForUpdate()
                ->get();

            if ($orders->isEmpty()) {
                return response()->json([
                    'message' => 'No unremitted COD cash orders found to hand over.',
                ], 422);
            }

            $amount = round((float) $orders->sum('total_amount'), 2);
            $orderIds = $orders->pluck('id')->values()->all();
            $orderNumbers = $orders->pluck('order_number')->values()->all();
            $refNumber = 'REM-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
            while (RiderRemittance::where('reference_number', $refNumber)->exists()) {
                $refNumber = 'REM-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
            }

            $remittance = RiderRemittance::create([
                'reference_number' => $refNumber,
                'driver_id' => $driver->id,
                'driver_name' => $driver->name,
                'driver_phone' => $driver->phone,
                'amount' => $amount,
                'orders_count' => $orders->count(),
                'order_ids' => $orderIds,
                'order_numbers' => $orderNumbers,
                'status' => 'pending',
                'rider_notes' => trim((string) $request->input('rider_notes')) ?: null,
            ]);

            // Link orders to this remittance, keeping remitted_at = NULL until staff/admin accepts!
            Order::whereIn('id', $orderIds)->update([
                'remittance_id' => $remittance->id,
            ]);

            AuditLog::create([
                'user_id' => $driver->id,
                'user_name' => $driver->name,
                'user_role' => 'driver',
                'action' => 'Rider Remittance Submitted',
                'details' => "Rider {$driver->name} handed over COD remittance {$refNumber} for ₱" . number_format($amount, 2) . " ({$orders->count()} orders: " . implode(', ', $orderNumbers) . "). Awaiting staff/admin acceptance.",
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => "Remittance handover {$refNumber} (₱" . number_format($amount, 2) . ") submitted! Waiting for staff or admin to accept before resetting balance to ₱0.00.",
                'remittance' => $remittance->load('orders:id,order_number,customer_name,total_amount,delivered_at,created_at,remittance_id,remitted_at'),
            ], 201);
        });
    }

    public function accept(Request $request, $id)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        if ($user && !in_array($user->role, ['staff', 'admin', 'super_admin'])) {
            return response()->json([
                'message' => 'Unauthorized. Only staff, admin, or super admin can accept rider remittances.',
            ], 403);
        }

        $request->validate([
            'staff_notes' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($request, $id, $user) {
            $remittance = RiderRemittance::lockForUpdate()->findOrFail($id);

            if ($remittance->status !== 'pending') {
                return response()->json([
                    'message' => "This remittance ({$remittance->reference_number}) has already been {$remittance->status}.",
                ], 422);
            }

            $now = now();
            $operatorName = $user ? $user->name : 'Staff / Admin';
            $operatorRole = $user ? $user->role : 'staff';

            $remittance->status = 'accepted';
            $remittance->accepted_by = $user?->id;
            $remittance->accepted_by_name = $operatorName;
            $remittance->accepted_by_role = $operatorRole;
            $remittance->accepted_at = $now;
            if ($request->filled('staff_notes')) {
                $remittance->staff_notes = trim((string) $request->input('staff_notes'));
            }
            $remittance->save();

            // Mark linked orders as officially remitted (now rider's unremitted balance resets!)
            $updatedCount = Order::where('remittance_id', $remittance->id)->update([
                'remitted_at' => $now,
                'payment_status' => 'Paid',
            ]);

            if ($updatedCount === 0 && !empty($remittance->order_ids)) {
                Order::whereIn('id', $remittance->order_ids)->update([
                    'remittance_id' => $remittance->id,
                    'remitted_at' => $now,
                    'payment_status' => 'Paid',
                ]);
            }

            $remainingUnremitted = 0;
            if ($remittance->driver_id) {
                $remainingUnremitted = round((float) Order::where('driver_id', $remittance->driver_id)
                    ->where('order_type', 'Delivery')
                    ->where('status', 'Completed')
                    ->whereIn('payment_method', self::CASH_METHODS)
                    ->whereNull('remitted_at')
                    ->sum('total_amount'), 2);
            }

            AuditLog::create([
                'user_id' => $user?->id,
                'user_name' => $operatorName,
                'user_role' => $operatorRole,
                'action' => 'Rider Remittance Accepted',
                'details' => "{$operatorRole} {$operatorName} accepted COD remittance {$remittance->reference_number} from rider {$remittance->driver_name} for ₱" . number_format($remittance->amount, 2) . " ({$remittance->orders_count} orders). Rider COD balance updated.",
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => "Remittance {$remittance->reference_number} (₱" . number_format($remittance->amount, 2) . ") accepted! {$remittance->driver_name}'s remittance balance has been cleared.",
                'remittance' => $remittance->load(['driver:id,name,phone,avatar', 'acceptedByUser:id,name,role', 'orders:id,order_number,customer_name,total_amount,delivered_at,created_at,remittance_id,remitted_at']),
                'driver_unremitted_amount' => $remainingUnremitted,
            ]);
        });
    }

    public function reject(Request $request, $id)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        if ($user && !in_array($user->role, ['staff', 'admin', 'super_admin'])) {
            return response()->json([
                'message' => 'Unauthorized. Only staff, admin, or super admin can reject rider remittances.',
            ], 403);
        }

        $request->validate([
            'staff_notes' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($request, $id, $user) {
            $remittance = RiderRemittance::lockForUpdate()->findOrFail($id);

            if ($remittance->status !== 'pending') {
                return response()->json([
                    'message' => "This remittance ({$remittance->reference_number}) has already been {$remittance->status}.",
                ], 422);
            }

            $operatorName = $user ? $user->name : 'Staff / Admin';
            $operatorRole = $user ? $user->role : 'staff';

            $remittance->status = 'rejected';
            $remittance->rejected_by = $user?->id;
            $remittance->rejected_by_name = $operatorName;
            $remittance->rejected_at = now();
            $remittance->staff_notes = trim((string) $request->input('staff_notes')) ?: 'Returned for cash verification';
            $remittance->save();

            // Unlink orders so rider retains the unremitted balance and can re-submit
            Order::where('remittance_id', $remittance->id)->update([
                'remittance_id' => null,
            ]);
            if (!empty($remittance->order_ids)) {
                Order::whereIn('id', $remittance->order_ids)
                    ->where('remittance_id', $remittance->id)
                    ->update(['remittance_id' => null]);
            }

            AuditLog::create([
                'user_id' => $user?->id,
                'user_name' => $operatorName,
                'user_role' => $operatorRole,
                'action' => 'Rider Remittance Rejected',
                'details' => "{$operatorRole} {$operatorName} rejected COD remittance {$remittance->reference_number} from rider {$remittance->driver_name} (₱" . number_format($remittance->amount, 2) . "). Note: {$remittance->staff_notes}",
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => "Remittance {$remittance->reference_number} marked as rejected. Cash remains in {$remittance->driver_name}'s balance.",
                'remittance' => $remittance->load(['driver:id,name,phone,avatar', 'rejectedByUser:id,name,role']),
            ]);
        });
    }

    public function cancel(Request $request, $id)
    {
        $user = auth('sanctum')->user() ?? $request->user();

        return DB::transaction(function () use ($request, $id, $user) {
            $remittance = RiderRemittance::lockForUpdate()->findOrFail($id);

            if ($remittance->status !== 'pending') {
                return response()->json([
                    'message' => "Cannot cancel a remittance that has already been {$remittance->status}.",
                ], 400);
            }

            if ($user && $user->role === 'driver' && $remittance->driver_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }

            $remittance->status = 'cancelled';
            $remittance->save();

            Order::where('remittance_id', $remittance->id)->update([
                'remittance_id' => null,
            ]);

            AuditLog::create([
                'user_id' => $user?->id ?? $remittance->driver_id,
                'user_name' => $user?->name ?? $remittance->driver_name,
                'user_role' => $user?->role ?? 'driver',
                'action' => 'Rider Remittance Cancelled',
                'details' => "Pending remittance handover {$remittance->reference_number} (₱" . number_format($remittance->amount, 2) . ") was cancelled before acceptance.",
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => "Pending remittance {$remittance->reference_number} cancelled.",
                'remittance' => $remittance,
            ]);
        });
    }
}
