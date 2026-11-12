<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EventBooking;
use App\Models\BookingPackage;
use App\Models\AuditLog;
use App\Models\User;

class EventBookingController extends Controller
{
    private function normalizePhone(?string $raw): string
    {
        $digits = preg_replace('/\D/', '', (string) $raw);
        if (str_starts_with($digits, '63') && strlen($digits) === 12) {
            $digits = '0' . substr($digits, 2);
        }
        return $digits;
    }

    private function authorizeOperator(Request $request)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        if ($user && !in_array($user->role, ['staff', 'admin', 'super_admin'])) {
            return [null, response()->json([
                'message' => 'Access Denied: Only Staff or Admin can manage bookings.',
            ], 403)];
        }
        return [$user, null];
    }

    public function index()
    {
        $bookings = EventBooking::latest()->get();
        return response()->json($bookings);
    }

    public function myBookings(Request $request)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        if (!$user && $request->filled('user_id')) {
            $user = User::find($request->input('user_id'));
        }

        $rawIds = $request->input('ids', '');
        $localIds = collect(is_array($rawIds) ? $rawIds : explode(',', (string) $rawIds))
            ->map(fn ($id) => (int) trim((string) $id))
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
            ->all();

        $search = trim((string) $request->input('search', ''));
        $searchPhone = $search !== '' ? $this->normalizePhone($search) : '';
        $searchNumericId = ($search !== '' && preg_match('/^#?(\d+)$/', $search, $m)) ? (int) $m[1] : null;

        if ($user) {
            $userPhone = $this->normalizePhone($user->phone);
            $userEmail = trim((string) ($user->email ?? ''));

            $query = EventBooking::query()->where(function ($q) use ($user, $userPhone, $userEmail, $localIds) {
                $q->where('user_id', $user->id);

                if ($userEmail !== '' || $userPhone !== '') {
                    $q->orWhere(function ($sub) use ($userEmail, $userPhone) {
                        $sub->whereNull('user_id')->where(function ($match) use ($userEmail, $userPhone) {
                            if ($userEmail !== '') {
                                $match->whereRaw('LOWER(client_email) = ?', [strtolower($userEmail)]);
                            }
                            if ($userPhone !== '') {
                                if ($userEmail !== '') {
                                    $match->orWhere('client_phone', $userPhone);
                                } else {
                                    $match->where('client_phone', $userPhone);
                                }
                            }
                        });
                    });
                }

                if (!empty($localIds)) {
                    $q->orWhereIn('id', $localIds);
                }
            });

            return response()->json($query->latest()->get());
        }

        if (empty($localIds) && $search === '') {
            return response()->json([]);
        }

        $query = EventBooking::query()->where(function ($q) use ($localIds, $searchPhone, $searchNumericId) {
            $hasCondition = false;

            if (!empty($localIds)) {
                $q->whereIn('id', $localIds);
                $hasCondition = true;
            }

            if (strlen($searchPhone) === 11 && str_starts_with($searchPhone, '09')) {
                $hasCondition ? $q->orWhere('client_phone', $searchPhone) : $q->where('client_phone', $searchPhone);
                $hasCondition = true;
            }

            if ($searchNumericId !== null && $searchNumericId > 0) {
                $hasCondition ? $q->orWhere('id', $searchNumericId) : $q->where('id', $searchNumericId);
                $hasCondition = true;
            }

            if (!$hasCondition) {
                $q->whereRaw('1 = 0');
            }
        });

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        // Maintenance Mode Check
        $maintenance = \App\Models\SystemSetting::where('key', 'maintenance_mode')->value('value');
        if ($maintenance === 'true' || $maintenance === '1') {
            $actingForMaintenance = auth('sanctum')->user() ?? $request->user();
            $userRole = $actingForMaintenance?->role;
            if (!$userRole || !in_array($userRole, ['staff', 'admin', 'super_admin'])) {
                return response()->json([
                    'message' => 'The website is currently undergoing scheduled maintenance. Event booking requests are temporarily paused.'
                ], 503);
            }
        }

        $actingUser = auth('sanctum')->user() ?? $request->user();
        if (!$actingUser && $request->filled('user_id')) {
            $actingUser = User::find($request->input('user_id'));
        }

        $validated = $request->validate([
            'client_name' => 'required|string|max:80',
            'client_phone' => 'required|string|max:20',
            'client_email' => 'nullable|email|max:120',
            'event_type' => 'required|string|max:180',
            'event_date' => 'required|date|after_or_equal:today',
            'event_time' => 'nullable|string|max:60',
            'guest_count' => 'required|integer|min:10|max:500',
            'location' => 'required|string|max:200',
            'package_name' => 'nullable|string|max:180',
            'booking_package_id' => 'nullable|integer',
            'estimated_cost' => 'nullable|numeric|min:0|max:500000',
            'notes' => 'nullable|string|max:500',
        ]);

        // Normalize and validate 11-digit contact number
        $cleanPhone = $this->normalizePhone($validated['client_phone']);
        if (strlen($cleanPhone) !== 11 || !str_starts_with($cleanPhone, '09')) {
            return response()->json([
                'message' => 'Please provide a valid 11-digit mobile number starting with 09 (e.g. 09123456789).'
            ], 422);
        }
        $validated['client_phone'] = $cleanPhone;

        BookingPackage::seedDefaultsIfEmpty();
        $matchedPackage = BookingPackage::findMatchingPackage(
            isset($validated['booking_package_id']) ? (int) $validated['booking_package_id'] : null,
            $validated['event_type'],
            $validated['package_name'] ?? null
        );

        if ($matchedPackage) {
            $serverEstimatedCost = $matchedPackage->computeEstimatedCost((int) $validated['guest_count']);
        } else {
            $isFixedPackage = str_contains($validated['event_type'], 'Coffee') || str_contains($validated['event_type'], 'Fruity Float');
            $serverEstimatedCost = $isFixedPackage
                ? max(1, (int) ceil($validated['guest_count'] / 50)) * 3500
                : $validated['guest_count'] * 95;
        }

        $booking = EventBooking::create([
            'user_id' => $actingUser?->id ?? null,
            'client_name' => trim($validated['client_name']),
            'client_phone' => $validated['client_phone'],
            'client_email' => $validated['client_email'] ?? $actingUser?->email ?? null,
            'event_type' => $validated['event_type'],
            'event_date' => $validated['event_date'],
            'event_time' => $validated['event_time'] ?? 'TBD',
            'guest_count' => $validated['guest_count'],
            'location' => trim($validated['location']),
            'package_name' => $validated['package_name'] ?? $matchedPackage?->name ?? 'Standard Catering Package',
            'estimated_cost' => $serverEstimatedCost,
            'status' => 'Pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        $bookingRole = $actingUser?->role;
        if ($bookingRole && in_array($bookingRole, ['staff', 'admin', 'super_admin'])) {
            AuditLog::create([
                'user_id' => $actingUser?->id,
                'user_name' => $actingUser?->name ?? $validated['client_name'],
                'user_role' => $bookingRole,
                'action' => 'Event Booking Logged',
                'details' => "Booking for {$validated['event_type']} on {$validated['event_date']} ({$validated['guest_count']} guests)",
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'message' => 'Event booking submitted successfully! Our staff will contact you to confirm details.',
            'booking' => $booking,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        [$operator, $denied] = $this->authorizeOperator($request);
        if ($denied) {
            return $denied;
        }

        $booking = EventBooking::findOrFail($id);

        $validated = $request->validate([
            'client_name' => 'sometimes|required|string|max:80',
            'client_phone' => 'sometimes|required|string|max:20',
            'client_email' => 'nullable|email|max:120',
            'event_type' => 'sometimes|required|string|max:180',
            'package_name' => 'nullable|string|max:180',
            'booking_package_id' => 'nullable|integer',
            'event_date' => 'sometimes|required|date',
            'event_time' => 'nullable|string|max:60',
            'guest_count' => 'sometimes|required|integer|min:10|max:500',
            'location' => 'sometimes|required|string|max:200',
            'estimated_cost' => 'sometimes|required|numeric|min:0|max:500000',
            'status' => 'sometimes|required|in:Pending,Approved,Declined,Completed',
            'notes' => 'nullable|string|max:500',
        ]);

        if (array_key_exists('client_phone', $validated)) {
            $cleanPhone = $this->normalizePhone($validated['client_phone']);
            if (strlen($cleanPhone) !== 11 || !str_starts_with($cleanPhone, '09')) {
                return response()->json([
                    'message' => 'Please provide a valid 11-digit mobile number starting with 09 (e.g. 09123456789).'
                ], 422);
            }
            $validated['client_phone'] = $cleanPhone;
        }

        if (array_key_exists('client_name', $validated)) {
            $validated['client_name'] = trim($validated['client_name']);
        }
        if (array_key_exists('location', $validated)) {
            $validated['location'] = trim($validated['location']);
        }

        $oldStatus = $booking->status;
        if (array_key_exists('status', $validated) && $validated['status'] !== $oldStatus) {
            if ($validated['status'] !== 'Pending') {
                $booking->reviewed_by_name = $operator?->name ?? 'Store Staff';
                $booking->reviewed_by_role = $operator?->role ?? 'staff';
                $booking->reviewed_at = now();
            } else {
                $booking->reviewed_by_name = null;
                $booking->reviewed_by_role = null;
                $booking->reviewed_at = null;
            }
        }

        unset($validated['booking_package_id']);
        $booking->fill($validated);
        $booking->save();

        AuditLog::create([
            'user_id' => $operator?->id,
            'user_name' => $operator?->name ?? 'Staff',
            'user_role' => $operator?->role ?? 'staff',
            'action' => 'Event Booking Updated',
            'details' => "Edited booking #{$booking->id} for {$booking->client_name} ({$booking->event_type}, ₱" . number_format((float) $booking->estimated_cost, 2) . ", {$booking->guest_count} pax)",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Booking #{$booking->id} updated successfully.",
            'booking' => $booking->fresh(),
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        [$reviewer, $denied] = $this->authorizeOperator($request);
        if ($denied) {
            return $denied;
        }

        $booking = EventBooking::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:Pending,Approved,Declined,Completed',
        ]);

        $oldStatus = $booking->status;
        $booking->status = $validated['status'];

        if ($validated['status'] !== 'Pending') {
            $booking->reviewed_by_name = $reviewer?->name ?? 'Store Staff';
            $booking->reviewed_by_role = $reviewer?->role ?? 'staff';
            $booking->reviewed_at = now();
        } else {
            $booking->reviewed_by_name = null;
            $booking->reviewed_by_role = null;
            $booking->reviewed_at = null;
        }

        $booking->save();

        AuditLog::create([
            'user_id' => $reviewer?->id,
            'user_name' => $reviewer?->name ?? 'Staff',
            'user_role' => $reviewer?->role ?? 'staff',
            'action' => 'Event Booking Status Updated',
            'details' => "Booking #{$booking->id} for {$booking->client_name} moved from {$oldStatus} to {$booking->status}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Booking status updated to {$booking->status}",
            'booking' => $booking,
        ]);
    }
}