/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useApp } from "../AppContext";
import {
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  Check,
  X,
  CreditCard,
  Plus,
  Clock,
  Printer,
  ChevronRight,
  FileText,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { Employee, Attendance, SalaryPayment } from "../types";

export default function StaffPayrollView() {
  const {
    employees,
    attendance,
    salaryPayments,
    addEmployee,
    editEmployee,
    markAttendance,
    addSalaryPayment,
    settings,
    session,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"attendance" | "payroll" | "employees">("attendance");
  const todayStr = "2026-06-10";

  // Form states
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [empForm, setEmpForm] = useState({
    name: "",
    contact: "",
    designation: "Staff" as Employee["designation"],
    shift: "Morning" as Employee["shift"],
    salaryType: "daily" as Employee["salaryType"],
    salaryAmount: "",
  });

  // Salary processing state
  const [processingEmp, setProcessingEmp] = useState<Employee | null>(null);
  const [salaryForm, setSalaryForm] = useState({
    payPeriod: "June 2026",
    baseSalary: "",
    advanceDeduction: "0",
    bonus: "0",
    paymentMethod: "Bank Transfer" as SalaryPayment["paymentMethod"],
  });

  const [selectedPayslip, setSelectedPayslip] = useState<SalaryPayment | null>(null);

  // Submissions
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name || !empForm.contact || !empForm.salaryAmount) return;

    if (session.role !== "Admin" && session.role !== "Manager") {
      alert("Permission Blocked: Only Managers and Admins can register new store workers.");
      return;
    }

    addEmployee({
      name: empForm.name,
      contact: empForm.contact,
      designation: empForm.designation,
      shift: empForm.shift,
      salaryType: empForm.salaryType,
      salaryAmount: parseFloat(empForm.salaryAmount),
      active: true,
      avatarColor: "bg-teal-500", // Will be auto-assigned in AppContext
    });

    setEmpForm({
      name: "",
      contact: "",
      designation: "Staff",
      shift: "Morning",
      salaryType: "daily",
      salaryAmount: "",
    });
    setShowAddEmp(false);
  };

  const handleProcessSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingEmp) return;

    if (session.role !== "Admin") {
      alert("Strict Permission Blocked: General wage accounts can only be processed by the store Admin.");
      return;
    }

    const base = parseFloat(salaryForm.baseSalary) || 0;
    const deduction = parseFloat(salaryForm.advanceDeduction) || 0;
    const bonus = parseFloat(salaryForm.bonus) || 0;
    const net = base + bonus - deduction;

    addSalaryPayment({
      employeeId: processingEmp.id,
      payPeriod: salaryForm.payPeriod,
      baseSalary: base,
      advanceDeduction: deduction,
      bonus,
      netPaid: net,
      paymentDate: todayStr,
      paymentMethod: salaryForm.paymentMethod,
      status: "Paid",
    });

    setProcessingEmp(null);
    setSalaryForm({
      payPeriod: "June 2026",
      baseSalary: "",
      advanceDeduction: "0",
      bonus: "0",
      paymentMethod: "Bank Transfer",
    });
  };

  const calculateDaysPresent = (empId: string) => {
    return attendance.filter((a) => a.employeeId === empId && a.status === "Present").length;
  };

  const triggerProcessSalaryClick = (emp: Employee) => {
    const days = calculateDaysPresent(emp.id);
    let estimatedWages = emp.salaryAmount;
    if (emp.salaryType === "daily") {
      estimatedWages = days * emp.salaryAmount;
    }

    setProcessingEmp(emp);
    setSalaryForm({
      payPeriod: "June 2026",
      baseSalary: estimatedWages.toString(),
      advanceDeduction: "0",
      bonus: "0",
      paymentMethod: emp.salaryType === "daily" ? "Cash" : "Bank Transfer",
    });
  };

  return (
    <div className="space-y-6">
      {/* Upper Navigation and Quick Register */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150 shadow-xs">
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full scrollbar-none select-none shrink-0 w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab("attendance")}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 transition-colors focus:outline-none shrink-0 ${
              activeSubTab === "attendance" ? "bg-white text-indigo-800 shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <UserCheck size={15} />
            Check-In Log
          </button>

          <button
            onClick={() => setActiveSubTab("payroll")}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 transition-colors focus:outline-none shrink-0 ${
              activeSubTab === "payroll" ? "bg-white text-indigo-800 shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <DollarSign size={15} />
            Wages & Payroll Ledger
          </button>

          <button
            onClick={() => setActiveSubTab("employees")}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 transition-colors focus:outline-none shrink-0 ${
              activeSubTab === "employees" ? "bg-white text-indigo-800 shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Users size={15} />
            Staff Roster ({employees.length})
          </button>
        </div>

        {["Admin", "Manager"].includes(session.role) && (
          <button
            onClick={() => setShowAddEmp(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1 focus:outline-none transition-colors shadow-xs"
          >
            <UserPlus size={15} />
            Register Staff member
          </button>
        )}
      </div>

      {/* VIEW A: CHIEF DAILY ATTENDANCE & SHIFTS */}
      {activeSubTab === "attendance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees
            .filter((e) => e.active)
            .map((emp) => {
              const todaysLog = attendance.find((a) => a.employeeId === emp.id && a.date === todayStr);
              const presentCount = calculateDaysPresent(emp.id);

              return (
                <div key={emp.id} className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 ${emp.avatarColor || "bg-indigo-500"} text-white font-extrabold text-sm rounded-xl flex items-center justify-center`}>
                      {emp.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base leading-none">{emp.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Role: <b>{emp.designation}</b> • Shift: <b>{emp.shift}</b>
                      </p>
                    </div>
                  </div>

                  {/* Attendance Log Details for Today */}
                  <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-extrabold block">TODAY STATUS</span>
                      <span className={`font-black text-xs block mt-0.5 ${
                        todaysLog?.status === "Present"
                          ? "text-emerald-600"
                          : todaysLog?.status === "Absent"
                          ? "text-rose-600"
                          : todaysLog?.status === "Leave"
                          ? "text-amber-600"
                          : "text-gray-400"
                      }`}>
                        {todaysLog?.status || "Not Marked"}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-extrabold block">PUNCH TIMER</span>
                      <span className="font-mono text-[11px] text-gray-700 block mt-0.5 font-bold">
                        {todaysLog?.checkIn ? `${todaysLog.checkIn} Check-in` : "Absent / --:--"}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Quick buttons to register punches */}
                  <div className="flex items-center gap-1.5 border-t border-slate-50 pt-3">
                    {/* Check attendance toggles */}
                    <button
                      onClick={() => markAttendance(emp.id, "Present", "08:30")}
                      className={`flex-1 py-1.8 text-[11px] font-bold rounded-lg border transition-all select-none ${
                        todaysLog?.status === "Present"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-gray-600 hover:bg-slate-50"
                      }`}
                    >
                      Present
                    </button>

                    <button
                      onClick={() => markAttendance(emp.id, "Absent")}
                      className={`flex-1 py-1.8 text-[11px] font-bold rounded-lg border transition-all ${
                        todaysLog?.status === "Absent"
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-white text-gray-600 hover:bg-slate-50"
                      }`}
                    >
                      Absent
                    </button>

                    <button
                      onClick={() => markAttendance(emp.id, "Leave")}
                      className={`flex-1 py-1.8 text-[11px] font-bold rounded-lg border transition-all ${
                        todaysLog?.status === "Leave"
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-gray-600 hover:bg-slate-50"
                      }`}
                    >
                      Leave
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* VIEW B: WAGES & PAYROLL HISTORIC BOARD */}
      {activeSubTab === "payroll" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Staff wage levels processing cards list (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs">
              <div className="p-4 border-b bg-slate-50">
                <span className="text-[10px] font-extrabold tracking-wider text-indigo-800 uppercase block">Salary Calculations Helper</span>
                <p className="text-xs text-gray-500">Calculates pay periods based on registered shifts inside state context</p>
              </div>

              <div className="divide-y">
                {employees.map((emp) => {
                  const daysMarked = calculateDaysPresent(emp.id);
                  const isDaily = emp.salaryType === "daily";

                  return (
                    <div key={emp.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div>
                        <span className="font-extrabold text-slate-800 text-sm sm:text-base">{emp.name}</span>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Base wage structure: <b>₹{emp.salaryAmount.toLocaleString()} / {emp.salaryType}</b>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-4">
                        <div className="text-right">
                          <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black text-gray-600 mb-1">
                            {daysMarked} Days Checked-In
                          </span>
                          <span className="text-xs font-bold text-gray-500 block">
                            Estimated due:{" "}
                            <b className="text-slate-800 font-extrabold">
                              ₹{isDaily ? daysMarked * emp.salaryAmount : emp.salaryAmount}
                            </b>
                          </span>
                        </div>

                        {["Admin", "Manager"].includes(session.role) && (
                          <button
                            onClick={() => triggerProcessSalaryClick(emp)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all focus:outline-none"
                          >
                            Process Pay
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Salary payments history (slips log table) */}
            <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b">
                <span className="text-[10px] font-extrabold text-slate-500 block">Payroll disbursement history logs</span>
              </div>

              {/* Mobile-friendly list */}
              <div className="md:hidden divide-y divide-slate-100 text-xs">
                {salaryPayments.map((pay) => {
                  const empObj = employees.find((e) => e.id === pay.employeeId);
                  return (
                    <div key={pay.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-extrabold text-slate-800 text-sm">{empObj ? empObj.name : "Ex Worker"}</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">Pay cycle: {pay.payPeriod}</span>
                        </div>
                        <span className="font-mono font-black text-slate-900 text-sm">
                          ₹{pay.netPaid.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1.5 border-t border-dashed border-slate-100">
                        <span>Paid Ref Date: <b>{pay.paymentDate}</b></span>
                        <button
                          onClick={() => setSelectedPayslip(pay)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg focus:outline-none inline-flex items-center gap-0.5"
                        >
                          <FileText size={11} />
                          Open Slip
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-400 font-extrabold tracking-wider border-b">
                      <th className="py-2.5 px-4 col-span-2">Employee Paid</th>
                      <th className="py-2.5 px-4">Pay Cycle Period</th>
                      <th className="py-2.5 px-4 text-right">Net Salary (₹)</th>
                      <th className="py-2.5 px-4 text-center">Paid Date</th>
                      <th className="py-2.5 px-4 text-center text-indigo-800">Payslip Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {salaryPayments.map((pay) => {
                      const empObj = employees.find((e) => e.id === pay.employeeId);
                      return (
                        <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-extrabold text-slate-800">{empObj ? empObj.name : "Ex Worker"}</td>
                          <td className="py-3 px-4 font-semibold text-gray-500">{pay.payPeriod}</td>
                          <td className="py-3 px-4 text-right font-black font-mono text-slate-900">₹{pay.netPaid.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center text-gray-400 text-[11px] font-bold">{pay.paymentDate}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedPayslip(pay)}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] focus:outline-none inline-flex items-center gap-0.5"
                            >
                              <FileText size={11} />
                              Open Slip
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form container: active pay slip builder (1 column) */}
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-slate-800 border-b pb-2 flex items-center justify-between">
              <span>Disburse Wages Voucher</span>
              {processingEmp && (
                <button
                  type="button"
                  onClick={() => setProcessingEmp(null)}
                  className="text-xs text-rose-500 font-bold focus:outline-none"
                >
                  Cancel
                </button>
              )}
            </h4>

            {processingEmp ? (
              <form onSubmit={handleProcessSalary} className="space-y-3">
                <div className="bg-slate-50 p-2 rounded-xl text-xs space-y-0.5">
                  <span className="block text-gray-400 font-bold text-[10px]">PAYEE worker</span>
                  <span className="font-extrabold text-slate-800 text-sm">{processingEmp.name}</span>
                  <span className="block text-[10px]">Salary structure: ₹{processingEmp.salaryAmount}/{processingEmp.salaryType}</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Pay Period label</label>
                  <input
                    type="text"
                    value={salaryForm.payPeriod}
                    onChange={(e) => setSalaryForm({ ...salaryForm, payPeriod: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Base Wages (₹)</label>
                    <input
                      type="number"
                      value={salaryForm.baseSalary}
                      onChange={(e) => setSalaryForm({ ...salaryForm, baseSalary: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs text-indigo-900 font-bold border rounded-lg focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Deducted advances (₹)</label>
                    <input
                      type="number"
                      value={salaryForm.advanceDeduction}
                      onChange={(e) => setSalaryForm({ ...salaryForm, advanceDeduction: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs text-indigo-900 border rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Bonus wage (₹)</label>
                    <input
                      type="number"
                      value={salaryForm.bonus}
                      onChange={(e) => setSalaryForm({ ...salaryForm, bonus: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs text-indigo-900 font-bold border rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Wage channel</label>
                    <select
                      value={salaryForm.paymentMethod}
                      onChange={(e) => setSalaryForm({ ...salaryForm, paymentMethod: e.target.value as SalaryPayment["paymentMethod"] })}
                      className="w-full p-1.5 text-xs font-bold border rounded-lg focus:outline-none"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 rounded-xl flex justify-between items-center font-bold text-xs">
                  <span>Net wages cashout:</span>
                  <span className="text-sm font-black text-indigo-800">
                    ₹
                    {(
                      (parseFloat(salaryForm.baseSalary) || 0) +
                      (parseFloat(salaryForm.bonus) || 0) -
                      (parseFloat(salaryForm.advanceDeduction) || 0)
                    ).toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl focus:outline-none shadow-xs transition-colors"
                >
                  Confirm and Authorize Payment
                </button>
              </form>
            ) : (
              <div className="py-12 text-center text-gray-400">
                <Calendar size={32} className="mx-auto mb-2 text-slate-200" />
                <p className="text-xs font-bold">No Employee chosen for wage calculations</p>
                <p className="text-[10px] text-gray-400 mt-1">Select "Process Pay" from table to load calculations</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW C: STAFF ROSTER CONTACTS */}
      {activeSubTab === "employees" && (
        <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs">
          {/* Mobile Staff Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {employees.map((emp) => (
              <div key={emp.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${emp.avatarColor} text-white font-black flex items-center justify-center text-xs shrink-0 shadow-sm`}>
                    {emp.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800 text-sm truncate">{emp.name}</span>
                      <span className={`inline-block px-1.5 py-0.5 font-bold rounded text-[9px] ${
                        emp.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {emp.active ? "Active" : "Leaved"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-400 font-bold">
                      <span>{emp.designation}</span>
                      <span>•</span>
                      <span>{emp.shift}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] pt-2 border-t border-dashed border-slate-100 text-gray-400">
                  <span>Contact: <b className="font-mono text-slate-600 font-bold">{emp.contact}</b></span>
                  <span>Wage: <b className="text-slate-800 font-extrabold">₹{emp.salaryAmount.toLocaleString()} / {emp.salaryType}</b></span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-extrabold tracking-wider border-b">
                  <th className="py-3 px-4">Register Employee</th>
                  <th className="py-3 px-4">Worker Contact Details</th>
                  <th className="py-3 px-4">Standard Designation Role</th>
                  <th className="py-3 px-4">Active Shift timing</th>
                  <th className="py-3 px-4">Base Salary setting</th>
                  <th className="py-3 px-4">Shop Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-extrabold text-slate-800 flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-lg ${emp.avatarColor} text-white font-black flex items-center justify-center text-[10px]`}>
                        {emp.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-extrabold">{emp.name}</div>
                        <div className="text-[9px] text-gray-400">Date joined: {emp.joinDate}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-gray-500">{emp.contact}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-slate-100 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {emp.designation}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-500">{emp.shift}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{emp.salaryAmount.toLocaleString()} / <span className="text-[10px] font-normal text-slate-400">{emp.salaryType}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-1.5 py-0.5 font-bold rounded text-[10px] ${
                        emp.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {emp.active ? "Active Staff" : "Leaved"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTER NEW MEMBER MODAL */}
      {showAddEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <form
            onSubmit={handleAddEmployee}
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-base font-extrabold text-slate-800 font-sans">Register Tea shop worker</h4>
              <button
                type="button"
                onClick={() => setShowAddEmp(false)}
                className="text-gray-400 hover:text-gray-650 focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">FULL NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Anand Gowda"
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">MOBILE PHONE (10 DIGITS)</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="e.g. 9812345678"
                  value={empForm.contact}
                  onChange={(e) => setEmpForm({ ...empForm, contact: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">DESIGNATION</label>
                  <select
                    value={empForm.designation}
                    onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value as Employee["designation"] })}
                    className="w-full p-2 border rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="Chef">Chef (Barista)</option>
                    <option value="Cashier">Cashier Counter</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Helper / Staff</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">SHIFT TIMINGS</label>
                  <select
                    value={empForm.shift}
                    onChange={(e) => setEmpForm({ ...empForm, shift: e.target.value as Employee["shift"] })}
                    className="w-full p-2 border rounded-xl text-xs font-bold"
                  >
                    <option value="Morning">Morning Shift</option>
                    <option value="Evening">Evening Shift</option>
                    <option value="Full Day">Full Day Shift</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">STIPEND PAY RATE (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={empForm.salaryAmount}
                    onChange={(e) => setEmpForm({ ...empForm, salaryAmount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">STIPEND SCHEDULE</label>
                  <select
                    value={empForm.salaryType}
                    onChange={(e) => setEmpForm({ ...empForm, salaryType: e.target.value as Employee["salaryType"] })}
                    className="w-full p-2 border rounded-xl text-xs font-bold"
                  >
                    <option value="daily">Daily Wage worker</option>
                    <option value="monthly">Monthly salaried</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
            >
              Confirm and Issue ID Card
            </button>
          </form>
        </div>
      )}

      {/* SELECTED PAYSLIP DIALOG thermal voucher look */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl relative text-xs text-white">
            <button
              onClick={() => setSelectedPayslip(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white focus:outline-none bg-slate-700 p-1 rounded-full"
            >
              <X size={15} />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-black tracking-wider text-indigo-400 uppercase">OFFICIAL SALARY DISBURSE RECORD</span>
              <h4 className="text-sm font-extrabold mt-1">{settings.shopName} Payroll</h4>
              <div className="border-t border-dashed border-slate-650 my-2"></div>
            </div>

            <div className="bg-white text-black p-4 font-mono text-[11px] rounded-lg space-y-3">
              <div className="text-center font-extrabold">WAGE SLIP COMPLIANCE</div>
              <p>ID: {selectedPayslip.id}</p>
              <p>Period: <b>{selectedPayslip.payPeriod}</b></p>
              <p>Paid Worker: <b>{employees.find((e) => e.id === selectedPayslip.employeeId)?.name || "Unknown"}</b></p>
              <p>Method Used: {selectedPayslip.paymentMethod}</p>

              <div className="border-t border-dashed border-gray-300 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Base Wages:</span>
                  <span>₹{selectedPayslip.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Incentive Reward:</span>
                  <span>+₹{selectedPayslip.bonus.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Advance Deductions:</span>
                  <span className="text-rose-600">-₹{selectedPayslip.advanceDeduction.toLocaleString()}</span>
                </div>
                <div className="border-t border-dashed border-gray-400 pt-1 flex justify-between font-extrabold text-[12px]">
                  <span>NET BANK TRANSFERRED:</span>
                  <span>₹{selectedPayslip.netPaid.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center text-[9px] text-gray-500 pt-4 border-t border-dashed">
                Signed voucher digitally generated <br /> system on {selectedPayslip.paymentDate}
              </div>
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full py-2.5 bg-slate-700 hover:bg-slate-650 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 focus:outline-none"
            >
              <Printer size={14} />
              Print voucher copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
