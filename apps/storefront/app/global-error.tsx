"use client";

export default function GlobalRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-slate-900 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-emerald-400 mb-2">তাতকা বাজার</h1>
          <h2 className="text-lg font-semibold text-slate-200 mb-4">সিস্টেমে সাময়িক সমস্যা হয়েছে</h2>
          <p className="text-xs text-slate-400 mb-6">
            অনুগ্রহ করে পুনরায় চেষ্টা করুন। আমাদের ইঞ্জিনিয়াররা বিষয়টি পর্যবেক্ষণ করছেন।
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm"
          >
            পুনরায় লোড করুন
          </button>
        </div>
      </body>
    </html>
  );
}
