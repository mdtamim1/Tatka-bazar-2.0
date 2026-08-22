import Link from "next/link";
import { Bike } from "lucide-react";

export default function RiderNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
        <div className="text-4xl font-black text-emerald-400 mb-2">৪০৪</div>
        <h2 className="text-lg font-bold text-slate-100">পৃষ্ঠাটি পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          রাইডার অ্যাপের এই লিঙ্কটি সঠিক নয়।
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl"
        >
          <Bike className="w-4 h-4" />
          রাইডার হোমপেজে যান
        </Link>
      </div>
    </div>
  );
}
