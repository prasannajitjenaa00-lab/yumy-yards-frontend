import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getKOTs, updateKOTStatus } from "../../services/orderService";
import { getSocket } from "../../socket/socketClient";
import api from "../../services/api";
import {
  ChefHat,
  ClipboardList,
  CheckCircle2,
  Soup,
  UtensilsCrossed,
  Info,
  Clock,
  Maximize2,
  Minimize2,
  X,
  LayoutGrid,
  Radio,
  Monitor,
  User,
  Sparkles,
  Layers,
  Palette,
  Plus,
} from "lucide-react";

const COLUMNS = [
  {
    statusKeys: ["SENT", "PENDING", "NEW"],
    status: "SENT",
    label: "New Orders",
    next: "ACCEPTED",
    headerBg: "bg-gradient-to-r from-orange-50 to-amber-50/50 border-orange-100",
    border: "border-orange-100/80",
    iconBg: "bg-orange-500/20 text-orange-600",
    bubbleBg: "bg-orange-50 text-orange-400 border-orange-100/60",
    infoBg: "bg-orange-50/80 text-orange-700 border-orange-100/80",
    buttonBg: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20",
    icon: ClipboardList,
    emptyTitle: "No new orders",
    emptySubtitle: "New orders will appear here as soon as they are placed.",
    infoNote: "Fresh orders from POS will appear here",
    actionText: "Accept Order →",
    darkAccent: "from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-400",
  },
  {
    statusKeys: ["ACCEPTED"],
    status: "ACCEPTED",
    label: "Accepted",
    next: "PREPARING",
    headerBg: "bg-gradient-to-r from-blue-50 to-sky-50/50 border-blue-100",
    border: "border-blue-100/80",
    iconBg: "bg-blue-500/20 text-blue-600",
    bubbleBg: "bg-blue-50 text-blue-400 border-blue-100/60",
    infoBg: "bg-blue-50/80 text-blue-700 border-blue-100/80",
    buttonBg: "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20",
    icon: ChefHat,
    emptyTitle: "No accepted orders",
    emptySubtitle: "Orders accepted by kitchen will appear here.",
    infoNote: "Orders moved from New will appear here",
    actionText: "Start Preparing →",
    darkAccent: "from-blue-500/20 to-sky-500/10 border-blue-500/30 text-blue-400",
  },
  {
    statusKeys: ["PREPARING"],
    status: "PREPARING",
    label: "Preparing",
    next: "READY",
    headerBg: "bg-gradient-to-r from-purple-50 to-indigo-50/50 border-purple-100",
    border: "border-purple-100/80",
    iconBg: "bg-purple-500/20 text-purple-600",
    bubbleBg: "bg-purple-50 text-purple-400 border-purple-100/60",
    infoBg: "bg-purple-50/80 text-purple-700 border-purple-100/80",
    buttonBg: "bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20",
    icon: Soup,
    emptyTitle: "No orders preparing",
    emptySubtitle: "Orders being prepared will appear here.",
    infoNote: "Orders in preparation will appear here",
    actionText: "Mark Ready ✓",
    darkAccent: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
  },
  {
    statusKeys: ["READY"],
    status: "READY",
    label: "Ready",
    next: "SERVED",
    headerBg: "bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-100",
    border: "border-emerald-100/80",
    iconBg: "bg-emerald-500/20 text-emerald-600",
    bubbleBg: "bg-emerald-50 text-emerald-400 border-emerald-100/60",
    infoBg: "bg-emerald-50/80 text-emerald-700 border-emerald-100/80",
    buttonBg: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20",
    icon: UtensilsCrossed,
    emptyTitle: "No orders ready",
    emptySubtitle: "Completed orders will appear here.",
    infoNote: "Orders ready for serving • Max 2 in view",
    actionText: "Serve Order ✓",
    darkAccent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
  },
];

/**
 * Helper to reduce long order numbers to short digits (e.g. #ORD-20261013-0023 -> #0023)
 */
