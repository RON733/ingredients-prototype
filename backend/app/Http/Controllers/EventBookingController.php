<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EventBooking;
use App\Models\AuditLog;

class EventBookingController extends Controller
{
    public function index()
    {
        $bookings = EventBooking::latest()->get();
        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        // Maintenance Mode Check
        $maintenance = \App\Models\SystemSetting::where('key', 'maintenance_mode')->value('value');
        if ($maintenance === 'true' || $maintenance === '1') {
            $userRole = $request->user()?->role;
            if (!$userRole || !in_array($userRole, ['staff', 'admin', 'super_admin'])) {
                return response()->json([
                    'message' => 'The website is currently undergoing scheduled maintenance. Event booking requests are temporarily paused.'
                ], 503);
            }
        }

        $validated = $request->validate([
            'client_name' => 'required|string|max:80',
            'client_phone' => 'required|string|max:20',
            'client_email' => 'nullable|email|max:120',
            'event_type' => 'required|string|max:120',
            'event_date' => 'required|date|after_or_equal:today',
            'event_time' => 'nullable|string|max:60',
            'guest_count' => 'required|integer|min:10|max:500',
            'location' => 'required|string|max:200',
            'package_name' => 'nullable|string|max:120',
            'estimated_cost' => 'nullable|numeric|min:0|max:100000',
            'notes' => 'nullable|string|max:500',
        ]);

        // Normalize and validate 11-digit contact number
        $cleanPhone = preg_replace('/\D/', '', $validated['client_phone']);
        if (str_starts_with($cleanPhone, '63') && strlen($cleanPhone) === 12) {
            $cleanPhone = '0' . substr($cleanPhone, 2);
        }
        if (strlen($cleanPhone) !== 11 || !str_starts_with($cleanPhone, '09')) {
            return response()->json([
                'message' => 'Please provide a valid 11-digit mobile number starting with 09 (e.g. 09123456789).'
            ], 422);
        }
        $validated['client_phone'] = $cleanPhone;

        $isFixedPackage = str_contains($validated['event_type'], 'Coffee') || str_contains($validated['event_type'], 'Fruity Float');
        $serverEstimatedCost = $isFixedPackage
            ? max(1, (int) ceil($validated['guest_count'] / 50)) * 3500
            : $validated['guest_count'] * 95;

        $booking = EventBooking::create([
            'user_id' => $request->user()?->id ?? null,
            'client_name' => trim($validated['client_name']),
            'client_phone' => $validated['client_phone'],
            'client_email' => $validated['client_email'] ?? null,
            'event_type' => $validated['event_type'],
            'event_date' => $validated['event_date'],
            'event_time' => $validated['event_time'] ?? 'TBD',
            'guest_count' => $validated['guest_count'],
            'location' => trim($validated['location']),
            'package_name' => $validated['package_name'] ?? 'Standard Catering Package',
            'estimated_cost' => $serverEstimatedCost,
            'status' => 'Pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        $bookingRole = $request->user()?->role;
        if ($bookingRole && in_array($bookingRole, ['staff', 'admin', 'super_admin'])) {
            AuditLog::create([
                'user_id' => $request->user()?->id,
                'user_name' => $request->user()?->name ?? $validated['client_name'],
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

    public function updateStatus(Request $request, $id)
    {
        $booking = EventBooking::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:Pending,Approved,Declined,Completed',
        ]);

        $oldStatus = $booking->status;
        $booking->status = $validated['status'];
        $booking->save();

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Staff',
            'user_role' => $request->user()?->role ?? 'staff',
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
