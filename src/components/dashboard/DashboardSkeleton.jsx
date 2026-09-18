import React from "react";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-7 w-64 bg-slate-200 rounded-md mb-2"></div>
          <div className="h-4 w-80 bg-slate-200 rounded-md"></div>
        </div>
        <div className="h-10 w-48 bg-slate-200 rounded-xl"></div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
              <div className="w-9 h-9 rounded-full bg-slate-200"></div>
            </div>
            <div className="h-7 w-20 bg-slate-200 rounded my-1"></div>
            <div className="h-3 w-32 bg-slate-150 rounded"></div>
          </div>
        ))}
      </div>

      {/* Middle Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 h-80">
          <div className="h-5 w-40 bg-slate-200 rounded mb-4"></div>
          <div className="h-56 bg-slate-100 rounded-xl w-full"></div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 h-44">
            <div className="h-5 w-32 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-150 rounded w-full"></div>
              <div className="h-4 bg-slate-150 rounded w-full"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 h-32">
            <div className="h-5 w-32 bg-slate-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-9 bg-slate-200 rounded-lg"></div>
              <div className="h-9 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
