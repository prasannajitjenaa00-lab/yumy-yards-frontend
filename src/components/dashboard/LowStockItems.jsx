import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Box } from "lucide-react";
import EmptyState from "./EmptyState";

export default function LowStockItems({ items = [] }) {
  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle size={18} className="text-rose-500" />
          Low Stock Items
        </h3>
        <Link
          to="/inventory"
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group transition-colors"
        >
          <span>View All</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {!hasItems ? (
        <div className="flex-1 flex items-center justify-center min-h-[180px]">
          <EmptyState
            icon={Box}
            title="No low stock items"
            description="You're all stocked up! 🎉"
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3">Current Stock</th>
                <th className="py-2.5 px-3">Threshold</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.slice(0, 5).map((item) => (
                <tr key={item._id || item.id || item.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {item.name}
                  </td>
                  <td className="py-3 px-3 font-bold text-rose-600">
                    {item.currentStock} {item.unit || ""}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {item.minimumStock || item.threshold || 0} {item.unit || ""}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      Low Stock
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
