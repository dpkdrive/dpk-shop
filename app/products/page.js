import Link from 'next/link';
import { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/db';
import ProductCard from '@/components/product/ProductCard';
import ProductFilters from './ProductFilters';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Browse Products | DPK Shop',
  description: 'Shop premium electronics, audio gear, fashion, and lifestyle essentials with fast shipping.',
};

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const category = resolvedSearchParams.category || undefined;
  const search = resolvedSearchParams.search || undefined;
  const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined;
  const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;
  const sort = resolvedSearchParams.sort || 'newest';
  const inStock = resolvedSearchParams.inStock === 'true';
  const page = resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1;

  const [productsData, categories] = await Promise.all([
    getProducts({
      categorySlug: category,
      search,
      minPrice,
      maxPrice,
      sortBy: sort,
      inStockOnly: inStock,
      page,
      limit: 12,
    }),
    getCategories(),
  ]);

  const { products, pagination } = productsData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">All Products</span>
        {category && (
          <>
            <span>/</span>
            <span className="text-blue-600 font-semibold capitalize">{category}</span>
          </>
        )}
      </nav>

      {/* Header Banner */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {category ? `${category.replace(/-/g, ' ').toUpperCase()}` : 'Explore All Products'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Showing {products.length} of {pagination.total} premium products
        </p>
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Suspense fallback={<div className="h-96 bg-white rounded-2xl animate-pulse" />}>
            <ProductFilters
              categories={categories}
              currentCategory={category}
              currentSort={sort}
              currentMinPrice={minPrice}
              currentMaxPrice={maxPrice}
              currentInStock={inStock}
              currentSearch={search}
            />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <section className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 text-2xl font-bold">
                🔍
              </div>
              <h3 className="text-lg font-bold text-slate-900">No products found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                We couldn't find any items matching your selected criteria. Try adjusting your filters or search keywords.
              </p>
              <Link
                href="/products"
                className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                Reset All Filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => {
                    const p = i + 1;
                    const isActive = p === pagination.page;
                    return (
                      <Link
                        key={p}
                        href={`/products?page=${p}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}`}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
