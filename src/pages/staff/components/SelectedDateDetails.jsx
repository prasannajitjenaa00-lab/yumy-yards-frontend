import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Plane,
  Calendar,
  Coffee,
  Timer,
  AlertTriangle,
  FileText,
  Building,
  Sun,
  Star,
} from "lucide-react";
import { formatTime, formatMinutes } from "../../../utils/attendanceUtils";
import { ATTENDANCE_STATUS } from "../../../constants/statusConstants";

export default function SelectedDateDetails({
  selectedDateStr,
  selectedRecord,
  selectedStatus,
  holidayName,
}) {
  if (!selectedDateStr) return null;

  const [y, m, d] = selectedDateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);

  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "long" });

  const statusKey =
    selectedStatus ||
    selectedRecord?.status ||
    (holidayName ? "HOLIDAY" : "NO_RECORD");

  const statusConfig = ATTENDANCE_STATUS[statusKey] || ATTENDANCE_STATUS.NO_RECORD;

  let icon = <Clock size={20} className="text-slate-400" />;
  let statusText = statusConfig.label;

  switch (statusKey) {
    case "PRESENT":
      icon = <CheckCircle2 size={24} className="text-emerald-600" />;
      statusText = "✓ Present";
      break;
    case "ABSENT":
      icon = <XCircle size={24} className="text-rose-600" />;
      statusText = "✕ Absent";
      break;
    case "LATE":
      icon = <Clock size={24} className="text-amber-600" />;
      statusText = "⏰ Late";
      break;
    case "HALF_DAY":
      icon = <Timer size={24} className="text-orange-600" />;
      statusText = "⏳ Half Day";
      break;
    case "ON_LEAVE":
    case "LEAVE":
      icon = <Plane size={24} className="text-blue-600" />;
      statusText = "✈ On Leave";
      break;
    case "RESTAURANT_CLOSED":
      icon = <Building size={24} className="text-rose-600" />;
      statusText = "🏪 Closed";
      break;
    case "WEEKLY_OFF":
      icon = <Sun size={24} className="text-amber-500" />;
      statusText = "🏖 Weekly Off";
      break;
    case "SPECIAL_OFF":
      icon = <Star size={24} className="text-amber-500" />;
      statusText = "⭐ Special Off";
      break;
    case "HOLIDAY":
      icon = <Calendar size={24} className="text-purple-600" />;
      statusText = "🎉 Holiday";
      break;
    default:
      icon = <Clock size={20} className="text-slate-400" />;
      statusText = "No Record";
  }

  const checkInVal = formatTime(selectedRecord?.checkInTime) || "—";
  const checkOutVal = formatTime(selectedRecord?.checkOutTime) || "—";
  const workHoursVal = formatMinutes(selectedRecord?.totalWorkMinutes || 0);
  const breakVal = formatMinutes(selectedRecord?.totalBreakMinutes || 0);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
        Selected Date Details
      </h3>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left: Date header & status badge */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
              {icon}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-slate-900 tracking-tight">
                  {formattedDate}
                </h4>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.badgeClass}`}
                >
                  {statusText}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">{dayName}</p>
              {holidayName && (
                <p className="text-xs font-bold text-purple-700 mt-0.5">
                  Holiday / Off: <span className="font-extrabold">{holidayName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Right Metrics: Check In, Check Out, Work Hours, Break */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {/* Check In */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                Check In
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 font-mono">
                {checkInVal}
              </div>
              {selectedRecord?.isLate && (
                <div className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                  <AlertTriangle size={10} /> Late by {selectedRecord.lateByMinutes}m
                </div>
              )}
            </div>

            {/* Check Out */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                Check Out
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 font-mono">
                {checkOutVal}
              </div>
              {selectedRecord?.isEarlyLeave && (
                <div className="text-[10px] font-bold text-sky-600">
                  Early by {selectedRecord.earlyLeaveByMinutes}m
                </div>
              )}
            </div>

            {/* Work Hours */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                Work Hours
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900">
                {workHoursVal}
              </div>
              {selectedRecord?.overtimeMinutes > 0 && (
                <div className="text-[10px] font-bold text-emerald-600">
                  +{formatMinutes(selectedRecord.overtimeMinutes)} overtime
                </div>
              )}
            </div>

            {/* Break */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 flex items-center gap-1">
                <Coffee size={11} className="text-amber-500" /> Break
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900">
                {breakVal}
              </div>
              {selectedRecord?.breaks?.length > 0 && (
                <div className="text-[10px] font-semibold text-slate-400">
                  {selectedRecord.breaks.length} session(s)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Optional Notes */}
        {selectedRecord?.notes && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <FileText size={13} className="text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700">Notes:</span>
            <span>{selectedRecord.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
