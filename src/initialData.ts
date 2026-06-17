/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
} from "./types";

export const initialSuppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Karnataka Dairy Cooperative (Nandini)",
    contact: "9880012345",
    email: "supplies@nandinidairy.co.in",
    gstNo: "29NANDI9876A1Z0",
    address: "Diary Circle, Hosur Road, Bengaluru",
  },
  {
    id: "sup-2",
    name: "Assam Tea Gardens Wholesale",
    contact: "9435012345",
    email: "orders@assamteagardens.com",
    gstNo: "18ASSAM1234G2Z1",
    address: "Phukan Road, Dibrugarh, Assam",
  },
  {
    id: "sup-3",
    name: "Metro Agro Provisions & Spices",
    contact: "8041234567",
    email: "sales@metroagro.com",
    gstNo: "29METRO5544H1Z3",
    address: "APMC Market Yard, Yashwantpur, Bengaluru",
  },
];

export const initialRawMaterials: RawMaterial[] = [
  {
    id: "raw-1",
    name: "Fresh Whole Milk",
    stock: 45,
    unit: "Liters",
    minStock: 15,
    purchasePrice: 54, // ₹54 per Liter
    supplierId: "sup-1",
  },
  {
    id: "raw-2",
    name: "Premium Assam Tea Dust",
    stock: 12.5,
    unit: "kg",
    minStock: 3.0,
    purchasePrice: 290, // ₹290 per kg
    supplierId: "sup-2",
  },
  {
    id: "raw-3",
    name: "Refined White Sugar",
    stock: 28.0,
    unit: "kg",
    minStock: 8.0,
    purchasePrice: 42, // ₹42 per kg
    supplierId: "sup-3",
  },
  {
    id: "raw-4",
    name: "Fresh Ginger Roots",
    stock: 4.8,
    unit: "kg",
    minStock: 1.5,
    purchasePrice: 130, // ₹130 per kg
    supplierId: "sup-3",
  },
  {
    id: "raw-5",
    name: "Green Cardamom Pods",
    stock: 0.8,
    unit: "kg",
    minStock: 0.2,
    purchasePrice: 1900, // ₹1900 per kg
    supplierId: "sup-3",
  },
  {
    id: "raw-6",
    name: "Fresh Lemons",
    stock: 110,
    unit: "Pieces",
    minStock: 30,
    purchasePrice: 3.5, // ₹3.5 per piece
    supplierId: "sup-3",
  },
  {
    id: "raw-7",
    name: "Premium Coffee Powder",
    stock: 3.5,
    unit: "kg",
    minStock: 1.0,
    purchasePrice: 480, // ₹480 per kg
    supplierId: "sup-3",
  },
];

