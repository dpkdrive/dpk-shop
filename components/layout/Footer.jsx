'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, message: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus({ loading: true, success: false, message: '' });
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ loading: false, success: true, message: data.message });
        setEmail('');
      } else {
        setStatus({ loading: false, success: false, message: data.error || 'Failed to subscribe' });
      }
    } catch {
      setStatus({ loading: false, success: false, message: 'Subscription failed' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 mt-20">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-900 py-10 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Free Express Shipping</h4>
                <p className="text-xs text-slate-400">On all prepaid orders over ₹999</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Secure Checkout</h4>
                <p className="text-xs text-slate-400">Razorpay verified encryption</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <RefreshCw size={24} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Hassle-Free Returns</h4>
                <p className="text-xs text-slate-400">7-day replacement warranty</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <Headphones size={24} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Dedicated Support</h4>
                <p className="text-xs text-slate-400">Mon - Sat: 9 AM to 8 PM IST</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                DPK
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                DPK <span className="text-blue-500">SHOP</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              DPK Shop is India's premier online lifestyle and tech destination, curating authentic electronics, acoustics, refined fashion, and modern workspace essentials.
            </p>
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Stay Updated with New Drops
              </p>
              <form onSubmit={handleSubscribe} className="flex max-w-md gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-2.5 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={status.loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {status.loading ? '...' : <><Send size={15} /> Join</>}
                </button>
              </form>
              {status.message && (
                <p className={`text-xs mt-2 flex items-center gap-1 ${status.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {status.success && <CheckCircle2 size={13} />} {status.message}
                </p>
              )}
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products?category=electronics" className="hover:text-blue-400 transition-colors">
                  Electronics & Wearables
                </Link>
              </li>
              <li>
                <Link href="/products?category=audio" className="hover:text-blue-400 transition-colors">
                  Audio & Acoustics
                </Link>
              </li>
              <li>
                <Link href="/products?category=fashion" className="hover:text-blue-400 transition-colors">
                  Premium Fashion
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-workspace" className="hover:text-blue-400 transition-colors">
                  Home & Workspace
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-blue-400 transition-colors">
                  Accessories & EDC
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/account/orders" className="hover:text-blue-400 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-400 transition-colors">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-blue-400 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-refund-policy" className="hover:text-blue-400 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-blue-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  About DPK Shop
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 py-6 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DPK Shop. All rights reserved. Built with Next.js, Neon PostgreSQL & Tailwind CSS.</p>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">Accepted Payments:</span>
            <span className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-800">
              UPI / QR
            </span>
            <span className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-800">
              Cards
            </span>
            <span className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-800">
              NetBanking
            </span>
            <span className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-800">
              COD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
