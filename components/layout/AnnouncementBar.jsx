'use client';

import { useState } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementBar() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="bg-slate-950 text-white text-xs sm:text-sm py-2 px-4 transition-all duration-300 relative border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
          <span className="flex items-center gap-1.5 font-medium text-amber-300">
            <Sparkles size={14} className="animate-pulse shrink-0" />
            <span>FESTIVE SALE:</span>
          </span>
          <span className="text-slate-200 truncate">
            Get up to 40% OFF + Flat 10% Extra with code <strong className="text-white underline decoration-amber-400">WELCOME10</strong>
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">Free delivery on orders above ₹999</span>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold ml-2 text-xs uppercase tracking-wider"
          >
            Shop Now <ArrowRight size={12} />
          </Link>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Close Announcement Bar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
