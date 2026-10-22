'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('dpk_cart');
      const savedCoupon = localStorage.getItem('dpk_coupon');
      if (savedCart) setCartItems(JSON.parse(savedCart));
      if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
    } catch {
      // Local storage unavailable
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('dpk_cart', JSON.stringify(cartItems));
        if (coupon) {
          localStorage.setItem('dpk_coupon', JSON.stringify(coupon));
        } else {
          localStorage.removeItem('dpk_coupon');
        }
      } catch {
        // Local storage quota exceeded or unavailable
      }
    }
  }, [cartItems, coupon, isInitialized]);

  const addToCart = (product, quantity = 1, variant = null) => {
    setCartItems((prevItems) => {
      const variantKey = variant ? variant.id || variant.value : null;
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product.id && item.variantId === variantKey
      );

      const price = variant?.price || product.salePrice || product.price;

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, product.stock || 99),
        };
        return updated;
      }

      return [
        ...prevItems,
        {
          productId: product.id,
          variantId: variantKey,
          variantName: variant ? `${variant.name}: ${variant.value}` : null,
          name: product.name,
          slug: product.slug,
          price: Number(price),
          originalPrice: Number(product.price),
          image: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          stock: product.stock || 10,
          quantity,
        },
      ];
    });
  };

  const updateQuantity = (productId, variantId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity: Math.min(newQuantity, item.stock || 99) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, variantId) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    setCouponError('');
  };

  const applyCoupon = async (code) => {
    setCouponError('');
    if (!code) {
      setCouponError('Please enter a coupon code');
      return false;
    }

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponError(data.message || 'Invalid coupon code');
        return false;
      }

      setCoupon(data);
      return true;
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
  };

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, subtotal);
  }

  const freeShippingThreshold = 999;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const tax = Math.round((subtotal - discount) * 0.18 * 100) / 100;
  const total = Math.max(0, subtotal - discount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        coupon,
        couponError,
        freeShippingThreshold,
        amountNeededForFreeShipping,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
