'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto text-lg font-black shadow-md">
            DPK
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to DPK Shop
          </h1>
          <p className="text-xs text-slate-500">
            Access your orders, saved wishlist, and addresses.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2 disabled:bg-slate-400"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Logins for Fast Pair Programming / Testing */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            ⚡ 1-Click Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('customer@dpkshop.com', 'Customer@12345')}
              className="py-2 px-2.5 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <UserCheck size={14} className="text-blue-600" /> Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin@dpkshop.com', 'Admin@12345')}
              className="py-2 px-2.5 bg-white hover:bg-purple-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={14} className="text-purple-600" /> Demo Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
