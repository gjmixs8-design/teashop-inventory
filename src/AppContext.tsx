/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Product,
  RawMaterial,
  Supplier,
  Expense,
  Employee,
  Attendance,
  SalaryPayment,
  Invoice,
  ShopSettings,
  StockMovementLog,
  UserSession,
  AppRole,
  CartItem,
  InvoiceItem,
} from "./types";
import {
  initialProducts,
  initialRawMaterials,
  initialSuppliers,
  initialExpenses,
  initialEmployees,
  initialAttendance,
  initialSalaryPayments,
  initialInvoices,
  initialStockMovementLogs,
  defaultShopSettings,
} from "./initialData";
import { 
  syncCollection, 
  writeDocument, 
  deleteDocument, 
  incrementCounter, 
  adjustStockTransaction,
  auth,
  isFirebaseConfigured
} from "./firebase";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";

interface AppContextType {
  products: Product[];
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  expenses: Expense[];
  employees: Employee[];
  attendance: Attendance[];
  salaryPayments: SalaryPayment[];
  invoices: Invoice[];
  settings: ShopSettings;
  stockMovementLogs: StockMovementLog[];
  session: UserSession;
  setSession: (session: UserSession) => void;

  // Authentication
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;

  // Actions
  addProduct: (p: Omit<Product, "id">) => void;
  editProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;

  addRawMaterial: (r: Omit<RawMaterial, "id">) => void;
  editRawMaterial: (r: RawMaterial) => void;
  deleteRawMaterial: (id: string) => void;

  addSupplier: (s: Omit<Supplier, "id">) => void;
  editSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;

  addExpense: (e: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;

  addEmployee: (emp: Omit<Employee, "id">) => void;
  editEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;

  markAttendance: (empId: string, status: Attendance["status"], checkIn?: string, checkOut?: string) => void;
  addSalaryPayment: (pay: Omit<SalaryPayment, "id">) => void;

  createInvoice: (
    items: CartItem[],
    discount: number,
    paymentMethod: Invoice["paymentMethod"],
    customerName?: string,
    customerPhone?: string,
    splitTotals?: { cash: number; upi: number; card: number }
  ) => Promise<Invoice>;
  refundInvoice: (id: string) => void;
  deleteInvoice: (id: string) => void;
  editInvoice: (inv: Invoice) => void;

  updateSettings: (settings: ShopSettings) => void;
  recordStockMovement: (itemId: string, itemType: "Product" | "Material", quantity: number, type: StockMovementLog["type"], notes?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(defaultShopSettings);
  const [stockMovementLogs, setStockMovementLogs] = useState<StockMovementLog[]>([]);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [session, setSessionState] = useState<UserSession>(() => {
    const local = localStorage.getItem("tea_session");
    return local ? JSON.parse(local) : { role: "Admin", userName: "Ravi Kumar (Owner)", userId: "emp-4" };
  });

  // Real-time Firestore synchronization listeners
  useEffect(() => {
    return syncCollection("products", setProducts, initialProducts);
  }, []);

  useEffect(() => {
    return syncCollection("raw_materials", setRawMaterials, initialRawMaterials);
  }, []);

  useEffect(() => {
    return syncCollection("suppliers", setSuppliers, initialSuppliers);
  }, []);

  useEffect(() => {
    return syncCollection("expenses", setExpenses, initialExpenses);
  }, []);

  useEffect(() => {
    return syncCollection("employees", setEmployees, initialEmployees);
  }, []);

  useEffect(() => {
    return syncCollection("attendance", setAttendance, initialAttendance);
  }, []);

  useEffect(() => {
    return syncCollection("salary_payments", setSalaryPayments, initialSalaryPayments);
  }, []);

  useEffect(() => {
    return syncCollection("invoices", setInvoices, initialInvoices);
  }, []);

  useEffect(() => {
    return syncCollection("settings", (data) => {
      if (data && data.length > 0) {
        const found = data.find((d) => d.id === "current") || data[0];
        if (found) {
          const { id, ...rest } = found;
          setSettings(rest as ShopSettings);
        }
      }
    }, [{ ...defaultShopSettings, id: "current" }]);
  }, []);

  useEffect(() => {
    return syncCollection("stock_logs", setStockMovementLogs, initialStockMovementLogs);
  }, []);

  // Monitor Firebase Auth User State
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sync auth state to active session when Strict Auth Mode is active
  useEffect(() => {
    if (!settings.strictAuthMode) {
      // Demo / simulation mode leaves the session alone
      return;
    }

    if (authLoading) return;

    if (firebaseUser && firebaseUser.email) {
      const matchedEmp = employees.find((emp) => emp.email === firebaseUser.email);
      if (matchedEmp) {
        setSessionState({
          role: matchedEmp.designation === "Chef" ? "Staff" : (matchedEmp.designation === "Manager" ? "Manager" : (matchedEmp.designation === "Cashier" ? "Cashier" : "Admin")),
          userName: matchedEmp.name,
          userId: matchedEmp.id,
        });
      } else {
        setSessionState({
          role: "Admin",
          userName: firebaseUser.email,
          userId: "firebase-admin",
        });
      }
    } else {
      setSessionState({
        role: "Staff",
        userName: "Guest Cashier",
        userId: "guest",
      });
    }
  }, [firebaseUser, employees, settings.strictAuthMode, authLoading]);

  const setSession = (sess: UserSession) => {
    // Prevent manual simulation role override when in strict server auth mode
    if (settings.strictAuthMode) {
      console.warn("Cannot manually set session when strict server auth mode is enabled.");
      return;
    }
    setSessionState(sess);
    try {
      localStorage.setItem("tea_session", JSON.stringify(sess));
    } catch (e) {
      console.warn("Session storage write blocked:", e);
    }
  };

  const loginUser = async (email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      setAuthLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        setAuthLoading(false);
        throw new Error(err.message || "Authentication failed");
      }
    } else {
      throw new Error("Firebase Authentication is not configured.");
    }
  };

