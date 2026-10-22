'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your email and we'll send a password recovery reset link.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-900">Recovery Instructions Sent</h3>
            <p className="text-xs text-emerald-700">
              We have dispatched a password reset link to <strong className="text-emerald-900">{email}</strong>. Check your inbox and follow the steps.
            </p>
            <Link
              href="/login"
              className="inline-block mt-3 text-xs font-bold text-blue-600 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              Send Reset Link <ArrowRight size={16} />
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-slate-500 hover:text-slate-900">
                Remember your password? <span className="text-blue-600 font-bold">Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
