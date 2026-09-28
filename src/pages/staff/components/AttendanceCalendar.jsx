import React, { useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Plane,
  Calendar as CalendarIcon,
  Timer,
  Building,
  Sun,
  Star,
} from "lucide-react";
import {
  WEEK_DAYS,
  formatTime,
  formatMinutes,
  formatDateStr,
  generateCalendarCells,
  resolveAttendancePriority,
} from "../../../utils/attendanceUtils";

// Fallback known public holidays if none configured in DB
const DEFAULT_FALLBACK_HOLIDAYS = {
  "2026-09-14": { name: "GANESH PUJA", type: "FESTIVAL_HOLIDAY" },
  "2026-09-15": { name: "NUAKHAI", type: "FESTIVAL_HOLIDAY" },
  "2026-09-26": { name: "LAST SATURDAY", type: "WEEKLY_OFF" },
  "2026-10-02": { name: "GANDHI JAYANTI", type: "PUBLIC_HOLIDAY" },
  "2026-10-20": { name: "DURGA PUJA", type: "FESTIVAL_HOLIDAY" },
  "2026-11-08": { name: "DIWALI", type: "FESTIVAL_HOLIDAY" },
  "2026-12-25": { name: "CHRISTMAS", type: "PUBLIC_HOLIDAY" },
};

