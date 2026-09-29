import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  X,
  LogOut,
  Settings,
  Clock,
  Coffee,
  CalendarDays,
  Shield,
  User,
  ChevronRight,
  Sun,
  Moon,
  HelpCircle,
} from "lucide-react";
import { clearCredentials } from "../../store/slices/authSlice";
import { logout as logoutApi } from "../../services/authService";

export default function MobileProfileDrawer({
  isOpen,
  onClose,
  onOpenSupport,
  isDarkMode = false,
  onToggleTheme,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      /* ignore */
    }
    dispatch(clearCredentials());
    toast.info("Logged out successfully");
    onClose();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const avatarInitial = user?.name ? user.name[0].toUpperCase() : "A";
  const userRole = user?.role || "OWNER";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      <div
        className="w-full bg-slate-50 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shrink-0">
          <span className="text-sm font-extrabold text-slate-900">Admin Profile</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-white border-b border-slate-200/60">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
              {avatarInitial}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-extrabold text-slate-900 truncate">
                {user?.name || "Restaurant Admin"}
              </h3>
              <p className="text-xs text-slate-500 truncate">{user?.email || "admin@yummyyards.com"}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-700 border border-orange-200">
                  <Shield size={10} />
                  {userRole}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Menu Options */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Personal & Work
          </span>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
            <button
              type="button"
              onClick={() => handleNavigate("/staff/attendance")}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">My Attendance</div>
                  <div className="text-[10px] text-slate-400">View check-ins & shifts</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("/staff/leave")}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Coffee size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">My Leaves & Balances</div>
                  <div className="text-[10px] text-slate-400">Apply & check request status</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("/staff/holidays")}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Holidays & Off Days</div>
                  <div className="text-[10px] text-slate-400">View upcoming restaurant holidays</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>

            {userRole === "OWNER" && (
              <button
                type="button"
                onClick={() => handleNavigate("/owner/settings")}
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Settings size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Restaurant Settings</div>
                    <div className="text-[10px] text-slate-400">Taxes, billing & store profile</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            )}

            {/* Help & Support */}
            <button
              type="button"
              onClick={onOpenSupport}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Need Help? Support</div>
                  <div className="text-[10px] text-slate-400">We're here to support you</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>

            {/* Day / Night Theme Toggle */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {isDarkMode ? "Light Theme" : "Night / Dark Theme"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isDarkMode ? "Switch to day appearance" : "Switch to night appearance"}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-orange-600">
                  {isDarkMode ? "Active" : "Switch"}
                </span>
              </button>
            )}
          </div>

          {/* Logout Section */}
          <div className="pt-3">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200/80 transition-all active:scale-[0.98]"
            >
              <LogOut size={16} />
              <span>Log Out of Billing Centre</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
