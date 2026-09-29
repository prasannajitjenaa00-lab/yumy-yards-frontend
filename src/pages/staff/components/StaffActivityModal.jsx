import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Activity,
  Search,
  Filter,
  User,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import api from "../../../services/api";

const ACTION_COLORS = {
  LOGIN: "bg-purple-100 text-purple-700 border-purple-200",
  CREATE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
  DELETE: "bg-rose-100 text-rose-700 border-rose-200",
  CHECK_IN: "bg-teal-100 text-teal-700 border-teal-200",
  CHECK_OUT: "bg-indigo-100 text-indigo-700 border-indigo-200",
  APPLY_LEAVE: "bg-amber-100 text-amber-700 border-amber-200",
  CANCEL_LEAVE: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function StaffActivityModal({ isOpen, onClose, staffList = [] }) {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/audit-logs", { params: { limit: 100 } });
      setLogs(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to load staff activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Staff filter
      if (selectedStaffId !== "ALL") {
        const logUserId = log.user?._id || log.user;
        if (logUserId !== selectedStaffId) return false;
      }

      // 2. Action filter
      if (selectedAction !== "ALL" && log.action !== selectedAction) {
        return false;
      }

      // 3. Search query
      if (search) {
        const q = search.toLowerCase();
        const userName = (log.user?.name || "").toLowerCase();
        const moduleName = (log.module || "").toLowerCase();
        const actionName = (log.action || "").toLowerCase();
        if (!userName.includes(q) && !moduleName.includes(q) && !actionName.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [logs, selectedStaffId, selectedAction, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Staff Activity Logs</h2>
              <p className="text-xs text-orange-100">Live operational history and staff actions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Activity"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Search */}
            <div className="relative sm:col-span-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search action or staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Staff Selector */}
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Staff Members</option>
              {staffList.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name} ({st.role})
                </option>
              ))}
            </select>

            {/* Action Type */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Action Types</option>
              <option value="LOGIN">Logins</option>
              <option value="CREATE">Creations</option>
              <option value="UPDATE">Updates</option>
              <option value="DELETE">Deletions</option>
              <option value="CHECK_IN">Punch In</option>
              <option value="CHECK_OUT">Punch Out</option>
              <option value="APPLY_LEAVE">Leave Requests</option>
            </select>
          </div>
        </div>

        {/* Timeline Activities List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {filteredLogs.map((log) => {
            const staffName = log.user?.name || "System Automated";
            const staffRole = log.user?.role || "SYSTEM";
            const badgeClass = ACTION_COLORS[log.action] || "bg-slate-100 text-slate-700 border-slate-200";

            return (
              <div
                key={log._id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-2 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {staffName[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {staffName}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        {staffRole} • {log.module || "SYSTEM"}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgeClass}`}>
                    {log.action}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    {new Date(log.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {log.ip && <span className="font-mono text-[10px] text-slate-400">IP: {log.ip}</span>}
                </div>
              </div>
            );
          })}

          {!loading && filteredLogs.length === 0 && (
            <div className="py-16 text-center text-slate-400 space-y-1">
              <Activity size={32} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                No activity logs found
              </p>
              <p className="text-[11px] text-slate-400">
                Staff actions and punches will automatically appear here as operations happen.
              </p>
            </div>
          )}

          {loading && (
            <div className="py-16 text-center">
              <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Fetching staff activities...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/owner/audit-logs");
            }}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>Open Comprehensive Audit Logs</span>
            <ExternalLink size={13} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
