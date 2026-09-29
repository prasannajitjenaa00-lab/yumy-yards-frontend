import React from "react";

export default function MobileKpiCard({
  title,
  value,
  secondary,
  icon: Icon,
  badgeText,
  badgeType = "positive", // "positive" | "neutral" | "warning" | "info"
  colorClass = "bg-orange-500 text-white",
  bgAccent = "bg-orange-50",
  progressPercent,
  onClick,
}) {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "info":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "neutral":
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
        onClick ? "cursor-pointer active:scale-[0.98]" : ""
      }`}
    >
      {/* Top row: Icon & Title */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[12px] font-bold text-slate-500 tracking-tight truncate">
          {title}
        </span>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${colorClass}`}
        >
          <Icon size={16} />
        </div>
      </div>

      {/* Main KPI Value */}
      <div className="my-1">
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </div>
      </div>

      {/* Bottom row: Secondary info & Badge */}
      <div className="flex items-center justify-between gap-1.5 mt-1 pt-1.5 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 truncate">
          {secondary}
        </span>
        {badgeText && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black border tracking-tight shrink-0 ${getBadgeStyle()}`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Progress bar if present */}
      {typeof progressPercent === "number" && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
}
