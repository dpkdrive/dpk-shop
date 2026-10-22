'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus, Search, Trash2, Edit, AlertCircle, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100', { cache: 'no-store' });
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        setNotice(`Product "${name}" deleted.`);
        setTimeout(() => setNotice(''), 3000);
      } else {
        alert('Failed to delete product');
      }
    } catch {
      alert('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Product Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, update stock, modify prices, and manage active catalog items.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-1.5 self-start"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <Check size={16} /> {notice}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search size={18} className="text-slate-500" />
        <input
          type="text"
          placeholder="Search products by title or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1"
        />
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No products match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-900/40">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredProducts.map((p) => {
                  const displayPrice = p.salePrice || p.price;
                  const isLow = p.stock <= (p.lowStockAlert || 5);
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                            <Image
                              src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-white line-clamp-1">{p.name}</p>
                            <Link
                              href={`/products/${p.slug}`}
                              target="_blank"
                              className="text-[11px] text-blue-400 hover:underline"
                            >
                              View on storefront ↗
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        {p.category?.name || 'Uncategorized'}
                      </td>
                      <td className="p-4 font-mono text-slate-400 text-xs">{p.sku}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock === 0
                              ? 'bg-rose-500/20 text-rose-400'
                              : isLow
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {p.stock} in stock
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white">
                        {formatPrice(displayPrice)}
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {p.isPublished ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deletingId === p.id}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
