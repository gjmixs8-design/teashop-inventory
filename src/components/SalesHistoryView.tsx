/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useApp } from "../AppContext";
import {
  Search,
  Calendar,
  IndianRupee,
  Receipt,
  RotateCcw,
  Printer,
  ChevronDown,
  X,
  CreditCard,
  QrCode,
  DollarSign,
  Tag,
  CheckCircle,
} from "lucide-react";
import { Invoice } from "../types";

export default function SalesHistoryView() {
  const { invoices, refundInvoice, settings, session } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPayment, setFilterPayment] = useState<string>("All");
  const [filterDateRange, setFilterDateRange] = useState<"All" | "Today" | "Yesterday" | "Week">("All");

  // Selected invoice for thermal reprinting modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const todayStr = "2026-06-10";
  const yesterdayStr = "2026-06-09";

  // Calculations & filtering
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Payment method filter
      const matchPayment = filterPayment === "All" || inv.paymentMethod === filterPayment;

      // 2. Date ranges
      let matchDate = true;
      if (filterDateRange === "Today") {
        matchDate = inv.date.startsWith(todayStr);
      } else if (filterDateRange === "Yesterday") {
        matchDate = inv.date.startsWith(yesterdayStr);
      } else if (filterDateRange === "Week") {
        // Last 7 days range (June 4 to June 10, 2026)
        matchDate = inv.date.startsWith("2026-06-0") || inv.date.startsWith("2026-06-10");
      }

      // 3. Keywords search
      const matchSearch =
        inv.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.customerPhone || "").includes(searchQuery) ||
        (inv.cashierName || "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchPayment && matchDate && matchSearch;
    });
  }, [invoices, filterPayment, filterDateRange, searchQuery]);

  const summary = useMemo(() => {
    const revenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const profits = filteredInvoices.reduce((sum, inv) => sum + inv.profit, 0);
    const count = filteredInvoices.length;
    return { revenue, profits, count };
  }, [filteredInvoices]);

  const handleRefund = (id: string) => {
    if (session.role !== "Admin" && session.role !== "Manager") {
      alert("Permission Blocked: Only Managers and Admins can process line-refunds with stock adjustments.");
      return;
    }

    if (confirm("Irreversible: Are you sure you want to refund this order? Items will return to stock levels and sales total adjusts.")) {
      refundInvoice(id);
      alert("Order refunded. Quantities restored back to inventory catalog.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics header boxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total revenue summed */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs sm:text-sm font-medium">Filtered Sales Total</span>
            <span className="p-1 px-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded">
              {summary.count} Billing Invoices
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-gray-900 leading-none">
              ₹{summary.revenue.toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-400 mt-2">Sum of matching transaction entries</p>
          </div>
        </div>

        {/* Calculated profit share */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs sm:text-sm font-medium">Estimated Gross Margin</span>
            <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-1.5 rounded">Calculated</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-teal-800 leading-none">
              ₹{summary.profits.toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-400 mt-2">Item cost subtract estimation</p>
          </div>
        </div>

        {/* Average transaction bill */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs col-span-2 md:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs sm:text-sm font-medium">Avg Order Basket Value</span>
            <span className="text-gray-300 scale-90">📋</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-gray-900 leading-none">
              ₹{summary.count > 0 ? Math.round(summary.revenue / summary.count) : 0}
            </h3>
            <p className="text-[10px] text-gray-400 mt-2">Average customer spending per tea seat</p>
          </div>
        </div>
      </div>

      {/* Main Filter table Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150 shadow-xs">
        {/* Filters Selectors */}
        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
          {/* Date range chips */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterDateRange("All")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg focus:outline-none transition-colors ${
                filterDateRange === "All" ? "bg-white text-teal-800 shadow-xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              All Dates
            </button>
            <button
              onClick={() => setFilterDateRange("Today")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg focus:outline-none transition-colors ${
                filterDateRange === "Today" ? "bg-white text-teal-800 shadow-xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilterDateRange("Yesterday")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg focus:outline-none transition-colors ${
                filterDateRange === "Yesterday" ? "bg-white text-teal-800 shadow-xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setFilterDateRange("Week")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg focus:outline-none transition-colors ${
                filterDateRange === "Week" ? "bg-white text-teal-800 shadow-xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Past Week
            </button>
          </div>

          {/* Payment filter select */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="p-1 px-3 bg-slate-100 border-0 rounded-xl text-xs font-bold focus:outline-none text-gray-600 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Payment channels</option>
            <option value="Cash">Cash Payments</option>
            <option value="UPI">UPI QP Payments</option>
            <option value="Card">Card Swipe</option>
            <option value="Split">Split Payments</option>
          </select>
        </div>

        {/* Text keyword searches */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Bill No, customer phone, cashier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 text-gray-800 border rounded-xl focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* VIEW DIALOG TABLE GRID */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs">
        {/* Mobile Swipe Card Grid */}
        <div className="md:hidden divide-y divide-slate-100 text-xs">
          {filteredInvoices.map((inv) => (
            <div key={inv.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-mono font-black text-slate-800 text-sm">
                    {inv.billNo}
                  </span>
                  <span className="text-[10px] text-gray-300 block mt-0.5">
                    {new Date(inv.date).toLocaleDateString()} {new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-slate-950 text-sm block">
                    ₹{inv.total.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold block">
                    Profit: ₹{inv.profit}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl space-y-1">
                <div className="text-slate-600 font-bold leading-normal text-[11px]">
                  {inv.items.map((item) => `${item.name} (x${item.quantity})`).join(", ")}
                </div>
                <div className="text-[9px] text-gray-400 font-semibold flex items-center justify-between pt-1">
                  <span>Cashier: {inv.cashierName || "Divya Cashier"}</span>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded font-extrabold ${
                      inv.paymentMethod === "Cash"
                        ? "bg-emerald-100 text-emerald-800"
                        : inv.paymentMethod === "UPI"
                        ? "bg-teal-100 text-teal-800"
                        : inv.paymentMethod === "Card"
                        ? "bg-slate-200 text-slate-800"
                        : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {inv.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] pt-1">
                <div className="text-slate-500 font-bold truncate max-w-[170px]">
                  {inv.customerName ? (
                    <span>Customer: {inv.customerName} ({inv.customerPhone})</span>
                  ) : (
                    <span className="text-gray-300 font-normal">Counter walk-in</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg focus:outline-none flex items-center gap-1 font-bold"
                    title="Thermal Receipt Reprint"
                  >
                    <Printer size={11} />
                    <span>Print</span>
                  </button>

                  {["Admin", "Manager"].includes(session.role) && (
                    <button
                      onClick={() => handleRefund(inv.id)}
                      className="p-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg focus:outline-none flex items-center gap-0.5 font-bold"
                      title="Refund Invoice Order"
                    >
                      <RotateCcw size={11} />
                      <span>Refund</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredInvoices.length === 0 && (
            <div className="p-8 text-center text-gray-400 font-bold">
              No matching sales history records recorded.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-extrabold tracking-wider border-b uppercase">
                <th className="py-3 px-4">Invoice Bill Reference</th>
                <th className="py-3 px-4">Date Time (Shift)</th>
                <th className="py-3 px-4">Items breakdown list</th>
                <th className="py-3 px-4 text-center">Payment Mode</th>
                <th className="py-3 px-4">Loyalty Customer</th>
                <th className="py-3 px-4 text-right">Sum Total (₹)</th>
                <th className="py-3 px-4 text-center">Register actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  {/* Bill number */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 text-xs sm:text-sm">
                    {inv.billNo}
                  </td>

                  {/* Date and time */}
                  <td className="py-3 px-4 font-mono text-gray-400 font-semibold leading-tight max-w-[120px]">
                    <div>{new Date(inv.date).toLocaleDateString()}</div>
                    <div className="text-[10px] text-gray-300 font-bold mt-0.5">{new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>

                  {/* Items detailed text list represent */}
                  <td className="py-3 px-4 max-w-[200px]">
                    <div className="truncate text-slate-600 font-bold">
                      {inv.items.map((item) => `${item.name} (x${item.quantity})`).join(", ")}
                    </div>
                    <div className="text-[9px] text-gray-400 font-bold mt-0.5">Cashier Cashbox: {inv.cashierName || "Divya Cashier"}</div>
                  </td>

                  {/* Payment channel status color representation */}
                  <td className="py-3 px-4 text-center font-extrabold text-[10px]">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full ${
                        inv.paymentMethod === "Cash"
                          ? "bg-emerald-100 text-emerald-800"
                          : inv.paymentMethod === "UPI"
                          ? "bg-teal-100 text-teal-800"
                          : inv.paymentMethod === "Card"
                          ? "bg-slate-200 text-slate-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {inv.paymentMethod}
                    </span>
                  </td>

                  {/* Customer name and phone */}
                  <td className="py-3 px-4 max-w-[150px] truncate font-semibold text-slate-500">
                    {inv.customerName ? (
                      <div>
                        <div className="text-slate-800 font-extrabold">{inv.customerName}</div>
                        <div className="font-mono text-gray-400 text-[10px] mt-0.5">{inv.customerPhone}</div>
                      </div>
                    ) : (
                      <span className="text-gray-300">Counter walk-in customer</span>
                    )}
                  </td>

                  {/* Net revenue transacted, profit tooltip */}
                  <td className="py-3 px-4 text-right">
                    <div className="font-mono font-black text-slate-950 text-xs sm:text-sm">
                      ₹{inv.total.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold" title="Net margins gross profit calculated">
                      Profit: ₹{inv.profit}
                    </div>
                  </td>

                  {/* Administrative Reprint and Return action indicators */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex gap-2.5">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg focus:outline-none"
                        title="Thermal Receipt Reprint"
                      >
                        <Printer size={13} />
                      </button>

                      {["Admin", "Manager"].includes(session.role) && (
                        <button
                          onClick={() => handleRefund(inv.id)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg focus:outline-none"
                          title="Refund Invoice Order"
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-bold">
                    No matching sales history records recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPRINT MODAL CONTAINER: mimicking thermal layout */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-40 overflow-y-auto">
          <div className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white focus:outline-none bg-slate-700 p-1.5 rounded-full"
            >
              <X size={16} />
            </button>

            <div className="text-center text-indigo-400">
              <Receipt size={32} className="mx-auto mb-1 animate-pulse" />
              <h4 className="text-base font-extrabold uppercase">Bill Reprint Terminal</h4>
              <p className="text-[11px] text-slate-300">Displaying system receipt values from database</p>
            </div>

            {/* Thermal container replicated */}
            <div className="bg-white text-black p-5 font-mono text-xs rounded-xl shadow-inner select-all border border-slate-300">
              {/* Receipt Header */}
              <div className="text-center space-y-1">
                <span className="font-extrabold text-sm tracking-wider block">
                  *** {settings.shopName.toUpperCase()} ***
                </span>
                <p className="text-[10px] leading-tight text-gray-600">
                  {settings.address}
                </p>
                <p className="text-[10px] text-gray-600 leading-none">
                  Phone: {settings.contactNumber}
                </p>
                {settings.gstNo && (
                  <p className="text-[10px] text-gray-600 leading-none">
                    GSTIN: {settings.gstNo}
                  </p>
                )}
                <div className="border-t border-dashed border-black my-2"></div>
              </div>

              {/* Bill Details */}
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Bill No: {selectedInvoice.billNo}</span>
                  <span>Payment: {selectedInvoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reprint date: {new Date().toLocaleDateString()}</span>
                  <span>Shift: A</span>
                </div>
                {selectedInvoice.customerName && (
                  <div className="flex justify-between border-t border-dashed border-gray-100 pt-1 mt-1 font-bold">
                    <span>Cust: {selectedInvoice.customerName}</span>
                    <span>No: {selectedInvoice.customerPhone || "N/A"}</span>
                  </div>
                )}
                <div className="border-t border-dashed border-black my-2"></div>
              </div>

              {/* Items listing table */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-[10px]">
                  <span className="w-1/2">ITEM NAME</span>
                  <span className="w-1/6 text-right">QTY</span>
                  <span className="w-1/6 text-right">RATE</span>
                  <span className="w-1/6 text-right">AMT</span>
                </div>
                <div className="border-b border-dashed border-gray-300"></div>

                {selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] leading-none">
                    <span className="w-1/2 truncate font-semibold uppercase">{item.name}</span>
                    <span className="w-1/6 text-right font-bold">{item.quantity}</span>
                    <span className="w-1/6 text-right">{item.price}</span>
                    <span className="w-1/6 text-right font-bold">
                      {item.price * item.quantity}
                    </span>
                  </div>
                ))}

                <div className="border-t border-dashed border-black my-2.5"></div>
              </div>

              {/* Bill totals */}
              <div className="space-y-1.5 text-right text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal Amount:</span>
                  <span className="font-bold">
                    {settings.currency} {selectedInvoice.subtotal.toFixed(2)}
                  </span>
                </div>
                {settings.taxEnabled && (
                  <div className="flex justify-between text-[10px] text-gray-650">
                    <span>CGST + SGST (Included):</span>
                    <span>
                      {settings.currency} {selectedInvoice.taxTotal.toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Coupon Applied:</span>
                    <span>
                      -{settings.currency} {selectedInvoice.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-dashed border-black my-1"></div>
                <div className="flex justify-between text-sm font-black text-black">
                  <span>NET TOTAL COMPLETED:</span>
                  <span>
                    {settings.currency} {selectedInvoice.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Receipt thermal greeting footer */}
              <div className="text-center mt-5 space-y-1">
                <div className="border-t border-dashed border-black mb-2"></div>
                <p className="text-[10px] italic leading-tight">
                  "{settings.footerMessage}"
                </p>
                <p className="text-[9px] font-bold text-gray-400">Reprint issued via system logs v2.6</p>
              </div>
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 focus:outline-none transition-colors"
            >
              <Printer size={15} />
              Re-Print Thermal Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
