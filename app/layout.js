import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'DPK Shop | Premium Lifestyle, Electronics & Modern Essentials',
  description:
    'Discover curated smartphones, acoustic headphones, ergonomic gear, luxury fashion, and accessories at DPK Shop with fast delivery across India.',
  keywords: 'ecommerce, online shopping, electronics, acoustics, audio, fashion, DPK Shop India',
  openGraph: {
    title: 'DPK Shop | Premium Online Shopping',
    description: 'Elevated lifestyle, acoustics, and electronics with Razorpay secure payments.',
    url: 'https://dpkshop.com',
    siteName: 'DPK Shop',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex flex-col min-h-full bg-slate-50 text-slate-900 antialiased font-sans">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AnnouncementBar />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
