import React from "react";
import { useSelector } from "react-redux";
import { Flame, Bell } from "lucide-react";

export default function MobileHeader({ onOpenNotifications, onOpenProfile, unreadCount = 0 }) {
  const { user } = useSelector((s) => s.auth);
  const avatarInitial = user?.name ? user.name[0].toUpperCase() : "R";

  return (
    <header className="sticky top-0 z-30 bg-[#0f172a] text-white rounded-b-[24px] px-4 py-3.5 flex items-center justify-between shadow-lg">
      {/* Left: Brand logo & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
          <Flame size={22} className="fill-white text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-extrabold text-white tracking-tight leading-tight truncate">
            Yummy Yards
          </h1>
          <p className="text-[10px] font-bold text-orange-400 tracking-wider uppercase leading-none mt-0.5">
            PRO BILLING CENTRE
          </p>
        </div>
      </div>

      {/* Right: Notification & Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Open notifications"
          className="relative p-2 text-white/90 hover:text-white rounded-xl active:scale-95 transition-all cursor-pointer"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 text-[9px] font-black bg-rose-500 text-white rounded-full flex items-center justify-center ring-2 ring-[#0f172a] animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="Open profile"
          className="w-9 h-9 rounded-full bg-white text-orange-600 font-extrabold text-sm flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer shrink-0 border border-white/20"
        >
          {avatarInitial}
        </button>
      </div>
    </header>
  );
}
