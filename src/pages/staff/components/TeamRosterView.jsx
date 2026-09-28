import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Coffee,
  LogOut,
  XCircle,
  LogIn,
  Timer,
  AlertTriangle,
} from "lucide-react";

function formatTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatMinutes(min) {
  if (!min || min <= 0) return "0h 0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

function getLiveDuration(startTime) {
  if (!startTime) return "0h 0m";
  const diff = Math.round((Date.now() - new Date(startTime).getTime()) / 60000);
  return formatMinutes(Math.max(diff, 0));
}

const STATUS_STYLES = {
  CHECKED_IN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ON_BREAK: "bg-amber-50 text-amber-700 border-amber-200",
  CHECKED_OUT: "bg-slate-100 text-slate-600 border-slate-200",
  NOT_CHECKED_IN: "bg-red-50 text-red-600 border-red-200",
};

export default function TeamRosterView({
  todayList = [],
  isManager,
  actionLoading,
  onCheckInFor,
  onCheckOutFor,
}) {
  const [search, setSearch] = useState("");

  const filteredList = useMemo(() => {
    if (!search) return todayList;
    const q = search.toLowerCase();
    return todayList.filter((item) =>
      item.user?.name?.toLowerCase().includes(q) ||
      item.user?.role?.toLowerCase().includes(q) ||
      item.currentStatus?.toLowerCase().includes(q)
    );
  }, [todayList, search]);

  const checkedInCount = todayList.filter((i) => i.currentStatus === "CHECKED_IN").length;
  const breakCount = todayList.filter((i) => i.currentStatus === "ON_BREAK").length;
  const checkedOutCount = todayList.filter((i) => i.currentStatus === "CHECKED_OUT").length;
  const notInCount = todayList.filter((i) => i.currentStatus === "NOT_CHECKED_IN").length;

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-emerald-950">{checkedInCount}</p>
            <p className="text-xs font-bold text-emerald-800">Checked In</p>
          </div>
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-amber-950">{breakCount}</p>
            <p className="text-xs font-bold text-amber-800">On Break</p>
          </div>
          <Coffee size={24} className="text-amber-500" />
        </div>

        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-slate-900">{checkedOutCount}</p>
            <p className="text-xs font-bold text-slate-600">Checked Out</p>
          </div>
          <LogOut size={24} className="text-slate-500" />
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-rose-950">{notInCount}</p>
            <p className="text-xs font-bold text-rose-800">Not Checked In</p>
          </div>
          <XCircle size={24} className="text-rose-500" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search team members by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-medium shadow-2xs"
        />
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredList.map((item) => {
          const { user: staffUser, attendance, currentStatus } = item;
          const initial = staffUser?.name?.charAt(0).toUpperCase() || "?";

          return (
            <div
              key={staffUser._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 font-black text-sm flex items-center justify-center shrink-0 border border-orange-200">
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{staffUser?.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{staffUser?.role}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      STATUS_STYLES[currentStatus] || "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {currentStatus === "CHECKED_IN" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    {currentStatus.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Timings */}
                {attendance && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl text-xs mb-3">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Check In</span>
                      <span className="font-mono font-bold text-slate-800">{formatTime(attendance.checkInTime)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Check Out</span>
                      <span className="font-mono font-bold text-slate-800">{formatTime(attendance.checkOutTime)}</span>
                    </div>
                  </div>
                )}

                {/* Live duration */}
                {attendance?.checkInTime && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                    <Timer size={13} className="text-slate-400" />
                    <span className="font-bold">
                      {attendance.checkOutTime
                        ? formatMinutes(attendance.totalWorkMinutes)
                        : getLiveDuration(attendance.checkInTime)}
                    </span>
                    {attendance.isLate && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[9px]">
                        LATE {attendance.lateByMinutes}m
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Manager Actions */}
              {isManager && (
                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  {currentStatus === "NOT_CHECKED_IN" && (
                    <button
                      type="button"
                      onClick={() => onCheckInFor(staffUser._id)}
                      disabled={actionLoading === `checkin-${staffUser._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <LogIn size={13} /> Check In
                    </button>
                  )}
                  {(currentStatus === "CHECKED_IN" || currentStatus === "ON_BREAK") && (
                    <button
                      type="button"
                      onClick={() => onCheckOutFor(staffUser._id)}
                      disabled={actionLoading === `checkout-${staffUser._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <LogOut size={13} /> Check Out
                    </button>
                  )}
                  {currentStatus === "CHECKED_OUT" && (
                    <span className="flex-1 text-center text-xs text-slate-400 font-medium py-1.5">
                      Shift Completed
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Users size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No staff members found</p>
          </div>
        )}
      </div>
    </div>
  );
}