export const initialProducts: Product[] = [
  // TEA SECTION
  {
    id: "prod-1",
    name: "Special Ginger Tea",
    category: "Chai & Tea",
    sku: "CH-GIN-01",
    sellingPrice: 15,
    purchasePrice: 5.5,
    stock: 150,
    minStock: 0,
    unit: "Cup",
    taxPercent: 5,
    supplierId: "sup-2",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-2",
    name: "Elachi (Cardamom) Chai",
    category: "Chai & Tea",
    sku: "CH-ELA-02",
    sellingPrice: 15,
    purchasePrice: 5.2,
    stock: 120,
    minStock: 0,
    unit: "Cup",
    taxPercent: 5,
    supplierId: "sup-2",
    image: "https://images.unsplash.com/photo-1563887530-68090622e780?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-3",
    name: "Masala Special Tea",
    category: "Chai & Tea",
    sku: "CH-MAS-03",
    sellingPrice: 20,
    purchasePrice: 6.8,
    stock: 140,
    minStock: 0,
    unit: "Cup",
    taxPercent: 5,
    supplierId: "sup-2",
    image: "https://images.unsplash.com/photo-1597839219216-a773cb2473e4?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-4",
    name: "Zesty Lemon Ginger Tea",
    category: "Chai & Tea",
    sku: "CH-LEM-04",
    sellingPrice: 18,
    purchasePrice: 4.5,
    stock: 90,
    minStock: 0,
    unit: "Cup",
    taxPercent: 5,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1512270922444-0b73b53c7c7f?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-5",
    name: "Classic Sulaimani Black Tea",
    category: "Chai & Tea",
    sku: "CH-BLK-05",
    sellingPrice: 12,
    purchasePrice: 3.0,
    stock: 80,
    minStock: 0,
    unit: "Cup",
    taxPercent: 5,
    supplierId: "sup-2",
    image: "https://images.unsplash.com/photo-1515696955266-4f67e13219e8?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-6",
    name: "Steaming Green Tea",
    category: "Chai & Tea",
    sku: "CH-GRN-06",
    sellingPrice: 25,
    purchasePrice: 8.0,
    stock: 65,
    minStock: 10,
    unit: "Cup",
    taxPercent: 5,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=500&auto=format&fit=crop&q=80"
  },

  // COFFEE SECTION
  {
    id: "prod-7",
    name: "South Indian Filter Coffee",
    category: "Coffee",
    sku: "CF-FIL-07",
    sellingPrice: 25,
    purchasePrice: 9.0,
    stock: 110,
    minStock: 0,
    unit: "Cup",
    taxPercent: 5,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-8",
    name: "Thick Frozen Cold Coffee",
    category: "Coffee",
    sku: "CF-CLD-08",
    sellingPrice: 50,
    purchasePrice: 18.5,
    stock: 45,
    minStock: 5,
    unit: "Glass",
    taxPercent: 5,
    supplierId: "sup-1",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80"
  },

  // BAKERY SECTIONS & CONFECTIONERY
  {
    id: "prod-9",
    name: "Osmania Butter Biscuits (Pkt of 4)",
    category: "Bakery & Biscuits",
    sku: "BK-OSM-09",
    sellingPrice: 15,
    purchasePrice: 6.0,
    stock: 85,
    minStock: 15,
    unit: "Packet",
    taxPercent: 18,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1558961303-1d2002ae3834?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-10",
    name: "Crunchy Sweet Bun Butter",
    category: "Bakery & Biscuits",
    sku: "BK-BUN-10",
    sellingPrice: 20,
    purchasePrice: 8.5,
    stock: 8,
    minStock: 15,
    unit: "Piece",
    taxPercent: 18,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-11",
    name: "Rich Chocolate Lava Cake Cut",
    category: "Bakery & Biscuits",
    sku: "BK-LAV-11",
    sellingPrice: 45,
    purchasePrice: 19.0,
    stock: 6,
    minStock: 10,
    unit: "Slice",
    taxPercent: 18,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80"
  },

  // HOT SNACKS
  {
    id: "prod-12",
    name: "Crispy Fried Potato Samosa (1 Pc)",
    category: "Snacks",
    sku: "SN-SAM-12",
    sellingPrice: 15,
    purchasePrice: 5.0,
    stock: 35,
    minStock: 10,
    unit: "Piece",
    taxPercent: 5,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-13",
    name: "Spicy Mumbai Vada Pav",
    category: "Snacks",
    sku: "SN-VAD-13",
    sellingPrice: 25,
    purchasePrice: 9.5,
    stock: 22,
    minStock: 10,
    unit: "Piece",
    taxPercent: 5,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=80"
  },

  // OTHER BEVERAGES & WATER
  {
    id: "prod-14",
    name: "Himalayan Mineral Water 500ml",
    category: "Beverages",
    sku: "BV-WTR-14",
    sellingPrice: 15,
    purchasePrice: 6.5,
    stock: 140,
    minStock: 30,
    unit: "Bottle",
    taxPercent: 18,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1608885898957-a599fb15ec34?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-15",
    name: "Fresh Lime Mojito Juice",
    category: "Beverages",
    sku: "BV-MOJ-15",
    sellingPrice: 40,
    purchasePrice: 12.0,
    stock: 50,
    minStock: 12,
    unit: "Glass",
    taxPercent: 12,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80"
  },

  // SOUTH INDIAN & TAMIL NADU SPECIALS
  {
    id: "prod-16",
    name: "Madurai Spl Jigarthanda",
    category: "Beverages",
    sku: "BV-JIG-16",
    sellingPrice: 60,
    purchasePrice: 22.0,
    stock: 45,
    minStock: 8,
    unit: "Glass",
    taxPercent: 12,
    supplierId: "sup-1",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-17",
    name: "Ghee Podi Idli (4 Pcs)",
    category: "Snacks",
    sku: "SN-IDL-17",
    sellingPrice: 35,
    purchasePrice: 12.0,
    stock: 35,
    minStock: 10,
    unit: "Plate",
    taxPercent: 5,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-18",
    name: "Madras Masala Vada (2 Pcs)",
    category: "Snacks",
    sku: "SN-MAD-18",
    sellingPrice: 20,
    purchasePrice: 6.5,
    stock: 55,
    minStock: 12,
    unit: "Plate",
    taxPercent: 5,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1589301765196-08d4b3a4a2ae?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-19",
    name: "Salem Thattu Vadai Sett",
    category: "Snacks",
    sku: "SN-THA-19",
    sellingPrice: 25,
    purchasePrice: 8.5,
    stock: 40,
    minStock: 5,
    unit: "Plate",
    taxPercent: 5,
    supplierId: "sup-3",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80"
  }
];

