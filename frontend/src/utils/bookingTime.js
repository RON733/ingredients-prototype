// G Shot Teas — Booking Time Slot Parsing, Formatting & Conflict Detection

export const STORE_TIMEZONE = 'Asia/Manila';
export const DEFAULT_DURATION_MINUTES = 180;
export const MIN_DURATION_MINUTES = 120; // 2 hours minimum
export const MAX_DURATION_MINUTES = 600; // 10 hours maximum
export const PREP_BUFFER_MINUTES = 120;  // 2 hours prep lead time & turnaround buffer
export const MIN_START_MINUTES = 7 * 60; // 7:00 AM
export const MAX_START_MINUTES = 22 * 60; // 10:00 PM
export const SAME_DAY_CUTOFF_START_MINUTES = 20 * 60; // 8:00 PM
export const SAME_DAY_MAX_END_MINUTES = 22 * 60; // 10:00 PM
export const MAX_ADVANCE_DAYS = 365;

export const PRESET_TIME_SLOTS = [
  { startMinutes: 9 * 60, durationHours: 3, tag: 'Morning' },
  { startMinutes: 14 * 60, durationHours: 3, tag: 'Afternoon' },
  { startMinutes: 19 * 60, durationHours: 3, tag: 'Evening' },
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

export const START_TIME_OPTIONS = Array.from({ length: 31 }, (_, idx) => {
  const minutes = 7 * 60 + idx * 30; // 7:00 AM through 10:00 PM
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

const addDaysToDateString = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

export const getStoreDateTimeParts = (nowInput = new Date(), serverClockOffsetMs = 0) => {
  const adjusted = new Date(nowInput.getTime() + (Number.isFinite(serverClockOffsetMs) ? serverClockOffsetMs : 0));
  let dateString;
  let minutes;
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: STORE_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(adjusted);

    const map = {};
    for (const part of parts) {
      if (part.type !== 'literal') map[part.type] = part.value;
    }
    const hour = parseInt(map.hour || '0', 10) % 24;
    const minute = parseInt(map.minute || '0', 10);
    minutes = hour * 60 + minute;
    dateString = `${map.year}-${map.month}-${map.day}`;
  } catch (e) {
    const manilaFallback = new Date(adjusted.getTime() + (8 * 60 + adjusted.getTimezoneOffset()) * 60000);
    const y = manilaFallback.getFullYear();
    const m = String(manilaFallback.getMonth() + 1).padStart(2, '0');
    const d = String(manilaFallback.getDate()).padStart(2, '0');
    minutes = manilaFallback.getHours() * 60 + manilaFallback.getMinutes();
    dateString = `${y}-${m}-${d}`;
  }

  return {
    dateString,
    maxDateString: addDaysToDateString(dateString, MAX_ADVANCE_DAYS),
    minutes,
    timeLabel: formatTimeLabel(minutes),
  };
};

export const evaluateBookingSchedule = (targetDate, slot = null, storeNow = getStoreDateTimeParts()) => {
  const earliestTodayMinutes = storeNow.minutes + PREP_BUFFER_MINUTES;
  const earliestTodayLabel = earliestTodayMinutes < 1440 ? formatTimeLabel(earliestTodayMinutes) : null;
  const base = {
    valid: true,
    isPast: false,
    reason: null,
    nowDate: storeNow.dateString,
    maxDate: storeNow.maxDateString,
    nowMinutes: storeNow.minutes,
    nowLabel: storeNow.timeLabel,
    earliestStartMinutes: targetDate === storeNow.dateString ? earliestTodayMinutes : MIN_START_MINUTES,
    earliestStartLabel: targetDate === storeNow.dateString ? earliestTodayLabel : formatTimeLabel(MIN_START_MINUTES),
  };

  if (!targetDate) {
    if (slot && (slot.startMinutes < MIN_START_MINUTES || slot.startMinutes > MAX_START_MINUTES)) {
      return { ...base, valid: false, reason: 'service_hours' };
    }
    return base;
  }

  if (targetDate < storeNow.dateString) {
    return { ...base, valid: false, isPast: true, reason: 'past_date' };
  }

  if (storeNow.maxDateString && targetDate > storeNow.maxDateString) {
    return { ...base, valid: false, reason: 'too_far' };
  }

  if (slot && (slot.startMinutes < MIN_START_MINUTES || slot.startMinutes > MAX_START_MINUTES)) {
    return { ...base, valid: false, reason: 'service_hours' };
  }

  if (targetDate === storeNow.dateString) {
    if (earliestTodayMinutes >= SAME_DAY_CUTOFF_START_MINUTES) {
      return { ...base, valid: false, isPast: true, reason: 'same_day_closed' };
    }

    if (slot) {
      const startMin = slot.startMinutes ?? slot.start_minutes;
      const endMin = slot.endMinutes ?? slot.end_minutes;
      if ((Number.isFinite(endMin) && endMin <= storeNow.minutes) || (Number.isFinite(startMin) && startMin <= storeNow.minutes)) {
        return { ...base, valid: false, isPast: true, reason: 'past_time' };
      }
      if ((Number.isFinite(startMin) && startMin >= SAME_DAY_CUTOFF_START_MINUTES) || (Number.isFinite(endMin) && endMin > SAME_DAY_MAX_END_MINUTES)) {
        return { ...base, valid: false, reason: 'same_day_night_cutoff' };
      }
      if (Number.isFinite(startMin) && startMin < earliestTodayMinutes) {
        return { ...base, valid: false, isPast: true, reason: 'prep_time' };
      }
    }
  }

  return base;
};

export const isSlotPastForDate = (targetDate, slot, storeNow = getStoreDateTimeParts()) => {
  const res = evaluateBookingSchedule(targetDate, slot, storeNow);
  return {
    ...res,
    isPast: !res.valid,
  };
};

export const formatScheduleErrorMessage = (evalResult, slot = null, dateLabel = '') => {
  if (!evalResult || evalResult.valid) return '';
  const rangeLabel = slot?.rangeLabel || 'the selected time';
  switch (evalResult.reason) {
    case 'past_date':
      return `${dateLabel || 'The selected date'} has already passed (today is ${evalResult.nowDate}). Please choose today or a future date.`;
    case 'too_far':
      return `Bookings can only be scheduled up to 1 year in advance (on or before ${evalResult.maxDate}).`;
    case 'service_hours':
      return 'Event catering start times must be between 7:00 AM and 10:00 PM.';
    case 'same_day_closed':
      return `Same-day bookings are closed from 6:00 PM onward because we require 2 hours of preparation time and do not accept same-day bookings from 8:00 PM to 12:00 AM (current time: ${evalResult.nowLabel}). Please choose tomorrow or a future date.`;
    case 'same_day_night_cutoff':
      return `Same-day bookings between 8:00 PM and 12:00 AM are not allowed. Please choose an earlier time ending by 10:00 PM, or book for tomorrow or a future date.`;
    case 'prep_time':
      return `We require at least 2 hours of preparation time for same-day bookings. At ${evalResult.nowLabel}, the earliest available start time today is ${evalResult.earliestStartLabel || 'a later slot'}.`;
    case 'past_time':
    default:
      return `You can't book ${rangeLabel} for today anymore because it is already ${evalResult.nowLabel}. Please choose a later time or another date.`;
  }
};

export const slotsOverlap = (slotA, slotB, bufferMinutes = 0) => {
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
  return s1 < (e2 + bufferMinutes) && s2 < (e1 + bufferMinutes);
};
