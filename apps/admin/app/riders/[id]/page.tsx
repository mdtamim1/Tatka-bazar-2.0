"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface RiderDetail {
  id: string; name: string; phone: string; email: string;
  vehicleType: string; vehicleNumber?: string; status: string;
  balance: number; totalEarned: number;
  kycStatus: string; kycSubmittedAt?: string; kycApprovedAt?: string;
  fatherName?: string; motherName?: string; dateOfBirth?: string;
  presentAddress?: string; permanentAddress?: string; nidNumber?: string;
  nidFrontUrl?: string; nidBackUrl?: string; photoUrl?: string;
  paymentMethod?: string; paymentAccount?: string; paymentAccountLocked?: boolean;
  createdAt: string;
}

const KYC_LABEL: Record<string,string> = { PENDING: "বাকি", SUBMITTED: "জমা দেওয়া হয়েছে", APPROVED: "অনুমোদিত", REJECTED: "বাতিল" };
const KYC_COLOR: Record<string,string> = { PENDING: "var(--amber)", SUBMITTED: "var(--blue)", APPROVED: "var(--green)", REJECTED: "var(--red)" };

export default function RiderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rider, setRider] = useState<RiderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const token = document.cookie.match(/admin_token=([^;]+)/)?.[1] ||
      (typeof localStorage !== "undefined" ? localStorage.getItem("admin_token") : "");
    fetch(`${API}/api/riders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(r => { if (r.success) setRider(r.data); setLoading(false); });
  }, [id]);

  async function approveKyc(action: "APPROVE" | "REJECT") {
    setApproving(true);
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("admin_token") : "";
    await fetch(`${API}/api/riders/${id}/kyc`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kycAction: action }),
    });
    const r = await fetch(`${API}/api/riders/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    if (r.success) setRider(r.data);
    setApproving(false);
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" /></div>;
  if (!rider) return <div style={{ padding: 32, color: "var(--text-2)" }}>Rider not found</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <button onClick={() => router.back()} style={{ background: "var(--bg-raised)", border: "1px solid var(--border-2)", borderRadius: "var(--r-sm)", padding: "8px 14px", color: "var(--text-2)", cursor: "pointer", fontSize: ".82rem" }}>← ফিরুন</button>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)" }}>রাইডার বিবরণ</div>
      </div>

      {/* Profile header */}
      <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-1)", borderRadius: "var(--r-lg)", padding: "24px", display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--green-glass)", border: "2px solid var(--border-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 900, color: "var(--green)", flexShrink: 0 }}>
          {rider.name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>{rider.name}</div>
          <div style={{ fontSize: ".80rem", color: "var(--text-3)", marginBottom: 8 }}>{rider.phone} • {rider.email}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ padding: "4px 10px", background: "var(--bg-active)", borderRadius: "var(--r-full)", fontSize: ".70rem", fontWeight: 700, color: "var(--text-2)" }}>{rider.vehicleType}</span>
            <span style={{ padding: "4px 10px", background: "rgba(34,197,94,.1)", borderRadius: "var(--r-full)", fontSize: ".70rem", fontWeight: 700, color: KYC_COLOR[rider.kycStatus] }}>KYC: {KYC_LABEL[rider.kycStatus] || rider.kycStatus}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: ".68rem", color: "var(--text-3)" }}>ব্যালেন্স</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--green)" }}>৳ {Number(rider.balance).toLocaleString()}</div>
          <div style={{ fontSize: ".68rem", color: "var(--text-3)", marginTop: 4 }}>মোট আয়: ৳ {Number(rider.totalEarned).toLocaleString()}</div>
        </div>
      </div>

      {/* KYC Info */}
      <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-1)", borderRadius: "var(--r-lg)", padding: "20px" }}>
        <div style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: ".10em", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border-1)" }}>🪪 KYC তথ্য</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[["পিতার নাম", rider.fatherName], ["মাতার নাম", rider.motherName], ["জন্মতারিখ", rider.dateOfBirth?.split("T")[0]], ["NID নম্বর", rider.nidNumber], ["বর্তমান ঠিকানা", rider.presentAddress], ["স্থায়ী ঠিকানা", rider.permanentAddress]].map(([label, val]) => (
            <div key={label} style={{ gridColumn: label?.includes("ঠিকানা") ? "1/-1" : "auto" }}>
              <div style={{ fontSize: ".68rem", color: "var(--text-3)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: ".85rem", color: "var(--text-1)", fontFamily: "Hind Siliguri, sans-serif" }}>{val || "—"}</div>
            </div>
          ))}
        </div>
        {rider.nidFrontUrl && (
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <img src={rider.nidFrontUrl} alt="NID Front" style={{ width: 180, borderRadius: 8, border: "1px solid var(--border-2)" }} />
            {rider.nidBackUrl && <img src={rider.nidBackUrl} alt="NID Back" style={{ width: 180, borderRadius: 8, border: "1px solid var(--border-2)" }} />}
          </div>
        )}
        {rider.kycStatus === "SUBMITTED" && (
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <button id="kyc-approve-btn" onClick={() => approveKyc("APPROVE")} disabled={approving} style={{ padding: "12px 24px", background: "var(--green)", borderRadius: "var(--r-md)", fontWeight: 700, color: "white", border: "none", cursor: "pointer", opacity: approving ? 0.6 : 1 }}>✅ KYC অনুমোদন করুন</button>
            <button id="kyc-reject-btn" onClick={() => approveKyc("REJECT")} disabled={approving} style={{ padding: "12px 24px", background: "var(--red-glass)", border: "1px solid var(--border-red)", borderRadius: "var(--r-md)", fontWeight: 700, color: "var(--red)", cursor: "pointer" }}>❌ বাতিল করুন</button>
          </div>
        )}
        {rider.kycStatus === "APPROVED" && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--green-glass)", border: "1px solid var(--border-green)", borderRadius: "var(--r-sm)", color: "var(--green)", fontSize: ".80rem", fontFamily: "Hind Siliguri, sans-serif" }}>
            ✅ KYC অনুমোদিত হয়েছে {rider.kycApprovedAt ? `— ${new Date(rider.kycApprovedAt).toLocaleDateString("bn-BD")}` : ""}
          </div>
        )}
      </div>

      {/* Payment account */}
      {rider.paymentAccount && (
        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-1)", borderRadius: "var(--r-lg)", padding: "20px" }}>
          <div style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: ".10em", marginBottom: 12 }}>💳 পেমেন্ট একাউন্ট</div>
          <div style={{ fontSize: ".88rem", color: "var(--text-1)" }}>{rider.paymentMethod}: <strong>{rider.paymentAccount}</strong> {rider.paymentAccountLocked && "🔒"}</div>
        </div>
      )}
    </div>
  );
}
