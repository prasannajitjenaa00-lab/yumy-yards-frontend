import React, { useEffect, useState } from "react";
import { getDashboard, getSalesReport, getInventoryReport } from "../../services/reportService";
import { getOrders } from "../../services/orderService";
import {
  TrendingUp,
  ClipboardList,
  Coins,
  Users,
  Table2,
  Clock,
  ChefHat,
  CheckCircle2,
  ShoppingBag,
  Package,
  Wallet,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import SalesOverview from "../../components/dashboard/SalesOverview";
import OrderStatus from "../../components/dashboard/OrderStatus";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentOrders from "../../components/dashboard/RecentOrders";
import LowStockItems from "../../components/dashboard/LowStockItems";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [sales, setSales] = useState(null);
  const [recentOrdersList, setRecentOrdersList] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, salesRes] = await Promise.all([
        getDashboard(),
        getSalesReport(),
      ]);

      setData(dashRes?.data || null);
      setSales(salesRes?.data || null);

      // Attempt to fetch recent orders & low stock items safely
      try {
        const ordersRes = await getOrders({ limit: 5 });
        if (ordersRes?.data) {
          setRecentOrdersList(Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.orders || []);
        }
      } catch (e) {
        /* fallback to empty array */
      }

      try {
        const invRes = await getInventoryReport();
        if (invRes?.data?.lowStock) {
          setLowStockList(invRes.data.lowStock);
        }
      } catch (e) {
        /* fallback to empty array */
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center max-w-md mx-auto my-12">
        <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {error || "Unable to load dashboard data."}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Check your network connection or verify that backend services are active.
        </p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition-colors"
        >
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const totalTablesCount = (data.availableTables || 0) + (data.activeTables || 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* 1. Header */}
      <DashboardHeader />

      {/* 2. KPI / Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`₹${(data.todaysSales ?? 0).toLocaleString("en-IN")}`}
          subtitle="↗ 0% vs yesterday"
          icon={TrendingUp}
          colorScheme="orange"
        />
        <StatCard
          title="Today's Orders"
          value={data.todaysOrders ?? 0}
          subtitle="↗ 0% vs yesterday"
          icon={ClipboardList}
          colorScheme="green"
        />
        <StatCard
          title="Today's Profit"
          value={`₹${(data.todaysProfit ?? 0).toLocaleString("en-IN")}`}
          subtitle="↗ 0% vs yesterday"
          icon={Coins}
          colorScheme="blue"
        />
        <StatCard
          title="Active Tables"
          value={data.activeTables ?? 0}
          subtitle={`out of ${totalTablesCount || 20} tables`}
          icon={Users}
          colorScheme="purple"
        />
        <StatCard
          title="Available Tables"
          value={data.availableTables ?? 0}
          subtitle="Total Tables"
          icon={Table2}
          colorScheme="pink"
        />
        <StatCard
          title="Pending KOTs"
          value={data.pendingKots ?? 0}
          subtitle="In Kitchen"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Preparing"
          value={data.preparingOrders ?? 0}
          subtitle="In Progress"
          icon={ChefHat}
          colorScheme="indigo"
        />
        <StatCard
          title="Ready"
          value={data.readyOrders ?? 0}
          subtitle="Ready to Serve"
          icon={CheckCircle2}
          colorScheme="teal"
        />
        <StatCard
          title="Unpaid Orders"
          value={data.unpaidOrders ?? 0}
          subtitle="Awaiting Payment"
          icon={ShoppingBag}
          colorScheme="rose"
        />
        <StatCard
          title="Low Stock Items"
          value={data.lowStockItems ?? 0}
          subtitle="Need Attention"
          icon={Package}
          colorScheme="sky"
        />
        <StatCard
          title="Today's Expenses"
          value={`₹${(data.todaysExpenses ?? 0).toLocaleString("en-IN")}`}
          subtitle="↗ 0% vs yesterday"
          icon={Wallet}
          colorScheme="orange"
        />
      </div>

      {/* 3. Middle Section: Sales Overview + Order Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesOverview salesData={sales} />
        </div>
        <div className="space-y-6 flex flex-col justify-between">
          <OrderStatus
            pendingCount={data.pendingKots}
            preparingCount={data.preparingOrders}
            readyCount={data.readyOrders}
            completedCount={(data.todaysOrders || 0) - ((data.pendingKots || 0) + (data.preparingOrders || 0) + (data.readyOrders || 0))}
          />
          <QuickActions />
        </div>
      </div>

      {/* 4. Bottom Section: Recent Orders + Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders orders={recentOrdersList} />
        </div>
        <div>
          <LowStockItems items={lowStockList} />
        </div>
      </div>
    </div>
  );
}
