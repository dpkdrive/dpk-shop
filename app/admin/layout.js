import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | DPK Shop',
};

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  // Protect Admin Area
  if (!user || user.role !== 'ADMIN') {
    redirect('/login?error=admin_required');
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Admin Brand */}
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                DPK
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  DPK <span className="text-purple-400">ADMIN</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block -mt-1">
                  Control Center
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Icon size={18} className="text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <ShieldCheck size={16} className="text-purple-400" />
            <span className="truncate">{user.name}</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <span>View Public Store</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
