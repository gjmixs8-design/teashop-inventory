/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useApp } from "../AppContext";
import {
  Layers,
  AlertTriangle,
  History,
  PlusCircle,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  Plus,
  Minus,
  Briefcase,
  Layers3,
} from "lucide-react";
import { Product, RawMaterial, StockMovementLog } from "../types";

export default function InventoryView() {
  const {
    products,
    rawMaterials,
    suppliers,
    stockMovementLogs,
    session,
    addProduct,
    editProduct,
    deleteProduct,
    addRawMaterial,
    editRawMaterial,
    deleteRawMaterial,
    recordStockMovement,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"products" | "raw" | "logs">("products");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Item States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: "p" | "r"; item: any } | null>(null);

  // Forms
  const [pForm, setPForm] = useState({
    name: "",
    category: "Chai & Tea",
    sku: "",
    sellingPrice: "",
    purchasePrice: "",
    stock: "",
    minStock: "",
    unit: "Cup",
    taxPercent: "5",
    supplierId: "",
    image: "",
  });

  const [rForm, setRForm] = useState({
    name: "",
    stock: "",
    unit: "kg",
    minStock: "",
    purchasePrice: "",
    supplierId: "",
  });

  // Adjustment Modal States
  const [adjustingItem, setAdjustingItem] = useState<{ type: "p" | "r"; id: string; name: string } | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustType, setAdjustType] = useState<"Adjustment" | "Damaged" | "Purchase">("Adjustment");
  const [adjustNotes, setAdjustNotes] = useState("");

  const categories = ["Chai & Tea", "Coffee", "Bakery & Biscuits", "Snacks", "Beverages"];

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const filteredRaw = useMemo(() => {
    return rawMaterials.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [rawMaterials, searchQuery]);

  const filteredLogs = useMemo(() => {
    return stockMovementLogs.filter(
      (log) =>
        log.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stockMovementLogs, searchQuery]);

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Alert: This image is too large! Please choose a smaller image (under 2MB) for optimal browser storage.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPForm(prev => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle forms submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (session.role === "Cashier" || session.role === "Staff") {
      alert("Permission Blocked: Only Managers and Admins can add or modify stock items!");
      return;
    }

    if (activeTab === "products") {
      if (!pForm.name || !pForm.sellingPrice || !pForm.purchasePrice || pForm.stock === "") return;

      const generatedSku = pForm.sku || `CH-${pForm.name.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

      const data = {
        name: pForm.name,
        category: pForm.category,
        sku: generatedSku,
        sellingPrice: parseFloat(pForm.sellingPrice),
        purchasePrice: parseFloat(pForm.purchasePrice),
        stock: parseInt(pForm.stock),
        minStock: parseInt(pForm.minStock) || 0,
        unit: pForm.unit,
        taxPercent: parseInt(pForm.taxPercent) || 0,
        supplierId: pForm.supplierId || undefined,
        image: pForm.image || undefined,
      };

      if (editingItem && editingItem.type === "p") {
        editProduct({ ...editingItem.item, ...data });
      } else {
        addProduct(data);
      }

      // Reset
      setPForm({
        name: "",
        category: "Chai & Tea",
        sku: "",
        sellingPrice: "",
        purchasePrice: "",
        stock: "",
        minStock: "",
        unit: "Cup",
        taxPercent: "5",
        supplierId: "",
        image: "",
      });
    } else {
      // Raw Materials
      if (!rForm.name || rForm.stock === "" || !rForm.purchasePrice) return;

      const data = {
        name: rForm.name,
        stock: parseFloat(rForm.stock),
        unit: rForm.unit,
        minStock: parseFloat(rForm.minStock) || 0,
        purchasePrice: parseFloat(rForm.purchasePrice),
        supplierId: rForm.supplierId || undefined,
      };

      if (editingItem && editingItem.type === "r") {
        editRawMaterial({ ...editingItem.item, ...data });
      } else {
        addRawMaterial(data);
      }

      // Reset
      setRForm({
        name: "",
        stock: "",
        unit: "kg",
        minStock: "",
        purchasePrice: "",
        supplierId: "",
      });
    }

    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleEditClick = (type: "p" | "r", item: any) => {
    if (session.role === "Cashier" || session.role === "Staff") {
      alert("Permission Blocked: Only Managers and Admins can edit inventory settings.");
      return;
    }

    setEditingItem({ type, item });
    if (type === "p") {
      setPForm({
        name: item.name,
        category: item.category,
        sku: item.sku,
        sellingPrice: item.sellingPrice.toString(),
        purchasePrice: item.purchasePrice.toString(),
        stock: item.stock.toString(),
        minStock: item.minStock.toString(),
        unit: item.unit,
        taxPercent: item.taxPercent.toString(),
        supplierId: item.supplierId || "",
        image: item.image || "",
      });
    } else {
      setRForm({
        name: item.name,
        stock: item.stock.toString(),
        unit: item.unit,
        minStock: item.minStock.toString(),
        purchasePrice: item.purchasePrice.toString(),
        supplierId: item.supplierId || "",
      });
    }
    setShowAddModal(true);
  };

  const handleDeleteClick = (type: "p" | "r", id: string) => {
    if (session.role !== "Admin") {
      alert("Strict Permission Blocked: Only Admin role can perform irreversible stock deletions.");
      return;
    }

    if (confirm("Are you absolutely sure you want to delete this inventory record? This action will break past stats references.")) {
      if (type === "p") deleteProduct(id);
      else deleteRawMaterial(id);
    }
  };

  // Stock adjustments
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!adjustingItem || !adjustQty) return;
    const numQty = parseFloat(adjustQty);
    if (isNaN(numQty) || numQty === 0) return;

    // Apply multiplier: adjustment or damage reduce standard quantities (let's check sign)
    // If "Damaged" or "Adjustment" is negative, let's process it. User can input positive / negative.
    // Let's specify explicitly: If Damaged, the quantity must be treated as a reduction (negative)
    let finalQty = numQty;
    if (adjustType === "Damaged" && numQty > 0) {
      finalQty = -numQty;
    }

    if (adjustingItem.type === "p") {
      const p = products.find((product) => product.id === adjustingItem.id);
      if (p) {
        const nextStock = Math.max(0, p.stock + finalQty);
        editProduct({ ...p, stock: nextStock });
        recordStockMovement(p.id, "Product", finalQty, adjustType, adjustNotes || "Manual POS back-counter adjust");
      }
    } else {
      const m = rawMaterials.find((material) => material.id === adjustingItem.id);
      if (m) {
        const nextStock = Math.max(0, m.stock + finalQty);
        editRawMaterial({ ...m, stock: nextStock });
        recordStockMovement(m.id, "Material", finalQty, adjustType, adjustNotes || "Manual backroom stock adjust");
      }
    }

    setAdjustingItem(null);
    setAdjustQty("");
    setAdjustNotes("");
    setAdjustType("Adjustment");
  };

  return (
    <div className="space-y-6">
      {/* Search and Tabs Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full scrollbar-none select-none shrink-0 w-full md:w-auto">
          <button
            onClick={() => {
              setActiveTab("products");
              setSearchQuery("");
            }}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 transition-colors focus:outline-none shrink-0 ${
              activeTab === "products" ? "bg-white text-teal-800 shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Layers size={15} />
            Saleable Products ({products.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("raw");
              setSearchQuery("");
            }}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 transition-colors focus:outline-none shrink-0 ${
              activeTab === "raw" ? "bg-white text-teal-800 shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Layers3 size={15} />
            Raw Materials ({rawMaterials.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("logs");
              setSearchQuery("");
            }}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 transition-colors focus:outline-none shrink-0 ${
              activeTab === "logs" ? "bg-white text-teal-800 shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <History size={15} />
            Stock Ledger
          </button>
        </div>

        {/* Search & Action inside top row */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab === "logs" ? "ledger dates/actions" : "item descriptions"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 text-gray-800 font-bold border rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {activeTab !== "logs" && ["Admin", "Manager"].includes(session.role) && (
            <button
              onClick={() => {
                setEditingItem(null);
                setShowAddModal(true);
              }}
              className="px-3.5 py-1.8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 focus:outline-none shadow-xs transition-colors"
            >
              <PlusCircle size={14} />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* VIEW A: PRODUCTS GRID */}
      {activeTab === "products" && (
        <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs">
          {/* Mobile Swipe Card Grid */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredProducts.map((p) => {
              const isLow = p.stock <= p.minStock;
              const supplier = suppliers.find((s) => s.id === p.supplierId);

              return (
                <div key={p.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700/10 shadow-xs shrink-0 bg-[#161a23]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100&auto=format&fit=crop&q=50";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-slate-700/10">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-extrabold text-slate-800 text-sm">{p.name}</span>
                        <span className="font-mono font-black text-teal-800 shrink-0">
                          ₹{p.sellingPrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400 font-bold">
                        <span>SKU: {p.sku.split("-")[1] || p.sku}</span>
                        <span>•</span>
                        <span className="bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded-full font-black">
                          {p.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-100 text-xs gap-2">
                    <div className="flex items-center gap-1">
                      {/* Inline Decrement */}
                      <button
                        onClick={() => {
                          if (p.stock <= 0) return;
                          editProduct({ ...p, stock: p.stock - 1 });
                        }}
                        className="h-6 w-6 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center font-black text-xs transition-colors cursor-pointer select-none border border-rose-500/20 active:scale-90 shrink-0"
                      >
                        -
                      </button>

                      <span
                        className={`font-black rounded px-2 py-0.5 text-xs text-center min-w-[55px] ${
                          isLow
                            ? "bg-amber-100 text-amber-800 animate-pulse"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {p.stock} {p.unit}
                      </span>

                      {/* Inline Increment */}
                      <button
                        onClick={() => {
                          editProduct({ ...p, stock: p.stock + 1 });
                        }}
                        className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 flex items-center justify-center font-black text-xs transition-colors cursor-pointer select-none border border-emerald-500/20 active:scale-90 shrink-0"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setAdjustingItem({ type: "p", id: p.id, name: p.name })}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-lg focus:outline-none"
                        title="Adjust quantity manually"
                      >
                        <RefreshCw size={13} />
                      </button>
                      <button
                        onClick={() => handleEditClick("p", p)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg focus:outline-none"
                        title="Edit details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick("p", p.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg focus:outline-none"
                        title="Delete item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-gray-400 font-bold text-xs">
                No matching products discovered in store
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-extrabold text-[10px] tracking-wider border-b border-gray-100 uppercase">
                  <th className="py-3 px-4">Menu Product Item</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Menu Category</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Cost Price (Est)</th>
                  <th className="py-3 px-4 text-center">Stock Level</th>
                  <th className="py-3 px-4 text-center">Supplier Partner</th>
                  <th className="py-3 px-4 text-center">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  const supplier = suppliers.find((s) => s.id === p.supplierId);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700/50 shadow-sm shrink-0 bg-[#161a23]"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100&auto=format&fit=crop&q=50";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-slate-700/50">
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-800 text-xs sm:text-sm truncate max-w-[200px]">{p.name}</div>
                            <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Tax rate: Gst {p.taxPercent}% inclusive</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-500">{p.sku}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-teal-50 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-950">₹{p.sellingPrice}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-500">₹{p.purchasePrice}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {/* Inline Decrement */}
                          <button
                            onClick={() => {
                              if (p.stock <= 0) return;
                              editProduct({ ...p, stock: p.stock - 1 });
                            }}
                            className="h-6 w-6 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center font-black text-xs transition-colors cursor-pointer select-none border border-rose-500/20 active:scale-90 duration-75 shrink-0"
                            title="Quick Deduct Stock"
                          >
                            -
                          </button>

                          <span
                            className={`font-black rounded px-2 py-0.5 text-xs ${
                              isLow
                                ? "bg-amber-100 text-amber-805 animate-pulse"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {p.stock} {p.unit}s
                          </span>

                          {/* Inline Increment */}
                          <button
                            onClick={() => {
                              editProduct({ ...p, stock: p.stock + 1 });
                            }}
                            className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 flex items-center justify-center font-black text-xs transition-colors cursor-pointer select-none border border-emerald-500/20 active:scale-90 duration-75 shrink-0"
                            title="Quick Add Stock"
                          >
                            +
                          </button>
                          {isLow && <AlertTriangle size={13} className="text-amber-650 animate-bounce shrink-0" />}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-500 max-w-[120px] truncate">
                        {supplier ? supplier.name : "Local Sourced"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex gap-1.5">
                          {/* Stock adjustment button */}
                          <button
                            onClick={() => setAdjustingItem({ type: "p", id: p.id, name: p.name })}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold focus:outline-none"
                            title="Adjust quantity manually"
                          >
                            <RefreshCw size={13} />
                          </button>

                          <button
                            onClick={() => handleEditClick("p", p)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg focus:outline-none"
                            title="Edit details"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            onClick={() => handleDeleteClick("p", p.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg focus:outline-none"
                            title="Delete item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No matching products discovered in store
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW B: RAW MATERIALS */}
      {activeTab === "raw" && (
        <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs">
          {/* Mobile Swipe Card Grid */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredRaw.map((m) => {
              const isLow = m.stock <= m.minStock;
              const supplier = suppliers.find((s) => s.id === m.supplierId);

              return (
                <div key={m.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{m.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Buy Cost: <b className="font-bold text-slate-700">₹{m.purchasePrice} / {m.unit}</b>
                      </p>
                      <p className="text-[10px] text-gray-450 mt-0.5">
                        Supplier: <span className="font-semibold text-gray-600">{supplier ? supplier.name : "Local Produce"}</span>
                      </p>
                    </div>

                    <span
                      className={`font-black rounded px-2.5 py-0.5 text-xs inline-block shrink-0 ${
                        isLow
                          ? "bg-amber-100 text-amber-800 animate-pulse"
                          : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      {m.stock} {m.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-100 text-xs gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Inline Decrement */}
                      <button
                        onClick={() => {
                          if (m.stock <= 0) return;
                          editRawMaterial({ ...m, stock: m.stock - 1 });
                        }}
                        className="h-6 w-6 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center font-black text-xs transition-colors cursor-pointer select-none border border-rose-500/20 active:scale-90 shrink-0"
                      >
                        -
                      </button>

                      <span className="text-xs font-bold text-slate-700 px-1">
                        Quick Adjust
                      </span>

                      {/* Inline Increment */}
                      <button
                        onClick={() => {
                          editRawMaterial({ ...m, stock: m.stock + 1 });
                        }}
                        className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 flex items-center justify-center font-black text-xs transition-colors cursor-pointer select-none border border-emerald-500/20 active:scale-90 shrink-0"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setAdjustingItem({ type: "r", id: m.id, name: m.name })}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold focus:outline-none"
                        title="Adjust quantity manually"
                      >
                        <RefreshCw size={11} />
                      </button>

                      <button
                        onClick={() => handleEditClick("r", m)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg focus:outline-none"
                      >
                        <Edit2 size={11} />
                      </button>

                      <button
                        onClick={() => handleDeleteClick("r", m.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg focus:outline-none"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRaw.length === 0 && (
              <div className="p-8 text-center text-gray-400 font-bold text-xs">
                No raw ingredients matching query
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-extrabold text-[10px] tracking-wider border-b border-gray-100 uppercase">
                  <th className="py-3 px-4">Raw Ingredient Spec</th>
                  <th className="py-3 px-4 text-right">Average Buy Cost (Unit)</th>
                  <th className="py-3 px-4 text-center">Current Stock Pile</th>
                  <th className="py-3 px-4 text-center">Supplier Partner</th>
                  <th className="py-3 px-4 text-center">Quick Adjustments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredRaw.map((m) => {
                  const isLow = m.stock <= m.minStock;
                  const supplier = suppliers.find((s) => s.id === m.supplierId);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">{m.name}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-500">
                        ₹{m.purchasePrice} / {m.unit}
                      </td>
                       <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {/* Inline Decrement */}
                          <button
                            onClick={() => {
                              if (m.stock <= 0) return;
                              editRawMaterial({ ...m, stock: m.stock - 1 });
                            }}
                            className="h-6 w-6 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center font-black text-xs transition-colors cursor-pointer select-none border border-rose-500/20 active:scale-90 duration-75 shrink-0"
                            title="Quick Deduct Raw Stock"
                          >
                            -
                          </button>

                          <span
                            className={`font-black rounded px-2.5 py-0.5 text-xs ${
                              isLow
                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                : "bg-teal-100 text-teal-800"
                            }`}
                          >
                            {m.stock} {m.unit}
                          </span>

                          {/* Inline Increment */}
                          <button
                            onClick={() => {
                              editRawMaterial({ ...m, stock: m.stock + 1 });
                            }}
                            className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 flex items-center justify-center font-black text-xs transition-colors cursor-pointer select-none border border-emerald-500/20 active:scale-90 duration-75 shrink-0"
                            title="Quick Add Raw Stock"
                          >
                            +
                          </button>
                          {isLow && <AlertTriangle size={13} className="text-amber-650 animate-bounce shrink-0" />}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-500 max-w-[150px] truncate">
                        {supplier ? supplier.name : "N/A Local Produce"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => setAdjustingItem({ type: "r", id: m.id, name: m.name })}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold focus:outline-none"
                            title="Adjust quantity manually"
                          >
                            <RefreshCw size={13} />
                          </button>

                          <button
                            onClick={() => handleEditClick("r", m)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg focus:outline-none"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            onClick={() => handleDeleteClick("r", m.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg focus:outline-none"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredRaw.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      No raw ingredients matching query
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW C: STOCK LEDGER LOGS */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs">
          <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold tracking-wider text-teal-800 uppercase block">STOCK LEDGER AUDIT LOGS</span>
              <p className="text-xs text-gray-500">List of physical actions impacting tea room inventory levels</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-extrabold text-[10px] tracking-wider border-b border-gray-100 uppercase">
                  <th className="py-2.5 px-4">Date Time</th>
                  <th className="py-2.5 px-4">Item Track</th>
                  <th className="py-2.5 px-4">Inventory Class</th>
                  <th className="py-2.5 px-4 text-center flex items-center justify-center">Quantity Delta</th>
                  <th className="py-2.5 px-4">Impact Action Type</th>
                  <th className="py-2.5 px-4">Audit Note Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredLogs.map((log) => {
                  const isNegative = log.quantity < 0;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-gray-400 text-[10px]">{log.date}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-800">{log.itemName}</td>
                      <td className="py-3 px-4 font-semibold text-gray-500">{log.itemType}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-black rounded px-2 py-0.5 text-[11px] ${
                            isNegative
                              ? "bg-rose-50 text-rose-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            log.type === "Sale"
                              ? "bg-blue-100 text-blue-800"
                              : log.type === "Damaged"
                              ? "bg-rose-100 text-rose-800 animate-pulse"
                              : log.type === "Purchase"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 italic max-w-xs truncate">{log.notes || "N/A manual change"}</td>
                    </tr>
                  );
                })}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No stock movement audit records found in state memory
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADJUSTMENT DIALOG MODAL */}
      {adjustingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <form onSubmit={handleAdjustSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-base font-extrabold text-slate-800">Adjust Quantities Stock</h4>
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="text-gray-400 hover:text-gray-650 focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-normal">
              Quick adjust physical levels for: <b className="text-slate-800 font-bold">{adjustingItem.name}</b>
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType("Adjustment")}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    adjustType === "Adjustment"
                      ? "bg-slate-700 text-white border-slate-700"
                      : "bg-white text-gray-600 hover:bg-slate-50"
                  }`}
                >
                  General Adj (+ / -)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("Damaged")}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    adjustType === "Damaged"
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-white text-gray-600 hover:bg-slate-50"
                  }`}
                >
                  Record Damaged (Loss)
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">
                  Quantity Change {adjustType === "Damaged" && "(Always deducted as negative loss)"}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={adjustType === "Damaged" ? "e.g. 5 damaged units" : "Use positive or negative numbers"}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Audit Log Memo Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Broken packaging / daily stock refill"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none"
                  maxLength={100}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-colors focus:outline-none"
            >
              Log Audit & Save
            </button>
          </form>
        </div>
      )}

      {/* ADD/EDIT ITEM DIALOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-40">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white rounded-3xl max-w-md w-full flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header - Sticky */}
            <div className="flex items-center justify-between p-5 pb-3.5 border-b border-gray-100 flex-none bg-white">
              <h4 className="text-base sm:text-lg font-extrabold text-slate-800">
                {editingItem ? `Edit ${editingItem.type === "p" ? "Product" : "Raw Material"}` : `Add New ${activeTab === "products" ? "Product" : "Raw Material"}`}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-650 p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body Container */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-h-0 bg-white">
              {activeTab === "products" ? (
              // Product Form
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1">PRODUCT ITEM NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Ginger Tea Cup"
                    value={pForm.name}
                    onChange={(e) => setPForm({ ...pForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">MENU CATEGORY</label>
                    <select
                      value={pForm.category}
                      onChange={(e) => setPForm({ ...pForm, category: e.target.value })}
                      className="w-full p-2 border rounded-xl text-xs font-bold focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">SKU CODE (OPTIONAL)</label>
                    <input
                      type="text"
                      placeholder="Auto if empty"
                      value={pForm.sku}
                      onChange={(e) => setPForm({ ...pForm, sku: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1 flex items-center justify-between">
                      SELLING RATE (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={pForm.sellingPrice}
                      onChange={(e) => setPForm({ ...pForm, sellingPrice: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">EST PURCHASE COST (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5.50"
                      value={pForm.purchasePrice}
                      onChange={(e) => setPForm({ ...pForm, purchasePrice: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">INITIAL STOCK</label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={pForm.stock}
                      onChange={(e) => setPForm({ ...pForm, stock: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none"
                      disabled={!!editingItem} // Disable stock direct edit on products during edit (use adjustments log instead!)
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">MIN STOCK LEVEL ALERT</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={pForm.minStock}
                      onChange={(e) => setPForm({ ...pForm, minStock: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">UNIT</label>
                    <input
                      type="text"
                      placeholder="Cup / Piece / Glass"
                      value={pForm.unit}
                      onChange={(e) => setPForm({ ...pForm, unit: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">INCL TAX RATE %</label>
                    <select
                      value={pForm.taxPercent}
                      onChange={(e) => setPForm({ ...pForm, taxPercent: e.target.value })}
                      className="w-full p-2 border rounded-xl text-xs font-bold focus:outline-none"
                    >
                      <option value="0">0% (Tax exempt)</option>
                      <option value="5">5% (Standard Food GST)</option>
                      <option value="12">12% (Beverage/Mojito standard)</option>
                      <option value="18">18% (Confectionery/Water)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">SUPPLIER PARTNER</label>
                  <select
                    value={pForm.supplierId}
                    onChange={(e) => setPForm({ ...pForm, supplierId: e.target.value })}
                    className="w-full p-2 border rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="">No specific supplier / local</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PRODUCT IMAGE FLOW (UPLOAD FORM / URL & PRESET SELECTOR) */}
                <div className="border-t pt-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800">Product Image Configuration</span>
                    {pForm.image && (
                      <button
                        type="button"
                        onClick={() => setPForm({ ...pForm, image: "" })}
                        className="text-[10px] text-rose-500 font-bold hover:underline"
                      >
                        Reset Image
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 block">IMAGE SOURCE / UPLOAD FROM DEVICE</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Paste online image URL..."
                        value={pForm.image}
                        onChange={(e) => setPForm({ ...pForm, image: e.target.value })}
                        className="flex-1 px-3 py-1.5 border rounded-xl text-xs font-semibold focus:outline-none"
                      />
                      <div className="relative shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          id="device-image-uploader-btn"
                          className="hidden"
                          onChange={handleDeviceImageUpload}
                        />
                        <label
                          htmlFor="device-image-uploader-btn"
                          className="w-full sm:w-auto px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-705 text-slate-700 dark:text-slate-300 hover:text-slate-900 text-xs font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 duration-100"
                        >
                          📸 Device Image
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Curated South Indian / Standard presets panel */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 block">SELECT SOUTH INDIAN OR MENU PRESET:</span>
                    <div className="grid grid-cols-4 gap-1.5 overflow-y-auto max-h-24 p-1 bg-slate-50 rounded-xl">
                      {[
                        { name: "Ginger Chai", url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80" },
                        { name: "Elachi Chai", url: "https://images.unsplash.com/photo-1563887530-68090622e780?w=500&auto=format&fit=crop&q=80" },
                        { name: "Filter Coffee", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80" },
                        { name: "Jigarthanda", url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=80" },
                        { name: "Ghee Idli", url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80" },
                        { name: "Masala Vada", url: "https://images.unsplash.com/photo-1589301765196-08d4b3a4a2ae?w=500&auto=format&fit=crop&q=80" },
                        { name: "Sweet Bun", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80" },
                        { name: "Thattu Vadai", url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80" },
                        { name: "Lime Mojito", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80" },
                        { name: "Lava Cake", url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80" },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setPForm({ ...pForm, image: preset.url })}
                          className={`flex flex-col items-center p-1 rounded-lg border text-center transition-colors hover:bg-white ${
                            pForm.image === preset.url ? "border-emerald-500 bg-emerald-50/30" : "border-gray-200 bg-white"
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-8 h-8 rounded-md object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[8px] font-black mt-1 leading-none text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Thumbnail Preview */}
                  {pForm.image && (
                    <div className="flex items-center gap-2.5 bg-emerald-50/30 p-2 rounded-xl border border-emerald-100">
                      <img
                        src={pForm.image}
                        alt="Preview"
                        className="w-11 h-11 rounded-lg object-cover shadow-xs border border-white"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100&auto=format&fit=crop&q=50";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Live image match</p>
                        <p className="text-[9px] text-gray-400 truncate font-semibold">{pForm.image}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Raw Material spec form
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1">INGREDIENT NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. Organic Brown Sugar"
                    value={rForm.name}
                    onChange={(e) => setRForm({ ...rForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">INITIAL QTY STOCK</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 25"
                      value={rForm.stock}
                      onChange={(e) => setRForm({ ...rForm, stock: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none"
                      disabled={!!editingItem}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">MEASUREMENT UNIT</label>
                    <input
                      type="text"
                      placeholder="kg / Liters / Pieces"
                      value={rForm.unit}
                      onChange={(e) => setRForm({ ...rForm, unit: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">AVG BULK BUY PRICE (₹)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 45.00"
                      value={rForm.purchasePrice}
                      onChange={(e) => setRForm({ ...rForm, purchasePrice: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold cursor-text focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">LOW STOCK LEVEL TRG</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 5"
                      value={rForm.minStock}
                      onChange={(e) => setRForm({ ...rForm, minStock: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">SUPPLIER PARTNER</label>
                  <select
                    value={rForm.supplierId}
                    onChange={(e) => setRForm({ ...rForm, supplierId: e.target.value })}
                    className="w-full p-2 border rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="">No specific supplier / local APMC</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            </div>

            {/* Modal Footer - Sticky with Clear Cancel/Back & Submit controls */}
            <div className="p-4 sm:p-5 border-t border-gray-150 bg-slate-50 flex items-center gap-2.5 flex-none">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="flex-1 py-3 text-center border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer transition-colors active:scale-95 duration-100 focus:outline-none"
              >
                Cancel / Back
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 duration-100 cursor-pointer focus:outline-none"
              >
                {editingItem ? "Save Changes" : "Register Item"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
