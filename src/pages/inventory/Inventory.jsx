import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import {
  Package,
  Plus,
  Search,
  Upload,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Pencil,
  Trash2,
  ChevronLeft,
  X,
  RefreshCw,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";

const ITEM_IMAGES = {
  paneer: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=100&auto=format&fit=crop",
  sugar: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=100&auto=format&fit=crop",
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop",
  chicken: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=100&auto=format&fit=crop",
  milk: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&auto=format&fit=crop",
  tomatoes: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&auto=format&fit=crop",
  onions: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=100&auto=format&fit=crop",
  flour: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop",
  oil: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop",
};

function getItemImg(name) {
  const lower = (name || "").toLowerCase();
  for (const [k, url] of Object.entries(ITEM_IMAGES)) {
    if (lower.includes(k)) return url;
  }
  return "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop";
}

function getItemCategory(name) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("paneer") || lower.includes("milk") || lower.includes("cheese") || lower.includes("butter")) return "Dairy";
  if (lower.includes("chicken") || lower.includes("mutton") || lower.includes("fish") || lower.includes("meat")) return "Meat & Seafood";
  if (lower.includes("tomato") || lower.includes("onion") || lower.includes("potato") || lower.includes("chili") || lower.includes("garlic")) return "Vegetables";
  if (lower.includes("rice") || lower.includes("flour") || lower.includes("wheat") || lower.includes("dal")) return "Grains";
  if (lower.includes("salt") || lower.includes("sugar") || lower.includes("oil") || lower.includes("spice")) return "Spices & Pantry";
  return "Others";
}

