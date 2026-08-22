"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, MessageSquare } from "lucide-react";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Storefront Route Error Captured]:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-slate-900/90 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          পৃষ্ঠাটি লোড হতে সমস্যা হয়েছে
        </h2>
        <p className="text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
          নেটওয়ার্ক ধীরগতি বা সাময়িক টেকনিক্যাল কারণে পেজটি খোলা যায়নি। আপনার কার্টের আইটেম ও ডেটা সম্পূর্ণ নিরাপদ রয়েছে।
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            পুনরায় চেষ্টা করুন (Retry)
          </button>

          <Link
            href="/"
            className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            হোমপেজে ফিরে যান
          </Link>

          <a
            href="https://wa.me/8801700000000?text=Hello%20Tatka%20Bazar%20Support"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1.5 pt-2 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            কাস্টমার কেয়ার হেল্পলাইন (হোয়াটসঅ্যাপ)
          </a>
        </div>
      </div>
    </div>
  );
}
