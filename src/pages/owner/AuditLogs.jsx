import { useEffect, useState, useMemo } from "react";
import { ShieldCheck, Search, Filter, Calendar, User, Clock, Activity } from "lucide-react";
import api from "../../services/api";

const ACTION_BADGES = {
  CREATE: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  UPDATE: "bg-blue-50 text-blue-600 border-blue-200/60",
  DELETE: "bg-rose-50 text-rose-600 border-rose-200/60",
  LOGIN: "bg-purple-50 text-purple-600 border-purple-200/60",
  OTHER: "bg-slate-50 text-slate-600 border-slate-200/60",
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [selectedModule, setSelectedModule] = useState("ALL");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/audit-logs");
      setLogs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const actionMatch = selectedAction === "ALL" || log.action === selectedAction;
      const moduleMatch = selectedModule === "ALL" || log.module === selectedModule;
      const searchMatch =
        !search ||
        (log.user?.name || "System").toLowerCase().includes(search.toLowerCase()) ||
        (log.module || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.action || "").toLowerCase().includes(search.toLowerCase());
      return actionMatch && moduleMatch && searchMatch;
    });
  }, [logs, selectedAction, selectedModule, search]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
            <p className="text-xs text-slate-500 mt-0.5">Track administrative actions, user logins, data modifications, and security events</p>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Action Filter */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
            </select>

            {/* Module Filter */}
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="ALL">All Modules</option>
              <option value="ORDER">ORDER</option>
              <option value="KOT">KOT</option>
              <option value="EXPENSES">EXPENSES</option>
              <option value="INVENTORY">INVENTORY</option>
              <option value="PURCHASES">PURCHASES</option>
              <option value="USERS">USERS</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredLogs.length} audit entries
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by user, action, or module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* Audit Logs Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-3.5 px-4 w-10">#</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Record ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log, idx) => {
                const badgeStyle = ACTION_BADGES[log.action] || ACTION_BADGES.OTHER;

                return (
                  <tr key={log._id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                          {(log.user?.name || "System").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{log.user?.name || "System"}</span>
                          <span className="text-[10px] text-slate-400">{log.user?.role || "SYSTEM"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{log.module}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {log.recordId ? String(log.recordId).slice(-8) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredLogs.length === 0 && !loading && (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Activity className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No audit log records found</p>
            <p className="text-xs text-slate-400">Log entries will record automatically as system actions occur.</p>
          </div>
        )}
      </div>
    </div>
  );
}
