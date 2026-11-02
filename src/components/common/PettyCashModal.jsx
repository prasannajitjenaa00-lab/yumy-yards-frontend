import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  ShoppingBag,
  Package,
  Truck,
  Wrench,
  Coffee,
  Zap,
  HelpCircle,
  PlusCircle,
  CheckCircle2,
  Clock,
  Building,
} from "lucide-react";
import {
  recordCashIn,
  recordCashOut,
  getPettyCashSummary,
  getPettyCashTransactions,
} from "../../services/pettyCashService";

const CATEGORIES_OUT = [
  { id: "RAW_MATERIALS", label: "Groceries / Milk / Ice", icon: ShoppingBag, color: "text-orange-500 bg-orange-50" },
  { id: "SUPPLIES", label: "Packaging / Disposables", icon: Package, color: "text-blue-500 bg-blue-50" },
  { id: "TRANSPORT", label: "Auto / Errand / Fuel", icon: Truck, color: "text-cyan-500 bg-cyan-50" },
  { id: "MAINTENANCE", label: "Minor Repairs / Hardware", icon: Wrench, color: "text-amber-500 bg-amber-50" },
  { id: "STAFF_TEA_SNACKS", label: "Staff Tea / Refreshment", icon: Coffee, color: "text-emerald-500 bg-emerald-50" },
  { id: "UTILITIES", label: "Gas Cylinder / Emergency", icon: Zap, color: "text-purple-500 bg-purple-50" },
  { id: "OTHER", label: "Other Cash Expense", icon: HelpCircle, color: "text-slate-500 bg-slate-50" },
];

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export default function PettyCashModal({ isOpen, onClose, activeCounter = "Counter 1" }) {
  const [type, setType] = useState("CASH_OUT"); // "CASH_OUT" or "CASH_IN"
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("RAW_MATERIALS");
  const [reason, setReason] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [receiptRef, setReceiptRef] = useState("");
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("form"); // "form" | "history"

  useEffect(() => {
    if (isOpen) {
      loadData();
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const loadData = async () => {
    try {
      const [sumRes, txRes] = await Promise.all([
        getPettyCashSummary().catch(() => ({ data: null })),
        getPettyCashTransactions({ limit: 8 }).catch(() => ({ data: [] })),
      ]);
      if (sumRes?.data) setSummary(sumRes.data);
      if (txRes?.data) setRecentTransactions(txRes.data);
    } catch (err) {
      console.warn("Failed to load petty cash data", err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please enter a reason or description");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: numAmount,
        reason: reason.trim(),
        counterId: activeCounter,
        receiptRef: receiptRef.trim(),
      };

      if (type === "CASH_OUT") {
        payload.category = category;
        payload.paidTo = paidTo.trim();
        await recordCashOut(payload);
        toast.success(`Recorded Cash Out of ₹${numAmount} successfully!`);
      } else {
        payload.category = "FLOAT_TOPUP";
        await recordCashIn(payload);
        toast.success(`Recorded Cash In of ₹${numAmount} successfully!`);
      }

      // Reset form
      setAmount("");
      setReason("");
      setPaidTo("");
      setReceiptRef("");
      await loadData();
      setActiveTab("history");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with High-Contrast Exit Button */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-xs">
              <Wallet size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Petty Cash & Cash Drawer</h2>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <Building size={11} className="text-amber-500" />
                <span className="font-semibold text-slate-700">{activeCounter}</span>
                <span>•</span>
                <span>Drawer Balance: <b className="text-slate-900">₹{summary?.currentBalance ?? "0.00"}</b></span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-slate-200"
            title="Exit / Close (Esc)"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Top Summary Banner with Day-to-Day Carry Forward and POS Cash Sales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100 shrink-0 text-center">
          <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200/60 shadow-2xs">
            <span className="text-[10px] text-amber-700 font-bold uppercase block truncate">Opening (Yesterday Close)</span>
            <p className="text-sm font-bold text-amber-900 mt-0.5">₹{summary?.openingBalance ?? 0}</p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/60 shadow-2xs">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block truncate">Cash Sales (Orders)</span>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">+₹{summary?.todayCashSales ?? 0}</p>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block truncate">Petty In / Out</span>
            <p className="text-sm font-bold text-slate-700 mt-0.5">
              <span className="text-emerald-600">+{summary?.todayIn ?? 0}</span> / <span className="text-rose-600">-{summary?.todayOut ?? 0}</span>
            </p>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 text-white shadow-2xs">
            <span className="text-[10px] text-amber-400 font-bold uppercase block truncate">Drawer Balance</span>
            <p className="text-sm font-bold text-white mt-0.5">₹{summary?.currentBalance ?? 0}</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 px-5 pt-2 shrink-0 gap-4">
          <button
            onClick={() => setActiveTab("form")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "form"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            New Transaction
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "history"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Clock size={13} />
            <span>Recent History ({recentTransactions.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selector (Cash In vs Cash Out) */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType("CASH_OUT");
                      setCategory("RAW_MATERIALS");
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      type === "CASH_OUT"
                        ? "bg-rose-50 border-rose-300 text-rose-700 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowUpRight size={16} className="text-rose-500" />
                    <div className="text-left">
                      <p className="font-bold">🔴 CASH OUT</p>
                      <p className="text-[10px] text-slate-500 font-normal">Pay expense / emergency item</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setType("CASH_IN");
                      setCategory("FLOAT_TOPUP");
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      type === "CASH_IN"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowDownLeft size={16} className="text-emerald-500" />
                    <div className="text-left">
                      <p className="font-bold">🟢 CASH IN</p>
                      <p className="text-[10px] text-slate-500 font-normal">Add money / float deposit</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount Input & Preset Chips */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="Enter amount (e.g. 250)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2.5 text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category (if Cash Out) */}
              {type === "CASH_OUT" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORIES_OUT.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/60 font-bold text-orange-900 shadow-2xs"
                              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}>
                            <Icon size={13} />
                          </div>
                          <span className="text-[11px] truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reason / Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Reason / Description *
                </label>
                <input
                  type="text"
                  placeholder={
                    type === "CASH_OUT"
                      ? "e.g. Bought 2 packets of milk & fresh lemons"
                      : "e.g. Morning cash float deposit"
                  }
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Vendor Row */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {type === "CASH_OUT" ? "Paid To / Vendor" : "Deposited By"}
                </label>
                <input
                  type="text"
                  placeholder={type === "CASH_OUT" ? "e.g. Local Dairy" : "e.g. Manager"}
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons (Cancel / Submit) */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-2/3 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    type === "CASH_OUT"
                      ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                      : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                  } ${loading ? "opacity-60 cursor-not-allowed" : "active:scale-98"}`}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {loading
                      ? "Recording..."
                      : type === "CASH_OUT"
                      ? `Record Cash Out (₹${amount || "0"})`
                      : `Record Cash In (₹${amount || "0"})`}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* History Tab */
            <div className="space-y-2.5">
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Receipt size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold">No petty cash transactions recorded yet</p>
                </div>
              ) : (
                recentTransactions.map((tx) => {
                  const isOut = tx.type === "CASH_OUT";
                  return (
                    <div
                      key={tx._id}
                      className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isOut ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {isOut ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{tx.reason}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <span>{new Date(tx.createdAt || tx.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            <span>•</span>
                            <span>{tx.counterId || "Counter 1"}</span>
                            {tx.paidTo && (
                              <>
                                <span>•</span>
                                <span className="truncate">To: {tx.paidTo}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-bold text-sm block ${
                            isOut ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {isOut ? "-" : "+"}₹{tx.amount}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          Bal: ₹{tx.balanceAfter ?? 0}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

