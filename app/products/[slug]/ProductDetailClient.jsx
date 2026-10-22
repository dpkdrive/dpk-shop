'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  MapPin,
  Star,
  MessageSquare,
} from 'lucide-react';
import { formatPrice, calculateDiscountPercent } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import RatingStars from '@/components/ui/RatingStars';

export default function ProductDetailClient({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const images = product.images && product.images.length > 0 ? product.images : [
    { id: 'def-1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80', alt: product.name }
  ];

  const [activeImage, setActiveImage] = useState(images[0].url);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  // Delivery Pincode checker state
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  // Review submission state
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', userName: '' });
  const [reviewsList, setReviewsList] = useState(product.reviews || []);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const currentPrice = selectedVariant?.price || product.salePrice || product.price;
  const originalPrice = product.price;
  const discountPercent = calculateDiscountPercent(originalPrice, currentPrice);
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariant);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariant);
    router.push('/checkout');
  };

  const checkPincode = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      const deliveryDays = Math.floor(Math.random() * 3) + 2;
      const date = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);
      const formatted = date.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      setPincodeResult({
        available: true,
        message: `Express Delivery by ${formatted}. Cash on delivery available.`,
      });
    } else {
      setPincodeResult({
        available: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          userName: reviewForm.userName || 'Verified Buyer',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewsList([data.review, ...reviewsList]);
        setReviewForm({ rating: 5, comment: '', userName: '' });
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch {
      // Failed
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-600 shadow-md transition-transform hover:scale-105"
            >
              <Heart size={22} className={isWishlisted ? 'fill-rose-600 text-rose-600' : ''} />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img.url
                      ? 'border-blue-600 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="space-y-6">
          <div>
            {product.category?.name && (
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {product.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">SKU: {product.sku}</p>

            <div className="mt-3 flex items-center gap-3">
              <RatingStars
                rating={product.rating || 4.9}
                reviewsCount={reviewsList.length}
                size={18}
              />
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {isOutOfStock ? 'Sold Out' : `In Stock (${availableStock} units)`}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              {formatPrice(currentPrice)}
            </span>
            {product.salePrice && product.salePrice < product.price && (
              <>
                <span className="text-base text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-full">
                  Save {formatPrice(product.price - currentPrice)}
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Choose {product.variants[0].name}:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-bold"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-sm font-bold text-slate-900 min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  disabled={quantity >= availableStock}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-bold disabled:text-slate-300"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  addedNotice
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]'
                }`}
              >
                {addedNotice ? (
                  <>
                    <Check size={18} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3.5 px-6 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30 active:scale-[0.99] disabled:bg-slate-300 disabled:shadow-none"
              >
                <Zap size={18} /> Buy Now
              </button>
            </div>
          </div>

          {/* Pincode & Delivery Checker */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <MapPin size={16} className="text-blue-600" /> Check Estimated Delivery:
            </div>
            <form onSubmit={checkPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Check
              </button>
            </form>
            {pincodeResult && (
              <p
                className={`text-xs mt-1 ${
                  pincodeResult.available ? 'text-emerald-600 font-semibold' : 'text-rose-600'
                }`}
              >
                {pincodeResult.message}
              </p>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <Truck size={18} className="mx-auto text-blue-600 mb-1" />
              <p className="text-[11px] font-semibold text-slate-800">Free Shipping</p>
              <p className="text-[10px] text-slate-500">Above ₹999</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <RefreshCw size={18} className="mx-auto text-emerald-600 mb-1" />
              <p className="text-[11px] font-semibold text-slate-800">7-Day Return</p>
              <p className="text-[10px] text-slate-500">Hassle-free</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <ShieldCheck size={18} className="mx-auto text-amber-600 mb-1" />
              <p className="text-[11px] font-semibold text-slate-800">1-Yr Warranty</p>
              <p className="text-[10px] text-slate-500">100% Genuine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Details Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Product Specifications & Features</h3>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {product.details || product.description}
        </p>
      </section>

      {/* Verified Reviews Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Verified Customer Reviews</h3>
            <p className="text-sm text-slate-500 mt-1">
              Overall rating: {product.rating || 4.9} out of 5 based on {reviewsList.length} verified reviews.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <RatingStars rating={product.rating || 4.9} size={22} showScore={false} />
          </div>
        </div>

        {/* Write Review Form */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-blue-600" /> Share Your Experience
          </h4>
          <form onSubmit={submitReview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={reviewForm.userName}
                  onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Below Average)</option>
                  <option value={1}>⭐ (1 - Poor)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Review Comments</label>
              <textarea
                rows={3}
                required
                placeholder="What did you like or dislike about this product?"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
            {reviewSuccess && (
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                Thank you! Your verified review has been published.
              </p>
            )}
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviewsList.map((rev) => (
            <div key={rev.id} className="p-5 rounded-2xl border border-slate-100 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{rev.userName}</span>
                  {rev.isVerified && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Verified Buyer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400" />
                  ))}
                </div>
              </div>
              {rev.title && <h5 className="font-bold text-sm text-slate-800">{rev.title}</h5>}
              <p className="text-sm text-slate-600 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
