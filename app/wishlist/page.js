'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistItems() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/products?limit=50');
        const data = await res.json();
        if (data.products) {
          const matched = data.products.filter((p) => wishlistIds.includes(p.id));
          setProducts(matched);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    loadWishlistItems();
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
          <Heart size={40} />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Wishlist is Empty
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Save items that catch your eye! Tap the heart icon on any product to save it for later.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-colors"
        >
          Explore Catalog <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Saved Items ({products.length})
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your favorite products and move them to cart whenever you are ready.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const displayPrice = product.salePrice || product.price;
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-slate-50">
                <Image
                  src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-50 shadow-sm"
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base font-bold text-slate-900">
                      {formatPrice(displayPrice)}
                    </span>
                    {product.salePrice && product.salePrice < product.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => addToCart(product, 1)}
                  className="w-full py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShoppingCart size={14} /> Move to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
