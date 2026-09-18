import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Utensils,
  Grid,
  Users,
  User,
  Clock,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  CreditCard,
  FileCheck,
  Printer,
  ChevronRight,
  ChefHat,
  ShoppingBag,
  Truck,
  Receipt,
  Check,
  RotateCcw,
  BellRing,
  AlertTriangle,
  Info,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import {
  getOrder,
  updateOrderStatus,
  cancelOrder,
  sendKOT,
  requestBill,
  processBill,
  clearTable,
} from "../../services/orderService";
import { recordPayment, generateInvoice, getInvoice } from "../../services/paymentService";
import PrintInvoiceModal from "../../components/common/PrintInvoiceModal";
import { getSocket } from "../../socket/socketClient";
import api from "../../services/api";

const ORDER_STATUS_BADGES = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  OPEN: "bg-blue-100 text-blue-700 border-blue-200",
  CONFIRMED: "bg-purple-100 text-purple-700 border-purple-200",
  PREPARING: "bg-amber-100 text-amber-800 border-amber-300 animate-pulse",
  READY: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
  SERVED: "bg-teal-100 text-teal-800 border-teal-300",
  COMPLETED: "bg-emerald-600 text-white border-emerald-700 font-bold",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

const PAYMENT_STATUS_BADGES = {
  UNPAID: "bg-rose-100 text-rose-700 border-rose-200",
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700 border-amber-200",
  REFUNDED: "bg-slate-100 text-slate-700 border-slate-200",
};

