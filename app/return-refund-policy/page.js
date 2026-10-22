export const metadata = {
  title: 'Returns & Refund Policy | DPK Shop',
  description: 'Our 7-day hassle-free return and instant refund guarantee policy.',
};

export default function ReturnRefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Returns, Replacements & Refund Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. 7-Day Replacement Guarantee</h2>
          <p>
            Customer satisfaction is our highest commitment. If an item received is defective, physically damaged upon arrival, or has missing accessories, you may request a free replacement within <strong>7 days</strong> of delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Eligibility for Returns</h2>
          <p>
            To qualify for a valid return or exchange, the product must be in its original packaging with all included documentation, manuals, warranty cards, and accessories intact.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Refund Processing</h2>
          <p>
            For prepaid orders through Razorpay (UPI, Debit/Credit Card, NetBanking), refunds are initiated back to the source account within <strong>24 to 48 hours</strong> after physical inspection at our returns hub. Funds will reflect in your bank account in 3-5 business days.
          </p>
          <p>
            For Cash on Delivery (COD) orders, refunds are credited securely via UPI ID transfer or NEFT bank transfer upon receiving your verified bank details.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. How to Initiate a Return</h2>
          <p>
            Simply email <strong>support@dpkshop.com</strong> or call our helpline at <strong>+91 98765 43210</strong> with your Order Number and photo/video proof of the defect. Our courier partner will schedule a doorstep reverse pickup at zero additional cost to you.
          </p>
        </section>
      </div>
    </div>
  );
}
