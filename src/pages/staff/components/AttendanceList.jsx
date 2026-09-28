import React, { useState, useMemo } from "react";
import { Search, Calendar, Eye } from "lucide-react";
import { formatTime, formatMinutes } from "../../../utils/attendanceUtils";
import { ATTENDANCE_STATUS } from "../../../constants/statusConstants";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AttendanceList({ records = [], onSelectRecord }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Status filter
      if (statusFilter !== "ALL" && rec.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (fromDate) {
        const d = new Date(rec.date);
        if (d < new Date(fromDate)) return false;
      }
      if (toDate) {
        const d = new Date(rec.date);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }

      // Search query filter
      if (search) {
        const q = search.toLowerCase();
        const userName = rec.user?.name?.toLowerCase() || "";
        const notes = rec.notes?.toLowerCase() || "";
        const formatted = formatDate(rec.date).toLowerCase();
        if (!userName.includes(q) && !notes.includes(q) && !formatted.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [records, search, statusFilter, fromDate, toDate]);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by notes or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:border-blue-500 focus:outline-none font-medium"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:border-blue-500 focus:outline-none font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="HOLIDAY">Holiday</option>
            </select>
          </div>

          {/* From Date */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Work Hours</th>
                <th className="py-3 px-4">Break</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRecords.map((rec) => {
                const dateObj = new Date(rec.date);
                const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "short" });
                const st = rec.status || "PRESENT";
                const statusConfig = ATTENDANCE_STATUS[st] || ATTENDANCE_STATUS.NO_RECORD;

                return (
                  <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {formatDate(rec.date)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-semibold">{dayName}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {formatTime(rec.checkInTime) || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {formatTime(rec.checkOutTime) || "—"}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {formatMinutes(rec.totalWorkMinutes)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatMinutes(rec.totalBreakMinutes)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badgeClass}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectRecord(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-bold transition-colors"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Calendar size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No attendance records found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or date range</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
