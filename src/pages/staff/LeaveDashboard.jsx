import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Upload,
  Paperclip,
  Eye,
  X,
  Sparkles,
  Plane,
  HeartPulse,
  Sun,
  ShieldAlert,
} from "lucide-react";
import {
  getMyLeaves,
  getMyLeaveBalances,
  applyLeave,
  cancelMyLeave,
} from "../../services/leaveService";
import {
  calculateLeaveDays,
  formatDateStr,
} from "../../utils/attendanceUtils";
import { LEAVE_STATUS, LEAVE_TYPES } from "../../constants/statusConstants";
import MobileLeave from "../../components/mobile/MobileLeave";

const LEAVE_TYPE_UI = {
  CASUAL: {
    label: "Casual Leave",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    barColor: "bg-blue-500",
    icon: Sun,
    defaultTotal: 12,
  },
  SICK: {
    label: "Sick Leave",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    barColor: "bg-rose-500",
    icon: HeartPulse,
    defaultTotal: 7,
  },
  ANNUAL: {
    label: "Annual Leave",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    barColor: "bg-emerald-500",
    icon: Plane,
    defaultTotal: 15,
  },
  EMERGENCY: {
    label: "Emergency Leave",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    barColor: "bg-amber-500",
    icon: ShieldAlert,
    defaultTotal: 3,
  },
  UNPAID: {
    label: "Unpaid Leave",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    barColor: "bg-slate-500",
    icon: AlertCircle,
    defaultTotal: 999,
  },
};

