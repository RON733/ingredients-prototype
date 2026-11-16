<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\EventBooking;
use App\Models\BookingPackage;
use App\Models\AuditLog;
use App\Models\User;
use App\Support\BookingTimeSlot;

class EventBookingController extends Controller
{
    private const ACTIVE_STATUSES = ['Pending', 'Approved'];
    private const ALLOWED_STATUSES = ['Pending', 'Approved', 'Declined', 'Completed', 'Cancelled'];

    private function normalizePhone(?string $raw): string
    {
        $digits = preg_replace('/\D/', '', (string) $raw);
        if (str_starts_with($digits, '63') && strlen($digits) === 12) {
            $digits = '0' . substr($digits, 2);
        }
        return $digits;
    }

    private function normalizeDateString($value): string
    {
        if ($value instanceof \Carbon\CarbonInterface) {
            return $value->toDateString();
        }
        $raw = trim((string) $value);
        if (preg_match('/^\d{4}-\d{2}-\d{2}/', $raw, $m)) {
            return $m[0];
        }
        return \Carbon\Carbon::parse($raw)->toDateString();
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

    private function buildConflictPayload(string $targetDate, array $parsedTimeSlot, string $conflictingLabel, string $status): array
    {
        return [
            'message' => "This date already has an occupied booking at {$conflictingLabel}. Your selected time ({$parsedTimeSlot['range_label']}) conflicts with it, so this slot cannot be booked.",
            'conflict' => [
                'event_date' => $targetDate,
                'conflicting_time' => $conflictingLabel,
                'status' => $status,
            ],
            'errors' => [
                'event_time' => ["Selected time ({$parsedTimeSlot['range_label']}) conflicts with an existing booking ({$conflictingLabel}) on this date."],
            ],
        ];
    }

    private function buildPastTimePayload(string $targetDate, ?array $parsedTimeSlot, array $pastCheck): array
    {
        if ($pastCheck['reason'] === 'past_date') {
            return [
                'message' => "The selected date ({$targetDate}) has already passed. Today is {$pastCheck['now_date']}.",
                'reason' => 'past_date',
                'server_date' => $pastCheck['now_date'],
                'server_time_label' => $pastCheck['now_label'],
                'errors' => [
                    'event_date' => ["Target date must be today ({$pastCheck['now_date']}) or later."],
                ],
            ];
        }

        $rangeLabel = $parsedTimeSlot['range_label'] ?? 'Selected time';
        return [
            'message' => "You can't book {$rangeLabel} for today anymore because it is already {$pastCheck['now_label']}. Please choose a later time or another date.",
            'reason' => 'past_time',
            'server_date' => $pastCheck['now_date'],
            'server_time_label' => $pastCheck['now_label'],
            'errors' => [
                'event_time' => ["{$rangeLabel} has already passed today (current time: {$pastCheck['now_label']}). Please choose a later time."],
            ],
        ];
    }

    private function findConflictingBooking(string $targetDate, array $parsedTimeSlot, ?int $excludeBookingId = null, bool $lock = true): ?array
    {
        $sameDayQuery = EventBooking::whereDate('event_date', $targetDate)
            ->whereIn('status', self::ACTIVE_STATUSES);
        if ($excludeBookingId !== null) {
            $sameDayQuery->where('id', '!=', $excludeBookingId);
        }
        if ($lock) {
            $sameDayQuery->lockForUpdate();
        }

        foreach ($sameDayQuery->get(['id', 'event_time', 'status']) as $existing) {
            $existingSlot = BookingTimeSlot::parse($existing->event_time);
            if ($existingSlot === null) {
                $label = $existing->event_time ?: 'TBD (Whole Day Hold)';
                return $this->buildConflictPayload($targetDate, $parsedTimeSlot, $label, $existing->status);
            }
            if (BookingTimeSlot::overlaps($parsedTimeSlot, $existingSlot)) {
                return $this->buildConflictPayload($targetDate, $parsedTimeSlot, $existingSlot['range_label'], $existing->status);
            }
        }

        // Check overnight spillover from previous day (end_minutes > 1440)
        $prevDate = \Carbon\Carbon::parse($targetDate)->subDay()->toDateString();
        $prevDayQuery = EventBooking::whereDate('event_date', $prevDate)
            ->whereIn('status', self::ACTIVE_STATUSES);
        if ($excludeBookingId !== null) {
            $prevDayQuery->where('id', '!=', $excludeBookingId);
        }
        if ($lock) {
            $prevDayQuery->lockForUpdate();
        }

        foreach ($prevDayQuery->get(['id', 'event_time', 'status']) as $prevExisting) {
            $prevSlot = BookingTimeSlot::parse($prevExisting->event_time);
            if ($prevSlot && $prevSlot['end_minutes'] > 1440) {
                $spillSlot = BookingTimeSlot::shiftSlot($prevSlot, -1440);
                if (BookingTimeSlot::overlaps($parsedTimeSlot, $spillSlot)) {
                    return $this->buildConflictPayload(
                        $targetDate,
                        $parsedTimeSlot,
                        "{$prevSlot['range_label']} (overnight from {$prevDate})",
                        $prevExisting->status
                    );
                }
            }
        }

        // Check overnight spillover into next day when candidate extends past midnight
        if ($parsedTimeSlot['end_minutes'] > 1440) {
            $nextDate = \Carbon\Carbon::parse($targetDate)->addDay()->toDateString();
            $nextDayCandidate = BookingTimeSlot::shiftSlot($parsedTimeSlot, -1440);
            $nextDayQuery = EventBooking::whereDate('event_date', $nextDate)
                ->whereIn('status', self::ACTIVE_STATUSES);
            if ($excludeBookingId !== null) {
                $nextDayQuery->where('id', '!=', $excludeBookingId);
            }
            if ($lock) {
                $nextDayQuery->lockForUpdate();
            }

            foreach ($nextDayQuery->get(['id', 'event_time', 'status']) as $nextExisting) {
                $nextSlot = BookingTimeSlot::parse($nextExisting->event_time);
                if ($nextSlot === null) {
                    $label = ($nextExisting->event_time ?: 'TBD') . " (next day {$nextDate})";
                    return $this->buildConflictPayload($targetDate, $parsedTimeSlot, $label, $nextExisting->status);
                }
                if (BookingTimeSlot::overlaps($nextDayCandidate, $nextSlot)) {
                    return $this->buildConflictPayload(
                        $targetDate,
                        $parsedTimeSlot,
                        "{$nextSlot['range_label']} (next day {$nextDate})",
                        $nextExisting->status
                    );
                }
            }
        }

        return null;
    }

    public function index()
    {
        $bookings = EventBooking::latest()->get();
        return response()->json($bookings);
    }

    public function availability(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
        ]);

