import { useRef } from "react";
import { Printer, X, ChefHat, CheckCircle2 } from "lucide-react";

export default function PrintInvoiceModal({ isOpen, onClose, order, invoice, restaurantSettings }) {
  const printRef = useRef(null);

  if (!isOpen || !order) return null;

  const restaurantName = restaurantSettings?.restaurantName || "Yummy Yards";
  const address = restaurantSettings?.address || "Janpath, Bhubaneswar, Odisha";
  const phone = restaurantSettings?.phone || "+91-9000000000";
  const gstin = restaurantSettings?.gstin || "21ABCDE1234F1Z5";

  const invoiceNumber = invoice?.invoiceNumber || `INV-${order.orderNumber?.replace(/^#?ORD-/, "") || "0001"}`;
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) : new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tax Invoice / Receipt</h3>
              <p className="text-[10px] text-slate-400">Order #{order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono select-none" ref={printRef} id="printable-receipt">
          {/* Restaurant Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <h2 className="text-base font-black text-slate-900 tracking-tight font-sans">{restaurantName}</h2>
            <p className="text-[11px] text-slate-500 font-sans">{address}</p>
            <p className="text-[11px] text-slate-500 font-sans">Phone: {phone}</p>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">GSTIN: {gstin}</p>
            <div className="inline-block bg-slate-100 px-3 py-0.5 rounded-full text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-1">
              RESTAURANT TAX INVOICE
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-2 text-[11px] py-1 border-b border-dashed border-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px]">Invoice No:</span>
              <span className="font-bold text-slate-800">{invoiceNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Date & Time:</span>
              <span className="font-semibold text-slate-800">{createdAt}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Order Type / Table:</span>
              <span className="font-semibold text-slate-800">
                {order.orderType} {order.table ? `(Table ${order.table.number})` : ""}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Customer:</span>
              <span className="font-semibold text-slate-800">{order.customer?.name || "Walk-in Customer"}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 py-1">
            <div className="grid grid-cols-12 font-bold text-slate-400 text-[10px] uppercase border-b border-slate-200 pb-1">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            <div className="space-y-1.5 divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] pt-1.5 first:pt-0">
                  <span className="col-span-6 font-bold text-slate-800 truncate">{item.name}</span>
                  <span className="col-span-2 text-center text-slate-600 font-semibold">{item.quantity}</span>
                  <span className="col-span-2 text-right text-slate-600">₹{item.price}</span>
                  <span className="col-span-2 text-right font-bold text-slate-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₹{order.subtotal || 0}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>CGST (2.5%):</span>
              <span>₹{(order.taxAmount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>SGST (2.5%):</span>
              <span>₹{(order.taxAmount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-slate-900 border-t border-b border-slate-900 py-1.5 mt-2">
              <span>GRAND TOTAL:</span>
              <span>₹{order.grandTotal}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center space-y-1 pt-2">
            <p className="font-bold text-slate-800 text-[11px] font-sans">Thank you for dining with us!</p>
            <p className="text-[10px] text-slate-400 font-sans">Please visit again • Yummy Yards POS</p>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Embedded Print CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
