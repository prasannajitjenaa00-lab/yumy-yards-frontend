import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../../services/orderService";
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MoreVertical,
  User,
  Utensils,
  Truck,
} from "lucide-react";

const STATUS_BADGES = {
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200/60",
  OPEN: "bg-blue-50 text-blue-700 border-blue-200/60",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200/60",
  CONFIRMED: "bg-purple-50 text-purple-700 border-purple-200/60",
  PREPARING: "bg-blue-50 text-blue-700 border-blue-200/60",
  READY: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  SERVED: "bg-emerald-100 text-emerald-800 border-emerald-300/60",
  COMPLETED: "bg-purple-50 text-purple-700 border-purple-200/60",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200/60",
  REFUNDED: "bg-rose-50 text-rose-700 border-rose-200/60",
};

const PAYMENT_BADGES = {
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  UNPAID: "bg-amber-50 text-amber-700 border-amber-200/60",
  PARTIAL: "bg-blue-50 text-blue-700 border-blue-200/60",
  REFUNDED: "bg-rose-50 text-rose-700 border-rose-200/60",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders(statusFilter ? { status: statusFilter } : {});
      setOrders(Array.isArray(res?.data) ? res.data : res?.data?.orders || []);
    } catch (e) {
      console.error("Fetch orders error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Compute stats
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => ["PENDING", "OPEN", "DRAFT"].includes(o.orderStatus)).length;
  const preparingCount = orders.filter((o) => ["PREPARING", "CONFIRMED"].includes(o.orderStatus)).length;
  const readyCount = orders.filter((o) => ["READY", "SERVED"].includes(o.orderStatus)).length;
  const completedCount = orders.filter((o) => o.orderStatus === "COMPLETED").length;
  const cancelledCount = orders.filter((o) => ["CANCELLED", "REFUNDED"].includes(o.orderStatus)).length;

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderNumStr = String(o.orderNumber || o._id || "").toLowerCase();
      const customerStr = String(o.customerName || o.customer?.name || "").toLowerCase();
      const tableStr = String(o.table?.number || o.table?.tableNumber || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchSearch =
        !query ||
        orderNumStr.includes(query) ||
        customerStr.includes(query) ||
        tableStr.includes(query);

      return matchSearch;
    });
  }, [orders, searchQuery]);

  // Pagination calculation
  const totalOrders = filteredOrders.length;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  return (
    <div className="space-y-6 pb-10">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 shadow-inner">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
            <p className="text-xs text-slate-500 mt-0.5">View and manage all restaurant orders</p>
          </div>
        </div>

        {/* Center Banner Graphic Accent */}
        <div className="hidden xl:flex items-center gap-3 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop"
            alt="Food Banner"
            className="w-28 h-10 rounded-xl object-cover border border-slate-200 shadow-sm"
          />
          <div className="px-3 py-1 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold rounded-full italic">
            "Good Food Brings People Together"
          </div>
        </div>

        {/* Right Action Button */}
        <div className="relative z-10 self-start md:self-auto">
          <Link
            to="/pos"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Order</span>
          </Link>
        </div>
      </div>

      {/* 2. Top 6 KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Orders</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{totalCount}</h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>↑ 12% from last week</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Pending</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{pendingCount}</h3>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Awaiting confirmation</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Preparing */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Preparing</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{preparingCount}</h3>
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">In kitchen</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
        </div>

        {/* Ready */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Ready</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{readyCount}</h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Ready to serve</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Completed</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{completedCount}</h3>
            <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Today</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Cancelled */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Cancelled</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{cancelledCount}</h3>
            <p className="text-[10px] text-rose-500 font-semibold mt-0.5">This week</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => { setStatusFilter(""); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              statusFilter === ""
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>✦ All Orders</span>
          </button>

          <button
            onClick={() => { setStatusFilter("PENDING"); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              statusFilter === "PENDING"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Pending</span>
          </button>

          <button
            onClick={() => { setStatusFilter("PREPARING"); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              statusFilter === "PREPARING"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-blue-50 text-blue-700 border border-blue-200/60 hover:bg-blue-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Preparing</span>
          </button>

          <button
            onClick={() => { setStatusFilter("READY"); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              statusFilter === "READY"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Ready</span>
          </button>

          <button
            onClick={() => { setStatusFilter("COMPLETED"); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              statusFilter === "COMPLETED"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-purple-50 text-purple-700 border border-purple-200/60 hover:bg-purple-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Completed</span>
          </button>

          <button
            onClick={() => { setStatusFilter("CANCELLED"); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              statusFilter === "CANCELLED"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-rose-50 text-rose-700 border border-rose-200/60 hover:bg-rose-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Cancelled</span>
          </button>
        </div>

        {/* Right Search & Date Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl pl-8 pr-7 py-2 border border-slate-200 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search orders, customer, table..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-8 pr-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>
      </div>

      {/* 4. Orders Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between min-h-[400px]">
        {!loading && paginatedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Table</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedOrders.map((order, idx) => {
                  const rowIndex = (currentPage - 1) * pageSize + idx + 1;
                  const orderNum = order.orderNumber || `#ORD-${order._id?.slice(-6)}`;
                  const statusBadge = STATUS_BADGES[order.orderStatus] || "bg-slate-100 text-slate-700 border-slate-200";
                  const payBadge = PAYMENT_BADGES[order.paymentStatus] || "bg-amber-50 text-amber-700 border-amber-200";

                  let formattedDate = "-";
                  if (order.createdAt) {
                    try {
                      formattedDate = new Date(order.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    } catch (e) {
                      formattedDate = order.createdAt;
                    }
                  }

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-400">{rowIndex}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">#{orderNum.replace(/^#/, "")}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px]">
                          {order.orderType === "TAKEAWAY" ? "🛍️ Takeaway" : order.orderType === "DELIVERY" ? "🚚 Delivery" : "🍽️ Dine In"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {order.table?.number ? `Table ${order.table.number}` : order.table?.tableNumber ? `Table ${order.table.tableNumber}` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.customerName || order.customer?.name || "Walk-in Customer"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {order.items?.length || 1} items
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${payBadge}`}>
                          {order.paymentStatus || "UNPAID"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        ₹{(order.grandTotal || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/orders/${order._id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 hover:bg-orange-50 px-2.5 py-1 rounded-lg transition-colors border border-orange-200/60"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                          <button
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                            title="More options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
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
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center mb-4 shadow-sm">
              <ClipboardList className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">No orders found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              You haven't received any orders yet. Orders will appear here once customers place them.
            </p>

            <Link
              to="/pos"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Order</span>
            </Link>
          </div>
        )}

        {/* 5. Table Footer / Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40">
          <div>
            Showing <span className="font-bold text-slate-800">{paginatedOrders.length}</span> of{" "}
            <span className="font-bold text-slate-800">{totalOrders}</span> orders
          </div>

          <div className="flex items-center gap-3">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none shadow-2xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="w-7 h-7 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage * pageSize >= totalOrders}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
