/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../AppContext";
import {
  Briefcase,
  Layers,
  Search,
  PlusCircle,
  Truck,
  Trash2,
  X,
  Plus,
  RefreshCw,
  ShoppingBag,
  Edit2,
  Camera,
  Upload,
  MapPin,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { Supplier, RawMaterial, Product, StockMovementLog } from "../types";

export default function SuppliersView() {
  const {
    suppliers,
    rawMaterials,
    products,
    addSupplier,
    editSupplier,
    deleteSupplier,
    editRawMaterial,
    editProduct,
    recordStockMovement,
    session,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  // Supplier forms state
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);

  const [editingSup, setEditingSup] = useState<Supplier | null>(null);
  const [showEditSup, setShowEditSup] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditingSup(prev => prev ? { ...prev, image: reader.result as string } : null);
        } else {
          setImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (isEdit: boolean) => {
    if (isEdit) {
      setEditingSup(prev => prev ? { ...prev, image: undefined } : null);
    } else {
      setImage(undefined);
    }
  };

  const handleEditSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSup) return;

    const trimmedName = editingSup.name.trim();
    const contactNum = editingSup.contact.trim();
    const trimmedEmail = editingSup.email ? editingSup.email.trim() : "";
    const trimmedGst = editingSup.gstNo ? editingSup.gstNo.trim() : "";

    if (trimmedName.length < 2) {
      alert("Validation Error: Name must be at least 2 characters long.");
      return;
    }

    if (!/^[0-9]{10}$/.test(contactNum)) {
      alert("Validation Error: Contact phone number must be exactly 10 digits.");
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      alert("Validation Error: Please enter a valid email address.");
      return;
    }

    if (trimmedGst && !/^[0-9a-zA-Z]{15}$/.test(trimmedGst)) {
      alert("Validation Error: GSTIN must be exactly 15 alphanumeric characters.");
      return;
    }

    editSupplier({
      ...editingSup,
      name: trimmedName,
      contact: contactNum,
      email: trimmedEmail,
      gstNo: trimmedGst,
    });
    setShowEditSup(false);
    setEditingSup(null);
  };

  // Purchase restocking log state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [purchaseItemType, setPurchaseItemType] = useState<"material" | "product">("material");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [purchaseQty, setPurchaseQty] = useState("");
  const [purchaseCost, setPurchaseCost] = useState(""); // Cost per unit

  // Submissions
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;

    const trimmedName = name.trim();
    const contactNum = contact.trim();
    const trimmedEmail = email.trim();
    const trimmedGst = gstNo.trim();

    if (trimmedName.length < 2) {
      alert("Validation Error: Name must be at least 2 characters long.");
      return;
    }

    if (!/^[0-9]{10}$/.test(contactNum)) {
      alert("Validation Error: Contact phone number must be exactly 10 digits.");
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      alert("Validation Error: Please enter a valid email address.");
      return;
    }

    if (trimmedGst && !/^[0-9a-zA-Z]{15}$/.test(trimmedGst)) {
      alert("Validation Error: GSTIN must be exactly 15 alphanumeric characters.");
      return;
    }

    addSupplier({
      name: trimmedName,
      contact: contactNum,
      email: trimmedEmail,
      gstNo: trimmedGst,
      address,
      image,
    });

    // Reset Form
    setName("");
    setContact("");
    setEmail("");
    setGstNo("");
    setAddress("");
    setImage(undefined);
    setShowAddSupplier(false);
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !purchaseQty || !purchaseCost) return;

    if (session.role === "Cashier" || session.role === "Staff") {
      alert("Permission Blocked: Only Managers and Admins can log buy supplies orders.");
      return;
    }

    const qty = parseFloat(purchaseQty);
    const cost = parseFloat(purchaseCost);
    if (isNaN(qty) || qty <= 0) {
      alert("Validation Error: Purchase quantity must be a positive number.");
      return;
    }
    if (isNaN(cost) || cost <= 0) {
      alert("Validation Error: Purchase cost per unit must be a positive number.");
      return;
    }

    if (purchaseItemType === "material") {
      const material = rawMaterials.find((m) => m.id === selectedItemId);
      if (material) {
        const nextQty = material.stock + qty;
        editRawMaterial({ ...material, stock: nextQty, purchasePrice: cost });
        recordStockMovement(
          material.id,
          "Material",
          qty,
          "Purchase",
          `Restock order from supplier (Cost: ₹${cost}/${material.unit})`
        );
      }
    } else {
      const p = products.find((prod) => prod.id === selectedItemId);
      if (p) {
        const nextQty = p.stock + qty;
        editProduct({ ...p, stock: nextQty, purchasePrice: cost });
        recordStockMovement(
          p.id,
          "Product",
          qty,
          "Purchase",
          `Restock finished menu items (Cost: ₹${cost}/${p.unit})`
        );
      }
    }

    alert(`Successfully restocked and computed transaction details! Stock updated instantly.`);
    setShowPurchaseModal(false);
    setSelectedItemId("");
    setPurchaseQty("");
    setPurchaseCost("");
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.gstNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Action Header Column */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-800">Suppliers Profiles Directory</h3>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by supplier name or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 text-gray-800 border rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          {["Admin", "Manager"].includes(session.role) && (
            <>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 focus:outline-none shadow-xs transition-colors"
              >
                <Plus size={14} className="inline" /> Log Supplier Order
              </button>

              <button
                onClick={() => setShowAddSupplier(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl focus:outline-none shadow-xs transition-colors"
              >
                <Truck size={14} className="inline mr-0.5" /> Register Supplier
              </button>
            </>
          )}
        </div>
      </div>

      {/* VIEW SUPPLIER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((sup) => (
          <div key={sup.id} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-3 relative hover:shadow-xs transition-all">
            <div className="flex items-center gap-3 pr-16">
              <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                {sup.image ? (
                  <img src={sup.image} alt={sup.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xs">
                    {sup.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm sm:text-base pr-2 truncate leading-tight flex-1">{sup.name}</h4>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              <button
                onClick={() => {
                  setEditingSup(sup);
                  setShowEditSup(true);
                }}
                className="text-gray-300 hover:text-indigo-650 focus:outline-none"
                title="Edit Supplier"
              >
                <Edit2 size={14} />
              </button>
              {session.role === "Admin" && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this supplier?")) {
                      deleteSupplier(sup.id);
                    }
                  }}
                  className="text-gray-300 hover:text-rose-500 focus:outline-none"
                  title="Delete Supplier"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t pt-2 border-slate-50">
              <p className="flex items-center gap-1"><MapPin size={12} className="text-slate-400 shrink-0" /> Address: <b>{sup.address || "Local Provisions"}</b></p>
              <p className="flex items-center gap-1"><Phone size={12} className="text-slate-400 shrink-0" /> Phone contact: <span className="font-mono">{sup.contact}</span></p>
              <p className="flex items-center gap-1"><Mail size={12} className="text-slate-400 shrink-0" /> Email inbox: <span className="font-mono text-gray-400">{sup.email || "N/A"}</span></p>
              {sup.gstNo && (
                <p className="flex items-center gap-1">
                  <FileText size={12} className="text-slate-400 shrink-0" /> GST Registration: 
                  <span className="font-mono bg-slate-50 px-1 py-0.5 text-[11px] font-bold text-slate-700 rounded ml-1">{sup.gstNo}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Restocking Purchase form */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-40">
          <form
            onSubmit={handlePurchaseSubmit}
            className="bg-white rounded-3xl max-w-sm w-full flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-3.5 border-b border-gray-100 flex-none bg-white">
              <h4 className="text-base font-extrabold text-slate-800 font-sans">Purchase Supplies & Stock</h4>
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-400 hover:text-slate-650 p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-h-0 bg-white">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">SELECT SUPPLIER</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full p-2 border rounded-xl text-xs font-bold focus:outline-none"
                  required
                >
                  <option value="">Choose Supplier partner</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">SUPPLY CATEGORY</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPurchaseItemType("material");
                      setSelectedItemId("");
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      purchaseItemType === "material"
                        ? "bg-slate-700 text-white border-slate-700"
                        : "bg-white text-gray-600 hover:bg-slate-50"
                    }`}
                  >
                    Bulk Raw Materials
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPurchaseItemType("product");
                      setSelectedItemId("");
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      purchaseItemType === "product"
                        ? "bg-indigo-650 text-white border-indigo-650"
                        : "bg-white text-gray-600 hover:bg-slate-50"
                    }`}
                  >
                    Saleable Products
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">SELECT ITEM</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2 border rounded-xl text-xs font-bold focus:outline-none"
                  required
                >
                  <option value="">Select item description</option>
                  {purchaseItemType === "material"
                    ? rawMaterials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.unit}s)
                        </option>
                      ))
                    : products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.unit}s)
                        </option>
                      ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">BUY QTY</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 50"
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold font-mono focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">COST PER UNIT (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 54"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-150 bg-slate-50 flex items-center gap-2.5 flex-none">
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 py-3 text-center border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer transition-colors active:scale-95 duration-100 focus:outline-none"
              >
                Cancel / Back
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 duration-100 cursor-pointer focus:outline-none"
              >
                Log Purchase
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Register Supplier form */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-40">
          <form
            onSubmit={handleAddSupplier}
            className="bg-white rounded-3xl max-w-sm w-full flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-3.5 border-b border-gray-100 flex-none bg-white">
              <h4 className="text-base font-extrabold text-slate-800 font-sans">Add Supplier account</h4>
              <button
                type="button"
                onClick={() => setShowAddSupplier(false)}
                className="text-gray-400 hover:text-slate-650 p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-h-0 bg-white">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">SUPPLIER AGENCY NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Nilgiris Foods wholesaler"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-xl text-xs font-bold focus:outline-none text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">PHONE NUMBER</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9845012345"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full p-2 border rounded-xl text-xs font-mono text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">GSTIN REGISTERED</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="29AAAAA0000A1Z1"
                    value={gstNo}
                    onChange={(e) => setGstNo(e.target.value.toUpperCase())}
                    className="w-full p-2 border rounded-xl text-xs font-mono uppercase text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="orders@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">OFFICE ADDRESS</label>
                <input
                  type="text"
                  placeholder="G.S. Road, Bengaluru"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded-xl text-xs text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">SUPPLIER PHOTO / BRAND LOGO</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50 shrink-0">
                    {image ? (
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="sup-photo-input"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, false)}
                    />
                    <label
                      htmlFor="sup-photo-input"
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <Upload size={12} /> Choose File
                    </label>
                    {image && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(false)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 text-[10px] font-bold rounded-lg transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-150 bg-slate-50 flex items-center gap-2.5 flex-none">
              <button
                type="button"
                onClick={() => setShowAddSupplier(false)}
                className="flex-1 py-3 text-center border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer transition-colors active:scale-95 duration-100 focus:outline-none"
              >
                Cancel / Back
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 duration-100 cursor-pointer focus:outline-none"
              >
                Verify & Register
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Edit Supplier form */}
      {showEditSup && editingSup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-40">
          <form
            onSubmit={handleEditSupplierSubmit}
            className="bg-white rounded-3xl max-w-sm w-full flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-3.5 border-b border-gray-100 flex-none bg-white">
              <h4 className="text-base font-extrabold text-slate-800 font-sans">Edit Supplier account</h4>
              <button
                type="button"
                onClick={() => {
                  setShowEditSup(false);
                  setEditingSup(null);
                }}
                className="text-gray-400 hover:text-slate-650 p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-h-0 bg-white">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">SUPPLIER AGENCY NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Nilgiris Foods wholesaler"
                  value={editingSup.name}
                  onChange={(e) => setEditingSup({ ...editingSup, name: e.target.value })}
                  className="w-full p-2 border rounded-xl text-xs font-bold focus:outline-none text-slate-800 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">PHONE NUMBER</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9845012345"
                    value={editingSup.contact}
                    onChange={(e) => setEditingSup({ ...editingSup, contact: e.target.value })}
                    className="w-full p-2 border rounded-xl text-xs font-mono text-slate-800 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">GSTIN REGISTERED</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="29AAAAA0000A1Z1"
                    value={editingSup.gstNo}
                    onChange={(e) => setEditingSup({ ...editingSup, gstNo: e.target.value.toUpperCase() })}
                    className="w-full p-2 border rounded-xl text-xs font-mono uppercase text-slate-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="orders@agency.com"
                  value={editingSup.email}
                  onChange={(e) => setEditingSup({ ...editingSup, email: e.target.value })}
                  className="w-full p-2 border rounded-xl text-xs text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">OFFICE ADDRESS</label>
                <input
                  type="text"
                  placeholder="G.S. Road, Bengaluru"
                  value={editingSup.address}
                  onChange={(e) => setEditingSup({ ...editingSup, address: e.target.value })}
                  className="w-full p-2 border rounded-xl text-xs text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">SUPPLIER PHOTO / BRAND LOGO</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50 shrink-0">
                    {editingSup.image ? (
                      <img src={editingSup.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="edit-sup-photo-input"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, true)}
                    />
                    <label
                      htmlFor="edit-sup-photo-input"
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <Upload size={12} /> Choose File
                    </label>
                    {editingSup.image && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(true)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 text-[10px] font-bold rounded-lg transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-150 bg-slate-50 flex items-center gap-2.5 flex-none">
              <button
                type="button"
                onClick={() => {
                  setShowEditSup(false);
                  setEditingSup(null);
                }}
                className="flex-1 py-3 text-center border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl cursor-pointer transition-colors active:scale-95 duration-100 focus:outline-none"
              >
                Cancel / Back
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 duration-100 cursor-pointer focus:outline-none"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
