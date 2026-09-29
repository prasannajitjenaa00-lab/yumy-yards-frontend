import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Bell, X, CheckCircle2, Clock, Search, ArrowRight } from "lucide-react";
import { getBillRequests, processBill } from "../../services/orderService";
import { getSocket } from "../../socket/socketClient";

export default function MobileNotificationsDrawer({ isOpen, onClose, onCountUpdate }) {
  const navigate = useNavigate();
  const [billRequests, setBillRequests] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadBillRequests = async () => {
    try {
      setLoading(true);
      const res = await getBillRequests();
      const list = Array.isArray(res?.data) ? res.data : [];
      setBillRequests(list);
      const pendingCount = list.filter(
        (r) => r.billStatus === "REQUESTED" || r.billStatus === "PROCESSING"
      ).length;
      if (onCountUpdate) onCountUpdate(pendingCount);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillRequests();

    const socket = getSocket();
    if (socket) {
      socket.on("bill:request", loadBillRequests);
      socket.on("table:update", loadBillRequests);
      socket.on("payment:new", loadBillRequests);
      socket.on("bill:processing", loadBillRequests);
    }

    return () => {
      if (socket) {
        socket.off("bill:request", loadBillRequests);
        socket.off("table:update", loadBillRequests);
        socket.off("payment:new", loadBillRequests);
        socket.off("bill:processing", loadBillRequests);
      }
    };
  }, []);

  const pendingRequests = useMemo(() => {
    return billRequests.filter(
      (r) => r.billStatus === "REQUESTED" || r.billStatus === "PROCESSING"
    );
  }, [billRequests]);

  const filteredRequests = useMemo(() => {
    return billRequests.filter((r) => {
      const matchFilter =
        filter === "All" ||
        (filter === "Pending" && (r.billStatus === "REQUESTED" || r.billStatus === "PROCESSING")) ||
        (filter === "Processing" && r.billStatus === "PROCESSING") ||
        (filter === "Generated" && r.billStatus === "GENERATED") ||
        (filter === "Paid" && r.billStatus === "PAID");

      const orderNum = (r.orderNumber || "").toLowerCase();
      const tblNum = String(r.table?.number || "").toLowerCase();
      const cust = (r.customer?.name || "").toLowerCase();
      const q = search.toLowerCase();

      return matchFilter && (!search || orderNum.includes(q) || tblNum.includes(q) || cust.includes(q));
    });
  }, [billRequests, filter, search]);

  const handleProcessBillClick = async (orderId) => {
    try {
      await processBill(orderId);
      toast.info("Opening order for processing...");
      onClose();
      navigate(`/orders/${orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process bill");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      <div
        className="w-full bg-slate-50 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Notifications</h2>
              <p className="text-[10px] text-slate-500 font-medium">Real-time table billing alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {pendingRequests.length} Pending
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="p-3 bg-white border-b border-slate-200/60 space-y-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
            {["Pending", "All", "Processing", "Generated", "Paid"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                  filter === tab
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search table or order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[11px] rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="pt-2.5 first:pt-0 bg-white p-3 rounded-2xl border border-slate-200/70 shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900">
                    {req.table ? `Table ${req.table.number}` : "Takeaway / Delivery"}
                  </span>
                  <p className="text-[10px] font-mono font-bold text-orange-600">{req.orderNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900">₹{req.grandTotal}</span>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {req.items?.length || 1} Item(s)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span>
                  By:{" "}
                  <strong className="text-slate-800">
                    {req.billRequestedBy?.name || req.createdBy?.name || "Staff"}
                  </strong>
                </span>
                <span>
                  {req.billRequestedAt
                    ? new Date(req.billRequestedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/orders/${req._id}`);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-2 rounded-xl text-center transition-all"
                >
                  View Order
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessBillClick(req._id)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] py-2 rounded-xl text-center shadow-xs transition-all"
                >
                  Process Bill
                </button>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <p className="text-xs font-bold text-slate-600">No notifications found</p>
              <p className="text-[10px]">Real-time bill requests will appear here as tables order.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
