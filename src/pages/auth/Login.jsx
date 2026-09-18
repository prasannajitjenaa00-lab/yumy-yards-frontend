import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Crown,
  UserCheck,
  ChefHat,
  Users,
  Utensils,
  BarChart3,
  Settings,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { login } from "../../services/authService";
import { setCredentials } from "../../store/slices/authSlice";

const QUICK_ROLES = [
  {
    role: "Owner",
    email: "owner@example.com",
    password: "change_this_password",
    icon: Crown,
    bg: "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700",
    badge: "Full Access",
  },
  {
    role: "Manager",
    email: "manager@example.com",
    password: "manager123",
    icon: UserCheck,
    bg: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
    badge: "Operations",
  },
  {
    role: "Kitchen",
    email: "kitchen@example.com",
    password: "kitchen123",
    icon: ChefHat,
    bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700",
    badge: "Display KOT",
  },
  {
    role: "Cashier",
    email: "cashier@example.com",
    password: "cashier123",
    icon: Users,
    bg: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700",
    badge: "POS & Billing",
  },
  {
    role: "Waiter",
    email: "waiter@example.com",
    password: "waiter123",
    icon: Utensils,
    bg: "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700",
    badge: "Take Orders",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleQuickFill = (roleObj) => {
    setEmail(roleObj.email);
    setPassword(roleObj.password);
    toast.info(`Autofilled credentials for ${roleObj.role}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please enter email and password");
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      toast.success(`Welcome back, ${res.data.user.name || "User"}!`);
      navigate(res.data.redirectTo || "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-orange-500 selection:text-white">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-100 min-h-[680px]">
        {/* LEFT COLUMN: Hero & Visual Brand Showcase */}
        <div className="lg:col-span-6 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-slate-50 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-100">
          {/* Subtle Background Pattern Elements */}
          <div className="absolute -top-12 -left-12 w-56 h-56 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand & Handwritten Tagline */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                    Yummy <span className="text-orange-500">Yards</span>
                  </h2>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                    Pro Billing Centre
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="font-serif italic text-slate-700 text-sm font-semibold tracking-wide block">
                  Taste Meets
                </span>
                <span className="font-sans text-xs font-bold text-orange-500 tracking-wider">
                  Technology
                </span>
                </div>
            </div>

            {/* Headline */}
            <div className="space-y-2 pt-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1]">
                Good Food <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                  Better Business
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-sm">
                Simple Billing. Smarter Management.
              </p>
            </div>

            {/* 4 Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Fast Billing</h4>
                  <p className="text-[10px] text-slate-400">Quick & easy POS</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Real-time Reports</h4>
                  <p className="text-[10px] text-slate-400">Track your business</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Multi-role Access</h4>
                  <p className="text-[10px] text-slate-400">Owner, Manager, Staff</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Manage Everything</h4>
                  <p className="text-[10px] text-slate-400">Menu, Inventory, Orders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dish Image Feature & Footer */}
          <div className="relative z-10 pt-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[16/9]">
              <img
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80"
                alt="Delicious Biryani"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <p className="font-serif italic text-amber-300 text-xs">Good Food</p>
                  <p className="text-sm font-bold tracking-wide">Happier People</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center sm:text-left">
              © 2026 Yummy Yards. All rights reserved.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Login Form & Quick Fill Buttons */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between bg-white relative">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 mx-auto flex items-center justify-center border border-orange-100 shadow-inner">
                <ChefHat className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-500">Login to access your restaurant dashboard</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-3.5 h-3.5"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast.info("Contact system administrator to reset password.")}
                  className="font-semibold text-orange-500 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest absolute">
                OR
              </span>
            </div>

            {/* Quick Fill Credential Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-0.5">
                <span className="flex items-center gap-1 text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Fill Credentials:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Click to autofill</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {QUICK_ROLES.map((roleObj, idx) => {
                  const IconComponent = roleObj.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickFill(roleObj)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${roleObj.bg} group`}
                    >
                      <IconComponent className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-bold">{roleObj.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subtext Quote */}
            <p className="text-[11px] text-slate-400 text-center italic pt-2">
              "Great food starts with a well-managed kitchen."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
