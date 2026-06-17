/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../AppContext";
import {
  Settings,
  Shield,
  Save,
  Printer,
  CheckCircle,
  FileText,
  BadgeAlert,
  User,
  Users,
  Upload,
  Database,
  Wifi,
  WifiOff,
  Briefcase,
  CreditCard,
} from "lucide-react";
import { ShopSettings, AppRole } from "../types";
import { isFirebaseConfigured } from "../firebase";

export default function SettingsView() {
  const { settings, updateSettings, session, setSession } = useApp();

  const [shopName, setShopName] = useState(settings.shopName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "");
  const [contactNumber, setContactNumber] = useState(settings.contactNumber);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [gstNo, setGstNo] = useState(settings.gstNo);
  const [footerMessage, setFooterMessage] = useState(settings.footerMessage);
  const [taxEnabled, setTaxEnabled] = useState(settings.taxEnabled);
  const [currency, setCurrency] = useState(settings.currency);
  const [thermalWidth, setThermalWidth] = useState(settings.thermalWidth);
  const [strictAuthMode, setStrictAuthMode] = useState(settings.strictAuthMode || false);

  // Status message
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Direct brand logo file uploader from device with smart canvas auto-compression
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // Micro-optimize brand logo dimensions to a max of 180px width or height
          const maxDim = 180;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            // Fill white background to support transparent images cleanly as JPEGs
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Highly optimized 65% quality JPEG is extremely light and looks stunningly crisp at rendered 32-56px sizes
            const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.65);
            setLogoUrl(optimizedDataUrl);

            const updated: ShopSettings = {
              shopName,
              logoUrl: optimizedDataUrl,
              contactNumber,
              email,
              address,
              gstNo,
              footerMessage,
              taxRateDefault: settings.taxRateDefault,
              taxEnabled,
              currency,
              thermalWidth,
            };
            updateSettings(updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
          }
        };
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (session.role !== "Admin") {
      alert("Permission Blocked: Only Admin can modify settings.");
      return;
    }
    setLogoUrl("");
    const updated: ShopSettings = {
      shopName,
      logoUrl: "",
      contactNumber,
      email,
      address,
      gstNo,
      footerMessage,
      taxRateDefault: settings.taxRateDefault,
      taxEnabled,
      currency,
      thermalWidth,
    };
    updateSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (session.role !== "Admin") {
      alert("Permission Blocked: Only users in the Admin role can save modifications to store settings.");
      return;
    }

    const trimmedShopName = shopName.trim();
    const trimmedContact = contactNumber.trim();
    const trimmedEmail = email.trim();
    const trimmedGst = gstNo.trim();

    if (trimmedShopName.length < 2) {
      alert("Validation Error: Shop Name must be at least 2 characters long.");
      return;
    }

    if (!/^[0-9]{10}$/.test(trimmedContact)) {
      alert("Validation Error: Support contact phone number must be exactly 10 digits.");
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      alert("Validation Error: Please enter a valid email address.");
      return;
    }

    if (trimmedGst && !/^[0-9a-zA-Z]{15}$/.test(trimmedGst)) {
      alert("Validation Error: GSTIN must be exactly 15 alphanumeric characters.");
      return;
    }

    const updated: ShopSettings = {
      shopName: trimmedShopName,
      logoUrl,
      contactNumber: trimmedContact,
      email: trimmedEmail,
      address,
      gstNo: trimmedGst,
      footerMessage,
      taxRateDefault: settings.taxRateDefault,
      taxEnabled,
      currency,
      thermalWidth,
      strictAuthMode,
    };

    updateSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Switch role action helper
  const handleRoleChange = (role: AppRole) => {
    let userName = "Walk-in Guest";
    let userId = "emp-guest";

    if (role === "Admin") {
      userName = "Ravi Kumar (Owner)";
      userId = "emp-4";
    } else if (role === "Manager") {
      userName = "Sanjay Gowda (Manager)";
      userId = "emp-3";
    } else if (role === "Cashier") {
      userName = "Priya Dharshini (Cashier)";
      userId = "emp-2";
    } else if (role === "Staff") {
      userName = "Arun Kumar (Staff)";
      userId = "emp-1";
    }

    setSession({ role, userName, userId });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* 1. STORE GENERAL PARAMETERS CONFIGURATION (8 Columns) */}
      <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-1.5 border-b pb-2.5">
          <Settings size={18} className="text-emerald-600" />
          Store General Settings
        </h3>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5">
            <CheckCircle size={16} />
            Shop profiles and thermal receipt formats updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm text-slate-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">SHOP BUSINESS BRAND NAME</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                disabled={session.role !== "Admin"}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">GST REGISTRATION CERTIFICATE</label>
              <input
                type="text"
                value={gstNo}
                onChange={(e) => setGstNo(e.target.value)}
                placeholder="29ABCDE1234F1Z9"
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold text-slate-800 uppercase"
                disabled={session.role !== "Admin"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50/50 p-3.5 rounded-2xl border">
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-teal-850 block">CAFETERIA BRAND LOGO</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Paste image URL (https://... or file data)"
                  className="flex-1 px-3 py-2 border bg-white rounded-xl text-xs font-normal focus:outline-none text-slate-800"
                  disabled={session.role !== "Admin"}
                />
                <label className={`px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none shrink-0 border border-indigo-650 ${session.role !== "Admin" ? "opacity-30 pointer-events-none" : ""}`}>
                  <Upload size={13} />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                    disabled={session.role !== "Admin"}
                  />
                </label>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Specify a brand logo by pasting an image link or uploading an image file directly from your device.</p>
            </div>
            <div className="md:col-span-4 flex justify-center">
              {logoUrl ? (
                <div className="flex flex-col items-center gap-1.5">
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-14 h-14 rounded-full border shadow-sm object-cover bg-white"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100&auto=format&fit=crop&q=50";
                    }}
                  />
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[9px] text-emerald-800 font-extrabold bg-emerald-55 px-2 py-0.5 rounded-full">ACTIVE BRAND</span>
                    {session.role === "Admin" && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-[9px] text-rose-600 hover:text-rose-700 font-bold hover:underline"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full border border-dashed flex items-center justify-center text-gray-300 text-xs font-bold bg-white text-center">
                  None
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">SUPPORT CONTACT TELEPHONE</label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800"
                disabled={session.role !== "Admin"}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">OFFICIAL EMAIL INBOX</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800"
                disabled={session.role !== "Admin"}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">PHYSICAL CAFETERIA ADDRESS</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800"
              disabled={session.role !== "Admin"}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">CURRENCY GLYPH</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                disabled={session.role !== "Admin"}
              >
                <option value="₹">Rupee (₹)</option>
                <option value="$">US Dollar ($)</option>
                <option value="€">Euro (€)</option>
                <option value="£">Pound (£)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">RECEIPT ROLL SIZE</label>
              <select
                value={thermalWidth}
                onChange={(e) => setThermalWidth(e.target.value as ShopSettings["thermalWidth"])}
                className="w-full p-2 border rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                disabled={session.role !== "Admin"}
              >
                <option value="80mm">Standard POS Size (80mm width)</option>
                <option value="58mm">Compact Thermal Size (58mm width)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">GST / TAX CONFIG</label>
              <select
                value={taxEnabled ? "yes" : "no"}
                onChange={(e) => setTaxEnabled(e.target.value === "yes")}
                className="w-full p-2 border rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                disabled={session.role !== "Admin"}
              >
                <option value="yes">Enabled (GST inclusive calculations)</option>
                <option value="no">Disabled (Sales Tax exempt)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">CUSTOM THERMAL FOOTER MEMO MOCKUP</label>
            <input
              type="text"
              value={footerMessage}
              onChange={(e) => setFooterMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800"
              disabled={session.role !== "Admin"}
              required
            />
          </div>

          {session.role === "Admin" && (
            <button
              type="submit"
              className="py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1 focus:outline-none transition-colors shadow-xs"
            >
              <Save size={15} />
              Save Configurations
            </button>
          )}
        </form>
      </div>

      {/* 1.5. FIREBASE INTEGRATION DASHBOARD WIDGET */}
      <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-2.5">
          <Database size={18} className="text-teal-600" />
          Firebase Sync Console
        </h3>

        {isFirebaseConfigured ? (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl flex items-start gap-2.5">
            <Wifi size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">Firebase Sync: Online</span>
              <span className="text-[10px] text-emerald-700 block mt-0.5">
                Real-time multi-device cloud synchronization is active. All terminal sales, stocks, and logs sync dynamically.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 text-amber-900 border border-amber-100 rounded-2xl flex items-start gap-2.5">
            <WifiOff size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">Local Sandbox Mode</span>
              <span className="text-[10px] text-amber-700 block mt-0.5">
                Database is stored in browser memory. Setup environment keys in <code>.env</code> to activate cloud synchronization.
              </span>
            </div>
          </div>
        )}


      </div>

      {/* 2. ROLE TOGGLER PANEL & PRODUCTION DEPLOYMENT SETUPS (4 Columns) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Role Simulator Setup Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-2.5">
            <Shield size={18} className="text-indigo-600" />
            Role Simulator Setup
          </h3>

          <p className="text-xs text-gray-500 leading-normal">
            Toggle roles instantly to test dynamic UI layouts, permissions blocks, and credentials lockouts:
          </p>

          {/* Roles Select list layout */}
          <div className="space-y-2.5">
            {[
              {
                role: "Admin" as AppRole,
                desc: "Complete writes, delete permissions, and configuration accesses.",
                name: "Ravi Kumar (Owner)",
              },
              {
                role: "Manager" as AppRole,
                desc: "Manage products, raw inventories, and employee rosters.",
                name: "Sanjay Gowda (Manager)",
              },
              {
                role: "Cashier" as AppRole,
                desc: "POS checkout terminal, lookup walkin sales history logs.",
                name: "Priya Dharshini (Cashier)",
              },
              {
                role: "Staff" as AppRole,
                desc: "Manual staff check-ins and review item stocks.",
                name: "Arun Kumar (Staff)",
              },
            ].map((item) => (
              <button
                key={item.role}
                disabled={strictAuthMode}
                onClick={() => handleRoleChange(item.role)}
                className={`w-full text-left p-3 rounded-2xl border flex items-start gap-2.5 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  session.role === item.role
                    ? "bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-550"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 mt-0.5 flex-shrink-0 font-bold">
                  {item.role === "Admin" ? (
                    <Shield size={16} className="text-indigo-600" />
                  ) : item.role === "Manager" ? (
                    <Briefcase size={16} className="text-indigo-600" />
                  ) : item.role === "Cashier" ? (
                    <CreditCard size={16} className="text-indigo-600" />
                  ) : (
                    <Users size={16} className="text-indigo-600" />
                  )}
                </div>

                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-800 block leading-tight">{item.role} View</span>
                  <span className="text-[10px] text-indigo-700 font-extrabold mt-0.5 block">{item.name}</span>
                  <span className="text-[10px] text-gray-400 leading-tight block mt-1">{item.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. STRICT AUTH & FIREBASE SECURITY RULES CARD */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-2.5">
            <Database size={18} className="text-emerald-600" />
            Production Config
          </h3>
          
          <div className="space-y-3">
            {/* Status indicators */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border space-y-2 text-xs">
              <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Firebase Cloud Connections</div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Realtime Database</span>
                <span className={`font-black flex items-center gap-1 ${isFirebaseConfigured ? "text-emerald-600" : "text-rose-500"}`}>
                  {isFirebaseConfigured ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {isFirebaseConfigured ? "CONNECTED" : "OFFLINE"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Auth & Storage</span>
                <span className={`font-black ${isFirebaseConfigured ? "text-emerald-600" : "text-slate-400"}`}>
                  {isFirebaseConfigured ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>

            {/* Strict Auth Mode Toggle */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-800 block">Strict Authentication Mode</span>
              <p className="text-[10px] text-gray-400 leading-normal">
                Force users to sign in with secure emails and passwords from the database records. Disables the mock Role Simulator.
              </p>
              
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (session.role !== "Admin") {
                      alert("Permission Blocked: Only Admin can modify security settings!");
                      return;
                    }
                    if (!isFirebaseConfigured) {
                      alert("Error: Firebase is not configured! Please set credentials in your .env file first.");
                      return;
                    }
                    setStrictAuthMode(true);
                  }}
                  className={`flex-1 py-2 text-center text-xs font-black rounded-xl border transition-all cursor-pointer ${
                    strictAuthMode
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  STRICT ON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (session.role !== "Admin") {
                      alert("Permission Blocked: Only Admin can modify security settings!");
                      return;
                    }
                    setStrictAuthMode(false);
                  }}
                  className={`flex-1 py-2 text-center text-xs font-black rounded-xl border transition-all cursor-pointer ${
                    !strictAuthMode
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  STRICT OFF
                </button>
              </div>
            </div>

            {/* Security Rules Copy/Download section */}
            <div className="pt-3 border-t space-y-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                <FileText size={14} className="text-slate-500" />
                Firebase Security Rules
              </span>
              <p className="text-[10px] text-gray-400 leading-normal">
                Deploy these rules in your Firebase Realtime Database Console to prevent unauthorized public read/write access.
              </p>
              <div className="p-2.5 bg-slate-950 text-slate-300 font-mono text-[9px] rounded-xl border max-h-36 overflow-y-auto select-all leading-normal whitespace-pre-wrap">
{`{
  "rules": {
    "settings": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('employees').child(auth.uid).child('designation').val() === 'Admin'"
    },
    "products": {
      ".read": "auth != null",
      ".write": "auth != null && (root.child('employees').child(auth.uid).child('designation').val() === 'Admin' || root.child('employees').child(auth.uid).child('designation').val() === 'Manager')"
    },
    "invoices": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".delete": "false"
    }
  }
}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
