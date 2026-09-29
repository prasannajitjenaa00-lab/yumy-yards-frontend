import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Coffee,
  HeartPulse,
  Plane,
  ShieldAlert,
  Sun,
  RefreshCw,
} from "lucide-react";
import {
  getMyLeaves,
  getMyLeaveBalances,
  applyLeave,
  cancelMyLeave,
} from "../../services/leaveService";
import { formatDateStr } from "../../utils/attendanceUtils";

const LEAVE_TYPE_META = {
  CASUAL: { label: "Casual Leave", total: 12, icon: Sun, color: "bg-blue-500", light: "bg-blue-50 text-blue-700 border-blue-200" },
  SICK: { label: "Sick Leave", total: 7, icon: HeartPulse, color: "bg-rose-500", light: "bg-rose-50 text-rose-700 border-rose-200" },
  ANNUAL: { label: "Annual Leave", total: 15, icon: Plane, color: "bg-emerald-500", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  EMERGENCY: { label: "Emergency Leave", total: 3, icon: ShieldAlert, color: "bg-amber-500", light: "bg-amber-50 text-amber-700 border-amber-200" },
};

const STATUS_BADGES = {
  PENDING: { label: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  APPROVED: { label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", bg: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
  CANCELLED: { label: "Cancelled", bg: "bg-slate-100 text-slate-600 border-slate-200", icon: AlertCircle },
};

export default function MobileLeave() {
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Apply form state
  const todayStr = formatDateStr(new Date());
  const [form, setForm] = useState({
    leaveType: "CASUAL",
    startDate: todayStr,
    endDate: todayStr,
    halfDay: false,
    reason: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, bRes] = await Promise.allSettled([
        getMyLeaves(),
        getMyLeaveBalances(),
      ]);
      if (lRes.status === "fulfilled" && lRes.value?.data?.data) {
        setLeaves(lRes.value.data.data);
      }
      if (bRes.status === "fulfilled" && bRes.value?.data?.data) {
        setBalances(bRes.value.data.data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.reason.trim()) {
      toast.error("Please provide a reason for leave");
      return;
    }

    setSubmitting(true);
    try {
      await applyLeave({
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        halfDay: form.halfDay,
        reason: form.reason.trim(),
      });
      toast.success("Leave applied successfully!");
      setShowApplyModal(false);
      setForm({
        leaveType: "CASUAL",
        startDate: todayStr,
        endDate: todayStr,
        halfDay: false,
        reason: "",
      });
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply leave");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      await cancelMyLeave(id);
      toast.info("Leave request cancelled");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel leave");
    }
  };

  // Helper: compute remaining / total days
  const getBalanceInfo = (typeKey, defaultTotal) => {
    if (!balances) return { remaining: defaultTotal, total: defaultTotal };
    const used = balances[`${typeKey.toLowerCase()}Used`] || 0;
    const total = balances[`${typeKey.toLowerCase()}Total`] || defaultTotal;
    const remaining = Math.max(0, total - used);
    return { remaining, total };
  };

  return (
    <div className="space-y-4 px-3.5 py-4 max-w-lg mx-auto">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Leave</h1>
          <p className="text-xs text-slate-500 font-medium">Leave balance & request history</p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-800 shadow-2xs transition-colors"
          aria-label="Refresh Leaves"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-orange-500" : ""} />
        </button>
      </div>

      {/* 2. Leave Balance Cards (2x2 Grid) */}
      <div className="space-y-2">
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
          Leave Balance
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.entries(LEAVE_TYPE_META).map(([typeKey, meta]) => {
            const Icon = meta.icon;
            const { remaining, total } = getBalanceInfo(typeKey, meta.total);
            const percent = total > 0 ? (remaining / total) * 100 : 0;

            return (
              <div
                key={typeKey}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 truncate">{meta.label}</span>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-white ${meta.color}`}
                  >
                    <Icon size={14} />
                  </div>
                </div>

                <div>
                  <div className="text-lg font-black text-slate-900 leading-tight">
                    {remaining}{" "}
                    <span className="text-xs font-medium text-slate-400">/ {total} days</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${meta.color}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. + Apply for Leave Primary Button */}
      <button
        type="button"
        onClick={() => setShowApplyModal(true)}
        className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        <span>Apply for Leave</span>
      </button>

      {/* 4. My Leave Requests List */}
      <div className="space-y-2.5 pt-1">
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
          My Leave Requests
        </span>

        {leaves.map((req) => {
          const statusMeta = STATUS_BADGES[req.status] || STATUS_BADGES.PENDING;
          const StatusIcon = statusMeta.icon;
          const typeMeta = LEAVE_TYPE_META[req.leaveType] || { label: req.leaveType, light: "bg-slate-50 text-slate-700" };

          const startFormatted = new Date(req.startDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          });
          const endFormatted = new Date(req.endDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={req._id}
              className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    {typeMeta.label}
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {startFormatted} – {endFormatted}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${statusMeta.bg}`}
                >
                  <StatusIcon size={12} />
                  {statusMeta.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  Duration: <strong className="text-slate-800">{req.days || 1} Day(s)</strong>
                  {req.halfDay && " (Half Day)"}
                </span>
                {req.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => handleCancel(req._id)}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700"
                  >
                    Cancel Request
                  </button>
                )}
              </div>

              {req.reason && (
                <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                  "{req.reason}"
                </p>
              )}
            </div>
          );
        })}

        {leaves.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center text-slate-400 space-y-1">
            <Coffee size={28} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-600">No leave requests found</p>
            <p className="text-[11px]">Tap the button above to submit your first leave application.</p>
          </div>
        )}
      </div>

      {/* Apply Leave Modal Drawer */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="w-full bg-white rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
          >
            <div className="px-4 py-3.5 border-b border-slate-200/80 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-extrabold text-slate-900">Apply for Leave</h3>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-4 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Leave Type
                </label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="EMERGENCY">Emergency Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="halfDay"
                  checked={form.halfDay}
                  onChange={(e) => setForm({ ...form, halfDay: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="halfDay" className="text-xs font-semibold text-slate-700">
                  Half Day Application
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="State the purpose of your leave..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-3 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                {submitting ? "Submitting..." : "Submit Leave Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
