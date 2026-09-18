import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Plus, ChefHat, Wallet, UtensilsCrossed } from "lucide-react";

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
        <Zap size={18} className="text-amber-500 fill-amber-500" />
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => navigate("/pos")}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-xs py-2.5 px-3 rounded-xl shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus size={15} />
          <span>New Order</span>
        </button>

        <button
          onClick={() => navigate("/kitchen")}
          className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-xl border border-slate-200 transition-all hover:border-slate-300"
        >
          <ChefHat size={15} className="text-slate-500" />
          <span>View KOTs</span>
        </button>

        <button
          onClick={() => navigate("/expenses")}
          className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-xl border border-slate-200 transition-all hover:border-slate-300"
        >
          <Wallet size={15} className="text-slate-500" />
          <span>Add Expense</span>
        </button>

        <button
          onClick={() => navigate("/menu")}
          className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-xl border border-slate-200 transition-all hover:border-slate-300"
        >
          <UtensilsCrossed size={15} className="text-slate-500" />
          <span>Manage Menu</span>
        </button>
      </div>
    </div>
  );
}
