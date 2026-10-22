'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Layers, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { slugify } from '@/lib/utils';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!name) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug: slugify(name), description, image }),
      });

      const data = await res.json();
      if (res.ok) {
        setCategories([...categories, data.category]);
        setName('');
        setDescription('');
        setNotice('Category created successfully!');
        setTimeout(() => setNotice(''), 3000);
      } else {
        setError(data.error || 'Failed to create category');
      }
    } catch {
      setError('Failed to create category');
    }
  };

  const handleDelete = async (id, catName) => {
    if (!confirm(`Delete category "${catName}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        setNotice('Category removed.');
        setTimeout(() => setNotice(''), 3000);
      } else {
        alert(data.error || 'Could not delete category');
      }
    } catch {
      alert('Error deleting category');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Category Taxonomy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Organize products into intuitive departments and landing hubs.
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <Check size={16} /> {notice}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Create Category Form */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus size={16} className="text-blue-400" /> Add New Category
          </h2>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Smart Wearables"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Short department overview..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
            >
              Save Category
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">Active Categories ({categories.length})</h3>
          </div>

          <div className="divide-y divide-slate-800">
            {categories.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                    <Image src={c.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'} alt={c.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{c.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">/products?category={c.slug}</p>
                    <span className="text-[10px] text-blue-400 font-semibold">
                      {c.productCount || 0} Products Attached
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete category"
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
