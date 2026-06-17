/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./AppContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Users,
  FileMinus,
  Truck,
  History,
  Settings,
  Bell,
  Clock,
  Menu,
  X,
  Lock,
  ChevronRight,
  ShieldAlert,
  Sun,
  Moon,
  Coffee,
  Zap,
  Mail,
  Key,
} from "lucide-react";

// Views
import DashboardView from "./components/DashboardView";
import POSBillingView from "./components/POSBillingView";
import InventoryView from "./components/InventoryView";
import StaffPayrollView from "./components/StaffPayrollView";
import ExpensesView from "./components/ExpensesView";
import SuppliersView from "./components/SuppliersView";
import SalesHistoryView from "./components/SalesHistoryView";
import SettingsView from "./components/SettingsView";

function AppContent() {
  const { 
    session, 
    setSession, 
    products, 
    rawMaterials, 
    settings,
    firebaseUser,
    authLoading,
    loginUser,
    logoutUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSubmitting(true);
    try {
      await loginUser(loginEmail, loginPassword);
    } catch (err: any) {
      setLoginError(err.message || "Failed to log in. Please check credentials.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const [theme, setTheme] = useState<string>(() => {
    const saved = localStorage.getItem("tea_theme");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.classList.remove("theme-dark", "theme-light", "theme-amber");
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem("tea_theme", theme);
  }, [theme]);

  // Clock runner
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setCurrentTime(now.toLocaleString("en-US", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate generic warning parameters (e.g. low stock alerts)
  const lowStockCount = React.useMemo(() => {
    const pLow = products.filter((p) => p.stock <= p.minStock).length;
    const mLow = rawMaterials.filter((m) => m.stock <= m.minStock).length;
    return pLow + mLow;
  }, [products, rawMaterials]);

  // Role permissions checker helper
  const isTabRestricted = (tab: string, role: string) => {
    if (role === "Admin") return false; // Full access

    if (role === "Manager") {
      // Managers can't access settings, and are restricted from making raw configurations deletions (handled inside components)
      return tab === "settings";
    }

    if (role === "Cashier") {
      // Cashiers can only access POS billing, Sales history and dashboard
      const allowed = ["dashboard", "pos", "history"];
      return !allowed.includes(tab);
    }

    if (role === "Staff") {
      // Staff elements are constrained to attendance (payroll) and inventory stock checking
      const allowed = ["dashboard", "payroll", "inventory"];
      return !allowed.includes(tab);
    }

    return false;
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Business metrics and trends" },
    { id: "pos", label: "POS Billing", icon: ShoppingBag, desc: "Quick-checkout checkout counter (Tea/Snacks)" },
    { id: "inventory", label: "Inventory Stock", icon: Layers, desc: "Ingredients raw stock, menu products & ledger" },
    { id: "payroll", label: "Staff & Attendance", icon: Users, desc: "Shifts registers, attendance punch, wages" },
    { id: "expenses", label: "Expense Tracker", icon: FileMinus, desc: "Log rent, electricity bill and overhead bills" },
    { id: "suppliers", label: "Suppliers & Buy", icon: Truck, desc: "Agencies log, GSTIN and raw restock purchase" },
    { id: "history", label: "Sales History", icon: History, desc: "Reprint receipts, processed totals, return lines" },
    { id: "settings", label: "Settings & Roles", icon: Settings, desc: "Customize GST formats & Simulation mode" },
  ];

  // Render view conditionally
  const renderActiveView = () => {
    if (isTabRestricted(activeTab, session.role)) {
      return (
        <div className="bg-white rounded-3xl p-8 border border-dashed border-gray-200 text-center space-y-5 max-w-md mx-auto my-12 shadow-sm">
          <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <Lock size={28} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase animate-pulse">Access Denied</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Your active session role is <span className="font-extrabold text-rose-600 bg-rose-100/40 dark:bg-rose-55 dark:text-rose-400 px-2 py-0.5 rounded">{session.role}</span>.
              This operations panel is restricted and requires higher privileges.
            </p>
          </div>

          <div className="pt-1 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="py-2 text-xs font-extrabold text-slate-500 hover:text-slate-800 focus:outline-none cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <DashboardView setActiveTab={setActiveTab} />;
      case "pos":
        return <POSBillingView />;
      case "inventory":
        return <InventoryView />;
      case "payroll":
        return <StaffPayrollView />;
      case "expenses":
        return <ExpensesView />;
      case "suppliers":
        return <SuppliersView />;
      case "history":
        return <SalesHistoryView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  if (authLoading) {
    return (
      <div className="h-dvh w-screen flex flex-col items-center justify-center bg-[#0a0c10] text-white">
        <div className="space-y-4 text-center">
          <Coffee size={48} className="mx-auto text-emerald-400 animate-bounce" />
          <h2 className="text-sm font-black tracking-widest uppercase animate-pulse">Loading Chai Charcha ERP...</h2>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-[#0a0c10] p-4 font-sans selection:bg-emerald-500/30 select-none">
        <div className="w-full max-w-md bg-[#11141e] border border-[#242c3f] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <Coffee size={28} />
            </div>
            <h2 className="text-xl font-display font-black text-slate-100 tracking-tight">Chai Charcha Cafe ERP</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Employee Login Panel</p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold leading-relaxed flex items-start gap-2 animate-pulse">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@chaicharcha.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0c0e14] text-slate-200 border border-[#242c3f] rounded-xl text-xs focus:border-emerald-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                />
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Security Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0c0e14] text-slate-200 border border-[#242c3f] rounded-xl text-xs focus:border-emerald-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                />
                <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-3.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl focus:outline-none transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {loginSubmitting ? "Authenticating Session..." : "Secure Sign In"}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#242c3f] space-y-1.5">
            <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Default Server Account</p>
            <div className="p-2.5 bg-[#0c0e14] border border-[#242c3f] rounded-xl text-[10px] text-slate-400 font-semibold space-y-0.5 text-left leading-normal font-mono select-text">
              <p>Email: <span className="text-emerald-400">admin@chaicharcha.com</span></p>
              <p>Pass: <span className="text-emerald-400">admin123</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden bg-slate-50/50 flex flex-col">
      {/* top navbar header */}
      <header className="h-16 bg-white border-b border-gray-150 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-none flex-none">
        {/* Left: Brand name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => setActiveTab("dashboard")}>
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Chai Charcha Logo"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-xs"
              />
            ) : (
              <Coffee size={20} className="text-amber-600" />
            )}
            <span className="font-display font-extrabold text-xs sm:text-base text-slate-900 tracking-tight whitespace-nowrap truncate max-w-[85px] sm:max-w-none">
              {settings.shopName}
            </span>
          </div>
        </div>

        {/* Right Info area (Clock + Role switcher state) */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs">
          {/* Calendar Clock */}
          <div className="hidden sm:flex items-center gap-1.5 text-gray-500 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border">
            <Clock size={13} className="text-emerald-600 animate-spin-slow" />
            <span className="font-mono text-[11px] leading-none">{currentTime}</span>
          </div>

          {/* Low Stock Floating Indicator */}
          {lowStockCount > 0 && (
            <>
              {/* Compact Mobile Bell */}
              <button
                onClick={() => setActiveTab("inventory")}
                className="p-2 bg-orange-500/10 text-orange-500 border border-orange-500/30 rounded-xl relative flex items-center justify-center shrink-0 sm:hidden hover:bg-orange-500/20 active:scale-95 transition-all"
                title={`${lowStockCount} items low stock`}
              >
                <Bell size={15} className="animate-bounce text-amber-500" />
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-black text-[9px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-white shadow-xs">
                  {lowStockCount}
                </span>
              </button>

              {/* Full Desktop Button */}
              <button
                onClick={() => setActiveTab("inventory")}
                className="hidden sm:flex p-1.5 px-3 bg-amber-500 text-white font-black text-[10px] rounded-xl tracking-wider items-center gap-1.5 focus:outline-none animate-pulse hover:bg-amber-600 transition-colors shrink-0"
                title={`${lowStockCount} items low stock`}
              >
                <Bell size={12} />
                <span>STOCK ALERT ({lowStockCount})</span>
              </button>
            </>
          )}

          {/* Theme Picker Toggles */}
          <div className="flex items-center gap-1 bg-slate-100/55 dark:bg-slate-900/30 p-1 rounded-xl border border-slate-200/40 shrink-0">
            <button
              onClick={() => setTheme("dark")}
              className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                theme === "dark" 
                  ? "bg-slate-950 text-emerald-400 border border-emerald-500/30 shadow-xs" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-slate-200/50"
              }`}
              title="Slate Dark Mode"
            >
              <Moon size={13} className="stroke-[2.5]" />
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                theme === "light" 
                  ? "bg-white text-indigo-600 border border-indigo-200 shadow-xs" 
                  : "text-gray-400 hover:text-gray-300 hover:bg-slate-800/30"
              }`}
              title="Milk Light Mode"
            >
              <Sun size={13} className="stroke-[2.5]" />
            </button>
          </div>

          {/* User Session Role display pill & sign out button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl select-none font-bold text-xs cursor-default"
              title="Signed in user profile"
            >
              <span className="truncate max-w-[65px] sm:max-w-[120px]">{session.userName}</span>
              <span className="text-[8px] px-1 bg-indigo-200 rounded font-black uppercase text-indigo-900 shrink-0">
                {session.role}
              </span>
            </div>
            
            {firebaseUser && (
              <button
                onClick={async () => {
                  if (window.confirm("Are you sure you want to sign out and lock the session?")) {
                    await logoutUser();
                  }
                }}
                className="p-1.5 px-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl text-[10px] font-extrabold uppercase transition-all cursor-pointer shrink-0"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex w-full overflow-hidden min-h-0">
        {/* DESKTOP SIDEBAR NAVIGATION (Visible on MD and larger) */}
        <aside className="hidden md:flex flex-col justify-between w-64 border-r border-gray-150 p-4 bg-white select-none shrink-0 h-full overflow-y-auto">
          <div className="flex flex-col space-y-1.5 flex-1 select-none">
            <div className="text-[10px] text-gray-400 font-extrabold tracking-wider px-3 mb-3">WORKSPACE NAV</div>

            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              const isRestricted = isTabRestricted(item.id, session.role);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 px-3 rounded-xl transition-all text-left focus:outline-none ${
                    isActive
                      ? "bg-slate-900 text-white font-extrabold shadow-sm"
                      : "text-gray-600 hover:bg-slate-100 hover:text-gray-900 dark:hover:bg-slate-800 dark:hover:text-white font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComp size={16} className={isActive ? "text-emerald-400" : "text-gray-400"} />
                    <span className="text-xs sm:text-sm truncate">{item.label}</span>
                  </div>

                  {isRestricted && (
                    <Lock size={12} className="text-rose-500 bg-rose-50 rounded p-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t font-semibold text-[11px] text-gray-400 text-center max-w-[200px] mx-auto mt-4 leading-normal">
            <span className="flex items-center justify-center gap-1"><Settings size={12} className="text-slate-400" /> ChaiCharcha Billing system is online & active.</span>
          </div>
        </aside>

        {/* MAIN DISPLAY VIEWPORT SCREEN */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto h-full pb-6 md:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION (Visible on Mobile only) */}
      <nav className="md:hidden flex-none bg-white border-t border-slate-150 h-16 flex items-center justify-around px-2 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] select-none">
        {/* Dashboard Tab */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center flex-1 h-full focus:outline-none relative transition-all duration-200 ${
            activeTab === "dashboard"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350"
          }`}
        >
          <div className={`p-1.5 px-4 rounded-full transition-all duration-200 flex items-center justify-center ${
            activeTab === "dashboard"
              ? "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/10"
              : "bg-transparent border border-transparent"
          }`}>
            <LayoutDashboard size={18} className={activeTab === "dashboard" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"} />
          </div>
          <span className={`text-[9px] mt-1 text-center font-extrabold tracking-wide ${
            activeTab === "dashboard" ? "font-black text-emerald-600 dark:text-emerald-400" : "font-semibold text-slate-400 dark:text-slate-500"
          }`}>
            Dashboard
          </span>
        </button>

        {/* POS Tab */}
        <button
          onClick={() => setActiveTab("pos")}
          className={`flex flex-col items-center justify-center flex-1 h-full focus:outline-none relative transition-all duration-200 ${
            activeTab === "pos"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350"
          }`}
        >
          <div className={`p-1.5 px-4 rounded-full transition-all duration-200 flex items-center justify-center ${
            activeTab === "pos"
              ? "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/10"
              : "bg-transparent border border-transparent"
          }`}>
            <ShoppingBag size={18} className={activeTab === "pos" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"} />
          </div>
          <span className={`text-[9px] mt-1 text-center font-extrabold tracking-wide ${
            activeTab === "pos" ? "font-black text-emerald-600 dark:text-emerald-400" : "font-semibold text-slate-400 dark:text-slate-500"
          }`}>
            POS
          </span>
        </button>

        {/* Inventory Tab */}
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex flex-col items-center justify-center flex-1 h-full focus:outline-none relative transition-all duration-200 ${
            activeTab === "inventory"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350"
          }`}
        >
          <div className={`p-1.5 px-4 rounded-full transition-all duration-200 flex items-center justify-center ${
            activeTab === "inventory"
              ? "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/10"
              : "bg-transparent border border-transparent"
          }`}>
            <Layers size={18} className={activeTab === "inventory" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"} />
          </div>
          <span className={`text-[9px] mt-1 text-center font-extrabold tracking-wide ${
            activeTab === "inventory" ? "font-black text-emerald-600 dark:text-emerald-400" : "font-semibold text-slate-400 dark:text-slate-500"
          }`}>
            Inventory
          </span>
        </button>

        {/* More Tab */}
        <button
          onClick={() => setMobileMoreOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full focus:outline-none relative transition-all duration-200 ${
            !["dashboard", "pos", "inventory"].includes(activeTab)
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350"
          }`}
        >
          <div className={`p-1.5 px-4 rounded-full transition-all duration-200 flex items-center justify-center ${
            !["dashboard", "pos", "inventory"].includes(activeTab)
              ? "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/10"
              : "bg-transparent border border-transparent"
          }`}>
            <Menu size={18} className={!["dashboard", "pos", "inventory"].includes(activeTab) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"} />
          </div>
          <span className={`text-[9px] mt-1 text-center font-extrabold tracking-wide ${
            !["dashboard", "pos", "inventory"].includes(activeTab) ? "font-black text-emerald-600 dark:text-emerald-400" : "font-semibold text-slate-400 dark:text-slate-500"
          }`}>
            More
          </span>
        </button>
      </nav>

      {/* MOBILE "MORE" MENU BOTTOM SHEET DRAWER */}
      {mobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setMobileMoreOpen(false)}>
          <div 
            className="bg-white dark:bg-[#11141e] w-full max-w-md rounded-t-3xl p-6 pb-8 space-y-6 shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-slide-up transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header/Grabber */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mt-2">More Workspace Panels</h3>
            </div>

            {/* List/Grid of other views */}
            <div className="grid grid-cols-2 gap-3">
              {menuItems
                .filter((item) => !["dashboard", "pos", "inventory"].includes(item.id))
                .map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  const isRestricted = isTabRestricted(item.id, session.role);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMoreOpen(false);
                      }}
                      className={`flex items-center gap-3 p-3 px-4 rounded-xl border transition-all cursor-pointer relative text-left ${
                        isActive
                          ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-50 border-slate-200/50 hover:bg-slate-100 text-slate-700 dark:bg-[#151a26] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <IconComp size={18} className={isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate leading-tight">{item.label}</p>
                      </div>
                      {isRestricted && (
                        <Lock size={10} className="text-rose-500 bg-rose-50 dark:bg-rose-950/40 rounded p-0.5 shrink-0" />
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setMobileMoreOpen(false)}
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl focus:outline-none transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
