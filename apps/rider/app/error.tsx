"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Bike } from "lucide-react";

export default function RiderErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Rider App Error]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">রাইডার অ্যাপে ত্রুটি</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          অর্ডারের লোকেশন বা ডেটা লোড হতে সাময়িক সমস্যা হয়েছে।
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            রিফ্রেশ
          </button>
          <Link
            href="/"
            className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2"
          >
            <Bike className="w-4 h-4" />
            ডেলিভারি ড্রয়ার
          </Link>
        </div>
      </div>
    </div>
  );
}
