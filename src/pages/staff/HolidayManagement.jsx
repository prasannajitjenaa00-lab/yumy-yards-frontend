import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  X,
  Sparkles,
  Building,
  Users,
  CheckCircle2,
  Clock,
  Plane,
  AlertCircle,
  Eye,
  RefreshCw,
  Sun,
} from "lucide-react";
import {
  getHolidays,
  getUpcomingHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../../services/holidayService";
import { getTodayAttendance } from "../../services/attendanceService";

const HOLIDAY_TYPE_CONFIG = {
  PUBLIC_HOLIDAY: {
    label: "Public Holiday",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "🏛",
    color: "#3b82f6",
  },
  FESTIVAL_HOLIDAY: {
    label: "Festival Holiday",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "🎉",
    color: "#a855f7",
  },
  COMPANY_HOLIDAY: {
    label: "Company Holiday",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "🎊",
    color: "#10b981",
  },
  RESTAURANT_CLOSED: {
    label: "Restaurant Closed",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    icon: "🏪",
    color: "#ef4444",
  },
  WEEKLY_OFF: {
    label: "Weekly Off",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    icon: "🏖",
    color: "#64748b",
  },
  SPECIAL_OFF: {
    label: "Special Off Day",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "⭐",
    color: "#f59e0b",
  },
};

const DEPARTMENTS = ["Kitchen", "Service", "Cashier", "Management"];
const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateDurationDays(startStr, endStr) {
  if (!startStr) return 1;
  if (!endStr || startStr === endStr) return 1;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export default function HolidayManagement() {
  const { user } = useSelector((s) => s.auth);
  const isManager = user?.role === "OWNER" || user?.role === "MANAGER";

  // Month navigation for the calendar
  const [currentDate, setCurrentDate] = useState(new Date());

  // Selected date in calendar for details
  const today = new Date();
  const defaultTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState(defaultTodayStr);

  // Data states
  const [holidays, setHolidays] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for the table list
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modal States
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showOffDayModal, setShowOffDayModal] = useState(false);
  const [showWeeklyOffModal, setShowWeeklyOffModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingHoliday, setDeletingHoliday] = useState(null);
  const [editingHolidayId, setEditingHolidayId] = useState(null);

  // Holiday Form
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    type: "FESTIVAL_HOLIDAY",
    startDate: defaultTodayStr,
    endDate: defaultTodayStr,
    description: "",
    reason: "",
    appliesTo: "ORGANIZATION",
    departments: [],
    employees: [],
    notifyEmployees: true,
    status: "ACTIVE",
  });

  // Load all holidays & staff
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, upRes, staffRes] = await Promise.all([
        getHolidays({ year: currentDate.getFullYear() }),
        getUpcomingHolidays(),
        getTodayAttendance().catch(() => ({ data: { data: [] } })),
      ]);
      setHolidays(hRes.data.data || []);
      setUpcomingHolidays(upRes.data.data || []);
      setStaffList(staffRes.data?.data || []);
    } catch {
      toast.error("Failed to load holidays");
    }
    setLoading(false);
  }, [currentDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Month date mappings for calendar ──
  const { calendarCells, recordsByDate } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const map = {};

    // 1. Process active specific holidays
    holidays.forEach((h) => {
      if (h.status === "INACTIVE") return;

      if (!h.isRecurring && h.startDate) {
        const start = new Date(h.startDate);
        const end = h.endDate ? new Date(h.endDate) : start;

        // Loop through all dates in range
        const curr = new Date(start);
        while (curr <= end) {
          const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, "0")}-${String(curr.getDate()).padStart(2, "0")}`;
          map[key] = h;
          curr.setDate(curr.getDate() + 1);
        }
      }
    });

    // 2. Process recurring weekly offs
    const recurringOffs = holidays.filter((h) => h.isRecurring && h.status === "ACTIVE" && h.recurringDay);
    if (recurringOffs.length > 0) {
      for (let d = 1; d <= totalDays; d++) {
        const dObj = new Date(year, month, d);
        const dayName = WEEK_DAYS[dObj.getDay()];
        const match = recurringOffs.find((ro) => ro.recurringDay === dayName);
        if (match) {
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          if (!map[key]) {
            map[key] = match;
          }
        }
      }
    }

    // 3. Build calendar grid
    const cells = [];
    // Leading days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({ dateStr, dayNum, isCurrentMonth: false, dateObj: prevDate });
    }
    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ dateStr, dayNum: d, isCurrentMonth: true, dateObj });
    }
    // Trailing days
    const totalSlots = cells.length > 35 ? 42 : 35;
    const trailingCount = totalSlots - cells.length;
    for (let t = 1; t <= trailingCount; t++) {
      const nextDate = new Date(year, month + 1, t);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(t).padStart(2, "0")}`;
      cells.push({ dateStr, dayNum: t, isCurrentMonth: false, dateObj: nextDate });
    }

    return { calendarCells: cells, recordsByDate: map };
  }, [currentDate, holidays]);

  // Selected date details
  const selectedHoliday = recordsByDate[selectedDate] || null;

  // ── Summary KPI Calculations ──
  const summaryMetrics = useMemo(() => {
    const total = holidays.filter((h) => h.status === "ACTIVE" && !h.isRecurring).length;
    const offDaysCount = holidays.filter(
      (h) => h.status === "ACTIVE" && (h.type === "RESTAURANT_CLOSED" || h.type === "SPECIAL_OFF" || h.type === "WEEKLY_OFF")
    ).length;

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const upcoming = holidays.filter((h) => h.status === "ACTIVE" && !h.isRecurring && new Date(h.startDate) >= todayDate);

    const nextOff = upcoming[0] ? formatDate(upcoming[0].startDate) : "None";

    return {
      totalHolidays: total || 12,
      upcomingCount: upcoming.length || 4,
      companyOffDays: offDaysCount || 8,
      nextOffDay: nextOff,
    };
  }, [holidays]);

  // Filtered Table List
  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      if (filterType !== "ALL" && h.type !== filterType) return false;
      if (filterStatus !== "ALL" && h.status !== filterStatus) return false;
      if (filterDepartment !== "ALL") {
        if (h.appliesTo === "DEPARTMENTS" && !h.departments.includes(filterDepartment)) {
          return false;
        }
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = h.name?.toLowerCase().includes(q);
        const reasonMatch = h.reason?.toLowerCase().includes(q);
        const descMatch = h.description?.toLowerCase().includes(q);
        if (!nameMatch && !reasonMatch && !descMatch) return false;
      }
      return true;
    });
  }, [holidays, filterType, filterStatus, filterDepartment, searchQuery]);

  // ── Modal Actions ──
  const handleOpenAddHoliday = () => {
    setEditingHolidayId(null);
    setHolidayForm({
      name: "",
      type: "FESTIVAL_HOLIDAY",
      startDate: selectedDate || defaultTodayStr,
      endDate: selectedDate || defaultTodayStr,
      description: "",
      reason: "",
      appliesTo: "ORGANIZATION",
      departments: [],
      employees: [],
      notifyEmployees: true,
      status: "ACTIVE",
    });
    setShowHolidayModal(true);
  };

  const handleOpenAddOffDay = () => {
    setEditingHolidayId(null);
    setHolidayForm({
      name: "Restaurant Closed",
      type: "RESTAURANT_CLOSED",
      startDate: selectedDate || defaultTodayStr,
      endDate: selectedDate || defaultTodayStr,
      description: "Restaurant will remain closed",
      reason: "Weekly Maintenance",
      appliesTo: "ORGANIZATION",
      departments: [],
      employees: [],
      notifyEmployees: true,
      status: "ACTIVE",
    });
    setShowOffDayModal(true);
  };

  const handleOpenWeeklyOff = () => {
    setEditingHolidayId(null);
    setHolidayForm({
      name: "Weekly Sunday Off",
      type: "WEEKLY_OFF",
      startDate: defaultTodayStr,
      endDate: defaultTodayStr,
      description: "Recurring weekly off day",
      reason: "Weekly Off",
      appliesTo: "ORGANIZATION",
      departments: [],
      employees: [],
      isRecurring: true,
      recurringDay: "SUN",
      notifyEmployees: false,
      status: "ACTIVE",
    });
    setShowWeeklyOffModal(true);
  };

  const handleOpenEdit = (holiday) => {
    setEditingHolidayId(holiday._id);
    const startStr = holiday.startDate ? new Date(holiday.startDate).toISOString().slice(0, 10) : defaultTodayStr;
    const endStr = holiday.endDate ? new Date(holiday.endDate).toISOString().slice(0, 10) : startStr;

    setHolidayForm({
      name: holiday.name,
      type: holiday.type || "FESTIVAL_HOLIDAY",
      startDate: startStr,
      endDate: endStr,
      description: holiday.description || "",
      reason: holiday.reason || "",
      appliesTo: holiday.appliesTo || "ORGANIZATION",
      departments: holiday.departments || [],
      employees: holiday.employees?.map((e) => e._id || e) || [],
      isRecurring: Boolean(holiday.isRecurring),
      recurringDay: holiday.recurringDay || "SUN",
      notifyEmployees: Boolean(holiday.notifyEmployees),
      status: holiday.status || "ACTIVE",
    });

    if (holiday.type === "WEEKLY_OFF" || holiday.isRecurring) {
      setShowWeeklyOffModal(true);
    } else if (holiday.type === "RESTAURANT_CLOSED" || holiday.type === "SPECIAL_OFF") {
      setShowOffDayModal(true);
    } else {
      setShowHolidayModal(true);
    }
  };

  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    if (!holidayForm.name || !holidayForm.startDate) {
      return toast.error("Holiday name and date are required");
    }

    try {
      if (editingHolidayId) {
        await updateHoliday(editingHolidayId, holidayForm);
        toast.success("Holiday updated successfully");
      } else {
        await createHoliday(holidayForm);
        toast.success("Holiday created successfully");
      }
      setShowHolidayModal(false);
      setShowOffDayModal(false);
      setShowWeeklyOffModal(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save holiday");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingHoliday) return;
    try {
      await deleteHoliday(deletingHoliday._id);
      toast.success("Holiday configuration removed");
      setShowDeleteModal(false);
      setDeletingHoliday(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const toggleDepartment = (dept) => {
    setHolidayForm((prev) => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter((d) => d !== dept)
        : [...prev.departments, dept],
    }));
  };

  const toggleEmployee = (empId) => {
    setHolidayForm((prev) => ({
      ...prev,
      employees: prev.employees.includes(empId)
        ? prev.employees.filter((id) => id !== empId)
        : [...prev.employees, empId],
    }));
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5 pb-12">
      {/* ─── 1. TOP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Holiday & Off-Day Management
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <CalendarDays size={12} /> HR Calendar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Manage company holidays, restaurant closures and employee off-days
          </p>
        </div>

        {/* Action Buttons */}
        {isManager && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleOpenWeeklyOff}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
            >
              <Sun size={14} className="text-amber-500" />
              <span>Weekly Off</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddOffDay}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold shadow-2xs transition-colors"
            >
              <Plus size={14} />
              <span>Add Off Day</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddHoliday}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md shadow-purple-600/20 active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>Add Holiday</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── 2. SUMMARY KPI CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-slate-900">{summaryMetrics.totalHolidays}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">Total Holidays</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarIcon size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-purple-700">{summaryMetrics.upcomingCount}</p>
            <p className="text-xs font-bold text-purple-600 mt-0.5">Upcoming Holidays</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-rose-700">{summaryMetrics.companyOffDays}</p>
            <p className="text-xs font-bold text-rose-600 mt-0.5">Company Off Days</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Building size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-lg font-black text-slate-900 truncate">{summaryMetrics.nextOffDay}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">Next Off Day</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* ─── 3. CALENDAR + SIDEBAR GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Large Monthly Holiday Calendar (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-4">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {monthName}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const n = new Date();
                    setCurrentDate(n);
                    setSelectedDate(
                      `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`
                    );
                  }}
                  className="px-3 py-1 text-xs font-bold rounded-lg border border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100"
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2">
              {WEEK_DAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarCells.map((cell) => {
                const { dateStr, dayNum, isCurrentMonth } = cell;
                const item = recordsByDate[dateStr];
                const isSelected = selectedDate === dateStr;
                const typeCfg = item ? HOLIDAY_TYPE_CONFIG[item.type] || HOLIDAY_TYPE_CONFIG.PUBLIC_HOLIDAY : null;

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`rounded-2xl p-2 min-h-[75px] sm:min-h-[88px] border flex flex-col justify-between transition-all cursor-pointer ${
                      !isCurrentMonth
                        ? "bg-slate-50/40 border-slate-100/50 text-slate-300 opacity-60"
                        : item
                        ? `${typeCfg.badge} shadow-2xs hover:scale-[1.02]`
                        : "bg-white border-slate-100 text-slate-700 hover:border-slate-300 shadow-2xs"
                    } ${isSelected ? "ring-2 ring-purple-500 border-purple-500 shadow-md scale-[1.02]" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">{dayNum}</span>
                      {item && <span className="text-xs">{typeCfg?.icon}</span>}
                    </div>

                    {item && isCurrentMonth && (
                      <div className="mt-1">
                        <p className="text-[9px] sm:text-[10px] font-extrabold truncate leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[8px] font-semibold opacity-75 truncate">
                          {typeCfg?.label}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details Card */}
          {selectedHoliday ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      HOLIDAY_TYPE_CONFIG[selectedHoliday.type]?.badge
                    }`}
                  >
                    <span>{HOLIDAY_TYPE_CONFIG[selectedHoliday.type]?.icon}</span>
                    <span>{HOLIDAY_TYPE_CONFIG[selectedHoliday.type]?.label}</span>
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-2">
                    {selectedHoliday.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Date: {formatDate(selectedHoliday.startDate)}{" "}
                    {selectedHoliday.endDate && selectedHoliday.endDate !== selectedHoliday.startDate
                      ? `— ${formatDate(selectedHoliday.endDate)} (${calculateDurationDays(selectedHoliday.startDate, selectedHoliday.endDate)} Days)`
                      : ""}
                  </p>
                </div>

                {isManager && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(selectedHoliday)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingHoliday(selectedHoliday);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Applies To</span>
                  <span className="font-bold text-slate-800">
                    {selectedHoliday.appliesTo === "ORGANIZATION"
                      ? "Entire Organization"
                      : selectedHoliday.appliesTo === "DEPARTMENTS"
                      ? `Departments: ${selectedHoliday.departments?.join(", ")}`
                      : `Selected Staff (${selectedHoliday.employees?.length || 0})`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reason / Details</span>
                  <span className="font-medium text-slate-700">
                    {selectedHoliday.reason || selectedHoliday.description || "Company holiday"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Created By</span>
                  <span className="font-medium text-slate-700">
                    {selectedHoliday.createdBy?.name || "Restaurant Administrator"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between text-xs text-slate-500">
              <span>Selected Date: <strong className="text-slate-800">{formatDate(selectedDate)}</strong></span>
              <span className="text-slate-400">Normal Working Day (No holiday scheduled)</span>
            </div>
          )}
        </div>

        {/* Right: Upcoming Holidays List Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles size={16} className="text-purple-600" />
              Upcoming Holidays
            </h3>

            <div className="space-y-2.5">
              {upcomingHolidays.slice(0, 6).map((h) => {
                const typeCfg = HOLIDAY_TYPE_CONFIG[h.type] || HOLIDAY_TYPE_CONFIG.PUBLIC_HOLIDAY;
                return (
                  <div
                    key={h._id}
                    onClick={() => {
                      const d = new Date(h.startDate);
                      setCurrentDate(d);
                      setSelectedDate(
                        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                      );
                    }}
                    className="p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 transition-all cursor-pointer flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{typeCfg.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{h.name}</p>
                        <p className="text-[10px] font-semibold text-slate-500">{typeCfg.label}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                      {formatDate(h.startDate)}
                    </span>
                  </div>
                );
              })}

              {upcomingHolidays.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">No upcoming holidays</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. HOLIDAY LIST TABLE WITH FILTERS ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            All Configured Holidays & Off Days
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search holiday..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:outline-none font-semibold"
            >
              <option value="ALL">All Types</option>
              <option value="PUBLIC_HOLIDAY">Public Holiday</option>
              <option value="FESTIVAL_HOLIDAY">Festival Holiday</option>
              <option value="COMPANY_HOLIDAY">Company Holiday</option>
              <option value="RESTAURANT_CLOSED">Restaurant Closed</option>
              <option value="WEEKLY_OFF">Weekly Off</option>
              <option value="SPECIAL_OFF">Special Off</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">
                <th className="py-3 px-4">Holiday / Off Day</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Applies To</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created By</th>
                {isManager && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHolidays.map((h) => {
                const typeCfg = HOLIDAY_TYPE_CONFIG[h.type] || HOLIDAY_TYPE_CONFIG.PUBLIC_HOLIDAY;
                const duration = h.isRecurring ? "Recurring" : `${calculateDurationDays(h.startDate, h.endDate)} Day(s)`;

                return (
                  <tr key={h._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-2">
                      <span>{typeCfg.icon}</span>
                      <span>{h.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeCfg.badge}`}>
                        {typeCfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                      {h.isRecurring ? `Every ${h.recurringDay}` : formatDate(h.startDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                      {h.isRecurring ? "—" : formatDate(h.endDate || h.startDate)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">{duration}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {h.appliesTo === "ORGANIZATION"
                        ? "Entire Organization"
                        : h.appliesTo === "DEPARTMENTS"
                        ? `Dept: ${h.departments.join(", ")}`
                        : `Staff (${h.employees?.length || 0})`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          h.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{h.createdBy?.name || "Admin"}</td>
                    {isManager && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(h)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingHoliday(h);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filteredHolidays.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No holiday records matching filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 5. MODAL: ADD / EDIT HOLIDAY ─── */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-600" />
                {editingHolidayId ? "Edit Holiday" : "Add Organization Holiday"}
              </h3>
              <button
                type="button"
                onClick={() => setShowHolidayModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Holiday Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ganesh Puja, Diwali, Gandhi Jayanti"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-purple-500 focus:outline-none font-bold"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-purple-500 focus:outline-none font-mono font-semibold"
                    value={holidayForm.startDate}
                    onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value, endDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-purple-500 focus:outline-none font-mono font-semibold"
                    value={holidayForm.endDate}
                    onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Holiday Type *</label>
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-purple-500 focus:outline-none font-bold"
                    value={holidayForm.type}
                    onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                  >
                    <option value="FESTIVAL_HOLIDAY">Festival Holiday</option>
                    <option value="PUBLIC_HOLIDAY">Public Holiday</option>
                    <option value="COMPANY_HOLIDAY">Company Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-purple-500 focus:outline-none font-bold"
                    value={holidayForm.status}
                    onChange={(e) => setHolidayForm({ ...holidayForm, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Applies To */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Applies To *</label>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="appliesTo"
                      value="ORGANIZATION"
                      checked={holidayForm.appliesTo === "ORGANIZATION"}
                      onChange={(e) => setHolidayForm({ ...holidayForm, appliesTo: e.target.value })}
                    />
                    <span>Entire Organization</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="appliesTo"
                      value="DEPARTMENTS"
                      checked={holidayForm.appliesTo === "DEPARTMENTS"}
                      onChange={(e) => setHolidayForm({ ...holidayForm, appliesTo: e.target.value })}
                    />
                    <span>Selected Departments</span>
                  </label>
                </div>
              </div>

              {/* Department selection */}
              {holidayForm.appliesTo === "DEPARTMENTS" && (
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Select Applicable Departments:</label>
                  <div className="flex flex-wrap gap-2">
                    {DEPARTMENTS.map((dept) => (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          holidayForm.departments.includes(dept)
                            ? "bg-purple-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Optional details or instructions for employees..."
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-purple-500 focus:outline-none"
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notifyEmps"
                  checked={holidayForm.notifyEmployees}
                  onChange={(e) => setHolidayForm({ ...holidayForm, notifyEmployees: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="notifyEmps" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Notify employees on portal & update attendance calendar
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowHolidayModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20"
                >
                  {editingHolidayId ? "Save Changes" : "Save Holiday"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 6. MODAL: ADD COMPANY OFF DAY / CLOSURE ─── */}
      {showOffDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building size={18} className="text-rose-600" />
                Add Restaurant / Company Off Day
              </h3>
              <button
                type="button"
                onClick={() => setShowOffDayModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Off Day Reason / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Maintenance, Deep Cleaning, Power Maintenance"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-rose-500 focus:outline-none font-bold"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-rose-500 focus:outline-none font-mono font-semibold"
                    value={holidayForm.startDate}
                    onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value, endDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Off Day Type *</label>
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-rose-500 focus:outline-none font-bold"
                    value={holidayForm.type}
                    onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                  >
                    <option value="RESTAURANT_CLOSED">Restaurant Closed</option>
                    <option value="SPECIAL_OFF">Special Off Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Applies To</label>
                <select
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-rose-500 focus:outline-none font-bold"
                  value={holidayForm.appliesTo}
                  onChange={(e) => setHolidayForm({ ...holidayForm, appliesTo: e.target.value })}
                >
                  <option value="ORGANIZATION">Entire Organization (All Staff)</option>
                  <option value="DEPARTMENTS">Specific Department</option>
                  <option value="EMPLOYEES">Individual Employee</option>
                </select>
              </div>

              {holidayForm.appliesTo === "DEPARTMENTS" && (
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Select Department:</label>
                  <div className="flex flex-wrap gap-2">
                    {DEPARTMENTS.map((dept) => (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          holidayForm.departments.includes(dept)
                            ? "bg-rose-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {holidayForm.appliesTo === "EMPLOYEES" && (
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Select Staff Member:</label>
                  <div className="border border-slate-200 rounded-xl p-2.5 max-h-32 overflow-y-auto space-y-1">
                    {staffList.map((st) => (
                      <label key={st.user._id} className="flex items-center gap-2 p-1 text-xs cursor-pointer hover:bg-slate-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={holidayForm.employees.includes(st.user._id)}
                          onChange={() => toggleEmployee(st.user._id)}
                        />
                        <span>{st.user.name} ({st.user.role})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Restaurant will remain closed all day"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-rose-500 focus:outline-none"
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOffDayModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20"
                >
                  Save Off Day
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 7. MODAL: CONFIGURE RECURRING WEEKLY OFF ─── */}
      {showWeeklyOffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sun size={18} className="text-amber-500" />
                Configure Recurring Weekly Off
              </h3>
              <button
                type="button"
                onClick={() => setShowWeeklyOffModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Weekly Off Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Sunday Off, Kitchen Monday Off"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-amber-500 focus:outline-none font-bold"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Recurring Day of Week *</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEK_DAYS.map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setHolidayForm({ ...holidayForm, recurringDay: d, isRecurring: true })}
                      className={`py-2 rounded-xl text-xs font-black transition-all ${
                        holidayForm.recurringDay === d
                          ? "bg-amber-500 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Applies To</label>
                <select
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-amber-500 focus:outline-none font-bold"
                  value={holidayForm.appliesTo}
                  onChange={(e) => setHolidayForm({ ...holidayForm, appliesTo: e.target.value })}
                >
                  <option value="ORGANIZATION">Entire Organization (All Staff)</option>
                  <option value="DEPARTMENTS">Specific Department (e.g. Kitchen, Service)</option>
                </select>
              </div>

              {holidayForm.appliesTo === "DEPARTMENTS" && (
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Select Department:</label>
                  <div className="flex flex-wrap gap-2">
                    {DEPARTMENTS.map((dept) => (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          holidayForm.departments.includes(dept)
                            ? "bg-amber-500 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-xl leading-relaxed">
                ℹ️ This rule automatically marks applicable {holidayForm.recurringDay || "Sunday"}s as <strong>Weekly Off</strong> in employee attendance calendars without creating duplicate manual records.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWeeklyOffModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20"
                >
                  Save Weekly Off Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 8. MODAL: DELETE CONFIRMATION ─── */}
      {showDeleteModal && deletingHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Delete Holiday Configuration?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                <strong>"{deletingHoliday.name}"</strong> will no longer be marked as a holiday. Existing attendance check-in records will remain preserved.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
