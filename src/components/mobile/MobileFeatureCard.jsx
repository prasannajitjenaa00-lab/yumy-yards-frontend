import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function MobileFeatureCard({
  label,
  to,
  icon: Icon,
  color = "bg-orange-500 text-white",
  badge,
  onClick,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-orange-300 hover:shadow-xs active:scale-[0.97] transition-all text-center min-h-[96px] w-full relative group"
    >
      {badge && (
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-500 text-white">
          {badge}
        </span>
      )}
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs mb-2 transition-transform group-hover:scale-105 ${color}`}
      >
        <Icon size={22} />
      </div>
      <span className="text-xs font-bold text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors truncate max-w-full">
        {label}
      </span>
    </button>
  );
}

export function MobileFeatureSection({
  title,
  onViewAll,
  children,
  viewAllText = "View All >",
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">{title}</h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 transition-colors"
          >
            {viewAllText}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
