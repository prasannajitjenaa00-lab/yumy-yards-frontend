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
  Info,
  Clock,
  Maximize2,
  Minimize2,
  X,
  LayoutGrid,
  Radio,
  Monitor,
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
    infoNote: "Orders ready for serving will appear here",
    actionText: "Serve Order ✓",
    darkAccent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
  },
];

export default function KitchenDisplay() {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maximizedColumn, setMaximizedColumn] = useState(null);
  const [liveClock, setLiveClock] = useState("");
  const [isBrowserFs, setIsBrowserFs] = useState(false);

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
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsBrowserFs(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsBrowserFs(false);
    }
  };

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
    <>
      {/* ========================================================================= */}
      {/* 1. TOTAL FULLSCREEN VIEW (COVERS 100% OF THE SCREEN WHEN A SECTION IS EXPANDED) */}
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
                    {kots.filter((k) => activeMaxColumn.statusKeys.includes(k.status)).length} KOTs
                  </span>
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
                const count = kots.filter((k) => col.statusKeys.includes(k.status)).length;
                return (
                  <button
                    key={col.status}
                    type="button"
                    onClick={() => setMaximizedColumn(col.status)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{col.label} ({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Live Clock & Exit Controls */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Live Kitchen Clock */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl text-slate-200 font-mono font-bold text-xs shadow-inner">
                <Clock size={15} className="text-orange-400" />
                <span>{liveClock}</span>
              </div>

              {/* Toggle Native Hardware Fullscreen (F11) */}
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
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-700">
            {(() => {
              const matchingKots = kots.filter((k) => activeMaxColumn.statusKeys.includes(k.status));
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
                    const tableText = kot.table?.number
                      ? `Table ${kot.table.number}`
                      : kot.orderType || "DINE_IN";
                    const formattedTime = kot.createdAt
                      ? new Date(kot.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Just now";

                    return (
                      <div
                        key={kot._id}
                        className="bg-slate-900 border-2 border-slate-800 hover:border-orange-500/70 rounded-3xl p-5 flex flex-col justify-between shadow-2xl transition-all group"
                      >
                        <div className="space-y-3.5">
                          {/* Card Header */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-black text-white text-base bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-xl shadow-xs">
                              {kotNum}
                            </span>
                            <span className="font-extrabold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-xl text-xs">
                              {tableText}
                            </span>
                          </div>

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
                            onClick={() => advance(kot, activeMaxColumn.next)}
                            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-xl active:scale-[0.98] transition-all cursor-pointer ${activeMaxColumn.buttonBg}`}
                          >
                            {activeMaxColumn.actionText}
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
      {/* 2. REGULAR DESKTOP & MOBILE KITCHEN VIEW (WITH CLICK-TO-TOTAL-SCREEN CAPABILITY) */}
      {/* ========================================================================= */}
      <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          {/* Left Title */}
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs">
              <ChefHat size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kitchen Display</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Live kitchen orders • Faster service • Click any section to cover total screen
              </p>
            </div>
          </div>

          {/* Section View Pills & Maximize Toggles */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 relative z-10">
            <button
              type="button"
              onClick={() => setMaximizedColumn(null)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-orange-500 text-white shadow-sm cursor-pointer"
            >
              <LayoutGrid size={14} />
              <span>All Sections (4 Col)</span>
            </button>

            {COLUMNS.map((col) => {
              const Icon = col.icon;
              const count = kots.filter((k) => col.statusKeys.includes(k.status)).length;
              return (
                <button
                  key={col.status}
                  type="button"
                  onClick={() => setMaximizedColumn(col.status)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-white border border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 cursor-pointer shadow-2xs"
                  title={`Open ${col.label} in Total Screen`}
                >
                  <Icon size={14} />
                  <span>
                    {col.label} ({count})
                  </span>
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

        {/* 4-COLUMN KANBAN BOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {COLUMNS.map((col) => {
            const ColumnIcon = col.icon;
            const matchingKots = kots.filter((k) => col.statusKeys.includes(k.status));
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
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {col.label} ({count})
                    </h3>
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
                  {count > 0 ? (
                    /* KOT Active Cards List */
                    <div className="space-y-3.5 flex-1 mb-4 overflow-y-auto max-h-[520px] pr-1 scrollbar-thin scrollbar-thumb-slate-200">
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
                              type="button"
                              onClick={() => advance(kot, col.next)}
                              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer ${col.buttonBg}`}
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
                      <div
                        className={`w-16 h-16 rounded-full ${col.bubbleBg} flex items-center justify-center mb-3 shadow-inner`}
                      >
                        <ColumnIcon size={28} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">{col.emptyTitle}</h4>
                      <p className="text-xs text-slate-400 max-w-[200px]">{col.emptySubtitle}</p>
                    </div>
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
    </>
  );
}
