import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ScanLine,
  Receipt,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Heart,
  ShoppingCart,
  NotebookPen,
  Check,
  Flame,
  Utensils,
  Soup,
  Cake,
  Coffee,
  LayoutGrid,
  Users,
  ChevronDown,
} from "lucide-react";
import { getMenu, getCategories } from "../../services/menuService";
import { getTables } from "../../services/tableService";
import { createOrder, sendKOT } from "../../services/orderService";
import {
  setOrderType,
  setTable,
  addItem,
  incrementItem,
  decrementItem,
  removeItem,
  setDiscount,
  setOrderNotes,
  clearCart,
} from "../../store/slices/cartSlice";

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
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop",
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
  All: LayoutGrid,
  Starters: Flame,
  "Main Course": Utensils,
  "Rice & Biryani": Soup,
  Tandoor: Flame,
  Desserts: Cake,
  Beverages: Coffee,
};

export default function POS() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((s) => s.cart);

  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [guestsCount, setGuestsCount] = useState(1);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data || []));
    getMenu({ limit: 200 }).then((r) => setMenu(r.data || []));
    getTables().then((r) => setTables(r.data || []));
  }, []);

  const filteredMenu = useMemo(() => {
    return menu.filter((m) => {
      const matchCat =
        activeCategory === "ALL" ||
        m.category?._id === activeCategory ||
        m.category === activeCategory;
      const matchSearch =
        !search || m.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch && m.isActive;
    });
  }, [menu, activeCategory, search]);

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount = cart.items.reduce(
    (s, i) => s + (i.price * i.quantity * (i.taxPercent || 0)) / 100,
    0
  );
  const grandTotal = Math.round((subtotal - cart.discount + taxAmount) / 1);

  const handleAdd = (item) => {
    if (item.isAvailable === false) return;
    dispatch(
      addItem({
        menuItem: item._id,
        name: item.name,
        price: item.price,
        taxPercent: item.taxPercent,
      })
    );
  };

  const toggleFavorite = (itemId, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleCreateOrder = async () => {
    if (!cart.items.length) return toast.error("Add at least one item to the cart");
    if (cart.orderType === "DINE_IN" && !cart.table)
      return toast.error("Select a table for dine-in order");
    setSubmitting(true);
    try {
      const payload = {
        orderType: cart.orderType,
        table: cart.orderType === "DINE_IN" ? cart.table._id : undefined,
        items: cart.items.map((i) => ({
          menuItem: i.menuItem,
          quantity: i.quantity,
          notes: i.notes,
        })),
        discount: cart.discount,
        notes: cart.notes,
      };
      const res = await createOrder(payload);
      try {
        await sendKOT(res.data._id);
      } catch (kotErr) {
        console.warn("Auto-send KOT:", kotErr);
      }
      toast.success(`Order ${res.data.orderNumber} created & KOT sent to kitchen`);
      dispatch(clearCart());
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1700px] mx-auto pb-8">
      {/* LEFT & CENTER: Menu Workspace */}
      <div className="lg:col-span-2 space-y-5">
        {/* 1. Hero POS Header */}
        <div className="bg-gradient-to-r from-orange-50/90 via-amber-50/40 to-white border border-orange-100 rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="relative z-10">
            <div className="text-[10px] font-bold text-orange-600 tracking-widest uppercase mb-1">
              GOOD FOOD • GOOD PEOPLE • GREAT MOMENTS
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Point of <span className="text-orange-500">Sale</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Delicious meals. Happier customers. 🍴
            </p>
          </div>

          {/* Decorative Dish Hero Banner */}
          <div className="relative z-10 flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="relative group">
              <img
                src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&auto=format&fit=crop"
                alt="Featured Dish"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-md border-2 border-white ring-4 ring-orange-500/10 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                Fresh Food Everyday
              </span>
              <span className="absolute -bottom-2 -left-2 bg-white text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs border border-slate-100">
                Taste the Goodness
              </span>
            </div>
          </div>
        </div>

        {/* 2. Menu Search & Barcode Scan Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              className="w-full bg-white text-slate-800 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-3 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all placeholder:text-slate-400 shadow-2xs font-medium"
              placeholder="Search menu items (e.g. Chicken, Paneer, Biryani...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-semibold text-xs shadow-2xs transition-colors shrink-0 active:scale-95"
          >
            <ScanLine size={16} className="text-slate-600" />
            <span className="hidden sm:inline">Scan Barcode</span>
          </button>
        </div>

        {/* 3. Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
          {/* ALL Button */}
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeCategory === "ALL"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <LayoutGrid size={15} />
            <span>All</span>
          </button>

          {/* Category List Buttons */}
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

        {/* 4. Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMenu.map((item) => {
            const isAvailable = item.isAvailable !== false;
            const isFav = !!favorites[item._id];
            const imgUrl = getItemImage(item);

            return (
              <div
                key={item._id}
                className={`bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group ${
                  !isAvailable ? "opacity-60" : ""
                }`}
              >
                {/* Product Image & Favorite Toggle */}
                <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(item._id, e)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-900/40 hover:bg-slate-900/70 text-white backdrop-blur-xs flex items-center justify-center transition-colors"
                  >
                    <Heart
                      size={14}
                      className={isFav ? "fill-rose-500 text-rose-500" : "text-white"}
                    />
                  </button>
                </div>

                {/* Details Section */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    {/* Status Badge */}
                    <div className="mb-1.5">
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
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h4>
                  </div>

                  {/* Price & Add Button */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                    <span className="font-extrabold text-base text-slate-900">
                      ₹{item.price}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAdd(item)}
                      disabled={!isAvailable}
                      className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!filteredMenu.length && (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-100">
              <UtensilsCrossed size={36} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No menu items found</p>
              <p className="text-xs text-slate-400">Try adjusting your search query or category filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Current Order & Billing Panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col justify-between h-fit lg:sticky lg:top-20 space-y-4">
        {/* Header: Current Order & Clear All */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="text-orange-500" size={18} />
            Current Order
          </h3>
          <button
            onClick={() => dispatch(clearCart())}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={13} />
            Clear All
          </button>
        </div>

        {/* Order Type Segmented Switch */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { id: "DINE_IN", label: "DINE IN", icon: UtensilsCrossed },
            { id: "TAKEAWAY", label: "TAKEAWAY", icon: ShoppingBag },
            { id: "DELIVERY", label: "DELIVERY", icon: Bike },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = cart.orderType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => dispatch(setOrderType(t.id))}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon size={14} />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dine-In Controls (Table & Guest Selector) */}
        {cart.orderType === "DINE_IN" && (
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <UtensilsCrossed size={12} className="text-orange-500" /> Table No.
              </label>
              <select
                className="w-full bg-white text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-2 border border-slate-200 focus:border-orange-500 focus:outline-none"
                value={cart.table?._id || ""}
                onChange={(e) =>
                  dispatch(
                    setTable(tables.find((t) => t._id === e.target.value) || null)
                  )
                }
              >
                <option value="">Select Table...</option>
                {tables.map((t) => (
                  <option
                    key={t._id}
                    value={t._id}
                    disabled={t.status === "OCCUPIED"}
                  >
                    Table {t.number} ({t.zone}) {t.status === "OCCUPIED" ? "• Occupied" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Users size={12} className="text-orange-500" /> Guests
              </label>
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setGuestsCount((g) => Math.max(1, g - 1))}
                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-800">{guestsCount}</span>
                <button
                  type="button"
                  onClick={() => setGuestsCount((g) => g + 1)}
                  className="w-6 h-6 rounded bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart Items List or Empty Cart Illustration */}
        <div className="flex-1 min-h-[200px] max-h-[280px] overflow-y-auto space-y-2 py-1 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          {cart.items.map((i) => (
            <div
              key={i.menuItem}
              className="flex items-center justify-between bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {i.name}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  ₹{i.price}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1 py-0.5">
                  <button
                    onClick={() => dispatch(decrementItem(i.menuItem))}
                    className="w-5 h-5 rounded hover:bg-slate-100 text-slate-600 flex items-center justify-center"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-slate-800">
                    {i.quantity}
                  </span>
                  <button
                    onClick={() => dispatch(incrementItem(i.menuItem))}
                    className="w-5 h-5 rounded hover:bg-slate-100 text-slate-600 flex items-center justify-center"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="text-xs font-extrabold text-slate-900 w-12 text-right">
                  ₹{(i.price * i.quantity).toLocaleString("en-IN")}
                </div>

                <button
                  onClick={() => dispatch(removeItem(i.menuItem))}
                  className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {!cart.items.length && (
            <div className="flex flex-col items-center justify-center py-10 text-center relative">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center mb-3 shadow-inner">
                <ShoppingCart size={28} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Cart is empty</h4>
              <p className="text-xs text-slate-400 max-w-[200px]">
                Tap a menu item to add it to the order
              </p>
              <div className="absolute right-6 bottom-3 text-orange-400 font-handwriting text-xs animate-pulse hidden sm:block">
                ⤵
              </div>
            </div>
          )}
        </div>

        {/* Order Notes Field */}
        <div className="relative">
          <NotebookPen
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none placeholder:text-slate-400"
            placeholder="Order notes (e.g. less spicy, no onion...)"
            value={cart.notes}
            onChange={(e) => dispatch(setOrderNotes(e.target.value))}
          />
        </div>

        {/* Billing Calculations Box */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Discount (₹)</span>
            <input
              type="number"
              min="0"
              className="w-20 bg-slate-50 border border-slate-200 rounded-lg text-right text-xs py-1 px-2 font-semibold focus:border-orange-500 focus:outline-none"
              value={cart.discount}
              onChange={(e) => dispatch(setDiscount(Number(e.target.value) || 0))}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Subtotal</span>
            <span className="font-bold text-slate-800">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Tax</span>
            <span className="font-bold text-slate-800">
              ₹{taxAmount.toFixed(2)}
            </span>
          </div>

          {/* Grand Total Box */}
          <div className="bg-orange-50/80 border border-orange-100 p-3 rounded-xl flex items-center justify-between mt-1">
            <span className="text-sm font-extrabold text-slate-900">
              Grand Total
            </span>
            <span className="text-xl font-black text-slate-900">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>

          {/* Confirm Order Button */}
          <button
            onClick={handleCreateOrder}
            disabled={submitting || !cart.items.length}
            className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
          >
            <Check size={18} />
            <span>{submitting ? "Placing Order..." : "Confirm Order"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
