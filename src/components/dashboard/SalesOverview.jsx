import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { BarChart2, ChevronDown } from "lucide-react";
import EmptyState from "./EmptyState";

export default function SalesOverview({ salesData }) {
  const [timeframe, setTimeframe] = useState("7days");

  // Transform data object { "2025-09-11": 0, ... } or empty to array
  const rawEntries = Object.entries(salesData?.byDay || {});
  const hasData = rawEntries.length > 0 && rawEntries.some(([_, val]) => val > 0);

  const chartData = rawEntries.map(([dateStr, total]) => {
    let formattedLabel = dateStr;
    try {
      const d = new Date(dateStr);
      formattedLabel = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    } catch (e) {
      formattedLabel = dateStr;
    }
    return {
      date: formattedLabel,
      fullDate: dateStr,
      sales: total || 0,
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-semibold text-slate-300">{payload[0].payload.fullDate || label}</p>
          <p className="text-orange-400 font-bold text-sm">
            Sales: ₹{payload[0].value.toLocaleString("en-IN")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 size={18} className="text-orange-500" />
            Sales Overview
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Your sales for the last 7 days</p>
        </div>

        <div className="relative inline-block text-left">
          <button
            type="button"
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span>Last 7 Days</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>
      </div>

      {!hasData && chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[220px]">
          <EmptyState
            icon={BarChart2}
            title="No sales data yet"
            description="Sales analytics will appear here once orders are completed."
          />
        </div>
      ) : (
        <div className="w-full h-64 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salesGradient)"
                dot={{ r: 4, fill: "#f97316", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6, fill: "#ea580c", strokeWidth: 3, stroke: "#ffffff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
