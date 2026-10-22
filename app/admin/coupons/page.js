'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minSpend: '999',
    maxDiscount: '1500',
  });

  const [notice, setNotice] = useState('');

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setCoupons([...coupons, data.coupon]);
        setForm({
          code: '',
          description: '',
          discountType: 'PERCENTAGE',
          discountValue: '',
          minSpend: '999',
          maxDiscount: '1500',
        });
        setNotice('Coupon created successfully!');
        setTimeout(() => setNotice(''), 3000);
      }
    } catch {
      alert('Failed to create coupon');
    }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;

    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
        setNotice(`Coupon "${code}" deleted.`);
        setTimeout(() => setNotice(''), 3000);
      }
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Coupon & Promo Codes
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Create marketing promotional codes, festive discounts, and order threshold incentives.
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <Check size={16} /> {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Create Coupon Form */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus size={16} className="text-blue-400" /> Create Coupon
          </h2>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FLASH30"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm uppercase font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Type *
                </label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Flat Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Value *
                </label>
                <input
                  type="number"
                  required
                  placeholder={form.discountType === 'PERCENTAGE' ? '20' : '500'}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Min Spend (₹)
                </label>
                <input
                  type="number"
                  value={form.minSpend}
                  onChange={(e) => setForm({ ...form, minSpend: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Max Cap (₹)
                </label>
                <input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. 20% off for holiday shoppers"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
            >
              Save Coupon
            </button>
          </form>
        </div>

        {/* Existing Coupons Table */}
        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">Active Promotion Codes ({coupons.length})</h3>
          </div>

          <div className="divide-y divide-slate-800">
            {coupons.map((cp) => (
              <div key={cp.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                      {cp.code}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">
                      {cp.discountType === 'PERCENTAGE'
                        ? `${cp.discountValue}% OFF`
                        : `₹${cp.discountValue} FLAT OFF`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{cp.description}</p>
                  <p className="text-[11px] text-slate-500">
                    Min Spend: ₹{cp.minSpend || 0} • Used {cp.usageCount || 0} times
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(cp.id, cp.code)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete coupon"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
