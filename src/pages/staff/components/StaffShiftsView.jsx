import React from "react";
import {
  CalendarRange,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

function formatMinutes(min) {
  if (!min || min <= 0) return "0h 0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export default function StaffShiftsView({
  shifts = [],
  myShift,
  isManager,
  onOpenNewShift,
  onOpenEditShift,
  onDeleteShift,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            Work Shift Schedule & Roster
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Configure shift timings, grace periods, and assign staff members
          </p>
        </div>
        {isManager && (
          <button
            type="button"
            onClick={onOpenNewShift}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus size={14} /> Create Shift
          </button>
        )}
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map((shift) => {
          const isMyShift = myShift?._id === shift._id;

          return (
            <div
              key={shift._id}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between relative overflow-hidden ${
                isMyShift
                  ? "border-orange-400 shadow-md ring-2 ring-orange-400/20"
                  : "border-slate-200/80 shadow-sm hover:shadow-md"
              }`}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: shift.color || "#f97316" }}
              />

              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-base">{shift.name}</h4>
                      {isMyShift && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-100 text-orange-700">
                          YOUR SHIFT
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      <span className="font-mono text-slate-800 font-bold">{shift.startTime}</span> —{" "}
                      <span className="font-mono text-slate-800 font-bold">{shift.endTime}</span>
                      <span className="text-[10px] text-slate-400">
                        ({formatMinutes(shift.expectedShiftMinutes)})
                      </span>
                    </p>
                  </div>

                  {isManager && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenEditShift(shift)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Shift"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteShift(shift._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Shift"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Grace & Active Days */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                    Grace: {shift.gracePeriodMinutes || 15}m
                  </span>
                  {shift.days?.map((d) => (
                    <span
                      key={d}
                      className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[9px] font-bold"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                {/* Assigned Staff */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2">
                    Assigned Staff ({shift.assignedUsers?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {shift.assignedUsers?.map((u) => (
                      <div
                        key={u._id || u}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        <div className="w-4 h-4 rounded-full bg-orange-200 text-orange-700 text-[9px] font-black flex items-center justify-center">
                          {u.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="font-semibold">{u.name}</span>
                        <span className="text-[9px] text-slate-400">({u.role})</span>
                      </div>
                    ))}
                    {(!shift.assignedUsers || shift.assignedUsers.length === 0) && (
                      <span className="text-xs text-slate-400 italic">No staff assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {shifts.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <CalendarRange size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No shifts created yet</p>
            <p className="text-xs text-slate-400 mt-1">Create your restaurant's working shifts to manage schedules</p>
          </div>
        )}
      </div>
    </div>
  );
}
