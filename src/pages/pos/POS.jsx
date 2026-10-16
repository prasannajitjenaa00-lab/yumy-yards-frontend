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
  ChevronDown,
  ChefHat,
  Printer,
  ArrowRight,
  Sparkles,
  X,
  CheckCircle2,
  User,
  Phone,
  Banknote,
  QrCode,
  CreditCard,
} from "lucide-react";
import { getMenu, getCategories } from "../../services/menuService";
import { createOrder, sendKOT } from "../../services/orderService";
import { recordPayment } from "../../services/paymentService";
import PrintInvoiceModal from "../../components/common/PrintInvoiceModal";
import {
  setOrderType,
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
  const { user } = useSelector((s) => s.auth);

  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [completedOrder, setCompletedOrder] = useState(null);
  const [paying, setPaying] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [taxRate, setTaxRate] = useState(5); // 5% GST standard default
  const [taxPreset, setTaxPreset] = useState("5"); // "0", "5", "12", "18", "custom"

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data || []));
    getMenu({ limit: 200 }).then((r) => setMenu(r.data || []));
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
  const taxableAmount = Math.max(0, subtotal - cart.discount);
  const activeTaxRate = Number(taxRate) || 0;
  const taxAmount = (taxableAmount * activeTaxRate) / 100;
  const grandTotal = Math.round(taxableAmount + taxAmount);
  const cgstAmount = taxAmount / 2;
  const sgstAmount = taxAmount / 2;

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

  const handleCreateOrder = async (selectedPaymentMethod = "CASH") => {
    if (!cart.items.length) return toast.error("Add at least one item to the cart");
    setSubmitting(true);
    try {
      const payload = {
        orderType: cart.orderType,
        items: cart.items.map((i) => ({
          menuItem: i.menuItem,
          quantity: i.quantity,
          notes: i.notes,
        })),
        discount: cart.discount,
        notes: cart.notes,
        taxRate: activeTaxRate,
        ...(selectedPaymentMethod ? { paymentMethod: selectedPaymentMethod } : {}),
        ...(customerName.trim() || customerPhone.trim()
          ? {
              customer: {
                name: customerName.trim(),
                phone: customerPhone.trim(),
              },
            }
          : {}),
      };
      const res = await createOrder(payload);
      let kotRes = null;
      try {
        kotRes = await sendKOT(res.data._id);
      } catch (kotErr) {
        console.warn("Auto-send KOT:", kotErr);
      }
      if (selectedPaymentMethod) {
        toast.success(`Order ${res.data.orderNumber} PAID via ${selectedPaymentMethod} & sent to kitchen!`);
      } else {
        toast.success(`Order ${res.data.orderNumber} created & sent to kitchen!`);
      }
      setCompletedOrder({
        _id: res.data._id,
        orderNumber: res.data.orderNumber,
        kotNumber: kotRes?.data?.kotNumber || `KOT-${String(res.data.orderNumber || "").slice(-4)}`,
        orderType: cart.orderType,
        items: [...cart.items],
        grandTotal: grandTotal,
        discount: cart.discount,
        notes: cart.notes,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        taxRate: activeTaxRate,
        taxAmount: taxAmount,
        isPaid: Boolean(selectedPaymentMethod),
        paymentMethod: selectedPaymentMethod,
        cashierName: user?.name || "Cashier",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      dispatch(clearCart());
      setCustomerName("");
      setCustomerPhone("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPay = async (method) => {
    if (!completedOrder || paying) return;
    setPaying(true);
    try {
      await recordPayment({
        orderId: completedOrder._id,
        amount: completedOrder.grandTotal,
        method,
      });
      toast.success(`Payment of ₹${completedOrder.grandTotal} recorded via ${method}!`);
      setCompletedOrder((prev) => ({ ...prev, isPaid: true, paymentMethod: method }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment recording failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1700px] mx-auto pb-8 items-start">
      {/* LEFT & CENTER: Menu Workspace */}
      <div className="lg:col-span-2 space-y-5">
        {/* 1. Hero POS Header */}
        <div className="bg-gradient-to-r from-orange-50/90 via-amber-50/40 to-white border border-orange-100 rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="relative z-10">
            <div className="text-[10px] font-bold text-orange-600 tracking-widest uppercase mb-1">
              FOOD COURT COUNTER • QUICK SERVICE BILLING
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Counter <span className="text-orange-500">POS</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Take counter orders & instant KOT broadcast to kitchen display 🍴
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => navigate("/kitchen")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <ChefHat size={16} className="text-orange-400" />
              <span>Kitchen Display (KDS)</span>
            </button>
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${activeCategory === "ALL"
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${isActive
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
                className={`bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group ${!isAvailable ? "opacity-60" : ""
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

      {/* RIGHT PANEL: Current Order & Billing Panel (Fixed in Top & 1-Page Layout) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-3 flex flex-col lg:sticky lg:top-0 lg:self-start lg:h-[calc(100vh-6.5rem)] lg:max-h-[calc(100vh-6.5rem)] space-y-2 overflow-hidden">
        {/* 1. Header: Current Order & Clear All */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 shrink-0">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Receipt className="text-orange-500" size={16} />
            <span>Current Order</span>
          </h3>
          <button
            onClick={() => dispatch(clearCart())}
            className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>

        {/* 2. Order Type Segmented Switch */}
        <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-xl shrink-0">
          {[
            { id: "DINE_IN", label: "DINE-IN", icon: UtensilsCrossed },
            { id: "TAKEAWAY", label: "TAKEAWAY", icon: ShoppingBag },
            { id: "DELIVERY", label: "DELIVERY", icon: Bike },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = cart.orderType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => dispatch(setOrderType(t.id))}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon size={13} />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Customer Details (Compact Header Placement) */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-1.5 space-y-1 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wider">
              <User size={12} className="text-orange-500" />
              Customer Details (Optional)
            </span>
            {(customerName || customerPhone) && (
              <button
                type="button"
                onClick={() => {
                  setCustomerName("");
                  setCustomerPhone("");
                }}
                className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="relative">
              <User size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="w-full bg-white text-slate-800 text-[11px] rounded-lg pl-6 pr-2 py-1 border border-slate-200 focus:border-orange-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="relative">
              <Phone size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                className="w-full bg-white text-slate-800 text-[11px] rounded-lg pl-6 pr-2 py-1 border border-slate-200 focus:border-orange-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="Phone (10 digits)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 4. Cart Items List (Scrollable only if items overflow) */}
        <div className="flex-1 min-h-[90px] overflow-y-auto space-y-1.5 py-0.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          {cart.items.map((i) => (
            <div
              key={i.menuItem}
              className="flex items-center justify-between bg-slate-50/80 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0 flex-1 pr-1.5">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {i.name}
                </div>
                <div className="text-[10px] font-semibold text-slate-500">
                  ₹{i.price}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Quantity Controls */}
                <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg px-0.5 py-0.5">
                  <button
                    onClick={() => dispatch(decrementItem(i.menuItem))}
                    className="w-4 h-4 rounded hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="w-4 text-center text-xs font-bold text-slate-800">
                    {i.quantity}
                  </span>
                  <button
                    onClick={() => dispatch(incrementItem(i.menuItem))}
                    className="w-4 h-4 rounded hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
                  >
                    <Plus size={11} />
                  </button>
                </div>

                <div className="text-xs font-black text-slate-900 w-11 text-right">
                  ₹{(i.price * i.quantity).toLocaleString("en-IN")}
                </div>

                <button
                  onClick={() => dispatch(removeItem(i.menuItem))}
                  className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {!cart.items.length && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center mb-1.5 shadow-inner">
                <ShoppingCart size={18} />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Cart is empty</h4>
              <p className="text-[10px] text-slate-400 max-w-[170px] mt-0.5">
                Tap menu items to add to order
              </p>
            </div>
          )}
        </div>

        {/* 5. Compact Order Notes */}
        <div className="relative shrink-0">
          <NotebookPen
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="w-full bg-slate-50 text-slate-800 text-[11px] rounded-lg pl-7 pr-2.5 py-1.5 border border-slate-200 focus:border-orange-500 focus:bg-white focus:outline-none placeholder:text-slate-400"
            placeholder="Order notes (e.g. less spicy...)"
            value={cart.notes}
            onChange={(e) => dispatch(setOrderNotes(e.target.value))}
          />
        </div>

        {/* 6. Fixed Bottom Billing Calculations (Always in view) */}
        <div className="space-y-1.5 pt-1.5 border-t border-slate-100 shrink-0">
          {/* Subtotal & Discount in one compact grid */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center justify-between bg-slate-50/80 px-2 py-1 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">Subtotal</span>
              <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50/80 px-2 py-1 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">Discount</span>
              <div className="flex items-center gap-0.5">
                <span className="text-slate-400 text-[11px]">₹</span>
                <input
                  type="number"
                  min="0"
                  className="w-12 bg-white border border-slate-200 rounded text-right text-[11px] py-0.5 px-1 font-semibold focus:border-orange-500 focus:outline-none"
                  value={cart.discount}
                  onChange={(e) => dispatch(setDiscount(Number(e.target.value) || 0))}
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC TAX SECTION (Compact) */}
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-700 font-bold text-[11px]">Tax ({activeTaxRate}%)</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-orange-100 text-orange-700">
                  {activeTaxRate === 0 ? "EXEMPT" : `GST ${activeTaxRate}%`}
                </span>
              </div>
              <span className="font-bold text-slate-900 text-xs">
                ₹{taxAmount.toFixed(2)}
              </span>
            </div>

            {/* Quick Tax Rate Presets */}
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { label: "0% None", rate: 0, preset: "0" },
                { label: "5% GST", rate: 5, preset: "5" },
                { label: "12%", rate: 12, preset: "12" },
                { label: "18%", rate: 18, preset: "18" },
                { label: "Custom", rate: taxRate, preset: "custom" },
              ].map((p) => {
                const isSelected = taxPreset === p.preset;
                return (
                  <button
                    key={p.preset}
                    type="button"
                    onClick={() => {
                      setTaxPreset(p.preset);
                      if (p.preset !== "custom") setTaxRate(p.rate);
                    }}
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-500 text-white border-orange-500 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Tax Input */}
            {taxPreset === "custom" && (
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <span className="text-[10px] text-slate-500 font-medium">Custom Tax %:</span>
                <div className="relative w-20">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full bg-white border border-slate-300 rounded text-right text-[11px] py-0.5 pr-4 pl-1 font-semibold focus:border-orange-500 focus:outline-none"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold">%</span>
                </div>
              </div>
            )}

            {/* CGST / SGST Live Split Breakdown */}
            {activeTaxRate > 0 && (
              <div className="pt-0.5 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500">
                <span>CGST ({(activeTaxRate / 2).toFixed(1)}%): <b className="text-slate-700">₹{cgstAmount.toFixed(2)}</b></span>
                <span>SGST ({(activeTaxRate / 2).toFixed(1)}%): <b className="text-slate-700">₹{sgstAmount.toFixed(2)}</b></span>
              </div>
            )}
          </div>

          {/* Grand Total Box (Compact) */}
          <div className="bg-orange-50/80 border border-orange-100 px-3 py-2 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-slate-900 block leading-tight">
                Grand Total
              </span>
              <span className="text-[9px] text-slate-500 font-medium">
                Incl. all taxes & discounts
              </span>
            </div>
            <span className="text-lg font-black text-slate-900">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>

          {/* Food Court 1-Click Fast Counter Pay & Print */}
          <div className="space-y-1.5 pt-0.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between px-0.5">
              <span>Pay & Print Token:</span>
              <span className="text-emerald-600 font-bold">1-Click Fast Bill</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {/* Cash Button */}
              <button
                type="button"
                onClick={() => handleCreateOrder("CASH")}
                disabled={submitting || !cart.items.length}
                className="py-2.5 px-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5 text-xs cursor-pointer"
                title="Pay with Cash and Print Token"
              >
                <div className="flex items-center gap-1 font-black">
                  <Banknote size={14} />
                  <span>CASH</span>
                </div>
                <span className="text-[9px] font-semibold opacity-90">Pay & Print</span>
              </button>

              {/* UPI / QR Button */}
              <button
                type="button"
                onClick={() => handleCreateOrder("UPI")}
                disabled={submitting || !cart.items.length}
                className="py-2.5 px-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-xl shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5 text-xs cursor-pointer"
                title="Pay with UPI QR and Print Token"
              >
                <div className="flex items-center gap-1 font-black">
                  <QrCode size={14} />
                  <span>UPI / QR</span>
                </div>
                <span className="text-[9px] font-semibold opacity-90">Pay & Print</span>
              </button>

              {/* Card Button */}
              <button
                type="button"
                onClick={() => handleCreateOrder("CARD")}
                disabled={submitting || !cart.items.length}
                className="py-2.5 px-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5 text-xs cursor-pointer"
                title="Pay with Card and Print Token"
              >
                <div className="flex items-center gap-1 font-black">
                  <CreditCard size={14} />
                  <span>CARD</span>
                </div>
                <span className="text-[9px] font-semibold opacity-90">Pay & Print</span>
              </button>
            </div>

            {/* Pay Later Option */}
            <button
              type="button"
              onClick={() => handleCreateOrder(null)}
              disabled={submitting || !cart.items.length}
              className="w-full py-1 text-[10px] text-slate-500 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-lg transition-colors text-center cursor-pointer disabled:opacity-40"
            >
              Order without immediate payment (Pay Later)
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FOOD COURT TOKEN & ORDER SUCCESS MODAL                    */}
      {/* ========================================================= */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 text-center relative">
              <button
                type="button"
                onClick={() => setCompletedOrder(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 text-white shadow-inner">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="text-lg font-black tracking-tight">Order Placed Successfully</h3>
              <p className="text-xs text-emerald-100 mt-0.5">KOT ticket broadcast to Kitchen Display</p>
            </div>

            {/* Token Highlight Box */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Order / Token Number
                </span>
                <div className="text-3xl font-black text-slate-900 font-mono tracking-tight text-orange-600">
                  #{completedOrder.orderNumber}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="bg-orange-100 text-orange-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                    {completedOrder.orderType === "TAKEAWAY" ? "TAKEAWAY" : "COUNTER DINE-IN"}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-500 font-mono text-xs">{completedOrder.time}</span>
                </div>
              </div>

              {/* Customer Info (if added) */}
              {(completedOrder.customerName || completedOrder.customerPhone) && (
                <div className="bg-orange-50/60 border border-orange-100 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <User size={13} className="text-orange-500" />
                    Customer:
                  </span>
                  <span className="font-bold text-slate-800">
                    {completedOrder.customerName || "Guest"}
                    {completedOrder.customerPhone ? ` • ${completedOrder.customerPhone}` : ""}
                  </span>
                </div>
              )}

              {/* Items Summary */}
              <div className="space-y-2 border-y border-slate-100 py-3 max-h-48 overflow-y-auto scrollbar-thin">
                <div className="text-xs font-bold text-slate-700">Order Items:</div>
                {completedOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-600">
                    <span className="font-medium">
                      <span className="font-bold text-orange-600">{i.quantity}x</span> {i.name}
                    </span>
                    <span className="font-semibold text-slate-900">₹{i.price * i.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Amount Paid/Payable */}
              <div className="flex items-center justify-between bg-orange-50/80 border border-orange-100 p-3.5 rounded-2xl">
                <div>
                  <div className="text-[11px] font-semibold text-orange-800">Total Bill Amount</div>
                  <div className="text-xl font-black text-slate-900">₹{completedOrder.grandTotal}</div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-xl text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>KOT Sent Live</span>
                </div>
              </div>

              {/* Quick Pay Buttons */}
              {!completedOrder.isPaid ? (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Quick Collect Payment:</span>
                    <span className="text-[10px] text-orange-600 font-semibold">1-Click Counter Pay</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={paying}
                      onClick={() => handleQuickPay("CASH")}
                      className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <span>💵 Cash</span>
                    </button>
                    <button
                      type="button"
                      disabled={paying}
                      onClick={() => handleQuickPay("UPI")}
                      className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <span>📱 UPI</span>
                    </button>
                    <button
                      type="button"
                      disabled={paying}
                      onClick={() => handleQuickPay("CARD")}
                      className="py-2.5 px-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <span>💳 Card</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-extrabold text-xs flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>Bill Paid via {completedOrder.paymentMethod || "PAID"}</span>
                  </div>
                  <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                    CLEARED
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletedOrder(null)}
                  className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Next Customer (Ready for New Order)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBillModal(true)}
                    className="py-2.5 px-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/20"
                  >
                    <Receipt size={14} />
                    <span>Print Hotel Bill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Print Token Slip</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/orders/${completedOrder._id}`)}
                  className="w-full py-1.5 text-center text-slate-400 hover:text-slate-600 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Order Details & Status</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Guest Bill / Tax Invoice Modal */}
      {completedOrder && (
        <PrintInvoiceModal
          isOpen={showBillModal}
          onClose={() => setShowBillModal(false)}
          order={completedOrder}
          invoice={null}
        />
      )}

      {/* ========================================================= */}
      {/* THERMAL PRINTABLE TOKEN SLIP (Visible ONLY when printing) */}
      {/* ========================================================= */}
      {completedOrder && (
        <div id="printable-pos-token" className="hidden print:block">
          <div
            style={{
              width: "280px",
              margin: "0 auto",
              padding: "8px",
              fontFamily: "Courier, monospace, sans-serif",
              fontSize: "12px",
              color: "#000000",
              backgroundColor: "#ffffff",
              lineHeight: "1.35",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: "6px", marginBottom: "6px" }}>
              <div style={{ fontSize: "16px", fontWeight: "900", letterSpacing: "1px" }}>YUMMY YARDS</div>
              <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}>Food Court Counter Token</div>
              <div style={{ fontSize: "9px", color: "#444" }}>Pro Billing Centre • Express Food</div>
            </div>

            {/* Token Number Highlight */}
            <div style={{ textAlign: "center", borderBottom: "2px dashed #000", paddingBottom: "8px", marginBottom: "6px" }}>
              <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                TOKEN NUMBER
              </div>
              <div style={{ fontSize: "26px", fontWeight: "900", letterSpacing: "1px", margin: "2px 0" }}>
                #{completedOrder.orderNumber}
              </div>
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                {completedOrder.orderType === "TAKEAWAY" ? "TAKEAWAY / PARCEL" : "COUNTER DINE-IN"}
              </div>
              <div style={{ fontSize: "10px", color: "#333", marginTop: "2px" }}>
                {completedOrder.time} • {new Date().toLocaleDateString("en-GB")}
              </div>
            </div>

            {/* Cashier / Server Stamp */}
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #000", paddingBottom: "4px", marginBottom: "5px", fontSize: "10px" }}>
              <span><strong>Cashier:</strong> {completedOrder.cashierName || user?.name || "Cashier"}</span>
              <span><strong>KOT:</strong> #{completedOrder.kotNumber}</span>
            </div>

            {/* Customer Details */}
            {(completedOrder.customerName || completedOrder.customerPhone) && (
              <div style={{ borderBottom: "1px dashed #000", paddingBottom: "5px", marginBottom: "6px", fontSize: "11px" }}>
                <div><strong>Customer:</strong> {completedOrder.customerName || "Walk-in Guest"}</div>
                {completedOrder.customerPhone && <div><strong>Phone:</strong> {completedOrder.customerPhone}</div>}
              </div>
            )}

            {/* Items Table */}
            <div style={{ borderBottom: "1px dashed #000", paddingBottom: "6px", marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "3px", marginBottom: "4px", fontSize: "11px" }}>
                <span style={{ flex: 1 }}>ITEM</span>
                <span style={{ width: "30px", textAlign: "center" }}>QTY</span>
                <span style={{ width: "55px", textAlign: "right" }}>AMT</span>
              </div>
              {completedOrder.items.map((i, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontSize: "11px" }}>
                  <span style={{ flex: 1, paddingRight: "4px", wordBreak: "break-word" }}>{i.name}</span>
                  <span style={{ width: "30px", textAlign: "center", fontWeight: "bold" }}>{i.quantity}</span>
                  <span style={{ width: "55px", textAlign: "right", fontWeight: "bold" }}>₹{(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div style={{ borderBottom: "2px dashed #000", paddingBottom: "6px", marginBottom: "6px", fontSize: "11px" }}>
              {completedOrder.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Discount:</span>
                  <span>-₹{Number(completedOrder.discount).toFixed(2)}</span>
                </div>
              )}
              {completedOrder.taxAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>GST ({completedOrder.taxRate || 5}%):</span>
                  <span>₹{Number(completedOrder.taxAmount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "900", marginTop: "3px", borderTop: "1px solid #000", paddingTop: "3px" }}>
                <span>TOTAL:</span>
                <span>₹{Number(completedOrder.grandTotal).toFixed(2)}</span>
              </div>
              <div style={{ fontSize: "11px", fontWeight: "bold", marginTop: "3px" }}>
                Payment: {completedOrder.isPaid ? `PAID (${completedOrder.paymentMethod || "CASH"})` : "PAYMENT DUE AT COUNTER"}
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", fontSize: "9px", color: "#333", marginTop: "6px", lineHeight: "1.4" }}>
              <div style={{ fontWeight: "bold" }}>*** PLEASE COLLECT FOOD AT COUNTER ***</div>
              <div>Thank You & Visit Again!</div>
              <div style={{ fontSize: "8px", fontWeight: "bold", color: "#555", marginTop: "4px", borderTop: "1px dashed #ccc", paddingTop: "4px", letterSpacing: "0.5px" }}>
                Powered by Dremonix Solution
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print CSS Isolation Rule */}
      <style>{`
        @media print {
          /* Hide all application content, modals, background grids, headers, navbars */
          body * {
            visibility: hidden !important;
          }

          /* Unhide and isolate the printable token slip */
          #printable-pos-token,
          #printable-pos-token * {
            visibility: visible !important;
          }

          #printable-pos-token {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          @page {
            margin: 0mm;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
