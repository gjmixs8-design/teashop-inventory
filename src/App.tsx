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
  const { session, setSession, products, rawMaterials, settings } = useApp();

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

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
            <h3 className="text-lg font-black text-slate-800 uppercase animate-pulse">Access Denied & Locked</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Your active simulated session role is <span className="font-extrabold text-rose-600 bg-rose-100/40 dark:bg-rose-55 dark:text-rose-400 px-2 py-0.5 rounded">{session.role}</span>.
              This operations panel is locked. Switch roles below or in Settings & Roles.
            </p>
          </div>

          {/* Easy Simulator Quick Switch Panel */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-left space-y-3 shadow-inner">
            <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider text-center flex items-center justify-center gap-1">
              <span>⚡ INSTANT SWITCH SIMULATOR ROLE</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { r: "Admin", name: "Ravi Kumar (Owner)", id: "emp-4" },
                { r: "Manager", name: "Sanjay Gowda (Manager)", id: "emp-3" },
                { r: "Cashier", name: "Priya Dharshini (Cashier)", id: "emp-2" },
                { r: "Staff", name: "Arun Kumar (Staff)", id: "emp-1" },
              ].map(({ r, name, id }) => (
                <button
                  key={r}
                  onClick={() => {
                    setSession({
                      role: r as any,
                      userName: name,
                      userId: id,
                    });
                  }}
                  className={`py-2 px-3 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                    session.role === r
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-[#151a26] dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-center text-gray-400 font-semibold leading-normal">
              Tap any role to immediately override simulated privileges & unlock this view!
            </p>
          </div>

          <div className="pt-1 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("settings")}
              className="py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-xs focus:outline-none cursor-pointer"
            >
              Go to Simulator controls
            </button>
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

  return (
    <div className="h-screen overflow-hidden bg-slate-50/50 flex flex-col">
      {/* top navbar header */}
      <header className="h-16 bg-white border-b border-gray-150 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-none flex-none">
        {/* Left: Brand name */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-500 hover:bg-slate-100 rounded-xl focus:outline-none"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => setActiveTab("dashboard")}>
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Chai Charcha Logo"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-xs"
              />
            ) : (
              <span className="text-xl sm:text-2xl">☕</span>
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

          {/* User Session Role selection pill */}
          <div
            onClick={() => setActiveTab("settings")}
            className="flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-800 rounded-xl cursor-pointer select-none font-bold transition-all shrink-0 max-w-[125px] sm:max-w-none text-xs"
            title="Click to alternate simulating role"
          >
            <span className="truncate max-w-[50px] sm:max-w-[120px]">{session.userName}</span>
            <span className="text-[8px] px-1 bg-indigo-200 rounded font-black uppercase text-indigo-900 shrink-0">
              {session.role}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex w-full overflow-hidden">
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
                    setMobileMenuOpen(false);
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
            ⚙️ ChaiCharcha Billing system is online & active.
          </div>
        </aside>

        {/* MAIN DISPLAY VIEWPORT SCREEN */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto h-full pb-24 md:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION (Visible on Mobile only) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-150 h-16 flex items-center justify-around px-2 z-30 shadow-lg">
        {/* Dashboard */}
        <button
          onClick={() => {
            setActiveTab("dashboard");
            setMobileMoreOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 focus:outline-none ${
            activeTab === "dashboard" ? "text-emerald-600" : "text-gray-400 hover:text-gray-650"
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold mt-1">Dashboard</span>
        </button>

        {/* POS */}
        <button
          onClick={() => {
            setActiveTab("pos");
            setMobileMoreOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 focus:outline-none ${
            activeTab === "pos" ? "text-emerald-600" : "text-gray-400 hover:text-gray-650"
          }`}
        >
          <ShoppingBag size={20} />
          <span className="text-[10px] font-bold mt-1">POS Billing</span>
        </button>

        {/* Inventory */}
        <button
          onClick={() => {
            setActiveTab("inventory");
            setMobileMoreOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 focus:outline-none ${
            activeTab === "inventory" ? "text-emerald-600" : "text-gray-400 hover:text-gray-650"
          }`}
        >
          <Layers size={20} />
          <span className="text-[10px] font-bold mt-1">Stock</span>
        </button>

        {/* More button */}
        <button
          onClick={() => {
            setMobileMoreOpen(!mobileMoreOpen);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 focus:outline-none ${
            mobileMoreOpen || ["payroll", "expenses", "suppliers", "history", "settings"].includes(activeTab)
              ? "text-indigo-600"
              : "text-gray-400 hover:text-gray-650"
          }`}
        >
          <Menu size={20} />
          <span className="text-[10px] font-bold mt-1">More Operations</span>
        </button>
      </nav>

      {/* MOBILE MORE OPERATIONS DRAWER SCREEN */}
      {mobileMoreOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-16 bg-white border-t border-slate-200 z-20 shadow-2xl p-4 space-y-3 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-xs font-black text-slate-500 uppercase">Operational Modules</span>
            <button
              onClick={() => setMobileMoreOpen(false)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setActiveTab("payroll");
                setMobileMoreOpen(false);
              }}
              className={`p-3 rounded-xl border flex flex-col items-start gap-1 font-bold ${
                activeTab === "payroll" ? "bg-indigo-50 border-indigo-500 text-indigo-900" : "bg-slate-50 border-slate-100 text-slate-700"
              }`}
            >
              <Users size={16} className="text-gray-405" />
              <span>Staff attendance</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("expenses");
                setMobileMoreOpen(false);
              }}
              className={`p-3 rounded-xl border flex flex-col items-start gap-1 font-bold ${
                activeTab === "expenses" ? "bg-indigo-50 border-indigo-500 text-indigo-900" : "bg-slate-50 border-slate-100 text-slate-700"
              }`}
            >
              <FileMinus size={16} className="text-gray-405" />
              <span>Log Expenses</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("suppliers");
                setMobileMoreOpen(false);
              }}
              className={`p-3 rounded-xl border flex flex-col items-start gap-1 font-bold ${
                activeTab === "suppliers" ? "bg-indigo-50 border-indigo-500 text-indigo-900" : "bg-slate-50 border-slate-100 text-slate-700"
              }`}
            >
              <Truck size={16} className="text-gray-405" />
              <span>Suppliers bulk</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("history");
                setMobileMoreOpen(false);
              }}
              className={`p-3 rounded-xl border flex flex-col items-start gap-1 font-bold ${
                activeTab === "history" ? "bg-indigo-50 border-indigo-500 text-indigo-900" : "bg-slate-50 border-slate-100 text-slate-700"
              }`}
            >
              <History size={16} className="text-gray-405" />
              <span>Sales Receipts</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setMobileMoreOpen(false);
              }}
              className={`p-3 rounded-xl border col-span-2 flex items-center gap-2.5 font-bold ${
                activeTab === "settings" ? "bg-indigo-50 border-indigo-500 text-indigo-900" : "bg-slate-50 border-slate-100 text-slate-700"
              }`}
            >
              <Settings size={16} className="text-gray-405" />
              <span>Settings & Role Simulator switcher</span>
            </button>
          </div>
        </div>
      )}

      {/* MOBILE LEFT MENU DRAWER - FALLBACK BACKSTOP FOR SIDE NAVIGATION */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop click barrier */}
          <div className="bg-black/60 backdrop-blur-xs flex-1" onClick={() => setMobileMenuOpen(false)}></div>

          {/* Drawer content drawer */}
          <div className="bg-white w-64 p-5 flex flex-col justify-between shadow-2xl animate-slide-in relative">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <span className="text-xl sm:text-2xl mt-2 block">☕ Chai Charcha</span>
              <div className="border-b pb-2"></div>

              <div className="space-y-1.5 font-semibold text-slate-600">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs ${
                        activeTab === item.id ? "bg-slate-900 text-white font-extrabold" : "hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={14} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] text-gray-400 text-center border-t pt-4">
              Chai Charcha Hub v2.6
            </div>
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