export const initialEmployees: Employee[] = [
  {
    id: "emp-1",
    name: "Rajesh Kannan",
    contact: "9874561230",
    designation: "Chef",
    joinDate: "2024-02-15",
    shift: "Morning",
    salaryType: "monthly",
    salaryAmount: 18500,
    active: true,
    avatarColor: "bg-teal-500",
    email: "chef@chaicharcha.com",
  },
  {
    id: "emp-2",
    name: "Divya Tejaswini",
    contact: "9745123680",
    designation: "Cashier",
    joinDate: "2024-08-01",
    shift: "Full Day",
    salaryType: "monthly",
    salaryAmount: 14000,
    active: true,
    avatarColor: "bg-purple-500",
    email: "cashier@chaicharcha.com",
  },
  {
    id: "emp-3",
    name: "Manjunath Gowda",
    contact: "8123456780",
    designation: "Staff",
    joinDate: "2025-01-10",
    shift: "Evening",
    salaryType: "daily",
    salaryAmount: 500, // ₹500 wages per day
    active: true,
    avatarColor: "bg-amber-500",
    email: "staff@chaicharcha.com",
  },
  {
    id: "emp-4",
    name: "Satish Prasad",
    contact: "9005511223",
    designation: "Manager",
    joinDate: "2023-05-10",
    shift: "Full Day",
    salaryType: "monthly",
    salaryAmount: 24000,
    active: true,
    avatarColor: "bg-rose-500",
    email: "admin@chaicharcha.com",
  }
];

export const initialExpenses: Expense[] = [
  {
    id: "exp-1",
    category: "Rent",
    amount: 12000,
    description: "June 2026 Monthly Premises Rent Payment",
    date: "2026-06-01",
    receiptName: "rent_receipt_june.pdf",
  },
  {
    id: "exp-2",
    category: "Electricity & Water",
    amount: 2850,
    description: "BESCOM Power Usage Bill - May Billing Cycle",
    date: "2026-06-03",
    receiptName: "bescom_bill_may.png",
  },
  {
    id: "exp-3",
    category: "Ingredients & Milk",
    amount: 1540,
    description: "Emergency purchasing of ginger, cardamom & fresh lemon basket",
    date: "2026-06-07",
    receiptName: "apmc_cash_billing_39.png",
  },
  {
    id: "exp-4",
    category: "Staff Welfare",
    amount: 800,
    description: "Staff dinner & snacks celebration on sales records",
    date: "2026-06-08",
    receiptName: "hotel_swagath_9.png",
  },
  {
    id: "exp-5",
    category: "Internet & Marketing",
    amount: 999,
    description: "High-speed broadband Wi-Fi monthly subscription (JioFiber)",
    date: "2026-06-04",
    receiptName: "jio_invoice_987.pdf",
  }
];

export const initialAttendance: Attendance[] = [
  // Attendance records for June 8, 2026
  { id: "emp-1_2026-06-08", employeeId: "emp-1", date: "2026-06-08", checkIn: "06:05", checkOut: "15:10", status: "Present" },
  { id: "emp-2_2026-06-08", employeeId: "emp-2", date: "2026-06-08", checkIn: "08:50", checkOut: "18:05", status: "Present" },
  { id: "emp-3_2026-06-08", employeeId: "emp-3", date: "2026-06-08", checkIn: "15:00", checkOut: "22:00", status: "Present" },
  { id: "emp-4_2026-06-08", employeeId: "emp-4", date: "2026-06-08", checkIn: "08:55", checkOut: "18:10", status: "Present" },

  // Attendance records for June 9, 2026
  { id: "emp-1_2026-06-09", employeeId: "emp-1", date: "2026-06-09", checkIn: "05:58", checkOut: "15:02", status: "Present" },
  { id: "emp-2_2026-06-09", employeeId: "emp-2", date: "2026-06-09", checkIn: "08:45", checkOut: "18:00", status: "Present" },
  { id: "emp-3_2026-06-09", employeeId: "emp-3", date: "2026-06-09", checkIn: "15:10", checkOut: "22:05", status: "Present" },
  { id: "emp-4_2026-06-09", employeeId: "emp-4", date: "2026-06-09", checkIn: "09:00", checkOut: "18:00", status: "Present" },

  // Attendance records for today June 10, 2026 (checked in but not checked out yet)
  { id: "emp-1_2026-06-10", employeeId: "emp-1", date: "2026-06-10", checkIn: "06:00", status: "Present" },
  { id: "emp-2_2026-06-10", employeeId: "emp-2", date: "2026-06-10", checkIn: "08:52", status: "Present" },
  { id: "emp-4_2026-06-10", employeeId: "emp-4", date: "2026-06-10", checkIn: "08:40", status: "Present" }
];

