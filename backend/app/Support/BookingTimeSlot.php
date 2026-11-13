<?php

namespace App\Support;

class BookingTimeSlot
{
    public const DEFAULT_DURATION_MINUTES = 180;
    public const MIN_DURATION_MINUTES = 30;
    public const MAX_DURATION_MINUTES = 840; // 14 hours

    /**
     * Parse a booking time string (e.g. "2:00 PM – 5:00 PM (3 Hours)", "14:00 - 17:00", "2pm to 5pm", "1:00 PM")
     * into normalized minute offsets and canonical display strings.
     *
     * @return array{start_minutes: int, end_minutes: int, duration_minutes: int, range_label: string, label: string}|null
     */
    public static function parse(?string $raw, int $defaultDurationMinutes = self::DEFAULT_DURATION_MINUTES): ?array
    {
        $text = trim((string) $raw);
        if ($text === '' || strcasecmp($text, 'TBD') === 0) {
            return null;
        }

        // Extract optional trailing "(3 Hours)" / "(2.5 hrs)" duration hint
        $hintDurationMinutes = null;
        if (preg_match('/\(\s*(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\s*\)\s*$/i', $text, $durMatch)) {
            $parsedHours = (float) $durMatch[1];
            if ($parsedHours > 0) {
                $candidateDuration = (int) round($parsedHours * 60);
                if ($candidateDuration >= self::MIN_DURATION_MINUTES && $candidateDuration <= self::MAX_DURATION_MINUTES) {
                    $hintDurationMinutes = $candidateDuration;
                }
            }
            $text = trim(substr($text, 0, -strlen($durMatch[0])));
        }

        if ($text === '') {
            return null;
        }

        // Normalize unicode dashes to ASCII hyphen
        $normalized = str_replace(["\u{2013}", "\u{2014}", "\u{2212}"], '-', $text);
        $normalized = preg_replace('/\s+/', ' ', trim($normalized));

        // Split into start/end if range separator is present ("-" or "to")
        if (preg_match('/\s*(?:-|\bto\b)\s*/i', $normalized)) {
            $parts = preg_split('/\s*(?:-|\bto\b)\s*/i', $normalized);
            if (!is_array($parts) || count($parts) !== 2) {
                return null;
            }

            $startStr = trim($parts[0]);
            $endStr = trim($parts[1]);

            $endParsed = self::parseSingleTime($endStr, false);
            if ($endParsed === null) {
                return null;
            }

            $startParsed = self::parseSingleTime($startStr, false);
            if ($startParsed === null && $endParsed['meridiem'] !== null) {
                // Allow shorthand ranges like "2 - 5 PM" or "10 - 1 PM"
                $candidateSame = self::parseSingleTime($startStr . ' ' . $endParsed['meridiem'], false);
                if ($candidateSame !== null && $candidateSame['minutes'] < $endParsed['minutes']) {
                    $startParsed = $candidateSame;
                } else {
                    $oppositeMeridiem = $endParsed['meridiem'] === 'pm' ? 'am' : 'pm';
                    $candidateOpposite = self::parseSingleTime($startStr . ' ' . $oppositeMeridiem, false);
                    if ($candidateOpposite !== null) {
                        $startParsed = $candidateOpposite;
                    }
                }
            }

            if ($startParsed === null) {
                return null;
            }

            $startMinutes = $startParsed['minutes'];
            $endMinutes = $endParsed['minutes'];

            if ($endMinutes <= $startMinutes) {
                // Allow PM -> early AM overnight ranges like "10:00 PM - 1:00 AM"
                $isOvernight = $startMinutes >= 12 * 60 && (
                    $endParsed['meridiem'] === 'am' || $endMinutes <= 6 * 60
                );
                if ($isOvernight) {
                    $endMinutes += 1440;
                } else {
                    return null;
                }
            }

            $durationMinutes = $endMinutes - $startMinutes;
            if ($durationMinutes < self::MIN_DURATION_MINUTES || $durationMinutes > self::MAX_DURATION_MINUTES) {
                return null;
            }

            return self::buildResult($startMinutes, $endMinutes);
        }

        // Single start time (e.g. "2:00 PM" or "14:00")
        $single = self::parseSingleTime($normalized, false);
        if ($single === null) {
            return null;
        }

        $durationMinutes = $hintDurationMinutes ?? $defaultDurationMinutes;
        if ($durationMinutes < self::MIN_DURATION_MINUTES || $durationMinutes > self::MAX_DURATION_MINUTES) {
            $durationMinutes = self::DEFAULT_DURATION_MINUTES;
        }

        $startMinutes = $single['minutes'];
        $endMinutes = $startMinutes + $durationMinutes;

        return self::buildResult($startMinutes, $endMinutes);
    }

    /**
     * Check whether two parsed time slots overlap.
     */
    public static function overlaps(array $slotA, array $slotB): bool
    {
        return $slotA['start_minutes'] < $slotB['end_minutes']
            && $slotB['start_minutes'] < $slotA['end_minutes'];
    }

    public static function formatTime(int $minutes): string
    {
        $wrapped = (($minutes % 1440) + 1440) % 1440;
        $hour24 = intdiv($wrapped, 60);
        $minute = $wrapped % 60;
        $meridiem = $hour24 >= 12 ? 'PM' : 'AM';
        $hour12 = $hour24 % 12;
        if ($hour12 === 0) {
            $hour12 = 12;
        }

        return sprintf('%d:%02d %s', $hour12, $minute, $meridiem);
    }

    private static function buildResult(int $startMinutes, int $endMinutes): array
    {
        $durationMinutes = $endMinutes - $startMinutes;
        $rangeLabel = self::formatTime($startMinutes) . ' – ' . self::formatTime($endMinutes);

        $hours = $durationMinutes / 60;
        if (abs($hours - round($hours)) < 0.001) {
            $rounded = (int) round($hours);
            $durText = $rounded === 1 ? '1 Hour' : "{$rounded} Hours";
        } else {
            $formattedHours = rtrim(rtrim(number_format($hours, 1, '.', ''), '0'), '.');
            $durText = "{$formattedHours} Hours";
        }

        return [
            'start_minutes' => $startMinutes,
            'end_minutes' => $endMinutes,
            'duration_minutes' => $durationMinutes,
            'range_label' => $rangeLabel,
            'label' => "{$rangeLabel} ({$durText})",
        ];
    }

    /**
     * @return array{minutes: int, meridiem: ?string}|null
     */
    private static function parseSingleTime(string $token, bool $allowBareHour): ?array
    {
        $token = trim($token);
        if (!preg_match('/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/i', $token, $m)) {
            return null;
        }

        $hour = (int) $m[1];
        $hasMinutes = isset($m[2]) && $m[2] !== '';
        $minute = $hasMinutes ? (int) $m[2] : 0;
        $meridiem = isset($m[3]) && $m[3] !== '' ? strtolower($m[3]) : null;

        if ($minute < 0 || $minute > 59) {
            return null;
        }

        if ($meridiem !== null) {
            if ($hour < 1 || $hour > 12) {
                return null;
            }
            $hour24 = ($hour % 12) + ($meridiem === 'pm' ? 12 : 0);
            return [
                'minutes' => ($hour24 * 60) + $minute,
                'meridiem' => $meridiem,
            ];
        }

        // Without AM/PM, require explicit minutes (e.g. 14:00 or 09:30) unless bare hour is explicitly permitted
        if (!$hasMinutes && !$allowBareHour) {
            return null;
        }

        if ($hour < 0 || $hour > 23) {
            return null;
        }

        return [
            'minutes' => ($hour * 60) + $minute,
            'meridiem' => null,
        ];
    }
}