  const logoutUser = async () => {
    if (isFirebaseConfigured && auth) {
      setAuthLoading(true);
      try {
        await signOut(auth);
      } catch (err: any) {
        setAuthLoading(false);
        throw new Error(err.message || "Logout failed");
      }
    }
  };

  // Helper: Record stock movement logs
  const recordStockMovement = (
    itemId: string,
    itemType: "Product" | "Material",
    quantity: number,
    type: StockMovementLog["type"],
    notes?: string
  ) => {
    const itemName =
      itemType === "Product"
        ? products.find((p) => p.id === itemId)?.name || "Unknown Product"
        : rawMaterials.find((r) => r.id === itemId)?.name || "Unknown Material";

    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newLog: StockMovementLog = {
      id: logId,
      itemId,
      itemName,
      itemType,
      quantity,
      type,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      notes: notes || "",
    };
    writeDocument("stock_logs", logId, newLog);
  };

  // Product Actions
  const addProduct = (p: Omit<Product, "id">) => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = { ...p, id: newId };
    writeDocument("products", newId, newProduct);
    recordStockMovement(newId, "Product", p.stock, "Adjustment", "Initial stock setup");
  };

  const editProduct = (p: Product) => {
    const old = products.find((item) => item.id === p.id);
    if (old && old.stock !== p.stock) {
      const diff = p.stock - old.stock;
      recordStockMovement(p.id, "Product", diff, "Adjustment", "Manual inventory stock update");
    }
    writeDocument("products", p.id, p);
  };

  const deleteProduct = (id: string) => {
    deleteDocument("products", id);
  };

  // Raw Material Actions
  const addRawMaterial = (r: Omit<RawMaterial, "id">) => {
    const newId = `raw-${Date.now()}`;
    const newRaw: RawMaterial = { ...r, id: newId };
    writeDocument("raw_materials", newId, newRaw);
    recordStockMovement(newId, "Material", r.stock, "Adjustment", "Initial raw material stock setup");
  };

  const editRawMaterial = (r: RawMaterial) => {
    const old = rawMaterials.find((item) => item.id === r.id);
    if (old && old.stock !== r.stock) {
      const diff = r.stock - old.stock;
      recordStockMovement(r.id, "Material", diff, "Adjustment", "Manual material stock count adjust");
    }
    writeDocument("raw_materials", r.id, r);
  };

  const deleteRawMaterial = (id: string) => {
    deleteDocument("raw_materials", id);
  };

  // Supplier Actions
  const addSupplier = (s: Omit<Supplier, "id">) => {
    const newId = `sup-${Date.now()}`;
    writeDocument("suppliers", newId, { ...s, id: newId });
  };

  const editSupplier = (s: Supplier) => {
    writeDocument("suppliers", s.id, s);
  };

  const deleteSupplier = (id: string) => {
    deleteDocument("suppliers", id);
  };

  // Expense Actions
  const addExpense = (e: Omit<Expense, "id">) => {
    const newId = `exp-${Date.now()}`;
    writeDocument("expenses", newId, { ...e, id: newId });
  };

  const deleteExpense = (id: string) => {
    deleteDocument("expenses", id);
  };

  // Employee Actions
  const addEmployee = (emp: Omit<Employee, "id">) => {
    const colors = ["bg-teal-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500", "bg-emerald-500"];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const newId = `emp-${Date.now()}`;
    writeDocument("employees", newId, { ...emp, id: newId, avatarColor: col });
  };

  const editEmployee = (emp: Employee) => {
    writeDocument("employees", emp.id, emp);
  };

  const deleteEmployee = (id: string) => {
    deleteDocument("employees", id);
  };

  // Attendance Actions
  const markAttendance = (empId: string, status: Attendance["status"], checkIn?: string, checkOut?: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const key = `${empId}_${todayStr}`;
    const existing = attendance.find((a) => a.id === key);

    if (existing) {
      const updated = {
        ...existing,
        status,
        checkIn: checkIn !== undefined ? checkIn : existing.checkIn,
        checkOut: checkOut !== undefined ? checkOut : existing.checkOut,
      };
      writeDocument("attendance", key, updated);
    } else {
      const checkInTime = checkIn || new Date().toTimeString().slice(0, 5);
      const newAttendance: Attendance = {
        id: key,
        employeeId: empId,
        date: todayStr,
        status,
        checkIn: status === "Present" || status === "Half Day" ? checkInTime : undefined,
        checkOut: checkOut || undefined,
      };
      writeDocument("attendance", key, newAttendance);
    }
  };

  // Salary Payroll Payments
  const addSalaryPayment = (pay: Omit<SalaryPayment, "id">) => {
    const newId = `sal-${Date.now()}`;
    writeDocument("salary_payments", newId, { ...pay, id: newId });
  };

  // Invoice / POS Invoice creation
  const createInvoice = async (
    items: CartItem[],
    discount: number,
    paymentMethod: Invoice["paymentMethod"],
    customerName: string = "",
    customerPhone: string = "",
    splitTotals?: { cash: number; upi: number; card: number }
  ): Promise<Invoice> => {
    const counterIndex = await incrementCounter("metadata/invoice_counter");
    const nextBillIndex = counterIndex + 12057;
    const billNo = `CH-${nextBillIndex}`;

    let subtotalTotal = 0;
    let taxTotalAmount = 0;
    let profitAmount = 0;
    let itemsPriceSum = 0;

    const invoiceItems: InvoiceItem[] = items.map((cart) => {
      const { product, quantity } = cart;
      const totalItemPrice = product.sellingPrice * quantity;
      itemsPriceSum += totalItemPrice;

      const taxPercent = settings.taxEnabled ? product.taxPercent : 0;
      const taxAmount = (totalItemPrice * taxPercent) / (100 + taxPercent);
      const subtotalVal = totalItemPrice - taxAmount;

      subtotalTotal += subtotalVal;
      taxTotalAmount += taxAmount;

      const profitVal = (product.sellingPrice - product.purchasePrice) * quantity;
      profitAmount += profitVal;

      return {
        productId: product.id,
        name: product.name,
        quantity,
        price: product.sellingPrice,
        taxAmount: Number(taxAmount.toFixed(2)),
        costPrice: product.purchasePrice,
      };
    });

    const totalBeforeDiscount = itemsPriceSum;
    const finalTotal = Math.max(0, totalBeforeDiscount - discount);

    const discountRatio = totalBeforeDiscount > 0 ? finalTotal / totalBeforeDiscount : 1;
    const adjustedProfit = Number((profitAmount * discountRatio).toFixed(2));

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      billNo,
      date: new Date().toISOString(),
      items: invoiceItems,
      subtotal: Number(subtotalTotal.toFixed(2)),
      taxTotal: Number(taxTotalAmount.toFixed(2)),
      discountAmount: discount,
      total: finalTotal,
      paymentMethod,
      customerName,
      customerPhone,
      profit: adjustedProfit,
      paymentSplit: paymentMethod === "Split" ? splitTotals : undefined,
      cashierId: session.userId,
      cashierName: session.userName,
    };

    // Deduct stock of items sold and recipe raw materials atomically
    for (const cart of items) {
      const { product, quantity } = cart;
      
      // 1. Atomically adjust product stock
      await adjustStockTransaction("products", product.id, -quantity);
      
      // 2. Atomically adjust raw materials stock if recipe/BOM exists
      if (product.recipe && product.recipe.length > 0) {
        for (const rItem of product.recipe) {
          const deduction = rItem.quantity * quantity;
          await adjustStockTransaction("raw_materials", rItem.materialId, -deduction);
          
          // Log raw material stock decrement
          const matObj = rawMaterials.find((m) => m.id === rItem.materialId);
          const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const newLog: StockMovementLog = {
            id: logId,
            itemId: rItem.materialId,
            itemName: matObj?.name || "Unknown Material",
            itemType: "Material",
            quantity: -deduction,
            type: "Sale",
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            notes: `BOM decrease for sale of ${product.name} (x${quantity}) in bill #${billNo}`,
          };
          writeDocument("stock_logs", logId, newLog);
        }
      }
    }

    // Record stock logs for items sold
    items.forEach((cart) => {
      recordStockMovement(cart.product.id, "Product", -cart.quantity, "Sale", `Order billing #${billNo}`);
    });

    writeDocument("invoices", newInvoice.id, newInvoice);

    return newInvoice;
  };

  const refundInvoice = (id: string) => {
    const inv = invoices.find((invoice) => invoice.id === id);
    if (!inv) return;

    // Refund / return items to stock
    inv.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      if (p) {
        writeDocument("products", p.id, { ...p, stock: p.stock + item.quantity });
      }
    });

    // Record logs
    inv.items.forEach((item) => {
      recordStockMovement(item.productId, "Product", item.quantity, "Adjustment", `Refund/Return of bill #${inv.billNo}`);
    });

    deleteDocument("invoices", id);
  };

  const deleteInvoice = (id: string) => {
    deleteDocument("invoices", id);
  };

  const editInvoice = (inv: Invoice) => {
    writeDocument("invoices", inv.id, inv);
  };

  // Update Settings
  const updateSettings = (newSettings: ShopSettings) => {
    writeDocument("settings", "current", { ...newSettings, id: "current" });
  };

  return (
    <AppContext.Provider
      value={{
        products,
        rawMaterials,
        suppliers,
        expenses,
        employees,
        attendance,
        salaryPayments,
        invoices,
        settings,
        stockMovementLogs,
        session,
        setSession,
        firebaseUser,
        authLoading,
        loginUser,
        logoutUser,
        addProduct,
        editProduct,
        deleteProduct,
        addRawMaterial,
        editRawMaterial,
        deleteRawMaterial,
        addSupplier,
        editSupplier,
        deleteSupplier,
        addExpense,
        deleteExpense,
        addEmployee,
        editEmployee,
        deleteEmployee,
        markAttendance,
        addSalaryPayment,
        createInvoice,
        refundInvoice,
        deleteInvoice,
        editInvoice,
        updateSettings,
        recordStockMovement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
