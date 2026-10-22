export const metadata = {
  title: 'Frequently Asked Questions | DPK Shop',
  description: 'Everything you need to know about payments, shipping, warranty, and returns at DPK Shop.',
};

export default function FAQPage() {
  const faqs = [
    {
      q: 'How long does shipping take within India?',
      a: 'We offer express delivery across all major metropolitan regions (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai) within 2 to 3 business days. For Tier-2 and Tier-3 cities, shipments typically arrive within 4 to 5 business days with end-to-end SMS & WhatsApp tracking.',
    },
    {
      q: 'Which payment options are supported?',
      a: 'Through our secure Razorpay integration, we accept all Indian payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, MasterCard, RuPay, American Express), NetBanking across 50+ banks, and Cash on Delivery (COD).',
    },
    {
      q: 'Are all products 100% genuine and covered by warranty?',
      a: 'Yes. Every product sold on DPK Shop is 100% brand authentic and sourced directly through authorized brand channels. Electronics and gadgets carry a standard 1-year replacement or brand warranty.',
    },
    {
      q: 'What is the return and replacement policy?',
      a: 'We provide a hassle-free 7-day replacement window for any item that arrives damaged, defective, or structurally different from the product description. Simply request a return through your account or contact our customer support team.',
    },
    {
      q: 'How do I use a coupon code?',
      a: 'You can apply any valid coupon code (e.g. WELCOME10 for 10% off or FLAT500 for ₹500 off) directly on the Cart page or during final Checkout. The discount will instantly reflect on your order summary.',
    },
    {
      q: 'Can I cancel or modify my order after placing it?',
      a: 'Orders can be modified or cancelled before they are marked as Dispatched. You can view order status in your Account > Orders dashboard or contact support immediately for instant assistance.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Customer Help Center
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-500">
          Find answers to the most common queries regarding DPK Shop orders and services.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-2"
          >
            <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
              <span className="text-blue-600 font-extrabold">Q.</span> {faq.q}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed pl-6">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
