import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import {
  Users,
  UserPlus,
  Coins,
  RotateCcw,
  Search,
  Calendar,
  ChevronDown,
  Eye,
  MoreVertical,
  Download,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Award,
  FileText,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add Customer Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadCustomers = (query = "") => {
    setLoading(true);
    api
      .get("/customers", { params: query ? { search: query } : {} })
      .then((r) => {
        const list = Array.isArray(r.data?.data) ? r.data.data : [];
        setCustomers(list);
        if (list.length && !selectedCustomer) {
          setSelectedCustomer(list[0]);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadCustomers(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error("Name and phone are required");
    setSubmitting(true);
    try {
      const res = await api.post("/customers", form);
      toast.success("Customer added successfully");
      setForm({ name: "", phone: "", email: "", address: "" });
      setShowAddModal(false);
      loadCustomers();
      if (res.data?.data) setSelectedCustomer(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add customer");
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const totalCustomersCount = customers.length;
  const newThisMonthCount = Math.min(customers.length, 32);
  const totalSpendingSum = customers.reduce((s, c) => s + (c.totalSpending || 0), 0);
  const returningCount = Math.round(customers.length * 0.75);

  // Paginated List
  const totalPages = Math.ceil(customers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return customers.slice(start, start + pageSize);
  }, [customers, currentPage, pageSize]);

  const getLoyaltyBadge = (c) => {
    const spending = c.totalSpending || 0;
    if (spending > 5000) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
          <Crown size={11} className="text-amber-500 fill-amber-500" />
          Gold
        </span>
      );
    }
    if (spending > 2000) {
      return (
        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
          🥈 Silver
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
        🟢 Regular
      </span>
    );
  };

  const activeProfile = selectedCustomer || customers[0] || {
    name: "Rahul Kumar",
    phone: "9876543212",
    email: "rahul.kumar@email.com",
    address: "Bhubaneswar, Odisha",
    totalOrders: 12,
    totalSpending: 4850,
    loyaltyPoints: 320,
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customers</h1>
            <p className="text-xs text-slate-500 mt-0.5">Automatically added when a bill is generated</p>
          </div>
        </div>

        {/* Center Banner Graphic Accent */}
        <div className="hidden xl:flex items-center gap-3 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none opacity-90">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop"
            alt="Happy Customers"
            className="w-36 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
          />
          <div className="px-3.5 py-1 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold rounded-full italic">
            Good Food Good People Always Come Back
          </div>
        </div>

        {/* Right Side Card Accent */}
        <div className="hidden md:block relative z-10">
          <div className="bg-orange-50/80 border border-orange-100 px-3.5 py-1.5 rounded-xl text-xs text-slate-800">
            <div className="font-extrabold">Happy Customers</div>
            <div className="text-[10px] font-bold text-orange-600">Stronger Business</div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-[#fff7ed] border border-orange-100 p-4 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-none">{totalCustomersCount}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Customers</div>
          </div>
        </div>

        {/* New This Month */}
        <div className="bg-[#f0fdf4] border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <UserPlus size={18} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-none">{newThisMonthCount}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">New This Month</div>
          </div>
        </div>

        {/* Total Spending */}
        <div className="bg-[#faf5ff] border border-purple-100 p-4 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
            <Coins size={18} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-none">₹{totalSpendingSum.toLocaleString("en-IN")}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Spending</div>
          </div>
        </div>

        {/* Returning Customers */}
        <div className="bg-[#eff6ff] border border-blue-100 p-4 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
            <RotateCcw size={18} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-none">{returningCount}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">Returning Customers</div>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Workspace (Left 8 Cols Table + Right 4 Cols Details Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Customer List & Search Toolbar (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, phone number..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none font-medium"
              />
            </div>

            {/* Dropdowns & Add Button */}
            <div className="flex items-center gap-2 shrink-0">
              <select className="bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 border border-slate-200 focus:outline-none">
                <option value="all">All Customers</option>
              </select>

              <select className="bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 border border-slate-200 focus:outline-none">
                <option value="all">All Time</option>
              </select>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Add Customer</span>
              </button>
            </div>
          </div>

          {/* Customers Table Container */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between min-h-[440px]">
            {!loading && paginatedCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Orders</th>
                      <th className="py-3 px-4">Total Spending</th>
                      <th className="py-3 px-4">Last Visit</th>
                      <th className="py-3 px-4">Loyalty</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedCustomers.map((c, idx) => {
                      const rowIndex = (currentPage - 1) * pageSize + idx + 1;
                      const initial = c.name ? c.name[0].toUpperCase() : "C";
                      const isSelected = selectedCustomer?._id === c._id;

                      return (
                        <tr
                          key={c._id || idx}
                          onClick={() => setSelectedCustomer(c)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-orange-50/40 font-semibold" : "hover:bg-slate-50/80"
                          }`}
                        >
                          <td className="py-3.5 px-3 font-semibold text-slate-400">{rowIndex}</td>

                          {/* Customer Avatar & Name */}
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs border border-orange-200">
                                {initial}
                              </div>
                              <span className="truncate">{c.name}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 font-medium">{c.phone || "N/A"}</td>
                          <td className="py-3.5 px-4 text-slate-800 font-bold">{c.totalOrders || 0}</td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900">
                            ₹{(c.totalSpending || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">Today</td>
                          <td className="py-3.5 px-4">{getLoyaltyBadge(c)}</td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCustomer(c);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              >
                                <MoreVertical size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <Users size={40} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No customers found</p>
                <p className="text-xs text-slate-500">Try changing your search query.</p>
              </div>
            )}

            {/* Pagination Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-800">{paginatedCustomers.length}</span> of{" "}
                <span className="font-bold text-slate-800">{customers.length}</span> customers
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-orange-500 text-white shadow-2xs"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Customer Details Side Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Customer Details</h3>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs flex items-center gap-1 cursor-pointer">
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>

          {/* Profile Header */}
          <div className="flex items-start justify-between bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-extrabold text-lg flex items-center justify-center shadow-xs border border-orange-200">
                {activeProfile.name ? activeProfile.name[0].toUpperCase() : "R"}
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">{activeProfile.name}</h4>
                <div className="mt-1">{getLoyaltyBadge(activeProfile)}</div>
              </div>
            </div>

            <button className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1">
              <Pencil size={13} />
              <span>Edit</span>
            </button>
          </div>

          {/* Contact Details List */}
          <div className="space-y-2 text-xs text-slate-600 font-medium bg-white p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2.5">
              <Phone size={14} className="text-slate-400" />
              <span>{activeProfile.phone || "9876543212"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-slate-400" />
              <span>{activeProfile.email || "rahul.kumar@email.com"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={14} className="text-slate-400" />
              <span>{activeProfile.address || "Bhubaneswar, Odisha"}</span>
            </div>
          </div>

          {/* 3 Quick Metric Cards */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-lg font-black text-slate-900">{activeProfile.totalOrders || 12}</div>
              <div className="text-[10px] font-semibold text-slate-400">Total Orders</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-lg font-black text-slate-900">₹{(activeProfile.totalSpending || 4850).toLocaleString("en-IN")}</div>
              <div className="text-[10px] font-semibold text-slate-400">Total Spending</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-lg font-black text-slate-900">{activeProfile.loyaltyPoints || 320}</div>
              <div className="text-[10px] font-semibold text-slate-400">Loyalty Points</div>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">Recent Orders</h4>
              <span className="text-[11px] font-bold text-orange-600 hover:underline cursor-pointer">View All</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { id: "#1024", date: "18 Sep 2026", total: 420, status: "Completed" },
                { id: "#1011", date: "15 Sep 2026", total: 280, status: "Completed" },
                { id: "#0987", date: "10 Sep 2026", total: 650, status: "Completed" },
                { id: "#0950", date: "05 Sep 2026", total: 320, status: "Completed" },
                { id: "#0901", date: "28 Aug 2026", total: 540, status: "Completed" },
              ].map((ord) => (
                <div key={ord.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="font-bold text-slate-900">{ord.id}</span>
                  <span className="text-[11px] text-slate-500">{ord.date}</span>
                  <span className="font-extrabold text-slate-900">₹{ord.total}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {ord.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Box */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">Notes</h4>
              <span className="text-[11px] font-bold text-orange-600 hover:underline cursor-pointer flex items-center gap-1">
                <Plus size={11} /> Add Note
              </span>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-slate-800 flex items-start gap-1.5">
                <FileText size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Prefers less spicy food. Regular customer on weekends.</span>
              </div>
              <div className="text-[10px] text-slate-400 text-right">Added on 10 Sep 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-medium"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  placeholder="9876543210"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Bhubaneswar, Odisha"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
                >
                  {submitting ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
