import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getMenu,
  getCategories,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
  createCategory,
} from "../../services/menuService";
import {
  Utensils,
  Plus,
  Search,
  Upload,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Layers,
  PackageX,
  LayoutGrid,
  List,
  MoreVertical,
  Flame,
  Soup,
  Cake,
  Coffee,
  Image as ImageIcon,
  FolderPlus,
} from "lucide-react";

const DEFAULT_FOOD_IMAGES = {
  paneer: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop",
  chai: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop",
  chicken: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop",
  butter: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop",
  jamun: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop",
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop",
  rice: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop",
  coffee: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop",
  rasgulla: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop",
  brownie: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop",
  fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop",
};

function getItemImage(item) {
  if (item.imageUrl) return item.imageUrl;
  if (item.image) return item.image;
  const nameLower = (item.name || "").toLowerCase();
  for (const [key, url] of Object.entries(DEFAULT_FOOD_IMAGES)) {
    if (nameLower.includes(key)) return url;
  }
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop";
}

const CATEGORY_ICONS = {
  "All Items": LayoutGrid,
  Starters: Flame,
  "Main Course": Utensils,
  "Rice & Biryani": Soup,
  Desserts: Cake,
  Beverages: Coffee,
};

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);

  // Form Panel State
  const [showPanel, setShowPanel] = useState(true);
  const [activeTab, setActiveTab] = useState("basic"); // 'basic' | 'additional'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    taxPercent: 5,
    foodType: "VEG",
    isAvailable: true,
    imageUrl: "",
  });

  const [newCatName, setNewCatName] = useState("");
  const [showCatModal, setShowCatModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getMenu({ limit: 200 }), getCategories()])
      .then(([mRes, cRes]) => {
        setMenu(Array.isArray(mRes?.data) ? mRes.data : []);
        setCategories(Array.isArray(cRes?.data) ? cRes.data : []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filteredMenu = useMemo(() => {
    return menu.filter((m) => {
      const matchCat =
        activeCategory === "ALL" ||
        m.category?._id === activeCategory ||
        m.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menu, activeCategory, searchQuery]);

  // Metrics
  const totalItemsCount = menu.length;
  const categoriesCount = categories.length;
  const outOfStockCount = menu.filter((m) => m.isAvailable === false).length;
  const availableItemsCount = menu.filter((m) => m.isAvailable !== false).length;

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      category: item.category?._id || item.category || "",
      price: item.price || "",
      taxPercent: item.taxPercent ?? 5,
      foodType: item.foodType || "VEG",
      isAvailable: item.isAvailable !== false,
      imageUrl: item.imageUrl || item.image || "",
    });
    setShowPanel(true);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      category: categories[0]?._id || "",
      price: "",
      taxPercent: 5,
      foodType: "VEG",
      isAvailable: true,
      imageUrl: "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      return toast.error("Item name, category, and price are required");
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        taxPercent: Number(form.taxPercent),
        foodType: form.foodType,
        isAvailable: form.isAvailable,
        imageUrl: form.imageUrl,
      };

      if (editingId) {
        await updateMenuItem(editingId, payload);
        toast.success("Menu item updated");
      } else {
        await createMenuItem(payload);
        toast.success("Menu item added");
      }

      handleResetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await deleteMenuItem(id);
      toast.success("Item deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete item");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleAvailability(id);
      load();
    } catch (e) {
      toast.error("Failed to toggle status");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await createCategory({ name: newCatName.trim() });
      toast.success("Category created");
      setNewCatName("");
      setShowCatModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    }
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs">
            <Utensils size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Menu Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">Organize your menu, keep it fresh, keep customers happy.</p>
          </div>
        </div>

        {/* Center Banner Graphic Accent */}
        <div className="hidden xl:flex items-center gap-3 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none opacity-90">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop"
            alt="Delicious Menu"
            className="w-36 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
          />
          <div className="px-3.5 py-1 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold rounded-full italic">
            Good Food Great Business
          </div>
        </div>

        {/* Right Side Sticker Accent */}
        <div className="hidden md:flex items-center gap-2 relative z-10">
          <div className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs">
            Delicious Menus Happier Customers
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metrics & Action Buttons Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Metric Cards (4 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1">
          {/* Total Items */}
          <div className="bg-[#fff7ed] border border-orange-100 p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
              <Utensils size={18} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-none">{totalItemsCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Items</div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-[#f0fdf4] border border-emerald-100 p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-none">{categoriesCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Categories</div>
            </div>
          </div>

          {/* Out of Stock */}
          <div className="bg-[#fff1f2] border border-rose-100 p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
              <PackageX size={18} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-none">{outOfStockCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Out of Stock</div>
            </div>
          </div>

          {/* Available Items */}
          <div className="bg-[#eff6ff] border border-blue-100 p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-none">{availableItemsCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Available Items</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowCatModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <FolderPlus size={16} />
            <span>+ Category</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <Upload size={16} />
            <span>Import</span>
          </button>

          <button
            type="button"
            onClick={() => { handleResetForm(); setShowPanel(true); }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-3 rounded-xl text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* 3. Category Filter & Search Bar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin scrollbar-thumb-slate-200">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeCategory === "ALL"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <LayoutGrid size={15} />
            <span>All Items</span>
          </button>

          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.name] || Utensils;
            const isActive = activeCategory === c._id;
            return (
              <button
                key={c._id}
                onClick={() => setActiveCategory(c._id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon size={15} />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Search & View Mode Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative flex-1 sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 text-xs rounded-xl pl-8 pr-3 py-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none shadow-2xs font-medium"
            />
          </div>

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

      {/* 4. Main Content: Grid + Add/Edit Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Menu Cards Workspace (Left 3 Columns when panel open, else 4) */}
        <div className={showPanel ? "lg:col-span-3 space-y-4" : "lg:col-span-4 space-y-4"}>
          {viewMode === "grid" ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${showPanel ? "xl:grid-cols-3" : "xl:grid-cols-4"} gap-4`}>
              {filteredMenu.map((item) => {
                const isAvailable = item.isAvailable !== false;
                const imgUrl = getItemImage(item);
                const catName = item.category?.name || "General";

                return (
                  <div
                    key={item._id}
                    className={`bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group ${
                      !isAvailable ? "opacity-60" : ""
                    }`}
                  >
                    {/* Top Image Container */}
                    <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-900/40 hover:bg-slate-900/70 text-white backdrop-blur-xs flex items-center justify-center transition-colors"
                      >
                        <MoreVertical size={15} />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                      <div>
                        {/* Status Badge */}
                        <button
                          onClick={() => handleToggleStatus(item._id)}
                          className="mb-1.5 inline-block cursor-pointer"
                        >
                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100/80 rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100/80 rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Out of stock
                            </span>
                          )}
                        </button>

                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                          {item.name}
                        </h4>
                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                          {catName}
                        </div>
                      </div>

                      {/* Price & Action Buttons Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <span className="font-extrabold text-base text-slate-900">
                          ₹{item.price}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Edit Item"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Tax</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMenu.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{m.name}</td>
                      <td className="py-3 px-4 text-slate-600">{m.category?.name || "General"}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">₹{m.price}</td>
                      <td className="py-3 px-4 text-slate-500">{m.taxPercent}%</td>
                      <td className="py-3 px-4">
                        <button onClick={() => handleToggleStatus(m._id)} className="cursor-pointer">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${m.isAvailable !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                            {m.isAvailable !== false ? "Available" : "Out of stock"}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(m)} className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(m._id)} className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!filteredMenu.length && !loading && (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <Utensils size={40} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No menu items found</p>
              <p className="text-xs text-slate-500">Try adjusting your search query or category filter.</p>
            </div>
          )}
        </div>

        {/* Right Add/Edit Form Slide Panel */}
        {showPanel && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Form Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? "Edit Menu Item" : "Add Menu Item"}
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Tabs */}
            <div className="flex border-b border-slate-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  activeTab === "basic"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("additional")}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  activeTab === "additional"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                Additional Info
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {activeTab === "basic" ? (
                <>
                  {/* Image Upload Box */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Food Image URL</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-4 text-center bg-slate-50/50 cursor-pointer transition-colors">
                      <ImageIcon size={24} className="text-slate-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-slate-700">Upload Food Image</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Enter URL below or paste link</div>
                    </div>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none mt-2 font-medium"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    />
                  </div>

                  {/* Item Name */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Item Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chicken Biryani"
                      className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none font-medium"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      className="w-full bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price & Tax % */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Price (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none font-bold"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tax %</label>
                      <input
                        type="number"
                        placeholder="5"
                        className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none font-semibold"
                        value={form.taxPercent}
                        onChange={(e) => setForm({ ...form, taxPercent: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Food Type */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Food Type</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="foodType"
                          value="VEG"
                          checked={form.foodType === "VEG"}
                          onChange={(e) => setForm({ ...form, foodType: e.target.value })}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Veg
                      </label>

                      <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="foodType"
                          value="NON_VEG"
                          checked={form.foodType === "NON_VEG"}
                          onChange={(e) => setForm({ ...form, foodType: e.target.value })}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        Non-Veg
                      </label>
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">Available</span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        form.isAvailable ? "bg-orange-500" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          form.isAvailable ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </>
              ) : (
                /* Additional Info Tab */
                <div className="py-4 text-center text-slate-400">
                  <p className="text-xs">No additional configuration required.</p>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95"
                >
                  {submitting ? "Saving..." : editingId ? "Update Item" : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Category</h3>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Starters, Tandoor, Drinks"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