function getExpiryInfo(expiryDate) {
  if (!expiryDate) return { status: "NONE", label: "No Expiry", days: null };
  const exp = new Date(expiryDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formattedDate = exp.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  if (diffDays < 0) {
    return {
      status: "EXPIRED",
      label: `Expired (${Math.abs(diffDays)}d ago)`,
      formattedDate,
      days: diffDays,
      badgeStyle: "bg-rose-100 text-rose-800 border-rose-300 font-bold",
    };
  } else if (diffDays === 0) {
    return {
      status: "EXPIRES_TODAY",
      label: "Expires Today!",
      formattedDate,
      days: 0,
      badgeStyle: "bg-red-100 text-red-800 border-red-300 font-bold animate-pulse",
    };
  } else if (diffDays <= 3) {
    return {
      status: "EXPIRING_CRITICAL",
      label: `Expires in ${diffDays}d`,
      formattedDate,
      days: diffDays,
      badgeStyle: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
    };
  } else if (diffDays <= 7) {
    return {
      status: "EXPIRING_SOON",
      label: `Expires in ${diffDays}d`,
      formattedDate,
      days: diffDays,
      badgeStyle: "bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold",
    };
  } else {
    return {
      status: "VALID",
      label: formattedDate,
      formattedDate,
      days: diffDays,
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
    };
  }
}

function addDaysToDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add Item Modal & Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    unit: "kg",
    minimumStock: 5,
    purchasePrice: 0,
    currentStock: 0,
    expiryDate: "",
  });

  // Edit Item Modal & Form
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    unit: "kg",
    minimumStock: 5,
    purchasePrice: 0,
    currentStock: 0,
    expiryDate: "",
  });

  // Adjust Stock Modal & Form
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjust, setAdjust] = useState({ itemId: "", type: "ADJUSTMENT", quantity: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadInventory = () => {
    setLoading(true);
    api
      .get("/inventory", { params: { limit: 200 } })
      .then((r) => setItems(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.unit) return toast.error("Item name and unit are required");
    setSubmitting(true);
    try {
      await api.post("/inventory", {
        ...form,
        minimumStock: Number(form.minimumStock) || 0,
        purchasePrice: Number(form.purchasePrice) || 0,
        currentStock: Number(form.currentStock) || 0,
        expiryDate: form.expiryDate ? new Date(form.expiryDate) : null,
      });
      toast.success("Inventory product added with expiry date");
      setForm({ name: "", unit: "kg", minimumStock: 5, purchasePrice: 0, currentStock: 0, expiryDate: "" });
      setShowAddModal(false);
      loadInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name || "",
      unit: item.unit || "kg",
      minimumStock: item.minimumStock || 0,
      purchasePrice: item.purchasePrice || 0,
      currentStock: item.currentStock || 0,
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "",
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.unit) return toast.error("Item name and unit are required");
    setSubmitting(true);
    try {
      await api.put(`/inventory/${editingItem._id}`, {
        ...editForm,
        minimumStock: Number(editForm.minimumStock) || 0,
        purchasePrice: Number(editForm.purchasePrice) || 0,
        currentStock: Number(editForm.currentStock) || 0,
        expiryDate: editForm.expiryDate ? new Date(editForm.expiryDate) : null,
      });
      toast.success("Item updated successfully");
      setShowEditModal(false);
      loadInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!adjust.itemId || !adjust.quantity) return toast.error("Select an item and enter quantity");
    setSubmitting(true);
    try {
      await api.post("/inventory/adjust", { ...adjust, quantity: Number(adjust.quantity) });
      toast.success("Stock adjusted successfully");
      setAdjust({ itemId: "", type: "ADJUSTMENT", quantity: "", notes: "" });
      setShowAdjustModal(false);
      loadInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Adjustment failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const totalItems = items.length;
  const lowStockItems = items.filter((i) => i.currentStock > 0 && i.currentStock <= i.minimumStock).length;
  const outOfStockItems = items.filter((i) => i.currentStock <= 0).length;
  const expiredItems = items.filter((i) => {
    if (!i.expiryDate || i.currentStock <= 0) return false;
    const expInfo = getExpiryInfo(i.expiryDate);
    return expInfo.status === "EXPIRED" || expInfo.status === "EXPIRES_TODAY";
  }).length;
  const expiringSoonItems = items.filter((i) => {
    if (!i.expiryDate || i.currentStock <= 0) return false;
    const expInfo = getExpiryInfo(i.expiryDate);
    return expInfo.status === "EXPIRING_CRITICAL" || expInfo.status === "EXPIRING_SOON";
  }).length;

  const filteredItems = useMemo(() => {
    return items
      .filter((i) => {
        const cat = getItemCategory(i.name);
        const matchCategory = selectedCategory === "ALL" || cat === selectedCategory;

        const isLow = i.currentStock > 0 && i.currentStock <= i.minimumStock;
        const isOut = i.currentStock <= 0;
        const expInfo = getExpiryInfo(i.expiryDate);

        let matchStatus = true;
        if (statusFilter === "LOW") matchStatus = isLow;
        if (statusFilter === "OUT") matchStatus = isOut;
        if (statusFilter === "OK") matchStatus = !isLow && !isOut;
        if (statusFilter === "EXPIRED") matchStatus = expInfo.status === "EXPIRED" || expInfo.status === "EXPIRES_TODAY";
        if (statusFilter === "EXPIRING_SOON") matchStatus = expInfo.status === "EXPIRING_CRITICAL" || expInfo.status === "EXPIRING_SOON" || expInfo.status === "EXPIRES_TODAY";

        const matchSearch = !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase());

        return matchCategory && matchStatus && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "stock") return a.currentStock - b.currentStock;
        if (sortBy === "expiry") {
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        }
        return 0;
      });
  }, [items, selectedCategory, statusFilter, searchQuery, sortBy]);

  // Paginated List
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory & Expiry Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">Track ingredients, monitor stock levels, and prevent product expiry wastage</p>
          </div>
        </div>

        {/* Center Banner Graphic Accent */}
        <div className="hidden xl:flex items-center gap-3 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none opacity-90">
          <img
            src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop"
            alt="Fresh Ingredients"
            className="w-36 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
          />
          <div className="px-3 py-1 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold rounded-full italic">
            Fresh Ingredients Better Food
          </div>
        </div>

        {/* Right Side Card Accent */}
        <div className="hidden md:block relative z-10">
          <div className="bg-orange-50/80 border border-orange-100 px-3.5 py-1.5 rounded-xl text-xs">
            <div className="font-extrabold text-slate-900">Zero Wastage Quality</div>
            <div className="text-[10px] font-bold text-orange-600">Fresh Food Everyday!</div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards & Right Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* KPI Cards (5 metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
          {/* Total Items */}
          <div
            onClick={() => { setStatusFilter("ALL"); setCurrentPage(1); }}
            className="bg-[#f0fdf4] border border-emerald-100 p-3 rounded-2xl flex items-center justify-between shadow-2xs group cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                <Package size={17} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900 leading-none">{totalItems}</div>
                <div className="text-[10px] font-semibold text-slate-500 mt-1">Total Items</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Low Stock Items */}
          <div
            onClick={() => { setStatusFilter("LOW"); setCurrentPage(1); }}
            className="bg-[#fffbeb] border border-amber-100 p-3 rounded-2xl flex items-center justify-between shadow-2xs group cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={17} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900 leading-none">{lowStockItems}</div>
                <div className="text-[10px] font-semibold text-slate-500 mt-1">Low Stock</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Expiring Soon */}
          <div
            onClick={() => { setStatusFilter("EXPIRING_SOON"); setCurrentPage(1); }}
            className="bg-[#fff7ed] border border-orange-200 p-3 rounded-2xl flex items-center justify-between shadow-2xs group cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
                <Clock size={17} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-orange-700 leading-none">{expiringSoonItems}</div>
                <div className="text-[10px] font-semibold text-orange-600 mt-1">Expiring ≤ 7d</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-orange-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Expired Items */}
          <div
            onClick={() => { setStatusFilter("EXPIRED"); setCurrentPage(1); }}
            className="bg-[#fef2f2] border border-red-200 p-3 rounded-2xl flex items-center justify-between shadow-2xs group cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle size={17} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-red-700 leading-none">{expiredItems}</div>
                <div className="text-[10px] font-semibold text-red-600 mt-1">Expired</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-red-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Out of Stock */}
          <div
            onClick={() => { setStatusFilter("OUT"); setCurrentPage(1); }}
            className="bg-[#fff1f2] border border-rose-100 p-3 rounded-2xl flex items-center justify-between shadow-2xs group cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle size={17} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900 leading-none">{outOfStockItems}</div>
                <div className="text-[10px] font-semibold text-slate-500 mt-1">Out of Stock</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowAdjustModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>Stock Adjustment</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({ name: "", unit: "kg", minimumStock: 5, purchasePrice: 0, currentStock: 0, expiryDate: "" });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-3 rounded-xl text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 3. Category Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
        {[
          "ALL",
          "Raw Materials",
          "Spices & Pantry",
          "Dairy",
          "Vegetables",
          "Meat & Seafood",
          "Beverages",
          "Others",
        ].map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isSelected
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>{cat === "ALL" ? "All Items" : cat}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none shadow-2xs font-medium"
          />
        </div>

        {/* Dropdowns: Status, Expiry Filter, Sort By */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Status / Expiry</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Items</option>
              <option value="OK">In Stock (OK)</option>
              <option value="LOW">Low Stock</option>
              <option value="OUT">Out of Stock</option>
              <option value="EXPIRING_SOON">⚠️ Expiring Soon (≤7d)</option>
              <option value="EXPIRED">🔴 Expired</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="name">Name (A-Z)</option>
              <option value="stock">Current Stock</option>
              <option value="expiry">Expiry Date (Earliest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Inventory Data Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between min-h-[420px]">
        {!loading && paginatedItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  </th>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Min Stock</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map((item, idx) => {
                  const rowIndex = (currentPage - 1) * pageSize + idx + 1;
                  const cat = getItemCategory(item.name);
                  const imgUrl = getItemImg(item.name);
                  const isLow = item.currentStock > 0 && item.currentStock <= item.minimumStock;
                  const isOut = item.currentStock <= 0;
                  const expInfo = getExpiryInfo(item.expiryDate);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center">
                        <input type="checkbox" className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-400">{rowIndex}</td>

                      {/* Item Thumbnail + Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgUrl}
                            alt={item.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                          />
                          <div>
                            <span className="truncate block font-bold text-slate-900">{item.name}</span>
                            {item.purchasePrice > 0 && (
                              <span className="text-[10px] text-slate-400 font-normal">₹{item.purchasePrice} / {item.unit}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">{cat}</td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isOut ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                          <span>{item.currentStock}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-semibold">{item.minimumStock}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{item.unit}</td>

                      {/* Expiry Date Column */}
                      <td className="py-3.5 px-4">
                        {item.expiryDate ? (
                          <div className="space-y-0.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${expInfo.badgeStyle}`}>
                              <Calendar size={10} />
                              {expInfo.label}
                            </span>
                            <div className="text-[9px] text-slate-400 font-mono pl-1">{expInfo.formattedDate}</div>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Edit Product & Expiry"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setAdjust({ itemId: item._id, type: "ADJUSTMENT", quantity: "", notes: "" });
                              setShowAdjustModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors"
                            title="Adjust Stock"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${item.name}?`)) {
                                api.delete(`/inventory/${item._id}`).then(loadInventory);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete Item"
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
            <Package size={40} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No inventory items found</p>
            <p className="text-xs text-slate-500">Try changing your search query or status filter.</p>
          </div>
        )}

        {/* 6. Footer Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{paginatedItems.length}</span> of{" "}
            <span className="font-bold text-slate-800">{filteredItems.length}</span> items
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === i + 1
                    ? "bg-orange-500 text-white shadow-2xs"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── ADD INVENTORY ITEM MODAL ─── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package size={18} className="text-orange-500" /> Add New Inventory Product
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Fresh Paneer, Buffalo Milk, Basmati Rice"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-semibold"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    placeholder="kg, l, pcs, box, packet"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Stock Threshold</label>
                  <input
                    type="number"
                    placeholder="5"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                    value={form.minimumStock}
                    onChange={(e) => setForm({ ...form, minimumStock: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    placeholder="20"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-bold"
                    value={form.currentStock}
                    onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                    value={form.purchasePrice}
                    onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                  />
                </div>
              </div>

              {/* Expiry Date Section with Quick Buttons */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock size={14} className="text-orange-500" /> Expiry Date (Optional)
                  </label>
                  {form.expiryDate && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, expiryDate: "" })}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold"
                    >
                      Clear Expiry
                    </button>
                  )}
                </div>

                <input
                  type="date"
                  className="w-full bg-white text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-semibold"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />

                {/* Quick Expiry Preset Buttons */}
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold mb-1">Quick Expiry Presets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "+3 Days (Dairy/Bread)", days: 3 },
                      { label: "+7 Days (Veg/Paneer)", days: 7 },
                      { label: "+15 Days (Meat/Eggs)", days: 15 },
                      { label: "+1 Month", days: 30 },
                      { label: "+3 Months", days: 90 },
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset.days}
                        onClick={() => setForm({ ...form, expiryDate: addDaysToDate(preset.days) })}
                        className="px-2 py-1 rounded-lg bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 text-[10px] font-bold transition-colors shadow-2xs"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
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
                  {submitting ? "Saving..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT INVENTORY ITEM MODAL ─── */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil size={18} className="text-orange-500" /> Edit Product & Expiry
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-semibold"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Stock Threshold</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                    value={editForm.minimumStock}
                    onChange={(e) => setEditForm({ ...editForm, minimumStock: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-bold"
                    value={editForm.currentStock}
                    onChange={(e) => setEditForm({ ...editForm, currentStock: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                    value={editForm.purchasePrice}
                    onChange={(e) => setEditForm({ ...editForm, purchasePrice: e.target.value })}
                  />
                </div>
              </div>

              {/* Expiry Date Section */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock size={14} className="text-orange-500" /> Expiry Date
                  </label>
                  {editForm.expiryDate && (
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, expiryDate: "" })}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold"
                    >
                      Clear Expiry
                    </button>
                  )}
                </div>

                <input
                  type="date"
                  className="w-full bg-white text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-semibold"
                  value={editForm.expiryDate}
                  onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                />

                {/* Quick Expiry Preset Buttons */}
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold mb-1">Quick Expiry Presets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "+3 Days", days: 3 },
                      { label: "+7 Days", days: 7 },
                      { label: "+15 Days", days: 15 },
                      { label: "+1 Month", days: 30 },
                      { label: "+3 Months", days: 90 },
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset.days}
                        onClick={() => setEditForm({ ...editForm, expiryDate: addDaysToDate(preset.days) })}
                        className="px-2 py-1 rounded-lg bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 text-[10px] font-bold transition-colors shadow-2xs"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── STOCK ADJUSTMENT MODAL ─── */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Stock Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjust} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Item *</label>
                <select
                  className="w-full bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={adjust.itemId}
                  onChange={(e) => setAdjust({ ...adjust, itemId: e.target.value })}
                  required
                >
                  <option value="">Select Item...</option>
                  {items.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.name} ({i.currentStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    className="w-full bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                    value={adjust.type}
                    onChange={(e) => setAdjust({ ...adjust, type: e.target.value })}
                  >
                    <option value="ADJUSTMENT">Adjustment (+)</option>
                    <option value="WASTAGE">Wastage (-)</option>
                    <option value="RETURN">Return (+)</option>
                    <option value="SALE">Manual Sale (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    placeholder="1"
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-bold"
                    value={adjust.quantity}
                    onChange={(e) => setAdjust({ ...adjust, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Reason for adjustment..."
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={adjust.notes}
                  onChange={(e) => setAdjust({ ...adjust, notes: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
                >
                  {submitting ? "Applying..." : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
