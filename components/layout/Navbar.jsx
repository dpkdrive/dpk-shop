'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Package,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'All Products', href: '/products' },
    { label: 'Electronics', href: '/products?category=electronics' },
    { label: 'Audio', href: '/products?category=audio' },
    { label: 'Fashion', href: '/products?category=fashion' },
    { label: 'Home', href: '/products?category=home-workspace' },
    { label: 'Accessories', href: '/products?category=accessories' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 bg-white border-b ${
        isScrolled ? 'shadow-sm border-slate-200/80 bg-white/95 backdrop-blur-md' : 'border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black tracking-wider text-lg shadow-md group-hover:bg-blue-600 transition-colors">
              DPK
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                DPK <span className="text-blue-600 group-hover:text-slate-900 transition-colors">SHOP</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 uppercase font-medium -mt-1 hidden sm:block">
                Premium Store
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-6 relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
              />
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </form>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors"
              title="Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-blue-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-full sm:rounded-xl transition-all border border-transparent hover:border-slate-200"
                aria-label="User account menu"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <User size={18} />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[100px]">
                    {user ? user.name.split(' ')[0] : 'Sign In'}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none">
                    {user ? (user.role === 'ADMIN' ? 'Admin' : 'Account') : 'Account'}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                        <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <ShieldCheck size={18} />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        href="/account"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User size={18} className="text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package size={18} className="text-slate-400" />
                        <span>My Orders</span>
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900">Welcome to DPK Shop</p>
                        <p className="text-xs text-slate-500">Access orders, cart & wishlist</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          href="/login"
                          className="block w-full py-2 text-center text-sm font-semibold text-white bg-slate-900 hover:bg-blue-600 rounded-xl transition-colors shadow-sm"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          className="block w-full py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          Create Account
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Bar - Desktop */}
        <nav className="hidden lg:flex items-center space-x-8 py-3 border-t border-slate-100 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-blue-600 transition-colors relative py-1 ${
                pathname === link.href ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <ShoppingBag size={13} /> 100% Genuine Brands
            </span>
            <Link href="/about" className="hover:text-slate-900 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">
              Help & Support
            </Link>
          </div>
        </nav>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
              Shop Categories
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
              Account & Help
            </p>
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/account"
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  My Profile
                </Link>
                <Link
                  href="/account/orders"
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Order History
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  className="text-center py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-center py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
