import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Plane,
  Calendar,
  Timer,
  TrendingUp,
  Sparkles,
  Zap,
} from "lucide-react";

function formatMinutes(min) {
  if (!min || min <= 0) return "0h 0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export default function AttendanceSummary({ summaryData, stats }) {
  const sum = summaryData?.summary || {};

  const totalDays = stats?.totalRecordedDays || sum.totalDays || 30;
  const presentCount = stats?.present ?? sum.present ?? 0;
  const absentCount = stats?.absent ?? sum.absent ?? 0;
  const lateCount = stats?.late ?? sum.late ?? 0;
  const leaveCount = stats?.onLeave ?? sum.leave ?? 0;
  const holidayCount = stats?.holiday ?? 0;

  const totalWorkMin = sum.totalWorkMinutes || 0;
  const totalOvertimeMin = sum.totalOvertimeMinutes || 0;
  const totalBreakMin = sum.totalBreakMinutes || 0;
  const avgWorkMin = sum.avgWorkMinutesPerDay || (presentCount > 0 ? Math.round(totalWorkMin / presentCount) : 0);

  const presentPct = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
  const absentPct = totalDays > 0 ? Math.round((absentCount / totalDays) * 100) : 0;
  const latePct = totalDays > 0 ? Math.round((lateCount / totalDays) * 100) : 0;
  const leavePct = totalDays > 0 ? Math.round((leaveCount / totalDays) * 100) : 0;
  const holidayPct = totalDays > 0 ? Math.round((holidayCount / totalDays) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Top 8 KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {/* Total Work Hours */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">Total Work Hours</span>
            <Timer size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatMinutes(totalWorkMin)}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Avg: {formatMinutes(avgWorkMin)} / day
          </p>
        </div>

        {/* Present Days */}
        <div className="bg-[#ecfdf5] rounded-2xl border border-[#a7f3d0] p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">Present Days</span>
            <CheckCircle2 size={16} />
          </div>
          <p className="text-2xl font-black text-emerald-900">{presentCount}</p>
          <p className="text-[10px] text-emerald-700 font-bold mt-1">{presentPct}% of month</p>
        </div>

        {/* Absent Days */}
        <div className="bg-[#fef2f2] rounded-2xl border border-[#fecaca] p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">Absent Days</span>
            <XCircle size={16} />
          </div>
          <p className="text-2xl font-black text-rose-900">{absentCount}</p>
          <p className="text-[10px] text-rose-700 font-bold mt-1">{absentPct}% of month</p>
        </div>

        {/* Late Days */}
        <div className="bg-[#fffbeb] rounded-2xl border border-[#fde68a] p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">Late Days</span>
            <Clock size={16} />
          </div>
          <p className="text-2xl font-black text-amber-900">{lateCount}</p>
          <p className="text-[10px] text-amber-700 font-bold mt-1">{latePct}% of month</p>
        </div>

        {/* Leave Days */}
        <div className="bg-[#eff6ff] rounded-2xl border border-[#bfdbfe] p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-sky-700 mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">Leave Days</span>
            <Plane size={16} />
          </div>
          <p className="text-2xl font-black text-sky-900">{leaveCount}</p>
          <p className="text-[10px] text-sky-700 font-bold mt-1">{leavePct}% of month</p>
        </div>

        {/* Holidays */}
        <div className="bg-[#faf5ff] rounded-2xl border border-[#e9d5ff] p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-700 mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">Holidays</span>
            <Calendar size={16} />
          </div>
          <p className="text-2xl font-black text-purple-900">{holidayCount}</p>
          <p className="text-[10px] text-purple-700 font-bold mt-1">{holidayPct}% of month</p>
        </div>

        {/* Overtime */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">Total Overtime</span>
            <Zap size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">+{formatMinutes(totalOvertimeMin)}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Extra productive time</p>
        </div>

        {/* Total Breaks */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">Total Breaks</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{formatMinutes(totalBreakMin)}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Rest & meal breaks</p>
        </div>
      </div>

      {/* Visual Distribution & Progress Bars */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-600" />
          Monthly Attendance Distribution
        </h3>

        {/* Multi-segmented distribution bar */}
        <div className="h-4 rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5">
          {presentPct > 0 && (
            <div
              style={{ width: `${presentPct}%` }}
              className="bg-emerald-500 h-full rounded-full transition-all"
              title={`Present: ${presentPct}%`}
            />
          )}
          {latePct > 0 && (
            <div
              style={{ width: `${latePct}%` }}
              className="bg-amber-500 h-full rounded-full transition-all"
              title={`Late: ${latePct}%`}
            />
          )}
          {absentPct > 0 && (
            <div
              style={{ width: `${absentPct}%` }}
              className="bg-rose-500 h-full rounded-full transition-all"
              title={`Absent: ${absentPct}%`}
            />
          )}
          {leavePct > 0 && (
            <div
              style={{ width: `${leavePct}%` }}
              className="bg-sky-500 h-full rounded-full transition-all"
              title={`On Leave: ${leavePct}%`}
            />
          )}
          {holidayPct > 0 && (
            <div
              style={{ width: `${holidayPct}%` }}
              className="bg-purple-500 h-full rounded-full transition-all"
              title={`Holiday: ${holidayPct}%`}
            />
          )}
        </div>

        {/* Legend pills with counts */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-emerald-800">Present</div>
              <div className="text-xs font-black text-emerald-950">{presentCount} days ({presentPct}%)</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-rose-800">Absent</div>
              <div className="text-xs font-black text-rose-950">{absentCount} days ({absentPct}%)</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-amber-800">Late</div>
              <div className="text-xs font-black text-amber-950">{lateCount} days ({latePct}%)</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-sky-800">On Leave</div>
              <div className="text-xs font-black text-sky-950">{leaveCount} days ({leavePct}%)</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-purple-800">Holiday</div>
              <div className="text-xs font-black text-purple-950">{holidayCount} days ({holidayPct}%)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
