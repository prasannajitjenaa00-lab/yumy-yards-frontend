import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getWhatsAppNotifications } from "../../services/orderService";
import { getSocket } from "../../socket/socketClient";
import {
  MessageCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  CircleSlash,
  Eye,
  RefreshCw,
} from "lucide-react";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "read", label: "Read" },
  { value: "failed", label: "Failed" },
  { value: "skipped", label: "Skipped" },
  { value: "sending", label: "Pending" },
];

const STATUS_BADGES = {
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  read: "bg-teal-50 text-teal-700 border-teal-200/60",
  sending: "bg-amber-50 text-amber-700 border-amber-200/60",
  failed: "bg-rose-50 text-rose-700 border-rose-200/60",
  skipped: "bg-slate-100 text-slate-600 border-slate-200/60",
};

const STATUS_ICONS = {
  sent: CheckCircle2,
  delivered: CheckCircle2,
  read: Eye,
  sending: Clock,
  failed: XCircle,
  skipped: CircleSlash,
};

function StatusBadge({ status }) {
  const Icon = STATUS_ICONS[status] || Clock;
  const cls = STATUS_BADGES[status] || "bg-slate-100 text-slate-600 border-slate-200/60";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap ${cls}`}>
      <Icon size={12} />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
    </span>
  );
}

export default function WhatsAppNotifications() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 20 });

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status) params.status = status;
      if (search.trim()) params.search = search.trim();
      const res = await getWhatsAppNotifications(params);
      setRows(Array.isArray(res?.data) ? res.data : []);
      setMeta(res?.meta || { total: 0, limit: 20 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load WhatsApp notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) socket.on("order:whatsapp", load);
    return () => {
      if (socket) socket.off("order:whatsapp", load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 20)));

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
            <MessageCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">WhatsApp Notifications</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Delivery status of "Food Ready" WhatsApp messages sent to customers
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => { setStatus(tab.value); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                status === tab.value
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order number, customer name or phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Counter</th>
                <th className="px-4 py-3">WhatsApp Status</th>
                <th className="px-4 py-3">Message ID</th>
                <th className="px-4 py-3">Sent At</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                    No WhatsApp notifications found.
                  </td>
                </tr>
              ) : (
                rows.map((order) => {
                  const foodReady = order.whatsappNotification?.foodReady || {};
                  return (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">
                        <Link to={`/orders/${order._id}`} className="hover:text-emerald-600 hover:underline">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{order.customer?.name || "—"}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{order.customer?.phone || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{order.counter || "—"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={foodReady.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px] max-w-[160px] truncate" title={foodReady.messageId || ""}>
                        {foodReady.messageId || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {foodReady.sentAt ? new Date(foodReady.sentAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-rose-600 text-xs max-w-[220px] truncate" title={foodReady.error || ""}>
                        {foodReady.error || ""}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && rows.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing page {page} of {totalPages} • {meta.total} total
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
