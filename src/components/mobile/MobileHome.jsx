import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  TrendingUp,
  ClipboardList,
  Users,
  Coffee,
  UtensilsCrossed,
  Table2,
  ChefHat,
  Utensils,
  Package,
  Clock,
  CalendarOff,
  Wallet,
  Coins,
  DollarSign,
  BarChart3,
  Truck,
  Settings,
  AlertCircle,
  RefreshCw,
  Sparkles,
  CalendarDays,
  UserCheck,
} from "lucide-react";
import { getDashboard } from "../../services/reportService";
import { getTodayAttendance, getMyAttendanceStatus } from "../../services/attendanceService";
import { getLeaveSummary } from "../../services/leaveService";
import MobileKpiCard from "./MobileKpiCard";
import { MobileFeatureCard, MobileFeatureSection } from "./MobileFeatureCard";

export default function MobileHome({ onOpenMore }) {
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const handleOpenMore = onOpenMore || outletCtx.openMore;

  const { user } = useSelector((s) => s.auth);
  const userRole = user?.role || "OWNER";
  const isManagerOrOwner = userRole === "OWNER" || userRole === "MANAGER";

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [myAttendance, setMyAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic Date & Greeting
  const { greeting, dayName, dayNum, monthName } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const g =
      hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    const dName = now.toLocaleDateString("en-US", { weekday: "short" });
    const dNum = now.getDate();
    const mName = now.toLocaleDateString("en-US", { month: "short" });
    return { greeting: g, dayName: dName, dayNum: dNum, monthName: mName };
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isManagerOrOwner) {
        // Fetch Admin KPIs concurrently
        const [dashRes, attRes, leaveRes] = await Promise.allSettled([
          getDashboard(),
          getTodayAttendance(),
          getLeaveSummary(),
        ]);

        if (dashRes.status === "fulfilled" && dashRes.value?.data) {
          setDashboardData(dashRes.value.data);
        }
        if (attRes.status === "fulfilled" && Array.isArray(attRes.value?.data?.data)) {
          setAttendanceList(attRes.value.data.data);
        }
        if (leaveRes.status === "fulfilled" && leaveRes.value?.data?.data) {
          setLeaveSummary(leaveRes.value.data.data);
        }
      } else {
        // Employee quick status
        const myAttRes = await getMyAttendanceStatus();
        setMyAttendance(myAttRes?.data?.data || null);
      }
    } catch (err) {
      console.error("Mobile home load error:", err);
      setError("Unable to load latest dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userRole]);

  // Derived KPI metrics
  const totalStaffCount = attendanceList.length || 0;
  const presentStaffCount = attendanceList.filter(
    (s) =>
      s.currentStatus === "CHECKED_IN" ||
      s.currentStatus === "ON_BREAK" ||
      s.currentStatus === "CHECKED_OUT" ||
      s.attendance?.isCheckedIn ||
      s.attendance?.checkOutTime
  ).length;

  const onLeaveCount =
    leaveSummary?.currentlyOnLeave ??
    attendanceList.filter((s) => s.attendance?.status === "LEAVE" || s.attendance?.status === "ON_LEAVE").length;

  const pendingLeaves = leaveSummary?.pendingRequests || 0;

  const salesValue = dashboardData?.todaysSales
    ? `₹${dashboardData.todaysSales.toLocaleString("en-IN")}`
    : "₹0";

  const ordersCount = dashboardData?.todaysOrders ?? 0;
  const pendingOrdersCount = dashboardData?.pendingKots ?? 0;

  return (
    <div className="space-y-5 px-3.5 py-4 max-w-lg mx-auto">
      {/* 2. WELCOME / DATE SECTION */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-md relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1 z-10 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Overview</span>
          </div>
          <h2 className="text-lg font-black tracking-tight leading-tight truncate">
            {greeting}, {user?.name?.split(" ")[0] || "Admin"} 👋
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Here's what's happening today
          </p>
        </div>

        {/* Dynamic Date Calendar Badge */}
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shrink-0 shadow-inner">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider leading-none">
            {dayName}
          </span>
          <span className="text-lg font-black text-white leading-tight">
            {dayNum}
          </span>
          <span className="text-[10px] font-medium text-slate-300 leading-none">
            {monthName}
          </span>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 3. ADMIN KPI CARDS (2-column responsive grid for Owner / Manager) */}
      {isManagerOrOwner ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Today's Key Metrics
            </h3>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="text-slate-400 hover:text-slate-600 p-1"
              aria-label="Refresh KPIs"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-orange-500" : ""} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Today's Sales */}
            <MobileKpiCard
              title="Today's Sales"
              value={salesValue}
              secondary="vs Yesterday"
              badgeText="↑ 12%"
              badgeType="positive"
              icon={TrendingUp}
              colorClass="bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              onClick={() => navigate("/reports")}
            />

            {/* Card 2: Orders */}
            <MobileKpiCard
              title="Orders"
              value={ordersCount}
              secondary={`${pendingOrdersCount} Pending`}
              badgeText={pendingOrdersCount > 0 ? "Live" : "Synced"}
              badgeType={pendingOrdersCount > 0 ? "warning" : "info"}
              icon={ClipboardList}
              colorClass="bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
              onClick={() => navigate("/orders")}
            />

            {/* Card 3: Present Staff */}
            <MobileKpiCard
              title="Present Staff"
              value={totalStaffCount > 0 ? `${presentStaffCount} / ${totalStaffCount}` : "0 / 0"}
              secondary={
                totalStaffCount > 0
                  ? `${Math.round((presentStaffCount / totalStaffCount) * 100)}% On Duty`
                  : "Attendance"
              }
              badgeText="Present"
              badgeType="positive"
              progressPercent={totalStaffCount > 0 ? (presentStaffCount / totalStaffCount) * 100 : 0}
              icon={Users}
              colorClass="bg-gradient-to-br from-purple-500 to-violet-600 text-white"
              onClick={() => navigate("/staff/attendance")}
            />

            {/* Card 4: On Leave */}
            <MobileKpiCard
              title="On Leave"
              value={onLeaveCount}
              secondary={pendingLeaves > 0 ? `${pendingLeaves} Pending Req` : "Approved"}
              badgeText={pendingLeaves > 0 ? `${pendingLeaves} Req` : "Staff"}
              badgeType={pendingLeaves > 0 ? "warning" : "neutral"}
              icon={Coffee}
              colorClass="bg-gradient-to-br from-amber-500 to-orange-600 text-white"
              onClick={() => navigate("/staff/leave-management")}
            />
          </div>
        </div>
      ) : (
        /* Employee Quick Attendance Card */
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">My Shift Status</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                myAttendance?.currentStatus === "CHECKED_IN"
                  ? "bg-emerald-100 text-emerald-700"
                  : myAttendance?.currentStatus === "ON_BREAK"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {myAttendance?.currentStatus?.replace("_", " ") || "NOT CHECKED IN"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold">CHECK IN</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                {myAttendance?.attendance?.checkInTime
                  ? new Date(myAttendance.attendance.checkInTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold">CHECK OUT</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                {myAttendance?.attendance?.checkOutTime
                  ? new Date(myAttendance.attendance.checkOutTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/staff/attendance")}
            className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs rounded-xl border border-orange-200/80 transition-colors"
          >
            Manage Attendance & Shifts →
          </button>
        </div>
      )}

      {/* 4. QUICK ACTIONS */}
      <MobileFeatureSection title="Quick Actions" onViewAll={handleOpenMore}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MobileFeatureCard
            label="POS"
            to={userRole === "CASHIER" ? "/cashier/pos" : "/pos"}
            icon={UtensilsCrossed}
            color="bg-gradient-to-br from-orange-500 to-amber-500 text-white"
          />
          <MobileFeatureCard
            label="Orders"
            to={userRole === "WAITER" ? "/waiter/orders" : "/orders"}
            icon={ClipboardList}
            color="bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
            badge={pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null}
          />
          <MobileFeatureCard
            label="Tables"
            to="/tables"
            icon={Table2}
            color="bg-gradient-to-br from-purple-500 to-indigo-500 text-white"
          />
          <MobileFeatureCard
            label="Kitchen Display"
            to="/kitchen"
            icon={ChefHat}
            color="bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
          />
        </div>
      </MobileFeatureSection>

      {/* 5. MANAGEMENT SECTION */}
      {isManagerOrOwner && (
        <MobileFeatureSection title="Management" onViewAll={handleOpenMore}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MobileFeatureCard
              label="Menu"
              to="/menu"
              icon={Utensils}
              color="bg-gradient-to-br from-rose-500 to-pink-500 text-white"
            />
            <MobileFeatureCard
              label="Inventory"
              to="/inventory"
              icon={Package}
              color="bg-gradient-to-br from-amber-500 to-orange-500 text-white"
            />
            <MobileFeatureCard
              label="Staff"
              to="/staff"
              icon={UserCheck}
              color="bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
            />
            <MobileFeatureCard
              label="Attendance"
              to="/staff/attendance"
              icon={Clock}
              color="bg-gradient-to-br from-emerald-500 to-green-600 text-white"
            />
          </div>
        </MobileFeatureSection>
      )}

      {/* 6. HR & FINANCE SECTION */}
      {isManagerOrOwner && (
        <MobileFeatureSection title="HR & Finance" onViewAll={handleOpenMore}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MobileFeatureCard
              label="Leave Mgmt"
              to="/staff/leave-management"
              icon={CalendarOff}
              color="bg-gradient-to-br from-purple-500 to-pink-600 text-white"
              badge={pendingLeaves > 0 ? `${pendingLeaves}` : null}
            />
            <MobileFeatureCard
              label="Expenses"
              to="/expenses"
              icon={Wallet}
              color="bg-gradient-to-br from-rose-500 to-red-600 text-white"
            />
            <MobileFeatureCard
              label="Advance"
              to="/expenses"
              icon={Coins}
              color="bg-gradient-to-br from-amber-500 to-yellow-600 text-white"
            />
            <MobileFeatureCard
              label="Petty Cash"
              to="/expenses"
              icon={DollarSign}
              color="bg-gradient-to-br from-teal-500 to-cyan-600 text-white"
            />
          </div>
        </MobileFeatureSection>
      )}

      {/* 7. REPORTS & OTHERS SECTION */}
      {isManagerOrOwner && (
        <MobileFeatureSection title="Reports & Others" onViewAll={handleOpenMore}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MobileFeatureCard
              label="Reports"
              to="/reports"
              icon={BarChart3}
              color="bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
            />
            <MobileFeatureCard
              label="Customers"
              to="/customers"
              icon={Users}
              color="bg-gradient-to-br from-sky-500 to-blue-500 text-white"
            />
            <MobileFeatureCard
              label="Purchases"
              to="/purchases"
              icon={Truck}
              color="bg-gradient-to-br from-violet-500 to-purple-600 text-white"
            />
            <MobileFeatureCard
              label="Settings"
              to="/owner/settings"
              icon={Settings}
              color="bg-gradient-to-br from-slate-600 to-slate-800 text-white"
            />
          </div>
        </MobileFeatureSection>
      )}
    </div>
  );
}
