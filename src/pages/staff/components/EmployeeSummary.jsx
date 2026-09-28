import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Plane,
  Calendar,
  LogIn,
  LogOut,
  Coffee,
  Play,
  Sparkles,
} from "lucide-react";

export default function EmployeeSummary({
  user,
  currentDate,
  stats = {
    present: 0,
    presentPct: 0,
    absent: 0,
    absentPct: 0,
    late: 0,
    latePct: 0,
    onLeave: 0,
    onLeavePct: 0,
    holiday: 0,
    holidayPct: 0,
  },
  myStatus,
  myShift,
  actionLoading,
  onCheckIn,
  onCheckOut,
  onStartBreak,
  onEndBreak,
}) {
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const userName = user?.name || "Demo Waiter";
  const userRole = (user?.role || "WAITER").toUpperCase();
  const department =
    user?.department ||
    (userRole === "WAITER"
      ? "Service Department"
      : userRole === "KITCHEN" || userRole === "CHEF"
      ? "Kitchen Department"
      : userRole === "CASHIER"
      ? "Billing Department"
      : userRole === "MANAGER"
      ? "Operations & Management"
      : "Restaurant Administration");

  const initial = userName.charAt(0).toUpperCase();

  const currentStatus = myStatus?.currentStatus || "NOT_CHECKED_IN";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
        {/* Left: Employee Profile + Shift + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-orange-100/90 text-orange-600 border border-orange-200/90 font-black text-2xl flex items-center justify-center shrink-0 shadow-2xs">
            {initial}
          </div>

          {/* Details */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {userName}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <span>{userRole}</span>
              <span>•</span>
              <span className="text-slate-600">{department}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Calendar size={12} className="text-slate-400" />
                {monthName}
              </span>

              {myShift && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  <Sparkles size={10} /> Shift: {myShift.name} ({myShift.startTime} - {myShift.endTime})
                </span>
              )}
            </div>
          </div>

          {/* Quick Check-In / Check-Out Controls (Self Service) */}
          <div className="sm:ml-auto flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {currentStatus === "NOT_CHECKED_IN" && (
              <button
                type="button"
                onClick={onCheckIn}
                disabled={actionLoading === "checkin"}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <LogIn size={14} />
                <span>{actionLoading === "checkin" ? "Checking in..." : "Check In"}</span>
              </button>
            )}

            {currentStatus === "CHECKED_IN" && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onStartBreak}
                  disabled={actionLoading === "breakstart"}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Coffee size={14} />
                  <span>Break</span>
                </button>
                <button
                  type="button"
                  onClick={onCheckOut}
                  disabled={actionLoading === "checkout"}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <LogOut size={14} />
                  <span>Check Out</span>
                </button>
              </div>
            )}

            {currentStatus === "ON_BREAK" && (
              <button
                type="button"
                onClick={onEndBreak}
                disabled={actionLoading === "breakend"}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold shadow-md shadow-sky-500/20 active:scale-95 transition-all animate-pulse disabled:opacity-50"
              >
                <Play size={14} />
                <span>End Break</span>
              </button>
            )}

            {currentStatus === "CHECKED_OUT" && (
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
                ✓ Checked Out
              </span>
            )}
          </div>
        </div>

        {/* Right: 5 Monthly Statistics Cards (Present, Absent, Late, On Leave, Holiday) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 shrink-0 xl:max-w-2xl w-full xl:w-auto">
          {/* Present */}
          <div className="bg-[#ecfdf5] border border-[#a7f3d0]/80 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-slate-900">{stats.present}</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-800">Present</div>
              <div className="text-[10px] font-bold text-slate-500">{stats.presentPct}%</div>
            </div>
          </div>

          {/* Absent */}
          <div className="bg-[#fef2f2] border border-[#fecaca]/80 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-700 flex items-center justify-center shrink-0">
              <XCircle size={18} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-slate-900">{stats.absent}</span>
              </div>
              <div className="text-[10px] font-bold text-rose-800">Absent</div>
              <div className="text-[10px] font-bold text-slate-500">{stats.absentPct}%</div>
            </div>
          </div>

          {/* Late */}
          <div className="bg-[#fffbeb] border border-[#fde68a]/80 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-slate-900">{stats.late}</span>
              </div>
              <div className="text-[10px] font-bold text-amber-800">Late</div>
              <div className="text-[10px] font-bold text-slate-500">{stats.latePct}%</div>
            </div>
          </div>

          {/* On Leave */}
          <div className="bg-[#eff6ff] border border-[#bfdbfe]/80 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-sky-500/15 text-sky-700 flex items-center justify-center shrink-0">
              <Plane size={18} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-slate-900">{stats.onLeave}</span>
              </div>
              <div className="text-[10px] font-bold text-sky-800">On Leave</div>
              <div className="text-[10px] font-bold text-slate-500">{stats.onLeavePct}%</div>
            </div>
          </div>

          {/* Holiday */}
          <div className="col-span-2 sm:col-span-1 bg-[#faf5ff] border border-[#e9d5ff]/80 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-700 flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-slate-900">{stats.holiday}</span>
              </div>
              <div className="text-[10px] font-bold text-purple-800">Holiday</div>
              <div className="text-[10px] font-bold text-slate-500">{stats.holidayPct}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
