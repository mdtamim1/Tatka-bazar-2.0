"use client";

import React from "react";
import Image from "next/image";
import { Printer, Download, ArrowLeft, CheckCircle2, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export interface InvoiceOrderData {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryArea?: string;
  deliverySlot?: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
    unit?: string;
  }[];
}

export function CashMemoInvoice({ order, backUrl = "/track" }: { order: InvoiceOrderData; backUrl?: string }) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const isPaid = order.paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center print:bg-white print:text-black print:p-0">
      
      {/* Top Action Bar (Hidden when printing) */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6 print:hidden">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold border border-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          ফিরে যান
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            ক্যাশ মেমো প্রিন্ট করুন (PDF)
          </button>
        </div>
      </div>

      {/* Printable Cash Memo Document */}
      <div
        id="printable-cash-memo"
        className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-6 print:rounded-none print:w-full print:max-w-none"
      >
        {/* Header with Logo & Brand Information */}
        <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-slate-200">
              <Image src="/logo.jpg" alt="Tatka Bazar" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-emerald-800 tracking-tight">তাতকা বাজার (Tatka Bazar)</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">১০০% তাজা, পুষ্টিকর ও নির্ভেজাল গ্রোসারি ডেলিভারি</p>
              <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 mt-1">
                <span>হটলাইন: ০১৭০০-০০০০০০</span>
                <span>ইমেইল: support@tatkabazar.com</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-black uppercase tracking-wider mb-2">
              অফিশিয়াল ক্যাশ মেমো / চালান
            </div>
            <div className="text-sm font-bold text-slate-900">অর্ডার নম্বর: #{order.orderNumber}</div>
            <div className="text-xs text-slate-500 mt-0.5">তারিখ: {order.createdAt}</div>
          </div>
        </div>

        {/* Customer & Delivery Information Grid */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 text-xs leading-relaxed">
          <div>
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">গ্রাহকের বিবরণ:</div>
            <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
            <div className="text-slate-700 font-medium">{order.customerPhone}</div>
            <div className="text-slate-600 mt-1">{order.customerAddress}</div>
            {order.deliveryArea && <div className="text-emerald-700 font-semibold mt-0.5">এলাকা: {order.deliveryArea}</div>}
          </div>

          <div className="text-right">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">পেমেন্ট ও ডেলিভারি বিবরণ:</div>
            <div className="flex items-center justify-end gap-2">
              <span className="font-semibold text-slate-700">পেমেন্ট মেথড:</span>
              <span className="font-bold text-slate-900">{order.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="font-semibold text-slate-700">পেমেন্ট স্ট্যাটাস:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                {isPaid ? "পরিশোধিত (PAID)" : "বকেয়া (COD - UNPAID)"}
              </span>
            </div>
            <div className="text-slate-600 mt-1">
              ডেলিভারি স্লট: <span className="font-medium text-slate-800">{order.deliverySlot || "Standard"}</span>
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <table className="w-full text-left text-xs mb-6 border-collapse">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-300 text-slate-700 font-bold">
              <th className="py-2.5 px-3 w-12 text-center">ক্রম</th>
              <th className="py-2.5 px-3">পণ্যের বিবরণ</th>
              <th className="py-2.5 px-3 text-center">পরিমাণ</th>
              <th className="py-2.5 px-3 text-right">একক মূল্য</th>
              <th className="py-2.5 px-3 text-right">মোট টাকা</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
            {order.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80">
                <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                <td className="py-2.5 px-3 text-center">{item.quantity} {item.unit || "টি"}</td>
                <td className="py-2.5 px-3 text-right">৳{item.price.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">৳{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation & Grand Total Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64 text-xs space-y-1.5 border-t-2 border-slate-300 pt-3">
            <div className="flex justify-between text-slate-600">
              <span>উপমোট (Subtotal):</span>
              <span className="font-semibold text-slate-800">৳{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-semibold text-slate-800">{order.deliveryFee === 0 ? "ফ্রি (৳০)" : `৳${order.deliveryFee}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>ডিসকাউন্ট:</span>
                <span>-৳{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-emerald-900 border-t-2 border-emerald-600 pt-2 mt-2">
              <span>সর্বমোট প্রদেয় টাকা:</span>
              <span className="text-base font-black">৳{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Terms, Verification & Signatures */}
        <div className="border-t border-slate-200 pt-6 mt-6 text-[11px] text-slate-500 flex items-end justify-between">
          <div className="max-w-md leading-relaxed">
            <p className="font-bold text-slate-700 mb-1">গুরুত্বপূর্ণ শর্তাবলি:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>ডেলিভারি গ্রহণের সময় রাইডারের উপস্থিতিতে পণ্যের গুণগত মান যাচাই করে নিন।</li>
              <li>পণ্য সংক্রান্ত কোনো অভিযোগ থাকলে তাৎক্ষণিকভাবে কাস্টমার কেয়ারে যোগাযোগ করুন।</li>
              <li>তাতকা বাজারের সাথে থাকার জন্য আপনাকে ধন্যবাদ!</li>
            </ul>
          </div>

          <div className="flex gap-12 text-center pt-8">
            <div>
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <span className="font-medium text-slate-600">গ্রাহকের স্বাক্ষর</span>
            </div>
            <div>
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <span className="font-medium text-slate-600">অনুমোদিত স্বাক্ষর</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[10px] text-slate-400 mt-6 border-t border-slate-100 pt-3">
          এটি একটি কম্পিউটার জেনারেটেড ডিজিটাল ইনভয়েস / ক্যাশ মেমো • Tatka Bazar E-Commerce Platform
        </div>
      </div>

      {/* Print CSS Styles */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, header, footer, .print\\:hidden {
            display: none !important;
          }
          #printable-cash-memo {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
