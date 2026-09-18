  import React, { useState, useEffect, useRef, useMemo } from "react";
  import { NavLink, Outlet, useNavigate } from "react-router-dom";
  import { useDispatch, useSelector } from "react-redux";
  import {
    LayoutDashboard,
    UtensilsCrossed,
    ClipboardList,
    Table2,
    ChefHat,
    Package,
    Truck,
    Users,
    Wallet,
    BarChart3,
    Settings,
    LogOut,
    ShieldCheck,
    UserCheck,
    Search,
    Bell,
    Moon,
    Sun,
    ChevronDown,
    Menu as MenuIcon,
    X,
    HelpCircle,
    ChevronRight,
    Flame,
    Utensils,
  } from "lucide-react";
  import { clearCredentials } from "../store/slices/authSlice";
  import { logout as logoutApi } from "../services/authService";
  import { toast } from "react-toastify";

  const NAV_BY_ROLE = {
    OWNER: [
      { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/pos", label: "POS", icon: UtensilsCrossed },
      { to: "/orders", label: "Orders", icon: ClipboardList },
      { to: "/tables", label: "Tables", icon: Table2 },
      { to: "/kitchen", label: "Kitchen Display", icon: ChefHat },
      { to: "/menu", label: "Menu", icon: UtensilsCrossed },
      { to: "/inventory", label: "Inventory", icon: Package },
      { to: "/purchases", label: "Purchases", icon: Truck },
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/staff", label: "Staff", icon: UserCheck },
      { to: "/expenses", label: "Expenses", icon: Wallet },
      { to: "/reports", label: "Reports", icon: BarChart3 },
      { to: "/owner/settings", label: "Settings", icon: Settings },
      { to: "/owner/audit-logs", label: "Audit Logs", icon: ShieldCheck },
    ],
    MANAGER: [
      { to: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/pos", label: "POS", icon: UtensilsCrossed },
      { to: "/orders", label: "Orders", icon: ClipboardList },
      { to: "/tables", label: "Tables", icon: Table2 },
      { to: "/kitchen", label: "Kitchen Display", icon: ChefHat },
      { to: "/menu", label: "Menu", icon: UtensilsCrossed },
      { to: "/inventory", label: "Inventory", icon: Package },
      { to: "/purchases", label: "Purchases", icon: Truck },
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/staff", label: "Staff", icon: UserCheck },
      { to: "/expenses", label: "Expenses", icon: Wallet },
      { to: "/reports", label: "Reports", icon: BarChart3 },
    ],
    CASHIER: [
      { to: "/cashier/pos", label: "POS", icon: UtensilsCrossed },
      { to: "/orders", label: "Orders", icon: ClipboardList },
      { to: "/tables", label: "Tables", icon: Table2 },
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/payments", label: "Payments", icon: Wallet },
    ],
    WAITER: [
      { to: "/waiter/orders", label: "Orders", icon: ClipboardList },
      { to: "/tables", label: "Tables", icon: Table2 },
      { to: "/pos", label: "New Order", icon: UtensilsCrossed },
    ],
    KITCHEN: [
      { to: "/kitchen", label: "Kitchen Display", icon: ChefHat },
    ],
  };

  export default function MainLayout() {
    const { user } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const nav = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.OWNER;
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
      try {
        await logoutApi();
      } catch (e) {
        /* ignore */
      }
      dispatch(clearCredentials());
      toast.info("Logged out");
      navigate("/login");
    };

    return (
      <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
        {/* Mobile Backdrop Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Sidebar Brand Header */}
          <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <Flame size={22} className="fill-white" />
              </div>
              <div>
                <div className="text-base font-bold text-white tracking-tight">Yummy Yards</div>
                <div className="text-[11px] font-medium text-slate-400">Pro Billing Centre</div>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation List */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/25"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer: Promo Banner, Support Card & Logout */}
          <div className="p-3 border-t border-slate-800/80 space-y-2.5">
            {/* Promo Business Card */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 relative overflow-hidden flex items-center justify-between">
              <div className="pr-2">
                <div className="text-xs font-bold text-white">Good Food</div>
                <div className="text-[11px] font-semibold text-orange-400">Brighter Business</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Serve Better. Grow Faster.</div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop"
                alt="Food Promo"
                className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
              />
            </div>

            {/* Need Help Card */}
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between group hover:bg-slate-800 transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <HelpCircle size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Need Help?</div>
                  <div className="text-[10px] text-slate-400">We're here to support you</div>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/60 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 border border-slate-700/60 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-6 space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  import { getBillRequests, processBill } from "../services/orderService";
  import { getSocket } from "../socket/socketClient";

  function TopBar({ onMenuClick }) {
    const { user } = useSelector((s) => s.auth);
    const navigate = useNavigate();
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [billRequests, setBillRequests] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [filter, setFilter] = useState("Pending");
    const [search, setSearch] = useState("");

    const loadBillRequests = async () => {
      try {
        const res = await getBillRequests();
        setBillRequests(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        /* ignore */
      }
    };

    useEffect(() => {
      if (["OWNER", "MANAGER", "CASHIER"].includes(user?.role)) {
        loadBillRequests();

        const socket = getSocket();
        if (socket) {
          socket.on("bill:request", (data) => {
            toast.info(`🔔 New Bill Request: Table ${data.tableNumber || "N/A"} (₹${data.grandTotal})`, {
              autoClose: 6000,
            });
            loadBillRequests();
          });
          socket.on("table:update", loadBillRequests);
          socket.on("payment:new", loadBillRequests);
          socket.on("bill:processing", loadBillRequests);
        }

        return () => {
          if (socket) {
            socket.off("bill:request");
            socket.off("table:update");
            socket.off("payment:new");
            socket.off("bill:processing");
          }
        };
      }
    }, [user]);

    // Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setShowNotifications(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Ctrl + K shortcut to focus search input
    useEffect(() => {
      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const pendingRequests = useMemo(() => {
      return billRequests.filter((r) => r.billStatus === "REQUESTED" || r.billStatus === "PROCESSING");
    }, [billRequests]);

    const filteredRequests = useMemo(() => {
      return billRequests.filter((r) => {
        const matchFilter =
          filter === "All" ||
          (filter === "Pending" && (r.billStatus === "REQUESTED" || r.billStatus === "PROCESSING")) ||
          (filter === "Processing" && r.billStatus === "PROCESSING") ||
          (filter === "Generated" && r.billStatus === "GENERATED") ||
          (filter === "Paid" && r.billStatus === "PAID");

        const orderNum = (r.orderNumber || "").toLowerCase();
        const tblNum = String(r.table?.number || "").toLowerCase();
        const cust = (r.customer?.name || "").toLowerCase();
        const q = search.toLowerCase();

        const matchSearch = !search || orderNum.includes(q) || tblNum.includes(q) || cust.includes(q);
        return matchFilter && matchSearch;
      });
    }, [billRequests, filter, search]);

    const handleProcessBillClick = async (orderId) => {
      try {
        await processBill(orderId);
        toast.info("Opening order for processing...");
        setShowNotifications(false);
        navigate(`/orders/${orderId}`);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to process bill");
      }
    };

    const avatarInitial = user?.name ? user.name[0].toUpperCase() : "R";
    const userRole = user?.role || "OWNER";

    return (
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shrink-0 shadow-xs">
        {/* Left: Mobile Toggle & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open Sidebar"
          >
            <MenuIcon size={20} />
          </button>

          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search menu items, categories, orders..."
              className="w-full bg-slate-100/80 text-slate-800 text-xs rounded-xl pl-9 pr-16 py-2 border border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
            />
            <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
              Ctrl + K
            </kbd>
          </div>
        </div>

        {/* Right: Notifications, Theme Switch, Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-4 relative" ref={dropdownRef}>
          {/* Notification Bell with Badge */}
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Bell size={18} />
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full ring-2 ring-white animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>

          {/* Bill Requests Notification Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 overflow-hidden space-y-3 p-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center font-bold">
                    🔔
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">BILL REQUESTS</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Real-time table billing notifications</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {pendingRequests.length} Pending
                </span>
              </div>

              {/* Filter Pills & Search */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold text-slate-600">
                  {["Pending", "All", "Processing", "Generated", "Paid"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                        filter === tab
                          ? "bg-orange-500 text-white shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Search table or order..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Requests List */}
              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
                {filteredRequests.map((req) => (
                  <div key={req._id} className="pt-2.5 first:pt-0 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-900">
                          {req.table ? `Table ${req.table.number}` : "Takeaway / Delivery"}
                        </span>
                        <p className="text-[10px] font-mono font-bold text-orange-600">{req.orderNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900">₹{req.grandTotal}</span>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {req.items?.length || 1} Item(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span>Requested by: <strong className="text-slate-800">{req.billRequestedBy?.name || req.createdBy?.name || "Waiter"}</strong></span>
                      <span>{req.billRequestedAt ? new Date(req.billRequestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate(`/orders/${req._id}`);
                        }}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-1.5 rounded-lg text-center transition-all"
                      >
                        View Order
                      </button>
                      <button
                        onClick={() => handleProcessBillClick(req._id)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] py-1.5 rounded-lg text-center shadow-2xs transition-all"
                      >
                        Process Bill
                      </button>
                    </div>
                  </div>
                ))}

                {filteredRequests.length === 0 && (
                  <div className="py-8 text-center text-slate-400 space-y-1">
                    <p className="text-xs font-bold text-slate-600">No bill requests</p>
                    <p className="text-[10px]">Pending table billing notifications will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors hidden sm:flex"
          >
            {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 pl-1 cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center shrink-0 border border-orange-200 shadow-xs">
              {avatarInitial}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors">
                {user?.name || "Restaurant Owner"}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {userRole}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors hidden sm:block" />
          </div>
        </div>
      </header>
    );
  }

