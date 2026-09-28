/**
 * Centralized Status Constants for Yummy Yards HR & Attendance
 */

export const ATTENDANCE_STATUS = {
  PRESENT: {
    key: "PRESENT",
    label: "Present",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cardClass: "bg-[#ecfdf5] border-[#a7f3d0] text-emerald-900 hover:border-emerald-400",
    dotColor: "bg-emerald-500",
    iconColor: "text-emerald-600",
  },
  LATE: {
    key: "LATE",
    label: "Late",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    cardClass: "bg-[#fffbeb] border-[#fde68a] text-amber-900 hover:border-amber-400",
    dotColor: "bg-amber-500",
    iconColor: "text-amber-600",
  },
  HALF_DAY: {
    key: "HALF_DAY",
    label: "Half Day",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    cardClass: "bg-[#fff7ed] border-[#fed7aa] text-orange-900 hover:border-orange-400",
    dotColor: "bg-orange-500",
    iconColor: "text-orange-600",
  },
  ON_LEAVE: {
    key: "ON_LEAVE",
    label: "On Leave",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    cardClass: "bg-[#eff6ff] border-[#bfdbfe] text-blue-900 hover:border-blue-400",
    dotColor: "bg-blue-500",
    iconColor: "text-blue-600",
  },
  HOLIDAY: {
    key: "HOLIDAY",
    label: "Holiday",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    cardClass: "bg-[#faf5ff] border-[#e9d5ff] text-purple-900 hover:border-purple-400",
    dotColor: "bg-purple-500",
    iconColor: "text-purple-600",
  },
  WEEKLY_OFF: {
    key: "WEEKLY_OFF",
    label: "Weekly Off",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    cardClass: "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300",
    dotColor: "bg-slate-400",
    iconColor: "text-slate-500",
  },
  SPECIAL_OFF: {
    key: "SPECIAL_OFF",
    label: "Special Off",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    cardClass: "bg-[#fffbeb] border-[#fde68a] text-amber-900 hover:border-amber-400",
    dotColor: "bg-amber-500",
    iconColor: "text-amber-500",
  },
  RESTAURANT_CLOSED: {
    key: "RESTAURANT_CLOSED",
    label: "Restaurant Closed",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    cardClass: "bg-[#fef2f2] border-[#fecaca] text-rose-900 hover:border-rose-400",
    dotColor: "bg-rose-500",
    iconColor: "text-rose-600",
  },
  ABSENT: {
    key: "ABSENT",
    label: "Absent",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    cardClass: "bg-[#fef2f2] border-[#fecaca] text-rose-900 hover:border-rose-400",
    dotColor: "bg-rose-500",
    iconColor: "text-rose-600",
  },
  NO_RECORD: {
    key: "NO_RECORD",
    label: "No Record",
    badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
    cardClass: "bg-white border-slate-100 text-slate-700 hover:border-slate-300",
    dotColor: "bg-slate-300",
    iconColor: "text-slate-400",
  },
};

export const LEAVE_STATUS = {
  PENDING: {
    key: "PENDING",
    label: "Pending",
    badgeClass: "bg-amber-100 text-amber-800 border border-amber-200",
    color: "amber",
  },
  APPROVED: {
    key: "APPROVED",
    label: "Approved",
    badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    color: "emerald",
  },
  REJECTED: {
    key: "REJECTED",
    label: "Rejected",
    badgeClass: "bg-rose-100 text-rose-800 border border-rose-200",
    color: "rose",
  },
  CANCELLED: {
    key: "CANCELLED",
    label: "Cancelled",
    badgeClass: "bg-slate-100 text-slate-600 border border-slate-200",
    color: "slate",
  },
};

export const LEAVE_TYPES = {
  CASUAL: { key: "CASUAL", label: "Casual Leave", defaultTotal: 12, color: "blue" },
  SICK: { key: "SICK", label: "Sick Leave", defaultTotal: 7, color: "emerald" },
  ANNUAL: { key: "ANNUAL", label: "Annual Leave", defaultTotal: 15, color: "purple" },
  EMERGENCY: { key: "EMERGENCY", label: "Emergency Leave", defaultTotal: 3, color: "rose" },
  UNPAID: { key: "UNPAID", label: "Unpaid Leave", defaultTotal: 999, color: "slate" },
};
