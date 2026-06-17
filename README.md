# Chai Charcha ERP & Inventory System

An elegant, responsive, and production-ready enterprise billing, inventory, and staff management system tailored for tea shops, cafes, and restaurants. Built with **React**, **TypeScript**, **TailwindCSS**, and **Firebase**.

---

## ✨ Features

*   **📱 POS Billing Terminal**: Supports split cash/UPI/Card payments, cart discounts, customer details, tax/GST inclusive calculations, and compact thermal receipt previews.
*   **📊 Inventory & Recipes (BOM)**: Real-time ingredient tracking with automated Bill of Materials (BOM) deduction on product sales, min-stock alerts, restocks, and manual adjustments logs.
*   **👥 Staff & Attendance Ledger**: Manage employees, log shifts (Morning, Evening, Full Day), punch attendance, track stipends, and generate printable digital payslips.
*   **💼 Overheads & Expenditures**: Detailed logs of overhead expenses (rent, electricity, logistics) with receipt records and category shares dashboards.
*   **🔐 Strict Server Authentication**: Firebase Auth integrations allowing toggle control for secure admin permissions blockades.
*   **🔌 Offline Reconciliation (Outbox Sync)**: Works offline in simulated conditions and syncs write/delete queues sequentially via the Outbox pattern when network restores.

---

## 🛠️ Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Install Dependencies
Run this command in the project root folder:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase credentials in the `.env` file:
```env
VITE_FIREBASE_API_KEY="YOUR_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_APP_ID"
```

### 3. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to view the app.

---

## 📦 Production & Deployment

### Build for Production
To bundle all assets into an optimized, minified production package under the `dist/` directory:
```bash
npm run build
```

### Deploy to GitHub Pages
To publish the build output folder directly to GitHub Pages on your repository:
```bash
npm run deploy
```
