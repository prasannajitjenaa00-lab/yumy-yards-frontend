import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  BarChart3,
  Users,
  CalendarRange,
  Plus,
  CalendarDays,
  Sparkles,
} from "lucide-react";

export default function AttendanceHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  activeView,
  setActiveView,
  isManager,
  staffList = [],
  selectedStaffId,
  onSelectStaff,
  onOpenNewShift,
  onOpenManualMark,
}) {
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Top Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Title */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Attendance
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
              <Sparkles size={11} /> HRMS Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Track your monthly attendance and work hours
          </p>
        </div>

        {/* Right Controls: Month Navigation + Today + View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Manager Staff Selector (if manager) */}
          {isManager && staffList.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Users size={14} className="text-slate-400" />
              <select
                value={selectedStaffId || ""}
                onChange={(e) => onSelectStaff(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="">👤 My Attendance (Self)</option>
                <optgroup label="Staff Members">
                  {staffList.map((st) => (
                    <option key={st.user?._id || st._id} value={st.user?._id || st._id}>
                      {st.user?.name || st.name} ({st.user?.role || st.role})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* Month Switcher (< September 2026 >) */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs p-1">
            <button
              type="button"
              onClick={onPrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="px-3 py-1 text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight min-w-[130px] text-center select-none">
              {monthName}
            </div>

            <button
              type="button"
              onClick={onNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Today Button */}
          <button
            type="button"
            onClick={onToday}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-blue-600 border border-blue-200 hover:bg-blue-50/70 hover:border-blue-300 shadow-2xs transition-all active:scale-95"
          >
            Today
          </button>

          {/* View Switcher: [Calendar] [List] [Summary] */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === "calendar"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Calendar size={13} />
              <span>Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === "list"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <List size={13} />
              <span>List</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("summary")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === "summary"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <BarChart3 size={13} />
              <span>Summary</span>
            </button>

            {/* Manager View Tabs */}
            {isManager && (
              <>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={() => setActiveView("roster")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeView === "roster"
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                  title="Today's Live Team Roster"
                >
                  <Users size={13} />
                  <span>Roster</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView("shifts")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeView === "shifts"
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                  title="Staff Shifts & Schedule"
                >
                  <CalendarRange size={13} />
                  <span>Shifts</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Manager Actions */}
          {isManager && (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/staff/holidays"
                className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors"
              >
                <Sparkles size={13} /> Holidays
              </Link>
              <button
                type="button"
                onClick={onOpenNewShift}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors"
              >
                <Plus size={13} /> Shift
              </button>
              <button
                type="button"
                onClick={onOpenManualMark}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
              >
                <CalendarDays size={13} /> Mark
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
