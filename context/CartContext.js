'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [autoAppliedWelcome, setAutoAppliedWelcome] = useState(false);
  const [userDismissedCoupon, setUserDismissedCoupon] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const prevUserIdRef = useRef(undefined);

  // Helper to determine active localStorage key scoped to current user
  const getCartStorageKey = (userId) => (userId ? `dpk_cart_${userId}` : 'dpk_cart_guest');
  const getCouponStorageKey = (userId) => (userId ? `dpk_coupon_${userId}` : 'dpk_coupon_guest');

  // Handle user authentication changes & isolated cart loading
  useEffect(() => {
    if (authLoading) return;

    const currentUserId = user?.id || null;
    const isUserSwitch = prevUserIdRef.current !== undefined && prevUserIdRef.current !== currentUserId;
    prevUserIdRef.current = currentUserId;

    const loadCartForSession = async () => {
      // Clean legacy shared keys to prevent old cross-user leaks
      try {
        localStorage.removeItem('dpk_cart');
        localStorage.removeItem('dpk_coupon');
      } catch {
        // Ignore
      }

      if (currentUserId) {
        // User is logged in
        let localItems = [];
        try {
          const savedCart = localStorage.getItem(getCartStorageKey(currentUserId));
          const savedCoupon = localStorage.getItem(getCouponStorageKey(currentUserId));
          if (savedCart) localItems = JSON.parse(savedCart);
          if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
        } catch {
          // Ignore
        }

        // Check if there were items in guest cart to transfer upon login
        try {
          const guestCart = localStorage.getItem('dpk_cart_guest');
          if (guestCart) {
            const guestItems = JSON.parse(guestCart);
            if (Array.isArray(guestItems) && guestItems.length > 0 && localItems.length === 0) {
              localItems = guestItems;
            }
            localStorage.removeItem('dpk_cart_guest');
            localStorage.removeItem('dpk_coupon_guest');
          }
        } catch {
          // Ignore
        }

        setCartItems(localItems);

        // Sync with backend API
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.items) && data.items.length > 0) {
              setCartItems(data.items);
              try {
                localStorage.setItem(getCartStorageKey(currentUserId), JSON.stringify(data.items));
              } catch {}
            } else if (localItems.length > 0) {
              // Push local items to server
              fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: localItems }),
              }).catch(() => {});
            }
          }
        } catch (err) {
          console.error('Failed to sync cart with server:', err);
        }
      } else {
        // Guest mode (or user logged out)
        if (isUserSwitch) {
          // User just logged out: clear state and guest cart
          setCartItems([]);
          setCoupon(null);
          setAutoAppliedWelcome(false);
          setUserDismissedCoupon(false);
          try {
            localStorage.removeItem('dpk_cart_guest');
            localStorage.removeItem('dpk_coupon_guest');
          } catch {}
        } else {
          // Normal guest mount
          try {
            const savedCart = localStorage.getItem('dpk_cart_guest');
            const savedCoupon = localStorage.getItem('dpk_coupon_guest');
            if (savedCart) setCartItems(JSON.parse(savedCart));
            if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
          } catch {}
        }
      }

      setIsInitialized(true);
    };

    loadCartForSession();
  }, [user, authLoading]);

  // Save to user-scoped localStorage & sync to server on changes
  useEffect(() => {
    if (!isInitialized || authLoading) return;

    const cartKey = getCartStorageKey(user?.id);
    const couponKey = getCouponStorageKey(user?.id);

    try {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
      if (coupon) {
        localStorage.setItem(couponKey, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(couponKey);
      }
    } catch {
      // Local storage unavailable or quota exceeded
    }

    // If user is authenticated, sync to backend database
    if (user?.id) {
      const timer = setTimeout(() => {
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cartItems }),
        }).catch(() => {});
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [cartItems, coupon, isInitialized, user?.id, authLoading]);

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Auto-apply WELCOME10 coupon when order exceeds ₹999
  useEffect(() => {
    if (!isInitialized || subtotal === 0) return;

    if (subtotal >= 999) {
      // If no coupon is applied and user hasn't explicitly dismissed it, auto-apply WELCOME10
      if (!coupon && !userDismissedCoupon) {
        const autoApply = async () => {
          try {
            const res = await fetch('/api/coupons/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: 'WELCOME10', subtotal }),
            });
            const data = await res.json();
            if (res.ok && data.valid) {
              setCoupon(data);
              setAutoAppliedWelcome(true);
              setCouponError('');
            }
          } catch {
            // Silently ignore auto-apply network failure
          }
        };
        autoApply();
      }
    } else {
      // If subtotal drops below 999 and WELCOME10 was auto-applied, remove it cleanly
      if (coupon?.code === 'WELCOME10' && autoAppliedWelcome) {
        setCoupon(null);
        setAutoAppliedWelcome(false);
      }
    }
  }, [subtotal, coupon, userDismissedCoupon, autoAppliedWelcome, isInitialized]);

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

  const clearCart = async () => {
    setCartItems([]);
    setCoupon(null);
    setCouponError('');
    setAutoAppliedWelcome(false);
    setUserDismissedCoupon(false);

    try {
      const cartKey = getCartStorageKey(user?.id);
      const couponKey = getCouponStorageKey(user?.id);
      localStorage.removeItem(cartKey);
      localStorage.removeItem(couponKey);
      localStorage.removeItem('dpk_cart');
      localStorage.removeItem('dpk_coupon');
    } catch {}

    if (user?.id) {
      try {
        await fetch('/api/cart', { method: 'DELETE' });
      } catch {}
    }
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
        body: JSON.stringify({ code: code.trim().toUpperCase(), subtotal }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponError(data.message || 'Invalid coupon code');
        return false;
      }

      setCoupon(data);
      setAutoAppliedWelcome(false);
      setUserDismissedCoupon(false);
      return true;
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
    setAutoAppliedWelcome(false);
    setUserDismissedCoupon(true);
  };

  // Discount calculation
  let discount = 0;
  if (coupon) {
    const minSpend = coupon.minSpend || coupon.coupon?.minSpend || 0;
    if (subtotal >= minSpend) {
      const dType = coupon.discountType || coupon.coupon?.discountType;
      const dValue = coupon.discountValue || coupon.coupon?.discountValue || 0;
      const maxDiscount = coupon.maxDiscount || coupon.coupon?.maxDiscount;

      if (dType === 'PERCENTAGE') {
        discount = (subtotal * dValue) / 100;
        if (maxDiscount && discount > maxDiscount) {
          discount = maxDiscount;
        }
      } else {
        discount = dValue;
      }
      discount = Math.min(discount, subtotal);
    }
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
        autoAppliedWelcome,
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
