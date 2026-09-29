import React from "react";
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  BookOpen,
  Headphones,
} from "lucide-react";

export default function SupportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
              <Headphones size={22} />
            </div>
            <div>
              <h2 id="support-modal-title" className="text-base font-extrabold text-white">
                Yummy Yards Support Center
              </h2>
              <p className="text-xs text-slate-300">We're here to help you run smoothly</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Support"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200 scrollbar-thin">
          {/* Status Indicator */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                All Billing & POS Systems Operational
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
              Live
            </span>
          </div>

          {/* Quick Contact Options */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Direct Assistance Channels
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone Hotline */}
              <a
                href="tel:+919876543210"
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-orange-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-orange-300 transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-600">
                    Phone Support
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    +91 98765 43210
                  </div>
                </div>
              </a>

              {/* WhatsApp Support */}
              <a
                href="https://wa.me/919876543210?text=Hello%20Yummy%20Yards%20Support,%20I%20need%20help%20with%20my%20Billing%20Centre"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageSquare size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                    WhatsApp Chat
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Instant Messaging
                  </div>
                </div>
              </a>

              {/* Email Support */}
              <a
                href="mailto:support@yummyyards.com?subject=Support%20Request%20-%20Yummy%20Yards%20Billing"
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 transition-all flex items-center gap-3 group sm:col-span-2"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                    Email Desk
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    support@yummyyards.com (Avg response: 15 mins)
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400" />
              </a>
            </div>
          </div>

          {/* Quick FAQ / Self Help Guides */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Common Questions
            </span>

            <div className="space-y-2 text-xs">
              <details className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
                <summary className="font-bold text-slate-800 dark:text-slate-200 select-none">
                  How do I bill a table and print KOT?
                </summary>
                <p className="mt-2 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Go to POS, select the table number, tap items to add to order, and click "Send KOT". The kitchen display will update immediately.
                </p>
              </details>

              <details className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
                <summary className="font-bold text-slate-800 dark:text-slate-200 select-none">
                  How does staff punch attendance?
                </summary>
                <p className="mt-2 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Navigate to Attendance from the sidebar or mobile bottom bar, then tap "Check In". You can also start and end breaks from the same card.
                </p>
              </details>

              <details className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
                <summary className="font-bold text-slate-800 dark:text-slate-200 select-none">
                  Where can I find sales and GST reports?
                </summary>
                <p className="mt-2 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Owners and Managers can view detailed daily/monthly reports under the "Reports" section, including payment modes, order breakdown, and GST tax reports.
                </p>
              </details>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock size={14} className="text-orange-500" />
              Hours: Mon – Sun, 8:00 AM – 11:00 PM IST
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">v1.0.0 Pro</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
