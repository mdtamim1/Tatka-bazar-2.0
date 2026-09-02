import Link from "next/link";
import { Store } from "lucide-react";

export default function VendorNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
        <div className="text-4xl font-black text-amber-400 mb-2">404</div>
        <h2 className="text-lg font-bold text-slate-100">Page Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          The requested vendor portal page does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl"
        >
          <Store className="w-4 h-4" />
          Go to Vendor Dashboard
        </Link>
      </div>
    </div>
  );
}
