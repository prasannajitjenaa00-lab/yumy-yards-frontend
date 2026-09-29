import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Clock,
  Calendar as CalendarIcon,
  History,
  ChevronLeft,
  ChevronRight,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Pause,
  RefreshCw,
  CalendarCheck,
  Info,
} from "lucide-react";
import {
  getMyAttendanceStatus,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getAttendanceHistory,
} from "../../services/attendanceService";
import { getHolidays } from "../../services/holidayService";
import { formatDateStr } from "../../utils/attendanceUtils";

const STATUS_COLORS = {
  PRESENT: { bg: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-50 border-emerald-200", label: "Present" },
  ABSENT: { bg: "bg-rose-500", text: "text-rose-700", light: "bg-rose-50 border-rose-200", label: "Absent" },
  LATE: { bg: "bg-amber-500", text: "text-amber-700", light: "bg-amber-50 border-amber-200", label: "Late" },
  ON_LEAVE: { bg: "bg-blue-500", text: "text-blue-700", light: "bg-blue-50 border-blue-200", label: "On Leave" },
  LEAVE: { bg: "bg-blue-500", text: "text-blue-700", light: "bg-blue-50 border-blue-200", label: "On Leave" },
  HOLIDAY: { bg: "bg-purple-500", text: "text-purple-700", light: "bg-purple-50 border-purple-200", label: "Holiday" },
  WEEKLY_OFF: { bg: "bg-slate-400", text: "text-slate-700", light: "bg-slate-100 border-slate-200", label: "Weekly Off" },
};

export default function MobileAttendance() {
  const { user } = useSelector((s) => s.auth);

  // Active view: "calendar" | "history"
  const [activeTab, setActiveTab] = useState("calendar");

  // Today status state
  const [myStatus, setMyStatus] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Calendar month state
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Selected date details
  const todayStr = formatDateStr(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  // Month records & holidays
  const [historyRecords, setHistoryRecords] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Today Status
  const loadMyStatus = useCallback(async () => {
    try {
      const res = await getMyAttendanceStatus();
      setMyStatus(res?.data?.data || null);
    } catch (e) {
      /* ignore */
    }
  }, []);

  // 2. Fetch Month Data
  const loadMonthData = useCallback(async () => {
    setLoading(true);
    try {
      const y = currentMonthDate.getFullYear();
      const m = currentMonthDate.getMonth();
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);

      const fromStr = formatDateStr(firstDay);
      const toStr = formatDateStr(lastDay);

      const [histRes, holRes] = await Promise.allSettled([
        getAttendanceHistory({ from: fromStr, to: toStr, limit: 100 }),
        getHolidays({ from: fromStr, to: toStr }),
      ]);

      if (histRes.status === "fulfilled" && histRes.value?.data?.data) {
        setHistoryRecords(histRes.value.data.data);
      }
      if (holRes.status === "fulfilled" && holRes.value?.data?.data) {
        setHolidays(holRes.value.data.data);
      }
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [currentMonthDate]);

  useEffect(() => {
    loadMyStatus();
  }, [loadMyStatus]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  // Actions
  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await checkIn();
      toast.success("Checked in successfully!");
      await loadMyStatus();
      await loadMonthData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check in");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await checkOut();
      toast.success("Checked out successfully!");
      await loadMyStatus();
      await loadMonthData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check out");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBreak = async () => {
    setActionLoading(true);
    try {
      await startBreak();
      toast.info("Break started");
      await loadMyStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start break");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setActionLoading(true);
    try {
      await endBreak();
      toast.success("Break ended");
      await loadMyStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to end break");
    } finally {
      setActionLoading(false);
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  // Build calendar matrix
  const calendarDays = useMemo(() => {
    const y = currentMonthDate.getFullYear();
    const m = currentMonthDate.getMonth();
    const firstDayIndex = new Date(y, m, 1).getDay(); // 0 is Sun
    const totalDays = new Date(y, m + 1, 0).getDate();

    // Map records by date string YYYY-MM-DD
    const recMap = {};
    historyRecords.forEach((r) => {
      const dStr = formatDateStr(new Date(r.date));
      recMap[dStr] = r;
    });

    const holMap = {};
    holidays.forEach((h) => {
      const dStr = formatDateStr(new Date(h.date));
      holMap[dStr] = h;
    });

    const days = [];
    // Adjust for Monday first (0 = Mon, 6 = Sun)
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    for (let i = 0; i < offset; i++) {
      days.push({ empty: true, id: `empty-${i}` });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dObj = new Date(y, m, d);
      const dStr = formatDateStr(dObj);
      const isSunday = dObj.getDay() === 0;
      const rec = recMap[dStr];
      const hol = holMap[dStr];

      let status = "NO_RECORD";
      if (rec) {
        status = rec.status;
      } else if (hol) {
        status = "HOLIDAY";
      } else if (isSunday) {
        status = "WEEKLY_OFF";
      }

      days.push({
        dayNum: d,
        dateStr: dStr,
        record: rec || null,
        holiday: hol || null,
        status,
        isToday: dStr === todayStr,
      });
    }

    return days;
  }, [currentMonthDate, historyRecords, holidays, todayStr]);

  // Selected date record details
  const selectedRecord = useMemo(() => {
    const fromHistory = historyRecords.find((r) => formatDateStr(new Date(r.date)) === selectedDateStr);
    if (fromHistory) return fromHistory;
    if (selectedDateStr === todayStr && myStatus?.attendance) {
      return myStatus.attendance;
    }
    return null;
  }, [selectedDateStr, historyRecords, todayStr, myStatus]);

  const selectedHoliday = useMemo(() => {
    return holidays.find((h) => formatDateStr(new Date(h.date)) === selectedDateStr);
  }, [selectedDateStr, holidays]);

  // Format today's status card fields
  const currentStatus = myStatus?.currentStatus || "NOT_CHECKED_IN";
  const attRec = myStatus?.attendance;

  const checkInDisplay = attRec?.checkInTime
    ? new Date(attRec.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  const checkOutDisplay = attRec?.checkOutTime
    ? new Date(attRec.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  const workHoursDisplay = attRec?.totalWorkMinutes
    ? `${Math.floor(attRec.totalWorkMinutes / 60)}h ${attRec.totalWorkMinutes % 60}m`
    : attRec?.isCheckedIn && attRec?.checkInTime
    ? `${Math.max(1, Math.floor((Date.now() - new Date(attRec.checkInTime).getTime()) / 3600000))}h (running)`
    : "--";

  const breakMinutesDisplay = attRec?.totalBreakMinutes ? `${attRec.totalBreakMinutes}m` : "0m";

  const isCheckedIn = currentStatus === "CHECKED_IN" || currentStatus === "ON_BREAK";
  const isOnBreak = currentStatus === "ON_BREAK";
  const isCheckedOut = currentStatus === "CHECKED_OUT" || Boolean(attRec?.checkOutTime);

  return (
    <div className="space-y-4 px-3.5 py-4 max-w-lg mx-auto">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Attendance</h1>
          <p className="text-xs text-slate-500 font-medium">Daily punch & work hours tracking</p>
        </div>
        <button
          type="button"
          onClick={() => {
            loadMyStatus();
            loadMonthData();
          }}
          disabled={loading}
          className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-800 shadow-2xs transition-colors"
          aria-label="Refresh Attendance"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-orange-500" : ""} />
        </button>
      </div>

      {/* 2. Today's Status Big Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Today's Status
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-tight ${
              currentStatus === "CHECKED_IN"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : currentStatus === "ON_BREAK"
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : isCheckedOut
                ? "bg-blue-100 text-blue-800 border border-blue-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {currentStatus === "CHECKED_IN"
              ? "● Present / Checked In"
              : currentStatus === "ON_BREAK"
              ? "☕ On Break"
              : isCheckedOut
              ? "✓ Completed / Checked Out"
              : "○ Not Checked In"}
          </span>
        </div>

        {/* 4 Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/90">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Checked In
            </span>
            <div className="text-base font-black text-slate-900 mt-0.5">
              {checkInDisplay}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/90">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Check Out
            </span>
            <div className="text-base font-black text-slate-900 mt-0.5">
              {checkOutDisplay}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/90">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Work Hours
            </span>
            <div className="text-base font-black text-emerald-700 mt-0.5">
              {workHoursDisplay}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/90">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Break
            </span>
            <div className="text-base font-black text-amber-700 mt-0.5">
              {breakMinutesDisplay}
            </div>
          </div>
        </div>

        {/* Punch Buttons */}
        <div className="pt-1 flex items-center gap-2">
          {!isCheckedIn && !isCheckedOut && (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Play size={15} />
              <span>Check In</span>
            </button>
          )}

          {isCheckedIn && !isOnBreak && !isCheckedOut && (
            <button
              type="button"
              onClick={handleStartBreak}
              disabled={actionLoading}
              className="py-3 px-3.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Coffee size={15} />
              <span>Break</span>
            </button>
          )}

          {isCheckedIn && isOnBreak && !isCheckedOut && (
            <button
              type="button"
              onClick={handleEndBreak}
              disabled={actionLoading}
              className="py-3 px-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Pause size={15} />
              <span>End Break</span>
            </button>
          )}

          {isCheckedIn && !isCheckedOut && (
            <button
              type="button"
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Square size={15} />
              <span>Check Out</span>
            </button>
          )}

          {isCheckedOut && (
            <div className="w-full py-2.5 px-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold text-center">
              ✓ Attendance logged for today
            </div>
          )}
        </div>
      </div>

      {/* 3. Navigation Tabs: Calendar & History */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "calendar"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <CalendarIcon size={15} />
          <span>Calendar</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "history"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History size={15} />
          <span>History</span>
        </button>
      </div>

      {/* 4. Tab 1: Monthly Calendar */}
      {activeTab === "calendar" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            {/* Month Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-black text-slate-900">
                {currentMonthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell) => {
                if (cell.empty) {
                  return <div key={cell.id} className="h-10" />;
                }

                const isSelected = cell.dateStr === selectedDateStr;
                const statusMeta = STATUS_COLORS[cell.status];

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`h-10 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white font-bold shadow-xs scale-105 z-10"
                        : cell.isToday
                        ? "bg-orange-50 text-orange-600 font-bold border border-orange-200"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="text-xs leading-none">{cell.dayNum}</span>
                    {/* Status Dot */}
                    {statusMeta && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1 ${
                          isSelected ? "bg-white" : statusMeta.bg
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Status Legend */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Present
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Absent
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Late
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> On Leave
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Holiday
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> Weekly Off
              </span>
            </div>
          </div>

          {/* Selected Date Details Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-800">
                Selected:{" "}
                <span className="text-orange-600">
                  {new Date(selectedDateStr).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
              {selectedHoliday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                  🎉 {selectedHoliday.name}
                </span>
              )}
            </div>

            {selectedRecord ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold">CHECK IN</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {selectedRecord.checkInTime
                      ? new Date(selectedRecord.checkInTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold">CHECK OUT</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {selectedRecord.checkOutTime
                      ? new Date(selectedRecord.checkOutTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold">WORK HOURS</span>
                  <div className="font-bold text-emerald-700 mt-0.5">
                    {selectedRecord.totalWorkMinutes
                      ? `${Math.floor(selectedRecord.totalWorkMinutes / 60)}h ${selectedRecord.totalWorkMinutes % 60}m`
                      : "—"}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold">BREAK</span>
                  <div className="font-bold text-amber-700 mt-0.5">
                    {selectedRecord.totalBreakMinutes ? `${selectedRecord.totalBreakMinutes}m` : "0m"}
                  </div>
                </div>

                <div className="col-span-2 p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold">SHIFT</span>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {selectedRecord.shiftStartTime || "09:00"} (
                      {selectedRecord.expectedShiftMinutes
                        ? `${Math.round(selectedRecord.expectedShiftMinutes / 60)}h`
                        : "8h"}
                      )
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      selectedRecord.status === "PRESENT"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedRecord.status === "LATE"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selectedRecord.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 space-y-1">
                <Info size={18} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-500">No punch record for this date</p>
                <p className="text-[10px]">
                  {selectedHoliday ? selectedHoliday.name : "Staff did not clock in or had weekly off."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Tab 2: Attendance History List */}
      {activeTab === "history" && (
        <div className="space-y-2.5">
          {historyRecords.map((rec) => {
            const statusMeta = STATUS_COLORS[rec.status] || STATUS_COLORS.PRESENT;
            return (
              <div
                key={rec._id}
                className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900">
                      {new Date(rec.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Shift: {rec.shiftStartTime || "09:00"}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusMeta.light}`}
                  >
                    {statusMeta.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">IN</span>
                    <span className="font-bold text-slate-700">
                      {rec.checkInTime
                        ? new Date(rec.checkInTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">OUT</span>
                    <span className="font-bold text-slate-700">
                      {rec.checkOutTime
                        ? new Date(rec.checkOutTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold block">HOURS</span>
                    <span className="font-black text-emerald-700">
                      {rec.totalWorkMinutes
                        ? `${Math.floor(rec.totalWorkMinutes / 60)}h ${rec.totalWorkMinutes % 60}m`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {historyRecords.length === 0 && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center text-slate-400 space-y-1">
              <CalendarCheck size={28} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">No attendance history</p>
              <p className="text-[11px]">Records for this month will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
