"use client";

export default function GlobalRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-slate-900 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-emerald-400 mb-2">Tatka Bazar</h1>
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Something went wrong</h2>
          <p className="text-xs text-slate-400 mb-6">
            An unexpected error occurred. Please try reloading the page.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm"
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
