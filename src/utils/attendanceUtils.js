import { ATTENDANCE_STATUS } from "../constants/statusConstants";

export const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/**
 * Format a Date or ISO string into 12-hour AM/PM time
 */
export function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format minutes into "Xh Ym" string
 */
export function formatMinutes(minutes) {
  if (!minutes || minutes <= 0) return "0h 0m";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateStr(d) {
  if (!d) return "";
  const dateObj = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return "";
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Calculate leave days between start and end date inclusive
 */
export function calculateLeaveDays(startDate, endDate, isHalfDay = false) {
  if (isHalfDay) return 0.5;
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  if (end < start) return 0;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Generate 35 or 42 calendar grid cells for a given month/year
 */
export function generateCalendarCells(year, month) {
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const prevDate = new Date(year, month - 1, dayNum);
    cells.push({
      dateStr: formatDateStr(prevDate),
      dayNum,
      isCurrentMonth: false,
      dateObj: prevDate,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    cells.push({
      dateStr: formatDateStr(dateObj),
      dayNum: d,
      isCurrentMonth: true,
      dateObj,
    });
  }

  // Next month leading days
  const totalSlots = cells.length > 35 ? 42 : 35;
  const trailingCount = totalSlots - cells.length;
  for (let t = 1; t <= trailingCount; t++) {
    const nextDate = new Date(year, month + 1, t);
    cells.push({
      dateStr: formatDateStr(nextDate),
      dayNum: t,
      isCurrentMonth: false,
      dateObj: nextDate,
    });
  }

  return cells;
}

/**
 * Single Source of Truth: Resolve Attendance Status and Priority for a given Date
 * Priority:
 * 1. Actual Check-In Record (Present / Late / Half Day / Present - Holiday)
 * 2. Approved Leave / On Leave
 * 3. Restaurant Closed
 * 4. Special Off / Comp Off
 * 5. Festival / Public / Company Holiday
 * 6. Recurring Weekly Off
 * 7. Explicit Absent
 * 8. No Record
 */
export function resolveAttendancePriority({
  record,
  holidayInfo,
  recurringWeeklyOff,
}) {
  const holidayType = holidayInfo?.type || (recurringWeeklyOff ? "WEEKLY_OFF" : null);
  const holidayName = holidayInfo?.name || (recurringWeeklyOff?.name || null);

  // 1. Actual Check-In
  if (record?.checkInTime) {
    const isLate = record.isLate || record.status === "LATE";
    const isHalf = record.status === "HALF_DAY";

    if (isLate) {
      return {
        statusKey: "LATE",
        statusConfig: ATTENDANCE_STATUS.LATE,
        isLate: true,
        isHalf: false,
        isPresent: true,
        holidayName,
        holidayType,
        displayText: holidayName ? "Late (Holiday)" : "Late",
      };
    }
    if (isHalf) {
      return {
        statusKey: "HALF_DAY",
        statusConfig: ATTENDANCE_STATUS.HALF_DAY,
        isLate: false,
        isHalf: true,
        isPresent: true,
        holidayName,
        holidayType,
        displayText: holidayName ? "Half Day (Holiday)" : "Half Day",
      };
    }
    return {
      statusKey: "PRESENT",
      statusConfig: ATTENDANCE_STATUS.PRESENT,
      isLate: false,
      isHalf: false,
      isPresent: true,
      holidayName,
      holidayType,
      displayText: holidayName ? "Present (Holiday)" : "Present",
    };
  }

  // 2. Approved Employee Leave
  if (record?.status === "LEAVE" || record?.status === "ON_LEAVE") {
    return {
      statusKey: "ON_LEAVE",
      statusConfig: ATTENDANCE_STATUS.ON_LEAVE,
      isPresent: false,
      holidayName,
      holidayType,
      displayText: "On Leave",
    };
  }

  // 3. Restaurant Closed
  if (holidayType === "RESTAURANT_CLOSED") {
    return {
      statusKey: "RESTAURANT_CLOSED",
      statusConfig: ATTENDANCE_STATUS.RESTAURANT_CLOSED,
      isPresent: false,
      holidayName: holidayName || "RESTAURANT CLOSED",
      holidayType,
      displayText: "Closed",
    };
  }

  // 4. Special Off / Comp Off
  if (holidayType === "SPECIAL_OFF") {
    return {
      statusKey: "SPECIAL_OFF",
      statusConfig: ATTENDANCE_STATUS.SPECIAL_OFF,
      isPresent: false,
      holidayName: holidayName || "COMP OFF",
      holidayType,
      displayText: "Special Off",
    };
  }

  // 5. Festival / Public / Company Holiday
  if (holidayInfo && holidayType !== "WEEKLY_OFF") {
    return {
      statusKey: "HOLIDAY",
      statusConfig: ATTENDANCE_STATUS.HOLIDAY,
      isPresent: false,
      holidayName,
      holidayType,
      displayText: "Holiday",
    };
  }

  // 6. Recurring Weekly Off
  if (holidayType === "WEEKLY_OFF" || recurringWeeklyOff) {
    return {
      statusKey: "WEEKLY_OFF",
      statusConfig: ATTENDANCE_STATUS.WEEKLY_OFF,
      isPresent: false,
      holidayName: holidayName || "WEEKLY OFF",
      holidayType: "WEEKLY_OFF",
      displayText: "Weekly Off",
    };
  }

  // 7. Explicit Absent
  if (record?.status === "ABSENT") {
    return {
      statusKey: "ABSENT",
      statusConfig: ATTENDANCE_STATUS.ABSENT,
      isPresent: false,
      holidayName: null,
      holidayType: null,
      displayText: "Absent",
    };
  }

  // 8. No Record
  return {
    statusKey: "NO_RECORD",
    statusConfig: ATTENDANCE_STATUS.NO_RECORD,
    isPresent: false,
    holidayName: null,
    holidayType: null,
    displayText: "No Record",
  };
}
