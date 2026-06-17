/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useApp } from "../AppContext";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  IndianRupee,
  Receipt,
  CheckCircle,
  Clock,
  ChevronRight,
  DollarSign,
  Briefcase,
  FileMinus,
  Coffee,
} from "lucide-react";
import { Product, Invoice } from "../types";

export default function DashboardView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const {
    invoices,
    products,
    rawMaterials,
    employees,
    attendance,
    expenses,
    settings,
    session,
  } = useApp();

  // Helper date parsing (Local time boundary)
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA');
  const currentMonthPrefix = todayStr.substring(0, 7) + "-";
  const currentYearPrefix = todayStr.substring(0, 4) + "-";

  // Calculate Metrics
  const metrics = useMemo(() => {
    // 1. Today's Sales
    const todayInvoices = invoices.filter((inv) => inv.date.startsWith(todayStr));
    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const todayOrdersCount = todayInvoices.length;
    const todayProfit = todayInvoices.reduce((sum, inv) => sum + inv.profit, 0);

    // 2. Month's Sales
    const monthInvoices = invoices.filter((inv) => inv.date.includes(currentMonthPrefix));
    const monthSales = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const monthProfit = monthInvoices.reduce((sum, inv) => sum + inv.profit, 0);

    // 3. Yearly Sales
    const yearInvoices = invoices.filter((inv) => inv.date.includes(currentYearPrefix));
    const yearSales = yearInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // 4. Low stock count
    const lowStockProducts = products.filter((p) => p.stock <= p.minStock).length;
    const lowStockMaterials = rawMaterials.filter((m) => m.stock <= m.minStock).length;
    const totalLowStock = lowStockProducts + lowStockMaterials;

    // 5. Attendance Summary today
    const activeStaff = employees.filter((e) => e.active).length;
    const presentToday = attendance.filter((a) => a.date === todayStr && a.status === "Present").length;

    // 6. Total active items
    const totalItems = products.length;

    // 7. Inventory Value (At cost price)
    const productsValue = products.reduce((sum, p) => sum + p.stock * p.purchasePrice, 0);
    const materialsValue = rawMaterials.reduce((sum, m) => sum + m.stock * m.purchasePrice, 0);
    const totalInventoryValue = productsValue + materialsValue;

    // 8. Monthly Expenses
    const monthExpenses = expenses
      .filter((exp) => exp.date.includes(currentMonthPrefix))
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      todaySales,
      todayOrdersCount,
      todayProfit,
      monthSales,
      monthProfit,
      yearSales,
      totalLowStock,
      presentToday,
      activeStaff,
      totalItems,
      totalInventoryValue,
      monthExpenses,
    };
  }, [invoices, products, rawMaterials, employees, attendance, expenses, todayStr, currentMonthPrefix, currentYearPrefix]);

  // Chart calculation: last 7 days sales dynamically
  const chartData = useMemo(() => {
    const daysList = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const name = `${weekdays[d.getDay()]} (${months[d.getMonth()]} ${d.getDate()})`;
      daysList.push({ name, date: dateStr, total: 0 });
    }

    return daysList.map((day) => {
      const matchInvoices = invoices.filter((inv) => inv.date.startsWith(day.date));
      const totalAmount = matchInvoices.reduce((sum, inv) => sum + inv.total, 0);
      return {
        ...day,
        total: totalAmount,
      };
    });
  }, [invoices]);

  // Max value for scaling SVG chart
  const maxSalesVal = Math.max(...chartData.map((d) => d.total), 500);

  // Category breakdown for Pie chart (SVG ring)
  const categorySplit = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const category = prod ? prod.category : "Others";
        categoryTotals[category] = (categoryTotals[category] || 0) + item.price * item.quantity;
      });
    });

    const list = Object.entries(categoryTotals).map(([name, total]) => ({ name, total }));
    list.sort((a, b) => b.total - a.total);
    return list;
  }, [invoices, products]);

  const totalSalesAll = categorySplit.reduce((sum, item) => sum + item.total, 1);

  // Top Products list
  const topProducts = useMemo(() => {
    const itemsCount: Record<string, { name: string; qty: number; sales: number }> = {};
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        if (!itemsCount[item.productId]) {
          itemsCount[item.productId] = { name: item.name, qty: 0, sales: 0 };
        }
        itemsCount[item.productId].qty += item.quantity;
        itemsCount[item.productId].sales += item.price * item.quantity;
      });
    });

    return Object.values(itemsCount)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [invoices]);

  // Alert components for low stock
  const lowStockList = useMemo(() => {
    const pLow = products
      .filter((p) => p.stock <= p.minStock)
      .map((p) => ({ id: p.id, name: p.name, stock: `${p.stock} ${p.unit}s`, min: p.minStock, type: "Product" }));
    const mLow = rawMaterials
      .filter((m) => m.stock <= m.minStock)
      .map((m) => ({ id: m.id, name: m.name, stock: `${m.stock} ${m.unit}`, min: m.minStock, type: "Material" }));
    return [...pLow, ...mLow].slice(0, 4);
  }, [products, rawMaterials]);

  return (
    <div className="space-y-6">
      {/* Upper Banner with Quick Action triggers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight flex items-center gap-2">
            Chai Charcha Hub <Coffee size={24} className="text-amber-300" />
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            Running in <span className="font-semibold">{session.role} view</span>. Monitor billing, ingredients, staff payroll and analytics in real time.
          </p>
        </div>

        {/* Quick buttons */}
        <div className="flex flex-wrap gap-2.5">
          {["Admin", "Manager", "Cashier"].includes(session.role) && (
            <button
              onClick={() => setActiveTab("pos")}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl cursor-pointer active:scale-95 transition-all shadow-lg border border-emerald-400/40 uppercase tracking-wider leading-none focus:outline-none"
            >
              <ShoppingBag size={15} />
              Open POS Terminal
            </button>
          )}
          {["Admin", "Manager"].includes(session.role) && (
            <button
              onClick={() => setActiveTab("inventory")}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-950/45 dark:bg-slate-900/40 hover:bg-slate-950/60 text-white font-black text-xs sm:text-sm rounded-xl cursor-pointer active:scale-95 transition-all border border-emerald-500/35 uppercase tracking-wider leading-none focus:outline-none"
            >
              <Layers size={15} />
              Add Stock
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Status Dashboard Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Sales */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs sm:text-sm font-medium">Today's Sales</span>
            <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 leading-none">
              {settings.currency} {metrics.todaySales.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <TrendingUp size={12} className="inline mr-0.5" />
                {metrics.todayOrdersCount} Orders
              </span>{" "}
              received today
            </p>
          </div>
        </div>

        {/* Month Sales */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs sm:text-sm font-medium">Monthly Revenue</span>
            <div className="h-8 w-8 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 leading-none">
              {settings.currency} {metrics.monthSales.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Estimate Profit: <span className="text-teal-600 font-bold">{settings.currency}{metrics.monthProfit.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs sm:text-sm font-medium flex items-center gap-1">
              Monthly Expenses
            </span>
            <div className="h-8 w-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
              <FileMinus size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 leading-none">
              {settings.currency} {metrics.monthExpenses.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Net Profit:{" "}
              <span className="font-bold text-emerald-600">
                {settings.currency}
                {(metrics.monthProfit - metrics.monthExpenses).toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Inventory Valuation and Stock Warnings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs sm:text-sm font-medium">Asset & Stock</span>
            {metrics.totalLowStock > 0 ? (
              <div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 animate-pulse">
                <AlertTriangle size={16} />
              </div>
            ) : (
              <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <Layers size={16} />
              </div>
            )}
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 leading-none">
              {settings.currency} {Math.round(metrics.totalInventoryValue).toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span>Value of assets</span>
              {metrics.totalLowStock > 0 && (
                <span className="inline-block bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                  {metrics.totalLowStock} items low
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section (SVG powered, lightweight, exact) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales trend chart card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Weekly Revenue Flow</h3>
              <p className="text-xs text-gray-400">Total sale receipts in past week</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg font-semibold">
              <CheckCircle size={12} />
              Live Updates
            </div>
          </div>

          {/* SVG Custom Area-Bar Chart */}
          <div className="relative mt-2 h-[190px]">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-gray-100 h-0 w-full"></div>
              <div className="border-b border-gray-100 h-0 w-full"></div>
              <div className="border-b border-gray-100 h-0 w-full"></div>
              <div className="border-b border-gray-100 h-0 w-full"></div>
            </div>

            {/* Custom SVG line / area rendering */}
            <svg
              className="w-full h-full pt-4"
              viewBox="0 0 550 150"
              preserveAspectRatio="none"
              style={{ overflow: "visible" }}
            >
              {/* Generate continuous path for points */}
              {chartData.length > 0 && (
                <>
                  {/* Fill area */}
                  <path
                    d={`
                      M 0 150 
                      ${chartData
                        .map((day, idx) => {
                          const x = (idx * 550) / (chartData.length - 1);
                          const y = 150 - (day.total / maxSalesVal) * 120;
                          return `L ${x} ${y}`;
                        })
                        .join(" ")} 
                      L 550 150 Z
                    `}
                    fill="url(#emeraldGradient)"
                    opacity="0.15"
                  />
                  {/* Line stroke */}
                  <path
                    d={chartData
                      .map((day, idx) => {
                        const x = (idx * 550) / (chartData.length - 1);
                        const y = 150 - (day.total / maxSalesVal) * 120;
                        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Dot anchors */}
                  {chartData.map((day, idx) => {
                    const x = (idx * 550) / (chartData.length - 1);
                    const y = 150 - (day.total / maxSalesVal) * 120;
                    return (
                      <g key={idx} className="cursor-pointer group">
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#ffffff"
                          stroke="#059669"
                          strokeWidth="3"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="12"
                          fill="#059669"
                          opacity="0"
                          className="hover:opacity-20 transition-opacity"
                        />
                      </g>
                    );
                  })}
                </>
              )}

              {/* Definitions */}
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>

            {/* Price values floated on top */}
            <div className="absolute inset-x-0 top-0 flex justify-between px-2 text-[10px] font-bold text-gray-500 select-none">
              {chartData.map((day, idx) => {
                const yOffset = 150 - (day.total / maxSalesVal) * 120;
                return (
                  <div
                    key={idx}
                    className="absolute text-center bg-gray-800 text-white px-1.5 py-0.5 rounded shadow-sm text-[9px]"
                    style={{
                      left: `calc(${(idx * 100) / (chartData.length - 1)}% - 20px)`,
                      top: `${yOffset - 18}px`,
                    }}
                  >
                    {settings.currency}
                    {day.total}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SVG X Labels */}
          <div className="flex justify-between mt-2.5 px-1">
            {chartData.map((day, idx) => (
              <div key={idx} className="text-[10px] sm:text-xs text-gray-500 font-medium text-center">
                {day.name.split(" ")[0]}
                <span className="block text-[8px] sm:text-[10px] text-gray-400">{day.name.split(" ")[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Category Mix Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <h3 className="text-base font-bold text-gray-800">Sales Category Mix</h3>
          <p className="text-xs text-gray-400 mb-4">Aesthetic contribution of store menus</p>

          <div className="flex flex-col items-center justify-center h-[180px] relative">
            {/* Draw a quick native CSS progress bar style or dynamic SVG ring */}
            {categorySplit.length === 0 ? (
              <p className="text-sm text-gray-400">No category data yet</p>
            ) : (
              <div className="w-full space-y-3">
                {categorySplit.slice(0, 4).map((item, idx) => {
                  const perc = Math.round((item.total / totalSalesAll) * 100);
                  const colors = ["bg-emerald-500", "bg-teal-500", "bg-amber-500", "bg-indigo-500"];
                  const col = colors[idx % colors.length];

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                        <span className="truncate">{item.name}</span>
                        <span>
                          {settings.currency} {item.total} ({perc}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${col} rounded-full`} style={{ width: `${perc}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts & Employee Attendance Status Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock list */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="p-1 px-2 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                <AlertTriangle size={16} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Low Stock Actions ({metrics.totalLowStock})</h4>
                <p className="text-[11px] text-gray-400">Inventory items below minimum levels</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("inventory")}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
            >
              Restock Item <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex-1 space-y-2.5">
            {lowStockList.length === 0 ? (
              <div className="h-32 flex flex-col justify-center items-center text-gray-400">
                <CheckCircle className="text-emerald-500 w-8 h-8 mb-1" />
                <p className="text-xs font-medium">All levels are perfectly fully stocked!</p>
              </div>
            ) : (
              lowStockList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400">Category Type: {item.type}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-amber-700 block">{item.stock}</span>
                      <span className="text-[9px] text-gray-400">Threshold: {item.min}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top selling products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="p-1 px-2 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center">
                <ShoppingBag size={16} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Top-Selling Products</h4>
                <p className="text-[11px] text-gray-400">Best performing shop items</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("pos")}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
            >
              POS Terminal <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex-1 space-y-2.5">
            {topProducts.length === 0 ? (
              <div className="h-32 flex flex-col justify-center items-center text-gray-400 text-center">
                <p className="text-xs font-medium">No sales transactions logged today.</p>
                <p className="text-[10px] mt-0.5">Ring up customers at the POS view!</p>
              </div>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 flex items-center justify-center text-[10px] font-extrabold bg-gray-100 text-gray-600 rounded-full">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-800 truncate">{prod.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900 block">
                      {settings.currency} {prod.sales.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">{prod.qty} units sold</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Staff Attendance and Operational summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        {/* Attendance counter */}
        <div className="flex items-center justify-between py-2 px-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shadow-xs">
              <Users size={18} />
            </div>
            <div>
              <h5 className="font-bold text-gray-800 text-sm">Staff Attendance</h5>
              <p className="text-xs text-gray-500">
                {metrics.presentToday} checked-in of {metrics.activeStaff} total active staff
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("payroll")}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-xs text-indigo-700 hover:bg-slate-50 font-semibold rounded-xl shadow-xs transition-colors"
          >
            Manage Shifts
          </button>
        </div>

        {/* Expenses counter quick links */}
        <div className="flex items-center justify-between py-2 px-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shadow-xs">
              <Clock size={18} />
            </div>
            <div>
              <h5 className="font-bold text-gray-800 text-sm">Operation Expenses</h5>
              <p className="text-xs text-gray-500">
                Expense level: {settings.currency}{metrics.monthExpenses.toLocaleString()} for June 2026
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("expenses")}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-xs text-indigo-700 hover:bg-slate-50 font-semibold rounded-xl shadow-xs transition-colors"
          >
            Review Bills
          </button>
        </div>
      </div>
    </div>
  );
}
