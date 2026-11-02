import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  ShoppingCart,
  Receipt,
  Users,
  ShoppingBag,
  Truck,
  CreditCard,
  Trophy,
  Wallet,
  FileText,
  Package,
  ArrowRight,
  UtensilsCrossed,
  Banknote,
  QrCode,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle2,
  Building,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  ArrowLeftRight,
  Eye,
  MoreVertical,
  BarChart2,
  List,
  Printer,
  Wrench,
  Coffee,
  Zap,
  ChevronDown,
  User,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  getSalesReport,
  getOrderReport,
  getPaymentReport,
  getPettyCashReport,
  getInventoryReport,
  getProductReport,
  getGstReport,
} from "../../services/reportService";
import PettyCashModal from "../../components/common/PettyCashModal";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "payments", label: "Payments (Cash / UPI / Card)" },
  { id: "petty-cash", label: "Petty Cash & Drawer" },
  { id: "sales", label: "Sales" },
  { id: "orders", label: "Orders" },
  { id: "inventory", label: "Inventory" },
  { id: "expenses", label: "Expenses" },
  { id: "gst", label: "GST" },
  { id: "bestsellers", label: "Best Sellers" },
  { id: "staff", label: "Staff" },
  { id: "customers", label: "Customers" },
];

const getTodayStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPresetRange = (preset) => {
  const today = new Date();
  const todayStr = getTodayStr();

  if (preset === "today") {
    return { from: todayStr, to: todayStr };
  }
  if (preset === "yesterday") {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const year = y.getFullYear();
    const month = String(y.getMonth() + 1).padStart(2, "0");
    const day = String(y.getDate()).padStart(2, "0");
    return { from: `${year}-${month}-${day}`, to: `${year}-${month}-${day}` };
  }
  if (preset === "week") {
    const past = new Date(today);
    past.setDate(past.getDate() - 6);
    const year = past.getFullYear();
    const month = String(past.getMonth() + 1).padStart(2, "0");
    const day = String(past.getDate()).padStart(2, "0");
    return { from: `${year}-${month}-${day}`, to: todayStr };
  }
  if (preset === "month") {
    const past = new Date(today);
    past.setDate(past.getDate() - 29);
    const year = past.getFullYear();
    const month = String(past.getMonth() + 1).padStart(2, "0");
    const day = String(past.getDate()).padStart(2, "0");
    return { from: `${year}-${month}-${day}`, to: todayStr };
  }
  if (preset === "this_month") {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const year = firstDay.getFullYear();
    const month = String(firstDay.getMonth() + 1).padStart(2, "0");
    const day = String(firstDay.getDate()).padStart(2, "0");
    return { from: `${year}-${month}-${day}`, to: todayStr };
  }
  return { from: todayStr, to: todayStr };
};

