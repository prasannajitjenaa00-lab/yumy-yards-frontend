import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  CalendarDays,
  CalendarRange,
  X,
  RefreshCw,
} from "lucide-react";
import {
  getMyAttendanceStatus,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getTodayAttendance,
  getAttendanceHistory,
  getAttendanceSummary,
  markAttendance,
} from "../../services/attendanceService";
import {
  getStaffShifts,
  getMyStaffShift,
  createStaffShift,
  updateStaffShift,
  deleteStaffShift,
} from "../../services/shiftService";
import { getHolidays } from "../../services/holidayService";
import { formatDateStr } from "../../utils/attendanceUtils";

import AttendanceHeader from "./components/AttendanceHeader";
import EmployeeSummary from "./components/EmployeeSummary";
import AttendanceLegend from "./components/AttendanceLegend";
import AttendanceCalendar from "./components/AttendanceCalendar";
import SelectedDateDetails from "./components/SelectedDateDetails";
import AttendanceList from "./components/AttendanceList";
import AttendanceSummary from "./components/AttendanceSummary";
import TeamRosterView from "./components/TeamRosterView";
import StaffShiftsView from "./components/StaffShiftsView";
import MobileAttendance from "../../components/mobile/MobileAttendance";

const ALL_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function Attendance() {
  const { user } = useSelector((s) => s.auth);
  const isManager = user?.role === "OWNER" || user?.role === "MANAGER";

  // Selected date navigation (Month & Year)
  const [currentDate, setCurrentDate] = useState(new Date());

  // Selected single calendar date (defaults to today's date string YYYY-MM-DD)
  const defaultTodayStr = formatDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(defaultTodayStr);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("NO_RECORD");
  const [selectedHolidayName, setSelectedHolidayName] = useState(null);

  // View state: "calendar" | "list" | "summary" | "roster" | "shifts"
  const [activeView, setActiveView] = useState("calendar");

  // Selected staff filter for managers (empty = self)
  const [selectedStaffId, setSelectedStaffId] = useState("");

  // Data states
  const [myStatus, setMyStatus] = useState(null);
  const [myShift, setMyShift] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [todayList, setTodayList] = useState([]);
  const [history, setHistory] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  // Manual mark form state
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [markForm, setMarkForm] = useState({
    userId: "",
    date: defaultTodayStr,
    status: "PRESENT",
    notes: "",
  });

  // Shift Modal State (Manager)
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
    gracePeriodMinutes: 15,
    color: "#f97316",
    days: ALL_DAYS,
    assignedUsers: [],
    notes: "",
  });

  // ── Month date range calculation ──
  const { monthStartStr, monthEndStr } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    return {
      monthStartStr: formatDateStr(firstDay),
      monthEndStr: formatDateStr(lastDay),
    };
  }, [currentDate]);

  // ── Data loaders ──
  const loadMyStatus = useCallback(async () => {
    try {
      const res = await getMyAttendanceStatus();
      setMyStatus(res.data.data);
    } catch {
      /* ignore */
    }
  }, []);

  const loadMyShift = useCallback(async () => {
    try {
      const res = await getMyStaffShift();
      setMyShift(res.data.data);
    } catch {
      /* ignore */
    }
  }, []);

  const loadShifts = useCallback(async () => {
    try {
      const res = await getStaffShifts();
      setShifts(res.data.data || []);
    } catch {
      /* ignore */
    }
  }, []);

  const loadTodayList = useCallback(async () => {
    try {
      const res = await getTodayAttendance();
      setTodayList(res.data.data || []);
    } catch {
      /* ignore */
    }
  }, []);

  const loadHolidays = useCallback(async () => {
    try {
      const res = await getHolidays({ year: currentDate.getFullYear() });
      setHolidays(res.data.data || []);
    } catch {
      /* ignore */
    }
  }, [currentDate]);

  const loadHistory = useCallback(async () => {
    try {
      const params = {
        from: monthStartStr,
        to: monthEndStr,
        limit: 100,
      };
      if (selectedStaffId) {
        params.userId = selectedStaffId;
      }
      const res = await getAttendanceHistory(params);
      setHistory(res.data.data || []);
    } catch {
      /* ignore */
    }
  }, [monthStartStr, monthEndStr, selectedStaffId]);

  const loadSummary = useCallback(async () => {
    try {
      const params = {
        from: monthStartStr,
        to: monthEndStr,
      };
      if (selectedStaffId) {
        params.userId = selectedStaffId;
      }
      const res = await getAttendanceSummary(params);
      setSummaryData(res.data.data);
    } catch {
      /* ignore */
    }
  }, [monthStartStr, monthEndStr, selectedStaffId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadMyStatus(),
      loadMyShift(),
      loadShifts(),
      loadTodayList(),
      loadHolidays(),
      loadHistory(),
      loadSummary(),
    ]);
    setLoading(false);
  }, [loadMyStatus, loadMyShift, loadShifts, loadTodayList, loadHolidays, loadHistory, loadSummary]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Map history records by date string `YYYY-MM-DD`
  const recordsByDate = useMemo(() => {
    const map = {};
    for (const rec of history) {
      if (!rec.date) continue;
      const key = formatDateStr(rec.date);
      map[key] = rec;
    }
    return map;
  }, [history]);

  // Update selected record when history/date changes
  useEffect(() => {
    if (selectedDate && recordsByDate[selectedDate]) {
      setSelectedRecord(recordsByDate[selectedDate]);
      setSelectedStatus(recordsByDate[selectedDate].status);
    } else {
      setSelectedRecord(null);
      setSelectedStatus("NO_RECORD");
    }
  }, [selectedDate, recordsByDate]);

  // ── Calculate dynamic monthly statistics for the Employee Summary card ──
  const monthlyStats = useMemo(() => {
    const totalDaysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    let present = 0;
    let absent = 0;
    let late = 0;
    let onLeave = 0;
    let holiday = 0;

    // Check all dates in the month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const rec = recordsByDate[key];

      if (rec) {
        if (rec.status === "PRESENT") present++;
        else if (rec.status === "LATE") late++;
        else if (rec.status === "ABSENT") absent++;
        else if (["LEAVE", "ON_LEAVE"].includes(rec.status)) onLeave++;
        else if (rec.status === "HALF_DAY") present++;
        else if (rec.status === "HOLIDAY") holiday++;
      }
    }

    // Use API summary as fallback/supplement if available
    if (summaryData?.summary) {
      const sum = summaryData.summary;
      if (sum.present !== undefined && present === 0) present = sum.present;
      if (sum.late !== undefined && late === 0) late = sum.late;
      if (sum.absent !== undefined && absent === 0) absent = sum.absent;
      if (sum.leave !== undefined && onLeave === 0) onLeave = sum.leave;
    }

    const recordedDays = present + absent + late + onLeave + holiday || totalDaysInMonth;
    const baseTotal = recordedDays > 0 ? recordedDays : 1;

    return {
      totalRecordedDays: recordedDays,
      present,
      presentPct: Math.round((present / baseTotal) * 100) || (present > 0 ? 100 : 0),
      absent,
      absentPct: Math.round((absent / baseTotal) * 100) || 0,
      late,
      latePct: Math.round((late / baseTotal) * 100) || 0,
      onLeave,
      onLeavePct: Math.round((onLeave / baseTotal) * 100) || 0,
      holiday,
      holidayPct: Math.round((holiday / baseTotal) * 100) || 0,
    };
  }, [currentDate, recordsByDate, summaryData]);

  // ── Month Navigation Handlers ──
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setSelectedDate(key);
  };

  const handleSelectCalendarDate = (dateStr, record, status, holidayName) => {
    setSelectedDate(dateStr);
    setSelectedRecord(record || null);
    setSelectedStatus(status);
    setSelectedHolidayName(holidayName || null);
  };

  // ── Actions: Check-in, Break, Check-out ──
  const handleCheckIn = async () => {
    setActionLoading("checkin");
    try {
      await checkIn({});
      toast.success("✅ Checked in successfully!");
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed");
    }
    setActionLoading("");
  };

  const handleCheckOut = async () => {
    setActionLoading("checkout");
    try {
      await checkOut({});
      toast.success("👋 Checked out successfully!");
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-out failed");
    }
    setActionLoading("");
  };

  const handleStartBreak = async () => {
    setActionLoading("breakstart");
    try {
      await startBreak({});
      toast.info("☕ Break started");
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start break");
    }
    setActionLoading("");
  };

  const handleEndBreak = async () => {
    setActionLoading("breakend");
    try {
      await endBreak({});
      toast.info("💪 Break ended, back to work!");
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to end break");
    }
    setActionLoading("");
  };

  // Manager action for checking in/out staff
  const handleCheckInFor = async (userId) => {
    setActionLoading(`checkin-${userId}`);
    try {
      await checkIn({ userId });
      toast.success("Checked in staff!");
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed");
    }
    setActionLoading("");
  };

  const handleCheckOutFor = async (userId) => {
    setActionLoading(`checkout-${userId}`);
    try {
      await checkOut({ userId });
      toast.success("Checked out staff!");
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-out failed");
    }
    setActionLoading("");
  };

  // Manual mark attendance
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!markForm.userId || !markForm.date) {
      return toast.error("Select a staff member and date");
    }
    try {
      await markAttendance(markForm);
      toast.success("Attendance marked manually");
      setShowMarkForm(false);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark");
    }
  };

  // ── Shift Management ──
  const handleOpenNewShift = () => {
    setEditingShiftId(null);
    setShiftForm({
      name: "",
      startTime: "09:00",
      endTime: "17:00",
      gracePeriodMinutes: 15,
      color: "#f97316",
      days: ALL_DAYS,
      assignedUsers: [],
      notes: "",
    });
    setShowShiftModal(true);
  };

  const handleOpenEditShift = (shift) => {
    setEditingShiftId(shift._id);
    setShiftForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      gracePeriodMinutes: shift.gracePeriodMinutes ?? 15,
      color: shift.color || "#f97316",
      days: shift.days || ALL_DAYS,
      assignedUsers: shift.assignedUsers?.map((u) => u._id || u) || [],
      notes: shift.notes || "",
    });
    setShowShiftModal(true);
  };

  const handleSaveShift = async (e) => {
    e.preventDefault();
    if (!shiftForm.name || !shiftForm.startTime || !shiftForm.endTime) {
      return toast.error("Shift name, start time, and end time are required");
    }
    try {
      if (editingShiftId) {
        await updateStaffShift(editingShiftId, shiftForm);
        toast.success("Shift updated successfully");
      } else {
        await createStaffShift(shiftForm);
        toast.success("Shift created successfully");
      }
      setShowShiftModal(false);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save shift");
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;
    try {
      await deleteStaffShift(shiftId);
      toast.success("Shift deleted");
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete shift");
    }
  };

  const toggleShiftDay = (day) => {
    setShiftForm((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const toggleShiftUser = (userId) => {
    setShiftForm((prev) => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(userId)
        ? prev.assignedUsers.filter((id) => id !== userId)
        : [...prev.assignedUsers, userId],
    }));
  };

  // Target user for summary card (either logged in user or selected staff member)
  const displayUser = useMemo(() => {
    if (selectedStaffId && todayList.length > 0) {
      const match = todayList.find((st) => (st.user?._id || st.user) === selectedStaffId);
      if (match?.user) return match.user;
    }
    return user;
  }, [selectedStaffId, todayList, user]);

  return (
    <>
      {/* Dedicated Mobile Attendance Interface (<768px) */}
      <div className="block md:hidden">
        <MobileAttendance />
      </div>

      {/* Desktop & Tablet Attendance (>=768px) - Untouched */}
      <div className="hidden md:block space-y-5 pb-10">
        {/* 1. TOP HEADER */}
      <AttendanceHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        activeView={activeView}
        setActiveView={setActiveView}
        isManager={isManager}
        staffList={todayList}
        selectedStaffId={selectedStaffId}
        onSelectStaff={setSelectedStaffId}
        onOpenNewShift={handleOpenNewShift}
        onOpenManualMark={() => setShowMarkForm(true)}
      />

      {/* 2. EMPLOYEE SUMMARY CARD */}
      <EmployeeSummary
        user={displayUser}
        currentDate={currentDate}
        stats={monthlyStats}
        myStatus={myStatus}
        myShift={myShift}
        actionLoading={actionLoading}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onStartBreak={handleStartBreak}
        onEndBreak={handleEndBreak}
      />

      {/* 3. VIEW SWITCHER CONTENT */}
      {activeView === "calendar" && (
        <div className="space-y-4">
          {/* Attendance Legend */}
          <AttendanceLegend />

          {/* Large Monthly Calendar Grid */}
          <AttendanceCalendar
            currentDate={currentDate}
            recordsByDate={recordsByDate}
            holidays={holidays}
            currentUser={displayUser}
            selectedDate={selectedDate}
            onSelectDate={handleSelectCalendarDate}
          />

          {/* Selected Date Details */}
          <SelectedDateDetails
            selectedDateStr={selectedDate}
            selectedRecord={selectedRecord}
            selectedStatus={selectedStatus}
            holidayName={selectedHolidayName}
          />
        </div>
      )}

      {activeView === "list" && (
        <AttendanceList
          records={history}
          onSelectRecord={(rec) => {
            const d = new Date(rec.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            setSelectedDate(key);
            setSelectedRecord(rec);
            setSelectedStatus(rec.status);
            setActiveView("calendar");
          }}
        />
      )}

      {activeView === "summary" && (
        <AttendanceSummary summaryData={summaryData} stats={monthlyStats} />
      )}

      {activeView === "roster" && (
        <TeamRosterView
          todayList={todayList}
          isManager={isManager}
          actionLoading={actionLoading}
          onCheckInFor={handleCheckInFor}
          onCheckOutFor={handleCheckOutFor}
        />
      )}

      {activeView === "shifts" && (
        <StaffShiftsView
          shifts={shifts}
          myShift={myShift}
          isManager={isManager}
          onOpenNewShift={handleOpenNewShift}
          onOpenEditShift={handleOpenEditShift}
          onDeleteShift={handleDeleteShift}
        />
      )}

      {/* ─── MANUAL MARK ATTENDANCE MODAL (Manager Only) ─── */}
      {showMarkForm && isManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays size={18} className="text-orange-500" />
                Manual Mark Attendance
              </h3>
              <button
                type="button"
                onClick={() => setShowMarkForm(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMarkAttendance} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Staff Member *</label>
                <select
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-semibold"
                  value={markForm.userId}
                  onChange={(e) => setMarkForm({ ...markForm, userId: e.target.value })}
                  required
                >
                  <option value="">Choose staff...</option>
                  {todayList.map((item) => (
                    <option key={item.user._id} value={item.user._id}>
                      {item.user.name} ({item.user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-semibold"
                    value={markForm.date}
                    onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status *</label>
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-semibold"
                    value={markForm.status}
                    onChange={(e) => setMarkForm({ ...markForm, status: e.target.value })}
                  >
                    <option value="PRESENT">Present</option>
                    <option value="LATE">Late</option>
                    <option value="ABSENT">Absent</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="HOLIDAY">Holiday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Festival holiday, approved medical leave, on-duty"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={markForm.notes}
                  onChange={(e) => setMarkForm({ ...markForm, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMarkForm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CREATE / EDIT SHIFT MODAL (Manager Only) ─── */}
      {showShiftModal && isManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarRange size={18} className="text-orange-500" />
                {editingShiftId ? "Edit Staff Shift" : "Create New Staff Shift"}
              </h3>
              <button
                type="button"
                onClick={() => setShowShiftModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shift Name *</label>
                <input
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-semibold"
                  placeholder="e.g. Morning Shift, Evening Rush, Kitchen Shift"
                  value={shiftForm.name}
                  onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-mono"
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-mono"
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-bold"
                    value={shiftForm.gracePeriodMinutes}
                    onChange={(e) =>
                      setShiftForm({ ...shiftForm, gracePeriodMinutes: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift Badge Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 p-0.5"
                      value={shiftForm.color}
                      onChange={(e) => setShiftForm({ ...shiftForm, color: e.target.value })}
                    />
                    <span className="text-xs text-slate-500 font-mono font-semibold">{shiftForm.color}</span>
                  </div>
                </div>
              </div>

              {/* Working Days */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Active Working Days</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {ALL_DAYS.map((d) => {
                    const active = shiftForm.days.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleShiftDay(d)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? "bg-orange-500 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Staff */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Staff Members</label>
                <div className="border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1.5 bg-slate-50/50">
                  {todayList.map((item) => {
                    const isChecked = shiftForm.assignedUsers.includes(item.user._id);
                    return (
                      <label
                        key={item.user._id}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleShiftUser(item.user._id)}
                          className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                        <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {item.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{item.user.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold ml-auto">
                          {item.user.role}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
                >
                  {editingShiftId ? "Save Changes" : "Create Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