        $manilaNow = BookingTimeSlot::storeNow();
        $today = $manilaNow->toDateString();
        $nowMinutes = ((int) $manilaNow->hour * 60) + (int) $manilaNow->minute;

        $targetDate = $request->filled('date')
            ? \Carbon\Carbon::parse($request->input('date'))->toDateString()
            : null;

        $occupiedSlots = [];
        if ($targetDate !== null) {
            $dayBookings = EventBooking::whereDate('event_date', $targetDate)
                ->whereIn('status', self::ACTIVE_STATUSES)
                ->orderBy('id')
                ->get(['event_time', 'status']);

            foreach ($dayBookings as $booking) {
                $parsed = BookingTimeSlot::parse($booking->event_time);
                $occupiedSlots[] = [
                    'event_time' => $parsed ? $parsed['label'] : ($booking->event_time ?: 'TBD'),
                    'range_label' => $parsed ? $parsed['range_label'] : ($booking->event_time ?: 'TBD'),
                    'start_minutes' => $parsed['start_minutes'] ?? null,
                    'end_minutes' => $parsed['end_minutes'] ?? null,
                    'blocks_whole_day' => $parsed === null,
                    'status' => $booking->status,
                ];
            }

            // Include overnight spillover slots from the previous day
            $prevDate = \Carbon\Carbon::parse($targetDate)->subDay()->toDateString();
            $prevDayBookings = EventBooking::whereDate('event_date', $prevDate)
                ->whereIn('status', self::ACTIVE_STATUSES)
                ->orderBy('id')
                ->get(['event_time', 'status']);

            foreach ($prevDayBookings as $prevBooking) {
                $prevParsed = BookingTimeSlot::parse($prevBooking->event_time);
                if ($prevParsed && $prevParsed['end_minutes'] > 1440) {
                    $spillEnd = $prevParsed['end_minutes'] - 1440;
                    $occupiedSlots[] = [
                        'event_time' => $prevParsed['label'],
                        'range_label' => '12:00 AM – ' . BookingTimeSlot::formatTime($spillEnd) . " (from {$prevDate} overnight)",
                        'start_minutes' => 0,
                        'end_minutes' => $spillEnd,
                        'blocks_whole_day' => false,
                        'status' => $prevBooking->status,
                    ];
                }
            }
        }

