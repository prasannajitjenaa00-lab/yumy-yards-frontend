import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Settings as SettingsIcon,
  Store,
  Receipt,
  Percent,
  Save,
  Building,
  Phone,
  MapPin,
  CheckCircle2,
  Info,
} from "lucide-react";
import api from "../../services/api";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/settings");
      setSettings(res.data.data);
    } catch (err) {
      toast.error("Failed to load restaurant settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put("/settings", settings);
      toast.success("Restaurant settings updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3">
        <SettingsIcon className="w-10 h-10 animate-spin mx-auto text-orange-400" />
        <p className="text-sm font-medium text-slate-600">Loading restaurant configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 shadow-inner">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Restaurant Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Configure restaurant identity, GST details, tax rates, and billing options</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
            {/* 1. Restaurant Identity Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Store className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-slate-900">Restaurant Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Restaurant Name *</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={settings.restaurantName || ""}
                      onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={settings.phone || ""}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Address *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={settings.address || ""}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GST & Tax Rates Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Receipt className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900">Tax & GST Configuration</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={settings.gstin || ""}
                    onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                    placeholder="e.g. 21ABCDE1234F1Z5"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total GST Rate (%)</label>
                  <div className="relative">
                    <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      step="0.1"
                      value={settings.gstPercent ?? 5}
                      onChange={(e) => setSettings({ ...settings, gstPercent: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CGST Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.cgstPercent ?? 2.5}
                    onChange={(e) => setSettings({ ...settings, cgstPercent: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SGST Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.sgstPercent ?? 2.5}
                    onChange={(e) => setSettings({ ...settings, sgstPercent: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Save Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Column: Information & Quick Tips */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Info className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900">Billing Information</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ensure your GST number and restaurant contact details are up to date. These details will be printed on customer invoices and KOT slips.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
              <div className="text-[11px] text-slate-600 flex justify-between">
                <span className="font-medium text-slate-500">Tax Application:</span>
                <span className="font-semibold text-slate-900">Real-time at POS</span>
              </div>
              <div className="text-[11px] text-slate-600 flex justify-between">
                <span className="font-medium text-slate-500">Receipt Header:</span>
                <span className="font-semibold text-slate-900">Auto-formatted</span>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-xs text-orange-900 space-y-1 shadow-sm">
            <span className="font-bold flex items-center gap-1.5 text-orange-950">
              <CheckCircle2 className="w-4 h-4 text-orange-500" />
              <span>Pro Tip</span>
            </span>
            <p className="text-orange-800/90 leading-relaxed text-[11px]">
              GST & Tax settings automatically reflect on all printed receipts and POS bills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
