// G Shot Teas — Booking Time Slot Parsing, Formatting & Conflict Detection

export const DEFAULT_DURATION_MINUTES = 180;
export const MIN_DURATION_MINUTES = 30;
export const MAX_DURATION_MINUTES = 840; // 14 hours

export const PRESET_TIME_SLOTS = [
  { startMinutes: 9 * 60, durationHours: 3, tag: 'Morning' },
  { startMinutes: 10 * 60, durationHours: 3, tag: 'Late Morning' },
  { startMinutes: 13 * 60, durationHours: 3, tag: 'Early Afternoon' },
  { startMinutes: 14 * 60, durationHours: 3, tag: 'Afternoon' },
  { startMinutes: 17 * 60, durationHours: 3, tag: 'Evening' },
  { startMinutes: 18 * 60, durationHours: 3, tag: 'Night' },
];

export const DURATION_HOUR_OPTIONS = [2, 3, 4, 5, 6];

export const formatTimeLabel = (minutes) => {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(wrapped / 60);
  const minute = wrapped % 60;
  const meridiem = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${meridiem}`;
};

export const buildSlotFromMinutes = (startMinutes, endMinutes) => {
  const durationMinutes = endMinutes - startMinutes;
  const rangeLabel = `${formatTimeLabel(startMinutes)} – ${formatTimeLabel(endMinutes)}`;
  const hours = durationMinutes / 60;
  let durText;
  if (Math.abs(hours - Math.round(hours)) < 0.001) {
    const rounded = Math.round(hours);
    durText = rounded === 1 ? '1 Hour' : `${rounded} Hours`;
  } else {
    durText = `${Number(hours.toFixed(1))} Hours`;
  }
  return {
    startMinutes,
    endMinutes,
    durationMinutes,
    rangeLabel,
    label: `${rangeLabel} (${durText})`,
  };
};

export const START_TIME_OPTIONS = Array.from({ length: 29 }, (_, idx) => {
  const minutes = 7 * 60 + idx * 30; // 7:00 AM through 9:00 PM
  return {
    minutes,
    label: formatTimeLabel(minutes),
  };
});

const parseSingleTime = (token, allowBareHour = false) => {
  const clean = String(token || '').trim();
  const match = clean.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;

  const hour = parseInt(match[1], 10);
  const hasMinutes = match[2] !== undefined && match[2] !== '';
  const minute = hasMinutes ? parseInt(match[2], 10) : 0;
  const meridiem = match[3] ? match[3].toLowerCase() : null;

  if (minute < 0 || minute > 59) return null;

  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    const hour24 = (hour % 12) + (meridiem === 'pm' ? 12 : 0);
    return {
      minutes: hour24 * 60 + minute,
      meridiem,
    };
  }

  if (!hasMinutes && !allowBareHour) {
    return null;
  }

  if (hour < 0 || hour > 23) return null;
  return {
    minutes: hour * 60 + minute,
    meridiem: null,
  };
};

export const parseBookingTime = (raw, defaultDurationMinutes = DEFAULT_DURATION_MINUTES) => {
  let text = String(raw || '').trim();
  if (!text || text.toUpperCase() === 'TBD') {
    return null;
  }

  let hintDurationMinutes = null;
  const durMatch = text.match(/\(\s*(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\s*\)\s*$/i);
  if (durMatch) {
    const parsedHours = parseFloat(durMatch[1]);
    if (Number.isFinite(parsedHours) && parsedHours > 0) {
      const candidate = Math.round(parsedHours * 60);
      if (candidate >= MIN_DURATION_MINUTES && candidate <= MAX_DURATION_MINUTES) {
        hintDurationMinutes = candidate;
      }
    }
    text = text.slice(0, -durMatch[0].length).trim();
  }

  if (!text) return null;

  const normalized = text
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  if (/\s*(?:-|\bto\b)\s*/i.test(normalized)) {
    const parts = normalized.split(/\s*(?:-|\bto\b)\s*/i);
    if (parts.length !== 2) return null;

    const startStr = parts[0].trim();
    const endStr = parts[1].trim();

    const endParsed = parseSingleTime(endStr, false);
    if (!endParsed) return null;

    let startParsed = parseSingleTime(startStr, false);
    if (!startParsed && endParsed.meridiem) {
      const candidateSame = parseSingleTime(`${startStr} ${endParsed.meridiem}`, false);
      if (candidateSame && candidateSame.minutes < endParsed.minutes) {
        startParsed = candidateSame;
      } else {
        const opposite = endParsed.meridiem === 'pm' ? 'am' : 'pm';
        const candidateOpposite = parseSingleTime(`${startStr} ${opposite}`, false);
        if (candidateOpposite) {
          startParsed = candidateOpposite;
        }
      }
    }

    if (!startParsed) return null;

    const startMinutes = startParsed.minutes;
    let endMinutes = endParsed.minutes;

    if (endMinutes <= startMinutes) {
      const isOvernight = startMinutes >= 12 * 60 && (
        endParsed.meridiem === 'am' || endMinutes <= 6 * 60
      );
      if (isOvernight) {
        endMinutes += 1440;
      } else {
        return null;
      }
    }

    const durationMinutes = endMinutes - startMinutes;
    if (durationMinutes < MIN_DURATION_MINUTES || durationMinutes > MAX_DURATION_MINUTES) {
      return null;
    }

    return buildSlotFromMinutes(startMinutes, endMinutes);
  }

  const single = parseSingleTime(normalized, false);
  if (!single) return null;

  const durationMinutes = (
    hintDurationMinutes !== null &&
    hintDurationMinutes >= MIN_DURATION_MINUTES &&
    hintDurationMinutes <= MAX_DURATION_MINUTES
  )
    ? hintDurationMinutes
    : defaultDurationMinutes;

  return buildSlotFromMinutes(single.minutes, single.minutes + durationMinutes);
};

export const slotsOverlap = (slotA, slotB) => {
  if (!slotA || !slotB) return false;
  const s1 = slotA.startMinutes ?? slotA.start_minutes;
  const e1 = slotA.endMinutes ?? slotA.end_minutes;
  const s2 = slotB.startMinutes ?? slotB.start_minutes;
  const e2 = slotB.endMinutes ?? slotB.end_minutes;
  if (
    !Number.isFinite(s1) ||
    !Number.isFinite(e1) ||
    !Number.isFinite(s2) ||
    !Number.isFinite(e2)
  ) {
    return false;
  }
  return s1 < e2 && s2 < e1;
};
