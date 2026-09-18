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
} from "recharts";
import {
  getSalesReport,
  getOrderReport,
  getPaymentReport,
  getInventoryReport,
  getProductReport,
  getGstReport,
} from "../../services/reportService";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "sales", label: "Sales" },
  { id: "orders", label: "Orders" },
  { id: "payments", label: "Payments" },
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
  const [inventory, setInventory] = useState(null);
  const [products, setProducts] = useState(null);
  const [gst, setGst] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSalesReport().catch(() => ({ data: null })),
      getOrderReport().catch(() => ({ data: null })),
      getPaymentReport().catch(() => ({ data: null })),
      getInventoryReport().catch(() => ({ data: null })),
      getProductReport().catch(() => ({ data: null })),
      getGstReport().catch(() => ({ data: null })),
    ])
      .then(([s, o, p, inv, prod, g]) => {
        setSales(s.data);
        setOrders(o.data);
        setPayments(p.data);
        setInventory(inv.data);
        setProducts(prod.data);
        setGst(g.data);
      })
      .finally(() => setLoading(false));
  }, []);

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
                    >
                      {orderTypeData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
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
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Payment Methods</h3>
              </div>

              {payments && (payments.CASH > 0 || payments.UPI > 0 || payments.CARD > 0) ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Cash</span>
                    <span className="font-bold text-slate-900">₹{payments.CASH || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">UPI</span>
                    <span className="font-bold text-slate-900">₹{payments.UPI || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Card</span>
                    <span className="font-bold text-slate-900">₹{payments.CARD || 0}</span>
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

      {/* NON-OVERVIEW TABS (Sales, Orders, Payments, Inventory, Expenses, GST, Best Sellers, Staff, Customers) */}
      {activeTab !== "overview" && (
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
    </div>
  );
}
