import React from "react";
import { ATTENDANCE_STATUS } from "../../../constants/statusConstants";

export default function AttendanceLegend() {
  const legendKeys = [
    "PRESENT",
    "ABSENT",
    "LATE",
    "ON_LEAVE",
    "HOLIDAY",
    "WEEKLY_OFF",
    "NO_RECORD",
  ];

  return (
    <div className="flex items-center gap-4 sm:gap-6 flex-wrap px-1 text-xs font-bold select-none">
      {legendKeys.map((key) => {
        const item = ATTENDANCE_STATUS[key];
        if (!item) return null;
        return (
          <div key={key} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor} shrink-0`} />
            <span className="text-slate-600 text-[11px] font-semibold">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
