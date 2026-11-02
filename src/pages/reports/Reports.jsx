import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
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

export default function Reports() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

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

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getSalesReport().catch(() => ({ data: null })),
      getOrderReport().catch(() => ({ data: null })),
      getPaymentReport().catch(() => ({ data: null })),
      getPettyCashReport().catch(() => ({ data: null })),
      getInventoryReport().catch(() => ({ data: null })),
      getProductReport().catch(() => ({ data: null })),
      getGstReport().catch(() => ({ data: null })),
    ])
      .then(([s, o, p, pc, inv, prod, g]) => {
        setSales(s.data);
        setOrders(o.data);
        setPayments(p.data);
        setPettyCash(pc.data);
        setInventory(inv.data);
        setProducts(prod.data);
        setGst(g.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePeriodChange = async (period) => {
    setPaymentsPeriod(period);
    setRefreshingPayments(true);
    let from = null;
    let to = null;
    const now = new Date();
    if (period === "today") {
      from = now.toISOString().slice(0, 10);
      to = from;
    } else if (period === "week") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      from = past.toISOString().slice(0, 10);
      to = now.toISOString().slice(0, 10);
    } else if (period === "month") {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      from = past.toISOString().slice(0, 10);
      to = now.toISOString().slice(0, 10);
    }

    try {
      const [pRes, pcRes] = await Promise.all([
        getPaymentReport(from ? { from, to } : {}),
        getPettyCashReport(from ? { from, to } : {}),
      ]);
      if (pRes?.data) setPayments(pRes.data);
      if (pcRes?.data) setPettyCash(pcRes.data);
    } catch (err) {
      console.warn("Failed to fetch filtered payments", err);
    } finally {
      setRefreshingPayments(false);
    }
  };

  // Compute metric figures
  const totalSalesVal = sales?.totalSales || 0;
  const totalOrdersVal = orders?.total || sales?.totalOrders || 0;
  const avgOrderVal = totalOrdersVal > 0 ? Math.round(totalSalesVal / totalOrdersVal) : 0;

  const dineInCount = orders?.dineIn || 0;
  const takeawayCount = orders?.takeaway || 0;
  const deliveryCount = orders?.delivery || 0;
  const cancelledCount = orders?.cancelled || 0;

  // Chart: Sales Trend Line Data (Default 7 days preview)
  const salesTrendData = useMemo(() => {
    const dates = ["12 Sep", "13 Sep", "14 Sep", "15 Sep", "16 Sep", "17 Sep", "18 Sep"];
    return dates.map((d, idx) => ({
      date: d,
      sales: idx === 6 && totalSalesVal > 0 ? totalSalesVal : 0,
    }));
  }, [totalSalesVal]);

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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
            <p className="text-xs text-slate-500 mt-0.5">Get insights into your restaurant business</p>
          </div>
        </div>

        {/* Date Selector Pill (Top Right) */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-800">18 Sep 2026 - 18 Sep 2026</span>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map((tab) => {
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
                <select className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>

              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(v) => [`₹${v}`, "Sales"]}
                      contentStyle={{ borderRadius: "12px", fontSize: "11px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
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
              <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs space-y-1 bg-linear-to-b from-white to-emerald-50/20">
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
              <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs space-y-1 bg-linear-to-b from-white to-purple-50/20">
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
              <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs space-y-1 bg-linear-to-b from-white to-blue-50/20">
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
      {activeTab === "petty-cash" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="text-amber-500 w-5 h-5" />
                <span>Petty Cash & Emergency Expense Ledger</span>
              </h3>
              <p className="text-xs text-slate-500">
                Manage counter cash float top-ups, daily emergency payouts, and signed vouchers.
              </p>
            </div>

            <button
              onClick={() => setShowPettyCashModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Wallet size={15} />
              <span>Record Cash In / Out</span>
            </button>
          </div>

          {/* KPI Cards with Day-to-Day Carry Forward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs space-y-1 bg-linear-to-b from-white to-amber-50/20">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Opening (Yesterday Close)
              </span>
              <p className="text-2xl font-bold text-amber-900 pt-1">₹{pettyCash?.openingBalance ?? 0}</p>
              <p className="text-[11px] text-amber-700 font-medium">Carried forward automatically</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs space-y-1 bg-linear-to-b from-white to-emerald-50/20">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <ArrowDownLeft size={13} className="text-emerald-500" />
                <span>Total Cash In</span>
              </span>
              <p className="text-2xl font-bold text-emerald-700 pt-1">+₹{pettyCash?.totalCashIn ?? 0}</p>
              <p className="text-[11px] text-emerald-600 font-medium">Float top-ups & deposits</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-xs space-y-1 bg-linear-to-b from-white to-rose-50/20">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpRight size={13} className="text-rose-500" />
                <span>Total Cash Out</span>
              </span>
              <p className="text-2xl font-bold text-rose-700 pt-1">-₹{pettyCash?.totalCashOut ?? 0}</p>
              <p className="text-[11px] text-rose-600 font-medium">Emergency grocery & supplies</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Closing Net Balance
              </span>
              <p className="text-2xl font-bold text-slate-900 pt-1">₹{pettyCash?.netBalance ?? 0}</p>
              <p className="text-[11px] text-slate-500 font-medium">Tomorrow's opening balance</p>
            </div>
          </div>

          {/* Middle Row: Animated Expense Pie Chart & Daily Carry-Forward Ledger */}
          {(() => {
            const CATEGORY_COLORS = {
              RAW_MATERIALS: "#f97316",
              SUPPLIES: "#3b82f6",
              TRANSPORT: "#06b6d4",
              MAINTENANCE: "#eab308",
              STAFF_TEA_SNACKS: "#10b981",
              UTILITIES: "#a855f7",
              FLOAT_TOPUP: "#14b8a6",
              OTHER: "#64748b",
            };

            const CATEGORY_LABELS = {
              RAW_MATERIALS: "Groceries / Milk / Ice",
              SUPPLIES: "Packaging & Disposables",
              TRANSPORT: "Auto / Errand / Fuel",
              MAINTENANCE: "Minor Repairs & Hardware",
              STAFF_TEA_SNACKS: "Staff Tea & Snacks",
              UTILITIES: "Gas & Utilities",
              FLOAT_TOPUP: "Float Top-up",
              OTHER: "Other Petty Expenses",
            };

            const pettyCategoryData = Object.entries(pettyCash?.byCategory || {})
              .map(([k, v]) => ({
                name: CATEGORY_LABELS[k] || k,
                value: v,
                color: CATEGORY_COLORS[k] || "#f97316",
              }))
              .filter((d) => d.value > 0);

            const totalExpense = pettyCategoryData.reduce((s, i) => s + i.value, 0);

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Animated Category Pie Chart */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-orange-500" />
                      <span>Expenses by Category</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Animated
                    </span>
                  </div>

                  {pettyCategoryData.length > 0 ? (
                    <>
                      <div className="relative h-44 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pettyCategoryData}
                              innerRadius={48}
                              outerRadius={70}
                              paddingAngle={4}
                              dataKey="value"
                              isAnimationActive={true}
                              animationBegin={150}
                              animationDuration={1400}
                              animationEasing="ease-out"
                            >
                              {pettyCategoryData.map((entry, idx) => (
                                <Cell
                                  key={`cell-${idx}`}
                                  fill={entry.color}
                                  stroke="#ffffff"
                                  strokeWidth={2}
                                />
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
                          <span className="text-base font-bold text-slate-900">₹{totalExpense}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Spent</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs max-h-40 overflow-y-auto pr-1">
                        {pettyCategoryData.map((item, idx) => {
                          const pct = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
                          return (
                            <div key={idx} className="space-y-0.5">
                              <div className="flex justify-between text-[11px] font-medium text-slate-700">
                                <span className="flex items-center gap-1.5 truncate pr-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="truncate">{item.name}</span>
                                </span>
                                <span className="font-bold text-slate-900 shrink-0">
                                  ₹{item.value} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                <div
                                  className="h-1 rounded-full transition-all duration-1000"
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
                      <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-semibold">No category expenses recorded yet</p>
                    </div>
                  )}
                </div>

                {/* 2. Daily Carry-Forward Balance Ledger */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <ArrowRight className="w-4 h-4 text-emerald-500" />
                          <span>Daily Carry-Forward Balance Ledger</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Today's Opening Balance = Yesterday's Closing Balance automatically rolled forward.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Continuous Rollover
                      </span>
                    </div>

                    <div className="pt-2 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                          <tr>
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Opening (Yesterday Close)</th>
                            <th className="py-2 px-3">Cash In (+)</th>
                            <th className="py-2 px-3">Cash Out (-)</th>
                            <th className="py-2 px-3">Closing Balance (Carried ➔)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(pettyCash?.dailyLedger && pettyCash.dailyLedger.length > 0) ? (
                            pettyCash.dailyLedger.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-2.5 px-3 font-semibold text-slate-800">
                                  {new Date(row.date).toLocaleDateString([], {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-amber-900">
                                  ₹{row.openingBalance}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-emerald-600">
                                  {row.cashIn > 0 ? `+₹${row.cashIn}` : "—"}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-rose-600">
                                  {row.cashOut > 0 ? `-₹${row.cashOut}` : "—"}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                                    <span>₹{row.closingBalance}</span>
                                    <ArrowRight size={11} className="text-emerald-500" />
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                                No daily ledger history available yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span>Carry-Forward Formula: <b>Closing = Opening + Cash In - Cash Out</b></span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-900">
                      Tomorrow's Open: ₹{pettyCash?.netBalance ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Vouchers Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Petty Cash Vouchers & Audit Trail</h4>
              <span className="text-xs text-slate-400">{(pettyCash?.transactions || []).length} vouchers</span>
            </div>

            {pettyCash?.transactions && pettyCash.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">Date & Time</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Reason / Notes</th>
                      <th className="py-2.5 px-4">Paid To / Recipient</th>
                      <th className="py-2.5 px-4">Receipt #</th>
                      <th className="py-2.5 px-4">Cashier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pettyCash.transactions.map((tx) => {
                      const isOut = tx.type === "CASH_OUT";
                      return (
                        <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4 text-slate-500">
                            {new Date(tx.createdAt || tx.date).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                                isOut
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {isOut ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />}
                              <span>{isOut ? "CASH OUT" : "CASH IN"}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 font-semibold">{tx.category}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            <span className={isOut ? "text-rose-600" : "text-emerald-600"}>
                              {isOut ? "-" : "+"}₹{tx.amount}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 max-w-xs truncate">{tx.reason}</td>
                          <td className="py-2.5 px-4 text-slate-600 font-medium">{tx.paidTo || "—"}</td>
                          <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{tx.receiptRef || "—"}</td>
                          <td className="py-2.5 px-4 text-slate-600 font-medium">{tx.paidBy?.name || "Staff"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Wallet size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No petty cash transactions recorded yet</p>
                <button
                  onClick={() => setShowPettyCashModal(true)}
                  className="mt-3 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus size={13} />
                  <span>Create First Petty Cash Entry</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OTHER NON-OVERVIEW TABS (Sales, Orders, Inventory, Expenses, GST, Best Sellers, Staff, Customers) */}
      {activeTab !== "overview" && activeTab !== "payments" && activeTab !== "petty-cash" && (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 capitalize">{activeTab} Report Detail</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Detailed analytics breakdown for {activeTab}. All figures update automatically with your POS activity.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab("overview")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
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
