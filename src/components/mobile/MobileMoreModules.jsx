import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Search,
  X,
  UtensilsCrossed,
  ClipboardList,
  Table2,
  ChefHat,
  Utensils,
  Package,
  Truck,
  Users,
  UserCheck,
  Clock,
  CalendarOff,
  Coffee,
  CalendarDays,
  CalendarRange,
  Wallet,
  Coins,
  DollarSign,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const ALL_MODULE_GROUPS = [
  {
    title: "Operations",
    items: [
      {
        id: "pos",
        label: "POS",
        to: "/pos",
        icon: UtensilsCrossed,
        roles: ["OWNER", "MANAGER", "CASHIER", "WAITER"],
        color: "bg-orange-500 text-white",
        bgLight: "bg-orange-50 text-orange-600 border-orange-100",
        description: "Point of Sale billing",
      },
      {
        id: "orders",
        label: "Orders",
        to: "/orders",
        icon: ClipboardList,
        roles: ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"],
        color: "bg-blue-500 text-white",
        bgLight: "bg-blue-50 text-blue-600 border-blue-100",
        description: "Live & past order history",
      },
      {
        id: "tables",
        label: "Tables",
        to: "/tables",
        icon: Table2,
        roles: ["OWNER", "MANAGER", "CASHIER", "WAITER"],
        color: "bg-purple-500 text-white",
        bgLight: "bg-purple-50 text-purple-600 border-purple-100",
        description: "Dining table status & occupancy",
      },
      {
        id: "kitchen",
        label: "Kitchen Display",
        to: "/kitchen",
        icon: ChefHat,
        roles: ["OWNER", "MANAGER", "KITCHEN"],
        color: "bg-emerald-500 text-white",
        bgLight: "bg-emerald-50 text-emerald-600 border-emerald-100",
        description: "Real-time kitchen order tickets",
      },
      {
        id: "menu",
        label: "Menu",
        to: "/menu",
        icon: Utensils,
        roles: ["OWNER", "MANAGER"],
        color: "bg-rose-500 text-white",
        bgLight: "bg-rose-50 text-rose-600 border-rose-100",
        description: "Food menu & items catalog",
      },
      {
        id: "inventory",
        label: "Inventory",
        to: "/inventory",
        icon: Package,
        roles: ["OWNER", "MANAGER"],
        color: "bg-amber-500 text-white",
        bgLight: "bg-amber-50 text-amber-600 border-amber-100",
        description: "Stock levels & ingredients",
      },
      {
        id: "purchases",
        label: "Purchases",
        to: "/purchases",
        icon: Truck,
        roles: ["OWNER", "MANAGER"],
        color: "bg-teal-500 text-white",
        bgLight: "bg-teal-50 text-teal-600 border-teal-100",
        description: "Purchase invoices & orders",
      },
      {
        id: "customers",
        label: "Customers",
        to: "/customers",
        icon: Users,
        roles: ["OWNER", "MANAGER", "CASHIER"],
        color: "bg-sky-500 text-white",
        bgLight: "bg-sky-50 text-sky-600 border-sky-100",
        description: "Customer database & CRM",
      },
    ],
  },
  {
    title: "Staff & HR",
    items: [
      {
        id: "staff",
        label: "Staff",
        to: "/staff",
        icon: UserCheck,
        roles: ["OWNER", "MANAGER"],
        color: "bg-indigo-500 text-white",
        bgLight: "bg-indigo-50 text-indigo-600 border-indigo-100",
        description: "Employee records & roles",
      },
      {
        id: "attendance",
        label: "Attendance",
        to: "/staff/attendance",
        icon: Clock,
        roles: ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"],
        color: "bg-emerald-500 text-white",
        bgLight: "bg-emerald-50 text-emerald-600 border-emerald-100",
        description: "Punches, shifts & work hours",
      },
      {
        id: "leave-mgmt",
        label: "Leave Management",
        to: "/staff/leave-management",
        icon: CalendarOff,
        roles: ["OWNER", "MANAGER"],
        color: "bg-purple-500 text-white",
        bgLight: "bg-purple-50 text-purple-600 border-purple-100",
        description: "Review & approve leave requests",
      },
      {
        id: "my-leave",
        label: "My Leave",
        to: "/staff/leave",
        icon: Coffee,
        roles: ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"],
        color: "bg-amber-500 text-white",
        bgLight: "bg-amber-50 text-amber-600 border-amber-100",
        description: "Balances & leave application",
      },
      {
        id: "holidays",
        label: "Holiday & Off Days",
        to: "/staff/holidays",
        icon: CalendarDays,
        roles: ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"],
        color: "bg-cyan-500 text-white",
        bgLight: "bg-cyan-50 text-cyan-600 border-cyan-100",
        description: "Public holidays & day offs",
      },
      {
        id: "shifts-roster",
        label: "Shifts & Roster",
        to: "/staff/attendance",
        icon: CalendarRange,
        roles: ["OWNER", "MANAGER"],
        color: "bg-blue-500 text-white",
        bgLight: "bg-blue-50 text-blue-600 border-blue-100",
        description: "Team shift scheduling",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        id: "expenses",
        label: "Expenses",
        to: "/expenses",
        icon: Wallet,
        roles: ["OWNER", "MANAGER", "CASHIER"],
        color: "bg-rose-500 text-white",
        bgLight: "bg-rose-50 text-rose-600 border-rose-100",
        description: "Daily business expenses",
      },
      {
        id: "advance",
        label: "Advance",
        to: "/expenses",
        icon: Coins,
        roles: ["OWNER", "MANAGER"],
        color: "bg-amber-500 text-white",
        bgLight: "bg-amber-50 text-amber-600 border-amber-100",
        description: "Staff advances & loans",
      },
      {
        id: "petty-cash",
        label: "Petty Cash",
        to: "/expenses",
        icon: DollarSign,
        roles: ["OWNER", "MANAGER", "CASHIER"],
        color: "bg-teal-500 text-white",
        bgLight: "bg-teal-50 text-teal-600 border-teal-100",
        description: "Small cash purchases",
      },
      {
        id: "vendors",
        label: "Vendors",
        to: "/purchases/suppliers",
        icon: Users,
        roles: ["OWNER", "MANAGER"],
        color: "bg-indigo-500 text-white",
        bgLight: "bg-indigo-50 text-indigo-600 border-indigo-100",
        description: "Supplier contacts & catalog",
      },
      {
        id: "vendor-expenses",
        label: "Vendor Expenses",
        to: "/purchases",
        icon: Truck,
        roles: ["OWNER", "MANAGER"],
        color: "bg-cyan-500 text-white",
        bgLight: "bg-cyan-50 text-cyan-600 border-cyan-100",
        description: "Purchase bills & dues",
      },
      {
        id: "payments",
        label: "Payments",
        to: "/payments",
        icon: Wallet,
        roles: ["OWNER", "MANAGER", "CASHIER"],
        color: "bg-emerald-500 text-white",
        bgLight: "bg-emerald-50 text-emerald-600 border-emerald-100",
        description: "Payment logs & methods",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        id: "reports",
        label: "Reports",
        to: "/reports",
        icon: BarChart3,
        roles: ["OWNER", "MANAGER"],
        color: "bg-blue-600 text-white",
        bgLight: "bg-blue-50 text-blue-600 border-blue-100",
        description: "Sales, GST & inventory reports",
      },
      {
        id: "settings",
        label: "Settings",
        to: "/owner/settings",
        icon: Settings,
        roles: ["OWNER"],
        color: "bg-slate-700 text-white",
        bgLight: "bg-slate-100 text-slate-700 border-slate-200",
        description: "Restaurant profile & taxes",
      },
      {
        id: "audit-logs",
        label: "Audit Logs",
        to: "/owner/audit-logs",
        icon: ShieldCheck,
        roles: ["OWNER"],
        color: "bg-purple-600 text-white",
        bgLight: "bg-purple-50 text-purple-600 border-purple-100",
        description: "System security & audit trails",
      },
    ],
  },
];

