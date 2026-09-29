import React, { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  UtensilsCrossed,
  ClipboardList,
  LayoutGrid,
  ChefHat,
  Utensils,
  Package,
  Users,
  Clock,
  FileText,
  Wallet,
  Coins,
  IndianRupee,
  CalendarDays,
} from "lucide-react";
import { MobileFeatureCard, MobileFeatureSection } from "./MobileFeatureCard";

export default function MobileHome({ onOpenMore }) {
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const handleOpenMore = onOpenMore || outletCtx.openMore;

  const { user } = useSelector((s) => s.auth);
  const userRole = user?.role || "OWNER";
  const firstName = user?.name ? user.name.split(" ")[0] : "Rahul";

  // Dynamic Date & Greeting
  const { greeting, formattedDate } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const g =
      hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    
    // Format: "Fri, 26 Sep 2026"
    const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
    const day = now.getDate();
    const month = now.toLocaleDateString("en-US", { month: "short" });
    const year = now.getFullYear();
    const fDate = `${weekday}, ${day} ${month} ${year}`;

    return { greeting: g, formattedDate: fDate };
  }, []);

  return (
    <div className="relative space-y-5 px-0.5 sm:px-2 py-1 pb-20 max-w-lg mx-auto">
      {/* Ambient background light purple/blue gradient wash */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-100/50 via-purple-50/20 to-transparent pointer-events-none -z-10" />

      {/* 1. WELCOME / DATE ROW */}
      <div className="flex items-center justify-between pt-1">
        <div className="min-w-0 pr-2">
          <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight truncate">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Manage your restaurant easily
          </p>
        </div>

        {/* Date Pill Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl px-3.5 py-2 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs shrink-0">
          <CalendarDays size={16} className="text-slate-500 dark:text-slate-400 shrink-0" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <MobileFeatureSection title="Quick Actions" onViewAll={handleOpenMore}>
        <MobileFeatureCard
          label="POS"
          subtitle="Create new order"
          to={userRole === "CASHIER" ? "/cashier/pos" : "/pos"}
          icon={UtensilsCrossed}
          iconBg="bg-[#ff5722]"
          cardBg="bg-[#fff7ed] border-[#fed7aa]/60"
        />
        <MobileFeatureCard
          label="Orders"
          subtitle="Manage orders"
          to={userRole === "WAITER" ? "/waiter/orders" : "/orders"}
          icon={ClipboardList}
          iconBg="bg-[#2563eb]"
          cardBg="bg-[#eff6ff] border-[#bfdbfe]/60"
          badge="2"
        />
        <MobileFeatureCard
          label="Tables"
          subtitle="Table management"
          to="/tables"
          icon={LayoutGrid}
          iconBg="bg-[#8b5cf6]"
          cardBg="bg-[#f5f3ff] border-[#ddd6fe]/60"
        />
        <MobileFeatureCard
          label="Kitchen Display"
          subtitle="Live kitchen orders"
          to="/kitchen"
          icon={ChefHat}
          iconBg="bg-[#10b981]"
          cardBg="bg-[#ecfdf5] border-[#a7f3d0]/60"
        />
      </MobileFeatureSection>

      {/* 3. MANAGEMENT */}
      <MobileFeatureSection title="Management" onViewAll={handleOpenMore}>
        <MobileFeatureCard
          label="Menu"
          subtitle="Manage menu items"
          to="/menu"
          icon={Utensils}
          iconBg="bg-[#f43f5e]"
          cardBg="bg-[#fff1f2] border-[#fecdd3]/60"
        />
        <MobileFeatureCard
          label="Inventory"
          subtitle="Stock management"
          to="/inventory"
          icon={Package}
          iconBg="bg-[#f59e0b]"
          cardBg="bg-[#fffbeb] border-[#fde68a]/60"
        />
        <MobileFeatureCard
          label="Staff"
          subtitle="Staff management"
          to="/staff"
          icon={Users}
          iconBg="bg-[#3b82f6]"
          cardBg="bg-[#eff6ff] border-[#bfdbfe]/60"
        />
        <MobileFeatureCard
          label="Attendance"
          subtitle="Staff attendance"
          to="/staff/attendance"
          icon={Clock}
          iconBg="bg-[#10b981]"
          cardBg="bg-[#f0fdf4] border-[#bbf7d0]/60"
        />
      </MobileFeatureSection>

      {/* 4. HR & FINANCE */}
      <MobileFeatureSection title="HR & Finance" onViewAll={handleOpenMore}>
        <MobileFeatureCard
          label="Leave Mgmt"
          subtitle="Manage leave requests"
          to="/staff/leave-management"
          icon={FileText}
          iconBg="bg-[#8b5cf6]"
          cardBg="bg-[#faf5ff] border-[#e9d5ff]/60"
        />
        <MobileFeatureCard
          label="Expenses"
          subtitle="Track expenses"
          to="/expenses"
          icon={Wallet}
          iconBg="bg-[#f43f5e]"
          cardBg="bg-[#fff1f2] border-[#fecdd3]/60"
        />
        <MobileFeatureCard
          label="Advance"
          subtitle="Advance requests"
          to="/expenses"
          icon={Coins}
          iconBg="bg-[#f59e0b]"
          cardBg="bg-[#fffbeb] border-[#fde68a]/60"
        />
        <MobileFeatureCard
          label="Petty Cash"
          subtitle="Cash management"
          to="/expenses"
          icon={IndianRupee}
          iconBg="bg-[#06b6d4]"
          cardBg="bg-[#ecfeff] border-[#a5f3fc]/60"
        />
      </MobileFeatureSection>
    </div>
  );
}
