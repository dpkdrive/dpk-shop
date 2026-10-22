export const metadata = {
  title: 'Privacy Policy | DPK Shop',
  description: 'How DPK Shop protects and respects your personal data and privacy.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Data We Collect</h2>
          <p>
            When you register, browse, or complete a checkout on DPK Shop, we collect essential operational data such as your name, delivery address, contact email, and telephone number solely to process your orders and communicate delivery updates.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Payment Data Security</h2>
          <p>
            DPK Shop <strong>never</strong> collects, processes, or stores your raw credit card numbers, CVV, or bank credentials. All financial transactions are tokenized and processed through PCI-DSS Level 1 compliant Razorpay payment infrastructure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Information Sharing Policy</h2>
          <p>
            We do not sell, rent, or trade your personal data with third-party advertisers. Information is strictly shared with authorized logistics carriers (e.g. BlueDart, Delhivery) exclusively to fulfill your doorstep package delivery.
          </p>
        </section>
      </div>
    </div>
  );
}
