import Link from "next/link";
import { Search, Home, ShoppingBag, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-slate-900/90 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 mb-2">
          ৪০৪
        </div>

        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
        </h2>
        <p className="text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
          আপনি যে পেজ বা পণ্যটি খুঁজছেন তা হয়তো সরানো হয়েছে বা লিংকটিতে কোনো ভুল রয়েছে।
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            তাতকা বাজার হোমপেজে যান
          </Link>

          <Link
            href="/category/vegetables"
            className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            তাজা শাকসবজি ও ফলমূল ব্রাউজ করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
