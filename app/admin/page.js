import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  Truck,
} from 'lucide-react';
import { getAdminMetrics } from '@/lib/db';
import { formatPrice, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const metrics = await getAdminMetrics();

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(metrics.totalRevenue),
      subtext: 'From verified paid orders',
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      label: 'Total Orders',
      value: metrics.totalOrders,
      subtext: 'All-time purchases',
      icon: ShoppingBag,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      label: 'Total Customers',
      value: metrics.totalCustomers,
      subtext: 'Registered shopping accounts',
      icon: Users,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      label: 'Products Catalog',
      value: metrics.totalProducts,
      subtext: `${metrics.lowStockCount} items need restock`,
      icon: Package,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Store Metrics & Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics and inventory performance from your database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alerts */}
      {metrics.lowStockProducts.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-900/50 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle size={18} />
            <span>Low Inventory Stock Notice ({metrics.lowStockProducts.length} Items)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {metrics.lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-200 truncate pr-2">{p.name}</span>
                <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full shrink-0">
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Customer Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Manage All Orders <ArrowRight size={14} />
          </Link>
        </div>

        {metrics.recentOrders.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No orders registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {metrics.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-blue-400">
                      <Link href="/admin/orders">{o.orderNumber}</Link>
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-white">{o.customerName}</p>
                      <p className="text-[11px] text-slate-500">{o.customerEmail}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          o.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">{formatDate(o.createdAt)}</td>
                    <td className="py-3.5 text-right font-bold text-white">
                      {formatPrice(o.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