export const initialSalaryPayments: SalaryPayment[] = [
  {
    id: "sal-1",
    employeeId: "emp-1",
    payPeriod: "May 2026",
    baseSalary: 18500,
    advanceDeduction: 0,
    bonus: 500,
    netPaid: 19000,
    paymentDate: "2026-06-03",
    paymentMethod: "Bank Transfer",
    status: "Paid",
  },
  {
    id: "sal-2",
    employeeId: "emp-2",
    payPeriod: "May 2026",
    baseSalary: 14000,
    advanceDeduction: 1000, // advance recovery
    bonus: 0,
    netPaid: 13000,
    paymentDate: "2026-06-03",
    paymentMethod: "Bank Transfer",
    status: "Paid",
  },
  {
    id: "sal-3",
    employeeId: "emp-3",
    payPeriod: "June 2026 - Wk 1",
    baseSalary: 3000, // 6 days * 500
    advanceDeduction: 200,
    bonus: 200,
    netPaid: 3000,
    paymentDate: "2026-06-07",
    paymentMethod: "Cash",
    status: "Paid",
  },
  {
    id: "sal-4",
    employeeId: "emp-4",
    payPeriod: "May 2026",
    baseSalary: 24000,
    advanceDeduction: 0,
    bonus: 1000,
    netPaid: 25000,
    paymentDate: "2026-06-02",
    paymentMethod: "Bank Transfer",
    status: "Paid",
  }
];

