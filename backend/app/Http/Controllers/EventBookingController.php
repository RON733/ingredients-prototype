<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\EventBooking;
use App\Models\BookingPackage;
use App\Models\AuditLog;
use App\Models\SystemSetting;
use App\Models\User;
use App\Support\BookingTimeSlot;

class EventBookingController extends Controller
{
    private const ACTIVE_STATUSES = [
        'Pending',
        'Approved',
        'Awaiting Downpayment',
        'Downpayment Submitted',
        'Confirmed',
    ];
    private const UNVERIFIED_CUSTOMER_HOLD_STATUSES = [
        'Pending',
        'Approved',
        'Awaiting Downpayment',
    ];
    private const ALLOWED_STATUSES = [
        'Pending',
        'Approved',
        'Awaiting Downpayment',
        'Downpayment Submitted',
        'Confirmed',
        'Declined',
        'Completed',
        'Cancelled',
    ];
    private const CLIENT_PAYMENT_METHODS = ['GCash', 'Maya', 'Bank Transfer'];
    private const ALL_PAYMENT_METHODS = ['Cash', 'GCash', 'Maya', 'Bank Transfer'];
    private const MAX_PENDING_PER_CUSTOMER = 3;
    private const MAX_PROOF_BYTES = 3145728; // 3 MB

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

    private function normalizeReference(?string $raw): string
    {
        return preg_replace('/\s+/', ' ', trim((string) $raw));
    }

