'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  Heart,
  MapPin,
  ShieldCheck,
  LogOut,
  Mail,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrdersCount(data.orders?.length || 0);
        }
      } catch {
        // Fallback
      }
    }
    if (user) {
      loadOrders();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              {user.role === 'ADMIN' && (
                <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Mail size={13} /> {user.email}
            </p>
            {user.phone && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Phone size={13} /> {user.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/account/orders"
          className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Order History
            </span>
            <p className="text-2xl font-black text-slate-900">{ordersCount} Orders</p>
            <p className="text-xs text-blue-600 group-hover:underline flex items-center gap-1 pt-1 font-semibold">
              Track & view receipts <ArrowRight size={12} />
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package size={24} />
          </div>
        </Link>

        <Link
          href="/wishlist"
          className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved Wishlist
            </span>
            <p className="text-2xl font-black text-slate-900">{wishlistCount} Items</p>
            <p className="text-xs text-rose-600 group-hover:underline flex items-center gap-1 pt-1 font-semibold">
              View saved products <ArrowRight size={12} />
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart size={24} />
          </div>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Security
            </span>
            <p className="text-base font-bold text-slate-900">Protected Account</p>
            <p className="text-xs text-emerald-600 font-semibold pt-1">
              Active JWT Session
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