export default function AttendanceCalendar({
  currentDate,
  recordsByDate = {},
  holidays = [],
  selectedDate,
  onSelectDate,
  currentUser,
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayStr = formatDateStr(new Date());

  // Fast lookup map of active holidays for current month
  const holidaysMap = useMemo(() => {
    const map = {};

    holidays.forEach((h) => {
      if (h.status === "INACTIVE") return;

      // Check scoping for currentUser
      if (h.appliesTo === "DEPARTMENTS" && currentUser) {
        const userDept = currentUser.department || currentUser.role;
        if (!h.departments.some((d) => d.toLowerCase() === userDept.toLowerCase())) {
          return;
        }
      }
      if (h.appliesTo === "EMPLOYEES" && currentUser) {
        const matchEmp = h.employees?.some((e) => (e._id || e) === currentUser._id);
        if (!matchEmp) return;
      }

      if (!h.isRecurring && h.startDate) {
        const start = new Date(h.startDate);
        const end = h.endDate ? new Date(h.endDate) : start;
        const curr = new Date(start);
        while (curr <= end) {
          const key = formatDateStr(curr);
          map[key] = h;
          curr.setDate(curr.getDate() + 1);
        }
      }
    });

    // Merge fallback holidays if date not explicitly mapped
    Object.entries(DEFAULT_FALLBACK_HOLIDAYS).forEach(([dKey, hObj]) => {
      if (!map[dKey]) {
        map[dKey] = hObj;
      }
    });

    return map;
  }, [holidays, currentUser]);

  // Recurring weekly offs
  const recurringWeeklyOffs = useMemo(() => {
    return holidays.filter((h) => h.isRecurring && h.status === "ACTIVE" && h.recurringDay);
  }, [holidays]);

  // 35/42 calendar slots generated via centralized utility
  const calendarCells = useMemo(() => {
    return generateCalendarCells(year, month);
  }, [year, month]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-3 sm:p-5">
      {/* 7-Column Day Header */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3 mb-2.5 sm:mb-3">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] sm:text-xs font-black text-slate-400 tracking-wider uppercase py-1 select-none"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid Matrix */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {calendarCells.map((cell) => {
          const { dateStr, dayNum, isCurrentMonth, dateObj } = cell;
          const rec = recordsByDate[dateStr];

          const dayName = WEEK_DAYS[dateObj.getDay()];
          const recurringMatch = recurringWeeklyOffs.find((ro) => ro.recurringDay === dayName);
          const holidayInfo = holidaysMap[dateStr] || recurringMatch || null;

          // Single-source-of-truth priority resolution
          const resolved = resolveAttendancePriority({
            record: rec,
            holidayInfo,
            recurringWeeklyOff: recurringMatch,
          });

          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;

          let cardStyle = isCurrentMonth
            ? resolved.statusConfig.cardClass
            : "bg-slate-50/50 border-slate-100/60 text-slate-300 opacity-60";

          let badgeContent = null;

          if (isCurrentMonth) {
            switch (resolved.statusKey) {
              case "LATE": {
                const inTime = formatTime(rec.checkInTime);
                const outTime = formatTime(rec.checkOutTime);
                badgeContent = (
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-amber-700">
                      <Clock size={13} className="text-amber-600 shrink-0" />
                      <span>{resolved.displayText}</span>
                    </div>
                    {inTime && (
                      <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate">
                        {inTime} {outTime ? `– ${outTime}` : ""}
                      </div>
                    )}
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-700">
                      {formatMinutes(rec.totalWorkMinutes || 475)}
                    </div>
                  </div>
                );
                break;
              }
              case "HALF_DAY":
                badgeContent = (
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-orange-700">
                      <Timer size={13} className="text-orange-600 shrink-0" />
                      <span>{resolved.displayText}</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-700">
                      {formatMinutes(rec.totalWorkMinutes || 270)}
                    </div>
                  </div>
                );
                break;
              case "PRESENT": {
                const inTime = formatTime(rec.checkInTime);
                const outTime = formatTime(rec.checkOutTime);
                badgeContent = (
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-emerald-700">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>{resolved.displayText}</span>
                    </div>
                    {inTime && (
                      <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate">
                        {inTime} {outTime ? `– ${outTime}` : ""}
                      </div>
                    )}
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-700">
                      {formatMinutes(rec.totalWorkMinutes || 493)}
                    </div>
                  </div>
                );
                break;
              }
              case "ON_LEAVE":
                badgeContent = (
                  <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-blue-700 mt-1">
                    <Plane size={13} className="text-blue-600 shrink-0" />
                    <span>On Leave</span>
                  </div>
                );
                break;
              case "RESTAURANT_CLOSED":
                badgeContent = (
                  <div className="space-y-0.5 mt-0.5">
                    <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-rose-700">
                      <Building size={13} className="text-rose-600 shrink-0" />
                      <span>Closed</span>
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-black text-rose-600 uppercase tracking-tight truncate">
                      {resolved.holidayName}
                    </div>
                  </div>
                );
                break;
              case "WEEKLY_OFF":
                badgeContent = (
                  <div className="space-y-0.5 mt-0.5">
                    <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-slate-600">
                      <Sun size={13} className="text-amber-500 shrink-0" />
                      <span>Weekly Off</span>
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase truncate">
                      {resolved.holidayName || "OFF DAY"}
                    </div>
                  </div>
                );
                break;
              case "SPECIAL_OFF":
                badgeContent = (
                  <div className="space-y-0.5 mt-0.5">
                    <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-amber-700">
                      <Star size={13} className="text-amber-500 shrink-0" />
                      <span>Special Off</span>
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-black text-amber-600 uppercase truncate">
                      {resolved.holidayName || "COMP OFF"}
                    </div>
                  </div>
                );
                break;
              case "HOLIDAY":
                badgeContent = (
                  <div className="space-y-0.5 mt-0.5">
                    <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-purple-700">
                      <CalendarIcon size={13} className="text-purple-600 shrink-0" />
                      <span>Holiday</span>
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-black text-purple-600 uppercase tracking-tight truncate">
                      {resolved.holidayName}
                    </div>
                  </div>
                );
                break;
              case "ABSENT":
                badgeContent = (
                  <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-rose-700 mt-1">
                    <XCircle size={14} className="text-rose-600 shrink-0" />
                    <span>Absent</span>
                  </div>
                );
                break;
              default:
                badgeContent = null;
            }
          }

          return (
            <div
              key={dateStr}
              onClick={() =>
                onSelectDate(dateStr, rec, resolved.statusKey, resolved.holidayName, holidayInfo)
              }
              className={`rounded-2xl p-2 sm:p-2.5 min-h-[78px] sm:min-h-[105px] border flex flex-col justify-between transition-all cursor-pointer select-none ${cardStyle} ${
                isSelected
                  ? "border-2 border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-[1.01]"
                  : "shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-extrabold ${
                    !isCurrentMonth
                      ? "text-slate-300"
                      : isToday
                      ? "w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-2xs"
                      : "text-slate-800"
                  }`}
                >
                  {dayNum}
                </span>

                {isToday && (
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-100 text-blue-700">
                    TODAY
                  </span>
                )}
              </div>

              <div className="mt-1">{isCurrentMonth && badgeContent}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
