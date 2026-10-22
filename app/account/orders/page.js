'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Truck, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function CustomerOrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadOrders();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [user, loading]);

  if (loading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/account" className="hover:text-slate-900 transition-colors">
            Account
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Orders</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track packages, view digital invoices, and check shipping status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Package size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No orders placed yet</h3>
          <p className="text-sm text-slate-500">
            Once you make your first purchase at DPK Shop, tracking information and receipts will appear here.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDelivered = order.orderStatus === 'DELIVERED';
            const isShipped = order.orderStatus === 'SHIPPED';
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4"
              >
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <span className="text-xs text-slate-400">Order Number</span>
                    <p className="font-mono font-bold text-slate-900">{order.orderNumber}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isDelivered
                          ? 'bg-emerald-50 text-emerald-700'
                          : isShipped
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {order.orderStatus}
                    </span>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Tracking & Carrier Notice */}
                {order.trackingNumber && (
                  <div className="p-3 bg-blue-50/70 rounded-2xl flex items-center justify-between text-xs text-blue-900">
                    <span className="flex items-center gap-2 font-medium">
                      <Truck size={16} className="text-blue-600" />
                      Shipped via {order.shippingCarrier || 'BlueDart Express'} • AWB: {order.trackingNumber}
                    </span>
                  </div>
                )}

                {/* Items */}
                <div className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-semibold text-slate-900">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-xs text-slate-500">{item.variantName}</p>
                        )}
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatPrice(item.total)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Total */}
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-500">Delivering to</span>
                    <p className="text-xs font-semibold text-slate-800">
                      {order.shippingCity}, {order.shippingState} ({order.shippingPincode})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Total Paid</span>
                    <p className="text-lg font-black text-slate-900">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
