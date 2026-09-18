import React from "react";
import { useSelector } from "react-redux";
import { Calendar, ChevronDown, Utensils } from "lucide-react";
import { format } from "date-fns";

export default function DashboardHeader() {
  const { user } = useSelector((s) => s.auth);

  let formattedDate = "";
  try {
    formattedDate = format(new Date(), "EEE, dd MMM yyyy");
  } catch (e) {
    formattedDate = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Use user's name if available, fallback to "Owner"
  const displayName = user?.name ? user.name.split(" ")[0] : "Owner";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
      {/* Subtle Background Art Accent */}
      <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none text-orange-500">
        <Utensils size={160} />
      </div>

      <div className="relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Good Morning, {displayName}! <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's what's happening at <span className="font-semibold text-slate-700">Yummy Yards</span> today.
        </p>
      </div>

      <div className="flex items-center gap-3 relative z-10 self-start md:self-auto">
        {/* Subtle Tag Banner */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-medium italic">
          <span>Good Food Brings People Together</span>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 cursor-pointer transition-all">
          <Calendar size={15} className="text-orange-500" />
          <span>{formattedDate}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
}
