import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Paperclip,
  Eye,
  X,
  Plane,
  Sliders,
} from "lucide-react";
import {
  getAllLeaves,
  getLeaveSummary,
  approveLeave,
  rejectLeave,
  adminCreateLeave,
  getAllLeaveBalances,
  adjustLeaveBalance,
} from "../../services/leaveService";
import { getTodayAttendance } from "../../services/attendanceService";
import { formatDateStr } from "../../utils/attendanceUtils";
import { LEAVE_STATUS, LEAVE_TYPES } from "../../constants/statusConstants";

const LEAVE_TYPE_UI = {
  CASUAL: { label: "Casual Leave", color: "bg-blue-50 text-blue-700 border-blue-200" },
  SICK: { label: "Sick Leave", color: "bg-rose-50 text-rose-700 border-rose-200" },
  ANNUAL: { label: "Annual Leave", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  EMERGENCY: { label: "Emergency Leave", color: "bg-amber-50 text-amber-700 border-amber-200" },
  UNPAID: { label: "Unpaid Leave", color: "bg-slate-100 text-slate-700 border-slate-200" },
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

export default function AdminLeaveManagement() {
  const { user } = useSelector((s) => s.auth);

  // States
  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [allBalances, setAllBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Drawers
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBalancesModal, setShowBalancesModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingEmployee, setAdjustingEmployee] = useState(null);

  // Action states
  const [adminComment, setAdminComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Admin Add Leave Form
  const todayStr = formatDateStr(new Date());
  const [addForm, setAddForm] = useState({
    employeeId: "",
    leaveType: "CASUAL",
    startDate: todayStr,
    endDate: todayStr,
    halfDay: false,
    halfDayPeriod: "FIRST_HALF",
    reason: "",
    status: "APPROVED",
    adminComment: "Approved by Admin",
  });

  // Adjust Balance Form
  const [adjustForm, setAdjustForm] = useState({
    employeeId: "",
    leaveType: "CASUAL",
    total: 12,
    used: 0,
    reason: "",
  });

  // Load All Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, sRes, staffRes, bRes] = await Promise.all([
        getAllLeaves(),
        getLeaveSummary(),
        getTodayAttendance().catch(() => ({ data: { data: [] } })),
        getAllLeaveBalances().catch(() => ({ data: { data: [] } })),
      ]);
      setLeaves(lRes.data.data || []);
      setSummary(sRes.data.data || null);
      setStaffList(staffRes.data?.data || []);
      setAllBalances(bRes.data?.data || []);
    } catch {
      toast.error("Failed to load leave records");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Approve Request
  const handleConfirmApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await approveLeave(selectedRequest._id, { adminComment });
      toast.success(`✅ Leave approved for ${selectedRequest.employee?.name}`);
      setShowApproveModal(false);
      setSelectedRequest(null);
      setAdminComment("");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve leave");
    }
    setActionLoading(false);
  };

  // Handle Reject Request
  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      return toast.error("Please enter a rejection reason");
    }
    setActionLoading(true);
    try {
      await rejectLeave(selectedRequest._id, { adminComment: rejectReason });
      toast.info(`Leave request rejected`);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason("");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject leave");
    }
    setActionLoading(false);
  };

  // Admin Directly Create Leave
  const handleAdminCreateLeave = async (e) => {
    e.preventDefault();
    if (!addForm.employeeId || !addForm.reason.trim()) {
      return toast.error("Select an employee and enter a reason");
    }
    setActionLoading(true);
    try {
      await adminCreateLeave(addForm);
      toast.success("Leave created successfully");
      setShowAddModal(false);
      setAddForm({
        employeeId: "",
        leaveType: "CASUAL",
        startDate: todayStr,
        endDate: todayStr,
        halfDay: false,
        halfDayPeriod: "FIRST_HALF",
        reason: "",
        status: "APPROVED",
        adminComment: "Approved by Admin",
      });
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create leave");
    }
    setActionLoading(false);
  };

  // Handle Adjust Balance Submit
  const handleSaveBalanceAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustForm.reason.trim()) {
      return toast.error("Reason for adjustment is required");
    }
    setActionLoading(true);
    try {
      await adjustLeaveBalance(adjustForm);
      toast.success("Leave balance updated");
      setShowAdjustModal(false);
      setAdjustingEmployee(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to adjust balance");
    }
    setActionLoading(false);
  };

  // Filtered Leave List
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      if (statusFilter !== "ALL" && l.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && l.leaveType !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const empName = l.employee?.name?.toLowerCase() || "";
        const empRole = l.employee?.role?.toLowerCase() || "";
        const reason = l.reason?.toLowerCase() || "";
        if (!empName.includes(q) && !empRole.includes(q) && !reason.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [leaves, statusFilter, typeFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* ─── 1. TOP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Leave Management
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <CalendarDays size={12} /> HR Approval Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Review employee leave requests, manage approvals and monitor leave balances
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowBalancesModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <Sliders size={14} className="text-purple-600" />
            <span>Leave Balances</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Add Leave</span>
          </button>
        </div>
      </div>

      {/* ─── 2. SUMMARY METRIC CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-amber-900">{summary?.pendingRequests || 0}</p>
            <p className="text-xs font-bold text-amber-700 mt-0.5">Pending Requests</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-emerald-900">{summary?.approvedRequests || 0}</p>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">Approved</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-rose-900">{summary?.rejectedRequests || 0}</p>
            <p className="text-xs font-bold text-rose-700 mt-0.5">Rejected</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-700 flex items-center justify-center">
            <XCircle size={20} />
          </div>
        </div>

        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-blue-900">{summary?.currentlyOnLeave || 0}</p>
            <p className="text-xs font-bold text-blue-700 mt-0.5">Currently On Leave</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-700 flex items-center justify-center">
            <Plane size={20} />
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-slate-900">{summary?.totalLeaveDays || 0}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">Total Leave Days</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CalendarDays size={20} />
          </div>
        </div>
      </div>

      {/* ─── 3. LEAVE REQUESTS TABLE & FILTERS ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              All Employee Leave Requests
            </h3>
            <p className="text-xs text-slate-500">Review pending requests and manage staff absence</p>
          </div>

          {/* Status Tabs */}
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
                {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Leave Type Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by employee name, role, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:border-purple-500 focus:outline-none font-medium"
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
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">From Date</th>
                <th className="py-3 px-4">To Date</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLeaves.map((l) => {
                const meta = LEAVE_TYPE_UI[l.leaveType] || LEAVE_TYPE_UI.CASUAL;
                const statusMeta = LEAVE_STATUS[l.status] || LEAVE_STATUS.PENDING;
                const StatusIcon = STATUS_ICONS[l.status] || Clock;
                const initial = l.employee?.name?.charAt(0).toUpperCase() || "?";

                return (
                  <tr key={l._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Employee Profile */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-xs font-black flex items-center justify-center shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold">{l.employee?.name || "Unknown"}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{l.employee?.phone || l.employee?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      {l.employee?.role === "WAITER" ? "Service" : l.employee?.role === "KITCHEN" ? "Kitchen" : "Management"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {formatDate(l.startDate)}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {formatDate(l.endDate)}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {l.days} {l.days === 1 ? "Day" : "Days"}
                      {l.halfDay && <span className="text-[10px] text-amber-600 block">({l.halfDayPeriod?.replace("_", " ")})</span>}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{l.reason}</td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}>
                        <StatusIcon size={12} />
                        {statusMeta.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-semibold">
                      {l.appliedBy === "ADMIN" ? "Admin" : "Employee"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(l)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                        >
                          View
                        </button>

                        {l.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(l);
                                setShowApproveModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(l);
                                setShowRejectModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-slate-400">
                    No leave requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 4. ADMIN APPROVAL / VIEW DETAILS DRAWER ─── */}
      {selectedRequest && !showApproveModal && !showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-purple-600" />
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

            <div className="space-y-3.5 text-xs">
              {/* Employee Info Header */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-200 text-purple-800 font-black text-sm flex items-center justify-center shrink-0">
                    {selectedRequest.employee?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{selectedRequest.employee?.name}</h4>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {selectedRequest.employee?.role} • {selectedRequest.employee?.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    LEAVE_STATUS[selectedRequest.status]?.badgeClass || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {LEAVE_STATUS[selectedRequest.status]?.label || selectedRequest.status}
                </span>
              </div>

              {/* Leave Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Leave Type</span>
                  <span className="font-bold text-slate-800">
                    {LEAVE_TYPE_UI[selectedRequest.leaveType]?.label || selectedRequest.leaveType}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Requested Duration</span>
                  <span className="text-sm font-black text-slate-900">{selectedRequest.days} Day(s)</span>
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
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Reason for Leave</span>
                <p className="font-medium text-slate-800 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedRequest.reason}
                </p>
              </div>

              {/* Attachment */}
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
                    <span>{selectedRequest.attachmentName || "View Document"}</span>
                  </a>
                </div>
              )}

              {/* Approval Info */}
              {selectedRequest.status === "APPROVED" && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1 text-emerald-900">
                  <p className="font-bold">✓ Approved by {selectedRequest.approvedBy?.name || "Admin"}</p>
                  <p className="text-[10px] text-emerald-700">Date: {formatDate(selectedRequest.approvedAt)}</p>
                  {selectedRequest.adminComment && <p className="italic pt-1 text-xs">"{selectedRequest.adminComment}"</p>}
                </div>
              )}

              {/* Rejection Info */}
              {selectedRequest.status === "REJECTED" && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-1 text-rose-900">
                  <p className="font-bold">✕ Rejected by {selectedRequest.rejectedBy?.name || "Admin"}</p>
                  <p className="text-[10px] text-rose-700">Reason: {selectedRequest.adminComment || "None provided"}</p>
                </div>
              )}
            </div>

            {/* Actions for PENDING request */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {selectedRequest.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs"
                  >
                    Reject Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                  >
                    Approve Leave
                  </button>
                </>
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

      {/* ─── 5. CONFIRM APPROVAL MODAL ─── */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <h3 className="text-base font-black text-slate-900">Approve Leave Request?</h3>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>
                <strong>Employee:</strong> {selectedRequest.employee?.name}
              </p>
              <p>
                <strong>Leave Type:</strong> {selectedRequest.leaveType} ({selectedRequest.days} Day(s))
              </p>
              <p>
                <strong>Dates:</strong> {formatDate(selectedRequest.startDate)} → {formatDate(selectedRequest.endDate)}
              </p>
              <div className="pt-1">
                <label className="block font-bold text-slate-700 mb-1">Optional Admin Comment / Instructions:</label>
                <input
                  type="text"
                  placeholder="e.g. Approved. Take rest and get well soon."
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-emerald-500 focus:outline-none"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmApprove}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {actionLoading ? "Approving..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. CONFIRM REJECTION MODAL ─── */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <XCircle size={20} className="text-rose-600" />
              <h3 className="text-base font-black text-slate-900">Reject Leave Request</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Rejecting request for <strong>{selectedRequest.employee?.name}</strong> ({selectedRequest.leaveType}, {selectedRequest.days} days).
              </p>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Rejection *</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Leave balance exceeded, high workload on requested dates..."
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-rose-500 focus:outline-none font-medium"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmReject}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. MODAL: ADMIN DIRECTLY CREATE LEAVE ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-orange-500" />
                Add Employee Leave (Admin)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdminCreateLeave} className="space-y-4 text-xs">
              {/* Employee Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Employee *</label>
                <select
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-bold"
                  value={addForm.employeeId}
                  onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select Employee...</option>
                  {staffList.map((st) => (
                    <option key={st.user._id} value={st.user._id}>
                      {st.user.name} ({st.user.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Leave Type *</label>
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-bold"
                    value={addForm.leaveType}
                    onChange={(e) => setAddForm({ ...addForm, leaveType: e.target.value })}
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="EMERGENCY">Emergency Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-bold"
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                  >
                    <option value="APPROVED">Approved (Immediate)</option>
                    <option value="PENDING">Pending Approval</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-mono font-bold"
                    value={addForm.startDate}
                    onChange={(e) => setAddForm({ ...addForm, startDate: e.target.value, endDate: addForm.endDate < e.target.value ? e.target.value : addForm.endDate })}
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-mono font-bold"
                    value={addForm.endDate}
                    onChange={(e) => setAddForm({ ...addForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason *</label>
                <textarea
                  rows="2"
                  placeholder="Reason for leave..."
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-medium"
                  value={addForm.reason}
                  onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Add Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 8. MODAL: ALL LEAVE BALANCES TABLE ─── */}
      {showBalancesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders size={18} className="text-purple-600" />
                Staff Leave Balances Overview ({new Date().getFullYear()})
              </h3>
              <button
                type="button"
                onClick={() => setShowBalancesModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Casual (12d)</th>
                    <th className="py-3 px-3">Sick (7d)</th>
                    <th className="py-3 px-3">Annual (15d)</th>
                    <th className="py-3 px-3">Emergency (3d)</th>
                    <th className="py-3 px-3 text-right">Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {allBalances.map((bItem) => {
                    const emp = bItem.employee;
                    const bal = bItem.balances;
                    return (
                      <tr key={emp._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">{emp.role}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-blue-700">
                            {Math.max(0, bal.CASUAL.total - bal.CASUAL.used)} / {bal.CASUAL.total}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-rose-700">
                            {Math.max(0, bal.SICK.total - bal.SICK.used)} / {bal.SICK.total}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-emerald-700">
                            {Math.max(0, bal.ANNUAL.total - bal.ANNUAL.used)} / {bal.ANNUAL.total}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-amber-700">
                            {Math.max(0, bal.EMERGENCY.total - bal.EMERGENCY.used)} / {bal.EMERGENCY.total}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustingEmployee(emp);
                              setAdjustForm({
                                employeeId: emp._id,
                                leaveType: "CASUAL",
                                total: bal.CASUAL.total,
                                used: bal.CASUAL.used,
                                reason: "",
                              });
                              setShowAdjustModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px]"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBalancesModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 9. MODAL: ADJUST LEAVE BALANCE ─── */}
      {showAdjustModal && adjustingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Adjust Leave Balance
              </h3>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBalanceAdjustment} className="space-y-3 text-xs">
              <p className="text-slate-600">
                Adjusting balance for: <strong>{adjustingEmployee.name}</strong>
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Type</label>
                <select
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 font-bold"
                  value={adjustForm.leaveType}
                  onChange={(e) => setAdjustForm({ ...adjustForm, leaveType: e.target.value })}
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="EMERGENCY">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Allocated</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 font-bold"
                    value={adjustForm.total}
                    onChange={(e) => setAdjustForm({ ...adjustForm, total: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Used Days</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 font-bold"
                    value={adjustForm.used}
                    onChange={(e) => setAdjustForm({ ...adjustForm, used: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Adjustment *</label>
                <input
                  type="text"
                  placeholder="e.g. Compensatory leave credited, probation adjustment"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
