"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminOrderInvoicePage() {
  const params = useParams();
  const orderId = (params.id as string) || "";
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`http://localhost:4000/api/orders`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const found = json.data.find(
            (o: any) =>
              o.orderNumber?.toUpperCase() === orderId.toUpperCase() ||
              o.id === orderId
          );
          if (found) setOrder(found);
        }
      } catch (err) {
        console.warn("Invoice fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        <span>Preparing invoice / delivery challan...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-slate-200 mb-2">Order Not Found</h2>
        <Link href="/orders" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm">
          Return to Orders List
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentStatus === "PAID";
  const items = order.items && order.items.length > 0 ? order.items : [
    { name: "Tatka Fresh Grocery Package", quantity: 1, price: order.totalAmount, total: order.totalAmount }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center print:bg-white print:text-black print:p-0">
      
      {/* Top Action Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6 print:hidden">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold border border-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Orders
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          Print Invoice / PDF
        </button>
      </div>

      {/* Printable Invoice Document */}
      <div
        id="printable-cash-memo"
        className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-6 print:rounded-none print:w-full print:max-w-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-slate-200">
              <Image src="/logo.jpg" alt="Tatka Bazar" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-emerald-800 tracking-tight">Tatka Bazar</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Official Delivery Challan & Invoice</p>
              <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 mt-1">
                <span>Hotline: 01700-000000</span>
                <span>Email: billing@tatkabazar.com</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-black uppercase tracking-wider mb-2">
              DELIVERY CHALLAN / INVOICE
            </div>
            <div className="text-sm font-bold text-slate-900">Order #: {order.orderNumber}</div>
            <div className="text-xs text-slate-500 mt-0.5">Date: {order.createdAt}</div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 text-xs leading-relaxed">
          <div>
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Customer Details:</div>
            <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
            <div className="text-slate-700 font-medium">{order.customerPhone}</div>
            <div className="text-slate-600 mt-1">{order.customerAddress}</div>
            {order.deliveryArea && <div className="text-emerald-700 font-semibold mt-0.5">Area: {order.deliveryArea}</div>}
          </div>

          <div className="text-right">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Fulfillment & Payment:</div>
            <div className="flex items-center justify-end gap-2">
              <span className="font-semibold text-slate-700">Payment Method:</span>
              <span className="font-bold text-slate-900">{order.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="font-semibold text-slate-700">Payment Status:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                {isPaid ? "PAID" : "COD (UNPAID)"}
              </span>
            </div>
            {order.assignedRiderName && (
              <div className="text-slate-700 font-medium mt-1">
                Assigned Rider: <span className="font-bold text-emerald-800">{order.assignedRiderName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left text-xs mb-6 border-collapse">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-300 text-slate-700 font-bold">
              <th className="py-2.5 px-3 w-12 text-center">#</th>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
            {items.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50/80">
                <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                <td className="py-2.5 px-3 text-right">৳{item.price?.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">৳{item.total?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64 text-xs space-y-1.5 border-t-2 border-slate-300 pt-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">৳{(order.subtotal || order.totalAmount)?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-slate-800">{order.deliveryFee === 0 ? "Free (৳0)" : `৳${order.deliveryFee}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount:</span>
                <span>-৳{order.discount?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-emerald-900 border-t-2 border-emerald-600 pt-2 mt-2">
              <span>Total Payable Amount:</span>
              <span className="text-base font-black">৳{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="border-t border-slate-200 pt-6 mt-6 text-[11px] text-slate-500 flex items-end justify-between">
          <div className="max-w-md leading-relaxed">
            <p className="font-bold text-slate-700 mb-1">Official Note:</p>
            <p>Retain this challan copy for delivery verification and store records.</p>
          </div>

          <div className="flex gap-12 text-center pt-8">
            <div>
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <span className="font-medium text-slate-600">Customer Signature</span>
            </div>
            <div>
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <span className="font-medium text-slate-600">Admin / Packer</span>
            </div>
          </div>
        </div>
      </div>

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
          }
        }
      `}</style>
    </div>
  );
}