export const initialInvoices: Invoice[] = [
  // Today's Sales: June 10, 2026
  {
    id: "inv-20260610-01",
    billNo: "CH-12053",
    date: "2026-06-10T07:30:00Z",
    items: [
      { productId: "prod-1", name: "Special Ginger Tea", quantity: 3, price: 15, taxAmount: 2.14, costPrice: 5.5 },
      { productId: "prod-12", name: "Crispy Fried Potato Samosa (1 Pc)", quantity: 3, price: 15, taxAmount: 2.14, costPrice: 5.0 }
    ],
    subtotal: 85.72,
    taxTotal: 4.28,
    discountAmount: 0,
    total: 90,
    paymentMethod: "UPI",
    customerName: "Ramesh Kumar",
    customerPhone: "9845012345",
    profit: 58.5,
    cashierName: "Divya Tejaswini",
  },
  {
    id: "inv-20260610-02",
    billNo: "CH-12054",
    date: "2026-06-10T09:15:00Z",
    items: [
      { productId: "prod-2", name: "Elachi (Cardamom) Chai", quantity: 5, price: 15, taxAmount: 3.57, costPrice: 5.2 },
      { productId: "prod-10", name: "Crunchy Sweet Bun Butter", quantity: 2, price: 20, taxAmount: 6.1, costPrice: 8.5 }
    ],
    subtotal: 105.33,
    taxTotal: 9.67,
    discountAmount: 5,
    total: 110,
    paymentMethod: "Cash",
    customerName: "",
    customerPhone: "",
    profit: 67.0,
    cashierName: "Divya Tejaswini",
  },
  {
    id: "inv-20260610-03",
    billNo: "CH-12055",
    date: "2026-06-10T11:45:00Z",
    items: [
      { productId: "prod-7", name: "South Indian Filter Coffee", quantity: 4, price: 25, taxAmount: 4.76, costPrice: 9.0 },
      { productId: "prod-13", name: "Spicy Mumbai Vada Pav", quantity: 4, price: 25, taxAmount: 4.76, costPrice: 9.5 },
      { productId: "prod-11", name: "Rich Chocolate Lava Cake Cut", quantity: 1, price: 45, taxAmount: 6.86, costPrice: 19.0 }
    ],
    subtotal: 228.62,
    taxTotal: 16.38,
    discountAmount: 0,
    total: 245,
    paymentMethod: "Split",
    paymentSplit: { cash: 100, upi: 145, card: 0 },
    customerName: "Siddharth",
    customerPhone: "9886011223",
    profit: 152.0,
    cashierName: "Divya Tejaswini",
  },
  {
    id: "inv-20260610-04",
    billNo: "CH-12056",
    date: "2026-06-10T14:10:00Z",
    items: [
      { productId: "prod-3", name: "Masala Special Tea", quantity: 6, price: 20, taxAmount: 5.71, costPrice: 6.8 },
      { productId: "prod-9", name: "Osmania Butter Biscuits (Pkt of 4)", quantity: 3, price: 15, taxAmount: 6.86, costPrice: 6.0 }
    ],
    subtotal: 152.43,
    taxTotal: 12.57,
    discountAmount: 15, // Combo/happy hour discount
    total: 150,
    paymentMethod: "UPI",
    customerName: "Sneha Reddy",
    profit: 76.2,
    cashierName: "Divya Tejaswini",
  },

  // Yesterday's Sales: June 9, 2026
  {
    id: "inv-20260609-01",
    billNo: "CH-12030",
    date: "2026-06-09T08:00:00Z",
    items: [
      { productId: "prod-1", name: "Special Ginger Tea", quantity: 12, price: 15, taxAmount: 8.57, costPrice: 5.5 },
      { productId: "prod-9", name: "Osmania Butter Biscuits (Pkt of 4)", quantity: 6, price: 15, taxAmount: 13.73, costPrice: 6.0 }
    ],
    subtotal: 247.7,
    taxTotal: 22.3,
    discountAmount: 0,
    total: 270,
    paymentMethod: "UPI",
    customerName: "IT Team Office order",
    customerPhone: "9538051212",
    profit: 168.0,
    cashierName: "Divya Tejaswini",
  },
  {
    id: "inv-20260609-02",
    billNo: "CH-12031",
    date: "2026-06-09T10:30:00Z",
    items: [
      { productId: "prod-7", name: "South Indian Filter Coffee", quantity: 2, price: 25, taxAmount: 2.38, costPrice: 9.0 },
      { productId: "prod-10", name: "Crunchy Sweet Bun Butter", quantity: 2, price: 20, taxAmount: 6.1, costPrice: 8.5 }
    ],
    subtotal: 81.52,
    taxTotal: 8.48,
    discountAmount: 0,
    total: 90,
    paymentMethod: "Cash",
    profit: 55.0,
    cashierName: "Divya Tejaswini",
  },
  {
    id: "inv-20260609-03",
    billNo: "CH-12032",
    date: "2026-06-09T13:20:00Z",
    items: [
      { productId: "prod-4", name: "Zesty Lemon Ginger Tea", quantity: 3, price: 18, taxAmount: 2.57, costPrice: 4.5 },
      { productId: "prod-15", name: "Fresh Lime Mojito Juice", quantity: 2, price: 40, taxAmount: 8.57, costPrice: 12.0 },
      { productId: "prod-14", name: "Himalayan Mineral Water 500ml", quantity: 1, price: 15, taxAmount: 2.29, costPrice: 6.5 }
    ],
    subtotal: 135.57,
    taxTotal: 13.43,
    discountAmount: 0,
    total: 149,
    paymentMethod: "Card",
    profit: 96.0,
    cashierName: "Divya Tejaswini",
  },
  {
    id: "inv-20260609-04",
    billNo: "CH-12033",
    date: "2026-06-09T16:00:00Z",
    items: [
      { productId: "prod-1", name: "Special Ginger Tea", quantity: 4, price: 15, taxAmount: 2.86, costPrice: 5.5 },
      { productId: "prod-12", name: "Crispy Fried Potato Samosa (1 Pc)", quantity: 4, price: 15, taxAmount: 2.86, costPrice: 5.0 },
      { productId: "prod-13", name: "Spicy Mumbai Vada Pav", quantity: 2, price: 25, taxAmount: 2.38, costPrice: 9.5 }
    ],
    subtotal: 161.9,
    taxTotal: 8.1,
    discountAmount: 10,
    total: 160,
    paymentMethod: "UPI",
    customerName: "Karthik",
    profit: 101.0,
    cashierName: "Divya Tejaswini",
  },
  {
    id: "inv-20260609-05",
    billNo: "CH-12034",
    date: "2026-06-09T18:45:00Z",
    items: [
      { productId: "prod-3", name: "Masala Special Tea", quantity: 8, price: 20, taxAmount: 7.62, costPrice: 6.8 },
      { productId: "prod-2", name: "Elachi (Cardamom) Chai", quantity: 4, price: 15, taxAmount: 2.86, costPrice: 5.2 },
      { productId: "prod-8", name: "Thick Frozen Cold Coffee", quantity: 2, price: 50, taxAmount: 4.76, costPrice: 18.5 }
    ],
    subtotal: 304.76,
    taxTotal: 15.24,
    discountAmount: 20,
    total: 300,
    paymentMethod: "UPI",
    customerName: "Nithin",
    profit: 191.6,
    cashierName: "Divya Tejaswini",
  },

  // Historical Sales (June 8, 2026)
  {
    id: "inv-20260608-01",
    billNo: "CH-12001",
    date: "2026-06-08T09:00:00Z",
    items: [
      { productId: "prod-1", name: "Special Ginger Tea", quantity: 8, price: 15, taxAmount: 5.71, costPrice: 5.5 },
      { productId: "prod-12", name: "Crispy Fried Potato Samosa (1 Pc)", quantity: 6, price: 15, taxAmount: 4.29, costPrice: 5.0 }
    ],
    subtotal: 200.0,
    taxTotal: 10.0,
    discountAmount: 10,
    total: 200,
    paymentMethod: "Cash",
    profit: 130.0,
    cashierName: "Divya Tejaswini",
  },
  {
    id: "inv-20260608-02",
    billNo: "CH-12002",
    date: "2026-06-08T14:30:00Z",
    items: [
      { productId: "prod-11", name: "Rich Chocolate Lava Cake Cut", quantity: 3, price: 45, taxAmount: 20.57, costPrice: 19.0 },
      { productId: "prod-8", name: "Thick Frozen Cold Coffee", quantity: 3, price: 50, taxAmount: 7.14, costPrice: 18.5 }
    ],
    subtotal: 257.29,
    taxTotal: 27.71,
    discountAmount: 15,
    total: 270,
    paymentMethod: "Card",
    profit: 157.5,
    cashierName: "Divya Tejaswini",
  },
  {
    id: "inv-20260608-03",
    billNo: "CH-12003",
    date: "2026-06-08T19:00:00Z",
    items: [
      { productId: "prod-2", name: "Elachi (Cardamom) Chai", quantity: 15, price: 15, taxAmount: 10.71, costPrice: 5.2 },
      { productId: "prod-9", name: "Osmania Butter Biscuits (Pkt of 4)", quantity: 5, price: 15, taxAmount: 11.44, costPrice: 6.0 }
    ],
    subtotal: 277.85,
    taxTotal: 22.15,
    discountAmount: 0,
    total: 300,
    paymentMethod: "UPI",
    profit: 192.0,
    cashierName: "Divya Tejaswini",
  }
];

