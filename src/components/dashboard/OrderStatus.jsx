import React from "react";
import { Clock } from "lucide-react";

export default function OrderStatus({ pendingCount = 0, preparingCount = 0, readyCount = 0, completedCount = 0 }) {
  const total = (pendingCount || 0) + (preparingCount || 0) + (readyCount || 0) + (completedCount || 0);

  const calcPercentage = (count) => {
    if (!total || total === 0) return "0%";
    return `${Math.round((count / total) * 100)}%`;
  };

  const STATUSES = [
    {
      label: "Pending KOTs",
      count: pendingCount || 0,
      color: "bg-orange-500",
      textColor: "text-slate-700",
      pct: calcPercentage(pendingCount),
    },
    {
      label: "Preparing",
      count: preparingCount || 0,
      color: "bg-blue-500",
      textColor: "text-slate-700",
      pct: calcPercentage(preparingCount),
    },
    {
      label: "Ready",
      count: readyCount || 0,
      color: "bg-emerald-500",
      textColor: "text-slate-700",
      pct: calcPercentage(readyCount),
    },
    {
      label: "Completed",
      count: completedCount || 0,
      color: "bg-slate-400",
      textColor: "text-slate-700",
      pct: calcPercentage(completedCount),
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              Order Status
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Live order status today</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
            {total} Total
          </span>
        </div>

        <div className="space-y-3.5 mt-2">
          {STATUSES.map((st) => (
            <div key={st.label} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${st.color} shrink-0`}></span>
                <span className={`font-medium ${st.textColor}`}>{st.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900 text-sm">{st.count}</span>
                <span className="text-slate-400 font-semibold w-8 text-right">{st.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
