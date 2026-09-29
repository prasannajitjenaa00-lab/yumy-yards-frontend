import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, Calendar, LayoutGrid, Bell, User } from "lucide-react";

export default function MobileBottomNav({
  onOpenMore,
  onOpenNotifications,
  onOpenProfile,
  isMoreOpen,
  isNotificationsOpen,
  isProfileOpen,
  unreadCount = 2,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const getHomeRoute = () => {
    if (user?.role === "OWNER") return "/owner/dashboard";
    if (user?.role === "MANAGER") return "/manager/dashboard";
    if (user?.role === "CASHIER") return "/cashier/pos";
    if (user?.role === "WAITER") return "/waiter/orders";
    if (user?.role === "KITCHEN") return "/kitchen";
    return "/";
  };

  const isHomeActive =
    !isMoreOpen &&
    !isNotificationsOpen &&
    !isProfileOpen &&
    (location.pathname === "/owner/dashboard" ||
      location.pathname === "/manager/dashboard" ||
      location.pathname === "/");

  const isAttendanceActive =
    !isMoreOpen &&
    !isNotificationsOpen &&
    !isProfileOpen &&
    (location.pathname.startsWith("/staff/attendance") ||
      location.pathname === "/attendance");

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] rounded-t-3xl px-3 py-2"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => navigate(getHomeRoute())}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            isHomeActive
              ? "bg-[#fff4eb] text-orange-600 font-extrabold"
              : "text-slate-400 hover:text-slate-700 font-medium"
          }`}
          aria-label="Home"
        >
          <Home
            size={22}
            className={isHomeActive ? "fill-orange-500 text-orange-500 stroke-[2]" : "stroke-[1.8]"}
          />
          <span className="text-[11px] mt-1 tracking-tight">Home</span>
        </button>

        {/* 2. Attendance */}
        <button
          type="button"
          onClick={() => navigate("/staff/attendance")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            isAttendanceActive
              ? "bg-[#fff4eb] text-orange-600 font-extrabold"
              : "text-slate-400 hover:text-slate-700 font-medium"
          }`}
          aria-label="Attendance"
        >
          <Calendar
            size={22}
            className={isAttendanceActive ? "text-orange-500 stroke-[2.2]" : "stroke-[1.8]"}
          />
          <span className="text-[11px] mt-1 tracking-tight">Attendance</span>
        </button>

        {/* 3. More */}
        <button
          type="button"
          onClick={onOpenMore}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            isMoreOpen
              ? "bg-[#fff4eb] text-orange-600 font-extrabold"
              : "text-slate-400 hover:text-slate-700 font-medium"
          }`}
          aria-label="More"
        >
          <LayoutGrid
            size={22}
            className={isMoreOpen ? "text-orange-500 stroke-[2.2]" : "stroke-[1.8]"}
          />
          <span className="text-[11px] mt-1 tracking-tight">More</span>
        </button>

        {/* 4. Notifications */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer relative ${
            isNotificationsOpen
              ? "bg-[#fff4eb] text-orange-600 font-extrabold"
              : "text-slate-400 hover:text-slate-700 font-medium"
          }`}
          aria-label="Notifications"
        >
          <div className="relative">
            <Bell
              size={22}
              className={isNotificationsOpen ? "text-orange-500 stroke-[2.2]" : "stroke-[1.8]"}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-black bg-rose-500 text-white rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Notifications</span>
        </button>

        {/* 5. Profile */}
        <button
          type="button"
          onClick={onOpenProfile}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            isProfileOpen
              ? "bg-[#fff4eb] text-orange-600 font-extrabold"
              : "text-slate-400 hover:text-slate-700 font-medium"
          }`}
          aria-label="Profile"
        >
          <User
            size={22}
            className={isProfileOpen ? "text-orange-500 stroke-[2.2]" : "stroke-[1.8]"}
          />
          <span className="text-[11px] mt-1 tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
}
