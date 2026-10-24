import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Truck, Home } from 'lucide-react';
import { getOrderById } from '@/lib/db';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OrderSuccessPage({ searchParams }) {
  const resolved = await searchParams;
  const orderNumber = resolved.orderNumber;
  const order = orderNumber ? await getOrderById(orderNumber) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 space-y-8">
      {/* Success Hero */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-sm space-y-4">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle size={44} />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Order {order?.paymentMethod === 'COD' ? 'Placed' : 'Payment & Order Confirmed'}
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Thank you for your order!
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your order has been placed successfully and is being prepared for dispatch.
          </p>
        </div>

        {order && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block text-left text-sm mt-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-500">Order Number</p>
                <p className="font-mono font-bold text-slate-900">{order.orderNumber}</p>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <p className="text-xs text-slate-500">Tracking Code</p>
                <p className="font-mono font-semibold text-blue-600">
                  {order.trackingNumber || 'Pending Dispatch'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/account/orders"
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Package size={16} /> View Order History
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Home size={16} /> Continue Shopping
          </Link>
        </div>
      </div>

      {/* Item Summary Details if available */}
      {order && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Receipt & Delivery Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Delivering To
              </h3>
              <p className="font-bold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600">{order.shippingStreet}</p>
              <p className="text-slate-600">
                {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
              </p>
              <p className="text-slate-500 mt-1">Phone: {order.customerPhone}</p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Payment & Shipping Status
              </h3>
              <p className="text-slate-900">
                Method: <strong className="uppercase">{order.paymentMethod}</strong>
              </p>
              <p className="text-slate-900">
                Payment Status:{' '}
                <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.paymentStatus}</span>
              </p>
              <p className="text-slate-900">
                Order Status:{' '}
                <span className="font-bold text-blue-600">{order.orderStatus}</span>
              </p>
              <p className="text-slate-500 mt-1">Carrier: {order.shippingCarrier || 'BlueDart'}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Items Purchased
            </h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-xs text-slate-500">{item.variantName}</p>
                    )}
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-900">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 mt-4 pt-3 flex justify-between items-baseline font-bold text-base">
              <span>{order.paymentStatus === 'PAID' ? 'Total Paid' : 'Total Due'}</span>
              <span className="text-xl text-slate-900">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
