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
  unreadCount = 0,
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
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg px-2"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {/* Home */}
        <button
          type="button"
          onClick={() => navigate(getHomeRoute())}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all rounded-xl ${
            isHomeActive
              ? "text-orange-600 font-bold scale-105"
              : "text-slate-500 hover:text-slate-800"
          }`}
          aria-label="Home"
        >
          <div className="relative">
            <Home size={22} className={isHomeActive ? "stroke-[2.5]" : "stroke-[1.8]"} />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">Home</span>
        </button>

        {/* Attendance */}
        <button
          type="button"
          onClick={() => navigate("/staff/attendance")}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all rounded-xl ${
            isAttendanceActive
              ? "text-orange-600 font-bold scale-105"
              : "text-slate-500 hover:text-slate-800"
          }`}
          aria-label="Attendance"
        >
          <div className="relative">
            <Calendar size={22} className={isAttendanceActive ? "stroke-[2.5]" : "stroke-[1.8]"} />
            {isAttendanceActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">Attendance</span>
        </button>

        {/* More */}
        <button
          type="button"
          onClick={onOpenMore}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all rounded-xl ${
            isMoreOpen
              ? "text-orange-600 font-bold scale-105"
              : "text-slate-500 hover:text-slate-800"
          }`}
          aria-label="More Modules"
        >
          <div className="relative">
            <LayoutGrid size={22} className={isMoreOpen ? "stroke-[2.5]" : "stroke-[1.8]"} />
            {isMoreOpen && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">More</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all rounded-xl ${
            isNotificationsOpen
              ? "text-orange-600 font-bold scale-105"
              : "text-slate-500 hover:text-slate-800"
          }`}
          aria-label="Notifications"
        >
          <div className="relative">
            <Bell size={22} className={isNotificationsOpen ? "stroke-[2.5]" : "stroke-[1.8]"} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[9px] font-black bg-rose-500 text-white rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            {isNotificationsOpen && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">Alerts</span>
        </button>

        {/* Profile */}
        <button
          type="button"
          onClick={onOpenProfile}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all rounded-xl ${
            isProfileOpen
              ? "text-orange-600 font-bold scale-105"
              : "text-slate-500 hover:text-slate-800"
          }`}
          aria-label="Profile"
        >
          <div className="relative">
            <User size={22} className={isProfileOpen ? "stroke-[2.5]" : "stroke-[1.8]"} />
            {isProfileOpen && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}
