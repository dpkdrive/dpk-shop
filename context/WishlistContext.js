'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState([]);
  const { user, loading: authLoading } = useAuth();
  const prevUserIdRef = useRef(undefined);

  const getWishlistKey = (userId) => (userId ? `dpk_wishlist_${userId}` : 'dpk_wishlist_guest');

  useEffect(() => {
    if (authLoading) return;

    const currentUserId = user?.id || null;
    const isUserSwitch = prevUserIdRef.current !== undefined && prevUserIdRef.current !== currentUserId;
    prevUserIdRef.current = currentUserId;

    // Clean up legacy shared key
    try {
      localStorage.removeItem('dpk_wishlist');
    } catch {}

    const loadWishlist = async () => {
      if (currentUserId) {
        let localIds = [];
        try {
          const saved = localStorage.getItem(getWishlistKey(currentUserId));
          if (saved) localIds = JSON.parse(saved);
        } catch {}
        setWishlistIds(localIds);

        // Fetch user's wishlist from server
        try {
          const res = await fetch('/api/wishlist');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.wishlist)) {
              const serverIds = data.wishlist.map((item) => item.id);
              setWishlistIds(serverIds);
              try {
                localStorage.setItem(getWishlistKey(currentUserId), JSON.stringify(serverIds));
              } catch {}
            }
          }
        } catch {}
      } else {
        if (isUserSwitch) {
          // Logged out
          setWishlistIds([]);
          try {
            localStorage.removeItem('dpk_wishlist_guest');
          } catch {}
        } else {
          try {
            const saved = localStorage.getItem('dpk_wishlist_guest');
            if (saved) setWishlistIds(JSON.parse(saved));
          } catch {}
        }
      }
    };

    loadWishlist();
  }, [user, authLoading]);

  useEffect(() => {
    if (authLoading) return;
    try {
      localStorage.setItem(getWishlistKey(user?.id), JSON.stringify(wishlistIds));
    } catch {
      // Ignore
    }
  }, [wishlistIds, user?.id, authLoading]);

  const toggleWishlist = async (productId) => {
    let nextIds = [];
    if (wishlistIds.includes(productId)) {
      nextIds = wishlistIds.filter((id) => id !== productId);
    } else {
      nextIds = [...wishlistIds, productId];
    }
    setWishlistIds(nextIds);

    // If logged in, update backend
    if (user?.id) {
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
