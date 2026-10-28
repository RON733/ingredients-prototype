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
        $validated = $request->validate([
            'client_name' => 'required|string',
            'client_phone' => 'required|string',
            'client_email' => 'nullable|email',
            'event_type' => 'required|string',
            'event_date' => 'required|date',
            'event_time' => 'nullable|string',
            'guest_count' => 'required|integer|min:10',
            'location' => 'required|string',
            'package_name' => 'nullable|string',
            'estimated_cost' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $booking = EventBooking::create([
            'user_id' => $request->user()?->id ?? null,
            'client_name' => $validated['client_name'],
            'client_phone' => $validated['client_phone'],
            'client_email' => $validated['client_email'] ?? null,
            'event_type' => $validated['event_type'],
            'event_date' => $validated['event_date'],
            'event_time' => $validated['event_time'] ?? 'TBD',
            'guest_count' => $validated['guest_count'],
            'location' => $validated['location'],
            'package_name' => $validated['package_name'] ?? 'Standard Catering Package',
            'estimated_cost' => $validated['estimated_cost'] ?? ($validated['guest_count'] * 95),
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
