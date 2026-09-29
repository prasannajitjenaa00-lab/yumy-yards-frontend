import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function MobileFeatureCard({
  label,
  subtitle,
  to,
  icon: Icon,
  iconBg = "bg-orange-500",
  cardBg = "bg-[#fff7ed] border-orange-100/80",
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
      className={`w-full rounded-2xl p-3 flex items-center justify-between border shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all text-left relative group cursor-pointer ${cardBg}`}
    >
      {/* Left: Icon & Text Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1.5">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${iconBg}`}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-extrabold text-slate-900 leading-tight truncate">
            {label}
          </div>
          {subtitle && (
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-tight mt-0.5 truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Right: Circular Chevron & Optional Notification Badge */}
      <div className="flex flex-col items-center justify-center gap-1 shrink-0">
        {badge && (
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
            {badge}
          </span>
        )}
        <div className="w-6 h-6 rounded-full bg-white shadow-2xs border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-700 transition-colors">
          <ChevronRight size={13} strokeWidth={2.5} />
        </div>
      </div>
    </button>
  );
}

export function MobileFeatureSection({
  title,
  onViewAll,
  children,
  viewAllText = "View All",
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>{viewAllText}</span>
          <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {children}
      </div>
    </section>
  );
}
