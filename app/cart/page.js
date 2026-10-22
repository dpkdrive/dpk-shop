'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Tag,
  CheckCircle2,
  X,
  Truck,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    coupon,
    couponError,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponInput.trim());
    setIsApplying(false);
  };

  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-4xl shadow-inner">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Your shopping cart is empty
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our curated collections of electronics, acoustic gear, and fashion!
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all shadow-md"
        >
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
        Shopping Bag ({cartCount} {cartCount === 1 ? 'item' : 'items'})
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Review your selected items and proceed to secure checkout.
      </p>

      {/* Free Shipping Progress Bar */}
      <div className="mb-8 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="flex items-center gap-2 text-slate-800">
            <Truck size={18} className="text-blue-600" />
            {amountNeededForFreeShipping > 0
              ? `Add ${formatPrice(amountNeededForFreeShipping)} more to unlock FREE Express Delivery!`
              : '🎉 You have unlocked FREE Express Delivery!'}
          </span>
          <span className="text-blue-600 font-bold">{freeShippingProgress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm divide-y divide-slate-100">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.variantId || 'novar'}`} className="p-4 sm:p-6 flex gap-4 sm:gap-6">
                {/* Thumbnail */}
                <Link
                  href={`/products/${item.slug}`}
                  className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200"
                >
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      {item.variantName && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.variantName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId, item.variantId)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Quantity & Item Total */}
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-inner">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity - 1)
                        }
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="px-2 py-1 text-xs sm:text-sm font-bold text-slate-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stock}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold text-sm disabled:text-slate-300"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-slate-400">
                          {formatPrice(item.price)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm font-semibold text-blue-600">
            <Link href="/products" className="hover:underline flex items-center gap-1">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="space-y-6">
          {/* Coupon Code Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag size={16} className="text-blue-600" /> Apply Promo Code
            </h3>

            {coupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Code Applied: {coupon.code}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    Saved {formatPrice(discount)}
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm uppercase text-slate-900 placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors disabled:bg-slate-400"
                  >
                    {isApplying ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-rose-600 font-medium">{couponError}</p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">Try codes:</span>
                  <button
                    type="button"
                    onClick={() => setCouponInput('WELCOME10')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono"
                  >
                    WELCOME10
                  </button>
                  <button
                    type="button"
                    onClick={() => setCouponInput('FLAT500')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono"
                  >
                    FLAT500
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 text-xs">
                <span>Estimated GST (18% included)</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-slate-900">Total Payable</span>
                  <p className="text-[10px] text-slate-400">Includes all taxes</p>
                </div>
                <span className="text-2xl font-black text-slate-900">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-center text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center gap-2 group"
            >
              Proceed to Checkout
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Razorpay 256-bit Bank Grade Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
