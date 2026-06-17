/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RecipeItem {
  materialId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  sellingPrice: number;
  purchasePrice: number;
  stock: number;
  minStock: number;
  image?: string;
  unit: string;
  taxPercent: number; // e.g. 5, 18, 0
  supplierId?: string;
  recipe?: RecipeItem[];
}

export interface RawMaterial {
  id: string;
  name: string;
  stock: number;
  unit: string; // e.g. "kg", "liters", "bags"
  minStock: number;
  purchasePrice: number; // Avg cost per unit
  supplierId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  gstNo: string;
  address: string;
  image?: string; // Base64 profile picture
}

export type ExpenseCategory =
  | "Rent"
  | "Electricity & Water"
  | "Ingredients & Milk"
  | "Staff Welfare"
  | "Transport & Logistics"
  | "Internet & Marketing"
  | "Miscellaneous";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  receiptName?: string;
}

export type Designation = "Admin" | "Manager" | "Cashier" | "Chef" | "Staff";

export interface Employee {
  id: string;
  name: string;
  contact: string;
  designation: Designation;
  joinDate: string; // YYYY-MM-DD
  shift: "Morning" | "Evening" | "Full Day";
  salaryType: "daily" | "monthly";
  salaryAmount: number; // numeric amount per day/month
  active: boolean;
  avatarColor: string; // hex or tailwind text/bg combo
  image?: string; // Base64 profile picture
  email?: string;
}

export interface Attendance {
  id: string; // employeeId_dateStr
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  status: "Present" | "Absent" | "Leave" | "Half Day";
  overtimeHours?: number;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  payPeriod: string; // e.g., "June 2026", "2026-06-10"
  baseSalary: number;
  advanceDeduction: number;
  bonus: number;
  netPaid: number;
  paymentDate: string;
  paymentMethod: "Cash" | "UPI" | "Bank Transfer";
  status: "Paid" | "Pending";
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number; // selling price
  taxAmount: number;
  costPrice: number; // purchase price (to calculate profit)
}

export interface Invoice {
  id: string;
  billNo: string;
  date: string; // ISO string or YYYY-MM-DD HH:MM
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: "Cash" | "UPI" | "Card" | "Split";
  paymentSplit?: {
    cash: number;
    upi: number;
    card: number;
  };
  customerName?: string;
  customerPhone?: string;
  profit: number;
  cashierId?: string;
  cashierName?: string;
}

export interface StockMovementLog {
  id: string;
  itemId: string; // Product id or RawMaterial id
  itemName: string;
  itemType: "Product" | "Material";
  quantity: number; // positive for addition, negative for reduction
  type: "Purchase" | "Sale" | "Damaged" | "Adjustment";
  date: string; // YYYY-MM-DD HH:MM
  notes?: string;
}

export interface ShopSettings {
  shopName: string;
  logoUrl?: string;
  contactNumber: string;
  email: string;
  address: string;
  gstNo: string;
  footerMessage: string;
  taxRateDefault: number; // e.g. 5
  taxEnabled: boolean;
  currency: string; // e.g. "₹", "$", "€"
  thermalWidth: "58mm" | "80mm";
}

export type AppRole = "Admin" | "Manager" | "Cashier" | "Staff";

export interface UserSession {
  role: AppRole;
  userName: string;
  userId: string;
}
