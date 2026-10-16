import { useRef, useState } from "react";
import { Printer, X, ChefHat, CheckCircle2, Receipt, FileText, Smartphone } from "lucide-react";

/**
 * Converts numeric amount to Indian Currency Words
 */
function convertNumberToWords(amount) {
  if (!amount || isNaN(amount) || amount === 0) return "Rupees Zero Only";
  const num = Math.round(Number(amount));
  const single = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const double = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(n) {
    if (n < 10) return single[n];
    if (n < 20) return double[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + single[n % 10] : "");
  }

  function convertThreeDigits(n) {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h && rem) return single[h] + " Hundred and " + convertTwoDigits(rem);
    if (h) return single[h] + " Hundred";
    return convertTwoDigits(rem);
  }

  let result = "";
  const crore = Math.floor(num / 10000000);
  let rem = num % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  if (crore) result += convertThreeDigits(crore) + " Crore ";
  if (lakh) result += convertThreeDigits(lakh) + " Lakh ";
  if (thousand) result += convertThreeDigits(thousand) + " Thousand ";
  if (rem) result += convertThreeDigits(rem);

  return `Rupees ${result.trim()} Only`;
}

export default function PrintInvoiceModal({ isOpen, onClose, order, invoice, restaurantSettings }) {
  const [printFormat, setPrintFormat] = useState("THERMAL"); // "THERMAL" (80mm) or "A4"

  if (!isOpen || !order) return null;

  const restaurantName = restaurantSettings?.restaurantName || "YUMMY YARDS HOTEL & RESTAURANT";
  const address = restaurantSettings?.address || "Janpath, Bhubaneswar, Odisha - 751001";
  const phone = restaurantSettings?.phone || "+91-9000000000";
  const gstin = restaurantSettings?.gstin || "21ABCDE1234F1Z5";
  const fssai = restaurantSettings?.fssai || "12024999000012";
  const sacCode = "996331"; // Standard GST SAC Code for Restaurant Services

  const invoiceNumber = invoice?.invoiceNumber || `INV-${order.orderNumber?.replace(/^#?ORD-/, "") || "0001"}`;
  
  const createdDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateFormatted = createdDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeFormatted = createdDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const taxAmount = Number(order.taxAmount) || 0;
  const roundOff = Number(order.roundOff) || 0;
  const grandTotal = Number(order.grandTotal) || (taxable + taxAmount);

  // Dynamic GST calculation
  const effectiveTaxRate = taxable > 0 && taxAmount > 0
    ? Math.round((taxAmount / taxable) * 100 * 10) / 10
    : (order.items?.[0]?.taxPercent || 0);

  const halfTaxRate = (effectiveTaxRate / 2).toFixed(1);
  const halfTaxAmount = (taxAmount / 2).toFixed(2);

  const totalQuantity = (order.items || []).reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
  const totalItemsCount = order.items?.length || 0;

  const paymentStatus = order.paymentStatus || invoice?.paymentStatus || "UNPAID";
  const cashierName = order.createdBy?.name || "Cashier Desk";
  const customerName = order.customer?.name || "Walk-in Guest";
  const customerPhone = order.customer?.phone || "";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      {/* Modal Dialog Card */}
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Controls Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Hotel Guest Bill / Tax Invoice</h3>
              <p className="text-[10px] text-slate-400 font-medium">Order #{order.orderNumber}</p>
            </div>
          </div>

          {/* Format Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setPrintFormat("THERMAL")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                printFormat === "THERMAL"
                  ? "bg-white text-orange-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone size={12} />
              <span>80mm Thermal (POS)</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat("A4")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                printFormat === "A4"
                  ? "bg-white text-orange-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={12} />
              <span>A4 Hotel Invoice</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Preview Container */}
        <div className="p-4 overflow-y-auto bg-slate-100/70 flex justify-center flex-1">
          
          {/* ========================================================= */}
          {/* 1. THERMAL 80MM HOTEL BILL RECEIPT FORMAT (Default POS)   */}
          {/* ========================================================= */}
          {printFormat === "THERMAL" && (
            <div
              id="printable-receipt"
              className="bg-white p-4 shadow-sm border border-slate-200 w-full max-w-[340px] text-[11px] font-mono leading-tight text-slate-900 select-none"
            >
              {/* Hotel / Restaurant Brand Header */}
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <h2 className="text-sm font-black uppercase tracking-tight text-slate-950 font-sans">
                  {restaurantName}
                </h2>
                <p className="text-[10px] text-slate-600 font-sans mt-0.5">{address}</p>
                <p className="text-[10px] text-slate-600 font-sans">Ph: {phone}</p>
                <div className="pt-1 text-[9px] text-slate-700 font-sans space-y-0.5">
                  <p><span className="font-bold">FSSAI Lic No:</span> {fssai}</p>
                  <p><span className="font-bold">GSTIN:</span> {gstin} | <span className="font-bold">SAC:</span> {sacCode}</p>
                </div>
                <div className="mt-1.5 py-0.5 px-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider inline-block rounded font-sans">
                  TAX INVOICE / GUEST BILL
                </div>
              </div>

              {/* Bill Details / Metadata */}
              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span><b className="font-sans">Bill No:</b> {invoiceNumber}</span>
                  <span><b className="font-sans">Date:</b> {dateFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    <b className="font-sans">Type:</b> {order.orderType}
                    {order.table?.number ? ` (Table ${order.table.number})` : ""}
                  </span>
                  <span><b className="font-sans">Time:</b> {timeFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span><b className="font-sans">Token:</b> #{order.orderNumber?.replace(/^#?ORD-/, "")}</span>
                  <span><b className="font-sans">Cashier:</b> {cashierName}</span>
                </div>
                {(customerName !== "Walk-in Guest" || customerPhone) && (
                  <div className="pt-0.5 flex justify-between border-t border-slate-200">
                    <span><b className="font-sans">Guest:</b> {customerName}</span>
                    {customerPhone && <span><b className="font-sans">Mob:</b> {customerPhone}</span>}
                  </div>
                )}
              </div>

              {/* Itemized Table */}
              <div className="py-2 border-b border-dashed border-slate-400">
                <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-slate-300">
                  <span className="w-6 text-left">#</span>
                  <span className="flex-1 text-left">ITEM</span>
                  <span className="w-8 text-center">QTY</span>
                  <span className="w-12 text-right">RATE</span>
                  <span className="w-14 text-right">AMOUNT</span>
                </div>

                <div className="pt-1.5 space-y-1.5 divide-y divide-slate-100">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] pt-1 first:pt-0">
                      <span className="w-6 text-slate-500">{idx + 1}</span>
                      <span className="flex-1 font-semibold truncate pr-1">{item.name}</span>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <span className="w-12 text-right">{item.price.toFixed(2)}</span>
                      <span className="w-14 text-right font-bold">{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Item Count & Subtotal Summary */}
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between text-[10px] text-slate-500 pb-0.5">
                  <span>Total Items: <b>{totalItemsCount}</b></span>
                  <span>Total Qty: <b>{totalQuantity}</b></span>
                </div>
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span>Net Taxable Value:</span>
                    <span>₹{taxable.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 ? (
                  <>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>CGST ({halfTaxRate}%):</span>
                      <span>₹{halfTaxAmount}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>SGST ({halfTaxRate}%):</span>
                      <span>₹{halfTaxAmount}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>GST (0% - Exempted):</span>
                    <span>₹0.00</span>
                  </div>
                )}
                {roundOff !== 0 && (
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Round Off:</span>
                    <span>{roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
                  </div>
                )}
              </div>

              {/* Grand Total Highlight */}
              <div className="py-2 border-b-2 border-slate-900 border-t-2 my-1">
                <div className="flex justify-between items-center text-sm font-black text-slate-950">
                  <span>GRAND TOTAL:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Amount in Words */}
              <div className="py-1 text-[9px] text-slate-600 italic border-b border-dashed border-slate-300">
                <span>{convertNumberToWords(grandTotal)}</span>
              </div>

              {/* Payment Details */}
              <div className="py-1.5 border-b border-dashed border-slate-400 text-[10px] flex items-center justify-between">
                <span><b className="font-sans">Payment Mode:</b> {order.paymentMethod || "CASH / COUNTER"}</span>
                <span className="font-bold text-emerald-700 px-1.5 py-0.2 bg-emerald-50 rounded">
                  {paymentStatus === "PAID" ? "✓ PAID & SETTLED" : "UNPAID"}
                </span>
              </div>

              {/* GST Tax Slab Summary Breakdown Table */}
              {taxAmount > 0 && (
                <div className="py-1.5 border-b border-dashed border-slate-400 text-[9px]">
                  <div className="font-bold text-slate-700 pb-0.5">GST Tax Breakdown:</div>
                  <div className="grid grid-cols-4 text-center font-bold bg-slate-100 py-0.5">
                    <span>Rate</span>
                    <span>Taxable</span>
                    <span>CGST+SGST</span>
                    <span>Total Tax</span>
                  </div>
                  <div className="grid grid-cols-4 text-center pt-0.5 text-slate-700">
                    <span>{effectiveTaxRate}%</span>
                    <span>{taxable.toFixed(2)}</span>
                    <span>{halfTaxAmount}+{halfTaxAmount}</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Hotel Footer & Hospitality Greetings */}
              <div className="text-center pt-2.5 space-y-1 font-sans">
                <p className="font-extrabold text-[11px] text-slate-900 uppercase tracking-tight">
                  *** Thank You For Dining With Us! ***
                </p>
                <p className="text-[10px] text-slate-600">Please Visit Again • Have A Delicious Day!</p>
                <p className="text-[8px] text-slate-400">Goods once sold will not be exchanged or returned.</p>
                
                {/* Branding Tagline */}
                <div className="pt-2 border-t border-dashed border-slate-300 mt-2">
                  <p className="text-[9px] font-bold text-slate-600 tracking-wider">
                    Powered by Dremonix Solution
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. FORMAL A4 / A5 HOTEL RESTAURANT TAX INVOICE FORMAT     */}
          {/* ========================================================= */}
          {printFormat === "A4" && (
            <div
              id="printable-receipt"
              className="bg-white p-6 shadow-sm border border-slate-300 w-full max-w-[500px] text-xs font-sans text-slate-900 leading-normal select-none"
            >
              {/* Hotel Header Banner */}
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                    {restaurantName}
                  </h1>
                  <p className="text-[11px] text-slate-600 mt-0.5">{address}</p>
                  <p className="text-[11px] text-slate-600">Tel: {phone} • SAC Code: {sacCode}</p>
                  <div className="flex gap-3 text-[10px] text-slate-700 font-bold mt-1">
                    <span>GSTIN: {gstin}</span>
                    <span>FSSAI: {fssai}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-orange-50 border border-orange-200 px-3 py-1 rounded-lg text-orange-800 font-black text-xs uppercase tracking-wider inline-block">
                    Tax Invoice / Bill
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Original for Recipient</div>
                </div>
              </div>

              {/* Guest & Bill Info Box */}
              <div className="grid grid-cols-2 gap-3 my-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
                <div>
                  <p className="text-slate-500 font-medium text-[10px]">INVOICE DETAILS</p>
                  <p className="font-bold text-slate-900">Invoice No: {invoiceNumber}</p>
                  <p className="text-slate-700">Date: {dateFormatted} {timeFormatted}</p>
                  <p className="text-slate-700">Order Ref: #{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-medium text-[10px]">GUEST & TABLE INFO</p>
                  <p className="font-bold text-slate-900">
                    {order.orderType} {order.table?.number ? `• Table ${order.table.number}` : ""}
                  </p>
                  <p className="text-slate-700">Guest: {customerName} {customerPhone ? `(${customerPhone})` : ""}</p>
                  <p className="text-slate-700">Billed by: {cashierName}</p>
                </div>
              </div>

              {/* Table of Food Items */}
              <table className="w-full text-[11px] border-collapse my-3">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-300 font-bold text-slate-700 text-left">
                    <th className="py-1.5 px-2 w-8">#</th>
                    <th className="py-1.5 px-2">Item Description</th>
                    <th className="py-1.5 px-2 text-center w-12">Qty</th>
                    <th className="py-1.5 px-2 text-right w-16">Rate (₹)</th>
                    <th className="py-1.5 px-2 text-right w-20">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-1.5 px-2 text-slate-500">{idx + 1}</td>
                      <td className="py-1.5 px-2 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-1.5 px-2 text-center font-bold">{item.quantity}</td>
                      <td className="py-1.5 px-2 text-right">{item.price.toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-right font-bold">{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation & Breakdown */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-300">
                <div className="space-y-1 text-[10px] text-slate-600">
                  <p><b className="text-slate-800">Amount in Words:</b></p>
                  <p className="italic font-serif text-slate-800">{convertNumberToWords(grandTotal)}</p>
                  <div className="pt-2">
                    <p><b className="text-slate-800">Payment Mode:</b> {order.paymentMethod || "CASH / COUNTER"}</p>
                    <p><b className="text-slate-800">Payment Status:</b> {paymentStatus === "PAID" ? "PAID & SETTLED" : "UNPAID"}</p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <>
                      <div className="flex justify-between text-slate-600 text-[10px]">
                        <span>CGST @ {halfTaxRate}%:</span>
                        <span>₹{halfTaxAmount}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[10px]">
                        <span>SGST @ {halfTaxRate}%:</span>
                        <span>₹{halfTaxAmount}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between font-black text-sm text-slate-950 pt-1.5 border-t-2 border-slate-900 mt-1">
                    <span>GRAND TOTAL:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-3 border-t border-dashed border-slate-300 text-center space-y-1">
                <p className="font-bold text-xs text-slate-900">Thank you for dining with us! Please visit again.</p>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wider">
                  Powered by Dremonix Solution
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer Bar */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Selected: <span className="font-bold text-slate-800">{printFormat === "THERMAL" ? "80mm POS Roll" : "A4 Tax Invoice"}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handlePrint}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print {printFormat === "THERMAL" ? "Hotel Bill (80mm)" : "A4 Invoice"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* EMBEDDED PRINT STYLESHEET (Controls Print Engine)         */}
      {/* ========================================================= */}
      <style>{`
        @media print {
          @page {
            size: ${printFormat === "THERMAL" ? "80mm auto" : "A4 portrait"};
            margin: ${printFormat === "THERMAL" ? "0mm" : "10mm"};
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
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
            width: ${printFormat === "THERMAL" ? "78mm !important" : "100% !important"};
            max-width: ${printFormat === "THERMAL" ? "80mm !important" : "750px !important"};
            margin: 0 auto !important;
            padding: ${printFormat === "THERMAL" ? "3mm 2mm !important" : "5mm !important"};
            border: none !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}
