import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getTables, bulkCreateTables } from "../../services/tableService";
import { setOrderType, setTable, clearCart } from "../../store/slices/cartSlice";
import { toast } from "react-toastify";
import {
  Table2,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  MoreVertical,
  UtensilsCrossed,
  Home,
  Trees,
  Umbrella,
  X,
} from "lucide-react";

const ZONE_ICONS = {
  ALL: LayoutGrid,
  "Main Hall": Home,
  Garden: Trees,
  Terrace: Umbrella,
};

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCount, setNewCount] = useState(1);
  const [newZone, setNewZone] = useState("Main Hall");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loadTables = async () => {
    setLoading(true);
    try {
      const res = await getTables();
      setTables(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      console.error("Load tables error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const dynamicZones = useMemo(() => {
    const extracted = new Set(tables.map((t) => t.zone).filter(Boolean));
    return ["ALL", ...Array.from(extracted)];
  }, [tables]);

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchZone = selectedZone === "ALL" || t.zone === selectedZone;
      const numStr = String(t.number || t.tableNumber || "");
      const matchSearch = !searchQuery || numStr.includes(searchQuery);
      return matchZone && matchSearch;
    });
  }, [tables, selectedZone, searchQuery]);

  // Counts for summary metrics
  const totalCount = tables.length;
  const availableCount = tables.filter((t) => t.status === "AVAILABLE").length;
  const occupiedCount = tables.filter((t) => t.status === "OCCUPIED" || t.status === "BILL_PENDING").length;
  const reservedCount = tables.filter((t) => t.status === "RESERVED" || t.status === "CLEANING").length;

  const openTable = (table) => {
    dispatch(clearCart());
    dispatch(setOrderType("DINE_IN"));
    dispatch(setTable(table));
    navigate("/pos");
  };

  const handleAddTables = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bulkCreateTables(Number(newCount) || 1, newZone || "Main Hall");
      toast.success(`Added ${newCount} table(s) to ${newZone}`);
      setShowAddModal(false);
      loadTables();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add tables");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs">
            <Table2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tables</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage your restaurant tables in real time</p>
          </div>
        </div>

        {/* Center Banner Graphic Accent */}
        <div className="hidden xl:flex items-center gap-3 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none opacity-90">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop"
            alt="Restaurant Tables"
            className="w-36 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
          />
          <div className="px-3.5 py-1 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold rounded-full italic">
            Great Food Brings People Together
          </div>
        </div>

        {/* Right Action Button */}
        <div className="relative z-10 self-start md:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards & Zone Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* KPI Cards (4 metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1">
          {/* Total Tables */}
          <div className="bg-[#f0fdf4] border border-emerald-100 p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-none">{totalCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Tables</div>
            </div>
          </div>

          {/* Available */}
          <div className="bg-[#f0fdf4] border border-emerald-100 p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-none">{availableCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Available</div>
            </div>
          </div>

          {/* Occupied */}
          <div className="bg-[#fff7ed] border border-orange-100 p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-none">{occupiedCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Occupied</div>
            </div>
          </div>

          {/* Reserved */}
          <div className="bg-[#fff1f2] border border-rose-100 p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-none">{reservedCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Reserved</div>
            </div>
          </div>
        </div>

        {/* Floor Zone Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin scrollbar-thumb-slate-200 shrink-0">
          {dynamicZones.map((z) => {
            const Icon = ZONE_ICONS[z] || Home;
            const isSelected = selectedZone === z;
            return (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon size={14} />
                <span>{z === "ALL" ? "All" : z}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Workspace Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between min-h-[450px]">
        {/* Workspace Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900">
            {selectedZone === "ALL" ? "All Tables" : `${selectedZone} Zone`}
          </h3>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-8 pr-3 py-2 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none shadow-2xs"
              />
            </div>

            {/* View Switchers */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-orange-500 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-orange-500 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Table Cards Grid (5 Columns Desktop) */}
        <div className="p-4 sm:p-5 flex-1">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTables.map((table) => {
                const status = table.status || "AVAILABLE";
                const num = table.number || table.tableNumber || "?";
                const capacity = table.capacity || 4;

                let cardBg = "bg-[#f0fdf4] border-emerald-200/90 text-emerald-800";
                let iconBg = "bg-emerald-500/15 text-emerald-600";
                let dotBg = "bg-emerald-500";
                let statusLabel = "Available";

                if (status === "OCCUPIED" || status === "BILL_PENDING") {
                  cardBg = "bg-[#fff7ed] border-orange-200/90 text-orange-800";
                  iconBg = "bg-orange-500/15 text-orange-600";
                  dotBg = "bg-orange-500";
                  statusLabel = "Occupied";
                } else if (status === "RESERVED") {
                  cardBg = "bg-[#eff6ff] border-blue-200/90 text-blue-800";
                  iconBg = "bg-blue-500/15 text-blue-600";
                  dotBg = "bg-blue-500";
                  statusLabel = "Reserved";
                } else if (status === "CLEANING" || status === "MAINTENANCE") {
                  cardBg = "bg-[#fff1f2] border-rose-200/90 text-rose-800";
                  iconBg = "bg-rose-500/15 text-rose-600";
                  dotBg = "bg-rose-500";
                  statusLabel = "Maintenance";
                }

                return (
                  <div
                    key={table._id}
                    onClick={() => openTable(table)}
                    className={`${cardBg} border rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative`}
                  >
                    {/* Top Row: Icon + Table Number & Menu */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                        <UtensilsCrossed size={18} />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-black text-slate-900">{num}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); }}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-white/50 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Middle: Status Dot */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span className={`w-2 h-2 rounded-full ${dotBg}`}></span>
                        <span>{statusLabel}</span>
                      </div>
                    </div>

                    {/* Bottom: Seats Info */}
                    <div className="pt-2 border-t border-slate-900/5 flex items-center text-xs font-semibold text-slate-600">
                      <Users size={13} className="mr-1 text-slate-400" />
                      <span>{capacity} seats</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View Alternative */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Table #</th>
                    <th className="py-2.5 px-3">Zone</th>
                    <th className="py-2.5 px-3">Capacity</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTables.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openTable(t)}>
                      <td className="py-3 px-3 font-bold text-slate-900">Table {t.number}</td>
                      <td className="py-3 px-3 text-slate-600">{t.zone || "Main Hall"}</td>
                      <td className="py-3 px-3 text-slate-600">{t.capacity || 4} seats</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-orange-600">Open in POS</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!filteredTables.length && !loading && (
            <div className="py-16 text-center">
              <Table2 size={40} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No tables found</p>
              <p className="text-xs text-slate-500">Try changing your zone filter or search query.</p>
            </div>
          )}
        </div>

        {/* 4. Bottom Legend Bar */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Occupied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Reserved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Maintenance
            </span>
          </div>

          <div>Total: <span className="font-bold text-slate-900">{totalCount}</span> tables</div>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Tables</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTables} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Number of Tables</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={newCount}
                  onChange={(e) => setNewCount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Floor Zone</label>
                <input
                  type="text"
                  placeholder="e.g. Main Hall, Garden, Terrace"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
                >
                  {submitting ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
