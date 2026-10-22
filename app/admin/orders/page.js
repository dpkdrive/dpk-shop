'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, Search, RefreshCw, XCircle } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('BlueDart Express');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, orderStatus, paymentStatus) => {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          trackingNumber: trackingInput || undefined,
          shippingCarrier: carrierInput || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(orders.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch {
      alert('Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.orderStatus === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Order Management & Fulfillment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage dispatch, assign tracking codes, update payment statuses, and review customer parcels.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterStatus === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No orders match the selected filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-900/40">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-400">{o.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{o.customerName}</p>
                      <p className="text-[11px] text-slate-500">{o.customerPhone}</p>
                      <p className="text-[11px] text-slate-400">{o.shippingCity}, {o.shippingState}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-200">
                        {o.items?.length || 0} items
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {o.items?.[0]?.productName}
                      </p>
                    </td>
                    <td className="p-4 font-bold text-white">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {o.paymentStatus} ({o.paymentMethod})
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={o.orderStatus}
                        onChange={(e) =>
                          handleUpdateStatus(o.id, e.target.value, o.paymentStatus)
                        }
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setTrackingInput(o.trackingNumber || '');
                          setCarrierInput(o.shippingCarrier || 'BlueDart Express');
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-lg text-xs font-bold border border-slate-700"
                      >
                        Dispatch / Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-400">Date: {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Customer</span>
                  <p className="font-bold text-sm text-white mt-0.5">{selectedOrder.customerName}</p>
                  <p className="text-slate-400">{selectedOrder.customerEmail}</p>
                  <p className="text-slate-400">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Shipping To</span>
                  <p className="text-slate-300 mt-0.5">{selectedOrder.shippingStreet}</p>
                  <p className="text-slate-300">
                    {selectedOrder.shippingCity}, {selectedOrder.shippingState} - {selectedOrder.shippingPincode}
                  </p>
                </div>
              </div>

              {/* Courier Tracking Inputs */}
              <div className="space-y-3 bg-slate-900/30 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-400 uppercase font-bold text-[10px] flex items-center gap-1.5">
                  <Truck size={14} className="text-blue-400" /> Courier & Tracking Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Carrier Name</label>
                    <input
                      type="text"
                      value={carrierInput}
                      onChange={(e) => setCarrierInput(e.target.value)}
                      placeholder="e.g. BlueDart Express"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">AWB / Tracking Code</label>
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="e.g. DPK-EXP-8892110"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Package Contents</span>
                <div className="divide-y divide-slate-800 bg-slate-900/60 rounded-2xl border border-slate-800 p-3">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="py-2 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-white">{it.productName}</p>
                        {it.variantName && <p className="text-slate-500">{it.variantName}</p>}
                        <p className="text-slate-500">Qty: {it.quantity}</p>
                      </div>
                      <span className="font-bold text-white">{formatPrice(it.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus, selectedOrder.paymentStatus)
                }
                disabled={savingStatus}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                {savingStatus ? 'Saving...' : 'Save Dispatch Updates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