function formatShortOrderNumber(orderNumber, fallback) {
  if (!orderNumber) return fallback || "";
  const str = String(orderNumber).trim().replace(/^#/, "");
  if (str.includes("-")) {
    const parts = str.split("-");
    const last = parts[parts.length - 1];
    if (last) return `#${last}`;
  }
  if (str.length > 4) {
    return `#${str.slice(-4)}`;
  }
  return `#${str}`;
}

export const ORDER_COLOR_PRESETS = [
  { name: "Orange", hex: "#f97316" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Red", hex: "#ef4444" },
  { name: "Lime", hex: "#84cc16" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "White", hex: "#f8fafc" },
];

export function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== "string") return `rgba(249, 115, 22, ${alpha})`;
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  if (c.length !== 6) return `rgba(249, 115, 22, ${alpha})`;
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(249, 115, 22, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ========================================================================= */
/* RECTANGLE VIEW SUB-COMPONENTS FOR READY SECTION (MAX 2 ON DISPLAY) */
/* ========================================================================= */

/**
 * Clean, modern Rectangle Card for an active Ready order.
 */
function ReadyRectangleCard({ kot, slotNumber, advancingId, onServe, orderIdColor }) {
  const kotNum = kot.kotNumber || `#${kot._id?.slice(-4)}`;
  const counterOrderId = kot.order?.orderNumber
    ? (kot.order.orderNumber.startsWith("#") ? kot.order.orderNumber : `#${kot.order.orderNumber}`)
    : kotNum;
  const counterName = kot.counter || kot.order?.counter || "Counter 1";
  const orderTypeText =
    kot.orderType === "TAKEAWAY"
      ? "TAKEAWAY"
      : kot.orderType === "DELIVERY"
        ? "DELIVERY"
        : "COUNTER / DINE-IN";
  const cashierName = kot.createdBy?.name || kot.order?.createdBy?.name || "Cashier Counter";
  const customerName = kot.order?.customer?.name;
  const formattedTime = kot.createdAt
    ? new Date(kot.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="relative bg-white border-2 border-emerald-500/90 rounded-2xl p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-2.5 group">
      {/* Top Slot & Counter Header Strip */}
      <div className="flex items-center justify-between border-b border-emerald-100/90 pb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Ready Slot {slotNumber}
        </span>

        <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] text-white shadow-2xs shrink-0 uppercase tracking-wide whitespace-nowrap ${
          counterName === "Counter 2" ? "bg-purple-600 border border-purple-500" : "bg-sky-600 border border-sky-500"
        }`}>
          {counterName}
        </span>
      </div>

      {/* Prominent Order Number Display Box (Dynamic ID Color + Clean Centered Status Badges) */}
      <div
        title="Exact Order Number from Counter"
        style={{
          borderColor: hexToRgba(orderIdColor || "#f97316", 0.45),
          backgroundColor: hexToRgba(orderIdColor || "#f97316", 0.08),
        }}
        className="w-full py-2.5 px-3 rounded-xl border-2 flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs"
      >
        <span
          style={{ color: orderIdColor || "#f97316" }}
          className="font-mono font-black text-2xl sm:text-3xl tracking-tight leading-none select-all"
        >
          {counterOrderId}
        </span>

        {/* Clean Badges for Payment & Dine-In / Takeaway (Centered, No Clipping) */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {kot.order?.paymentStatus === "PAID" && (
            <span className="font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[10px] tracking-wide whitespace-nowrap">
              ✓ PAID
            </span>
          )}
          <span className="font-extrabold text-slate-700 bg-white/95 border border-slate-300 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap shadow-2xs">
            {orderTypeText}
          </span>
        </div>
      </div>

      {/* Cashier & Time Row */}
      <div className="flex items-center justify-between gap-1 text-[11px] bg-emerald-50/70 border border-emerald-100 rounded-xl px-2.5 py-1.5">
        <span className="flex items-center gap-1 font-semibold text-slate-700 min-w-0" title={`Cashier: ${cashierName}`}>
          <User size={12} className="text-emerald-600 shrink-0" />
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Cashier:</span>
          <span className="text-slate-900 font-extrabold truncate">{cashierName}</span>
        </span>
        {formattedTime && (
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
            <Clock size={11} className="text-slate-400" />
            {formattedTime}
          </span>
        )}
      </div>

      {/* Customer Name (if available) */}
      {customerName && (
        <div className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1 truncate" title={`Guest: ${customerName}`}>
          👤 <span className="font-bold text-slate-700">Guest:</span> {customerName}
        </div>
      )}

      {/* Order Notes (if any) */}
      {kot.order?.notes && (
        <div className="text-[10px] text-amber-800 font-medium bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
          📌 {kot.order.notes}
        </div>
      )}

      {/* Rectangular Items Compartment */}
      <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5">
        <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1.5">
          Items ({kot.items?.length || 0})
        </div>
        <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
          {kot.items?.map((item, idx) => (
            <li key={idx} className="flex items-start justify-between gap-2">
              <span className="flex items-start gap-1.5">
                <span className="font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px] shrink-0">
                  {item.quantity}x
                </span>
                <span className="font-bold text-slate-800 leading-tight">
                  {item.name}
                </span>
              </span>
              {item.notes && (
                <span className="text-[9px] text-slate-500 italic bg-white px-1 rounded border border-slate-200 shrink-0">
                  {item.notes}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Big Rectangular Serve Button */}
      <button
        type="button"
        disabled={advancingId === kot._id}
        onClick={() => onServe(kot)}
        className="w-full py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        {advancingId === kot._id ? (
          <>
            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
            <span>Serving...</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={16} />
            <span>Serve Order ✓</span>
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Placeholder for Slot 2 when only 1 order is ready.
 */
function EmptyReadySlot({ slotNumber }) {
  return (
    <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center min-h-[140px] space-y-1.5">
      <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
        <UtensilsCrossed size={16} />
      </div>
      <div>
        <div className="text-xs font-black uppercase tracking-wider text-emerald-800">
          Ready Slot {slotNumber} Available
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5 max-w-[200px]">
          Next order marked ready from 'Preparing' will appear here
        </p>
      </div>
    </div>
  );
}

/**
 * Strip showing queued ready orders waiting in line beyond the active 2.
 */
function ReadyQueueStrip({ queuedKots, onServe, advancingId }) {
  if (!queuedKots.length) return null;
  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-3 space-y-2 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
          <Clock size={13} className="text-emerald-600" />
          <span>Ready Queue ({queuedKots.length} more waiting)</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
          Max 2 on Display
        </span>
      </div>
      <p className="text-[10px] text-slate-600 leading-tight">
        Serve an active order above to immediately show the next ready order in line.
      </p>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {queuedKots.map((kot, idx) => {
          const num = formatShortOrderNumber(kot.order?.orderNumber, kot.kotNumber || `#${kot._id?.slice(-4)}`);
          return (
            <div
              key={kot._id}
              className="flex items-center gap-1.5 bg-white border border-emerald-300/80 text-emerald-900 px-2 py-1 rounded-lg text-xs font-bold shadow-2xs"
            >
              <span className="text-[10px] text-emerald-600 font-mono">#{idx + 3}</span>
              <span className="font-black text-slate-900">{num}</span>
              <span className="text-[10px] text-slate-400">({kot.items?.length || 0} items)</span>
              <button
                type="button"
                disabled={advancingId === kot._id}
                onClick={() => onServe(kot)}
                className="ml-1 text-[10px] font-extrabold text-emerald-700 hover:text-emerald-950 hover:underline cursor-pointer"
                title="Serve directly"
              >
                Serve
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Fullscreen / Total Screen View for Ready Section
 * ONLY 2 orders shown 1 by 1 (up and down vertical stack), covering the entire screen, nothing else.
 */
function ReadyFullscreenRowCard({
  kot,
  slotNumber,
  advancingId,
  onServe,
  orderIdColor = "#f97316",
  onSetOrderIdColor,
}) {
  const kotNum = kot.kotNumber || `#${kot._id?.slice(-4)}`;
  // The exact order ID generated when customer placed order at counter
  const counterOrderId = kot.order?.orderNumber
    ? (kot.order.orderNumber.startsWith("#") ? kot.order.orderNumber : `#${kot.order.orderNumber}`)
    : kotNum;
  const counterName = kot.counter || kot.order?.counter || "Counter 1";
  const orderTypeText =
    kot.orderType === "TAKEAWAY"
      ? "TAKEAWAY"
      : kot.orderType === "DELIVERY"
        ? "DELIVERY"
        : "DINE-IN";
  const cashierName = kot.createdBy?.name || kot.order?.createdBy?.name || "Cashier Counter";
  const customerName = kot.order?.customer?.name;
  const isPaid = kot.order?.paymentStatus === "PAID";
  const isServing = advancingId === kot._id;

  return (
    <div className="flex-1 min-h-0 w-full bg-slate-900 border-2 border-emerald-500 rounded-2xl lg:rounded-3xl p-3.5 sm:p-4 lg:p-5 shadow-2xl flex flex-col justify-between overflow-hidden">
      {/* Top Header Row: Slot Badge + Status + Cashier */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2.5 flex-wrap shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            Ready Slot {slotNumber}
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-black px-2.5 py-1 rounded-xl text-xs sm:text-sm uppercase tracking-wide text-white shadow-2xs ${
              counterName === "Counter 2" ? "bg-purple-600 border border-purple-400/30" : "bg-sky-600 border border-sky-400/30"
            }`}>
              {counterName}
            </span>
            {isPaid && (
              <span className="font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-xl text-xs sm:text-sm">
                ✓ PAID
              </span>
            )}
            <span className="font-extrabold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded-xl text-xs sm:text-sm uppercase">
              {orderTypeText}
            </span>
          </div>
        </div>

        {/* Cashier & Guest Details */}
        <div className="flex items-center gap-3 text-xs sm:text-sm bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-slate-300">
          <span className="flex items-center gap-1.5 font-bold truncate">
            <User size={14} className="text-amber-400 shrink-0" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Cashier:</span>
            <span className="text-amber-300 font-black truncate">{cashierName}</span>
          </span>
          {customerName && (
            <span className="text-slate-300 font-medium truncate">
              👤 {customerName}
            </span>
          )}
        </div>
      </div>

      {/* Middle Content: Compact Items List (Left) + Super-Wide Blinking Order ID Box (Right, expanded to the left) */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row items-stretch gap-3 lg:gap-4 my-2.5">
        {/* Left Side: Items List (compact width so the order box expands to the left) */}
        <div className="w-full md:w-60 lg:w-64 xl:w-72 shrink-0 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex flex-col justify-between overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 flex items-center justify-between">
              <span>Items ({kot.items?.length || 0})</span>
              {kot.order?.notes && (
                <span className="text-amber-300 font-normal italic text-xs">
                  📌 {kot.order.notes}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {kot.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/70 rounded-xl px-3.5 py-2 text-slate-100 font-bold text-xs sm:text-sm shadow-xs"
                >
                  <span className="font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded text-xs shrink-0">
                    {item.quantity}x
                  </span>
                  <span>{item.name}</span>
                  {item.notes && (
                    <span className="text-[10px] text-amber-300 italic">
                      ({item.notes})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: WIDENED GIGANTIC ORDER ID (DYNAMIC USER-CONFIGURED COLOR) */}
        <div
          title="Exact Order Number from Counter"
          style={{
            borderColor: orderIdColor,
            background: `linear-gradient(135deg, ${hexToRgba(orderIdColor, 0.25)} 0%, ${hexToRgba(orderIdColor, 0.08)} 50%, #0f172a 100%)`,
            boxShadow: `0 25px 50px -12px ${hexToRgba(orderIdColor, 0.35)}`,
          }}
          className="flex-1 min-h-0 w-full h-full flex items-center justify-center text-center border-2 sm:border-4 rounded-2xl sm:rounded-3xl p-1 sm:p-2 overflow-hidden"
        >
          <span
            style={{
              color: orderIdColor,
              filter: `drop-shadow(0 6px 40px ${hexToRgba(orderIdColor, 0.85)})`,
            }}
            className="font-mono font-black text-[clamp(4rem,13vw,13rem)] tracking-tighter leading-none select-none whitespace-nowrap w-full text-center"
          >
            {counterOrderId}
          </span>
        </div>
      </div>

      {/* Bottom: Full-Width Prominent Serve Button */}
      <button
        type="button"
        disabled={isServing}
        onClick={() => onServe(kot)}
        className="w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
      >
        {isServing ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            <span>Serving Order...</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            <span>Serve Order ✓</span>
          </>
        )}
      </button>
    </div>
  );
}

function FullscreenReadyView({
  matchingKots,
  advancingId,
  onServe,
  onClose,
  orderIdColor,
  onSetOrderIdColor,
  selectedCounterMode = "All",
}) {
  const visibleReadyKots = matchingKots.slice(0, 2);

  if (!matchingKots.length) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 max-w-xl mx-auto my-auto">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
          <UtensilsCrossed size={36} />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">
            {selectedCounterMode !== "All" ? `No ${selectedCounterMode} orders ready` : "No orders ready"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {selectedCounterMode !== "All"
              ? `Orders placed at ${selectedCounterMode} will appear here when ready.`
              : "Orders marked ready from 'Preparing' will appear here."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          ← Back to All Sections
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex-1 flex flex-col gap-3 lg:gap-4 p-2 sm:p-3 overflow-hidden">
      {/* 2 ORDERS SHOWN 1 BY 1 UP AND DOWN (VERTICAL STACK), COVERING ENTIRE SCREEN, NOTHING ELSE */}

      {/* Slot 1: Top Order */}
      {visibleReadyKots[0] && (
        <ReadyFullscreenRowCard
          kot={visibleReadyKots[0]}
          slotNumber={1}
          advancingId={advancingId}
          onServe={onServe}
          orderIdColor={orderIdColor}
          onSetOrderIdColor={onSetOrderIdColor}
        />
      )}

      {/* Slot 2: Bottom Order (or Available Slot if only 1 order ready) */}
      {visibleReadyKots[1] ? (
        <ReadyFullscreenRowCard
          kot={visibleReadyKots[1]}
          slotNumber={2}
          advancingId={advancingId}
          onServe={onServe}
          orderIdColor={orderIdColor}
          onSetOrderIdColor={onSetOrderIdColor}
        />
      ) : (
        <div className="flex-1 min-h-0 w-full border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-2xl lg:rounded-3xl p-4 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-300">
              {selectedCounterMode !== "All" ? `${selectedCounterMode} Slot 2 Available` : "Ready Slot 2 Available"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-0.5">
              {selectedCounterMode !== "All"
                ? `Next order marked ready from '${selectedCounterMode}' will automatically display here.`
                : "Next order marked ready from 'Preparing' will automatically display in this slot."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/* MAIN KITCHEN DISPLAY COMPONENT */
/* ========================================================================= */

export default function KitchenDisplay() {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maximizedColumn, setMaximizedColumn] = useState(null);
  const [liveClock, setLiveClock] = useState("");
  const [isBrowserFs, setIsBrowserFs] = useState(false);
  const [advancingId, setAdvancingId] = useState(null);

  const { user } = useSelector((s) => s.auth || {});
  const isOwnerOrManager = user?.role === "OWNER" || user?.role === "MANAGER";

  // Dynamic Counters from Settings
  const [counters, setCounters] = useState(() => {
    try {
      const cached = localStorage.getItem("app_dynamic_counters");
      return cached ? JSON.parse(cached) : ["Counter 1", "Counter 2"];
    } catch {
      return ["Counter 1", "Counter 2"];
    }
  });
  const [showAddCounterModal, setShowAddCounterModal] = useState(false);
  const [newCounterName, setNewCounterName] = useState("");

  const loadCounters = async () => {
    try {
      const res = await api.get("/settings");
      if (res.data?.data?.counters && res.data.data.counters.length) {
        setCounters(res.data.data.counters);
        localStorage.setItem("app_dynamic_counters", JSON.stringify(res.data.data.counters));
      }
    } catch (e) {
      console.warn("Could not load counters in KDS:", e);
    }
  };

  useEffect(() => {
    loadCounters();
  }, []);

  const handleAddNewCounter = async (e) => {
    e?.preventDefault();
    const trimmed = newCounterName.trim();
    if (!trimmed) return;
    if (counters.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning(`Counter "${trimmed}" already exists.`);
      return;
    }
    const updated = [...counters, trimmed];
    setCounters(updated);
    handleSelectCounterMode(trimmed);
    setNewCounterName("");
    setShowAddCounterModal(false);
    try {
      localStorage.setItem("app_dynamic_counters", JSON.stringify(updated));
      const res = await api.get("/settings");
      const currentSettings = res.data?.data || {};
      await api.put("/settings", { ...currentSettings, counters: updated });
      toast.success(`Counter "${trimmed}" created and selected!`);
    } catch (err) {
      toast.error("Failed to sync counter to server");
    }
  };

  // Screen Counter Setting: "All" or any dynamic counter (saved per computer)
  const [selectedCounterMode, setSelectedCounterMode] = useState(() => {
    try {
      return localStorage.getItem("kds_screen_counter") || "All";
    } catch {
      return "All";
    }
  });

  const handleSelectCounterMode = (mode) => {
    setSelectedCounterMode(mode);
    try {
      localStorage.setItem("kds_screen_counter", mode);
    } catch (e) {
      console.warn("Storage error:", e);
    }
    toast.info(`Screen display mode set to: ${mode === "All" ? "All Counters" : mode}`);
  };

  const [orderIdColor, setOrderIdColor] = useState(() => {
    try {
      return localStorage.getItem("kds_order_id_color") || "#f97316";
    } catch {
      return "#f97316";
    }
  });

  const handleSetOrderIdColor = (color) => {
    setOrderIdColor(color);
    try {
      localStorage.setItem("kds_order_id_color", color);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter KOTs for the current screen based on Counter 1 / Counter 2 / All
  const filteredKots = useMemo(() => {
    if (selectedCounterMode === "All") return kots;
    return kots.filter((kot) => {
      const counter = kot.counter || kot.order?.counter || "Counter 1";
      return counter.toLowerCase() === selectedCounterMode.toLowerCase();
    });
  }, [kots, selectedCounterMode]);

  const load = () => {
    getKOTs()
      .then((r) => setKots(Array.isArray(r?.data) ? r.data : []))
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    if (socket) {
      socket.on("kot:new", () => {
        toast.info("New KOT received");
        load();
      });
      socket.on("kot:status", load);
    }
    const interval = setInterval(load, 8000);
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off("kot:new");
        socket.off("kot:status");
      }
    };
  }, []);

  // Live Digital Clock for KDS
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClock(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut: ESC to exit Total Screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && maximizedColumn) {
        setMaximizedColumn(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [maximizedColumn]);

  // Fullscreen toggle helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => { });
      setIsBrowserFs(true);
    } else {
      document.exitFullscreen?.().catch(() => { });
      setIsBrowserFs(false);
    }
  };

  // Status transition handler with instant optimistic UI update
  const advance = async (kot, next) => {
    if (advancingId) return;
    setAdvancingId(kot._id);
    const orderIdentifier = kot.order?.orderNumber ? `#${kot.order.orderNumber}` : (kot.kotNumber || "Order");
    try {
      await updateKOTStatus(kot._id, next);
      if (next === "SERVED") {
        toast.success(`${orderIdentifier} served! Next ready order in line.`);
      } else if (next === "READY") {
        toast.success(`${orderIdentifier} marked Ready!`);
      } else {
        toast.success(`KOT moved to ${next}`);
      }

      // Optimistically update local state for seamless, instant transition
      setKots((prev) => {
        if (next === "SERVED") {
          return prev.filter((k) => k._id !== kot._id);
        }
        return prev.map((k) => (k._id === kot._id ? { ...k, status: next } : k));
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      load();
    } finally {
      setAdvancingId(null);
    }
  };

  const activeMaxColumn = COLUMNS.find((c) => c.status === maximizedColumn);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOTAL FULLSCREEN VIEW (COVERS 100% OF THE SCREEN WHEN EXPANDED) */}
      {/* ========================================================================= */}
      {activeMaxColumn && (
        <div className="fixed inset-0 z-[100] bg-[#0b1120] text-slate-100 flex flex-col h-screen w-screen overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Top KDS Control Bar */}
          <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-xl">
            {/* Left: Active Section Branding & Live Order Count */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border ${activeMaxColumn.darkAccent}`}
              >
                <activeMaxColumn.icon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-black text-white tracking-tight">
                    {activeMaxColumn.label.toUpperCase()}
                  </h1>
                  <span className="bg-orange-500 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-md shadow-orange-500/30">
                    {activeMaxColumn.status === "READY"
                      ? `${Math.min(filteredKots.filter((k) => activeMaxColumn.statusKeys.includes(k.status)).length, 2)} of ${filteredKots.filter((k) => activeMaxColumn.statusKeys.includes(k.status)).length} Active`
                      : `${filteredKots.filter((k) => activeMaxColumn.statusKeys.includes(k.status)).length} KOTs`}
                  </span>
                  {selectedCounterMode !== "All" && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black text-white shadow-xs ${
                      selectedCounterMode === "Counter 2" ? "bg-purple-600" : "bg-sky-600"
                    }`}>
                      {selectedCounterMode}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live KDS
                  </span>
                  <span>•</span>
                  <span>Total Screen Focus Mode</span>
                </div>
              </div>
            </div>

            {/* Middle: Quick Section Switcher Bar */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80">
              <button
                type="button"
                onClick={() => setMaximizedColumn(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
              >
                <LayoutGrid size={14} />
                <span>All (4 Col)</span>
              </button>

              {COLUMNS.map((col) => {
                const Icon = col.icon;
                const isSelected = maximizedColumn === col.status;
                const count = filteredKots.filter((k) => col.statusKeys.includes(k.status)).length;
                return (
                  <button
                    key={col.status}
                    type="button"
                    onClick={() => setMaximizedColumn(col.status)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${isSelected
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                      }`}
                  >
                    <Icon size={14} />
                    <span>
                      {col.label} ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Counter Screen Filter, Live Clock & Exit Controls */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
              {/* Screen Counter Filter */}
              <div className="flex items-center bg-slate-800/90 border border-slate-700/80 p-1 rounded-xl shadow-xs gap-1 flex-wrap">
                {["All", ...counters].map((c, idx) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectCounterMode(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                      selectedCounterMode === c
                        ? c === "All"
                          ? "bg-orange-500 text-white shadow-xs"
                          : idx === 1
                            ? "bg-sky-600 text-white shadow-xs"
                            : idx === 2
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {c === "All" ? "All" : c}
                  </button>
                ))}
              </div>

              {/* Live Kitchen Clock */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl text-slate-200 font-mono font-bold text-xs shadow-inner">
                <Clock size={15} className="text-orange-400" />
                <span>{liveClock}</span>
              </div>

              {/* Toggle Native Hardware Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
                title="Toggle Monitor Fullscreen"
              >
                <Monitor size={15} />
                <span>{isBrowserFs ? "Window" : "Full Screen"}</span>
              </button>

              {/* Primary Exit Button */}
              <button
                type="button"
                onClick={() => setMaximizedColumn(null)}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                title="Exit Total Screen (Esc)"
              >
                <Minimize2 size={16} />
                <span>Exit Fullscreen (Esc)</span>
              </button>
            </div>
          </header>

          {/* Fullscreen Body Content */}
          <main
            className={`flex-1 flex flex-col ${activeMaxColumn.status === "READY"
                ? "p-2 sm:p-4 overflow-hidden h-full"
                : "overflow-y-auto p-4 sm:p-6 lg:p-8"
              } scrollbar-thin scrollbar-thumb-slate-700`}
          >
            {(() => {
              const matchingKots = filteredKots.filter((k) => activeMaxColumn.statusKeys.includes(k.status));

              // DEDICATED FULLSCREEN RECTANGLE VIEW FOR READY SECTION (MAX 2 ON DISPLAY)
              if (activeMaxColumn.status === "READY") {
                return (
                  <FullscreenReadyView
                    matchingKots={matchingKots}
                    advancingId={advancingId}
                    onServe={(kot) => advance(kot, "SERVED")}
                    onClose={() => setMaximizedColumn(null)}
                    orderIdColor={orderIdColor}
                    onSetOrderIdColor={handleSetOrderIdColor}
                    selectedCounterMode={selectedCounterMode}
                  />
                );
              }

              // STANDARD FULLSCREEN VIEW FOR OTHER SECTIONS (NEW, ACCEPTED, PREPARING)
              if (!matchingKots.length) {
                return (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 max-w-xl mx-auto my-auto">
                    <div className="w-20 h-20 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shadow-inner">
                      <activeMaxColumn.icon size={36} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">{activeMaxColumn.emptyTitle}</h2>
                      <p className="text-sm text-slate-400 mt-1">{activeMaxColumn.emptySubtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMaximizedColumn(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      ← Back to All Sections
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5">
                  {matchingKots.map((kot) => {
                    const kotNum = kot.kotNumber || `#${kot._id?.slice(-4)}`;
                    const orderNum = kot.order?.orderNumber ? `#${kot.order.orderNumber}` : kotNum;
                    const counterName = kot.counter || kot.order?.counter || "Counter 1";
                    const orderTypeText =
                      kot.orderType === "TAKEAWAY"
                        ? "TAKEAWAY"
                        : kot.orderType === "DELIVERY"
                          ? "DELIVERY"
                          : "COUNTER / DINE-IN";
                    const formattedTime = kot.createdAt
                      ? new Date(kot.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Just now";
                    const cashierName = kot.createdBy?.name || kot.order?.createdBy?.name || "Cashier Counter";
                    const customerName = kot.order?.customer?.name;

                    return (
                      <div
                        key={kot._id}
                        className="bg-slate-900 border-2 border-slate-800 hover:border-orange-500/70 rounded-3xl p-5 flex flex-col justify-between shadow-2xl transition-all group"
                      >
                        <div className="space-y-3.5">
                          {/* Card Header */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-black text-amber-300 text-base bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl shadow-xs">
                                {orderNum}
                              </span>
                              <span className="font-mono font-bold text-slate-400 text-xs bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded-lg shadow-xs">
                                {kotNum}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-black text-xs px-2 py-0.5 rounded-lg text-white shadow-2xs ${
                                counterName === "Counter 2" ? "bg-purple-600" : "bg-sky-600"
                              }`}>
                                {counterName}
                              </span>
                              {kot.order?.paymentStatus === "PAID" && (
                                <span className="font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-lg text-xs tracking-wider">
                                  ✓ PAID
                                </span>
                              )}
                              <span className="font-extrabold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-xl text-xs">
                                {orderTypeText}
                              </span>
                            </div>
                          </div>

                          {/* Cashier & Server Badge */}
                          <div className="flex items-center justify-between gap-2 text-xs bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5">
                            <span className="flex items-center gap-1.5 text-slate-200 font-bold truncate">
                              <User size={13} className="text-amber-400 shrink-0" />
                              <span className="text-[10px] uppercase font-bold text-slate-400">Cashier:</span>
                              <span className="text-amber-300 font-black truncate">{cashierName}</span>
                            </span>
                            {customerName && (
                              <span className="text-[11px] text-slate-300 font-medium truncate max-w-[140px]" title={`Guest: ${customerName}`}>
                                👤 {customerName}
                              </span>
                            )}
                          </div>

                          {/* Order level notes */}
                          {kot.order?.notes && (
                            <div className="text-[11px] text-amber-200 font-semibold bg-amber-950/60 border border-amber-500/30 px-2.5 py-1.5 rounded-xl">
                              📌 Note: {kot.order.notes}
                            </div>
                          )}

                          {/* Time & Server row */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock size={12} className="text-slate-500" />
                              {formattedTime}
                            </span>
                            <span className="text-slate-400">
                              {kot.items?.length || 1} item(s)
                            </span>
                          </div>

                          {/* Items List */}
                          <ul className="space-y-2.5 py-1">
                            {kot.items?.map((i, idx) => (
                              <li key={idx} className="flex items-start justify-between gap-2">
                                <span className="flex items-start gap-2.5">
                                  <span className="font-black text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-lg text-xs shrink-0">
                                    {i.quantity}x
                                  </span>
                                  <span className="text-base text-slate-100 font-bold leading-snug">
                                    {i.name}
                                  </span>
                                </span>
                                {i.notes && (
                                  <span className="text-[10px] text-amber-300 font-semibold italic bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md shrink-0">
                                    {i.notes}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Advance Action Button */}
                        <div className="pt-4 mt-3 border-t border-slate-800">
                          <button
                            type="button"
                            disabled={advancingId === kot._id}
                            onClick={() => advance(kot, activeMaxColumn.next)}
                            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-xl active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 ${activeMaxColumn.buttonBg}`}
                          >
                            {advancingId === kot._id ? "Updating..." : activeMaxColumn.actionText}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REGULAR 4-COLUMN KANBAN BOARD */}
      {/* ========================================================================= */}
      <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4 relative overflow-hidden">
          {/* Row 1: Title & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            {/* Left: Branding & Subtitle */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs">
                <ChefHat size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kitchen Display</h1>
                  {selectedCounterMode !== "All" && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black text-white shadow-2xs ${
                      selectedCounterMode === "Counter 2" ? "bg-purple-600" : "bg-sky-600"
                    }`}>
                      {selectedCounterMode} Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live kitchen orders • Ready orders shown in Rectangle View (max 2 at a time)
                </p>
              </div>
            </div>

            {/* Right: Screen Mode Selector, ID Color & Kitchen Online Badge on Far Right */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-end sm:ml-auto">
              {/* Screen Counter Filter */}
              <div className="bg-slate-100/90 border border-slate-200/90 rounded-2xl p-1.5 flex items-center shadow-2xs gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold text-slate-500 px-2 uppercase tracking-wider shrink-0">Screen:</span>
                {["All", ...counters].map((c, idx) => {
                  const isSelected = (selectedCounterMode || "").trim().toLowerCase() === (c || "").trim().toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleSelectCounterMode(c)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                        isSelected
                          ? c === "All"
                            ? "bg-slate-900 text-white shadow-xs border-slate-950"
                            : idx === 1
                              ? "bg-sky-600 text-white shadow-xs border-sky-700"
                              : idx === 2
                                ? "bg-purple-600 text-white shadow-xs border-purple-700"
                                : "bg-emerald-600 text-white shadow-xs border-emerald-700"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      <span>{c === "All" ? "All Counters" : c}</span>
                    </button>
                  );
                })}

                {/* Owner / Manager Quick + Add Counter Button */}
                {isOwnerOrManager && (
                  <button
                    type="button"
                    onClick={() => setShowAddCounterModal(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-orange-600 bg-orange-50/70 hover:bg-orange-100 border border-dashed border-orange-300 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                    title="Add New Counter Terminal (Owner & Manager only)"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                )}
              </div>

              {/* ID Color Theme Selector */}
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-2xs">
                <Palette size={14} className="text-orange-500 shrink-0" />
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">ID Color:</span>
                <div className="flex items-center gap-1.5">
                  {ORDER_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      title={preset.name}
                      onClick={() => handleSetOrderIdColor(preset.hex)}
                      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full transition-transform hover:scale-125 cursor-pointer ${
                        orderIdColor?.toLowerCase() === preset.hex.toLowerCase()
                          ? "ring-2 ring-slate-800 scale-110 shadow-xs"
                          : "opacity-75 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    />
                  ))}
                  <label
                    title="Pick Any Custom Color"
                    className="relative flex items-center justify-center w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full cursor-pointer overflow-hidden border border-slate-300 hover:scale-110 transition-transform ml-0.5"
                    style={{
                      background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                    }}
                  >
                    <input
                      type="color"
                      value={orderIdColor}
                      onChange={(e) => handleSetOrderIdColor(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Kitchen Online Badge on Far Right */}
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-2.5 shadow-2xs shrink-0">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <div className="text-xs font-extrabold text-slate-800 whitespace-nowrap">Kitchen Online</div>
                  <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Auto refresh enabled</div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Section View Tabs (Spacious, Beautiful & No Scrollbar) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setMaximizedColumn(null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                maximizedColumn === null
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                  : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600"
              }`}
            >
              <LayoutGrid size={15} />
              <span>All Sections (4 Columns)</span>
            </button>

            {COLUMNS.map((col) => {
              const Icon = col.icon;
              const count = filteredKots.filter((k) => col.statusKeys.includes(k.status)).length;
              const isSelected = maximizedColumn === col.status;
              return (
                <button
                  key={col.status}
                  type="button"
                  onClick={() => setMaximizedColumn(col.status)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                  title={`Open ${col.label} in Total Screen`}
                >
                  <Icon size={15} className={isSelected ? "text-orange-400" : "text-slate-400"} />
                  <span>{col.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                    isSelected
                      ? "bg-orange-500 text-white"
                      : count > 0
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-100 text-slate-500"
                  }`}>
                    {count}
                  </span>
                  <Maximize2 size={12} className="opacity-50 ml-0.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* 4-COLUMN KANBAN BOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {COLUMNS.map((col) => {
            const ColumnIcon = col.icon;
            const matchingKots = filteredKots.filter((k) => col.statusKeys.includes(k.status));
            const count = matchingKots.length;

            return (
              <div key={col.status} className="flex flex-col h-full">
                {/* Column Header - Clickable to Cover Total Screen */}
                <div
                  onClick={() => setMaximizedColumn(col.status)}
                  className={`${col.headerBg} p-4 rounded-t-2xl border flex items-center justify-between cursor-pointer group hover:brightness-95 transition-all`}
                  title={`Click to expand ${col.label} to total screen`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full ${col.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      <ColumnIcon size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {col.label} ({count})
                      </h3>
                      {col.status === "READY" && count > 2 && (
                        <span className="text-[10px] font-bold text-emerald-700">
                          (2 shown • {count - 2} in queue)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Maximize Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMaximizedColumn(col.status);
                      }}
                      className="p-1.5 text-slate-500 group-hover:text-orange-600 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
                      title={`Expand ${col.label} to total screen`}
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Column Body Container */}
                <div
                  className={`bg-white border-x border-b ${col.border} rounded-b-2xl p-4 flex flex-col justify-between flex-1 min-h-[440px] shadow-2xs`}
                >
                  {/* ========================================================= */}
                  {/* READY COLUMN: SPECIAL RECTANGLE VIEW (MAX 2 ON DISPLAY)   */}
                  {/* ========================================================= */}
                  {col.status === "READY" ? (
                    count > 0 ? (
                      <div className="space-y-3 flex-1 mb-4 overflow-y-auto max-h-[520px] pr-1 scrollbar-thin scrollbar-thumb-emerald-200">
                        {/* Slot 1: Active Ready Card */}
                        {matchingKots[0] && (
                          <ReadyRectangleCard
                            kot={matchingKots[0]}
                            slotNumber={1}
                            advancingId={advancingId}
                            onServe={(kot) => advance(kot, "SERVED")}
                            orderIdColor={orderIdColor}
                          />
                        )}

                        {/* Slot 2: Active Ready Card OR Empty Available Slot */}
                        {matchingKots[1] ? (
                          <ReadyRectangleCard
                            kot={matchingKots[1]}
                            slotNumber={2}
                            advancingId={advancingId}
                            onServe={(kot) => advance(kot, "SERVED")}
                            orderIdColor={orderIdColor}
                          />
                        ) : (
                          <EmptyReadySlot slotNumber={2} />
                        )}

                        {/* Queue Strip for Orders beyond the 2 Active Slots */}
                        {count > 2 && (
                          <ReadyQueueStrip
                            queuedKots={matchingKots.slice(2)}
                            onServe={(kot) => advance(kot, "SERVED")}
                            advancingId={advancingId}
                          />
                        )}
                      </div>
                    ) : (
                      /* Empty Ready Column State */
                      <div className="flex flex-col items-center justify-center my-auto py-12 text-center">
                        <div
                          className={`w-16 h-16 rounded-full ${col.bubbleBg} flex items-center justify-center mb-3 shadow-inner`}
                        >
                          <ColumnIcon size={28} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">{col.emptyTitle}</h4>
                        <p className="text-xs text-slate-400 max-w-[200px]">
                          Orders marked ready from 'Preparing' will appear here in Rectangle View (max 2 at a time).
                        </p>
                      </div>
                    )
                  ) : (
                    /* ========================================================= */
                    /* STANDARD COLUMNS (NEW, ACCEPTED, PREPARING)               */
                    /* ========================================================= */
                    count > 0 ? (
                      <div className="space-y-3.5 flex-1 mb-4 overflow-y-auto max-h-[520px] pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                        {matchingKots.map((kot) => {
                          const kotNum = kot.kotNumber || `#${kot._id?.slice(-4)}`;
                          const orderNum = kot.order?.orderNumber ? `#${kot.order.orderNumber}` : kotNum;
                          const orderTypeText =
                            kot.orderType === "TAKEAWAY"
                              ? "TAKEAWAY"
                              : kot.orderType === "DELIVERY"
                                ? "DELIVERY"
                                : "COUNTER / DINE-IN";
                          const counterName = kot.counter || kot.order?.counter || "Counter 1";
                          const cashierName = kot.createdBy?.name || kot.order?.createdBy?.name || "Cashier Counter";
                          const customerName = kot.order?.customer?.name;
                          const formattedTime = kot.createdAt
                            ? new Date(kot.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : null;

                          return (
                            <div
                              key={kot._id}
                              className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 hover:bg-slate-50 transition-colors shadow-2xs"
                            >
                              {/* Card Top Row */}
                              <div className="flex items-center justify-between text-xs gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md border border-orange-200 shadow-2xs">
                                    {orderNum}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black text-white uppercase whitespace-nowrap shadow-2xs ${
                                    counterName === "Counter 2" ? "bg-purple-600" : "bg-sky-600"
                                  }`}>
                                    {counterName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {kot.order?.paymentStatus === "PAID" && (
                                    <span className="font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-md text-[10px] tracking-wide whitespace-nowrap">
                                      ✓ PAID
                                    </span>
                                  )}
                                  <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap">
                                    {orderTypeText}
                                  </span>
                                </div>
                              </div>

                              {/* Cashier & Guest Details */}
                              <div className="flex items-center justify-between gap-1 text-[11px] bg-white border border-slate-200/90 rounded-lg px-2 py-1 shadow-2xs">
                                <span className="flex items-center gap-1 font-semibold text-slate-700 truncate" title={`Cashier / Server: ${cashierName}`}>
                                  <User size={12} className="text-orange-500 shrink-0" />
                                  <span className="text-[10px] text-slate-400 uppercase font-bold">Cashier:</span>
                                  <span className="text-slate-900 font-bold truncate">{cashierName}</span>
                                </span>
                                {customerName ? (
                                  <span className="text-[10px] text-slate-500 truncate max-w-[85px]" title={`Guest: ${customerName}`}>
                                    👤 {customerName}
                                  </span>
                                ) : formattedTime ? (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {formattedTime}
                                  </span>
                                ) : null}
                              </div>

                              {/* Order level notes */}
                              {kot.order?.notes && (
                                <div className="text-[10px] text-amber-800 font-medium bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                                  📌 {kot.order.notes}
                                </div>
                              )}

                              {/* Items List */}
                              <ul className="space-y-1.5 text-xs text-slate-800 font-medium border-y border-slate-200/60 py-2">
                                {kot.items?.map((i, idx) => (
                                  <li key={idx} className="flex items-start justify-between">
                                    <span className="flex items-center gap-1.5">
                                      <span className="font-extrabold text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded text-[10px]">
                                        {i.quantity}x
                                      </span>
                                      <span>{i.name}</span>
                                    </span>
                                    {i.notes && (
                                      <span className="text-[10px] text-slate-400 italic">
                                        ({i.notes})
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>

                              {/* Advance Action Button */}
                              <button
                                type="button"
                                disabled={advancingId === kot._id}
                                onClick={() => advance(kot, col.next)}
                                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 ${col.buttonBg}`}
                              >
                                {advancingId === kot._id ? "Updating..." : col.actionText}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Empty Column State */
                      <div className="flex flex-col items-center justify-center my-auto py-12 text-center">
                        <div
                          className={`w-16 h-16 rounded-full ${col.bubbleBg} flex items-center justify-center mb-3 shadow-inner`}
                        >
                          <ColumnIcon size={28} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">{col.emptyTitle}</h4>
                        <p className="text-xs text-slate-400 max-w-[200px]">{col.emptySubtitle}</p>
                      </div>
                    )
                  )}

                  {/* Bottom Footer Info Note with Click to Total Screen */}
                  <div
                    onClick={() => setMaximizedColumn(col.status)}
                    className={`${col.infoBg} p-2.5 rounded-xl border flex items-center justify-between shrink-0 mt-2 text-xs cursor-pointer hover:brightness-95 transition-all`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Info size={14} className="shrink-0" />
                      <span className="truncate">{col.infoNote}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMaximizedColumn(col.status);
                      }}
                      className="text-[10px] font-extrabold underline hover:text-slate-900 shrink-0 ml-1 cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Total Screen</span>
                      <Maximize2 size={10} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Counter Modal (Owner & Manager only) */}
      {showAddCounterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900">Add Counter Terminal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCounterModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter counter name (e.g. <b>Counter 3</b>, <b>Juice Bar</b>, <b>Takeaway Desk</b>). It will be available for POS billing and Kitchen Display.
            </p>
            <form onSubmit={handleAddNewCounter} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. Counter 3"
                value={newCounterName}
                onChange={(e) => setNewCounterName(e.target.value)}
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                required
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddCounterModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  Create Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