const BILL_STATUS_BADGES = {
  NOT_REQUESTED: "bg-slate-100 text-slate-600 border-slate-200",
  REQUESTED: "bg-amber-100 text-amber-800 border-amber-300 animate-pulse",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-300",
  GENERATED: "bg-purple-100 text-purple-800 border-purple-300",
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [order, setOrder] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [invoice, setInvoice] = useState(null);

  // Modals
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showConfirmBillModal, setShowConfirmBillModal] = useState(false);
  const [showServeModal, setShowServeModal] = useState(false);
  const [showForceClearModal, setShowForceClearModal] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const [restaurantSettings, setRestaurantSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const res = await getOrder(id);
      setOrder(res.data);
      setPayAmount(String(res.data.grandTotal || 0));
    } catch (err) {
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }

    try {
      const invRes = await getInvoice(id);
      setInvoice(invRes.data);
    } catch (err) {
      setInvoice(null);
    }

    try {
      const setRes = await api.get("/settings");
      setRestaurantSettings(setRes.data.data);
    } catch (err) {}
  };

  useEffect(() => {
    loadData();

    // Socket.IO real-time updates for kitchen, order, payment & bill status
    const socket = getSocket();
    if (socket) {
      socket.on("kot:status", loadData);
      socket.on("kot:new", loadData);
      socket.on("order:status", loadData);
      socket.on("payment:new", loadData);
      socket.on("bill:request", loadData);
      socket.on("table:update", loadData);
    }
    return () => {
      if (socket) {
        socket.off("kot:status", loadData);
        socket.off("kot:new", loadData);
        socket.off("order:status", loadData);
        socket.off("payment:new", loadData);
        socket.off("bill:request", loadData);
        socket.off("table:update", loadData);
      }
    };
  }, [id]);

  // Dynamic Timeline Activities (Hook called unconditionally at top-level)
  const activityList = useMemo(() => {
    if (!order) return [];
    const list = [];
    if (order.createdAt) {
      list.push({
        title: "Order created",
        description: `Order #${order.orderNumber} initialized for ${order.table ? `Table ${order.table.number}` : order.orderType}`,
        user: order.createdBy?.name || "Waiter",
        role: "WAITER",
        time: new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        color: "bg-blue-500",
      });
    }

    if (order.statusHistory && order.statusHistory.length > 0) {
      order.statusHistory.forEach((sh) => {
        let desc = `Order moved from ${sh.previousStatus} to ${sh.newStatus}`;
        let title = `Status: ${sh.newStatus}`;
        let color = "bg-amber-500";

        if (sh.newStatus === "CONFIRMED") {
          title = "KOT sent to kitchen";
          desc = "Kitchen order ticket created and broadcast to KDS";
        } else if (sh.newStatus === "PREPARING") {
          title = "Kitchen started preparing";
          desc = "Food preparation started by chef";
          color = "bg-purple-500";
        } else if (sh.newStatus === "READY") {
          title = "Order Ready";
          desc = "All items prepared and ready to serve";
          color = "bg-emerald-500";
        } else if (sh.newStatus === "SERVED") {
          title = "Order served";
          desc = `Served to customer at ${order.table ? `Table ${order.table.number}` : order.orderType}`;
          color = "bg-teal-500";
        } else if (sh.newStatus === "COMPLETED") {
          title = "Order completed";
          desc = "Order closed and table liberated";
          color = "bg-emerald-600";
        }

        list.push({
          title,
          description: desc,
          user: sh.changedBy?.name || "Staff",
          role: sh.changedBy?.role || "SYSTEM",
          time: sh.changedAt ? new Date(sh.changedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          color,
        });
      });
    }

    if (order.billRequestedAt) {
      list.push({
        title: "Bill requested",
        description: "Waiter submitted bill request to cashier",
        user: order.billRequestedBy?.name || "Waiter",
        role: "WAITER",
        time: new Date(order.billRequestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        color: "bg-amber-500",
      });
    }

    if (order.billProcessedAt) {
      list.push({
        title: "Bill processing",
        description: "Cashier accepted bill request for billing",
        user: order.billProcessedBy?.name || "Cashier",
        role: "CASHIER",
        time: new Date(order.billProcessedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        color: "bg-blue-600",
      });
    }

    if (order.paymentStatus === "PAID") {
      list.push({
        title: "Payment received",
        description: `Full payment of ₹${order.grandTotal} settled`,
        user: "Cashier / System",
        role: "CASHIER",
        time: "Completed",
        color: "bg-emerald-500",
      });
    }

    return list;
  }, [order]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3">
        <Clock className="w-10 h-10 animate-spin mx-auto text-orange-400" />
        <p className="text-sm font-medium text-slate-600">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3">
        <FileText className="w-10 h-10 mx-auto text-slate-300" />
        <p className="text-sm font-medium text-slate-600">Order not found.</p>
        <button
          onClick={() => navigate("/orders")}
          className="text-xs font-semibold text-orange-500 hover:underline"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  // Role permissions
  const isWaiter = user?.role === "WAITER";
  const isKitchen = user?.role === "KITCHEN";
  const isCashier = user?.role === "CASHIER";
  const isManager = user?.role === "MANAGER";
  const isOwner = user?.role === "OWNER";

  const canManageKitchen = ["OWNER", "MANAGER", "KITCHEN"].includes(user?.role);
  const canProcessBill = ["OWNER", "MANAGER", "CASHIER"].includes(user?.role);
  const canOverrideTable = ["OWNER", "MANAGER"].includes(user?.role);
  const canServeOrder = ["OWNER", "MANAGER", "WAITER"].includes(user?.role);

  const effectiveBillStatus = order.billStatus || "NOT_REQUESTED";
  const isBillRequested = effectiveBillStatus === "REQUESTED";
  const isBillProcessing = effectiveBillStatus === "PROCESSING";
  const isBillGenerated = effectiveBillStatus === "GENERATED";
  const isBillPaid = effectiveBillStatus === "PAID" || order.paymentStatus === "PAID";
  const isPaid = order.paymentStatus === "PAID";

  const hasSentKOT = ["CONFIRMED", "PREPARING", "READY", "SERVED", "COMPLETED"].includes(order.orderStatus);

  // KOT Stepper calculations based on actual backend status
  const isStep1Done = true; // Created
  const isStep2Done = ["CONFIRMED", "PREPARING", "READY", "SERVED", "COMPLETED"].includes(order.orderStatus); // KOT Sent
  const isStep3Done = ["PREPARING", "READY", "SERVED", "COMPLETED"].includes(order.orderStatus); // Accepted
  const isStep4Done = ["READY", "SERVED", "COMPLETED"].includes(order.orderStatus); // Preparing -> Ready
  const isStep5Done = ["SERVED", "COMPLETED"].includes(order.orderStatus); // Ready -> Served
  const isStep6Done = order.orderStatus === "COMPLETED"; // Completed

  // Current active step calculation
  let currentStepIndex = 1;
  if (order.orderStatus === "OPEN" || order.orderStatus === "DRAFT") currentStepIndex = 1;
  else if (order.orderStatus === "CONFIRMED") currentStepIndex = 2;
  else if (order.orderStatus === "PREPARING") currentStepIndex = 4;
  else if (order.orderStatus === "READY") currentStepIndex = 5;
  else if (order.orderStatus === "SERVED") currentStepIndex = 6;
  else if (order.orderStatus === "COMPLETED") currentStepIndex = 6;

  // Handlers
  const handleSendKOT = async () => {
    setActionLoading(true);
    try {
      await sendKOT(order._id);
      toast.success("KOT sent to kitchen successfully");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send KOT");
    } finally {
      setActionLoading(false);
    }
  };

  const handleKitchenAdvance = async (nextStatus) => {
    setActionLoading(true);
    try {
      await updateOrderStatus(order._id, nextStatus);
      toast.success(`Kitchen status updated to ${nextStatus}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update kitchen status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkServedConfirm = async () => {
    setActionLoading(true);
    try {
      await updateOrderStatus(order._id, "SERVED");
      toast.success("Order marked as SERVED successfully!");
      setShowServeModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark order as served");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt("Reason for order cancellation:");
    if (!reason) return;
    setActionLoading(true);
    try {
      await cancelOrder(order._id, reason);
      toast.info("Order cancelled");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestBillConfirm = async () => {
    setActionLoading(true);
    try {
      await requestBill(order._id);
      toast.success(`Bill requested for Table ${order.table?.number || ""}`);
      setShowConfirmBillModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request bill");
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessBill = async () => {
    setActionLoading(true);
    try {
      await processBill(order._id);
      toast.info("Bill processing started by cashier");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process bill");
    } finally {
      setActionLoading(false);
    }
  };

  const handleNormalClearTable = async () => {
    if (!isPaid || order.orderStatus !== "COMPLETED") {
      return toast.error("Table can only be cleared after payment and order completion.");
    }
    setActionLoading(true);
    try {
      await clearTable(order._id);
      toast.success("Table cleared and set to AVAILABLE");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear table");
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceClearTable = async () => {
    setActionLoading(true);
    try {
      await clearTable(order._id);
      toast.warning("Table force-cleared by manager override.");
      setShowForceClearModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to force clear table");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      return toast.error("Please enter a valid payment amount");
    }
    setActionLoading(true);
    try {
      await recordPayment({
        orderId: order._id,
        amount: Number(payAmount),
        method: payMethod,
      });
      toast.success("Payment recorded successfully!");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInvoice = async () => {
    try {
      const res = await generateInvoice(order._id);
      setInvoice(res.data);
      toast.success("Invoice generated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invoice generation failed");
    }
  };

  const orderTypeIcon =
    order.orderType === "TAKEAWAY" ? (
      <ShoppingBag className="w-4 h-4 text-rose-500" />
    ) : order.orderType === "DELIVERY" ? (
      <Truck className="w-4 h-4 text-emerald-500" />
    ) : (
      <Utensils className="w-4 h-4 text-orange-500" />
    );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orders</span>
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Details</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  ORDER_STATUS_BADGES[order.orderStatus] || "bg-slate-100 text-slate-700"
                }`}
              >
                {order.orderStatus}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  PAYMENT_STATUS_BADGES[order.paymentStatus] || "bg-slate-100 text-slate-700"
                }`}
              >
                {order.paymentStatus}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  BILL_STATUS_BADGES[effectiveBillStatus]
                }`}
              >
                BILL: {effectiveBillStatus.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Professional POS workflow manager • Real-time backend status synchronization
            </p>
          </div>

          {/* Top Right Order Info Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs flex items-center gap-4">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Order Number</p>
              <p className="font-bold text-slate-900 text-sm">{order.orderNumber}</p>
              <p className="text-[10px] text-slate-500 font-medium">
                {order.orderType} {order.table ? `• Table ${order.table.number}` : ""}
              </p>
            </div>
            <div className="border-l border-slate-200 pl-4 space-y-0.5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Customer</p>
              <p className="font-semibold text-slate-800">{order.customer?.name || "Walk-in Customer"}</p>
              <p className="text-[10px] text-slate-500">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Order Info, Items Table & Activity) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Order Information</h3>
            </div>

            {/* 4 Grid Items */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
                  {orderTypeIcon}
                  <span>Order Type</span>
                </div>
                <p className="text-xs font-bold text-slate-900">{order.orderType}</p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
                  <Grid className="w-4 h-4 text-blue-500" />
                  <span>Table Number</span>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {order.table ? `Table ${order.table.number}` : "N/A"}
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Guests</span>
                </div>
                <p className="text-xs font-bold text-slate-900">{order.guests || 2}</p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
                  <User className="w-4 h-4 text-emerald-500" />
                  <span>Customer</span>
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {order.customer?.name || "Walk-in Customer"}
                </p>
              </div>
            </div>

            {/* Bottom Row: Time & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Order Time</span>
                  <span className="font-semibold text-slate-800">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Order Notes</span>
                  <span className="font-semibold text-slate-800">{order.notes || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Order Items</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                    <th className="py-2.5 px-3 w-8">#</th>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3">Unit Price</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3 text-right">KOT Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {order.items.map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              item.menuItem?.image ||
                              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80"
                            }
                            alt={item.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <span className="font-bold text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="py-3 px-3 text-slate-600">₹{item.price}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">₹{item.price * item.quantity}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                          {item.kotStatus || "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Box */}
            <div className="pt-3 border-t border-slate-100 max-w-xs ml-auto space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Discount</span>
                <span className="font-semibold text-slate-800">-₹{order.discount || 0}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (5%)</span>
                <span className="font-semibold text-slate-800">₹{order.taxAmount}</span>
              </div>
              <div className="flex justify-between items-center bg-orange-50/80 border border-orange-100 rounded-xl p-3 text-orange-950 font-bold text-sm">
                <span>Grand Total</span>
                <span className="text-base text-orange-600">₹{order.grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Order Activity Timeline */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Order Activity Timeline</h3>
            </div>

            <div className="space-y-4 text-xs relative pl-6 border-l-2 border-slate-100 ml-2">
              {activityList.map((act, index) => (
                <div key={index} className="relative space-y-0.5">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${act.color} border-2 border-white absolute -left-[32px] top-0.5 shadow-xs`}
                  />
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">{act.title}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{act.description}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    By <span className="font-semibold text-slate-700">{act.user}</span> ({act.role})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Kitchen Workflow, Table Status, Bill Status, Payment) */}
        <div className="space-y-6">
          {/* Kitchen Workflow Card (Visual Stepper & Action Controls) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <ChefHat className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Kitchen Workflow</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60">
                KOT: {order.orderStatus}
              </span>
            </div>

            {/* Visual Timeline Stepper (6 Steps) */}
            <div className="grid grid-cols-6 gap-1 text-[9px] font-semibold text-slate-400 pt-1 text-center">
              {/* Step 1: Created */}
              <div className="space-y-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto border ${
                    isStep1Done ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-700 block truncate">Created</span>
              </div>

              {/* Step 2: KOT Sent */}
              <div className="space-y-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto border ${
                    isStep2Done
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : order.orderStatus === "CONFIRMED"
                      ? "bg-orange-500 text-white border-orange-500 animate-pulse"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}
                >
                  {isStep2Done ? <Check className="w-3.5 h-3.5" /> : <span>2</span>}
                </div>
                <span className={order.orderStatus === "CONFIRMED" ? "text-orange-600 font-bold block" : "block"}>
                  Sent
                </span>
              </div>

              {/* Step 3: Accepted */}
              <div className="space-y-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto border ${
                    isStep3Done
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}
                >
                  {isStep3Done ? <Check className="w-3.5 h-3.5" /> : <span>3</span>}
                </div>
                <span className="block truncate">Accepted</span>
              </div>

              {/* Step 4: Preparing */}
              <div className="space-y-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto border ${
                    isStep4Done
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : order.orderStatus === "PREPARING"
                      ? "bg-amber-500 text-white border-amber-500 animate-pulse"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}
                >
                  {isStep4Done ? <Check className="w-3.5 h-3.5" /> : <span>4</span>}
                </div>
                <span className={order.orderStatus === "PREPARING" ? "text-amber-600 font-bold block" : "block"}>
                  Preparing
                </span>
              </div>

              {/* Step 5: Ready */}
              <div className="space-y-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto border ${
                    isStep5Done
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : order.orderStatus === "READY"
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm animate-bounce"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}
                >
                  {isStep5Done || order.orderStatus === "READY" ? <Check className="w-3.5 h-3.5" /> : <span>5</span>}
                </div>
                <span className={order.orderStatus === "READY" ? "text-emerald-600 font-bold block" : "block"}>
                  Ready
                </span>
              </div>

              {/* Step 6: Served */}
              <div className="space-y-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto border ${
                    isStep6Done || order.orderStatus === "SERVED"
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}
                >
                  {isStep6Done || order.orderStatus === "SERVED" ? <Check className="w-3.5 h-3.5" /> : <span>6</span>}
                </div>
                <span className={order.orderStatus === "SERVED" ? "text-teal-700 font-bold block" : "block"}>
                  Served
                </span>
              </div>
            </div>

            {/* Status Announcement Box */}
            <div className="space-y-2 pt-2 text-xs">
              {order.orderStatus === "READY" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>🟢 Food is Ready! Serve to customer.</span>
                  </p>
                  <p className="text-[11px] text-emerald-700">All items prepared by kitchen. Waiter must mark as served.</p>
                </div>
              )}

              {/* ACTION 1: Send KOT to Kitchen (Only if not sent yet) */}
              {!hasSentKOT && (
                <button
                  onClick={handleSendKOT}
                  disabled={actionLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Send KOT to Kitchen</span>
                </button>
              )}

              {/* ACTION 2: Waiter Action -> [ Mark as Served ] (Only shown when KOT = READY) */}
              {order.orderStatus === "READY" && canServeOrder && (
                <button
                  onClick={() => setShowServeModal(true)}
                  disabled={actionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all animate-pulse"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Mark as Served</span>
                </button>
              )}

              {/* KITCHEN STAFF ACTIONS: Based on state */}
              {canManageKitchen && !isWaiter && (
                <>
                  {order.orderStatus === "CONFIRMED" && (
                    <button
                      onClick={() => handleKitchenAdvance("PREPARING")}
                      disabled={actionLoading}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {order.orderStatus === "PREPARING" && (
                    <button
                      onClick={() => handleKitchenAdvance("READY")}
                      disabled={actionLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Ready</span>
                    </button>
                  )}
                </>
              )}

              {/* Cancel Order Button */}
              {(!isWaiter || !hasSentKOT) && !["COMPLETED", "CANCELLED", "REFUNDED"].includes(order.orderStatus) && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Status Card (Requirement 13 & 14 & 15) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Grid className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Table Status</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  order.orderStatus === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                {order.orderStatus === "COMPLETED" ? "🟢 AVAILABLE" : "🟠 OCCUPIED"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Assigned Table</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {order.table ? `Table ${order.table.number}` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Guests Count</span>
                  <span className="font-semibold text-slate-800">{order.guests || 2} Guests</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Active Order</span>
                  <span className="font-mono text-orange-600 font-bold">#{order.orderNumber}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                The table remains <span className="font-semibold text-slate-800">OCCUPIED</span> while order is active. It automatically becomes available after full payment and order completion.
              </p>

              {/* Table Clear Button (Only after PAID & COMPLETED) */}
              {isPaid && order.orderStatus === "COMPLETED" && order.table && (
                <button
                  onClick={handleNormalClearTable}
                  disabled={actionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear & Free Table</span>
                </button>
              )}

              {/* Owner / Manager Override Section (Requirement 15) */}
              {canOverrideTable && !isPaid && order.table && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    className="w-full text-slate-500 hover:text-slate-700 font-semibold text-[11px] py-1 flex items-center justify-between transition-colors"
                  >
                    <span>More Actions (Manager Overrides)</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreActions ? "rotate-180" : ""}`} />
                  </button>

                  {showMoreActions && (
                    <div className="pt-2">
                      <button
                        onClick={() => setShowForceClearModal(true)}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Force Clear Table</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bill Status Card (Requirement 8 & 9) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Bill Status</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  BILL_STATUS_BADGES[effectiveBillStatus]
                }`}
              >
                {effectiveBillStatus.replace("_", " ")}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {effectiveBillStatus === "NOT_REQUESTED" && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Bill has not been requested yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Waiter can request the bill after food is served to customer.
                  </p>
                </div>
              )}

              {isBillRequested && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-2 text-amber-800 font-bold">
                    <BellRing className="w-4 h-4 text-amber-600 animate-bounce" />
                    <span>🟠 BILL REQUESTED</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    Requested by <span className="font-semibold">{order.billRequestedBy?.name || "Waiter"}</span>. Waiting for Cashier / Manager.
                  </p>
                </div>
              )}

              {isBillProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-2 text-blue-800 font-bold">
                    <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                    <span>BILL PROCESSING</span>
                  </div>
                  <p className="text-[11px] text-blue-700">Bill is being verified and processed by Cashier.</p>
                </div>
              )}

              {isBillGenerated && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-2 text-purple-800 font-bold">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    <span>BILL GENERATED</span>
                  </div>
                  <p className="text-[11px] text-purple-700">Invoice ready for payment collection.</p>
                </div>
              )}

              {isBillPaid && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>PAID & COMPLETED</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">Bill payment recorded successfully.</p>
                </div>
              )}

              {/* Waiter Action: Request Bill Button */}
              {effectiveBillStatus === "NOT_REQUESTED" && !["CANCELLED", "COMPLETED"].includes(order.orderStatus) && (
                <button
                  onClick={() => setShowConfirmBillModal(true)}
                  disabled={actionLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Request Bill</span>
                </button>
              )}

              {/* Cashier/Manager Action: Process Bill */}
              {canProcessBill && isBillRequested && (
                <button
                  onClick={handleProcessBill}
                  disabled={actionLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Process Bill</span>
                </button>
              )}
            </div>
          </div>

          {/* Payment Card (Requirement 10 & 11 & 12) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Payment</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  PAYMENT_STATUS_BADGES[order.paymentStatus] || "bg-slate-100 text-slate-700"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>

            {/* Amount Due Box */}
            <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4 text-center space-y-1">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount Due</p>
              <p className="text-3xl font-black text-slate-900">₹{order.grandTotal}</p>
            </div>

            {/* Payment Controls - Locked before bill request */}
            {effectiveBillStatus === "NOT_REQUESTED" ? (
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center space-y-1 text-slate-500 text-xs">
                <ShieldAlert className="w-4 h-4 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-700">Payment Controls Locked</p>
                <p className="text-[11px]">Payment processing unlocks after waiter requests the bill.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    disabled={isPaid}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Amount Paid</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    disabled={isPaid}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
                  />
                </div>

                {canProcessBill && (
                  <button
                    onClick={handlePay}
                    disabled={isPaid || actionLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isPaid ? "✓ Payment Recorded" : "Record Payment"}</span>
                  </button>
                )}

                {canProcessBill && (
                  <button
                    onClick={handleInvoice}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <FileCheck className="w-4 h-4 text-slate-500" />
                    <span>{invoice ? "Invoice Generated ✓" : "Generate Invoice"}</span>
                  </button>
                )}

                {/* Print Invoice Button - Enabled only when invoice exists */}
                <button
                  onClick={() => setShowPrintModal(true)}
                  disabled={!invoice && !isBillGenerated && !isPaid}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>

                {invoice && (
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-center text-blue-900 font-mono text-[11px]">
                    Invoice #{invoice.invoiceNumber}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Mark as Served */}
      {showServeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Mark as Served</h3>
              <p className="text-xs text-slate-600">
                Mark this order as served to customer at Table {order.table?.number || "N/A"}?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowServeModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkServedConfirm}
                disabled={actionLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {actionLoading ? "Serving..." : "Confirm Served"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Request Bill */}
      {showConfirmBillModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Request Bill</h3>
              <p className="text-xs text-slate-600">
                Request bill for Table {order.table?.number || "N/A"}? (Total: ₹{order.grandTotal})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowConfirmBillModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestBillConfirm}
                disabled={actionLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {actionLoading ? "Requesting..." : "Request Bill"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Manager Override Force Clear Table */}
      {showForceClearModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-rose-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-slate-900">Force Clear Table</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This order is still active or unpaid. Clearing Table {order.table?.number || "N/A"} may leave the order open. Continue?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowForceClearModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleForceClearTable}
                disabled={actionLoading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {actionLoading ? "Clearing..." : "Force Clear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Invoice Modal */}
      <PrintInvoiceModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        order={order}
        invoice={invoice}
        restaurantSettings={restaurantSettings}
      />
    </div>
  );
}

