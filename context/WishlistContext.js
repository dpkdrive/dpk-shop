'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dpk_wishlist');
      if (saved) {
        setWishlistIds(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dpk_wishlist', JSON.stringify(wishlistIds));
    } catch {
      // Ignore
    }
  }, [wishlistIds]);

  const toggleWishlist = async (productId) => {
    let nextIds = [];
    if (wishlistIds.includes(productId)) {
      nextIds = wishlistIds.filter((id) => id !== productId);
    } else {
      nextIds = [...wishlistIds, productId];
    }
    setWishlistIds(nextIds);

    // If logged in, inform backend
    if (user) {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      } catch {
        // Silently keep local state
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlistIds.includes(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
