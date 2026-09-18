import React from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = "orange",
}) {
  const COLOR_STYLES = {
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-500",
      border: "border-orange-100",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-500",
      border: "border-emerald-100",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-500",
      border: "border-blue-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-500",
      border: "border-purple-100",
    },
    pink: {
      bg: "bg-rose-50",
      text: "text-rose-500",
      border: "border-rose-100",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-500",
      border: "border-amber-100",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-500",
      border: "border-indigo-100",
    },
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-500",
      border: "border-teal-100",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
    },
    sky: {
      bg: "bg-sky-50",
      text: "text-sky-500",
      border: "border-sky-100",
    },
  };

  const scheme = COLOR_STYLES[colorScheme] || COLOR_STYLES.orange;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-full ${scheme.bg} ${scheme.text} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="mt-2 mb-1">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
      </div>

      {subtitle && (
        <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          {subtitle}
        </div>
      )}
    </div>
  );
}
