/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useApp } from "../AppContext";
import {
  FileText,
  DollarSign,
  PlusCircle,
  Search,
  Trash2,
  Calendar,
  X,
  TrendingDown,
  Percent,
} from "lucide-react";
import { Expense, ExpenseCategory } from "../types";

export default function ExpensesView() {
  const { expenses, addExpense, deleteExpense, settings, session } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Ingredients & Milk");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("2026-06-10");
  const [receiptName, setReceiptName] = useState("");

  const categories: ExpenseCategory[] = [
    "Rent",
    "Electricity & Water",
    "Ingredients & Milk",
    "Staff Welfare",
    "Transport & Logistics",
    "Internet & Marketing",
    "Miscellaneous",
  ];

  // Calculations
  const filteredExpenses = useMemo(() => {
    return expenses.filter(
      (e) =>
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [expenses, searchQuery]);

  const stats = useMemo(() => {
    const totalSum = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categorySums: Record<ExpenseCategory, number> = {
      Rent: 0,
      "Electricity & Water": 0,
      "Ingredients & Milk": 0,
      "Staff Welfare": 0,
      "Transport & Logistics": 0,
      "Internet & Marketing": 0,
      Miscellaneous: 0,
    };

    expenses.forEach((e) => {
      if (categorySums[e.category] !== undefined) {
        categorySums[e.category] += e.amount;
      } else {
        categorySums["Miscellaneous"] += e.amount;
      }
    });

    return {
      totalSum,
      categorySums,
    };
  }, [expenses]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) return;

    if (session.role === "Cashier" || session.role === "Staff") {
      alert("Permission Blocked: Only Managers and Admins can log store overhead expenditures.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    const trimmedDesc = description.trim();

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Validation Error: Expense amount must be a positive number.");
      return;
    }

    if (trimmedDesc.length < 3) {
      alert("Validation Error: Expense description must be at least 3 characters long.");
      return;
    }

    addExpense({
      category,
      amount: parsedAmount,
      description: trimmedDesc,
      date,
      receiptName: receiptName || undefined,
    });

    // Reset Form
    setAmount("");
    setCategory("Ingredients & Milk");
    setDescription("");
    setDate("2026-06-10");
    setReceiptName("");
    setShowAddForm(false);
  };

  const handleMockReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptName(e.target.files[0].name);
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (session.role !== "Admin") {
      alert("Strict Permission Blocked: Only Admin role can delete compiled expense records!");
      return;
    }

    if (confirm("Are you sure you want to delete this expense record? This will adjust net profit totals.")) {
      deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics overview widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total expenses monthly card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs md:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs sm:text-sm font-medium">Accumulated Expenses</span>
            <span className="p-1.5 px-2 bg-rose-50 text-rose-500 rounded-lg text-xs font-bold leading-none">Monthly</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-gray-900 leading-none">
              ₹{stats.totalSum.toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-400 mt-2">Sum of Rent, Electricity bills, logistics and welfare</p>
          </div>
        </div>

        {/* Categories split summaries cards (2 col span) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs md:col-span-2 space-y-3">
          <span className="text-[10px] tracking-wider text-teal-800 font-extrabold uppercase block">
            Category Breakdown Share
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
            {Object.entries(stats.categorySums).map(([cat, sum]) => {
              if (sum === 0) return null;
              const val = sum as number;
              const pct = stats.totalSum > 0 ? Math.round((val / stats.totalSum) * 100) : 0;

              return (
                <div key={cat} className="p-2 bg-slate-50/50 rounded-xl space-y-1">
                  <span className="text-gray-400 font-bold block truncate text-[9px] uppercase leading-none">{cat}</span>
                  <span className="text-xs font-extrabold text-slate-800 block">₹{sum.toLocaleString()}</span>
                  <span className="text-[9px] text-emerald-600 font-black flex items-center gap-0.5 mt-0.5">
                    {pct}% share
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Filter table Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-800">Expenditure Ledger</h3>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search expenses by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 text-gray-800 border rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          {["Admin", "Manager"].includes(session.role) && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 focus:outline-none transition-colors shadow-xs"
            >
              <PlusCircle size={15} />
              Log Expense
            </button>
          )}
        </div>
      </div>

      {/* VIEW PANEL TABLE */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs">
        {/* Mobile Swipe Card Grid */}
        <div className="md:hidden divide-y divide-slate-100 text-xs">
          {filteredExpenses.map((e) => (
            <div key={e.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="inline-block bg-slate-150 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full mb-1">
                    {e.category}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-sm">{e.description}</h4>
                  <span className="text-[10px] text-gray-400 block mt-1">Logged: {e.date}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-rose-600 text-sm block">
                    ₹{e.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] pt-2 border-t border-dashed border-slate-100">
                <div>
                  {e.receiptName ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                      <FileText size={10} />
                      Receipt Ok
                    </span>
                  ) : (
                    <span className="text-gray-300 font-semibold uppercase">No receipt</span>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteExpense(e.id)}
                  className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg focus:outline-none flex items-center gap-1 font-bold"
                >
                  <Trash2 size={11} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}

          {filteredExpenses.length === 0 && (
            <div className="p-8 text-center text-gray-400 font-bold">
              No expense record lines fetched.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-extrabold tracking-wider border-b uppercase">
                <th className="py-3 px-4">Date logged</th>
                <th className="py-3 px-4">Expense category</th>
                <th className="py-3 px-4">Overhead Description</th>
                <th className="py-3 px-4 text-right">Amount Out (₹)</th>
                <th className="py-3 px-4 text-center">Receipt attachment</th>
                <th className="py-3 px-4 text-center">Admin action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-450">{e.date}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-700">
                    <span className="inline-block bg-slate-150 text-slate-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{e.description}</td>
                  <td className="py-3.5 px-4 text-right font-black text-rose-600 font-mono">₹{e.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-center italic text-gray-400">
                    {e.receiptName ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 cursor-help" title={`Mock file: ${e.receiptName}`}>
                        <FileText size={11} />
                        Receipt Ok
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-300 font-semibold uppercase">No receipt uploaded</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleDeleteExpense(e.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg focus:outline-none"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-bold">
                    No expense record lines fetched.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG OVERHEAD DIALOG MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-40">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white rounded-3xl max-w-sm w-full flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-3.5 border-b border-gray-100 flex-none bg-white">
              <h4 className="text-base font-extrabold text-slate-800 font-sans">Record shop expenditure</h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-slate-650 p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-h-0 bg-white">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">CHOOSE OVERHEAD TYPE</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full p-2 border rounded-xl text-xs font-bold focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">BILL AMOUNT (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 250"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1 font-mono">BILLING DATE</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2 py-2 border rounded-xl text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">MEMO DESCRIPTION</label>
                <input
                  type="text"
                  placeholder="e.g. Gas cylinder refill bill - BharatGas"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">UPLOAD RECEIPT VOUCHER</label>
                <div className="border border-dashed p-3 rounded-xl hover:bg-slate-50 cursor-pointer flex flex-col justify-center items-center text-center relative gap-1">
                  <span className="text-[11px] font-bold text-indigo-700">
                    {receiptName ? `Selected: ${receiptName}` : "Click to select Receipt file"}
                  </span>
                  <span className="text-[9px] text-gray-400">Supports PNG, PDF receipt (Max 2MB)</span>
                  <input
                    type="file"
                    onChange={handleMockReceiptUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-150 bg-slate-50 flex items-center gap-2.5 flex-none">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 text-center border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer transition-colors active:scale-95 duration-100 focus:outline-none"
              >
                Cancel / Back
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 duration-100 cursor-pointer focus:outline-none"
              >
                Log Expense
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