        $upcoming = EventBooking::whereDate('event_date', '>=', $today)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->get(['event_date']);

        $occupiedDates = [];
        foreach ($upcoming as $row) {
            $dateKey = $this->normalizeDateString($row->event_date);
            $occupiedDates[$dateKey] = ($occupiedDates[$dateKey] ?? 0) + 1;
        }

        return response()->json([
            'date' => $targetDate,
            'is_occupied' => count($occupiedSlots) > 0,
            'occupied_count' => count($occupiedSlots),
            'occupied_slots' => $occupiedSlots,
            'occupied_dates' => $occupiedDates,
            'server_timezone' => BookingTimeSlot::STORE_TIMEZONE,
            'server_date' => $today,
            'server_minutes' => $nowMinutes,
            'server_time_label' => $manilaNow->format('g:i A'),
        ]);
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
            'event_date' => 'required|date',
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

        $targetDate = \Carbon\Carbon::parse($validated['event_date'])->toDateString();
        $manilaNow = BookingTimeSlot::storeNow();

        if ($targetDate < $manilaNow->toDateString()) {
            return response()->json(
                $this->buildPastTimePayload($targetDate, null, [
                    'is_past' => true,
                    'reason' => 'past_date',
                    'now_date' => $manilaNow->toDateString(),
                    'now_minutes' => ((int) $manilaNow->hour * 60) + (int) $manilaNow->minute,
                    'now_label' => $manilaNow->format('g:i A'),
                ]),
                422
            );
        }

        $rawEventTime = trim((string) ($validated['event_time'] ?? ''));
        $timeInput = $rawEventTime !== '' ? $rawEventTime : '2:00 PM – 5:00 PM (3 Hours)';
        $parsedTimeSlot = BookingTimeSlot::parse($timeInput);
        if (!$parsedTimeSlot) {
            return response()->json([
                'message' => 'Please select a target time slot or enter a recognizable time range (e.g. 2:00 PM - 5:00 PM).',
                'errors' => [
                    'event_time' => ['Please enter a recognizable time range (e.g. 2:00 PM - 5:00 PM).'],
                ],
            ], 422);
        }

        // Prevent booking a time slot that has already started or passed today (Asia/Manila)
        $pastCheck = BookingTimeSlot::isPastSlotForDate($targetDate, $parsedTimeSlot, $manilaNow);
        if ($pastCheck['is_past']) {
            return response()->json(
                $this->buildPastTimePayload($targetDate, $parsedTimeSlot, $pastCheck),
                422
            );
        }

