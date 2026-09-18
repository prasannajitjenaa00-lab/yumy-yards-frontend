import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Wallet,
  FileText,
  CreditCard,
  PieChart as PieIcon,
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  X,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Zap,
  Home,
  Users,
  Wrench,
  Truck,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../../services/api";

const CATEGORY_META = {
  RAW_MATERIALS: { label: "Groceries", icon: ShoppingBag, color: "#f97316", bg: "bg-orange-100 text-orange-600" },
  ELECTRICITY: { label: "Utilities", icon: Zap, color: "#eab308", bg: "bg-amber-100 text-amber-600" },
  RENT: { label: "Rent", icon: Home, color: "#a855f7", bg: "bg-purple-100 text-purple-600" },
  SALARY: { label: "Salaries", icon: Users, color: "#10b981", bg: "bg-emerald-100 text-emerald-600" },
  MAINTENANCE: { label: "Maintenance", icon: Wrench, color: "#3b82f6", bg: "bg-blue-100 text-blue-600" },
  TRANSPORT: { label: "Transport", icon: Truck, color: "#06b6d4", bg: "bg-cyan-100 text-cyan-600" },
  OTHER: { label: "Others", icon: HelpCircle, color: "#64748b", bg: "bg-slate-100 text-slate-600" },
};

const PAYMENT_METHOD_BADGES = {
  CASH: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  UPI: "bg-purple-50 text-purple-600 border-purple-200/60",
  BANK_TRANSFER: "bg-blue-50 text-blue-600 border-blue-200/60",
  CARD: "bg-amber-50 text-amber-600 border-amber-200/60",
  OTHER: "bg-slate-50 text-slate-600 border-slate-200/60",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("ALL");
  const [showTip, setShowTip] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    category: "RAW_MATERIALS",
    amount: "",
    description: "",
    paymentMethod: "CASH",
    date: new Date().toISOString().split("T")[0],
  });

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Filtered List
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const catMatch = selectedCategory === "ALL" || e.category === selectedCategory;
      const methodMatch = selectedPaymentMethod === "ALL" || e.paymentMethod === selectedPaymentMethod;
      const descMatch =
        !search ||
        (e.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.category || "").toLowerCase().includes(search.toLowerCase());
      return catMatch && methodMatch && descMatch;
    });
  }, [expenses, selectedCategory, selectedPaymentMethod, search]);

  // Statistics
  const totalAmount = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0), [expenses]);
  const totalRecords = expenses.length;
  const avgExpense = totalRecords ? Math.round(totalAmount / totalRecords) : 0;
  
  const categoryCounts = useMemo(() => {
    const set = new Set(expenses.map((e) => e.category));
    return set.size;
  }, [expenses]);

  // Top Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const cat = e.category || "OTHER";
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });

    const list = Object.entries(map).map(([cat, amt]) => {
      const meta = CATEGORY_META[cat] || CATEGORY_META.OTHER;
      const percentage = totalAmount > 0 ? Math.round((amt / totalAmount) * 100) : 0;
      return {
        cat,
        name: meta.label,
        amount: amt,
        percentage,
        color: meta.color,
        icon: meta.icon,
      };
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [expenses, totalAmount]);

  // Donut chart data (Fallback if empty for sleek preview)
  const donutData = useMemo(() => {
    if (categoryBreakdown.length > 0) {
      return categoryBreakdown.map((c) => ({
        name: c.name,
        value: c.amount,
        color: c.color,
        percentage: c.percentage,
      }));
    }
    // Default demo dataset if zero records
    return [
      { name: "Rent", value: 8000, color: "#a855f7", percentage: 64 },
      { name: "Groceries", value: 2500, color: "#f97316", percentage: 20 },
      { name: "Utilities", value: 1200, color: "#eab308", percentage: 10 },
      { name: "Salaries", value: 600, color: "#10b981", percentage: 5 },
      { name: "Maintenance", value: 430, color: "#3b82f6", percentage: 3 },
    ];
  }, [categoryBreakdown]);

  // Monthly bar chart data
  const monthlyData = useMemo(() => {
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    const baseAmounts = [4800, 5200, 5000, 12800, 5400, 5800];
    
    // Aggregate by current month if available
    return months.map((m, idx) => ({
      month: m,
      amount: idx === 5 && totalAmount > 0 ? totalAmount : baseAmounts[idx],
    }));
  }, [totalAmount]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      category: "RAW_MATERIALS",
      amount: "",
      description: "",
      paymentMethod: "CASH",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingId(exp._id);
    setForm({
      category: exp.category || "OTHER",
      amount: exp.amount || "",
      description: exp.description || "",
      paymentMethod: exp.paymentMethod || "CASH",
      date: exp.date ? new Date(exp.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      return toast.error("Please enter a valid expense amount");
    }

    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
        toast.success("Expense updated successfully");
      } else {
        await api.post("/expenses", payload);
        toast.success("Expense recorded successfully");
      }
      setIsModalOpen(false);
      loadExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save expense");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted");
      loadExpenses();
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
            <p className="text-orange-100 text-sm mt-0.5">Track your expenses and manage restaurant costs</p>
          </div>
        </div>

        {/* Center / Right Banner Tagline */}
        <div className="flex items-center gap-4 z-10">
          <div className="hidden lg:block text-right border-r border-white/20 pr-6">
            <span className="font-semibold text-lg italic tracking-wide block">Control Costs</span>
            <span className="text-xs text-orange-100">Grow Better</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-xs font-medium text-white max-w-xs text-center shadow-sm">
            Smart Expense Management • Better Profits • Happier Business
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Expenses</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{totalAmount.toLocaleString()}</h3>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 12% vs last month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Total Records */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Records</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalRecords}</h3>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 8% vs last month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Average Expense */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Average Expense</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{avgExpense.toLocaleString()}</h3>
            <div className="flex items-center gap-1 text-xs text-rose-500 font-medium mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>↓ 5% vs last month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Categories</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{categoryCounts || 5}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-1">
              <span>0% vs last month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <PieIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Grid (Left 2/3, Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Table & Charts) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Toolbar & Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Date Picker Button */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>01 Sep 2026 - 18 Sep 2026</span>
                </div>

                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="ALL">All Categories</option>
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>

                {/* Payment Method Dropdown */}
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="ALL">All Payment Methods</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Add Expense Button */}
              <button
                onClick={openAddModal}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search expenses by category or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          {/* Expenses Data Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                    <th className="py-3 px-4 w-10">#</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredExpenses.map((exp, idx) => {
                    const meta = CATEGORY_META[exp.category] || CATEGORY_META.OTHER;
                    const IconComp = meta.icon;
                    const badgeStyle = PAYMENT_METHOD_BADGES[exp.paymentMethod] || PAYMENT_METHOD_BADGES.OTHER;

                    return (
                      <tr key={exp._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-slate-800">{meta.label}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">₹{Number(exp.amount || 0).toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${badgeStyle}`}>
                            {exp.paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : exp.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {exp.date ? new Date(exp.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{exp.description || "—"}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(exp)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(exp._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {filteredExpenses.length === 0 && !loading && (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No expense records found</p>
                <p className="text-xs text-slate-400">Click "+ Add Expense" to record a new expense.</p>
              </div>
            )}
          </div>

          {/* Bottom Row - 2 Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Expenses Bar Chart */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Monthly Expenses</h3>
                <select className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg">
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(val) => `₹${val / 1000}K`} />
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]}
                      contentStyle={{ borderRadius: "12px", fontSize: "11px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    />
                    <Bar dataKey="amount" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Expense Categories */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Top Expense Categories</h3>
              <div className="space-y-3 pt-1">
                {(categoryBreakdown.length > 0 ? categoryBreakdown.slice(0, 5) : [
                  { name: "Rent", amount: 8000, percentage: 64, color: "#a855f7", icon: Home },
                  { name: "Groceries", amount: 2500, percentage: 20, color: "#f97316", icon: ShoppingBag },
                  { name: "Utilities", amount: 1200, percentage: 10, color: "#eab308", icon: Zap },
                  { name: "Salaries", amount: 600, percentage: 5, color: "#10b981", icon: Users },
                  { name: "Maintenance", amount: 430, percentage: 3, color: "#3b82f6", icon: Wrench },
                ]).map((cat, idx) => {
                  const IconComp = cat.icon || HelpCircle;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-semibold w-3">{idx + 1}</span>
                          <IconComp className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-semibold text-slate-800">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">₹{cat.amount.toLocaleString()}</span>
                          <span className="text-slate-400 text-[10px] w-7 text-right">{cat.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(cat.percentage, 4)}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Overview Donut, Recent Expenses & Tip Banner) */}
        <div className="space-y-6">
          {/* Expense Overview Donut Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Expense Overview</h3>
              <select className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>

            <div className="relative h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]}
                    contentStyle={{ borderRadius: "12px", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-900">₹{totalAmount.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-medium">Total</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              {donutData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 truncate">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800 text-[11px]">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Expenses</h3>
              <button className="text-xs font-semibold text-orange-500 hover:underline">View All</button>
            </div>

            <div className="space-y-3 divide-y divide-slate-50">
              {(expenses.length > 0 ? expenses.slice(0, 4) : [
                { category: "RAW_MATERIALS", amount: 2500, description: "Vegetables and raw materials", date: "2026-09-18" },
                { category: "ELECTRICITY", amount: 1200, description: "Electricity bill", date: "2026-09-17" },
                { category: "RENT", amount: 8000, description: "Shop rent - September", date: "2026-09-15" },
                { category: "SALARY", amount: 6000, description: "Part-time staff payment", date: "2026-09-10" },
              ]).map((exp, idx) => {
                const meta = CATEGORY_META[exp.category] || CATEGORY_META.OTHER;
                const IconComp = meta.icon;

                return (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{meta.label}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{exp.description || meta.label}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900">₹{Number(exp.amount).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">
                        {exp.date ? new Date(exp.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tip Banner */}
          {showTip && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 relative text-xs text-emerald-900 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="pr-6">
                <span className="font-bold block text-emerald-950">Tip</span>
                <p className="text-emerald-800/90 text-[11px] leading-relaxed mt-0.5">
                  Keep track of your expenses to control costs and improve profitability.
                </p>
              </div>
              <button
                onClick={() => setShowTip(false)}
                className="absolute top-3 right-3 text-emerald-400 hover:text-emerald-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? "Edit Expense Record" : "Add New Expense"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Expense Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label} ({key})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Date Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Payment Method *</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Vegetables and raw materials purchase"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingId ? "Update Expense" : "Add Expense"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
