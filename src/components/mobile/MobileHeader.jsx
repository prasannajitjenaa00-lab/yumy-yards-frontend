import React from "react";
import { useSelector } from "react-redux";
import { Flame, Bell } from "lucide-react";

export default function MobileHeader({ onOpenNotifications, onOpenProfile, unreadCount = 0 }) {
  const { user } = useSelector((s) => s.auth);
  const avatarInitial = user?.name ? user.name[0].toUpperCase() : "A";

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-xs">
      {/* Left: Brand logo & Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
          <Flame size={20} className="fill-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight truncate">
            Yummy Yards
          </h1>
          <p className="text-[11px] font-semibold text-orange-600 tracking-wide uppercase leading-none">
            Pro Billing Centre
          </p>
        </div>
      </div>

      {/* Right: Notification & Profile */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Open notifications"
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-black bg-rose-500 text-white rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="Open profile"
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200/80 text-orange-700 font-bold text-sm flex items-center justify-center active:scale-95 shadow-2xs transition-all"
        >
          {avatarInitial}
        </button>
      </div>
    </header>
  );
}