        BookingPackage::seedDefaultsIfEmpty();
        if (!empty($validated['booking_package_id'])) {
            $explicitPkg = BookingPackage::find((int) $validated['booking_package_id']);
            if ($explicitPkg && !$explicitPkg->is_active) {
                return response()->json([
                    'message' => 'The selected booking package is currently unavailable. Please choose an active package.',
                    'errors' => [
                        'booking_package_id' => ['Selected package is inactive.'],
                    ],
                ], 422);
            }
        }

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

        $conflictError = null;
        $booking = DB::transaction(function () use (
            &$conflictError,
            $targetDate,
            $parsedTimeSlot,
            $actingUser,
            $validated,
            $matchedPackage,
            $serverEstimatedCost
        ) {
            $conflictError = $this->findConflictingBooking($targetDate, $parsedTimeSlot, null, true);
            if ($conflictError !== null) {
                return null;
            }

            return EventBooking::create([
                'user_id' => $actingUser?->id ?? null,
                'client_name' => trim($validated['client_name']),
                'client_phone' => $validated['client_phone'],
                'client_email' => $validated['client_email'] ?? $actingUser?->email ?? null,
                'event_type' => $validated['event_type'],
                'event_date' => $targetDate,
                'event_time' => $parsedTimeSlot['label'],
                'guest_count' => $validated['guest_count'],
                'location' => trim($validated['location']),
                'package_name' => $validated['package_name'] ?? $matchedPackage?->name ?? 'Standard Catering Package',
                'estimated_cost' => $serverEstimatedCost,
                'status' => 'Pending',
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        if ($conflictError !== null || !$booking) {
            return response()->json($conflictError, 422);
        }

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
            'status' => 'sometimes|required|in:' . implode(',', self::ALLOWED_STATUSES),
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

        $oldDate = $this->normalizeDateString($booking->event_date);
        $oldTime = (string) ($booking->event_time ?? '');
        $oldStatus = $booking->status;

        $effectiveDate = array_key_exists('event_date', $validated)
            ? $this->normalizeDateString($validated['event_date'])
            : $oldDate;
        $effectiveStatus = $validated['status'] ?? $oldStatus;

        $parsedTimeSlot = null;
        if (array_key_exists('event_time', $validated)) {
            $rawTime = trim((string) ($validated['event_time'] ?? ''));
            if ($rawTime === '' || strcasecmp($rawTime, 'TBD') === 0) {
                if (in_array($effectiveStatus, self::ACTIVE_STATUSES, true)) {
                    return response()->json([
                        'message' => 'Please provide a valid time range (e.g. 2:00 PM - 5:00 PM) for Pending or Approved bookings.',
                        'errors' => [
                            'event_time' => ['A valid time range is required for active bookings.'],
                        ],
                    ], 422);
                }
                $validated['event_time'] = $rawTime === '' ? null : 'TBD';
            } else {
                $parsedTimeSlot = BookingTimeSlot::parse($rawTime);
                if (!$parsedTimeSlot) {
                    return response()->json([
                        'message' => 'Please enter a recognizable time range (e.g. 2:00 PM - 5:00 PM).',
                        'errors' => [
                            'event_time' => ['Please enter a recognizable time range (e.g. 2:00 PM - 5:00 PM).'],
                        ],
                    ], 422);
                }
                $validated['event_time'] = $parsedTimeSlot['label'];
            }
        } else {
            $parsedTimeSlot = BookingTimeSlot::parse($oldTime);
        }

        $effectiveTimeLabel = array_key_exists('event_time', $validated) ? ($validated['event_time'] ?? '') : $oldTime;
        $dateOrTimeChanged = $effectiveDate !== $oldDate || $effectiveTimeLabel !== $oldTime;
        $reactivated = !in_array($oldStatus, self::ACTIVE_STATUSES, true) && in_array($effectiveStatus, self::ACTIVE_STATUSES, true);

        if (in_array($effectiveStatus, self::ACTIVE_STATUSES, true) && ($dateOrTimeChanged || $reactivated)) {
            $manilaNow = BookingTimeSlot::storeNow();
            if ($parsedTimeSlot) {
                $pastCheck = BookingTimeSlot::isPastSlotForDate($effectiveDate, $parsedTimeSlot, $manilaNow);
                if ($pastCheck['is_past']) {
                    return response()->json(
                        $this->buildPastTimePayload($effectiveDate, $parsedTimeSlot, $pastCheck),
                        422
                    );
                }
            } elseif ($effectiveDate < $manilaNow->toDateString()) {
                return response()->json(
                    $this->buildPastTimePayload($effectiveDate, null, [
                        'is_past' => true,
                        'reason' => 'past_date',
                        'now_date' => $manilaNow->toDateString(),
                        'now_minutes' => ((int) $manilaNow->hour * 60) + (int) $manilaNow->minute,
                        'now_label' => $manilaNow->format('g:i A'),
                    ]),
                    422
                );
            }
        }

        $conflictError = null;
        $updatedBooking = DB::transaction(function () use (
            &$conflictError,
            $booking,
            $validated,
            $effectiveDate,
            $effectiveStatus,
            $parsedTimeSlot,
            $oldStatus,
            $operator
        ) {
            $locked = EventBooking::whereKey($booking->id)->lockForUpdate()->firstOrFail();

            if (in_array($effectiveStatus, self::ACTIVE_STATUSES, true) && $parsedTimeSlot) {
                $conflictError = $this->findConflictingBooking($effectiveDate, $parsedTimeSlot, (int) $locked->id, true);
                if ($conflictError !== null) {
                    return null;
                }
            }

            if (array_key_exists('status', $validated) && $validated['status'] !== $oldStatus) {
                if ($validated['status'] !== 'Pending') {
                    $locked->reviewed_by_name = $operator?->name ?? 'Store Staff';
                    $locked->reviewed_by_role = $operator?->role ?? 'staff';
                    $locked->reviewed_at = now();
                } else {
                    $locked->reviewed_by_name = null;
                    $locked->reviewed_by_role = null;
                    $locked->reviewed_at = null;
                }
            }

            $payload = $validated;
            unset($payload['booking_package_id']);
            if (array_key_exists('event_date', $payload)) {
                $payload['event_date'] = $effectiveDate;
            }
            $locked->fill($payload);
            $locked->save();

            return $locked->fresh();
        });

        if ($conflictError !== null || !$updatedBooking) {
            return response()->json($conflictError, 422);
        }

        AuditLog::create([
            'user_id' => $operator?->id,
            'user_name' => $operator?->name ?? 'Staff',
            'user_role' => $operator?->role ?? 'staff',
            'action' => 'Event Booking Updated',
            'details' => "Edited booking #{$updatedBooking->id} for {$updatedBooking->client_name} ({$updatedBooking->event_type}, ₱" . number_format((float) $updatedBooking->estimated_cost, 2) . ", {$updatedBooking->guest_count} pax)",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Booking #{$updatedBooking->id} updated successfully.",
            'booking' => $updatedBooking,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        [$reviewer, $denied] = $this->authorizeOperator($request);
        if ($denied) {
            return $denied;
        }

        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', self::ALLOWED_STATUSES),
        ]);

        $newStatus = $validated['status'];
        $errorResponse = null;
        $oldStatus = null;

        $booking = DB::transaction(function () use ($id, $newStatus, $reviewer, &$errorResponse, &$oldStatus) {
            $locked = EventBooking::whereKey($id)->lockForUpdate()->firstOrFail();
            $oldStatus = $locked->status;

            if (in_array($newStatus, self::ACTIVE_STATUSES, true)) {
                $bookingDate = $this->normalizeDateString($locked->event_date);
                $parsedSlot = BookingTimeSlot::parse($locked->event_time);

                if (!in_array($oldStatus, self::ACTIVE_STATUSES, true)) {
                    $manilaNow = BookingTimeSlot::storeNow();
                    if ($parsedSlot) {
                        $pastCheck = BookingTimeSlot::isPastSlotForDate($bookingDate, $parsedSlot, $manilaNow);
                        if ($pastCheck['is_past']) {
                            $errorResponse = $this->buildPastTimePayload($bookingDate, $parsedSlot, $pastCheck);
                            return null;
                        }
                    } elseif ($bookingDate < $manilaNow->toDateString()) {
                        $errorResponse = $this->buildPastTimePayload($bookingDate, null, [
                            'is_past' => true,
                            'reason' => 'past_date',
                            'now_date' => $manilaNow->toDateString(),
                            'now_minutes' => ((int) $manilaNow->hour * 60) + (int) $manilaNow->minute,
                            'now_label' => $manilaNow->format('g:i A'),
                        ]);
                        return null;
                    }
                }

                if ($parsedSlot) {
                    $conflict = $this->findConflictingBooking($bookingDate, $parsedSlot, (int) $locked->id, true);
                    if ($conflict !== null) {
                        $errorResponse = $conflict;
                        return null;
                    }
                }
            }

            $locked->status = $newStatus;
            if ($newStatus !== 'Pending') {
                $locked->reviewed_by_name = $reviewer?->name ?? 'Store Staff';
                $locked->reviewed_by_role = $reviewer?->role ?? 'staff';
                $locked->reviewed_at = now();
            } else {
                $locked->reviewed_by_name = null;
                $locked->reviewed_by_role = null;
                $locked->reviewed_at = null;
            }

            $locked->save();
            return $locked;
        });

        if ($errorResponse !== null || !$booking) {
            return response()->json($errorResponse, 422);
        }

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

    public function cancel(Request $request, $id)
    {
        $booking = EventBooking::findOrFail($id);
        $user = auth('sanctum')->user() ?? $request->user();

        $isOperator = $user && in_array($user->role, ['staff', 'admin', 'super_admin']);
        $isOwnerByUser = false;
        if ($user) {
            if ((int) $booking->user_id === (int) $user->id) {
                $isOwnerByUser = true;
            } elseif ($booking->user_id === null) {
                $userEmail = strtolower(trim((string) ($user->email ?? '')));
                $bookingEmail = strtolower(trim((string) ($booking->client_email ?? '')));
                $userPhone = $this->normalizePhone($user->phone);
                $bookingPhone = $this->normalizePhone($booking->client_phone);
                if (($userEmail !== '' && $userEmail === $bookingEmail) || ($userPhone !== '' && $userPhone === $bookingPhone)) {
                    $isOwnerByUser = true;
                }
            }
        }

        $providedPhone = $this->normalizePhone($request->input('client_phone'));
        $bookingPhone = $this->normalizePhone($booking->client_phone);
        $matchesPhone = $providedPhone !== '' && $bookingPhone !== '' && $providedPhone === $bookingPhone;

        if (!$isOperator && !$isOwnerByUser && !$matchesPhone) {
            return response()->json([
                'message' => 'Access Denied: You can only cancel your own pending booking request.',
            ], 403);
        }

        if ($booking->status !== 'Pending') {
            return response()->json([
                'message' => "Only Pending bookings can be cancelled online (current status: {$booking->status}). Contact Jefferson Alulod at 0994 612 1933 for assistance.",
            ], 422);
        }

        $booking->status = 'Cancelled';
        $booking->reviewed_by_name = $user?->name ?? $booking->client_name ?? 'Customer';
        $booking->reviewed_by_role = $user?->role ?? 'customer';
        $booking->reviewed_at = now();
        $booking->save();

        if ($isOperator) {
            AuditLog::create([
                'user_id' => $user?->id,
                'user_name' => $user?->name ?? 'Staff',
                'user_role' => $user?->role ?? 'staff',
                'action' => 'Event Booking Cancelled',
                'details' => "Booking #{$booking->id} for {$booking->client_name} was cancelled.",
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'message' => "Booking #{$booking->id} has been cancelled and the time slot is now open.",
            'booking' => $booking,
        ]);
    }
}