export default function MobileMoreModules({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const userRole = user?.role || "OWNER";
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();

    return ALL_MODULE_GROUPS.map((group) => {
      // 1. Role filter
      const allowedItems = group.items.filter((item) => item.roles.includes(userRole));

      // 2. Search filter
      const matchedItems = allowedItems.filter((item) => {
        if (!q) return true;
        return (
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          group.title.toLowerCase().includes(q)
        );
      });

      return {
        ...group,
        items: matchedItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [search, userRole]);

  if (!isOpen) return null;

  const handleSelectModule = (to) => {
    onClose();
    navigate(to);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      <div
        className="w-full bg-slate-50 rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-200/80 px-4 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">More Modules</h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Explore all billing & restaurant tools
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Modules Input */}
        <div className="p-3 bg-white border-b border-slate-200/60 shrink-0">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Modules..."
              className="w-full bg-slate-100 text-slate-800 text-xs rounded-xl pl-9 pr-9 py-2.5 border border-slate-200/80 focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Groups & Modules List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
          {filteredGroups.map((group) => (
            <div key={group.title} className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                  {group.title}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {group.items.length} items
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectModule(item.to)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-orange-300 hover:shadow-xs active:scale-[0.98] transition-all text-left group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${item.color}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors truncate">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search size={22} />
              </div>
              <p className="text-xs font-bold text-slate-600">No modules match your search</p>
              <p className="text-[11px] text-slate-400">Try searching with a different term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
