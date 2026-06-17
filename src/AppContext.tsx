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

  markAttendance: (empId: string, status: Attendance["status"], checkIn?: string, checkOut?: string) => void;
  addSalaryPayment: (pay: Omit<SalaryPayment, "id">) => void;

  createInvoice: (
    items: CartItem[],
    discount: number,
    paymentMethod: Invoice["paymentMethod"],
    customerName?: string,
    customerPhone?: string,
    splitTotals?: { cash: number; upi: number; card: number }
  ) => Invoice;
  refundInvoice: (id: string) => void;

  updateSettings: (settings: ShopSettings) => void;
  recordStockMovement: (itemId: string, itemType: "Product" | "Material", quantity: number, type: StockMovementLog["type"], notes?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage if they exist, otherwise initialize them
  const [products, setProducts] = useState<Product[]>(() => {
    const local = localStorage.getItem("tea_products");
    if (local) {
      const parsed: Product[] = JSON.parse(local);
      return parsed.map((p) => {
        const matchingInit = initialProducts.find((ip) => ip.id === p.id);
        if (matchingInit) {
          return {
            ...p,
            image: p.image || matchingInit.image, // Force recover image if absent or empty
            category: p.category || matchingInit.category,
          };
        }
        return p;
      });
    }
    return initialProducts;
  });

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    const local = localStorage.getItem("tea_raw_materials");
    return local ? JSON.parse(local) : initialRawMaterials;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const local = localStorage.getItem("tea_suppliers");
    return local ? JSON.parse(local) : initialSuppliers;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const local = localStorage.getItem("tea_expenses");
    return local ? JSON.parse(local) : initialExpenses;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const local = localStorage.getItem("tea_employees");
    return local ? JSON.parse(local) : initialEmployees;
  });

  const [attendance, setAttendance] = useState<Attendance[]>(() => {
    const local = localStorage.getItem("tea_attendance");
    return local ? JSON.parse(local) : initialAttendance;
  });

  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(() => {
    const local = localStorage.getItem("tea_salary_payments");
    return local ? JSON.parse(local) : initialSalaryPayments;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const local = localStorage.getItem("tea_invoices");
    return local ? JSON.parse(local) : initialInvoices;
  });

  const [settings, setSettings] = useState<ShopSettings>(() => {
    const local = localStorage.getItem("tea_settings");
    if (local) {
      const parsed = JSON.parse(local);
      return {
        ...defaultShopSettings,
        ...parsed,
        logoUrl: parsed.logoUrl || defaultShopSettings.logoUrl,
      };
    }
    return defaultShopSettings;
  });

  const [stockMovementLogs, setStockMovementLogs] = useState<StockMovementLog[]>(() => {
    const local = localStorage.getItem("tea_stock_logs");
    return local ? JSON.parse(local) : initialStockMovementLogs;
  });

  const [session, setSessionState] = useState<UserSession>(() => {
    const local = localStorage.getItem("tea_session");
    return local ? JSON.parse(local) : { role: "Admin", userName: "Ravi Kumar (Owner)", userId: "emp-4" };
  });

  // Save states to localStorage when they change with safety wrappers
  useEffect(() => {
    try {
      localStorage.setItem("tea_products", JSON.stringify(products));
    } catch (e) {
      console.warn("Storage item write blocked:", e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem("tea_raw_materials", JSON.stringify(rawMaterials));
    } catch (e) {
      console.warn("Storage item write blocked:", e);
    }
  }, [rawMaterials]);

  useEffect(() => {
    try {
      localStorage.setItem("tea_suppliers", JSON.stringify(suppliers));
    } catch (e) {
      console.warn("Storage item write blocked:", e);
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem("tea_expenses", JSON.stringify(expenses));
    } catch (e) {
      console.warn("Storage item write blocked:", e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem("tea_employees", JSON.stringify(employees));
    } catch (e) {
      console.warn("Storage item write blocked:", e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem("tea_attendance", JSON.stringify(attendance));
    } catch (e) {
      console.warn("Storage item write blocked:", e);
    }
  }, [attendance]);

  useEffect(() => {
    try {
      localStorage.setItem("tea_salary_payments", JSON.stringify(salaryPayments));
    } catch (e) {
      console.warn("Storage item write blocked:", e);
    }
  }, [salaryPayments]);

  useEffect(() => {
    try {
      localStorage.setItem("tea_invoices", JSON.stringify(invoices));
    } catch (e) {
      console.warn("Storage item write blocked:", e);
    }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem("tea_settings", JSON.stringify(settings));
    } catch (e) {
      console.warn("Storage item write blocked:", e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem("tea_stock_logs", JSON.stringify(stockMovementLogs));
    } catch (e) {
      console.warn("Storage item write blocked:", e);
    }
  }, [stockMovementLogs]);

  const setSession = (sess: UserSession) => {
    setSessionState(sess);
    try {
      localStorage.setItem("tea_session", JSON.stringify(sess));
    } catch (e) {
      console.warn("Session storage write blocked:", e);
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

    const newLog: StockMovementLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      itemId,
      itemName,
      itemType,
      quantity,
      type,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      notes,
    };
    setStockMovementLogs((prev) => [newLog, ...prev]);
  };

  // Product Actions
  const addProduct = (p: Omit<Product, "id">) => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = { ...p, id: newId };
    setProducts((prev) => [...prev, newProduct]);
    recordStockMovement(newId, "Product", p.stock, "Adjustment", "Initial stock setup");
  };

  const editProduct = (p: Product) => {
    setProducts((prev) => {
      const old = prev.find((item) => item.id === p.id);
      if (old && old.stock !== p.stock) {
        const diff = p.stock - old.stock;
        recordStockMovement(p.id, "Product", diff, "Adjustment", "Manual inventory stock update");
      }
      return prev.map((item) => (item.id === p.id ? p : item));
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  // Raw Material Actions
  const addRawMaterial = (r: Omit<RawMaterial, "id">) => {
    const newId = `raw-${Date.now()}`;
    const newRaw: RawMaterial = { ...r, id: newId };
    setRawMaterials((prev) => [...prev, newRaw]);
    recordStockMovement(newId, "Material", r.stock, "Adjustment", "Initial raw material stock setup");
  };

  const editRawMaterial = (r: RawMaterial) => {
    setRawMaterials((prev) => {
      const old = prev.find((item) => item.id === r.id);
      if (old && old.stock !== r.stock) {
        const diff = r.stock - old.stock;
        recordStockMovement(r.id, "Material", diff, "Adjustment", "Manual material stock count adjust");
      }
      return prev.map((item) => (item.id === r.id ? r : item));
    });
  };

  const deleteRawMaterial = (id: string) => {
    setRawMaterials((prev) => prev.filter((item) => item.id !== id));
  };

  // Supplier Actions
  const addSupplier = (s: Omit<Supplier, "id">) => {
    const newSupplier: Supplier = { ...s, id: `sup-${Date.now()}` };
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const editSupplier = (s: Supplier) => {
    setSuppliers((prev) => prev.map((item) => (item.id === s.id ? s : item)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((item) => item.id !== id));
  };

  // Expense Actions
  const addExpense = (e: Omit<Expense, "id">) => {
    const newExpense: Expense = { ...e, id: `exp-${Date.now()}` };
    setExpenses((prev) => [newExpense, ...prev]);

    // If expense is on Milk & Ingredients, let's log this as supportive note (no auto-update raw stock unless specified)
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Employee Actions
  const addEmployee = (emp: Omit<Employee, "id">) => {
    const colors = ["bg-teal-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500", "bg-emerald-500"];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const newEmp: Employee = { ...emp, id: `emp-${Date.now()}`, avatarColor: col };
    setEmployees((prev) => [...prev, newEmp]);
  };

  const editEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
  };

  // Attendance Actions
  const markAttendance = (empId: string, status: Attendance["status"], checkIn?: string, checkOut?: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const key = `${empId}_${todayStr}`;

    setAttendance((prev) => {
      const existing = prev.find((a) => a.id === key);
      if (existing) {
        return prev.map((a) =>
          a.id === key
            ? {
                ...a,
                status,
                checkIn: checkIn !== undefined ? checkIn : a.checkIn,
                checkOut: checkOut !== undefined ? checkOut : a.checkOut,
              }
            : a
        );
      } else {
        const checkInTime = checkIn || new Date().toTimeString().slice(0, 5);
        return [
          {
            id: key,
            employeeId: empId,
            date: todayStr,
            status,
            checkIn: status === "Present" || status === "Half Day" ? checkInTime : undefined,
            checkOut: checkOut || undefined,
          },
          ...prev,
        ];
      }
    });
  };

  // Salary Payroll Payments
  const addSalaryPayment = (pay: Omit<SalaryPayment, "id">) => {
    const newPay: SalaryPayment = { ...pay, id: `sal-${Date.now()}` };
    setSalaryPayments((prev) => [newPay, ...prev]);
  };

  // Invoice / POS Invoice creation
  const createInvoice = (
    items: CartItem[],
    discount: number,
    paymentMethod: Invoice["paymentMethod"],
    customerName: string = "",
    customerPhone: string = "",
    splitTotals?: { cash: number; upi: number; card: number }
  ): Invoice => {
    const nextBillIndex = invoices.length + 12057; // Start increment from our pre-populated mock starting base
    const billNo = `CH-${nextBillIndex}`;

    let subtotalTotal = 0;
    let taxTotalAmount = 0;
    let profitAmount = 0;
    let itemsPriceSum = 0;

    const invoiceItems: InvoiceItem[] = items.map((cart) => {
      const { product, quantity } = cart;
      const totalItemPrice = product.sellingPrice * quantity;
      itemsPriceSum += totalItemPrice;

      // Extract tax (inclusive pricing)
      // TaxAmount = (Price * TaxPercent) / (100 + TaxPercent)
      const taxPercent = settings.taxEnabled ? product.taxPercent : 0;
      const taxAmount = (totalItemPrice * taxPercent) / (100 + taxPercent);
      const subtotalVal = totalItemPrice - taxAmount;

      subtotalTotal += subtotalVal;
      taxTotalAmount += taxAmount;

      // Profit calculation: (SellPrice - PurchasePrice) * Quantity
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

    // Proportionally adjust profit and tax for discounts
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

    // Deduct stock of items sold
    setProducts((prev) =>
      prev.map((p) => {
        const itemSold = items.find((cart) => cart.product.id === p.id);
        if (itemSold) {
          const newStock = Math.max(0, p.stock - itemSold.quantity);
          // Auto record movement log
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    // Record stock logs for items sold
    items.forEach((cart) => {
      recordStockMovement(cart.product.id, "Product", -cart.quantity, "Sale", `Order billing #${billNo}`);
    });

    setInvoices((prev) => [newInvoice, ...prev]);

    return newInvoice;
  };

  const refundInvoice = (id: string) => {
    const inv = invoices.find((invoice) => invoice.id === id);
    if (!inv) return;

    // Refund / return items to stock
    setProducts((prev) =>
      prev.map((p) => {
        const refundItem = inv.items.find((item) => item.productId === p.id);
        if (refundItem) {
          return { ...p, stock: p.stock + refundItem.quantity };
        }
        return p;
      })
    );

    // Record logs
    inv.items.forEach((item) => {
      recordStockMovement(item.productId, "Product", item.quantity, "Adjustment", `Refund/Return of bill #${inv.billNo}`);
    });

    // Remove or flag invoice as refunded. Let's delete or edit it. Let's filter it out or keep items but flag total as 0.
    // Filtering it out for simplicity in current reports, or we can deduct total sales. Let's just filter it out for clean metrics.
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
  };

  // Update Settings
  const updateSettings = (newSettings: ShopSettings) => {
    setSettings(newSettings);
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
        markAttendance,
        addSalaryPayment,
        createInvoice,
        refundInvoice,
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
