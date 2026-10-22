'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export default function ProductFilters({
  categories = [],
  currentCategory = '',
  currentSort = 'newest',
  currentMinPrice,
  currentMaxPrice,
  currentInStock = false,
  currentSearch = '',
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentSearch || '');
  const [minPrice, setMinPrice] = useState(currentMinPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice || '');
  const [inStock, setInStock] = useState(currentInStock);

  const applyFilters = (overrides = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update with current values or overrides
    const newCategory = overrides.category !== undefined ? overrides.category : currentCategory;
    const newSort = overrides.sort !== undefined ? overrides.sort : currentSort;
    const newSearch = overrides.search !== undefined ? overrides.search : search;
    const newMin = overrides.minPrice !== undefined ? overrides.minPrice : minPrice;
    const newMax = overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
    const newInStock = overrides.inStock !== undefined ? overrides.inStock : inStock;

    if (newCategory) params.set('category', newCategory);
    else params.delete('category');

    if (newSort) params.set('sort', newSort);
    else params.delete('sort');

    if (newSearch) params.set('search', newSearch);
    else params.delete('search');

    if (newMin) params.set('minPrice', newMin);
    else params.delete('minPrice');

    if (newMax) params.set('maxPrice', newMax);
    else params.delete('maxPrice');

    if (newInStock) params.set('inStock', 'true');
    else params.delete('inStock');

    params.set('page', '1');

    router.push(`/products?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    router.push('/products');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
          <Filter size={18} className="text-blue-600" /> Filters
        </h3>
        <button
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Sort Products
        </label>
        <select
          value={currentSort}
          onChange={(e) => applyFilters({ sort: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest Drops</option>
          <option value="popularity">Popularity</option>
          <option value="rating">Highest Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Category
        </label>
        <div className="space-y-1">
          <button
            onClick={() => applyFilters({ category: '' })}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              !currentCategory
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => applyFilters({ category: cat.slug })}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                currentCategory === cat.slug
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-xs text-slate-400">({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => applyFilters()}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
        >
          Apply Price
        </button>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Availability
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => {
              setInStock(e.target.checked);
              applyFilters({ inStock: e.target.checked });
            }}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );
}
