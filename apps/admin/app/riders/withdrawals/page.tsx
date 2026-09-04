"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Withdrawal {
  id: string; riderId: string; riderName: string; riderPhone: string;
  amount: number; paymentMethod: string; paymentAccount: string;
  status: string; createdAt: string; adminNote?: string;
}

const STATUS_COLOR: Record<string,string> = {
  PENDING: "var(--amber)", PROCESSING: "var(--blue)", COMPLETED: "var(--green)", REJECTED: "var(--red)"
};
const STATUS_LABEL: Record<string,string> = {
  PENDING: "অপেক্ষারত", PROCESSING: "প্রক্রিয়াধীন", COMPLETED: "সম্পন্ন", REJECTED: "বাতিল"
};

export default function WithdrawalsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  function getToken() {
    return typeof localStorage !== "undefined" ? localStorage.getItem("admin_token") : "";
  }

  async function fetchData() {
    const r = await fetch(`${API}/api/riders/withdrawals`, { headers: { Authorization: `Bearer ${getToken()}` } }).then(r => r.json());
    if (r.success) setItems(r.data || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function approve(id: string, amount: number, riderId: string) {
    setProcessing(id);
    await fetch(`${API}/api/riders/withdrawals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ status: "COMPLETED", deductFromBalance: true, riderId, amount }),
    });
    await fetchData();
    setProcessing(null);
  }

  async function reject(id: string) {
    setProcessing(id);
    await fetch(`${API}/api/riders/withdrawals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    await fetchData();
    setProcessing(null);
  }

  const pending = items.filter(i => i.status === "PENDING");
  const done = items.filter(i => i.status !== "PENDING");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "var(--bg-raised)", border: "1px solid var(--border-2)", borderRadius: "var(--r-sm)", padding: "8px 14px", color: "var(--text-2)", cursor: "pointer", fontSize: ".82rem" }}>← ফিরুন</button>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)" }}>💸 উইথড্র রিকোয়েস্ট</div>
        <span style={{ marginLeft: "auto", padding: "4px 10px", background: "var(--amber-glass)", border: "1px solid var(--amber-glow)", borderRadius: "var(--r-full)", fontSize: ".72rem", fontWeight: 700, color: "var(--amber)" }}>{pending.length} অপেক্ষারত</span>
      </div>

      {loading && <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div className="spinner" /></div>}

      {pending.length > 0 && (
        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-1)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-1)", fontSize: ".76rem", fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: ".10em" }}>অপেক্ষারত রিকোয়েস্ট</div>
          {pending.map(item => (
            <div key={item.id} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-1)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: ".88rem", fontWeight: 700, color: "var(--text-1)", fontFamily: "Hind Siliguri, sans-serif" }}>{item.riderName || "Rider"}</span>
                  <span style={{ fontSize: ".70rem", color: "var(--text-3)" }}>{item.riderPhone}</span>
                </div>
                <div style={{ fontSize: ".80rem", color: "var(--text-2)", fontFamily: "Hind Siliguri, sans-serif" }}>
                  {item.paymentMethod}: <strong>{item.paymentAccount}</strong>
                </div>
                <div style={{ fontSize: ".68rem", color: "var(--text-3)", marginTop: 2 }}>
                  {new Date(item.createdAt).toLocaleString("bn-BD")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--text-1)" }}>৳ {Number(item.amount).toLocaleString()}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button id={`approve-${item.id}`} onClick={() => approve(item.id, item.amount, item.riderId)} disabled={processing === item.id} style={{ padding: "10px 16px", background: "var(--green)", borderRadius: "var(--r-sm)", fontWeight: 700, color: "white", border: "none", cursor: "pointer", fontSize: ".80rem", opacity: processing === item.id ? 0.6 : 1 }}>✅ অনুমোদন</button>
                <button id={`reject-${item.id}`} onClick={() => reject(item.id)} disabled={processing === item.id} style={{ padding: "10px 16px", background: "var(--red-glass)", border: "1px solid var(--border-red)", borderRadius: "var(--r-sm)", fontWeight: 700, color: "var(--red)", cursor: "pointer", fontSize: ".80rem" }}>❌</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-1)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-1)", fontSize: ".76rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".10em" }}>ইতিহাস</div>
          {done.slice(0, 20).map(item => (
            <div key={item.id} style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-1)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--text-1)", fontFamily: "Hind Siliguri, sans-serif" }}>{item.riderName || "Rider"} — {item.paymentMethod} {item.paymentAccount}</div>
                <div style={{ fontSize: ".68rem", color: "var(--text-3)" }}>{new Date(item.createdAt).toLocaleString("bn-BD")}</div>
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-1)" }}>৳ {Number(item.amount).toLocaleString()}</div>
              <span style={{ padding: "3px 8px", background: `${STATUS_COLOR[item.status]}18`, border: `1px solid ${STATUS_COLOR[item.status]}40`, borderRadius: "99px", fontSize: ".68rem", fontWeight: 700, color: STATUS_COLOR[item.status] }}>{STATUS_LABEL[item.status] || item.status}</span>
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-3)", fontFamily: "Hind Siliguri, sans-serif" }}>
          কোন উইথড্র রিকোয়েস্ট নেই
        </div>
      )}
    </div>
  );
}
