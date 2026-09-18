import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, Package } from "lucide-react";
import EmptyState from "./EmptyState";

export default function RecentOrders({ orders = [] }) {
  const hasOrders = Array.isArray(orders) && orders.length > 0;

  const STATUS_BADGES = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    PREPARING: "bg-blue-50 text-blue-700 border-blue-200",
    READY: "bg-emerald-50 text-emerald-700 border-emerald-200",
    COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList size={18} className="text-amber-500" />
          Recent Orders
        </h3>
        <Link
          to="/orders"
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group transition-colors"
        >
          <span>View All</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {!hasOrders ? (
        <div className="flex-1 flex items-center justify-center min-h-[180px]">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Orders will appear here once you start receiving them."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Table</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.slice(0, 5).map((order) => {
                const badgeClass =
                  STATUS_BADGES[order.orderStatus] || "bg-slate-100 text-slate-600 border-slate-200";
                const orderTime = order.createdAt
                  ? new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "-";

                return (
                  <tr key={order._id || order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      #{order.orderNumber || order._id?.slice(-4)}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{orderTime}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {order.table?.tableNumber ? `T-${order.table.tableNumber}` : "N/A"}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{order.customerName || "Walk-in"}</td>
                    <td className="py-3 px-3 text-slate-500">{order.items?.length || 0} items</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      ₹{(order.grandTotal || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}>
                        {order.orderStatus || "PENDING"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
