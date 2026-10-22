import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/db';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Categories | DPK Shop',
  description: 'Explore all departments: Electronics, Audio & Acoustics, Fashion, and Home Living.',
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Product Categories
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore curated lifestyle collections and technical essentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <Image
                src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                {cat.productCount || 0} Products
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Browse Collection <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
