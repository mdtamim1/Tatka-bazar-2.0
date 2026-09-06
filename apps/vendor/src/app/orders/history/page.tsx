"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  Search,
  ArrowLeft,
  Calendar,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  RotateCcw,
  Bike,
  Clock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Wallet,
  ChevronDown,
  X,
  FileText,
  AlertTriangle,
  ChevronRight,
  Eye,
  CreditCard,
  Building2,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Order, OrderStatus } from "@/types/vendor";
import { translations } from "@/utils/translations";

export default function OrderHistoryPage() {
  const { language, profile, orderHistory, orders, setTrackingOrder } = useVendorStore();
  const t = translations[language];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "7DAYS" | "30DAYS">("ALL");
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Combine both active and archived order history, removing duplicates by id
  const allOrdersCombined = useMemo(() => {
    const map = new Map<string, Order>();
    // First add orderHistory
    (orderHistory || []).forEach((o) => map.set(o.id, o));
    // Overlay any current active orders in store
    (orders || []).forEach((o) => map.set(o.id, o));
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orderHistory, orders]);

  // Filter pipeline
  const filteredOrders = useMemo(() => {
    return allOrdersCombined.filter((order) => {
      // 1. Search Query: matches displayId (e.g. TB-8492 or 8492), deliveryZone, customerName, or item names
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const displayMatch = order.displayId.toLowerCase().includes(q);
        const idMatch = order.id.toLowerCase().includes(q);
        const zoneMatch = (order.deliveryZone || "").toLowerCase().includes(q);
        const itemMatch = order.items.some(
          (item) =>
            item.productName.toLowerCase().includes(q) ||
            item.productNameBn.toLowerCase().includes(q)
        );
        const riderMatch = (order.riderName || "").toLowerCase().includes(q);

        if (!displayMatch && !idMatch && !zoneMatch && !itemMatch && !riderMatch) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "IN_TRANSIT") {
          if (order.status !== "READY_FOR_PICKUP" && order.status !== "HANDED_TO_RIDER") {
            return false;
          }
        } else if (order.status !== statusFilter) {
          return false;
        }
      }

      // 3. Date Filter
      if (dateFilter !== "ALL") {
        const orderTime = new Date(order.createdAt).getTime();
        const now = Date.now();
        if (dateFilter === "TODAY") {
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          if (orderTime < oneDayAgo) return false;
        } else if (dateFilter === "7DAYS") {
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (orderTime < sevenDaysAgo) return false;
        } else if (dateFilter === "30DAYS") {
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (orderTime < thirtyDaysAgo) return false;
        }
      }

      return true;
    });
  }, [allOrdersCombined, searchQuery, statusFilter, dateFilter]);

  // KPI Metrics Calculation
  const totalCount = allOrdersCombined.length;
  const completedCount = allOrdersCombined.filter((o) => o.status === "COMPLETED").length;
  const returnedCount = allOrdersCombined.filter((o) => o.status === "RETURNED").length;
  const totalGrossSales = allOrdersCombined
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.grossTotal, 0);
  const totalNetEarnings = allOrdersCombined
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.netTotal, 0);

  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-16">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1.5">
            <Link
              href="/orders"
              className="flex items-center gap-1 hover:text-emerald-700 font-semibold transition-colors"
            >
              <ArrowLeft size={14} />
              <span>{language === "bn" ? "বর্তমান অর্ডার কিউ" : "Active Orders"}</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">
              {language === "bn" ? "অর্ডার হিস্ট্রি" : "Order History"}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <History size={24} className="text-emerald-600 shrink-0" />
              <span>{language === "bn" ? "সকল অর্ডার হিস্ট্রি ও আর্কাইভ" : "Order History & Archive"}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {language === "bn" ? `মোট ${totalCount} টি রেকর্ড` : `${totalCount} Records`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === "bn"
              ? "অর্ডার নাম্বার দিয়ে যেকোনো পূর্ববর্তী অর্ডার সার্চ করুন এবং চালান/রসিদ প্রিন্ট করুন • গ্রাহকের ব্যক্তিগত তথ্য সুরক্ষিত"
              : "Search any historical order by display ID and print receipts • Customer address shielded for privacy"}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/orders"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <ShoppingBag size={15} />
            <span>{language === "bn" ? "লাইভ অর্ডার প্যানেল" : "Live Orders Queue"}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Orders */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{language === "bn" ? "মোট অর্ডার" : "Total Orders"}</span>
            <ShoppingBag size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-900">
            {totalCount}
            <span className="text-xs font-normal text-slate-500 ml-1">টি</span>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold">{language === "bn" ? "সফলভাবে সম্পন্ন" : "Completed"}</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-800">
            {completedCount}
            <span className="text-xs font-normal text-emerald-600 ml-1">টি</span>
          </div>
        </div>

        {/* Returned Orders */}
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-bold">{language === "bn" ? "রিটার্নড অর্ডার" : "Returned"}</span>
            <RotateCcw size={16} className="text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-rose-800">
            {returnedCount}
            <span className="text-xs font-normal text-rose-600 ml-1">টি</span>
          </div>
        </div>

        {/* Total Gross Sales */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">{language === "bn" ? "মোট গ্রস বিক্রি" : "Gross Sales"}</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-900">
            ৳{totalGrossSales.toLocaleString()}
          </div>
        </div>

        {/* Net Vendor Earnings */}
        <div className="p-4 rounded-2xl bg-emerald-700 text-white shadow-xs">
          <div className="flex items-center justify-between text-emerald-200">
            <span className="text-xs font-bold">{language === "bn" ? "ভেন্ডর নেট আয়" : "Net Earnings"}</span>
            <Wallet size={16} className="text-emerald-200" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-white">
            ৳{totalNetEarnings.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "bn"
                  ? "অর্ডার নাম্বার দিয়ে সার্চ করুন (যেমন: TB-8492, TB-8488, TB-8450) অথবা পণ্যের নাম..."
                  : "Search by Order Number (e.g., TB-8492, TB-8488, TB-8450) or product name..."
              }
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Date Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto shrink-0 overflow-x-auto">
            {(
              [
                { id: "ALL", labelBn: "সব সময়", labelEn: "All Time" },
                { id: "TODAY", labelBn: "আজকে", labelEn: "Today" },
                { id: "7DAYS", labelBn: "গত ৭ দিন", labelEn: "7 Days" },
                { id: "30DAYS", labelBn: "গত ৩০ দিন", labelEn: "30 Days" },
              ] as const
            ).map((df) => (
              <button
                key={df.id}
                onClick={() => setDateFilter(df.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  dateFilter === df.id
                    ? "bg-white text-emerald-800 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {language === "bn" ? df.labelBn : df.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 text-xs">
          <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1 text-[11px]">
            <Filter size={13} />
            <span>{language === "bn" ? "স্ট্যাটাস:" : "Status:"}</span>
          </span>

          {[
            { id: "ALL", labelBn: "সকল অর্ডার", labelEn: "All Status" },
            { id: "COMPLETED", labelBn: "সম্পন্ন", labelEn: "Completed", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { id: "RETURNED", labelBn: "রিটার্নড", labelEn: "Returned", color: "text-rose-700 bg-rose-50 border-rose-200" },
            { id: "IN_TRANSIT", labelBn: "রাইডারের কাছে / ডেলিভারি চলছে", labelEn: "With Rider / In Transit", color: "text-purple-700 bg-purple-50 border-purple-200" },
            { id: "CANCELLED", labelBn: "বাতিল", labelEn: "Cancelled", color: "text-slate-600 bg-slate-100 border-slate-200" },
          ].map((sf) => (
            <button
              key={sf.id}
              onClick={() => setStatusFilter(sf.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                statusFilter === sf.id
                  ? "bg-slate-900 text-white border-slate-900 font-bold shadow-2xs"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {language === "bn" ? sf.labelBn : sf.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Results Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          {searchQuery ? (
            <span>
              {language === "bn"
                ? `"${searchQuery}" এর জন্য পাওয়া গেছে: ${filteredOrders.length} টি অর্ডার`
                : `Found ${filteredOrders.length} orders matching "${searchQuery}"`}
            </span>
          ) : (
            <span>
              {language === "bn"
                ? `প্রদর্শিত হচ্ছে: ${filteredOrders.length} টি অর্ডার`
                : `Showing ${filteredOrders.length} orders`}
            </span>
          )}
        </div>
        {(searchQuery || statusFilter !== "ALL" || dateFilter !== "ALL") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
              setDateFilter("ALL");
            }}
            className="text-emerald-700 hover:text-emerald-800 font-bold text-xs underline"
          >
            {language === "bn" ? "ফিল্টার রিসেট করুন" : "Reset Filters"}
          </button>
        )}
      </div>

      {/* Orders History List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
            <History size={26} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {language === "bn" ? "কোনো অর্ডার পাওয়া যায়নি" : "No orders found"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === "bn"
              ? "আপনার সার্চ ফিল্টারের সাথে মিলে এমন কোনো পূর্ববর্তী অর্ডার রেকর্ড নেই। অন্য কোনো অর্ডার নম্বর বা শব্দ লিখে চেষ্টা করুন।"
              : "No past orders matched your search criteria. Try clearing filters or searching for another Order ID."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
              setDateFilter("ALL");
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs"
          >
            {language === "bn" ? "সব অর্ডার দেখুন" : "View All Orders"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCompleted = order.status === "COMPLETED";
            const isReturned = order.status === "RETURNED";
            const isInTransit =
              order.status === "READY_FOR_PICKUP" || order.status === "HANDED_TO_RIDER";

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md"
              >
                {/* Order Top Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Display ID */}
                    <span className="font-mono text-sm font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      #{order.displayId}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isReturned
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : isInTransit
                          ? "bg-purple-100 text-purple-800 border border-purple-300"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {isCompleted
                        ? language === "bn"
                          ? "✓ ডেলিভারি সম্পন্ন"
                          : "Completed"
                        : isReturned
                        ? language === "bn"
                          ? "✕ ফেরত / রিটার্নড"
                          : "Returned"
                        : isInTransit
                        ? language === "bn"
                          ? "ডেলিভারি চলছে"
                          : "In Transit"
                        : order.status}
                    </span>

                    {/* Order Date */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium ml-1">
                      <Calendar size={13} className="text-slate-400" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Total in Header */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-lg font-black font-mono text-slate-900">
                        ৳{order.grossTotal.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        নেট ভেন্ডর: <strong className="text-emerald-700 font-mono">৳{order.netTotal.toLocaleString()}</strong> ({order.paymentMethod})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Privacy Mask & Zone */}
                <div className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 px-3.5 rounded-xl my-3 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">{order.customerName}</span>
                      <span className="text-slate-500 ml-2">
                        • জোন: <strong className="text-slate-800">{order.deliveryZone || "মিরপুর জোন"}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <span>🔒 গ্রাহকের ঠিকানা ও ফোন গোপনীয়</span>
                  </div>
                </div>

                {/* Returned Warning if any */}
                {isReturned && order.returnReason && (
                  <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">
                        {language === "bn" ? "রিটার্নের কারণ:" : "Return Reason:"}
                      </p>
                      <p className="text-[11px] text-rose-800 mt-0.5">{order.returnReason}</p>
                    </div>
                  </div>
                )}

                {/* Line Items Table */}
                <div className="divide-y divide-slate-100 text-xs my-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {language === "bn" ? item.productNameBn : item.productName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {item.pricingType === "WEIGHT_BASED" ? (
                            <span className="text-emerald-700 font-semibold">
                              ওজন: {item.weightActual || item.weightOrdered} {item.unit} @ ৳{item.unitPrice}/{item.unit}
                            </span>
                          ) : (
                            <span>
                              পরিমাণ: {item.quantity} {item.unit} @ ৳{item.unitPrice}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="text-right font-mono font-bold text-slate-900 shrink-0">
                        ৳{item.finalPrice.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assigned Rider Info (if present) */}
                {order.riderName && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Bike size={13} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{order.riderName}</span>
                        {order.riderVehicle && (
                          <span className="text-[11px] text-slate-500 ml-1.5">
                            ({order.riderVehicle})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Live Track Trigger for In-transit */}
                    {isInTransit && (
                      <button
                        onClick={() => setTrackingOrder(order)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-2xs transition-all"
                      >
                        <Bike size={12} />
                        <span>{language === "bn" ? "লাইভ ট্র্যাক" : "Track Rider"}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-slate-500 font-mono">
                    কমিশন: {order.commissionRate}% (৳{order.commissionAmount.toFixed(1)}) • নেট: ৳{order.netTotal.toLocaleString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <FileText size={13} className="text-emerald-600" />
                      <span>{language === "bn" ? "রসিদ ও মেমো" : "View Receipt"}</span>
                    </button>

                    {isInTransit && (
                      <button
                        onClick={() => setTrackingOrder(order)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Bike size={13} />
                        <span>{language === "bn" ? "লাইভ ট্র্যাক করুন" : "Live Track"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="text-emerald-600" size={18} />
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === "bn" ? "অর্ডার চালান / মেমো" : "Order Receipt & Invoice"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Slip Content */}
            <div id="printable-receipt" className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 font-mono">
              {/* Slip Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h2 className="text-base font-black text-emerald-800">তাতকা বাজার</h2>
                <p className="text-[10px] text-slate-600 font-sans">
                  {profile.storeNameBn || profile.storeName}
                </p>
                <p className="text-[10px] text-slate-400 font-sans">
                  লাইসেন্স: {profile.tradeLicense}
                </p>
                <div className="mt-2 text-[11px] font-bold text-slate-800">
                  অর্ডার নং: #{selectedReceiptOrder.displayId}
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(selectedReceiptOrder.createdAt).toLocaleString("bn-BD")}
                </div>
              </div>

              {/* Delivery info (privacy preserved) */}
              <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
                <div>
                  <span className="text-slate-500">গ্রাহক:</span>{" "}
                  <strong>{selectedReceiptOrder.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">ডেলিভারি এলাকা:</span>{" "}
                  <strong>{selectedReceiptOrder.deliveryZone || "মিরপুর জোন"}</strong>
                </div>
                <div>
                  <span className="text-slate-500">পেমেন্ট:</span>{" "}
                  <strong>{selectedReceiptOrder.paymentMethod}</strong> (
                  {selectedReceiptOrder.paymentStatus === "PAID" ? "পরিশোধিত" : "বাকি"})
                </div>
              </div>

              {/* Items List */}
              <div className="py-2 border-b border-dashed border-slate-300 space-y-2">
                <div className="flex justify-between font-bold text-slate-700 text-[10px]">
                  <span>পণ্য বিবরণ</span>
                  <span>মূল্য</span>
                </div>
                {selectedReceiptOrder.items.map((i) => (
                  <div key={i.id} className="flex justify-between items-start text-[11px]">
                    <div className="pr-2">
                      <p className="font-sans font-semibold text-slate-900">
                        {language === "bn" ? i.productNameBn : i.productName}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        {i.pricingType === "WEIGHT_BASED"
                          ? `${i.weightActual || i.weightOrdered} ${i.unit} × ৳${i.unitPrice}`
                          : `${i.quantity} ${i.unit} × ৳${i.unitPrice}`}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">৳{i.finalPrice.toFixed(1)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>গ্রস মোট:</span>
                  <span>৳{selectedReceiptOrder.grossTotal.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>তাতকা প্ল্যাটফর্ম ফি ({selectedReceiptOrder.commissionRate}%):</span>
                  <span>- ৳{selectedReceiptOrder.commissionAmount.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold text-sm pt-1 border-t border-slate-200">
                  <span>ভেন্ডর নেট পেআউট:</span>
                  <span>৳{selectedReceiptOrder.netTotal.toFixed(1)}</span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-3 text-[10px] text-slate-400 font-sans border-t border-dashed border-slate-300">
                <p>তাতকা বাজার ভেন্ডর নেটওয়ার্কের অংশ হওয়ার জন্য ধন্যবাদ</p>
                <p className="text-[9px] mt-0.5">🔒 গোপনীয়তা নীতি অনুযায়ী গ্রাহকের ঠিকানা রক্ষিত</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {language === "bn" ? "বন্ধ করুন" : "Close"}
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <Printer size={14} />
                <span>{language === "bn" ? "প্রিন্ট চালান" : "Print Invoice"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
