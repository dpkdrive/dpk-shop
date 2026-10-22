import Link from 'next/link';
import { getProducts } from '@/lib/db';
import ProductCard from '@/components/product/ProductCard';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Search Results | DPK Shop',
  description: 'Search premium products, audio equipment, fashion, and electronics.',
};

export default async function SearchPage({ searchParams }) {
  const resolved = await searchParams;
  const q = resolved.q || '';

  const { products } = await getProducts({ search: q, limit: 24 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Header */}
      <div className="max-w-xl mx-auto text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {q ? `Search results for "${q}"` : 'Search DPK Shop'}
        </h1>
        <p className="text-sm text-slate-500">
          {q ? `Found ${products.length} products matching your query` : 'Search across all products, audio gear, and fashion.'}
        </p>

        <form action="/search" method="GET" className="relative">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by product name, feature, or SKU..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </form>
      </div>

      {/* Results Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <p className="text-slate-500 text-sm">
            No products matched your search. Try searching for "Headphones", "Smartwatch", "Pack", or "Wool".
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
