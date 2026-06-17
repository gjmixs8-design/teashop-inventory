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
} from "lucide-react";
import { ShopSettings, AppRole } from "../types";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (session.role !== "Admin") {
      alert("Permission Blocked: Only users in the Admin role can save modifications to store settings.");
      return;
    }

    const updated: ShopSettings = {
      shopName,
      logoUrl,
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
                  <span className="text-[9px] text-emerald-800 font-extrabold bg-emerald-55 px-2 py-0.5 rounded-full">ACTIVE BRAND</span>
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

      {/* 2. ROLE TOGGLER PANEL & SIMULATOR FOR ROLE TESTING (4 Columns) */}
      <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
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
              onClick={() => handleRoleChange(item.role)}
              className={`w-full text-left p-3 rounded-2xl border flex items-start gap-2.5 transition-all focus:outline-none ${
                session.role === item.role
                  ? "bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-550"
                  : "bg-white border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 mt-0.5 flex-shrink-0 font-bold">
                {item.role === "Admin" ? "👑" : item.role === "Manager" ? "💼" : item.role === "Cashier" ? "📝" : "🧹"}
              </div>

              <div className="min-w-0">
                <span className="text-xs font-black text-slate-850 block leading-tight">{item.role} View</span>
                <span className="text-[10px] text-indigo-700 font-extrabold mt-0.5 block">{item.name}</span>
                <span className="text-[10px] text-gray-400 leading-tight block mt-1">{item.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
