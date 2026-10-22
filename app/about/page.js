import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Award, HeartHandshake, Zap, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About Us | DPK Shop',
  description: 'Learn about DPK Shop - our mission, craft, and obsession with quality electronics and modern essentials.',
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Hero Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          The DPK Shop Story
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Crafting an Elevated Online Shopping Standard for India.
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Founded with a clear vision: eliminate counterfeit products, sluggish deliveries, and generic designs. We curate uncompromising electronics, acoustic gear, and lifestyle staples.
        </p>
      </div>

      {/* Visual Showcase */}
      <div className="relative aspect-[21/9] rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200">
        <Image
          src="https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1600&q=80"
          alt="DPK Shop Studio Workspace"
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white max-w-xl">
          <p className="text-xl sm:text-2xl font-bold">Design-led engineering meets authentic everyday luxury.</p>
        </div>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">100% Genuine Origin</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every product in our catalog is direct-sourced and rigorously quality tested before being dispatched to our customers.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Fair Pricing & Trust</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Transparent pricing with no hidden checkout surprises. Verified secure payments through Razorpay and instant payment tracking.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <HeartHandshake size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Customer Obsession</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            7-day return guarantee, real human support, and pan-India express logistics partners ensures your parcel arrives intact and on time.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to explore our curated drops?</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Discover why over 45,000 customers trust DPK Shop for their everyday electronics and essentials.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm transition-colors shadow-lg"
        >
          Explore Catalog <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
