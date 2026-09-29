import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Search,
  Users,
  Info,
} from "lucide-react";

const ROLE_INFO = {
  OWNER: {
    title: "Owner / Administrator",
    badge: "bg-red-100 text-red-700 border-red-200",
    desc: "Complete, unrestricted access to restaurant operations, financials, settings, staff, and audit trails.",
    level: "Full Access",
  },
  MANAGER: {
    title: "Restaurant Manager",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    desc: "Operational management: orders, menu, inventory, purchases, staff attendance, leave approval, and reports.",
    level: "High Management",
  },
  CASHIER: {
    title: "Cashier",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    desc: "POS billing, table orders, customer management, payment collection, and personal attendance.",
    level: "Billing Access",
  },
  WAITER: {
    title: "Captain / Waiter",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    desc: "Table occupancy, taking new dine-in orders, viewing order statuses, and attendance tracking.",
    level: "Service Access",
  },
  KITCHEN: {
    title: "Kitchen Staff / Chef",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    desc: "Kitchen Display System (KDS), updating KOT status (Preparing, Ready), and attendance tracking.",
    level: "Kitchen Access",
  },
};

const PERMISSIONS = [
  // Operations & POS
  { id: "pos", name: "POS & Billing", category: "Operations", roles: ["OWNER", "MANAGER", "CASHIER", "WAITER"] },
  { id: "orders", name: "Order Management & Details", category: "Operations", roles: ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"] },
  { id: "tables", name: "Table Status & Assignment", category: "Operations", roles: ["OWNER", "MANAGER", "CASHIER", "WAITER"] },
  { id: "kitchen", name: "Kitchen Display (KDS)", category: "Operations", roles: ["OWNER", "MANAGER", "KITCHEN"] },

  // Catalog & Inventory
  { id: "menu", name: "Menu & Item Pricing", category: "Menu & Inventory", roles: ["OWNER", "MANAGER"] },
  { id: "inventory", name: "Inventory Stock & Wastage", category: "Menu & Inventory", roles: ["OWNER", "MANAGER"] },
  { id: "purchases", name: "Purchases & Invoices", category: "Menu & Inventory", roles: ["OWNER", "MANAGER"] },
  { id: "suppliers", name: "Vendor & Supplier Catalog", category: "Menu & Inventory", roles: ["OWNER", "MANAGER"] },

  // Staff & HR
  { id: "staff", name: "Staff Account Creation & Edit", category: "Staff & HR", roles: ["OWNER", "MANAGER"] },
  { id: "attendance", name: "Attendance Marking & History", category: "Staff & HR", roles: ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"] },
  { id: "leave_mgmt", name: "Leave Approval & Balances", category: "Staff & HR", roles: ["OWNER", "MANAGER"] },
  { id: "my_leave", name: "Self-Service Leave Application", category: "Staff & HR", roles: ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"] },
  { id: "holidays", name: "Holiday & Off Days Calendar", category: "Staff & HR", roles: ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"] },

  // Finance & Accounting
  { id: "expenses", name: "Expense Logging & Petty Cash", category: "Finance", roles: ["OWNER", "MANAGER", "CASHIER"] },
  { id: "payments", name: "Payment Receipts & Settle Bills", category: "Finance", roles: ["OWNER", "MANAGER", "CASHIER"] },
  { id: "customers", name: "Customer CRM & History", category: "Finance", roles: ["OWNER", "MANAGER", "CASHIER"] },

  // Admin & Reports
  { id: "reports", name: "Sales & GST Analytics Reports", category: "Administration", roles: ["OWNER", "MANAGER"] },
  { id: "settings", name: "Store Settings & Tax Config", category: "Administration", roles: ["OWNER"] },
  { id: "audit", name: "Security Audit Logs", category: "Administration", roles: ["OWNER"] },
];

export default function RolePermissionsModal({ isOpen, onClose }) {
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const rolesList = ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"];

  const filteredPermissions = PERMISSIONS.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  // Group by category
  const categories = Array.from(new Set(filteredPermissions.map((p) => p.category)));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-purple-300 border border-white/20 flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Role & Access Permissions</h2>
              <p className="text-xs text-purple-200">
                Authoritative permission matrix for all system roles
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Cards Overview */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedRole("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedRole === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              All Roles Matrix
            </button>
            {rolesList.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedRole === role
                    ? "bg-orange-500 text-white shadow-2xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {selectedRole !== "ALL" && ROLE_INFO[selectedRole] && (
            <div className="mt-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between gap-3 animate-in fade-in">
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {ROLE_INFO[selectedRole].title}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {ROLE_INFO[selectedRole].desc}
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${ROLE_INFO[selectedRole].badge}`}
              >
                {ROLE_INFO[selectedRole].level}
              </span>
            </div>
          )}
        </div>

        {/* Filter Input */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter permission by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Permissions Table Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {categories.map((category) => {
            const items = filteredPermissions.filter((p) => p.category === category);
            return (
              <div
                key={category}
                className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs overflow-hidden"
              >
                <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800 border-b border-slate-200/60 dark:border-slate-700 text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {category}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.name}
                        </span>
                      </div>

                      {/* Role access tags or checks */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {rolesList.map((r) => {
                          const hasAccess = item.roles.includes(r);
                          if (selectedRole !== "ALL" && selectedRole !== r) return null;

                          return (
                            <span
                              key={r}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                                hasAccess
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200/60 dark:border-slate-700"
                              }`}
                            >
                              {hasAccess ? (
                                <CheckCircle2 size={11} className="text-emerald-500" />
                              ) : (
                                <XCircle size={11} className="text-slate-400" />
                              )}
                              <span>{r}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Info size={14} className="text-orange-500" />
            <span>Role permissions are enforced authoritatively by backend API middleware.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-2xs hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
