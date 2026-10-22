import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Star,
  CheckCircle,
  Headphones,
  Zap,
} from 'lucide-react';
import { getProducts, getCategories } from '@/lib/db';
import ProductCard from '@/components/product/ProductCard';

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  const [trendingData, featuredData, categories] = await Promise.all([
    getProducts({ trendingOnly: true, limit: 4 }),
    getProducts({ featuredOnly: true, limit: 8 }),
    getCategories(),
  ]);

  const trendingProducts = trendingData.products || [];
  const featuredProducts = featuredData.products || [];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs sm:text-sm font-semibold">
                <Sparkles size={16} />
                <span>Next-Generation Lifestyle & Tech Drops</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Engineered for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                  Exceptional Living.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Elevate your daily routine with precision audio, aerospace-grade smartwatches, handcrafted leather goods, and minimalist modern essentials.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center gap-2 text-base group"
                >
                  Explore Collection
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/products?category=audio"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 text-base"
                >
                  <Headphones size={18} className="text-blue-400" />
                  Acoustic Audio
                </Link>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-white">45K+</p>
                  <p className="text-xs text-slate-400">Happy Customers</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-white">4.9★</p>
                  <p className="text-xs text-slate-400">Verified Rating</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-white">Fast</p>
                  <p className="text-xs text-slate-400">Pan-India Delivery</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Showcase */}
            <div className="relative mx-auto max-w-md lg:max-w-none w-full">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80"
                  alt="AcousticPro Premium Noise-Cancelling Headphones"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                      Featured Drop
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      AcousticPro Wireless ANC
                    </h3>
                    <p className="text-xs text-slate-300">Studio Master Sound • 60H Battery</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs line-through text-slate-400">₹14,999</span>
                    <p className="text-base sm:text-lg font-black text-white">₹11,999</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            All Categories <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-100 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-bold text-sm sm:text-base leading-snug group-hover:text-blue-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {cat.productCount || 0} Products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full mb-2">
              <Zap size={14} className="fill-rose-600" /> Hot Right Now
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trending This Week
            </h2>
          </div>
          <Link
            href="/products?sort=popularity"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            View All Trending <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotional Split Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Promo Card 1 */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between min-h-[300px]">
            <Image
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80"
              alt="Titanium Smartwatch Banner"
              fill
              className="object-cover opacity-25"
            />
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Limited Time Offer
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Chronos Sapphire Series 7
              </h3>
              <p className="text-sm text-slate-300 max-w-sm">
                Up to ₹5,000 off on premium titanium smartwatches with bio-tracking sensors.
              </p>
            </div>
            <div className="relative z-10 pt-6">
              <Link
                href="/products/chronos-sapphire-smartwatch-series-7"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-950 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors shadow-md"
              >
                Claim Offer <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Promo Card 2 */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between min-h-[300px]">
            <Image
              src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&q=80"
              alt="Nomad EDC Tech Pack"
              fill
              className="object-cover opacity-20"
            />
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Everyday Carry
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Nomad Tech Packs & EDC
              </h3>
              <p className="text-sm text-slate-300 max-w-sm">
                Engineered with ballistic Cordura fabric for travelers and digital creators.
              </p>
            </div>
            <div className="relative z-10 pt-6">
              <Link
                href="/products?category=accessories"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
              >
                Shop Tech Gear <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Recommended for You
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            Explore All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Verified Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Trusted by 45,000+ Shoppers
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Authentic reviews from verified buyers who experience DPK Shop quality every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "The AcousticPro headphones exceeded all my expectations. The hybrid ANC blocks out the Bengaluru traffic completely and the audio clarity is indistinguishable from flagship studio monitors."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Aarav Sharma</h4>
                  <p className="text-xs text-slate-500">Bengaluru • Verified Buyer</p>
                </div>
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "Ordered the Chronos Sapphire Series 7. Delivered in 48 hours to Mumbai with impeccable packaging. Razorpay payment was seamless and the titanium finish is breathtaking."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Priya Iyer</h4>
                  <p className="text-xs text-slate-500">Mumbai • Verified Buyer</p>
                </div>
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "The Nomad Tech Pack is the single best travel backpack I have used. Dedicated suspended laptop sleeve, water resistant zippers, and sits so comfortably on shoulders."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Vikramaditya Verma</h4>
                  <p className="text-xs text-slate-500">Delhi NCR • Verified Buyer</p>
                </div>
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
