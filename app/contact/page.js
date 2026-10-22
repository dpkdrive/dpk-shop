'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="max-w-2xl mx-auto text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          We're Here to Help
        </h1>
        <p className="text-sm text-slate-500">
          Have a question about an order, shipment, or product details? Reach out to our dedicated support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Mail size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Email Support</h3>
              <p className="text-xs text-slate-500 mt-0.5">support@dpkshop.com</p>
              <p className="text-xs text-slate-400 mt-1">Average response within 4 hours</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Phone size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Customer Helpline</h3>
              <p className="text-xs text-slate-500 mt-0.5">+91 98765 43210</p>
              <p className="text-xs text-slate-400 mt-1">Toll-free across India</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Operational Hours</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monday to Saturday</p>
              <p className="text-xs text-slate-400 mt-1">9:00 AM – 8:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Send Us a Direct Message</h2>

          {sent ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <CheckCircle2 size={40} className="text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900">Message Delivered!</h3>
              <p className="text-sm text-emerald-700">
                Thank you for contacting DPK Shop. Our support specialist will respond to your email within 4 business hours.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Deshmukh"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order Tracking Enquiry / Product Compatibility"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Details *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe how we can assist you..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center gap-2"
              >
                <Send size={16} /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