const formatDisplayDate = (dStr) => {
  if (!dStr) return "";
  const parts = dStr.split("-");
  if (parts.length !== 3) return dStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return isNaN(d) ? dStr : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function Reports() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const isCashier = user?.role === "CASHIER";
  const [activeTab, setActiveTab] = useState(() => (isCashier ? "petty-cash" : "overview"));

  // Sub-navigation tabs accessible to user
  const visibleTabs = useMemo(() => {
    return TABS;
  }, []);

  // Date filter state
  const [datePreset, setDatePreset] = useState("today"); // "today" | "yesterday" | "week" | "month" | "this_month" | "custom"
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(getTodayStr());

  // Report API states
  const [sales, setSales] = useState(null);
  const [orders, setOrders] = useState(null);
  const [payments, setPayments] = useState(null);
  const [pettyCash, setPettyCash] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [products, setProducts] = useState(null);
  const [gst, setGst] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payments & Petty cash specific controls
  const [paymentsPeriod, setPaymentsPeriod] = useState("today"); // "today" | "week" | "month"
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL"); // "ALL" | "CASH" | "UPI" | "CARD"
  const [showPettyCashModal, setShowPettyCashModal] = useState(false);
  const [refreshingPayments, setRefreshingPayments] = useState(false);
  const [pettyCashierFilter, setPettyCashierFilter] = useState("ALL");
  const [pettyTypeFilter, setPettyTypeFilter] = useState("ALL"); // "ALL" | "CASH_IN" | "CASH_OUT"
  const [trendView, setTrendView] = useState("auto"); // "auto" | "7days" | "30days" | "hourly"

  const loadData = (from = startDate, to = endDate) => {
    setLoading(true);
    const params = from && to ? { from, to } : {};

    const calls = [
      getSalesReport(params).catch(() => ({ data: null })),
      getOrderReport(params).catch(() => ({ data: null })),
      getPaymentReport(params).catch(() => ({ data: null })),
      getPettyCashReport(params).catch(() => ({ data: null })),
      getInventoryReport(params).catch(() => ({ data: null })),
      getProductReport(params).catch(() => ({ data: null })),
      getGstReport(params).catch(() => ({ data: null })),
    ];

    Promise.all(calls)
      .then(([s, o, p, pc, inv, prod, g]) => {
        setSales(s.data);
        setOrders(o.data);
        setPayments(p.data);
        setPettyCash(pc.data);
        if (inv) setInventory(inv.data);
        if (prod) setProducts(prod.data);
        if (g) setGst(g.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData(startDate, endDate);
  }, []);

  const handlePresetClick = (preset) => {
    setDatePreset(preset);
    if (preset === "week") setPaymentsPeriod("week");
    else if (preset === "month") setPaymentsPeriod("month");
    else setPaymentsPeriod("today");

    if (preset !== "custom") {
      const range = getPresetRange(preset);
      setStartDate(range.from);
      setEndDate(range.to);
      loadData(range.from, range.to);
    }
  };

  const handlePeriodChange = (period) => {
    handlePresetClick(period);
  };

  // Compute metric figures
  const totalSalesVal = sales?.totalSales || 0;
  const totalOrdersVal = orders?.total || sales?.totalOrders || 0;
  const avgOrderVal = totalOrdersVal > 0 ? Math.round(totalSalesVal / totalOrdersVal) : 0;

  const dineInCount = orders?.dineIn || 0;
  const takeawayCount = orders?.takeaway || 0;
  const deliveryCount = orders?.delivery || 0;
  const cancelledCount = orders?.cancelled || 0;

  // Chart: Sales Trend Line Data (Dynamic, continuous & responsive)
  const salesTrendData = useMemo(() => {
    const isSingleDay = startDate === endDate;

    // 1. Explicit Last 7 Days view
    if (trendView === "7days" && sales?.past7Days && Object.keys(sales.past7Days).length > 0) {
      return Object.entries(sales.past7Days)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateStr, amt]) => {
          const parts = dateStr.split("-");
          let label = dateStr;
          if (parts.length === 3) {
            const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            label = isNaN(d) ? dateStr : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
          }
          return { date: label, sales: amt };
        });
    }

    // 2. Explicit Last 30 Days view
    if (trendView === "30days" && sales?.past30Days && Object.keys(sales.past30Days).length > 0) {
      return Object.entries(sales.past30Days)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateStr, amt]) => {
          const parts = dateStr.split("-");
          let label = dateStr;
          if (parts.length === 3) {
            const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            label = isNaN(d) ? dateStr : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
          }
          return { date: label, sales: amt };
        });
    }

    // 3. Hourly Trend for Single Day (Today / Yesterday) or if trendView === "hourly"
    if ((isSingleDay || trendView === "hourly") && sales?.byHour && Object.keys(sales.byHour).length > 0) {
      return Object.entries(sales.byHour).map(([hour, amt]) => {
        const [h] = hour.split(":");
        const numH = Number(h);
        const ampm = numH >= 12 ? "PM" : "AM";
        const h12 = numH % 12 === 0 ? 12 : numH % 12;
        return { date: `${h12} ${ampm}`, sales: amt };
      });
    }

    // 4. Multi-day range (e.g. Week / Month / Custom)
    if (sales?.byDay && Object.keys(sales.byDay).length > 1) {
      return Object.entries(sales.byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateStr, amt]) => {
          const parts = dateStr.split("-");
          let label = dateStr;
          if (parts.length === 3) {
            const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            label = isNaN(d) ? dateStr : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
          }
          return { date: label, sales: amt };
        });
    }

    // 5. Fallback: Past 7 days continuous trend
    if (sales?.past7Days && Object.keys(sales.past7Days).length > 0) {
      return Object.entries(sales.past7Days)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateStr, amt]) => {
          const parts = dateStr.split("-");
          let label = dateStr;
          if (parts.length === 3) {
            const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            label = isNaN(d) ? dateStr : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
          }
          return { date: label, sales: amt };
        });
    }

    const todayLabel = formatDisplayDate(startDate);
    return [{ date: todayLabel || "Today", sales: totalSalesVal }];
  }, [sales, trendView, startDate, endDate, totalSalesVal]);

  // Chart: Order Type Distribution Donut Data
  const orderTypeData = useMemo(() => {
    const list = [
      { name: "Dine-in", value: dineInCount, color: "#f97316" },
      { name: "Takeaway", value: takeawayCount, color: "#f43f5e" },
      { name: "Delivery", value: deliveryCount, color: "#10b981" },
      { name: "Cancelled", value: cancelledCount, color: "#eab308" },
    ];
    return list;
  }, [dineInCount, takeawayCount, deliveryCount, cancelledCount]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 shadow-inner">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive real-time insights into your sales, payments, petty cash & operations</p>
          </div>
        </div>

        {/* Dynamic Date Badge */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-slate-800">
            {startDate === endDate ? formatDisplayDate(startDate) : `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`}
          </span>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200 uppercase">
            {datePreset.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Global Date-Wise Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Filter:</span>
          {[
            { id: "today", label: "Today" },
            { id: "yesterday", label: "Yesterday" },
            { id: "week", label: "Last 7 Days" },
            { id: "month", label: "Last 30 Days" },
            { id: "this_month", label: "This Month" },
            { id: "custom", label: "Custom" },
          ].map((p) => {
            const isActive = datePreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePresetClick(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm font-bold"
                    : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Date Inputs + Apply */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset("custom");
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset("custom");
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => loadData(startDate, endDate)}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            title="Apply date filter to all reports"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Apply Filter</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB CONTENT */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 3. Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Total Sales */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>↑ 0% vs yesterday</span>
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 pt-1">₹{totalSalesVal.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 font-medium">Total Sales</p>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>↑ 0% vs yesterday</span>
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 pt-1">{totalOrdersVal}</p>
              <p className="text-[11px] text-slate-400 font-medium">Total Orders</p>
            </div>

            {/* Average Order Value */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>↑ 0% vs yesterday</span>
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 pt-1">₹{avgOrderVal}</p>
              <p className="text-[11px] text-slate-400 font-medium">Average Order Value</p>
            </div>

            {/* Dine-in */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">0%</span>
              </div>
              <p className="text-xl font-bold text-slate-900 pt-1">{dineInCount}</p>
              <p className="text-[11px] text-slate-400 font-medium">Dine-in</p>
            </div>

            {/* Takeaway */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">0%</span>
              </div>
              <p className="text-xl font-bold text-slate-900 pt-1">{takeawayCount}</p>
              <p className="text-[11px] text-slate-400 font-medium">Takeaway</p>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">0%</span>
              </div>
              <p className="text-xl font-bold text-slate-900 pt-1">{deliveryCount}</p>
              <p className="text-[11px] text-slate-400 font-medium">Delivery</p>
            </div>
          </div>

          {/* 4. Middle Row: Sales Trend & Order Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Sales Trend</h3>
                </div>
                <select
                  value={trendView}
                  onChange={(e) => setTrendView(e.target.value)}
                  className="text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl outline-none cursor-pointer hover:border-orange-300 transition-colors"
                >
                  <option value="auto">Auto (Smart Trend)</option>
                  <option value="hourly">Hourly (Today)</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                </select>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                    />
                    <Tooltip
                      formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Sales"]}
                      contentStyle={{ borderRadius: "12px", fontSize: "11px", border: "1px solid #fed7aa", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#salesGrad)"
                      dot={{ r: 3, fill: "#f97316", strokeWidth: 1 }}
                      activeDot={{ r: 6, fill: "#ea580c", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Type Distribution Donut Chart */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Order Type Distribution</h3>
              </div>

              <div className="relative h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderTypeData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      isAnimationActive={true}
                      animationBegin={100}
                      animationDuration={1300}
                      animationEasing="ease-out"
                    >
                      {orderTypeData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`${v} Orders`, "Volume"]}
                      contentStyle={{
                        borderRadius: "12px",
                        fontSize: "11px",
                        border: "none",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-bold text-slate-900">{totalOrdersVal}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Orders</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100 text-xs">
                {orderTypeData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">
                      {item.value} (0%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Bottom 6 Cards Grid (3 Columns x 2 Rows) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Payment Methods */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Payment Breakdown</h3>
                </div>
                <button
                  onClick={() => setActiveTab("payments")}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Details</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {payments && (payments.CASH > 0 || payments.UPI > 0 || payments.CARD > 0 || payments.totalCollected > 0) ? (
                <div className="space-y-2.5 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Banknote size={13} className="text-emerald-500" />
                        <span>Cash</span>
                      </span>
                      <span className="font-bold text-slate-900">₹{payments.CASH || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{
                          width: `${payments.summary?.CASH?.percentage || (payments.totalCollected ? ((payments.CASH || 0) / payments.totalCollected) * 100 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-purple-700 flex items-center gap-1">
                        <QrCode size={13} className="text-purple-500" />
                        <span>UPI / QR</span>
                      </span>
                      <span className="font-bold text-slate-900">₹{payments.UPI || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{
                          width: `${payments.summary?.UPI?.percentage || (payments.totalCollected ? ((payments.UPI || 0) / payments.totalCollected) * 100 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-blue-700 flex items-center gap-1">
                        <CreditCard size={13} className="text-blue-500" />
                        <span>Card</span>
                      </span>
                      <span className="font-bold text-slate-900">₹{payments.CARD || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{
                          width: `${payments.summary?.CARD?.percentage || (payments.totalCollected ? ((payments.CARD || 0) / payments.totalCollected) * 100 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-900">
                    <span>Total Collected:</span>
                    <span>₹{payments.totalCollected || (payments.CASH || 0) + (payments.UPI || 0) + (payments.CARD || 0)}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">No payment data yet</p>
                  <p className="text-[11px] text-slate-400">Payment details will appear here once you have sales.</p>
                </div>
              )}
            </div>

            {/* Card 2: Top Selling Items */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Top Selling Items</h3>
                </div>
                <select className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                  <option>Today</option>
                </select>
              </div>

              {products?.bestSelling && products.bestSelling.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {products.bestSelling.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                      <span className="font-medium text-slate-800">{item.name}</span>
                      <span className="font-bold text-slate-900">{item.quantity} sold • ₹{item.revenue}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <UtensilsCrossed className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">No sales yet today</p>
                  <p className="text-[11px] text-slate-400">Top selling items will appear here.</p>
                </div>
              )}
            </div>

            {/* Card 3: Expense Summary */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Expense Summary</h3>
                </div>
                <select className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                  <option>Today</option>
                </select>
              </div>

              <div className="py-4 text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">₹0</p>
                  <p className="text-[11px] text-slate-400">Total Expenses</p>
                </div>
                <button
                  onClick={() => navigate("/expenses")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 rounded-xl transition-colors"
                >
                  <span>View Expenses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 4: GST Summary */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">GST Summary</h3>
              </div>

              {gst && gst.gstCollected > 0 ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Taxable Sales</span>
                    <span className="font-bold text-slate-900">₹{gst.taxableSales}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">CGST</span>
                    <span className="font-bold text-slate-900">₹{gst.cgst}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">SGST</span>
                    <span className="font-bold text-slate-900">₹{gst.sgst}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">No GST data yet</p>
                  <p className="text-[11px] text-slate-400">GST details will appear here once you have sales.</p>
                </div>
              )}
            </div>

            {/* Card 5: Inventory Status */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Inventory Status</h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Total Items</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{inventory?.totalItems || 5}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Low Stock</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{inventory?.lowStock?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Stock Value</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      ₹{(inventory?.stockValuation || 62793.25).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="text-center pt-1">
                  <button
                    onClick={() => navigate("/inventory")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl transition-colors"
                  >
                    <span>View Inventory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 6: Recent Orders */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Orders</h3>
                </div>
                <button
                  onClick={() => navigate("/orders")}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="py-6 text-center space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No orders yet</p>
                <p className="text-[11px] text-slate-400">Recent orders will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENTS TAB (CASH / UPI / CARD DETAILED BREAKDOWN & DRAWER MANAGEMENT) */}
      {activeTab === "payments" && (() => {
        const cashAmt = payments?.summary?.CASH?.amount || payments?.CASH || 0;
        const upiAmt = payments?.summary?.UPI?.amount || payments?.UPI || 0;
        const cardAmt = payments?.summary?.CARD?.amount || payments?.CARD || 0;
        const otherAmt = payments?.summary?.OTHER?.amount || payments?.OTHER || 0;
        const totalAmt = payments?.totalCollected || (cashAmt + upiAmt + cardAmt + otherAmt);

        const cashCount = payments?.summary?.CASH?.count || 0;
        const upiCount = payments?.summary?.UPI?.count || 0;
        const cardCount = payments?.summary?.CARD?.count || 0;
        const totalCount = payments?.totalCount || (cashCount + upiCount + cardCount);

        const cashPct = totalAmt > 0 ? Math.round((cashAmt / totalAmt) * 100) : 0;
        const upiPct = totalAmt > 0 ? Math.round((upiAmt / totalAmt) * 100) : 0;
        const cardPct = totalAmt > 0 ? Math.round((cardAmt / totalAmt) * 100) : 0;

        const pettyIn = payments?.pettyCash?.totalCashIn ?? pettyCash?.totalCashIn ?? 0;
        const pettyOut = payments?.pettyCash?.totalCashOut ?? pettyCash?.totalCashOut ?? 0;
        const netDrawerCash = payments?.pettyCash?.netDrawerCash ?? (cashAmt + pettyIn - pettyOut);

        const paymentChartData = [
          { name: "Cash", value: cashAmt, color: "#10b981", count: cashCount },
          { name: "UPI / QR", value: upiAmt, color: "#a855f7", count: upiCount },
          { name: "Card", value: cardAmt, color: "#3b82f6", count: cardCount },
        ].filter((d) => d.value > 0);

        const txList = (payments?.transactions || []).filter((tx) => {
          const matchMethod = paymentMethodFilter === "ALL" || tx.method === paymentMethodFilter;
          const matchSearch =
            !paymentSearch ||
            (tx.orderNumber && tx.orderNumber.toLowerCase().includes(paymentSearch.toLowerCase())) ||
            (tx.cashier && tx.cashier.toLowerCase().includes(paymentSearch.toLowerCase())) ||
            (tx.transactionRef && tx.transactionRef.toLowerCase().includes(paymentSearch.toLowerCase()));
          return matchMethod && matchSearch;
        });

        return (
          <div className="space-y-6">
            {/* 1. Header with Period Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="text-orange-500 w-5 h-5" />
                  <span>Payment Collection & Cash Drawer Report</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time collection breakdown across Cash, UPI QR, and Card payments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  {[
                    { id: "today", label: "Today" },
                    { id: "week", label: "7 Days" },
                    { id: "month", label: "30 Days" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePeriodChange(p.id)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        paymentsPeriod === p.id
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePeriodChange(paymentsPeriod)}
                  disabled={refreshingPayments}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Refresh Payments"
                >
                  <RefreshCw size={15} className={refreshingPayments ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* 2. Top 4 Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Collection</span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-bold">
                    ₹
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 pt-1">₹{totalAmt.toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 font-medium">{totalCount} recorded payment transactions</p>
              </div>

              {/* Cash Collected */}
              <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs space-y-1 bg-gradient-to-b from-white to-emerald-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <Banknote size={13} className="text-emerald-500" />
                    <span>Cash Collected</span>
                  </span>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    {cashPct}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-700 pt-1">₹{cashAmt.toLocaleString()}</p>
                <p className="text-[11px] text-emerald-600 font-medium">{cashCount} Cash orders</p>
              </div>

              {/* UPI Collected */}
              <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs space-y-1 bg-gradient-to-b from-white to-purple-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                    <QrCode size={13} className="text-purple-500" />
                    <span>UPI / QR</span>
                  </span>
                  <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                    {upiPct}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-700 pt-1">₹{upiAmt.toLocaleString()}</p>
                <p className="text-[11px] text-purple-600 font-medium">{upiCount} QR payments</p>
              </div>

              {/* Card Collected */}
              <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs space-y-1 bg-gradient-to-b from-white to-blue-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard size={13} className="text-blue-500" />
                    <span>Card POS</span>
                  </span>
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                    {cardPct}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-700 pt-1">₹{cardAmt.toLocaleString()}</p>
                <p className="text-[11px] text-blue-600 font-medium">{cardCount} Card swipes</p>
              </div>
            </div>

            {/* 3. Middle Section: Distribution Chart & Cash Drawer Reconciliation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Methods Visual Breakdown */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Mode Share & Percentages</span>
                </h4>

                {paymentChartData.length > 0 ? (
                  <>
                    <div className="relative h-44 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentChartData}
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                            isAnimationActive={true}
                            animationBegin={100}
                            animationDuration={1300}
                            animationEasing="ease-out"
                          >
                            {paymentChartData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v, name) => [`₹${v}`, name]}
                            contentStyle={{
                              borderRadius: "12px",
                              fontSize: "11px",
                              border: "none",
                              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-base font-bold text-slate-900">₹{totalAmt}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Total</span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                      {paymentChartData.map((item, idx) => {
                        const pct = totalAmt > 0 ? Math.round((item.value / totalAmt) * 100) : 0;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span>{item.name}</span>
                              </span>
                              <span className="font-bold text-slate-900">
                                ₹{item.value} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-1.5 rounded-full"
                                style={{ width: `${pct}%`, backgroundColor: item.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">No payment data recorded for this period</p>
                  </div>
                )}
              </div>

              {/* Cash Drawer & Petty Cash Reconciliation */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Cash Drawer & Petty Cash Reconciliation</h4>
                    </div>
                    <button
                      onClick={() => setShowPettyCashModal(true)}
                      className="text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Wallet size={13} />
                      <span>Record Petty Cash</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 pt-2 pb-3">
                    Reconcile physical cash received from POS billing with petty cash payouts and float top-ups.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <Banknote size={14} />
                        <span>(+) Cash Sales</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-800">₹{cashAmt}</p>
                      <p className="text-[10px] text-emerald-600">From customer billing</p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700">
                        <ArrowDownLeft size={14} />
                        <span>(+) Petty Cash In</span>
                      </div>
                      <p className="text-lg font-bold text-blue-800">₹{pettyIn}</p>
                      <p className="text-[10px] text-blue-600">Float & change top-up</p>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700">
                        <ArrowUpRight size={14} />
                        <span>(-) Petty Cash Out</span>
                      </div>
                      <p className="text-lg font-bold text-rose-800">₹{pettyOut}</p>
                      <p className="text-[10px] text-rose-600">Emergency & supplies</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Estimated Net Cash In Drawer
                    </span>
                    <p className="text-2xl font-bold mt-0.5">₹{netDrawerCash.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400">
                      Cash Sales (₹{cashAmt}) + In (₹{pettyIn}) - Out (₹{pettyOut})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 size={13} />
                      <span>Reconciled Live</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Payment Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Recent Payment Records</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    {txList.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Method filters */}
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    {["ALL", "CASH", "UPI", "CARD"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethodFilter(m)}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          paymentMethodFilter === m
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="text"
                      placeholder="Search order #, cashier..."
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      className="pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {txList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-4">Date & Time</th>
                        <th className="py-2.5 px-4">Order #</th>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Payment Method</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4">Reference #</th>
                        <th className="py-2.5 px-4">Cashier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {txList.map((tx) => {
                        const badgeStyle =
                          tx.method === "CASH"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : tx.method === "UPI"
                            ? "bg-purple-50 text-purple-700 border-purple-200/60"
                            : "bg-blue-50 text-blue-700 border-blue-200/60";

                        const Icon = tx.method === "CASH" ? Banknote : tx.method === "UPI" ? QrCode : CreditCard;

                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-4 text-slate-500">
                              {new Date(tx.paidAt).toLocaleString([], {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-900">{tx.orderNumber}</td>
                            <td className="py-2.5 px-4 text-slate-600 font-medium">{tx.orderType}</td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle}`}
                              >
                                <Icon size={11} />
                                <span>{tx.method}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-900">₹{tx.amount}</td>
                            <td className="py-2.5 px-4 text-slate-400 text-[11px]">{tx.transactionRef || "—"}</td>
                            <td className="py-2.5 px-4 text-slate-600 font-medium">{tx.cashier}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold">No transactions match your filter</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* PETTY CASH & CASH DRAWER TAB */}
      {activeTab === "petty-cash" && (() => {
        const allPettyTx = pettyCash?.transactions || [];

        // Cashiers dynamically combined from backend staff users and transaction history
        const cashiersMap = new Map();
        (pettyCash?.cashiers || []).forEach((c) => {
          cashiersMap.set(String(c.id), c);
        });
        allPettyTx.forEach((t) => {
          if (t.paidBy) {
            const key = String(t.paidBy._id || t.paidBy.name);
            if (!cashiersMap.has(key)) {
              cashiersMap.set(key, { id: key, name: t.paidBy.name, role: t.paidBy.role });
            }
          }
        });
        const cashiers = Array.from(cashiersMap.values());

        const filteredTx = allPettyTx.filter((t) => {
          const matchType = pettyTypeFilter === "ALL" || t.type === pettyTypeFilter;
          const matchCashier =
            pettyCashierFilter === "ALL" ||
            (t.paidBy && (String(t.paidBy._id) === String(pettyCashierFilter) || t.paidBy.name === pettyCashierFilter));
          return matchType && matchCashier;
        });

        const isFilteredByCashier = pettyCashierFilter !== "ALL";
        const selectedCashierData = isFilteredByCashier
          ? pettyCash?.cashierSettlements?.find((c) => String(c.id) === String(pettyCashierFilter))
          : null;

        const openingBalance = isFilteredByCashier ? 0 : (pettyCash?.openingBalance || 0);
        const pettyIn = pettyCash?.totalCashIn || 0;
        const cashSales = pettyCash?.todayCashSales || 0;

        const cashIn = isFilteredByCashier
          ? ((selectedCashierData?.cashBilled || 0) + (selectedCashierData?.pettyIn || 0))
          : (pettyIn + cashSales);
        const cashOut = isFilteredByCashier
          ? (selectedCashierData?.pettyOut || 0)
          : (pettyCash?.totalCashOut || 0);
        const closingBalance = isFilteredByCashier
          ? (selectedCashierData?.expectedHandover || 0)
          : (pettyCash?.netBalance ?? (openingBalance + cashIn - cashOut));

        const totalMovement = cashIn + cashOut;
        const cashInPct = totalMovement > 0 ? Math.round((cashIn / totalMovement) * 100) : 0;
        const cashOutPct = totalMovement > 0 ? 100 - cashInPct : 0;

        const pieData =
          totalMovement > 0
            ? [
                { name: "Cash In", value: cashIn, color: "#10b981" },
                { name: "Cash Out", value: cashOut, color: "#f43f5e" },
              ]
            : [{ name: "No Movement", value: 1, color: "#e2e8f0" }];

        const CATEGORY_ICONS_MAP = {
          RAW_MATERIALS: ShoppingBag,
          SUPPLIES: Package,
          TRANSPORT: Truck,
          MAINTENANCE: Wrench,
          STAFF_TEA_SNACKS: Coffee,
          FLOAT_TOPUP: Wallet,
          UTILITIES: Zap,
          OTHER: Receipt,
          Grocery: ShoppingBag,
          Transport: Truck,
          Supplies: Package,
        };

        const CATEGORY_LABELS_MAP = {
          RAW_MATERIALS: "Grocery / Kitchen",
          SUPPLIES: "Supplies & Packaging",
          TRANSPORT: "Transport / Fuel",
          MAINTENANCE: "Repairs & Hardware",
          STAFF_TEA_SNACKS: "Staff Tea & Snacks",
          FLOAT_TOPUP: "Float Deposit",
          UTILITIES: "Gas & Utilities",
          OTHER: "General Expense",
          Grocery: "Grocery",
          Transport: "Transport",
          Supplies: "Supplies",
        };

        const formatTime = (iso) => {
          if (!iso) return "—";
          const d = new Date(iso);
          return isNaN(d)
            ? "—"
            : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
        };

        return (
          <div className="space-y-6">
            {/* 1. Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Petty Cash</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Track daily cash movements and balance.</p>
                </div>
              </div>

              {/* + New Transaction Button */}
              <button
                onClick={() => setShowPettyCashModal(true)}
                className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus size={16} />
                <span>New Transaction</span>
              </button>
            </div>

            {/* 2. Filter Bar (Date Display, Cashiers, Types) */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Indicator / Selector */}
              <div className="relative flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 shadow-2xs">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">
                  {startDate === endDate ? `Today, ${formatDisplayDate(startDate)}` : `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`}
                </span>
              </div>

              {/* Cashier Selector */}
              <div className="relative flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 shadow-2xs hover:border-slate-300 transition-colors">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={pettyCashierFilter}
                  onChange={(e) => setPettyCashierFilter(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer pr-4 appearance-none"
                >
                  <option value="ALL">All Cashiers</option>
                  {cashiers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.role ? `(${c.role})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
              </div>

              {/* Type Selector */}
              <div className="relative flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 shadow-2xs hover:border-slate-300 transition-colors">
                <ArrowLeftRight className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={pettyTypeFilter}
                  onChange={(e) => setPettyTypeFilter(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer pr-4 appearance-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="CASH_IN">Cash In</option>
                  <option value="CASH_OUT">Cash Out</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 3. Four Top Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Opening Balance */}
              <div className="bg-amber-50/50 border border-amber-100/90 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">Opening Balance</p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight pt-0.5">
                    ₹{openingBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Cash In */}
              <div className="bg-emerald-50/40 border border-emerald-100/90 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                  <ArrowDownToLine className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">Cash In</p>
                  <p className="text-2xl font-bold text-emerald-600 tracking-tight pt-0.5">
                    ₹{cashIn.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Cash Out */}
              <div className="bg-rose-50/40 border border-rose-100/90 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0">
                  <ArrowUpFromLine className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">Cash Out</p>
                  <p className="text-2xl font-bold text-rose-600 tracking-tight pt-0.5">
                    ₹{cashOut.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Closing Balance / Expected Handover */}
              <div className="bg-sky-50/40 border border-sky-100/90 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-sky-100/80 text-sky-600 flex items-center justify-center shrink-0">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">
                    {isFilteredByCashier ? "Expected Handover" : "Closing Balance"}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight pt-0.5">
                    ₹{closingBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Middle Row (Cash Flow Donut Chart & Summary Box) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Cash Flow Donut */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">Cash Flow</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                  <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={72}
                          paddingAngle={totalMovement > 0 ? 3 : 0}
                          dataKey="value"
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val, name) => [`₹${Number(val).toLocaleString()}`, name]}
                          contentStyle={{ borderRadius: 12, border: "1px solid #fed7aa", fontSize: 11 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-base font-bold text-slate-900">₹{totalMovement.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Total Movement</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3 w-full max-w-xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
                        <span className="text-slate-600 font-medium">Cash In</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        ₹{cashIn.toLocaleString()} <span className="text-slate-400 font-normal">({cashInPct}%)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
                        <span className="text-slate-600 font-medium">Cash Out</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        ₹{cashOut.toLocaleString()} <span className="text-slate-400 font-normal">({cashOutPct}%)</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Summary Box */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Summary ({startDate === endDate ? formatDisplayDate(startDate) : `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`})
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs pt-1">
                  <div className="flex items-center justify-between py-1.5 px-2 text-slate-700">
                    <span>Opening Balance</span>
                    <span className="font-bold text-slate-900">₹{openingBalance.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-2 text-slate-700">
                    <span>Total Cash In</span>
                    <span className="font-bold text-emerald-600">₹{cashIn.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-2 text-slate-700">
                    <span>Total Cash Out</span>
                    <span className="font-bold text-rose-600">₹{cashOut.toLocaleString()}</span>
                  </div>

                  {/* Highlighted Closing Balance */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-100/70 border border-amber-200/60 mt-2">
                    <span className="font-bold text-slate-900 text-xs">Closing Balance</span>
                    <span className="font-extrabold text-slate-900 text-sm">₹{closingBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Cashier Shift Settlement Table */}
            {pettyCash?.cashierSettlements && pettyCash.cashierSettlements.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden space-y-0">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">Multi-Cashier Shift Settlement</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Automatic order attribution & expected drawer handover per cashier
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Cashier & Counter</th>
                        <th className="py-3 px-4 text-center">Orders Billed</th>
                        <th className="py-3 px-4 text-right">POS Cash Billed</th>
                        <th className="py-3 px-4 text-right">Petty In</th>
                        <th className="py-3 px-4 text-right">Petty Out</th>
                        <th className="py-3 px-4 text-right">Expected Handover</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {pettyCash.cashierSettlements.map((cs) => {
                        const isSelected = String(pettyCashierFilter) === String(cs.id);
                        return (
                          <tr
                            key={cs.id}
                            className={`transition-colors cursor-pointer ${
                              isSelected ? "bg-orange-50/80 font-bold" : "hover:bg-slate-50/70"
                            }`}
                            onClick={() => setPettyCashierFilter(isSelected ? "ALL" : cs.id)}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">
                                  {cs.name?.[0]?.toUpperCase() || "C"}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 leading-tight">{cs.name}</p>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {cs.counter || "Counter 1"} • {cs.role || "CASHIER"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-600">
                              {cs.ordersBilled} {cs.ordersBilled === 1 ? "order" : "orders"}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-600">
                              +₹{Number(cs.cashBilled).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-emerald-600">
                              +₹{Number(cs.pettyIn).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-rose-600">
                              -₹{Number(cs.pettyOut).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="text-xs font-extrabold text-slate-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                                ₹{Number(cs.expectedHandover).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPettyCashierFilter(isSelected ? "ALL" : cs.id);
                                }}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-orange-500 text-white shadow-xs"
                                    : "bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700"
                                }`}
                              >
                                {isSelected ? "Showing Filter ✓" : "View Drawer"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">Transactions</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {filteredTx.length} record{filteredTx.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filteredTx.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Cashier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredTx.map((tx) => {
                        const isOut = tx.type === "CASH_OUT";
                        const CatIcon = CATEGORY_ICONS_MAP[tx.category] || Receipt;
                        const catLabel = CATEGORY_LABELS_MAP[tx.category] || tx.category || "General";

                        return (
                          <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                              {formatTime(tx.createdAt)}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {isOut ? (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/70 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                                  ↓ Cash Out
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                                  ↑ Cash In
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <CatIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-semibold">{catLabel}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold whitespace-nowrap">
                              <span className={isOut ? "text-rose-600" : "text-emerald-600"}>
                                {isOut ? "-₹" : "+₹"}
                                {tx.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{tx.reason || "—"}</td>
                            <td className="py-3 px-4 text-slate-700 font-semibold whitespace-nowrap">
                              {tx.paidBy?.name || "Cashier"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Wallet size={32} className="mx-auto opacity-40 text-amber-500" />
                  <p className="text-xs font-semibold text-slate-600">No transactions found for the selected filter</p>
                  <p className="text-[11px] text-slate-400">Record a new Cash In or Cash Out to update drawer movements.</p>
                  <button
                    onClick={() => setShowPettyCashModal(true)}
                    className="mt-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>Record Transaction</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* SALES TAB */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="text-orange-500 w-5 h-5" />
                <span>Sales Performance Report</span>
              </h3>
              <p className="text-xs text-slate-500">
                Detailed sales revenue and day-by-day revenue breakdown for {formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}.
              </p>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <p className="text-2xl font-bold text-slate-900 pt-1">₹{(sales?.totalSales || 0).toLocaleString()}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">Net billed sales</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
              <p className="text-2xl font-bold text-slate-900 pt-1">{sales?.totalOrders || 0}</p>
              <p className="text-[11px] text-blue-600 font-semibold">Completed transactions</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Ticket Size</span>
              <p className="text-2xl font-bold text-slate-900 pt-1">
                ₹{sales?.totalOrders ? Math.round((sales?.totalSales || 0) / sales.totalOrders).toLocaleString() : 0}
              </p>
              <p className="text-[11px] text-purple-600 font-semibold">Revenue per order</p>
            </div>
          </div>

          {/* Daily Sales Chart & Breakdown Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Revenue Trend (₹)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGradTab" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                    />
                    <Tooltip
                      formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Sales"]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #fed7aa", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#salesGradTab)"
                      dot={{ r: 3, fill: "#f97316", strokeWidth: 1 }}
                      activeDot={{ r: 6, fill: "#ea580c", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Daily Sales Summary</h4>
              {sales?.byDay && Object.keys(sales.byDay).length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {Object.entries(sales.byDay)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([day, val]) => (
                      <div key={day} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-semibold text-slate-700">{formatDisplayDate(day)}</span>
                        <span className="text-xs font-bold text-slate-900">₹{val.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">No daily sales in selected period</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="text-orange-500 w-5 h-5" />
                <span>Order Volume & Channels Report</span>
              </h3>
              <p className="text-xs text-slate-500">
                Breakdown of dine-in, takeaway, delivery, and cancelled orders between {formatDisplayDate(startDate)} and {formatDisplayDate(endDate)}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Dine-In</span>
              <p className="text-2xl font-bold text-slate-900">{orders?.dineIn || 0}</p>
              <p className="text-[11px] text-slate-400">Table guests</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Takeaway</span>
              <p className="text-2xl font-bold text-slate-900">{orders?.takeaway || 0}</p>
              <p className="text-[11px] text-slate-400">Parcel pickup</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Delivery</span>
              <p className="text-2xl font-bold text-slate-900">{orders?.delivery || 0}</p>
              <p className="text-[11px] text-slate-400">Home dispatched</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Cancelled</span>
              <p className="text-2xl font-bold text-slate-900">{orders?.cancelled || 0}</p>
              <p className="text-[11px] text-slate-400">Voided orders</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Channel Distribution</h4>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderTypeData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {orderTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [`${val} orders`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="text-orange-500 w-5 h-5" />
                <span>Inventory Valuation & Wastage Report</span>
              </h3>
              <p className="text-xs text-slate-500">
                Current stock valuation and logged wastage from {formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Items</span>
              <p className="text-2xl font-bold text-slate-900 pt-1">{inventory?.totalItems || 0}</p>
              <p className="text-[11px] text-slate-500">Tracked ingredients & supplies</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Valuation</span>
              <p className="text-2xl font-bold text-emerald-600 pt-1">₹{(inventory?.stockValuation || 0).toLocaleString()}</p>
              <p className="text-[11px] text-slate-500">Current cost value on hand</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
              <p className="text-2xl font-bold text-rose-600 pt-1">{inventory?.lowStock?.length || 0}</p>
              <p className="text-[11px] text-rose-500">Items below minimum reorder level</p>
            </div>
          </div>

          {/* Wastage Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Wastage Logged In Selected Period</h4>
            {inventory?.wastage && inventory.wastage.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-y border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Item</th>
                      <th className="py-2.5 px-4">Quantity Wasted</th>
                      <th className="py-2.5 px-4">Reason</th>
                      <th className="py-2.5 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {inventory.wastage.map((w, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 text-slate-800 font-bold">{w.inventoryItem?.name || "Item"}</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">
                          {w.quantity} {w.inventoryItem?.unit || ""}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{w.notes || "Spoilage / Expiry"}</td>
                        <td className="py-2.5 px-4 text-slate-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">No wastage logged in the selected date range.</div>
            )}
          </div>
        </div>
      )}

      {/* GST TAB */}
      {activeTab === "gst" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="text-orange-500 w-5 h-5" />
                <span>GST & Tax Filing Report</span>
              </h3>
              <p className="text-xs text-slate-500">
                Taxable turnover and output GST collected from {formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taxable Sales</span>
              <p className="text-2xl font-bold text-slate-900 pt-1">₹{(gst?.taxableSales || 0).toLocaleString()}</p>
              <p className="text-[11px] text-slate-500">Turnover before taxes</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm space-y-1 bg-emerald-50/20">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total GST Collected</span>
              <p className="text-2xl font-bold text-emerald-700 pt-1">₹{(gst?.gstCollected || 0).toLocaleString()}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">Total output tax</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CGST (2.5%)</span>
              <p className="text-2xl font-bold text-slate-900 pt-1">₹{(gst?.cgst || 0).toLocaleString()}</p>
              <p className="text-[11px] text-slate-500">Central government share</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SGST (2.5%)</span>
              <p className="text-2xl font-bold text-slate-900 pt-1">₹{(gst?.sgst || 0).toLocaleString()}</p>
              <p className="text-[11px] text-slate-500">State government share</p>
            </div>
          </div>
        </div>
      )}

      {/* BEST SELLERS TAB */}
      {activeTab === "bestsellers" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="text-orange-500 w-5 h-5" />
                <span>Best Selling & Product Performance Report</span>
              </h3>
              <p className="text-xs text-slate-500">
                Menu items ranked by popularity and sales revenue from {formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 10 Best Sellers */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Top 10 Best Sellers</span>
              </h4>
              {products?.bestSelling && products.bestSelling.length > 0 ? (
                <div className="space-y-2">
                  {products.bestSelling.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.quantity} orders sold</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">₹{p.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">No product sales in the selected period</div>
              )}
            </div>

            {/* Slow Moving Items */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Slow Moving Items</h4>
              {products?.lowSelling && products.lowSelling.length > 0 ? (
                <div className="space-y-2">
                  {products.lowSelling.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-700">{p.name}</p>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700">{p.quantity} sold</span>
                        <span className="text-[10px] text-slate-400 block">₹{p.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">No low selling data for this period</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OTHER NON-OVERVIEW TABS (Expenses, Staff, Customers) */}
      {activeTab !== "overview" &&
        activeTab !== "payments" &&
        activeTab !== "petty-cash" &&
        activeTab !== "sales" &&
        activeTab !== "orders" &&
        activeTab !== "inventory" &&
        activeTab !== "gst" &&
        activeTab !== "bestsellers" && (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 capitalize">{activeTab} Report Detail</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Showing data from {formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}. All figures update automatically with your POS activity.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab("overview")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Back to Overview Dashboard
              </button>
            </div>
          </div>
        )}

      {/* Petty Cash Modal */}
      <PettyCashModal
        isOpen={showPettyCashModal}
        onClose={() => {
          setShowPettyCashModal(false);
          loadData();
        }}
        activeCounter="Counter 1"
      />
    </div>
  );
}