export const initialStockMovementLogs: StockMovementLog[] = [
  { id: "log-1", itemId: "prod-10", itemName: "Crunchy Sweet Bun Butter", itemType: "Product", quantity: 20, type: "Purchase", date: "2026-06-08 10:00", notes: "Supplier re-delivery" },
  { id: "log-2", itemId: "prod-11", itemName: "Rich Chocolate Lava Cake Cut", itemType: "Product", quantity: 15, type: "Purchase", date: "2026-06-08 10:00", notes: "Supplier re-delivery" },
  { id: "log-3", itemId: "raw-1", itemName: "Fresh Whole Milk", itemType: "Material", quantity: 50, type: "Purchase", date: "2026-06-09 06:30", notes: "Daily Milk Supply Nandini" },
  { id: "log-4", itemId: "prod-10", itemName: "Crunchy Sweet Bun Butter", itemType: "Product", quantity: -2, type: "Damaged", date: "2026-06-09 19:00", notes: "Buns spoiled due to rain moisture" }
];

export const defaultShopSettings: ShopSettings = {
  shopName: "Chai Charcha Cafe",
  logoUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop&q=80",
  contactNumber: "+91 99888 77766",
  email: "billing@chaicharcha.com",
  address: "Plot 42, Outer Ring Road, Near HSR Layout sector 3, Bengaluru, Karnataka, 560102",
  gstNo: "29ABCDE1234F1Z9",
  footerMessage: "Thanks for raising the tea-mperatures with us! Follow us @ChaiCharchaCafe",
  taxRateDefault: 5, // 5% GST on food service default
  taxEnabled: true,
  currency: "₹",
  thermalWidth: "80mm"
};
