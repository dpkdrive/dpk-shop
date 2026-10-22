'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Check } from 'lucide-react';
import { formatPrice, calculateDiscountPercent } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import RatingStars from '@/components/ui/RatingStars';

export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const discountPercent = calculateDiscountPercent(product.price, product.salePrice);
  const displayPrice = product.salePrice || product.price;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockAlert || 5);

  const primaryImage =
    product.images?.[0]?.url ||
    product.imageUrl ||
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col h-full">
      {/* Product Image Section */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-slate-50">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.isTrending && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Trending
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-md scale-105'
              : 'bg-white/90 text-slate-600 hover:text-rose-600 hover:bg-white shadow-sm'
          }`}
        >
          <Heart size={18} className={isWishlisted ? 'fill-rose-600' : ''} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category */}
          {product.category?.name && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mb-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <Link
            href={`/products/${product.slug}`}
            className="block text-sm font-semibold text-slate-900 hover:text-blue-600 line-clamp-2 transition-colors leading-snug"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-2">
            <RatingStars
              rating={product.rating || 4.8}
              reviewsCount={product.reviewsCount || 12}
            />
          </div>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold text-slate-900">
                {formatPrice(displayPrice)}
              </span>
              {product.salePrice && product.salePrice < product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            {isLowStock && (
              <p className="text-[11px] text-amber-600 font-medium">
                Only {product.stock} left in stock!
              </p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-blue-600 active:scale-95 shadow-sm'
            }`}
          >
            {added ? (
              <>
                <Check size={14} /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
