export const metadata = {
  title: 'Shipping & Delivery Policy | DPK Shop',
  description: 'Shipping timelines, courier partners, and free express delivery policy at DPK Shop.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Free Delivery Threshold</h2>
          <p>
            DPK Shop provides <strong>Free Express Shipping</strong> across India on all prepaid orders exceeding <strong>₹999</strong>. For orders below ₹999, a nominal flat express shipping charge of ₹99 is applicable at checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Processing & Dispatch Timelines</h2>
          <p>
            Orders verified before 2:00 PM IST on business days are dispatched on the same day from our fulfillment centers. Orders placed after 2:00 PM or during national holidays will be shipped on the subsequent business day.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Estimated Transit Duration</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Tier 1 Metros</strong> (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai): 2 to 3 Business Days.</li>
            <li><strong>Tier 2 & 3 Cities</strong>: 3 to 5 Business Days.</li>
            <li><strong>Remote & North-Eastern regions</strong>: 5 to 7 Business Days.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Live Tracking & Courier Partners</h2>
          <p>
            We partner with certified tier-1 express logistics networks including <strong>BlueDart, Delhivery, and Xpressbees</strong>. As soon as your parcel is scanned at the hub, an automated tracking SMS and email containing your Airway Bill (AWB) number is triggered.
          </p>
        </section>
      </div>
    </div>
  );
}
