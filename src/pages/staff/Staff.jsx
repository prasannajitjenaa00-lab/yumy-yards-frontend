import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Lock,
  Activity,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const ROLES = ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"];

const ROLE_BADGES = {
  OWNER: "bg-rose-50 text-rose-700 border-rose-200",
  MANAGER: "bg-amber-50 text-amber-700 border-amber-200",
  CASHIER: "bg-purple-50 text-purple-700 border-purple-200",
  WAITER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  KITCHEN: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function Staff() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Form State
  const [showPanel, setShowPanel] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "WAITER",
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    api
      .get("/users")
      .then((r) => setUsers(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || (!editingId && !form.password)) {
      return toast.error("Name, email, and password are required");
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        toast.success("Staff profile updated");
      } else {
        const res = await api.post("/users", form);
        await api.post("/staff", { user: res.data.data._id, salary: 0 }).catch(() => {});
        toast.success("Staff account created");
      }

      setForm({ name: "", email: "", phone: "", password: "", role: "WAITER", isActive: true });
      setEditingId(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save staff");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (u) => {
    setEditingId(u._id);
    setForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      password: "",
      role: u.role || "WAITER",
      isActive: u.isActive !== false,
    });
    setShowPanel(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff account?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("Staff account deleted");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  // Metrics
  const totalStaffCount = users.length;
  const activeStaffCount = users.filter((u) => u.isActive !== false).length;
  const inactiveStaffCount = users.filter((u) => u.isActive === false).length;
  const rolesCount = ROLES.length;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;

      let matchStatus = true;
      if (statusFilter === "ACTIVE") matchStatus = u.isActive !== false;
      if (statusFilter === "INACTIVE") matchStatus = u.isActive === false;

      const query = searchQuery.toLowerCase();
      const matchSearch =
        !query ||
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.role?.toLowerCase().includes(query);

      return matchRole && matchStatus && matchSearch;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage your team, roles and permissions</p>
          </div>
        </div>

        {/* Center Banner Graphic Accent */}
        <div className="hidden xl:flex items-center gap-3 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none opacity-90">
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop"
            alt="Restaurant Team"
            className="w-36 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
          />
          <div className="px-3.5 py-1 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold rounded-full italic">
            Great Team Better Service
          </div>
        </div>

        {/* Right Side Card Accent */}
        <div className="hidden md:block relative z-10">
          <div className="bg-orange-50/80 border border-orange-100 px-3.5 py-1.5 rounded-xl text-xs text-slate-800">
            <div className="font-extrabold">Happy Staff</div>
            <div className="text-[10px] font-bold text-orange-600">Better Food • Happier Customers</div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-[#fff7ed] border border-orange-100 p-4 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-none">{totalStaffCount}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Staff</div>
          </div>
        </div>

        {/* Active Staff */}
        <div className="bg-[#f0fdf4] border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck size={18} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-none">{activeStaffCount}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">Active Staff</div>
          </div>
        </div>

        {/* Inactive Staff */}
        <div className="bg-[#fff1f2] border border-rose-100 p-4 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
            <UserX size={18} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-none">{inactiveStaffCount}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">Inactive Staff</div>
          </div>
        </div>

        {/* Roles */}
        <div className="bg-[#eff6ff] border border-blue-100 p-4 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 leading-none">{rolesCount}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">Roles</div>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Workspace (Left 8 Cols Table + Right 4 Cols Add Staff Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Staff Table & Toolbar (8 Cols) */}
        <div className={showPanel ? "lg:col-span-8 space-y-4" : "lg:col-span-12 space-y-4"}>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none font-medium"
              />
            </div>

            {/* Dropdowns & Add Button */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <button
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", email: "", phone: "", password: "", role: "WAITER", isActive: true });
                  setShowPanel(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Staff</span>
              </button>
            </div>
          </div>

          {/* Staff Data Table Container */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[380px]">
            {!loading && filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">#</th>
                      <th className="py-3.5 px-4">Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Last Login</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u, idx) => {
                      const initial = u.name ? u.name[0].toUpperCase() : "S";
                      const roleBadge = ROLE_BADGES[u.role] || "bg-slate-100 text-slate-700 border-slate-200";
                      const isActive = u.isActive !== false;

                      return (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-400">{idx + 1}</td>

                          {/* Avatar & Name */}
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
                                {initial}
                              </div>
                              <span className="truncate">{u.name}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 font-medium">{u.email}</td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${roleBadge}`}>
                              {u.role}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 font-medium text-[11px]">
                            18 Sep 2026 10:24 AM
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEdit(u)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                title="Edit Staff"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(u._id)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                title="Delete Staff"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <Users size={40} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No staff members found</p>
                <p className="text-xs text-slate-500">Try changing your search query or role filter.</p>
              </div>
            )}
          </div>

          {/* Bottom Action Cards (2 Cards Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Role Permissions */}
            <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-2xs hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">Role Permissions</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Manage what each role can access</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Card 2: Staff Activity */}
            <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-2xs hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">Staff Activity</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">View login history and actions</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* RIGHT: Add / Edit Staff Slide Panel (4 Cols) */}
        {showPanel && (
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? "Edit Staff Member" : "Add New Staff"}
              </h3>
              <button onClick={() => setShowPanel(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none font-medium"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none font-medium"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-medium"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password {!editingId && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none font-medium"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingId}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Role <span className="text-rose-500">*</span>
                </label>
                <select
                  className="w-full bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                >
                  <option value="">Select role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  className="w-full bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={form.isActive ? "ACTIVE" : "INACTIVE"}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === "ACTIVE" })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <Plus size={16} />
                  <span>{submitting ? "Saving..." : editingId ? "Update Staff" : "Add Staff"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
