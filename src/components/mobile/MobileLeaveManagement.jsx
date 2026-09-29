import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  CalendarOff,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Coffee,
  RefreshCw,
  User,
  Check,
  X,
} from "lucide-react";
import {
  getAllLeaves,
  getLeaveSummary,
  approveLeave,
  rejectLeave,
} from "../../services/leaveService";

const STATUS_BADGES = {
  PENDING: { label: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Rejected", bg: "bg-rose-50 text-rose-700 border-rose-200" },
  CANCELLED: { label: "Cancelled", bg: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function MobileLeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, sRes] = await Promise.allSettled([
        getAllLeaves(),
        getLeaveSummary(),
      ]);
      if (lRes.status === "fulfilled" && lRes.value?.data?.data) {
        setLeaves(lRes.value.data.data);
      }
      if (sRes.status === "fulfilled" && sRes.value?.data?.data) {
        setSummary(sRes.value.data.data);
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

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await approveLeave(id, { adminComment: "Approved via Mobile Admin" });
      toast.success("Leave approved successfully");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve leave");
    } finally {
      setActionId("");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection:") || "Rejected by Admin";
    setActionId(id);
    try {
      await rejectLeave(id, { adminComment: reason });
      toast.info("Leave rejected");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject leave");
    } finally {
      setActionId("");
    }
  };

  // Filtered requests
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const matchStatus = statusFilter === "ALL" || l.status === statusFilter;
      const matchType = typeFilter === "ALL" || l.leaveType === typeFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        l.employee?.name?.toLowerCase().includes(q) ||
        l.employee?.role?.toLowerCase().includes(q) ||
        l.reason?.toLowerCase().includes(q);

      return matchStatus && matchType && matchSearch;
    });
  }, [leaves, statusFilter, typeFilter, search]);

  const pendingCount = summary?.pendingRequests ?? leaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = summary?.approvedRequests ?? leaves.filter((l) => l.status === "APPROVED").length;
  const rejectedCount = summary?.rejectedRequests ?? leaves.filter((l) => l.status === "REJECTED").length;
  const onLeaveCount = summary?.currentlyOnLeave ?? 0;

  return (
    <div className="space-y-4 px-3.5 py-4 max-w-lg mx-auto">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Leave Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">Review & approve employee leaves</p>
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

      {/* 2. Top Summary Cards (4 Metrics) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          onClick={() => setStatusFilter("PENDING")}
          className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer ${
            statusFilter === "PENDING"
              ? "border-amber-400 ring-2 ring-amber-100"
              : "border-slate-200/80 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-xl font-black text-amber-700 mt-1">{pendingCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter("APPROVED")}
          className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer ${
            statusFilter === "APPROVED"
              ? "border-emerald-400 ring-2 ring-emerald-100"
              : "border-slate-200/80 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Approved</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1">{approvedCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter("REJECTED")}
          className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer ${
            statusFilter === "REJECTED"
              ? "border-rose-400 ring-2 ring-rose-100"
              : "border-slate-200/80 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Rejected</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={15} />
            </div>
          </div>
          <div className="text-xl font-black text-rose-700 mt-1">{rejectedCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter("ALL")}
          className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer ${
            statusFilter === "ALL"
              ? "border-blue-400 ring-2 ring-blue-100"
              : "border-slate-200/80 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">On Leave</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Coffee size={15} />
            </div>
          </div>
          <div className="text-xl font-black text-blue-700 mt-1">{onLeaveCount}</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
          {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl transition-all shrink-0 ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Request Cards List */}
      <div className="space-y-3">
        {filteredLeaves.map((req) => {
          const statusMeta = STATUS_BADGES[req.status] || STATUS_BADGES.PENDING;
          const isPending = req.status === "PENDING";
          const employeeName = req.employee?.name || "Employee";
          const employeeRole = req.employee?.role || "Staff";

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
              className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3"
            >
              {/* Employee & Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {employeeName[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{employeeName}</h4>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {employeeRole}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusMeta.bg}`}
                >
                  {statusMeta.label}
                </span>
              </div>

              {/* Leave Info */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">
                    Leave Type
                  </span>
                  <span className="font-bold text-slate-800">{req.leaveType}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">
                    Duration
                  </span>
                  <span className="font-bold text-slate-800">
                    {req.days || 1} Day(s) {req.halfDay && "(Half Day)"}
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200/60">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">
                    Dates
                  </span>
                  <span className="font-semibold text-slate-700">
                    {startFormatted} – {endFormatted}
                  </span>
                </div>
              </div>

              {req.reason && (
                <p className="text-[11px] text-slate-600 italic">
                  "{req.reason}"
                </p>
              )}

              {/* Approve / Reject Actions for Pending */}
              {isPending && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={actionId === req._id}
                    onClick={() => handleReject(req._id)}
                    className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <X size={15} />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionId === req._id}
                    onClick={() => handleApprove(req._id)}
                    className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Check size={15} />
                    <span>Approve</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredLeaves.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center text-slate-400 space-y-1">
            <CalendarOff size={28} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-600">No leave requests found</p>
            <p className="text-[11px]">Any incoming leave requests will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
