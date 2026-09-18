import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getKOTs, updateKOTStatus } from "../../services/orderService";
import { getSocket } from "../../socket/socketClient";
import {
  ChefHat,
  ClipboardList,
  CheckCircle2,
  Soup,
  UtensilsCrossed,
  MoreVertical,
  Info,
  Clock,
  ArrowRight,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  LayoutGrid,
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
    infoNote: "Orders ready for serving will appear here",
    actionText: "Serve Order ✓",
  },
];

export default function KitchenDisplay() {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maximizedColumn, setMaximizedColumn] = useState(null);

  const load = () => {
    getKOTs()
      .then((r) => setKots(Array.isArray(r?.data) ? r.data : []))
      .catch(() => {})
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
    return () => {
      if (socket) {
        socket.off("kot:new");
        socket.off("kot:status");
      }
    };
  }, []);

  const advance = async (kot, next) => {
    try {
      await updateKOTStatus(kot._id, next);
      toast.success(`KOT moved to ${next}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const activeMaxColumn = COLUMNS.find((c) => c.status === maximizedColumn);

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Left Title */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs">
            <ChefHat size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kitchen Display</h1>
            <p className="text-xs text-slate-500 mt-0.5">Live kitchen orders • Faster service • Maximize view per section</p>
          </div>
        </div>

        {/* Section View Pills & Maximize Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 relative z-10">
          <button
            onClick={() => setMaximizedColumn(null)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              maximizedColumn === null
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <LayoutGrid size={14} />
            <span>All Sections (4 Col)</span>
          </button>

          {COLUMNS.map((col) => {
            const Icon = col.icon;
            const isMaximized = maximizedColumn === col.status;
            const count = kots.filter((k) => col.statusKeys.includes(k.status)).length;
            return (
              <button
                key={col.status}
                onClick={() => setMaximizedColumn(isMaximized ? null : col.status)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isMaximized
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon size={14} />
                <span>{col.label} ({count})</span>
                <Maximize2 size={12} className="opacity-70 ml-0.5" />
              </button>
            );
          })}
        </div>

        {/* Right Status Indicator Badge */}
        <div className="relative z-10 self-start md:self-auto shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-2.5 shadow-2xs">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="text-xs font-extrabold text-slate-800">Kitchen Online</div>
              <div className="text-[10px] text-slate-400 font-medium">Auto refresh enabled</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAXIMIZED SECTION FULLSCREEN VIEW (If a column is maximized) */}
      {activeMaxColumn ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          {/* Maximized Header Bar */}
          <div className={`${activeMaxColumn.headerBg} p-5 rounded-2xl border flex items-center justify-between shadow-xs`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${activeMaxColumn.iconBg} flex items-center justify-center shrink-0 shadow-inner`}>
                <activeMaxColumn.icon size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">{activeMaxColumn.label}</h2>
                  <span className="bg-orange-500 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                    {kots.filter((k) => activeMaxColumn.statusKeys.includes(k.status)).length} Active KOTs
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{activeMaxColumn.infoNote} • Fullscreen Section Focus Mode</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMaximizedColumn(null)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Minimize2 size={16} />
                <span>Exit Maximize View</span>
              </button>
            </div>
          </div>

          {/* Maximized Grid of KOT Cards (3-Column Grid for Big Screen Kitchen TVs) */}
          {(() => {
            const matchingKots = kots.filter((k) => activeMaxColumn.statusKeys.includes(k.status));
            if (!matchingKots.length) {
              return (
                <div className="py-20 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className={`w-20 h-20 rounded-full ${activeMaxColumn.bubbleBg} flex items-center justify-center mx-auto shadow-inner`}>
                    <activeMaxColumn.icon size={36} />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800">{activeMaxColumn.emptyTitle}</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">{activeMaxColumn.emptySubtitle}</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {matchingKots.map((kot) => {
                  const kotNum = kot.kotNumber || `#${kot._id?.slice(-4)}`;
                  const tableText = kot.table?.number
                    ? `Table ${kot.table.number}`
                    : kot.orderType || "DINE_IN";

                  return (
                    <div
                      key={kot._id}
                      className="bg-slate-50 border-2 border-slate-200 hover:border-orange-300 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-base bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                          {kotNum}
                        </span>
                        <span className="font-extrabold text-slate-800 bg-orange-100 text-orange-800 px-3 py-1 rounded-xl border border-orange-200 text-xs">
                          {tableText}
                        </span>
                      </div>

                      {/* Items List */}
                      <ul className="space-y-2 text-sm text-slate-800 font-semibold border-y border-slate-200 py-3">
                        {kot.items?.map((i, idx) => (
                          <li key={idx} className="flex items-start justify-between">
                            <span className="flex items-center gap-2">
                              <span className="font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-lg text-xs">
                                {i.quantity}x
                              </span>
                              <span className="text-base text-slate-900 font-bold">{i.name}</span>
                            </span>
                            {i.notes && (
                              <span className="text-xs text-rose-500 font-semibold italic bg-rose-50 px-2 py-0.5 rounded-md">
                                {i.notes}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>

                      {/* Advance Action Button */}
                      <button
                        onClick={() => advance(kot, activeMaxColumn.next)}
                        className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-md transition-all active:scale-[0.98] ${activeMaxColumn.buttonBg}`}
                      >
                        {activeMaxColumn.actionText}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ) : (
        /* 3. NORMAL 4-COLUMN KANBAN BOARD GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {COLUMNS.map((col) => {
            const ColumnIcon = col.icon;
            const matchingKots = kots.filter((k) => col.statusKeys.includes(k.status));
            const count = matchingKots.length;

            return (
              <div key={col.status} className="flex flex-col h-full">
                {/* Column Header */}
                <div className={`${col.headerBg} p-4 rounded-t-2xl border flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${col.iconBg} flex items-center justify-center shrink-0`}>
                      <ColumnIcon size={16} />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {col.label} ({count})
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Maximize Button for Each Column */}
                    <button
                      type="button"
                      onClick={() => setMaximizedColumn(col.status)}
                      className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-white/80 rounded-lg transition-colors"
                      title={`Maximize ${col.label} Section`}
                    >
                      <Maximize2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Column Body Container */}
                <div className={`bg-white border-x border-b ${col.border} rounded-b-2xl p-4 flex flex-col justify-between flex-1 min-h-[440px] shadow-2xs`}>
                  {count > 0 ? (
                    /* KOT Active Cards List */
                    <div className="space-y-3.5 flex-1 mb-4 overflow-y-auto max-h-[520px] pr-1">
                      {matchingKots.map((kot) => {
                        const kotNum = kot.kotNumber || `#${kot._id?.slice(-4)}`;
                        const tableText = kot.table?.number
                          ? `Table ${kot.table.number}`
                          : kot.orderType || "DINE_IN";

                        return (
                          <div
                            key={kot._id}
                            className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 space-y-3 hover:bg-slate-50 transition-colors shadow-2xs"
                          >
                            {/* Card Top Row */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                {kotNum}
                              </span>
                              <span className="font-bold text-slate-700 bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md border border-orange-100">
                                {tableText}
                              </span>
                            </div>

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
                              onClick={() => advance(kot, col.next)}
                              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] ${col.buttonBg}`}
                            >
                              {col.actionText}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Empty Column State */
                    <div className="flex flex-col items-center justify-center my-auto py-12 text-center">
                      <div className={`w-16 h-16 rounded-full ${col.bubbleBg} flex items-center justify-center mb-3 shadow-inner`}>
                        <ColumnIcon size={28} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">
                        {col.emptyTitle}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-[200px]">
                        {col.emptySubtitle}
                      </p>
                    </div>
                  )}

                  {/* Bottom Footer Info Note */}
                  <div className={`${col.infoBg} p-2.5 rounded-xl border flex items-center justify-between shrink-0 mt-2 text-xs`}>
                    <div className="flex items-center gap-2 truncate">
                      <Info size={14} className="shrink-0" />
                      <span className="truncate">{col.infoNote}</span>
                    </div>
                    <button
                      onClick={() => setMaximizedColumn(col.status)}
                      className="text-[10px] font-extrabold underline hover:text-slate-900 shrink-0 ml-1"
                    >
                      Focus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

