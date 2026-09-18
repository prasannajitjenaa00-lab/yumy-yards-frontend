import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import {
  Truck,
  Plus,
  Trash2,
  Search,
  Calendar,
  ChevronDown,
  ShoppingCart,
  Coins,
  FileText,
  Users,
  Info,
  X,
  Filter,
  Eye,
  CheckCircle2,
  TrendingUp,
  UserPlus,
} from "lucide-react";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  // Form State
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [currentItem, setCurrentItem] = useState("");
  const [currentQty, setCurrentQty] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [addedItems, setAddedItems] = useState([]);

  const [taxAmount, setTaxAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // History Toolbar State
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("30days");
  const [showTip, setShowTip] = useState(true);

  // Add Supplier Modal
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");

  const loadData = () => {
    api
      .get("/purchases")
      .then((r) => setPurchases(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => {});
    api
      .get("/suppliers")
      .then((r) => setSuppliers(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => {});
    api
      .get("/inventory", { params: { limit: 200 } })
      .then((r) => setInventoryItems(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddToList = () => {
    if (!currentItem) return toast.error("Select an inventory item");
    if (!currentQty || Number(currentQty) <= 0) return toast.error("Enter a valid quantity");
    if (!currentPrice || Number(currentPrice) <= 0) return toast.error("Enter a valid price");

    const invObj = inventoryItems.find((i) => i._id === currentItem);
    const newItem = {
      inventoryItem: currentItem,
      name: invObj ? invObj.name : "Item",
      quantity: Number(currentQty),
      purchasePrice: Number(currentPrice),
      total: Number(currentQty) * Number(currentPrice),
    };

    setAddedItems((prev) => [...prev, newItem]);
    setCurrentItem("");
    setCurrentQty("");
    setCurrentPrice("");
  };

  const handleRemoveFromList = (idx) => {
    setAddedItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClearAll = () => {
    setSelectedSupplier("");
    setAddedItems([]);
    setTaxAmount(0);
    setNotes("");
    setCurrentItem("");
    setCurrentQty("");
    setCurrentPrice("");
  };

  const calculatedSubtotal = useMemo(() => {
    return addedItems.reduce((s, i) => s + i.total, 0);
  }, [addedItems]);

  const grandTotal = useMemo(() => {
    return calculatedSubtotal + (Number(taxAmount) || 0);
  }, [calculatedSubtotal, taxAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupplier) return toast.error("Please select a supplier");
    if (!addedItems.length) return toast.error("Add at least one item to the list");

    setSubmitting(true);
    try {
      const payload = {
        supplier: selectedSupplier,
        items: addedItems.map((i) => ({
          inventoryItem: i.inventoryItem,
          quantity: i.quantity,
          purchasePrice: i.purchasePrice,
        })),
        taxAmount: Number(taxAmount) || 0,
        notes,
      };

      await api.post("/purchases", payload);
      toast.success("Purchase recorded — inventory updated");
      handleClearAll();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record purchase");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;
    try {
      const res = await api.post("/suppliers", { name: newSupplierName.trim(), phone: newSupplierPhone });
      toast.success("Supplier added");
      setNewSupplierName("");
      setNewSupplierPhone("");
      setShowSupplierModal(false);
      loadData();
      if (res.data?.data?._id) setSelectedSupplier(res.data.data._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add supplier");
    }
  };

  // Metrics
  const totalPurchasesCount = purchases.length;
  const totalSpentSum = purchases.reduce((s, p) => s + (p.total || 0), 0);
  const itemsPurchasedCount = purchases.reduce((s, p) => s + (p.items?.length || 0), 0);
  const suppliersCount = suppliers.length;

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const numStr = String(p.purchaseNumber || p._id || "").toLowerCase();
      const suppStr = String(p.supplier?.name || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      return !query || numStr.includes(query) || suppStr.includes(query);
    });
  }, [purchases, searchQuery]);

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchases</h1>
            <p className="text-xs text-slate-500 mt-0.5">Record and manage your ingredient purchases</p>
          </div>
        </div>

        {/* Center Banner Graphic Accent */}
        <div className="hidden xl:flex items-center gap-3 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none opacity-90">
          <img
            src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop"
            alt="Fresh Ingredients"
            className="w-36 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
          />
          <div className="px-3.5 py-1 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold rounded-full italic">
            Quality Ingredients Great Food
          </div>
        </div>

        {/* Right Side Card Accent */}
        <div className="hidden md:block relative z-10">
          <div className="bg-orange-50/80 border border-orange-100 px-3.5 py-2 rounded-xl text-xs space-y-0.5 font-bold text-slate-800">
            <div className="text-[10px] text-orange-600 flex items-center gap-1"><CheckCircle2 size={12} /> Better Ingredients</div>
            <div className="text-[10px] text-orange-600 flex items-center gap-1"><CheckCircle2 size={12} /> Better Taste</div>
            <div className="text-[10px] text-orange-600 flex items-center gap-1"><CheckCircle2 size={12} /> Happier Customers</div>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Purchases */}
        <div className="bg-[#fff7ed] border border-orange-100 p-4 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
              <ShoppingCart size={18} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 leading-none">{totalPurchasesCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Purchases</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-100">
            <TrendingUp size={10} /> ↗ 0% vs last month
          </span>
        </div>

        {/* Total Spent */}
        <div className="bg-[#fff7ed] border border-orange-100 p-4 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <Coins size={18} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 leading-none">₹{totalSpentSum.toFixed(2)}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Spent</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-100">
            <TrendingUp size={10} /> ↗ 0% vs last month
          </span>
        </div>

        {/* Items Purchased */}
        <div className="bg-[#f0fdf4] border border-emerald-100 p-4 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 leading-none">{itemsPurchasedCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Items Purchased</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-100">
            <TrendingUp size={10} /> ↗ 0% vs last month
          </span>
        </div>

        {/* Suppliers */}
        <div className="bg-[#eff6ff] border border-blue-100 p-4 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Users size={18} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 leading-none">{suppliersCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Suppliers</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-100">
            <TrendingUp size={10} /> ↗ 0% vs last month
          </span>
        </div>
      </div>

      {/* 3. Two-Column Workspace (Left Form + Right History) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Record New Purchase Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart size={18} className="text-orange-500" />
              Record New Purchase
            </h3>
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors border border-slate-200 px-2.5 py-1 rounded-lg"
            >
              <Trash2 size={13} />
              Clear All
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Supplier Selector Row */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supplier <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  className="flex-1 bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  required
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.phone ? `(${s.phone})` : ""}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowSupplierModal(true)}
                  className="bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Supplier</span>
                </button>
              </div>
            </div>

            {/* Item Entry Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="sm:col-span-5">
                <label className="block font-semibold text-slate-600 mb-1">
                  Item <span className="text-rose-500">*</span>
                </label>
                <select
                  className="w-full bg-white text-slate-800 text-xs font-semibold rounded-xl p-2 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={currentItem}
                  onChange={(e) => setCurrentItem(e.target.value)}
                >
                  <option value="">Select item...</option>
                  {inventoryItems.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.name} ({i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-600 mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  className="w-full bg-white text-slate-800 text-xs font-bold rounded-xl p-2 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={currentQty}
                  onChange={(e) => setCurrentQty(e.target.value)}
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block font-semibold text-slate-600 mb-1">
                  Price per unit (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-white text-slate-800 text-xs font-bold rounded-xl p-2 border border-slate-200 focus:border-orange-500 focus:outline-none"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddToList}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold p-2 rounded-xl text-xs shadow-xs shrink-0 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Added Items Container */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-800">Added Items</label>
              {addedItems.length > 0 ? (
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-semibold uppercase text-[10px]">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Price (₹)</th>
                        <th className="py-2.5 px-3">Total (₹)</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {addedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{item.name}</td>
                          <td className="py-2.5 px-3 text-slate-700 font-semibold">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-slate-700 font-semibold">₹{item.purchasePrice}</td>
                          <td className="py-2.5 px-3 font-extrabold text-slate-900">₹{item.total.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromList(idx)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl p-6 text-center bg-slate-50/40">
                  <ShoppingCart size={32} className="text-slate-300 mx-auto mb-2" />
                  <div className="font-bold text-slate-800">No items added yet</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Select an item, enter quantity and price, then click '+'
                  </div>
                </div>
              )}
            </div>

            {/* Tax & Notes Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Invoice number, remarks..."
                  className="w-full bg-slate-50 text-slate-800 text-xs font-medium rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Total Amount Box */}
            <div className="bg-orange-50/80 border border-orange-100 p-4 rounded-xl flex items-center justify-between mt-2">
              <span className="text-sm font-extrabold text-slate-900">Total Amount (₹)</span>
              <span className="text-2xl font-black text-slate-900">₹{grandTotal.toFixed(2)}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <FileText size={18} />
              <span>{submitting ? "Recording..." : "Record Purchase"}</span>
            </button>
          </form>
        </div>

        {/* RIGHT: Purchase History & Tip (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Purchase History Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 min-h-[460px] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-rose-500" />
                  Purchase History
                </h3>

                <div className="relative">
                  <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-6 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer appearance-none shadow-2xs"
                  >
                    <option value="30days">Last 30 Days</option>
                    <option value="all">All Time</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Toolbar Search & Filter */}
              <div className="flex items-center gap-2 mt-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search purchases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-8 pr-3 py-2 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-2 rounded-xl"
                >
                  <Filter size={14} />
                  <span>Filter</span>
                </button>
              </div>

              {/* Purchase History Table or Empty State */}
              <div className="mt-4">
                {filteredPurchases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Supplier</th>
                          <th className="py-2.5 px-3">Items</th>
                          <th className="py-2.5 px-3">Total</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPurchases.map((p, idx) => (
                          <tr key={p._id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-semibold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-3 text-slate-500">
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-800">
                              {p.supplier?.name || "Supplier"}
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-medium">
                              {p.items?.length || 0} items
                            </td>
                            <td className="py-3 px-3 font-extrabold text-slate-900">
                              ₹{(p.total || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {p.paymentStatus || "COMPLETED"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button className="text-orange-600 hover:text-orange-700 font-bold">
                                <Eye size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-14 text-center">
                    <FileText size={40} className="text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-800">No purchases found</h4>
                    <p className="text-xs text-slate-400 max-w-[220px] mx-auto mt-1 mb-4">
                      Your purchase records will appear here.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedSupplier(suppliers[0]?._id || "")}
                      className="inline-flex items-center gap-1.5 bg-white border border-orange-200 text-orange-600 font-bold text-xs py-2 px-4 rounded-xl shadow-2xs hover:bg-orange-50"
                    >
                      <Truck size={14} />
                      <span>Record Your First Purchase</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tip Banner */}
          {showTip && (
            <div className="bg-emerald-50/80 border border-emerald-100 p-4 rounded-2xl flex items-start justify-between gap-3 text-xs text-emerald-800 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  🍃
                </div>
                <div>
                  <span className="font-bold">Tip: </span>
                  Keep track of your ingredient purchases to manage stock levels and control costs effectively.
                </div>
              </div>
              <button
                onClick={() => setShowTip(false)}
                className="text-emerald-500 hover:text-emerald-700 p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Supplier</h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Metro Wholesale, Fresh Organic Farm"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none font-medium"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
