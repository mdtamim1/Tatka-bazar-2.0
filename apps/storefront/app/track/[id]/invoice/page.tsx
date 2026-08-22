"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CashMemoInvoice, InvoiceOrderData } from "@/components/invoice/CashMemoInvoice";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function CustomerOrderInvoicePage() {
  const params = useParams();
  const orderId = (params.id as string) || "";
  const [orderData, setOrderData] = useState<InvoiceOrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`http://localhost:4000/api/orders`);
        const json = await res.json();
        if (json.success && json.data) {
          const found = json.data.find(
            (o: any) =>
              o.orderNumber?.toUpperCase() === orderId.toUpperCase() ||
              o.id === orderId ||
              o.customerPhone === orderId
          );

          if (found) {
            setOrderData({
              orderNumber: found.orderNumber,
              createdAt: found.createdAt || new Date().toLocaleDateString("en-GB"),
              customerName: found.customerName || "Customer",
              customerPhone: found.customerPhone || "",
              customerAddress: found.customerAddress || "Dhaka, Bangladesh",
              deliveryArea: found.deliveryArea,
              deliverySlot: found.deliverySlot,
              paymentMethod: found.paymentMethod || "COD",
              paymentStatus: found.paymentStatus || "PENDING",
              status: found.status || "PENDING",
              subtotal: found.subtotal || found.totalAmount,
              deliveryFee: found.deliveryFee || 0,
              discount: found.discount || 0,
              totalAmount: found.totalAmount,
              items: found.items && found.items.length > 0
                ? found.items.map((it: any) => ({
                    name: it.name,
                    quantity: it.quantity,
                    price: it.price,
                    total: it.total,
                    unit: "টি",
                  }))
                : [
                    {
                      name: "তাজা দেশি শাকসবজি ও ফলমূল",
                      quantity: 1,
                      price: found.totalAmount,
                      total: found.totalAmount,
                      unit: "প্যাকেজ",
                    },
                  ],
            });
          }
        }
      } catch (err) {
        console.warn("Invoice fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        <span>ক্যাশ মেমো লোড হচ্ছে...</span>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-slate-200 mb-2">অর্ডারটি পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-400 mb-6">অনুগ্রহ করে সঠিক অর্ডার নম্বর দিয়ে আবার চেষ্টা করুন।</p>
        <Link href="/track" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm">
          অর্ডার ট্র্যাকিংয়ে যান
        </Link>
      </div>
    );
  }

  return <CashMemoInvoice order={orderData} backUrl={`/track/${orderId}`} />;
}
