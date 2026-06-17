/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useApp } from "../AppContext";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  User,
  Phone,
  Tag,
  CreditCard,
  QrCode,
  DollarSign,
  Printer,
  ChevronDown,
  X,
  CheckCircle,
  FileText,
  BookmarkCheck,
} from "lucide-react";
import { Product, CartItem, Invoice } from "../types";

export default function POSBillingView() {
  const { products, createInvoice, settings, session } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [discountInput, setDiscountInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Invoice["paymentMethod"]>("Cash");

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Split payment details
  const [splitCash, setSplitCash] = useState<string>("");
  const [splitUpi, setSplitUpi] = useState<string>("");
  const [splitCard, setSplitCard] = useState<string>("");
  const [showSplitModal, setShowSplitModal] = useState(false);

  // Completed Invoice object to show the Printer modal!
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  // Retrieve unique categories
  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(list)];
  }, [products]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Limit to actual stock
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            // Check stock ceiling
            const originalProductInAppState = products.find((p) => p.id === productId);
            const stockLimit = originalProductInAppState ? originalProductInAppState.stock : 999;

            if (nextQty > stockLimit) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Cart financial summary
  const totals = useMemo(() => {
    const itemTotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
    const finalNet = Math.max(0, itemTotal - discountVal);

    let calculatedTax = 0;
    cart.forEach((item) => {
      const itemPriceSum = item.product.sellingPrice * item.quantity;
      const taxRate = settings.taxEnabled ? item.product.taxPercent : 0;
      const taxExtracted = (itemPriceSum * taxRate) / (100 + taxRate);
      calculatedTax += taxExtracted;
    });

    const discountRatio = itemTotal > 0 ? finalNet / itemTotal : 1;
    const finalTaxTotal = calculatedTax * discountRatio;
    const finalSubtotal = finalNet - finalTaxTotal;

    return {
      itemTotal,
      finalNet,
      subtotal: Number(finalSubtotal.toFixed(2)),
      taxTotal: Number(finalTaxTotal.toFixed(2)),
    };
  }, [cart, discountVal, settings]);

  const handleApplyDiscount = () => {
    const numerical = parseFloat(discountInput);
    if (!isNaN(numerical) && numerical >= 0) {
      setDiscountVal(numerical);
    } else {
      setDiscountVal(0);
    }
  };

  const handleApplyPresetDiscount = (val: number) => {
    setDiscountVal(val);
    setDiscountInput(val.toString());
  };

  // Handle invoice submission
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Phone validation (optional field, but if entered must be valid)
    const phoneVal = customerPhone.trim();
    if (phoneVal && !/^[0-9]{10}$/.test(phoneVal)) {
      alert("Validation Error: Customer contact phone number must be exactly 10 digits.");
      return;
    }

    // Split validation
    let splitPayObj = undefined;
    if (paymentMethod === "Split") {
      const cashVal = parseFloat(splitCash) || 0;
      const upiVal = parseFloat(splitUpi) || 0;
      const cardVal = parseFloat(splitCard) || 0;

      if (cashVal < 0 || upiVal < 0 || cardVal < 0) {
        alert("Validation Error: Split payment amounts cannot be negative.");
        return;
      }

      const totalSplitPaid = cashVal + upiVal + cardVal;

      if (Math.abs(totalSplitPaid - totals.finalNet) > 0.05) {
        alert(
          `Split payment amounts (₹${totalSplitPaid}) must sum EXACTLY to the net payable total (₹${totals.finalNet}).`
        );
        setShowSplitModal(true);
        return;
      }

      splitPayObj = { cash: cashVal, upi: upiVal, card: cardVal };
    }

    // Role-based verification
    if (session.role === "Staff") {
      alert("Billing permission blocked: Staff members can only view attendance or check stock level!");
      return;
    }

    const created = await createInvoice(
      cart,
      discountVal,
      paymentMethod,
      customerName.trim(),
      phoneVal,
      splitPayObj
    );

    // Save for receipt viewer dialog
    setCompletedInvoice(created);

    // Reset checkout state
    setCart([]);
    setDiscountVal(0);
    setDiscountInput("");
    setCustomerName("");
    setCustomerPhone("");
    setSplitCash("");
    setSplitUpi("");
    setSplitCard("");
  };

  const fillPaymentSplitValueMax = () => {
    const remains = totals.finalNet;
    setSplitCash(remains.toString());
    setSplitUpi("");
    setSplitCard("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT: PRODUCTS LIST & SELECTION GRID (8 Columns) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Search and Category Row */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-gray-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Search Chai, Snacks, Coffee by keywords or SKU code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-gray-800 text-sm font-semibold border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-colors placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          {/* Touch-optimized Category chips wrapper */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 text-xs sm:text-sm font-bold rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Selection Touch Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map((p) => {
            const qtyInCart = cart.find((item) => item.product.id === p.id)?.quantity || 0;
            const isLow = p.stock <= p.minStock;
            const isOut = p.stock === 0;

            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={isOut}
                className={`overflow-hidden relative flex flex-col justify-between bg-white text-left rounded-2xl border transition-all select-none group focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isOut
                    ? "border-dashed border-gray-200 bg-gray-50/50 cursor-not-allowed"
                    : qtyInCart > 0
                    ? "border-emerald-500 bg-emerald-50/20 shadow-xs"
                    : "border-gray-100 hover:border-gray-200 hover:shadow-xs active:scale-[98%]"
                }`}
              >
                {/* Product Image or Category Gradient Fallback */}
                <div className="relative w-full h-28 bg-slate-100 overflow-hidden">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=50";
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br text-white font-black text-xl tracking-wider ${
                      p.category === "Chai & Tea" ? "from-amber-550 to-orange-600" :
                      p.category === "Coffee" ? "from-yellow-905 to-amber-950" :
                      p.category === "Bakery & Biscuits" ? "from-yellow-400 to-amber-600" :
                      p.category === "Snacks" ? "from-orange-500 to-rose-600" :
                      "from-teal-400 to-blue-600"
                    }`}>
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Visual badges over the image */}
                  <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    {qtyInCart > 0 && (
                      <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-md">
                        {qtyInCart}x
                      </span>
                    )}
                    {isOut ? (
                      <span className="bg-rose-100 text-rose-800 font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow-xs">
                        SOLD OUT
                      </span>
                    ) : isLow ? (
                      <span className="bg-amber-100 text-amber-805 font-extrabold text-[8px] px-1.5 py-0.5 rounded animate-pulse shadow-xs">
                        LOW ({p.stock})
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category mini label */}
                    <span className="text-[10px] text-gray-400 font-bold block mb-1">
                      {p.category.toUpperCase()}
                    </span>

                    {/* Product title */}
                    <h4 className="text-xs sm:text-sm font-bold text-gray-800 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2 pr-1">
                      {p.name}
                    </h4>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-1.5 border-t border-slate-50">
                    <div className="text-[10px] font-mono text-gray-400">SKU: {p.sku.split("-")[1] || p.sku}</div>
                    <div className="text-right">
                      <span className="text-sm font-black text-teal-800">
                        {settings.currency}
                        {p.sellingPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white border border-dashed rounded-2xl p-6 text-gray-400">
              <Sparkles size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-bold">No tea or snack items match current filter.</p>
              <p className="text-xs mt-0.5">Try searching another SKU or category</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: SHOPPING CART & CUSTOMER METRICS (4 or 5 Columns) */}
      <div id="pos-cart-section" className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
          <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
            <ShoppingCart size={18} className="text-emerald-600" />
            Active Bill Cart
            {cart.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black min-w-5 h-5 px-1 flex items-center justify-center rounded-full">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </h3>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 focus:outline-none"
            >
              <Trash2 size={13} />
              Clear
            </button>
          )}
        </div>

        {/* Cart Item rows */}
        <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
          {cart.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between gap-2.5 border-b border-gray-50 pb-2.5">
              {item.product.image ? (
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700/50 shrink-0 shadow-xs bg-[#161a23]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100&auto=format&fit=crop&q=50";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-[10px] text-white flex items-center justify-center font-bold shrink-0 border border-slate-700/50">
                  {item.product.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-800 truncate leading-snug">{item.product.name}</p>
                <p className="text-[10px] text-teal-800 font-bold mt-0.5">
                  {settings.currency} {item.product.sellingPrice} / unit
                </p>
              </div>

              {/* Add subtract counters */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => updateQty(item.product.id, -1)}
                  className="h-7 w-7 bg-slate-100 hover:bg-slate-200 text-gray-600 rounded-lg flex items-center justify-center transition-colors focus:outline-none"
                >
                  <Minus size={13} />
                </button>
                <span className="text-xs font-bold w-6 text-center text-gray-800">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.product.id, 1)}
                  className="h-7 w-7 bg-slate-100 hover:bg-slate-200 text-gray-600 rounded-lg flex items-center justify-center transition-colors focus:outline-none"
                >
                  <Plus size={13} />
                </button>
                <button
                  onClick={() => removeCartItem(item.product.id)}
                  className="h-7 w-7 text-gray-400 hover:text-rose-500 rounded-lg flex items-center justify-center transition-colors focus:outline-none ml-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <ShoppingCart size={32} className="mx-auto mb-2 text-slate-200" />
              <p className="text-xs font-bold text-slate-500">POS Cart is empty.</p>
              <p className="text-[11px] mt-0.5 text-slate-400">Click drink or snacks in the grid to add</p>
            </div>
          )}
        </div>

        {/* Customer fields and calculations */}
        {cart.length > 0 && (
          <form onSubmit={handleCheckout} className="space-y-4 pt-3.5 border-t border-slate-100 mt-2">
            {/* Customer Details section */}
            <div className="bg-slate-50 p-2.5 rounded-xl space-y-2">
              <span className="text-[10px] text-gray-500 font-black tracking-wider uppercase block">
                Customer Details (For loyalty / receipt)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <User size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-white text-gray-800 rounded-lg border border-slate-150 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-gray-300"
                  />
                </div>
                <div className="relative">
                  <Phone size={11} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Phone No"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-white text-gray-800 rounded-lg border border-slate-150 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Discount section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1">
                  <Tag size={13} className="text-emerald-500" /> Coupon / Discount Off
                </span>
                {discountVal > 0 && <span className="text-emerald-600">-₹{discountVal}</span>}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="₹ Off"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  className="w-20 px-2 py-1.5 text-xs bg-slate-50 text-gray-800 border-0 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors focus:outline-none"
                >
                  Apply
                </button>
                {/* Fast coupons */}
                <button
                  type="button"
                  onClick={() => handleApplyPresetDiscount(5)}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 rounded-lg text-xs font-bold focus:outline-none transition-colors"
                >
                  -₹5
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetDiscount(15)}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 rounded-lg text-xs font-bold focus:outline-none transition-colors"
                >
                  -₹15
                </button>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 border-t border-slate-50 pt-2 text-xs">
              <div className="flex justify-between text-gray-500 leading-none">
                <span>Items Subtotal:</span>
                <span className="font-mono">{settings.currency} {totals.itemTotal.toLocaleString()}</span>
              </div>
              {settings.taxEnabled && (
                <div className="flex justify-between text-gray-400 leading-none text-[11px]">
                  <span>GST Inclusive share:</span>
                  <span className="font-mono">{settings.currency} {totals.taxTotal}</span>
                </div>
              )}
              {discountVal > 0 && (
                <div className="flex justify-between text-emerald-600 leading-none font-bold">
                  <span>Custom Discount:</span>
                  <span className="font-mono">- {settings.currency} {discountVal}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-gray-900 border-t border-slate-50 pt-2 leading-none">
                <span>Net Amount:</span>
                <span className="font-mono">{settings.currency} {totals.finalNet.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 font-extrabold block">PAYMENT MODE</span>
              <div className="grid grid-cols-4 gap-1.5">
                {/* Cash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Cash")}
                  className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all focus:outline-none ${
                    paymentMethod === "Cash"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <DollarSign size={15} />
                  <span className="text-[10px] font-black">Cash</span>
                </button>

                {/* UPI QR Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all focus:outline-none ${
                    paymentMethod === "UPI"
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <QrCode size={15} />
                  <span className="text-[10px] font-black">UPI QP</span>
                </button>

                {/* Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Card")}
                  className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all focus:outline-none ${
                    paymentMethod === "Card"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <CreditCard size={15} />
                  <span className="text-[10px] font-black">Card</span>
                </button>

                {/* Split */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("Split");
                    fillPaymentSplitValueMax();
                    setShowSplitModal(true);
                  }}
                  className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all focus:outline-none ${
                    paymentMethod === "Split"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ChevronDown size={14} />
                  <span className="text-[10px] font-black">Split</span>
                </button>
              </div>

              {paymentMethod === "Split" && (
                <div className="text-[11px] text-gray-500 bg-indigo-50/50 p-2 rounded-xl mt-1 text-center font-bold flex justify-between items-center">
                  <span>Cash-UPI-Card Split Active</span>
                  <button
                    type="button"
                    onClick={() => setShowSplitModal(true)}
                    className="text-[11px] underline text-indigo-700 font-extrabold focus:outline-none"
                  >
                    Adjust
                  </button>
                </div>
              )}
            </div>

            {/* Checkout Action Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold rounded-xl shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all flex items-center justify-center gap-2"
            >
              <Printer size={18} />
              Invoice & Create Bill
            </button>
          </form>
        )}
      </div>

      {/* MODAL 1: SPLIT CALCULATOR DIALOG */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-base font-extrabold text-slate-800">Split Payment Setup</h4>
              <button onClick={() => setShowSplitModal(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Divide the net customer payable amount of <b className="font-bold text-teal-800">₹{totals.finalNet}</b> between payment methods.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Cash Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={splitCash}
                  onChange={(e) => setSplitCash(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">UPI / QR Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={splitUpi}
                  onChange={(e) => setSplitUpi(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Card Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={splitCard}
                  onChange={(e) => setSplitCard(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Math Validation Helper */}
            <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Total Specified:</span>
              <span
                className={`${
                  Math.abs((parseFloat(splitCash) || 0) + (parseFloat(splitUpi) || 0) + (parseFloat(splitCard) || 0) - totals.finalNet) < 0.05
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                ₹{((parseFloat(splitCash) || 0) + (parseFloat(splitUpi) || 0) + (parseFloat(splitCard) || 0)).toFixed(2)} / ₹
                {totals.finalNet}
              </span>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  const remains = totals.finalNet;
                  setSplitCash(remains.toString());
                  setSplitUpi("0");
                  setSplitCard("0");
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-xs text-gray-600 focus:outline-none"
              >
                Reset Cash-Full
              </button>

              <button
                onClick={() => setShowSplitModal(false)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs text-white focus:outline-none"
              >
                Confirm Split
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTER THERMAL BILL DIALOG */}
      {completedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative my-8">
            <button
              onClick={() => setCompletedInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white focus:outline-none bg-slate-700 p-1.5 rounded-full"
            >
              <X size={16} />
            </button>

            <div className="text-center text-emerald-400">
              <CheckCircle size={36} className="mx-auto mb-1 animate-bounce" />
              <h4 className="text-base font-extrabold">Bill Printed Successfully!</h4>
              <p className="text-[11px] text-slate-300">Transaction log saved onto cloud database</p>
            </div>

            {/* Mock POS receipt container mimicking real thermal roll (58mm or 80mm width look) */}
            <div id="printable-receipt-card" className="bg-white text-black p-5 font-mono text-xs rounded-xl shadow-inner select-all border border-slate-300">
              {/* Receipt Header */}
              <div className="text-center space-y-1">
                <span className="font-extrabold text-sm tracking-wider block">
                  *** {settings.shopName.toUpperCase()} ***
                </span>
                <p className="text-[10px] leading-tight text-gray-600">
                  {settings.address}
                </p>
                <p className="text-[10px] text-gray-600 leading-none">
                  Phone: {settings.contactNumber}
                </p>
                {settings.gstNo && (
                  <p className="text-[10px] text-gray-600 leading-none">
                    GSTIN: {settings.gstNo}
                  </p>
                )}
                <div className="border-t border-dashed border-black my-2"></div>
              </div>

              {/* Bill Meta Details */}
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Bill No: {completedInvoice.billNo}</span>
                  <span>Payment: {completedInvoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date: {new Date(completedInvoice.date).toLocaleString()}</span>
                  <span>Cashier: Shift-A</span>
                </div>
                {completedInvoice.customerName && (
                  <div className="flex justify-between border-t border-dashed border-gray-100 pt-1 mt-1 font-bold">
                    <span>Cust: {completedInvoice.customerName}</span>
                    <span>No: {completedInvoice.customerPhone || "N/A"}</span>
                  </div>
                )}
                <div className="border-t border-dashed border-black my-2"></div>
              </div>

              {/* Items Listing */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-[10px]">
                  <span className="w-1/2">ITEM NAME</span>
                  <span className="w-1/6 text-right">QTY</span>
                  <span className="w-1/6 text-right">RATE</span>
                  <span className="w-1/6 text-right">AMT</span>
                </div>
                <div className="border-b border-dashed border-gray-300"></div>

                {completedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] leading-none">
                    <span className="w-1/2 truncate font-semibold uppercase">{item.name}</span>
                    <span className="w-1/6 text-right font-bold">{item.quantity}</span>
                    <span className="w-1/6 text-right">{item.price}</span>
                    <span className="w-1/6 text-right font-bold">
                      {item.price * item.quantity}
                    </span>
                  </div>
                ))}

                <div className="border-t border-dashed border-black my-2.5"></div>
              </div>

              {/* Bill Totals summary */}
              <div className="space-y-1.5 text-right text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal Amount:</span>
                  <span className="font-bold">
                    {settings.currency} {completedInvoice.subtotal.toFixed(2)}
                  </span>
                </div>
                {settings.taxEnabled && (
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>CGST + SGST (Included):</span>
                    <span>
                      {settings.currency} {completedInvoice.taxTotal.toFixed(2)}
                    </span>
                  </div>
                )}
                {completedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Coupon Applied:</span>
                    <span>
                      -{settings.currency} {completedInvoice.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-dashed border-black my-1"></div>
                <div className="flex justify-between text-sm font-black text-black">
                  <span>NET TOTAL DUE:</span>
                  <span>
                    {settings.currency} {completedInvoice.total.toFixed(2)}
                  </span>
                </div>

                {/* Splitting details */}
                {completedInvoice.paymentSplit && (
                  <div className="text-[10px] text-gray-600 font-bold border-t pt-1.5 mt-1 space-y-0.5 text-right">
                    {completedInvoice.paymentSplit.cash > 0 && <div>Cash-portion: {settings.currency}{completedInvoice.paymentSplit.cash}</div>}
                    {completedInvoice.paymentSplit.upi > 0 && <div>UPI-portion: {settings.currency}{completedInvoice.paymentSplit.upi}</div>}
                    {completedInvoice.paymentSplit.card > 0 && <div>Card-portion: {settings.currency}{completedInvoice.paymentSplit.card}</div>}
                  </div>
                )}
              </div>

              {/* Thermal Bill footer greeting */}
              <div className="text-center mt-5 space-y-2">
                <div className="border-t border-dashed border-black mb-2"></div>
                <p className="text-[10px] italic leading-tight">
                  "{settings.footerMessage}"
                </p>
                <p className="text-[9px] font-bold text-gray-500">Powered by ChaiCharcha System v2.6</p>
              </div>
            </div>

            {/* Quick Actions inside Printer Modal */}
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 focus:outline-none transition-all"
              >
                <Printer size={15} />
                Thermal Print
              </button>

              <button
                onClick={() => setCompletedInvoice(null)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 focus:outline-none transition-all"
              >
                <BookmarkCheck size={15} />
                New Order
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile floating scroll-to-cart helper button */}
      {cart.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("pos-cart-section");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="lg:hidden fixed bottom-20 right-4 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-lg z-20 flex items-center justify-center gap-1.5 animate-bounce font-extrabold text-xs cursor-pointer"
          >
            <ShoppingCart size={16} />
            <span>View Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
          </button>
        )}
      </div>
  );
}
