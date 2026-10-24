'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Lock,
  ArrowRight,
  AlertCircle,
  Truck,
  Tag,
  CheckCircle2,
  X,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();
  const { user } = useAuth();

  const [checkoutCoupon, setCheckoutCoupon] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    shippingStreet: user?.addresses?.[0]?.street || '',
    shippingCity: user?.addresses?.[0]?.city || '',
    shippingState: user?.addresses?.[0]?.state || 'Maharashtra',
    shippingPincode: user?.addresses?.[0]?.postalCode || '',
    shippingCountry: 'India',
    paymentMethod: 'RAZORPAY', // 'RAZORPAY' or 'COD'
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty. Please add products before checking out.');
      return;
    }

    if (
      !formData.customerName ||
      !formData.customerEmail ||
      !formData.customerPhone ||
      !formData.shippingStreet ||
      !formData.shippingCity ||
      !formData.shippingPincode
    ) {
      setErrorMessage('Please complete all required shipping and contact fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (formData.paymentMethod === 'RAZORPAY' && (!isRazorpayLoaded || typeof window.Razorpay !== 'function')) {
        throw new Error('Secure payment checkout is still loading. Please try again in a moment.');
      }

      let createdOrder = pendingOrder;
      const savedPendingOrderId = formData.paymentMethod === 'RAZORPAY'
        ? window.sessionStorage.getItem('dpkPendingRazorpayOrderId')
        : null;
      if (!createdOrder) {
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            existingOrderId: savedPendingOrderId,
            items: cartItems.map((item) => ({ productId: item.productId, variantName: item.variantName, quantity: item.quantity })),
            couponCode: coupon?.code || null,
          }),
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initialize order');
        createdOrder = orderData.order;
        if (formData.paymentMethod === 'RAZORPAY') {
          setPendingOrder(createdOrder);
          window.sessionStorage.setItem('dpkPendingRazorpayOrderId', createdOrder.id);
        }
      }

      if (formData.paymentMethod === 'RAZORPAY') {
        const rzpRes = await fetch('/api/payment/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: createdOrder.id }),
        });

        const rzpData = await rzpRes.json();
        if (!rzpRes.ok) {
          throw new Error(rzpData.error || 'Payment gateway setup error');
        }

        await new Promise((resolve, reject) => {
            const options = {
              key: rzpData.key,
              amount: rzpData.amount,
              currency: rzpData.currency || 'INR',
              name: 'DPK Shop',
              description: 'Order Payment',
              order_id: rzpData.id,

              handler: async (response) => {
                try {
                  const verifyRes = await fetch(
                    '/api/payment/razorpay/verify',
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        orderId: createdOrder.id,
                        razorpayOrderId:
                          response.razorpay_order_id,
                        razorpayPaymentId:
                          response.razorpay_payment_id,
                        razorpaySignature:
                          response.razorpay_signature,
                      }),
                    }
                  );

                  const verifyData = await verifyRes.json();

                  if (!verifyRes.ok) {
                    throw new Error(
                      verifyData.error ||
                      'Payment verification failed'
                    );
                  }

                  resolve(verifyData);
                } catch (error) {
                  reject(error);
                }
              },

              modal: {
                ondismiss: () => {
                  reject(new Error('Payment was cancelled.'));
                },
              },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on('payment.failed', (response) => {
              reject(
                new Error(
                  response.error?.description ||
                  'Payment failed. Please try again.'
                )
              );
            });

            razorpay.open();
          });
        setPendingOrder(null);
        window.sessionStorage.removeItem('dpkPendingRazorpayOrderId');
      }

      clearCart();
      router.push(`/checkout/success?orderNumber=${createdOrder.orderNumber}`);
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while placing your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-sm text-slate-500">Add products to your cart before proceeding to checkout.</p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onReady={() => setIsRazorpayLoaded(typeof window.Razorpay === 'function')}
        onError={() => setErrorMessage('Unable to load secure payment checkout. Check your connection and reload.')}
      />
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete your delivery details and choose your preferred payment method.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Contact, Shipping, & Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Contact Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  placeholder="e.g. Rahul Deshmukh"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (for delivery updates) *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (for order receipt & tracking) *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  required
                  placeholder="rahul@example.com"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Shipping Address
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address, Flat / House No., Landmark *
                </label>
                <input
                  type="text"
                  name="shippingStreet"
                  required
                  placeholder="e.g. Flat 402, Lotus Grand, 12th Main Road, Indiranagar"
                  value={formData.shippingStreet}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="shippingCity"
                    required
                    placeholder="e.g. Bengaluru"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="shippingState"
                    required
                    placeholder="e.g. Karnataka"
                    value={formData.shippingState}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="shippingPincode"
                    required
                    maxLength={6}
                    placeholder="560038"
                    value={formData.shippingPincode}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Notes / Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="e.g. Call before delivery, leave with security"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              Payment Method
            </h2>

            <div className="space-y-3">
              {/* Razorpay Online Payment */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formData.paymentMethod === 'RAZORPAY'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={formData.paymentMethod === 'RAZORPAY'}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard size={18} className="text-blue-600" />
                      Razorpay Online Payment (UPI, Cards, NetBanking)
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                      Fastest
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Instant & secure checkout powered by Razorpay. Supports Google Pay, PhonePe, Paytm, all Credit/Debit cards & NetBanking.
                  </p>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formData.paymentMethod === 'COD'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Banknote size={18} className="text-emerald-600" />
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay in cash or through UPI directly to the courier executive upon parcel delivery.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Final Placement */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Items ({cartItems.length})
            </h3>

            {/* Compact items list */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.variantId || 'novar'}`} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Input Card */}
            <div className="border-t border-slate-100 pt-3">
              {coupon ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={13} /> {coupon.code} Applied
                    </span>
                    <span className="text-[11px] text-emerald-600 block">
                      Saved {formatPrice(discount)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. WELCOME10)"
                      value={checkoutCoupon}
                      onChange={(e) => setCheckoutCoupon(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs uppercase text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      disabled={isApplyingCoupon || !checkoutCoupon.trim()}
                      onClick={async () => {
                        setIsApplyingCoupon(true);
                        await applyCoupon(checkoutCoupon.trim());
                        setIsApplyingCoupon(false);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors disabled:bg-slate-300"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                  )}
                  <div className="flex items-center gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutCoupon('WELCOME10');
                        applyCoupon('WELCOME10');
                      }}
                      className="text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded font-bold font-mono"
                    >
                      Use WELCOME10 (10% OFF &gt; ₹999)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon ({coupon?.code})</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Express Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-500 text-xs">
                <span>GST (18% included)</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">Total Due</span>
                <span className="text-2xl font-black text-slate-900">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-center text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center gap-2 group disabled:bg-slate-400"
            >
              {isSubmitting ? (
                'Processing Order...'
              ) : (
                <>
                  <Lock size={16} /> Place Order ({formatPrice(total)})
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center space-y-1 pt-2">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" /> Safe & Encrypted Checkout
              </p>
              <p>By placing order, you agree to DPK Shop Terms & Policies</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
