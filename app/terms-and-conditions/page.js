export const metadata = {
  title: 'Terms & Conditions | DPK Shop',
  description: 'Terms of service, pricing, and purchase conditions for DPK Shop.',
};

export default function TermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Terms & Conditions of Service
        </h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or placing an order through DPK Shop ("dpkshop.com"), you agree to abide by these terms of service, all applicable laws and regulations in the Republic of India.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Pricing & Currency</h2>
          <p>
            All listed prices on DPK Shop are displayed in <strong>Indian Rupees (INR / ₹)</strong> and are inclusive of applicable Goods and Services Tax (GST) unless specified otherwise. We reserve the right to correct typographical pricing discrepancies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Order Acceptance & Inventory</h2>
          <p>
            Receipt of an order confirmation does not signify our final acceptance of your order. In rare events of unforeseen inventory exhaustion or logistics disruptions, we reserve the right to decline or cancel an order with immediate 100% refund.
          </p>
        </section>
      </div>
    </div>
  );
}