const STATUS_ICONS = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  CANCELLED: AlertCircle,
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function LeaveDashboard() {
  const { user } = useSelector((s) => s.auth);

  // States
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Panels
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Apply Form
  const todayStr = formatDateStr(new Date());
  const [applyForm, setApplyForm] = useState({
    leaveType: "CASUAL",
    startDate: todayStr,
    endDate: todayStr,
    halfDay: false,
    halfDayPeriod: "FIRST_HALF",
    reason: "",
    attachment: "",
    attachmentName: "",
  });

  // Calculate duration automatically via centralized utility
  const calculatedDays = useMemo(() => {
    return calculateLeaveDays(applyForm.startDate, applyForm.endDate, applyForm.halfDay);
  }, [applyForm.startDate, applyForm.endDate, applyForm.halfDay]);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, bRes] = await Promise.all([
        getMyLeaves(),
        getMyLeaveBalances(),
      ]);
      setLeaves(lRes.data.data || []);
      setBalances(bRes.data.data?.balances || null);
    } catch {
      toast.error("Failed to load leave records");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle file upload preview (convert to Base64)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size cannot exceed 5MB");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setApplyForm((prev) => ({
        ...prev,
        attachment: reader.result,
        attachmentName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Submit Leave Request
  const handleSubmitApply = async (e) => {
    e.preventDefault();
    if (!applyForm.reason.trim()) {
      return toast.error("Please provide a reason for leave");
    }
    if (calculatedDays <= 0) {
      return toast.error("Invalid leave duration");
    }

    setSubmitting(true);
    try {
      await applyLeave({
        ...applyForm,
        days: calculatedDays,
      });
      toast.success("🎉 Leave request submitted successfully!");
      setShowApplyModal(false);
      setApplyForm({
        leaveType: "CASUAL",
        startDate: todayStr,
        endDate: todayStr,
        halfDay: false,
        halfDayPeriod: "FIRST_HALF",
        reason: "",
        attachment: "",
        attachmentName: "",
      });
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit leave request");
    }
    setSubmitting(false);
  };

  // Cancel Request
  const handleConfirmCancel = async () => {
    if (!cancellingId) return;
    try {
      await cancelMyLeave(cancellingId);
      toast.info("Leave request cancelled");
      setShowCancelConfirm(false);
      setSelectedRequest(null);
      setCancellingId(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel request");
    }
  };

  // Filtered Requests List
  const filteredRequests = useMemo(() => {
    return leaves.filter((req) => {
      if (statusFilter !== "ALL" && req.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && req.leaveType !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const reasonMatch = req.reason?.toLowerCase().includes(q);
        const typeMatch = req.leaveType?.toLowerCase().includes(q);
        if (!reasonMatch && !typeMatch) return false;
      }
      return true;
    });
  }, [leaves, statusFilter, typeFilter, searchQuery]);

  return (
    <>
      {/* Mobile-first Leave Interface (<768px) */}
      <div className="block md:hidden">
        <MobileLeave />
      </div>

      {/* Desktop & Tablet Leave Interface (>=768px) - Untouched */}
      <div className="hidden md:block space-y-6 pb-12">
        {/* ─── 1. TOP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Leave
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles size={12} /> Leave Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Apply for leave and track your leave requests
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* ─── 2. LEAVE BALANCES SECTION (Cards) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {["CASUAL", "SICK", "ANNUAL", "EMERGENCY"].map((typeKey) => {
          const meta = LEAVE_TYPE_UI[typeKey];
          const Icon = meta.icon;
          const bal = balances?.[typeKey] || { total: meta.defaultTotal, used: 0 };
          const remaining = Math.max(0, bal.total - bal.used);
          const usedPct = bal.total > 0 ? Math.min(100, Math.round((bal.used / bal.total) * 100)) : 0;

          return (
            <div
              key={typeKey}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">{meta.label}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${meta.color}`}>
                  <Icon size={16} />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900">{remaining}</span>
                  <span className="text-xs font-bold text-slate-400">/ {bal.total} days</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-1">
                  <span>Used: {bal.used}d</span>
                  <span>{remaining}d left</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${meta.barColor}`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── 3. MY LEAVE REQUESTS TABLE ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        {/* Table Title & Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              My Leave Requests
            </h3>
            <p className="text-xs text-slate-500">History and status of your submitted requests</p>
          </div>

          {/* Status Tabs: [ All ] [ Pending ] [ Approved ] [ Rejected ] */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 shadow-2xs overflow-x-auto">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  statusFilter === st
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                {st === "ALL" ? "All Requests" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Leave Type Dropdown Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by reason or leave type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:border-blue-500 focus:outline-none font-medium"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:outline-none font-bold w-full sm:w-auto"
          >
            <option value="ALL">All Leave Types</option>
            <option value="CASUAL">Casual Leave</option>
            <option value="SICK">Sick Leave</option>
            <option value="ANNUAL">Annual Leave</option>
            <option value="EMERGENCY">Emergency Leave</option>
            <option value="UNPAID">Unpaid Leave</option>
          </select>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">From</th>
                <th className="py-3 px-4">To</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Applied On</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRequests.map((req) => {
                const meta = LEAVE_TYPE_UI[req.leaveType] || LEAVE_TYPE_UI.CASUAL;
                const statusMeta = LEAVE_STATUS[req.status] || LEAVE_STATUS.PENDING;
                const StatusIcon = STATUS_ICONS[req.status] || Clock;

                return (
                  <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {formatDate(req.startDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {formatDate(req.endDate)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {req.days} {req.days === 1 ? "Day" : "Days"}
                      {req.halfDay && <span className="text-[10px] text-amber-600 block">({req.halfDayPeriod?.replace("_", " ")})</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}>
                        <StatusIcon size={12} />
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(req)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-bold transition-colors"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <CalendarDays size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No leave requests found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click "Apply for Leave" above to submit a new request</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 4. APPLY FOR LEAVE MODAL ─── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plane size={18} className="text-orange-500" />
                Apply for Leave
              </h3>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitApply} className="space-y-4 text-xs">
              {/* Leave Type */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Type *</label>
                <select
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-bold"
                  value={applyForm.leaveType}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                >
                  <option value="CASUAL">Casual Leave ({Math.max(0, (balances?.CASUAL?.total || 12) - (balances?.CASUAL?.used || 0))} days left)</option>
                  <option value="SICK">Sick Leave ({Math.max(0, (balances?.SICK?.total || 7) - (balances?.SICK?.used || 0))} days left)</option>
                  <option value="ANNUAL">Annual Leave ({Math.max(0, (balances?.ANNUAL?.total || 15) - (balances?.ANNUAL?.used || 0))} days left)</option>
                  <option value="EMERGENCY">Emergency Leave ({Math.max(0, (balances?.EMERGENCY?.total || 3) - (balances?.EMERGENCY?.used || 0))} days left)</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">From Date *</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-mono font-bold"
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value, endDate: applyForm.endDate < e.target.value ? e.target.value : applyForm.endDate })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To Date *</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-mono font-bold"
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Duration Banner */}
              <div className="bg-orange-50/70 border border-orange-200/80 p-3 rounded-xl flex items-center justify-between">
                <span className="text-slate-700 font-bold">Calculated Duration:</span>
                <span className="text-orange-700 font-black text-sm">
                  {calculatedDays} {calculatedDays === 1 ? "Day" : "Days"}
                </span>
              </div>

              {/* Half Day Option */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={applyForm.halfDay}
                    onChange={(e) => setApplyForm({ ...applyForm, halfDay: e.target.checked })}
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Half Day Leave (0.5 Day)</span>
                </label>

                {applyForm.halfDay && (
                  <select
                    className="bg-slate-50 text-slate-800 text-xs rounded-lg px-2.5 py-1 border border-slate-200 font-semibold"
                    value={applyForm.halfDayPeriod}
                    onChange={(e) => setApplyForm({ ...applyForm, halfDayPeriod: e.target.value })}
                  >
                    <option value="FIRST_HALF">First Half (Morning)</option>
                    <option value="SECOND_HALF">Second Half (Afternoon)</option>
                  </select>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Leave *</label>
                <textarea
                  rows="3"
                  placeholder="Explain why you are requesting leave..."
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-medium"
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  required
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Attachment (Optional, e.g. Doctor's Note / Ticket)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Upload size={16} className="text-orange-500" />
                    <span className="font-semibold text-xs">
                      {applyForm.attachmentName || "Upload Document (PDF, JPG, PNG up to 5MB)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Leave Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 5. REQUEST DETAILS DRAWER / MODAL ─── */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                Leave Request Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${
                      LEAVE_STATUS[selectedRequest.status]?.badgeClass || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {LEAVE_STATUS[selectedRequest.status]?.label || selectedRequest.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                  <span className="text-sm font-black text-slate-900">{selectedRequest.days} Day(s)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Leave Type</span>
                  <span className="font-bold text-slate-800">
                    {LEAVE_TYPE_UI[selectedRequest.leaveType]?.label || selectedRequest.leaveType}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Applied On</span>
                  <span className="font-semibold text-slate-700">{formatDate(selectedRequest.createdAt)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">From Date</span>
                  <span className="font-mono font-bold text-slate-800">{formatDate(selectedRequest.startDate)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">To Date</span>
                  <span className="font-mono font-bold text-slate-800">{formatDate(selectedRequest.endDate)}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Reason</span>
                <p className="font-medium text-slate-700 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedRequest.reason}
                </p>
              </div>

              {/* Approval Info */}
              {selectedRequest.status === "APPROVED" && (
                <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl space-y-1 text-emerald-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" /> Approved by {selectedRequest.approvedBy?.name || "Manager"}
                  </p>
                  <p className="text-[10px] text-emerald-700">Approved on {formatDate(selectedRequest.approvedAt)}</p>
                  {selectedRequest.adminComment && (
                    <p className="text-xs italic pt-1 border-t border-emerald-200/60">"{selectedRequest.adminComment}"</p>
                  )}
                </div>
              )}

              {/* Rejection Info */}
              {selectedRequest.status === "REJECTED" && (
                <div className="bg-rose-50/70 border border-rose-200 p-3 rounded-xl space-y-1 text-rose-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <XCircle size={14} className="text-rose-600" /> Rejected by {selectedRequest.rejectedBy?.name || "Manager"}
                  </p>
                  <p className="text-[10px] text-rose-700">Reason / Comment:</p>
                  <p className="text-xs font-semibold">{selectedRequest.adminComment || "Request could not be approved"}</p>
                </div>
              )}

              {/* Attachment View */}
              {selectedRequest.attachment && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Attached Document</span>
                  <a
                    href={selectedRequest.attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                  >
                    <Paperclip size={13} />
                    <span>{selectedRequest.attachmentName || "View Attachment"}</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {selectedRequest.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => {
                    setCancellingId(selectedRequest._id);
                    setShowCancelConfirm(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs"
                >
                  Cancel Request
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. CONFIRM CANCEL MODAL ─── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Cancel Leave Request?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to cancel this pending leave request?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
