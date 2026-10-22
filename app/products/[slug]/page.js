import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';
import ProductCard from '@/components/product/ProductCard';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found | DPK Shop' };
  }

  return {
    title: `${product.name} | DPK Shop`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [
        {
          url: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-slate-900 transition-colors">
          Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-slate-900 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Interactive Product Showcase */}
      <ProductDetailClient product={product} />

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              You Might Also Like
            </h2>
            <Link
              href={`/products?category=${product.category?.slug}`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View More in {product.category?.name}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