    private function authorizeOperator(Request $request, bool $requireUser = false)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        if ($requireUser && !$user) {
            return [null, response()->json([
                'message' => 'Authentication required: Please sign in as Staff or Admin.',
            ], 401)];
        }
        if ($user && !in_array($user->role, ['staff', 'admin', 'super_admin'], true)) {
            return [null, response()->json([
                'message' => 'Access Denied: Only Staff or Admin can manage bookings.',
            ], 403)];
        }
        return [$user, null];
    }

    private function authorizeBookingOwnerOrOperator(Request $request, EventBooking $booking, string $deniedMessage): array
    {
        $user = auth('sanctum')->user() ?? $request->user();
        $isOperator = $user && in_array($user->role, ['staff', 'admin', 'super_admin'], true);

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
            return [$user, $isOperator, response()->json([
                'message' => $deniedMessage,
            ], 403)];
        }

        return [$user, $isOperator, null];
    }

    private function assertValidStatusTransition(string $from, string $to): ?string
    {
        if ($from === $to) {
            return null;
        }

        $allowedMap = [
            'Pending' => ['Approved', 'Declined', 'Cancelled'],
            'Declined' => ['Approved', 'Cancelled'],
            'Approved' => ['Declined', 'Cancelled'],
            'Awaiting Downpayment' => ['Cancelled'],
            'Downpayment Submitted' => ['Cancelled'],
            'Confirmed' => ['Completed', 'Cancelled'],
            'Completed' => [],
            'Cancelled' => [],
        ];

        $allowedTargets = $allowedMap[$from] ?? [];
        if (in_array($to, $allowedTargets, true)) {
            return null;
        }

        if ($to === 'Awaiting Downpayment') {
            return 'Use the Request Downpayment action after approving the booking so final price, downpayment amount, and deadline are recorded.';
        }
        if ($to === 'Confirmed') {
            return 'A booking can only become Confirmed after the client submits proof of downpayment and Staff/Admin verifies it.';
        }
        if ($to === 'Completed') {
            return 'Only Confirmed (downpayment-verified) bookings can be marked as Completed.';
        }

        return "Invalid status transition from {$from} to {$to}.";
    }

    private function extractAndValidateProofImage(Request $request): array
    {
        $rawBytes = null;
        $fileObj = $request->file('payment_proof_file')
            ?? ($request->hasFile('payment_proof') ? $request->file('payment_proof') : null);

        if ($fileObj) {
            if (!$fileObj->isValid()) {
                return [null, 'Uploaded proof of payment file is invalid or incomplete.'];
            }
            if ($fileObj->getSize() > self::MAX_PROOF_BYTES) {
                return [null, 'Proof of payment image must not exceed 3 MB.'];
            }
            $rawBytes = @file_get_contents($fileObj->getRealPath());
        } else {
            $rawInput = trim((string) $request->input('payment_proof', ''));
            if ($rawInput === '') {
                return [null, 'Please upload a screenshot or photo of your payment receipt.'];
            }
            if (!preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+\/=\r\n]+)$/i', $rawInput, $matches)) {
                return [null, 'Proof of payment must be a valid JPG, PNG, or WebP image.'];
            }
            $decoded = base64_decode(preg_replace('/\s+/', '', $matches[2]), true);
            if ($decoded === false) {
                return [null, 'Could not decode proof of payment image.'];
            }
            $rawBytes = $decoded;
        }

        if (!is_string($rawBytes) || $rawBytes === '') {
            return [null, 'Proof of payment image is empty.'];
        }
        if (strlen($rawBytes) > self::MAX_PROOF_BYTES) {
            return [null, 'Proof of payment image must not exceed 3 MB.'];
        }

        $imageInfo = @getimagesizefromstring($rawBytes);
        if (!$imageInfo || !in_array($imageInfo[2] ?? 0, [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
            return [null, 'Invalid image file. Only genuine JPG, PNG, or WebP receipt images are accepted.'];
        }

        $mime = match ($imageInfo[2]) {
            IMAGETYPE_PNG => 'image/png',
            IMAGETYPE_WEBP => 'image/webp',
            default => 'image/jpeg',
        };

        return ['data:' . $mime . ';base64,' . base64_encode($rawBytes), null];
    }

    private function hasDuplicatePaymentReference(string $method, string $normalizedRef, ?int $excludeBookingId = null): bool
    {
        $query = EventBooking::query()
            ->where('payment_method', $method)
            ->whereRaw('UPPER(TRIM(payment_reference)) = ?', [strtoupper($normalizedRef)])
            ->whereIn('payment_status', ['For Verification', 'Downpayment Paid', 'Fully Paid'])
            ->whereNotIn('status', ['Cancelled', 'Declined']);

        if ($excludeBookingId !== null) {
            $query->where('id', '!=', $excludeBookingId);
        }

        return $query->exists();
    }

    private function buildConflictPayload(
        string $targetDate,
        array $parsedTimeSlot,
        string $conflictingLabel,
        string $status,
        bool $isBufferOnly = false,
        ?string $bufferWindowLabel = null
    ): array {
        if ($isBufferOnly && $bufferWindowLabel) {
            $message = "This date has an occupied booking at {$conflictingLabel}, and we require a 2-hour preparation and turnaround buffer before and after each event (blocked {$bufferWindowLabel}). Your selected time ({$parsedTimeSlot['range_label']}) falls within this preparation window.";
            $fieldError = "Selected time ({$parsedTimeSlot['range_label']}) falls within the 2-hour preparation and turnaround buffer around {$conflictingLabel} ({$bufferWindowLabel}).";
        } else {
            $message = "This date already has an occupied booking at {$conflictingLabel}. Your selected time ({$parsedTimeSlot['range_label']}) conflicts with it, so this slot cannot be booked.";
            $fieldError = "Selected time ({$parsedTimeSlot['range_label']}) conflicts with an existing booking ({$conflictingLabel}) on this date.";
        }

        return [
            'message' => $message,
            'reason' => $isBufferOnly ? 'prep_buffer_conflict' : 'time_conflict',
            'conflict' => [
                'event_date' => $targetDate,
                'conflicting_time' => $conflictingLabel,
                'buffer_window' => $bufferWindowLabel,
                'is_buffer_only' => $isBufferOnly,
                'status' => $status,
            ],
            'errors' => [
                'event_time' => [$fieldError],
            ],
        ];
    }

    private function buildScheduleRulePayload(string $targetDate, ?array $parsedTimeSlot, array $eval): array
    {
        $reason = $eval['reason'] ?? 'invalid_schedule';
        $rangeLabel = $parsedTimeSlot['range_label'] ?? 'Selected time';
        $base = [
            'reason' => $reason,
            'server_date' => $eval['now_date'],
            'max_date' => $eval['max_date'],
            'server_time_label' => $eval['now_label'],
            'earliest_start_label' => $eval['earliest_start_label'],
        ];

        if ($reason === 'past_date') {
            return [
                ...$base,
                'message' => "The selected date ({$targetDate}) has already passed. Today is {$eval['now_date']}.",
                'errors' => [
                    'event_date' => ["Target date must be today ({$eval['now_date']}) or later."],
                ],
            ];
        }

        if ($reason === 'too_far') {
            return [
                ...$base,
                'message' => "Bookings can only be scheduled up to 1 year in advance (on or before {$eval['max_date']}).",
                'errors' => [
                    'event_date' => ["Target date must be on or before {$eval['max_date']}."],
                ],
            ];
        }

        if ($reason === 'service_hours') {
            return [
                ...$base,
                'message' => 'Event catering start times must be between 7:00 AM and 10:00 PM.',
                'errors' => [
                    'event_time' => ['Event start time must be between 7:00 AM and 10:00 PM.'],
                ],
            ];
        }

        if ($reason === 'same_day_closed') {
            return [
                ...$base,
                'message' => "Same-day bookings are closed from 6:00 PM onward because we require 2 hours of preparation time and do not accept same-day events from 8:00 PM to 12:00 AM (current time: {$eval['now_label']}). Please choose tomorrow or a future date.",
                'errors' => [
                    'event_date' => ['Same-day bookings are closed after 6:00 PM. Please select tomorrow or a future date.'],
                ],
            ];
        }

        if ($reason === 'same_day_night_cutoff') {
            return [
                ...$base,
                'message' => "Same-day bookings between 8:00 PM and 12:00 AM are not allowed. Please choose an earlier time ending by 10:00 PM, or book for tomorrow or a future date.",
                'errors' => [
                    'event_time' => ["{$rangeLabel} falls in the restricted 8:00 PM – 12:00 AM window for same-day bookings."],
                ],
            ];
        }

        if ($reason === 'prep_time') {
            $earliest = $eval['earliest_start_label'] ?? 'a later time';
            return [
                ...$base,
                'message' => "We require at least 2 hours of preparation time for same-day bookings. At {$eval['now_label']}, the earliest available start time today is {$earliest} (before 8:00 PM).",
                'errors' => [
                    'event_time' => ["{$rangeLabel} does not meet the 2-hour preparation notice (earliest today: {$earliest})."],
                ],
            ];
        }

        return [
            ...$base,
            'message' => "You can't book {$rangeLabel} for today anymore because it is already {$eval['now_label']}. Please choose a later time or another date.",
            'errors' => [
                'event_time' => ["{$rangeLabel} has already passed today (current time: {$eval['now_label']}). Please choose a later time."],
            ],
        ];
    }

    private function formatBufferWindow(int $startMinutes, int $endMinutes): string
    {
        $bufStart = max(0, $startMinutes - BookingTimeSlot::PREP_BUFFER_MINUTES);
        $bufEnd = $endMinutes + BookingTimeSlot::PREP_BUFFER_MINUTES;
        return BookingTimeSlot::formatTime($bufStart) . ' – ' . BookingTimeSlot::formatTime($bufEnd);
    }

    private function findConflictingBooking(string $targetDate, array $parsedTimeSlot, ?int $excludeBookingId = null, bool $lock = true): ?array
    {
        $buffer = BookingTimeSlot::PREP_BUFFER_MINUTES;

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
            if (BookingTimeSlot::overlaps($parsedTimeSlot, $existingSlot, $buffer)) {
                $directOverlap = BookingTimeSlot::overlaps($parsedTimeSlot, $existingSlot, 0);
                $bufferWindow = $this->formatBufferWindow($existingSlot['start_minutes'], $existingSlot['end_minutes']);
                return $this->buildConflictPayload(
                    $targetDate,
                    $parsedTimeSlot,
                    $existingSlot['range_label'],
                    $existing->status,
                    !$directOverlap,
                    $bufferWindow
                );
            }
        }

        // Check overnight spillover (including 2-hour turnaround buffer) from previous day
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
            if ($prevSlot && ($prevSlot['end_minutes'] + $buffer) > 1440) {
                $spillSlot = BookingTimeSlot::shiftSlot($prevSlot, -1440);
                if (BookingTimeSlot::overlaps($parsedTimeSlot, $spillSlot, $buffer)) {
                    $directOverlap = BookingTimeSlot::overlaps($parsedTimeSlot, $spillSlot, 0);
                    $spillEndBuf = ($prevSlot['end_minutes'] + $buffer) - 1440;
                    $bufferWindow = '12:00 AM – ' . BookingTimeSlot::formatTime($spillEndBuf);
                    return $this->buildConflictPayload(
                        $targetDate,
                        $parsedTimeSlot,
                        "{$prevSlot['range_label']} (overnight from {$prevDate})",
                        $prevExisting->status,
                        !$directOverlap,
                        $bufferWindow
                    );
                }
            }
        }

        // Check overnight spillover (including 2-hour turnaround buffer) into next day
        if (($parsedTimeSlot['end_minutes'] + $buffer) > 1440) {
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
                if (BookingTimeSlot::overlaps($nextDayCandidate, $nextSlot, $buffer)) {
                    $directOverlap = BookingTimeSlot::overlaps($nextDayCandidate, $nextSlot, 0);
                    $bufferWindow = $this->formatBufferWindow($nextSlot['start_minutes'], $nextSlot['end_minutes']);
                    return $this->buildConflictPayload(
                        $targetDate,
                        $parsedTimeSlot,
                        "{$nextSlot['range_label']} (next day {$nextDate})",
                        $nextExisting->status,
                        !$directOverlap,
                        $bufferWindow
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
        $maxDate = $manilaNow->copy()->addDays(BookingTimeSlot::MAX_ADVANCE_DAYS)->toDateString();
        $nowMinutes = ((int) $manilaNow->hour * 60) + (int) $manilaNow->minute;
        $earliestTodayMinutes = $nowMinutes + BookingTimeSlot::PREP_BUFFER_MINUTES;
        $buffer = BookingTimeSlot::PREP_BUFFER_MINUTES;

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
                $bufStart = $parsed ? max(0, $parsed['start_minutes'] - $buffer) : null;
                $bufEnd = $parsed ? ($parsed['end_minutes'] + $buffer) : null;
                $occupiedSlots[] = [
                    'event_time' => $parsed ? $parsed['label'] : ($booking->event_time ?: 'TBD'),
                    'range_label' => $parsed ? $parsed['range_label'] : ($booking->event_time ?: 'TBD'),
                    'start_minutes' => $parsed['start_minutes'] ?? null,
                    'end_minutes' => $parsed['end_minutes'] ?? null,
                    'buffer_start_minutes' => $bufStart,
                    'buffer_end_minutes' => $bufEnd,
                    'buffer_range_label' => ($bufStart !== null && $bufEnd !== null)
                        ? BookingTimeSlot::formatTime($bufStart) . ' – ' . BookingTimeSlot::formatTime($bufEnd)
                        : null,
                    'blocks_whole_day' => $parsed === null,
                    'status' => $booking->status,
                ];
            }

            // Include overnight spillover (and 2h turnaround tail) from previous day
            $prevDate = \Carbon\Carbon::parse($targetDate)->subDay()->toDateString();
            $prevDayBookings = EventBooking::whereDate('event_date', $prevDate)
                ->whereIn('status', self::ACTIVE_STATUSES)
                ->orderBy('id')
                ->get(['event_time', 'status']);

            foreach ($prevDayBookings as $prevBooking) {
                $prevParsed = BookingTimeSlot::parse($prevBooking->event_time);
                if ($prevParsed && ($prevParsed['end_minutes'] + $buffer) > 1440) {
                    $spillEndRaw = $prevParsed['end_minutes'] - 1440;
                    $spillEndWithBuffer = ($prevParsed['end_minutes'] + $buffer) - 1440;
                    $occupiedSlots[] = [
                        'event_time' => $prevParsed['label'],
                        'range_label' => ($spillEndRaw > 0
                            ? '12:00 AM – ' . BookingTimeSlot::formatTime($spillEndRaw)
                            : 'Overnight prep/cleanup until ' . BookingTimeSlot::formatTime($spillEndWithBuffer))
                            . " (from {$prevDate})",
                        'start_minutes' => 0,
                        'end_minutes' => max(0, $spillEndRaw),
                        'buffer_start_minutes' => 0,
                        'buffer_end_minutes' => $spillEndWithBuffer,
                        'buffer_range_label' => '12:00 AM – ' . BookingTimeSlot::formatTime($spillEndWithBuffer),
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
            'max_date' => $maxDate,
            'server_minutes' => $nowMinutes,
            'server_time_label' => $manilaNow->format('g:i A'),
            'prep_buffer_minutes' => $buffer,
            'same_day_closed' => $earliestTodayMinutes >= BookingTimeSlot::SAME_DAY_CUTOFF_START_MINUTES,
            'earliest_today_minutes' => $earliestTodayMinutes,
            'earliest_today_label' => $earliestTodayMinutes < 1440 ? BookingTimeSlot::formatTime($earliestTodayMinutes) : null,
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
        $maintenance = SystemSetting::where('key', 'maintenance_mode')->value('value');
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

        $cleanName = trim($validated['client_name']);
        if (mb_strlen($cleanName) < 2) {
            return response()->json([
                'message' => 'Please enter your full name (at least 2 characters).',
                'errors' => ['client_name' => ['Client name must be at least 2 characters.']],
            ], 422);
        }

        $cleanLocation = trim($validated['location']);
        if (mb_strlen($cleanLocation) < 5) {
            return response()->json([
                'message' => 'Please enter a complete event venue or address (at least 5 characters).',
                'errors' => ['location' => ['Event venue/location must be at least 5 characters.']],
            ], 422);
        }

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

        // Check date bounds before parsing time
        $dateEval = BookingTimeSlot::evaluateScheduleRules($targetDate, null, $manilaNow);
        if (!$dateEval['valid']) {
            return response()->json($this->buildScheduleRulePayload($targetDate, null, $dateEval), 422);
        }

        $rawEventTime = trim((string) ($validated['event_time'] ?? ''));
        $timeInput = $rawEventTime !== '' ? $rawEventTime : '2:00 PM – 5:00 PM (3 Hours)';
        $parsedTimeSlot = BookingTimeSlot::parse($timeInput);
        if (!$parsedTimeSlot) {
            return response()->json([
                'message' => 'Please select a target time slot (2 to 10 hours duration, e.g. 2:00 PM - 5:00 PM).',
                'errors' => [
                    'event_time' => ['Please enter a valid time range (2 to 10 hours, e.g. 2:00 PM - 5:00 PM).'],
                ],
            ], 422);
        }

        // Enforce service hours, 2-hour preparation lead time, and same-day 8 PM - 12 AM cutoff
        $scheduleEval = BookingTimeSlot::evaluateScheduleRules($targetDate, $parsedTimeSlot, $manilaNow);
        if (!$scheduleEval['valid']) {
            return response()->json($this->buildScheduleRulePayload($targetDate, $parsedTimeSlot, $scheduleEval), 422);
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

        $isOperator = $actingUser && in_array($actingUser->role, ['staff', 'admin', 'super_admin'], true);

        $rejectionError = null;
        $booking = DB::transaction(function () use (
            &$rejectionError,
            $targetDate,
            $parsedTimeSlot,
            $actingUser,
            $isOperator,
            $cleanName,
            $cleanLocation,
            $validated,
            $matchedPackage,
            $serverEstimatedCost
        ) {
            if (!$isOperator) {
                $pendingCount = EventBooking::whereIn('status', self::UNVERIFIED_CUSTOMER_HOLD_STATUSES)
                    ->where(function ($q) use ($actingUser, $validated) {
                        $q->where('client_phone', $validated['client_phone']);
                        if ($actingUser?->id) {
                            $q->orWhere('user_id', $actingUser->id);
                        }
                    })
                    ->count();

                if ($pendingCount >= self::MAX_PENDING_PER_CUSTOMER) {
                    $rejectionError = [
                        'message' => 'You already have ' . self::MAX_PENDING_PER_CUSTOMER . ' active unpaid booking requests. Please complete downpayment or cancel an unused pending request before submitting another.',
                        'reason' => 'pending_limit',
                    ];
                    return null;
                }
            }

            $rejectionError = $this->findConflictingBooking($targetDate, $parsedTimeSlot, null, true);
            if ($rejectionError !== null) {
                return null;
            }

            return EventBooking::create([
                'user_id' => $actingUser?->id ?? null,
                'client_name' => $cleanName,
                'client_phone' => $validated['client_phone'],
                'client_email' => $validated['client_email'] ?? $actingUser?->email ?? null,
                'event_type' => $validated['event_type'],
                'event_date' => $targetDate,
                'event_time' => $parsedTimeSlot['label'],
                'guest_count' => $validated['guest_count'],
                'location' => $cleanLocation,
                'package_name' => $validated['package_name'] ?? $matchedPackage?->name ?? 'Standard Catering Package',
                'estimated_cost' => $serverEstimatedCost,
                'final_cost' => $serverEstimatedCost,
                'downpayment_amount' => 0,
                'amount_paid' => 0,
                'remaining_balance' => $serverEstimatedCost,
                'payment_status' => 'Unpaid',
                'status' => 'Pending',
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        if ($rejectionError !== null || !$booking) {
            return response()->json($rejectionError, 422);
        }

        $bookingRole = $actingUser?->role;
        if ($bookingRole && in_array($bookingRole, ['staff', 'admin', 'super_admin'])) {
            AuditLog::create([
                'user_id' => $actingUser?->id,
                'user_name' => $actingUser?->name ?? $cleanName,
                'user_role' => $bookingRole,
                'action' => 'Event Booking Logged',
                'details' => "Booking for {$validated['event_type']} on {$validated['event_date']} ({$validated['guest_count']} guests)",
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'message' => 'Event booking submitted successfully! Wait for Admin approval before discussing final details and downpayment.',
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
            'estimated_cost' => 'sometimes|required|numeric|min:0|max:1000000',
            'final_cost' => 'sometimes|required|numeric|min:0|max:1000000',
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

        if (array_key_exists('status', $validated) && $validated['status'] !== $oldStatus) {
            $transitionErr = $this->assertValidStatusTransition($oldStatus, $validated['status']);
            if ($transitionErr !== null) {
                return response()->json(['message' => $transitionErr], 422);
            }
        }

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
                        'message' => 'Please provide a valid time range (2 to 10 hours, e.g. 2:00 PM - 5:00 PM) for Pending or Approved bookings.',
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
                        'message' => 'Please enter a recognizable time range (2 to 10 hours, e.g. 2:00 PM - 5:00 PM).',
                        'errors' => [
                            'event_time' => ['Please enter a valid time range (2 to 10 hours, e.g. 2:00 PM - 5:00 PM).'],
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
            $scheduleEval = BookingTimeSlot::evaluateScheduleRules($effectiveDate, $parsedTimeSlot, $manilaNow);
            if (!$scheduleEval['valid']) {
                return response()->json($this->buildScheduleRulePayload($effectiveDate, $parsedTimeSlot, $scheduleEval), 422);
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

            if (in_array($locked->status, ['Completed', 'Cancelled'], true)) {
                $conflictError = [
                    'message' => "Cannot edit a {$locked->status} booking.",
                ];
                return null;
            }

            $priceChanged = array_key_exists('estimated_cost', $validated) || array_key_exists('final_cost', $validated);
            if ($priceChanged && $locked->status === 'Downpayment Submitted') {
                $conflictError = [
                    'message' => 'Verify or reject the submitted downpayment proof before modifying the booking price.',
                ];
                return null;
            }

            if (in_array($effectiveStatus, self::ACTIVE_STATUSES, true) && $parsedTimeSlot) {
                $conflictError = $this->findConflictingBooking($effectiveDate, $parsedTimeSlot, (int) $locked->id, true);
                if ($conflictError !== null) {
                    return null;
                }
            }

            $payload = $validated;
            unset($payload['booking_package_id']);
            if (array_key_exists('event_date', $payload)) {
                $payload['event_date'] = $effectiveDate;
            }

            if ($priceChanged) {
                $newCost = round((float) ($payload['final_cost'] ?? $payload['estimated_cost']), 2);
                $paid = round((float) ($locked->amount_paid ?? 0), 2);
                if ($newCost < $paid) {
                    $conflictError = [
                        'message' => 'Total price cannot be lower than the amount already verified and paid (₱' . number_format($paid, 2) . ').',
                    ];
                    return null;
                }
                if (in_array($locked->status, ['Pending', 'Approved'], true)) {
                    $payload['estimated_cost'] = $newCost;
                }
                $payload['final_cost'] = $newCost;
                $payload['remaining_balance'] = max(0, round($newCost - $paid, 2));

                if ($locked->status === 'Awaiting Downpayment' && (float) $locked->downpayment_amount > $newCost) {
                    $payload['downpayment_amount'] = $newCost;
                    $payload['downpayment_percentage'] = 100;
                } elseif ($locked->status === 'Awaiting Downpayment' && $locked->downpayment_percentage) {
                    $payload['downpayment_amount'] = round($newCost * ((float) $locked->downpayment_percentage / 100), 2);
                }

                if ($locked->status === 'Confirmed') {
                    if ($payload['remaining_balance'] <= 0) {
                        $payload['payment_status'] = 'Fully Paid';
                        $payload['fully_paid_at'] = now();
                    } else {
                        $payload['payment_status'] = 'Downpayment Paid';
                        $payload['fully_paid_at'] = null;
                    }
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
            'reason' => 'nullable|string|max:500',
        ]);

        $newStatus = $validated['status'];
        $errorResponse = null;
        $oldStatus = null;

        $cancelReason = trim((string) ($validated['reason'] ?? ''));
        $booking = DB::transaction(function () use ($id, $newStatus, $reviewer, $cancelReason, &$errorResponse, &$oldStatus) {
            $locked = EventBooking::whereKey($id)->lockForUpdate()->firstOrFail();
            $oldStatus = $locked->status;

            $transitionErr = $this->assertValidStatusTransition($oldStatus, $newStatus);
            if ($transitionErr !== null) {
                $errorResponse = ['message' => $transitionErr];
                return null;
            }

            if (in_array($newStatus, self::ACTIVE_STATUSES, true)) {
                $bookingDate = $this->normalizeDateString($locked->event_date);
                $parsedSlot = BookingTimeSlot::parse($locked->event_time);

                if (!in_array($oldStatus, self::ACTIVE_STATUSES, true)) {
                    $manilaNow = BookingTimeSlot::storeNow();
                    $scheduleEval = BookingTimeSlot::evaluateScheduleRules($bookingDate, $parsedSlot, $manilaNow);
                    if (!$scheduleEval['valid']) {
                        $errorResponse = $this->buildScheduleRulePayload($bookingDate, $parsedSlot, $scheduleEval);
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
            if ($newStatus === 'Cancelled' && $cancelReason !== '') {
                $locked->downpayment_rejection_reason = $cancelReason;
            }
            if ($newStatus === 'Completed') {
                $finalCost = (float) ($locked->final_cost ?? $locked->estimated_cost);
                $remaining = max(0, round($finalCost - (float) ($locked->amount_paid ?? 0), 2));
                if ($remaining > 0) {
                    $locked->final_payment_method = $locked->final_payment_method ?: 'Cash';
                }
                $locked->amount_paid = $finalCost;
                $locked->remaining_balance = 0;
                $locked->payment_status = 'Fully Paid';
                $locked->fully_paid_at = now();
            }
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

    /**
     * Option A Step 3: After Approved + Discussion, Staff/Admin finalizes price and opens Downpayment for Client.
     */
    public function requestDownpayment(Request $request, $id)
    {
        [$operator, $denied] = $this->authorizeOperator($request, true);
        if ($denied) {
            return $denied;
        }

        $validated = $request->validate([
            'final_cost' => 'required|numeric|min:100|max:1000000',
            'downpayment_percentage' => 'nullable|numeric|min:1|max:100',
            'downpayment_amount' => 'nullable|numeric|min:1|max:1000000',
            'deadline_hours' => 'nullable|integer|min:1|max:720',
            'downpayment_deadline' => 'nullable|date',
            'payment_notes' => 'nullable|string|max:500',
        ]);

        $errorResponse = null;

        $booking = DB::transaction(function () use ($id, $validated, $operator, &$errorResponse) {
            $locked = EventBooking::whereKey($id)->lockForUpdate()->firstOrFail();

            if (!in_array($locked->status, ['Approved', 'Awaiting Downpayment'], true)) {
                $errorResponse = [
                    'message' => "Downpayment can only be requested after the booking is Approved (current status: {$locked->status}).",
                ];
                return null;
            }

            $finalCost = round((float) $validated['final_cost'], 2);

            if (array_key_exists('downpayment_amount', $validated) && $validated['downpayment_amount'] !== null) {
                $dpAmount = round((float) $validated['downpayment_amount'], 2);
                $dpPercent = round(($dpAmount / $finalCost) * 100, 2);
            } else {
                $defaultPct = (float) (SystemSetting::where('key', 'booking_downpayment_percent')->value('value') ?: 50);
                $dpPercent = round((float) ($validated['downpayment_percentage'] ?? $defaultPct), 2);
                $dpAmount = round($finalCost * ($dpPercent / 100), 2);
            }

            if ($dpAmount < 1 || $dpAmount > $finalCost) {
                $errorResponse = [
                    'message' => 'Downpayment amount must be between ₱1.00 and the final agreed price (₱' . number_format($finalCost, 2) . ').',
                    'errors' => [
                        'downpayment_amount' => ['Downpayment amount must not exceed the final agreed price.'],
                    ],
                ];
                return null;
            }

            $manilaNow = BookingTimeSlot::storeNow();
            if (!empty($validated['downpayment_deadline'])) {
                $deadline = \Carbon\Carbon::parse($validated['downpayment_deadline'], BookingTimeSlot::STORE_TIMEZONE);
                if ($deadline->lessThanOrEqualTo($manilaNow)) {
                    $errorResponse = [
                        'message' => 'Downpayment deadline must be in the future.',
                        'errors' => [
                            'downpayment_deadline' => ['Deadline must be later than the current time.'],
                        ],
                    ];
                    return null;
                }
            } else {
                $defaultHours = (int) (SystemSetting::where('key', 'booking_payment_deadline_hours')->value('value') ?: 48);
                $hours = (int) ($validated['deadline_hours'] ?? max(1, $defaultHours));
                $deadline = $manilaNow->copy()->addHours($hours);
            }

            $eventDateStr = $this->normalizeDateString($locked->event_date);
            $parsedSlot = BookingTimeSlot::parse($locked->event_time);
            $startMinutes = $parsedSlot ? $parsedSlot['start_minutes'] : 540;
            $eventStart = \Carbon\Carbon::parse($eventDateStr, BookingTimeSlot::STORE_TIMEZONE)->startOfDay()->addMinutes($startMinutes);
            if ($eventStart->greaterThan($manilaNow) && $deadline->greaterThan($eventStart)) {
                $deadline = $eventStart->copy();
            }

            $locked->final_cost = $finalCost;
            $locked->downpayment_percentage = $dpPercent;
            $locked->downpayment_amount = $dpAmount;
            $locked->amount_paid = 0;
            $locked->remaining_balance = $finalCost;
            $locked->payment_status = 'Requested';
            $locked->downpayment_requested_at = now();
            $locked->downpayment_requested_by = $operator?->name ?? 'Store Staff';
            $locked->downpayment_deadline = $deadline;
            $locked->payment_notes = isset($validated['payment_notes']) && trim((string) $validated['payment_notes']) !== ''
                ? trim((string) $validated['payment_notes'])
                : null;
            $locked->downpayment_rejection_reason = null;
            $locked->status = 'Awaiting Downpayment';
            $locked->reviewed_by_name = $operator?->name ?? 'Store Staff';
            $locked->reviewed_by_role = $operator?->role ?? 'staff';
            $locked->reviewed_at = now();
            $locked->save();

            return $locked->fresh();
        });

        if ($errorResponse !== null || !$booking) {
            return response()->json($errorResponse, 422);
        }

        AuditLog::create([
            'user_id' => $operator?->id,
            'user_name' => $operator?->name ?? 'Staff',
            'user_role' => $operator?->role ?? 'staff',
            'action' => 'Booking Downpayment Requested',
            'details' => "Requested ₱" . number_format((float) $booking->downpayment_amount, 2) . " downpayment ({$booking->downpayment_percentage}%) out of ₱" . number_format((float) $booking->final_cost, 2) . " for booking #{$booking->id} ({$booking->client_name}).",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Downpayment of ₱" . number_format((float) $booking->downpayment_amount, 2) . " is now open for {$booking->client_name}.",
            'booking' => $booking,
        ]);
    }

    /**
     * Option A Step 4: Client submits proof of downpayment (receipt screenshot + reference number).
     */
    public function submitDownpayment(Request $request, $id)
    {
        $booking = EventBooking::findOrFail($id);

        [$user, $isOperator, $denied] = $this->authorizeBookingOwnerOrOperator(
            $request,
            $booking,
            'Access Denied: You can only submit downpayment for your own booking.'
        );
        if ($denied) {
            return $denied;
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:' . implode(',', self::CLIENT_PAYMENT_METHODS),
            'payment_reference' => 'required|string|min:4|max:100',
            'client_phone' => 'nullable|string|max:20',
        ]);

        $cleanRef = $this->normalizeReference($validated['payment_reference']);
        $alnumCount = strlen(preg_replace('/[^A-Za-z0-9]/', '', $cleanRef));
        if ($alnumCount < 4) {
            return response()->json([
                'message' => 'Please enter a valid payment reference / transaction number (at least 4 alphanumeric characters).',
                'errors' => [
                    'payment_reference' => ['Reference number must contain at least 4 letters or digits.'],
                ],
            ], 422);
        }

        [$proofDataUrl, $proofErr] = $this->extractAndValidateProofImage($request);
        if ($proofErr !== null || !$proofDataUrl) {
            return response()->json([
                'message' => $proofErr ?? 'Invalid proof of payment image.',
                'errors' => [
                    'payment_proof' => [$proofErr ?? 'Invalid proof of payment image.'],
                ],
            ], 422);
        }

        $errorResponse = null;

        $updated = DB::transaction(function () use ($id, $validated, $cleanRef, $proofDataUrl, &$errorResponse) {
            $locked = EventBooking::whereKey($id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== 'Awaiting Downpayment') {
                $errorResponse = [
                    'message' => $locked->status === 'Approved'
                        ? 'Your booking is approved, but our staff has not opened downpayment yet. Please finish discussing final details with our team first.'
                        : "Cannot submit downpayment for this booking (current status: {$locked->status}).",
                ];
                return null;
            }

            if ($this->hasDuplicatePaymentReference($validated['payment_method'], $cleanRef, (int) $locked->id)) {
                $errorResponse = [
                    'message' => "The {$validated['payment_method']} reference number '{$cleanRef}' has already been used on another booking. Please double-check your receipt.",
                    'errors' => [
                        'payment_reference' => ['Duplicate payment reference number detected.'],
                    ],
                ];
                return null;
            }

            $locked->payment_method = $validated['payment_method'];
            $locked->payment_reference = $cleanRef;
            $locked->payment_proof = $proofDataUrl;
            $locked->downpayment_submitted_at = now();
            $locked->downpayment_rejection_reason = null;
            $locked->payment_status = 'For Verification';
            $locked->status = 'Downpayment Submitted';
            $locked->save();

            return $locked->fresh();
        });

        if ($errorResponse !== null || !$updated) {
            return response()->json($errorResponse, 422);
        }

        AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? $updated->client_name,
            'user_role' => $isOperator ? ($user?->role ?? 'staff') : 'customer',
            'action' => 'Booking Downpayment Submitted',
            'details' => "Downpayment proof submitted for booking #{$updated->id} via {$updated->payment_method} (Ref: {$updated->payment_reference}).",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Downpayment proof submitted! Our staff will verify your receipt shortly to lock in your slot.',
            'booking' => $updated,
        ]);
    }

    /**
     * Option A Step 5a: Admin/Staff verifies submitted downpayment proof and locks in Confirmed status.
     */
    public function verifyDownpayment(Request $request, $id)
    {
        [$operator, $denied] = $this->authorizeOperator($request, true);
        if ($denied) {
            return $denied;
        }

        $errorResponse = null;

        $booking = DB::transaction(function () use ($id, $operator, &$errorResponse) {
            $locked = EventBooking::whereKey($id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== 'Downpayment Submitted') {
                $errorResponse = [
                    'message' => "Only bookings with a submitted downpayment proof can be verified (current status: {$locked->status}).",
                ];
                return null;
            }

            if (empty($locked->payment_proof) || empty($locked->payment_reference) || empty($locked->payment_method)) {
                $errorResponse = [
                    'message' => 'Payment proof or reference number is missing. Reject and ask the client to re-upload.',
                ];
                return null;
            }

            if ($this->hasDuplicatePaymentReference($locked->payment_method, $this->normalizeReference($locked->payment_reference), (int) $locked->id)) {
                $errorResponse = [
                    'message' => "Duplicate {$locked->payment_method} reference ({$locked->payment_reference}) detected across another active booking. Please reject and inspect.",
                ];
                return null;
            }

            $finalCost = round((float) ($locked->final_cost ?? $locked->estimated_cost), 2);
            $dpAmount = min($finalCost, round((float) $locked->downpayment_amount, 2));
            $remaining = max(0, round($finalCost - $dpAmount, 2));

            $locked->final_cost = $finalCost;
            $locked->amount_paid = $dpAmount;
            $locked->remaining_balance = $remaining;
            $locked->status = 'Confirmed';
            $locked->payment_status = $remaining <= 0 ? 'Fully Paid' : 'Downpayment Paid';
            if ($remaining <= 0) {
                $locked->fully_paid_at = now();
            }
            $locked->downpayment_verified_at = now();
            $locked->downpayment_verified_by = $operator?->name ?? 'Store Staff';
            $locked->downpayment_rejection_reason = null;
            $locked->reviewed_by_name = $operator?->name ?? 'Store Staff';
            $locked->reviewed_by_role = $operator?->role ?? 'staff';
            $locked->reviewed_at = now();
            $locked->save();

            return $locked->fresh();
        });

        if ($errorResponse !== null || !$booking) {
            return response()->json($errorResponse, 422);
        }

        AuditLog::create([
            'user_id' => $operator?->id,
            'user_name' => $operator?->name ?? 'Staff',
            'user_role' => $operator?->role ?? 'staff',
            'action' => 'Booking Downpayment Verified',
            'details' => "Verified ₱" . number_format((float) $booking->amount_paid, 2) . " downpayment ({$booking->payment_method} Ref: {$booking->payment_reference}) for booking #{$booking->id}. Remaining balance: ₱" . number_format((float) $booking->remaining_balance, 2) . ".",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Downpayment verified! Booking #{$booking->id} is now Confirmed.",
            'booking' => $booking,
        ]);
    }

    /**
     * Option A Step 5b: Admin/Staff rejects invalid/blurry/wrong-amount proof and returns booking to Awaiting Downpayment.
     */
    public function rejectDownpayment(Request $request, $id)
    {
        [$operator, $denied] = $this->authorizeOperator($request, true);
        if ($denied) {
            return $denied;
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:5|max:500',
        ]);

        $reason = trim($validated['rejection_reason']);
        $errorResponse = null;

        $booking = DB::transaction(function () use ($id, $reason, $operator, &$errorResponse) {
            $locked = EventBooking::whereKey($id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== 'Downpayment Submitted') {
                $errorResponse = [
                    'message' => "Only bookings awaiting payment verification can be rejected (current status: {$locked->status}).",
                ];
                return null;
            }

            $locked->status = 'Awaiting Downpayment';
            $locked->payment_status = 'Rejected';
            $locked->downpayment_rejection_reason = $reason;
            $locked->reviewed_by_name = $operator?->name ?? 'Store Staff';
            $locked->reviewed_by_role = $operator?->role ?? 'staff';
            $locked->reviewed_at = now();
            $locked->save();

            return $locked->fresh();
        });

        if ($errorResponse !== null || !$booking) {
            return response()->json($errorResponse, 422);
        }

        AuditLog::create([
            'user_id' => $operator?->id,
            'user_name' => $operator?->name ?? 'Staff',
            'user_role' => $operator?->role ?? 'staff',
            'action' => 'Booking Downpayment Rejected',
            'details' => "Rejected downpayment proof for booking #{$booking->id} ({$booking->client_name}). Reason: {$reason}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Downpayment proof rejected. Client can now upload a valid receipt.",
            'booking' => $booking,
        ]);
    }

    /**
     * Option A Step 6: Settle remaining balance and mark Confirmed booking as Completed.
     */
    public function completeBooking(Request $request, $id)
    {
        [$operator, $denied] = $this->authorizeOperator($request, true);
        if ($denied) {
            return $denied;
        }

        $validated = $request->validate([
            'final_payment_method' => 'nullable|in:' . implode(',', self::ALL_PAYMENT_METHODS),
            'final_payment_reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $errorResponse = null;

        $booking = DB::transaction(function () use ($id, $validated, $operator, &$errorResponse) {
            $locked = EventBooking::whereKey($id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== 'Confirmed') {
                $errorResponse = [
                    'message' => "Only Confirmed (downpayment-verified) bookings can be completed and settled (current status: {$locked->status}).",
                ];
                return null;
            }

            $finalCost = round((float) ($locked->final_cost ?? $locked->estimated_cost), 2);
            $remaining = max(0, round($finalCost - (float) ($locked->amount_paid ?? 0), 2));
            $method = $validated['final_payment_method'] ?? 'Cash';
            $ref = $this->normalizeReference($validated['final_payment_reference'] ?? '');

            if ($remaining > 0 && $method !== 'Cash') {
                $alnumCount = strlen(preg_replace('/[^A-Za-z0-9]/', '', $ref));
                if ($alnumCount < 4) {
                    $errorResponse = [
                        'message' => "Please enter the {$method} reference number for the remaining balance settlement.",
                        'errors' => [
                            'final_payment_reference' => ['Reference number is required for non-cash balance settlement.'],
                        ],
                    ];
                    return null;
                }
            }

            if ($remaining > 0) {
                $locked->final_payment_method = $method;
                $locked->final_payment_reference = $ref !== '' ? $ref : null;
            } else {
                $locked->final_payment_method = $locked->final_payment_method ?: $locked->payment_method;
            }

            $locked->final_cost = $finalCost;
            $locked->amount_paid = $finalCost;
            $locked->remaining_balance = 0;
            $locked->payment_status = 'Fully Paid';
            $locked->fully_paid_at = now();
            $locked->status = 'Completed';
            if (array_key_exists('notes', $validated) && trim((string) $validated['notes']) !== '') {
                $locked->notes = trim((string) $validated['notes']);
            }
            $locked->reviewed_by_name = $operator?->name ?? 'Store Staff';
            $locked->reviewed_by_role = $operator?->role ?? 'staff';
            $locked->reviewed_at = now();
            $locked->save();

            return $locked->fresh();
        });

        if ($errorResponse !== null || !$booking) {
            return response()->json($errorResponse, 422);
        }

        AuditLog::create([
            'user_id' => $operator?->id,
            'user_name' => $operator?->name ?? 'Staff',
            'user_role' => $operator?->role ?? 'staff',
            'action' => 'Booking Completed & Settled',
            'details' => "Booking #{$booking->id} completed and fully settled (₱" . number_format((float) $booking->final_cost, 2) . ", final method: " . ($booking->final_payment_method ?: 'Settled') . ").",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Booking #{$booking->id} marked Completed & Fully Paid!",
            'booking' => $booking,
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $booking = EventBooking::findOrFail($id);
        [$user, $isOperator, $denied] = $this->authorizeBookingOwnerOrOperator(
            $request,
            $booking,
            'Access Denied: You can only cancel your own pending booking request.'
        );
        if ($denied) {
            return $denied;
        }

        $reason = trim((string) $request->input('reason', ''));
        $errorResponse = null;

        $updated = DB::transaction(function () use ($id, $isOperator, $user, $reason, &$errorResponse) {
            $locked = EventBooking::whereKey($id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== 'Pending') {
                $errorResponse = [
                    'message' => "Only Pending bookings can be cancelled online (current status: {$locked->status}). Contact Jefferson Alulod at 0994 612 1933 for assistance.",
                    'code' => 422,
                ];
                return null;
            }

            $locked->status = 'Cancelled';
            if ($reason !== '') {
                $locked->downpayment_rejection_reason = $reason;
            }
            $locked->reviewed_by_name = $user?->name ?? $locked->client_name ?? 'Customer';
            $locked->reviewed_by_role = $user?->role ?? 'customer';
            $locked->reviewed_at = now();
            $locked->save();

            return $locked->fresh();
        });

        if ($errorResponse !== null || !$updated) {
            return response()->json(['message' => $errorResponse['message']], $errorResponse['code'] ?? 422);
        }

        if ($isOperator) {
            AuditLog::create([
                'user_id' => $user?->id,
                'user_name' => $user?->name ?? 'Staff',
                'user_role' => $user?->role ?? 'staff',
                'action' => 'Event Booking Cancelled',
                'details' => "Booking #{$updated->id} for {$updated->client_name} was cancelled" . ($reason !== '' ? " ({$reason})" : '') . ".",
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'message' => "Booking #{$updated->id} has been cancelled and the time slot is now open.",
            'booking' => $updated,
        ]);
    }
}
