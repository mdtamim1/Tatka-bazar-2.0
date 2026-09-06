"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface DepositItem {
  id: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  amount: number;
  paymentMethod?: string;
  lastFour: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt?: string;
  adminNote?: string;
}

const SAMPLE_PENDING_DEPOSITS: DepositItem[] = [
  {
    id: "dep-demo-01",
    riderId: "rider-demo-01",
    riderName: "তামীম ইকবাল",
    riderPhone: "01700000001",
    amount: 1500,
    paymentMethod: "bKash",
    lastFour: "5678",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "dep-demo-02",
    riderId: "rider-demo-02",
    riderName: "রাকিবুল হাসান",
    riderPhone: "01822334455",
    amount: 850,
    paymentMethod: "Nagad",
    lastFour: "9012",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "dep-demo-03",
    riderId: "rider-demo-03",
    riderName: "কামাল পারভেজ",
    riderPhone: "01911998877",
    amount: 2200,
    paymentMethod: "bKash",
    lastFour: "3411",
    status: "APPROVED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

export default function AdminRiderDepositsPage() {
  const router = useRouter();
  const [items, setItems] = useState<DepositItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [feedback, setFeedback] = useState<string | null>(null);

  function getToken() {
    return typeof localStorage !== "undefined" ? localStorage.getItem("admin_token") : "";
  }

  function getLocalStore<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(`tb_demo_${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function setLocalStore(key: string, val: any) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`tb_demo_${key}`, JSON.stringify(val));
    } catch {}
  }

  async function fetchData() {
    setLoading(true);
    let fetchedFromApi = false;
    try {
      const res = await fetch(`${API}/api/riders/deposits`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      }).then((r) => r.json());
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setItems(res.data);
        fetchedFromApi = true;
      }
    } catch {
      // fallback to localStorage
    }

    if (!fetchedFromApi) {
      let localDeposits = getLocalStore<DepositItem[]>("deposit_requests", []);
      if (!localDeposits || localDeposits.length === 0) {
        setLocalStore("deposit_requests", SAMPLE_PENDING_DEPOSITS);
        localDeposits = SAMPLE_PENDING_DEPOSITS;
      }
      setItems(localDeposits);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function approveDeposit(dep: DepositItem) {
    setProcessing(dep.id);
    setFeedback(null);
    try {
      // 1. Try Backend API
      await fetch(`${API}/api/riders/deposits/${dep.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: "APPROVED", amount: dep.amount, riderId: dep.riderId }),
      });
    } catch {}

    // 2. Sync LocalStorage for seamless offline/mock compatibility
    const local = getLocalStore<DepositItem[]>("deposit_requests", SAMPLE_PENDING_DEPOSITS);
    const target = local.find((d) => d.id === dep.id);
    if (target) {
      target.status = "APPROVED";
      target.approvedAt = new Date().toISOString();
      setLocalStore("deposit_requests", local);
    }

    // Increment Rider Balance upon Admin Approval
    const profile = getLocalStore<any>("profile", { balance: 2450, totalEarned: 14850 });
    profile.balance = (profile.balance || 0) + dep.amount;
    setLocalStore("profile", profile);

    // Record in History
    const history = getLocalStore<any[]>("history", []);
    history.unshift({
      id: "h-dep-" + Date.now(),
      type: "income",
      amount: dep.amount,
      description: `ডিপোজিট অনুমোদন — ৳ ${dep.amount} (${dep.paymentMethod || "bKash"})`,
      createdAt: new Date().toISOString(),
    });
    setLocalStore("history", history);

    // Send Rider Notification
    const notifs = getLocalStore<any[]>("notifications", []);
    notifs.unshift({
      id: "n-" + Date.now(),
      type: "PAYMENT",
      title: "ডিপোজিট অনুমোদিত হয়েছে ✅",
      body: `আপনার ৳ ${dep.amount} ডিপোজিট অ্যাডমিন অনুমোদন করেছেন এবং মূল ব্যালেন্সে যুক্ত হয়েছে।`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setLocalStore("notifications", notifs);

    setFeedback(`✅ ${dep.riderName || "রাইডার"}-এর ৳ ${dep.amount.toLocaleString()} ডিপোজিট অনুমোদিত হয়েছে ও ব্যালেন্সে যোগ হয়েছে!`);
    await fetchData();
    setProcessing(null);
    setTimeout(() => setFeedback(null), 5000);
  }

  async function rejectDeposit(dep: DepositItem) {
    setProcessing(dep.id);
    setFeedback(null);
    try {
      await fetch(`${API}/api/riders/deposits/${dep.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: "REJECTED", riderId: dep.riderId }),
      });
    } catch {}

    // Sync LocalStorage
    const local = getLocalStore<DepositItem[]>("deposit_requests", SAMPLE_PENDING_DEPOSITS);
    const target = local.find((d) => d.id === dep.id);
    if (target) {
      target.status = "REJECTED";
      setLocalStore("deposit_requests", local);
    }

    // Send Rejection Notification to Rider (Balance NOT incremented)
    const notifs = getLocalStore<any[]>("notifications", []);
    notifs.unshift({
      id: "n-" + Date.now(),
      type: "PAYMENT",
      title: "ডিপোজিট বাতিল ❌",
      body: `আপনার ৳ ${dep.amount} ডিপোজিট রিকোয়েস্ট অ্যাডমিন বাতিল করেছেন। সঠিক তথ্যাদি দিয়ে পুনরায় সাবমিট করুন।`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setLocalStore("notifications", notifs);

    setFeedback(`❌ ${dep.riderName || "রাইডার"}-এর ৳ ${dep.amount.toLocaleString()} ডিপোজিট বাতিল করা হয়েছে।`);
    await fetchData();
    setProcessing(null);
    setTimeout(() => setFeedback(null), 5000);
  }

  const pendingCount = items.filter((i) => i.status === "PENDING").length;
  const filteredItems = items.filter((i) => (filter === "ALL" ? true : i.status === filter));

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => router.push("/riders")}
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border-2)",
            borderRadius: "var(--r-sm)",
            padding: "8px 14px",
            color: "var(--text-2)",
            cursor: "pointer",
            fontSize: ".82rem",
          }}
        >
          ← রাইডার তালিকা
        </button>
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-1)" }}>
            📥 রাইডার ডিপোজিট অনুমোদন (Deposit Approvals)
          </div>
          <div style={{ fontSize: ".76rem", color: "var(--text-3)", marginTop: 2 }}>
            রাইডারদের সংগৃহীত ক্যাশ জমার তথ্য যাচাই ও ব্যালেন্সে অনুমোদন করুন
          </div>
        </div>
        <span
          style={{
            marginLeft: "auto",
            padding: "5px 12px",
            background: pendingCount > 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
            border: `1px solid ${pendingCount > 0 ? "rgba(245, 158, 11, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
            borderRadius: "var(--r-full)",
            fontSize: ".75rem",
            fontWeight: 800,
            color: pendingCount > 0 ? "#F59E0B" : "#10B981",
          }}
        >
          {pendingCount}টি অপেক্ষারত
        </span>
      </div>

      {/* Alert Feedback Banner */}
      {feedback && (
        <div
          style={{
            background: feedback.includes("✅") ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${feedback.includes("✅") ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: feedback.includes("✅") ? "#10B981" : "#EF4444",
            padding: "12px 18px",
            borderRadius: "var(--r-md)",
            fontSize: ".85rem",
            fontWeight: 700,
            fontFamily: "var(--font-bn)",
            animation: "fade-in 0.2s ease-out",
          }}
        >
          {feedback}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border-1)", paddingBottom: 10 }}>
        {[
          { id: "PENDING", label: `অপেক্ষারত (${pendingCount})` },
          { id: "APPROVED", label: "অনুমোদিত" },
          { id: "REJECTED", label: "বাতিল" },
          { id: "ALL", label: `সব রিকোয়েস্ট (${items.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id as any)}
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              border: "none",
              background: filter === t.id ? "var(--green)" : "var(--bg-raised)",
              color: filter === t.id ? "#fff" : "var(--text-3)",
              cursor: "pointer",
              fontSize: ".78rem",
              fontWeight: 700,
              fontFamily: "var(--font-bn)",
              transition: "all .15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <div className="spinner" />
        </div>
      )}

      {/* Requests List */}
      {!loading && filteredItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-3)", fontSize: ".88rem", fontFamily: "var(--font-bn)" }}>
          কোনো ডিপোজিট রিকোয়েস্ট পাওয়া যায়নি।
        </div>
      ) : (
        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-1)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--border-1)",
              fontSize: ".76rem",
              fontWeight: 700,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: ".08em",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>রাইডার ও পেমেন্ট তথ্য</span>
            <span>জমার পরিমাণ ও অ্যাকশন</span>
          </div>

          {filteredItems.map((item) => {
            const isPending = item.status === "PENDING";
            const isApproved = item.status === "APPROVED";
            return (
              <div
                key={item.id}
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid var(--border-1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {/* Left info */}
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: ".95rem", fontWeight: 800, color: "var(--text-1)" }}>
                      {item.riderName || "রাইডার"}
                    </span>
                    <span style={{ fontSize: ".74rem", color: "var(--text-3)", fontFamily: "monospace" }}>
                      📞 {item.riderPhone || "01700000001"}
                    </span>
                  </div>

                  <div style={{ fontSize: ".82rem", color: "var(--text-2)", fontFamily: "var(--font-bn)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span>মেথড: <strong style={{ color: "var(--text-1)" }}>{item.paymentMethod || "bKash"}</strong></span>
                    <span>•</span>
                    <span>প্রেরক শেষ ৪ ডিজিট: <strong style={{ fontFamily: "monospace", color: "var(--orange)" }}>{item.lastFour}</strong></span>
                  </div>

                  <div style={{ fontSize: ".70rem", color: "var(--text-3)", marginTop: 4 }}>
                    সাবমিট: {new Date(item.createdAt).toLocaleString("bn-BD")}
                    {item.approvedAt && <span> • অনুমোদিত: {new Date(item.approvedAt).toLocaleTimeString("bn-BD")}</span>}
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.35rem", fontWeight: 900, color: isApproved ? "#10B981" : "var(--text-1)", fontFamily: "monospace" }}>
                      ৳ {Number(item.amount).toLocaleString()}
                    </div>
                    <div>
                      {isPending && (
                        <span style={{ fontSize: ".68rem", color: "#F59E0B", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                          ⏳ অপেক্ষারত
                        </span>
                      )}
                      {isApproved && (
                        <span style={{ fontSize: ".68rem", color: "#10B981", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                          ✅ অনুমোদিত (ব্যালেন্সে যোগ হয়েছে)
                        </span>
                      )}
                      {!isPending && !isApproved && (
                        <span style={{ fontSize: ".68rem", color: "#EF4444", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                          ❌ বাতিল
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons for Pending Items */}
                  {isPending && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        id={`approve-deposit-${item.id}`}
                        onClick={() => approveDeposit(item)}
                        disabled={processing === item.id}
                        style={{
                          padding: "10px 18px",
                          background: "var(--green)",
                          borderRadius: "var(--r-sm)",
                          fontWeight: 700,
                          color: "white",
                          border: "none",
                          cursor: processing === item.id ? "not-allowed" : "pointer",
                          fontSize: ".82rem",
                          fontFamily: "var(--font-bn)",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          opacity: processing === item.id ? 0.6 : 1,
                        }}
                      >
                        {processing === item.id ? "প্রসেসিং..." : "✅ অনুমোদন"}
                      </button>

                      <button
                        id={`reject-deposit-${item.id}`}
                        onClick={() => rejectDeposit(item)}
                        disabled={processing === item.id}
                        style={{
                          padding: "10px 14px",
                          background: "var(--red-glass)",
                          border: "1px solid var(--border-red)",
                          borderRadius: "var(--r-sm)",
                          fontWeight: 700,
                          color: "var(--red)",
                          cursor: processing === item.id ? "not-allowed" : "pointer",
                          fontSize: ".82rem",
                          fontFamily: "var(--font-bn)",
                        }}
                      >
                        ❌ বাতিল
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
