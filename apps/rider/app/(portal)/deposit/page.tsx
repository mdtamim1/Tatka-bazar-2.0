"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const COMPANY_ACCOUNTS = [
  { method: "bKash", icon: "💗", number: "01712-345678", color: "#e91e8c", bgColor: "rgba(233,30,140,.12)", borderColor: "rgba(233,30,140,.3)" },
  { method: "Nagad", icon: "🟠", number: "01811-456789", color: "#f7941d", bgColor: "rgba(247,148,29,.12)", borderColor: "rgba(247,148,29,.3)" },
];

type Step = "info" | "form" | "success";

export default function DepositPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [selectedMethod, setSelectedMethod] = useState(COMPANY_ACCOUNTS[0]!);
  const [amount, setAmount] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newBalance, setNewBalance] = useState<number | null>(null);

  async function handleSubmit() {
    setError("");
    const amt = Number(amount);
    if (!amt || amt < 10) { setError("সর্বনিম্ন ৳ ১০ জমা করুন"); return; }
    if (lastFour.length !== 4 || !/^\d{4}$/.test(lastFour)) { setError("শেষ ৪ সংখ্যা সঠিক নয় (শুধু সংখ্যা)"); return; }
    setLoading(true);
    const res = await apiFetch<{ newBalance: number }>("/rider-portal/deposit", {
      method: "POST",
      body: JSON.stringify({ amount: amt, lastFour, paymentMethod: selectedMethod.method }),
    });
    setLoading(false);
    if (res.success && res.data) {
      setNewBalance((res.data as any).newBalance);
      setStep("success");
    } else {
      setError(res.error || "সমস্যা হয়েছে, আবার চেষ্টা করুন");
    }
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => step === "form" ? setStep("info") : router.back()}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-1)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)", flexShrink: 0 }}
        >
          <svg fill="none" viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: "currentColor" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-1)" }}>ব্যালেন্স জমা করুন</div>
          <div style={{ fontSize: ".74rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>রিচার্জ করে ব্যালেন্স বাড়ান</div>
        </div>
      </div>

      {/* STEP 1 — Company Account Info */}
      {step === "info" && (
        <>
          <div style={{ padding: "16px", background: "rgba(0,214,143,.08)", border: "1px solid rgba(0,214,143,.2)", borderRadius: "var(--r-lg)", marginBottom: 20, lineHeight: 1.7, fontSize: ".8rem", color: "var(--text-2)", fontFamily: "var(--font-bn)" }}>
            📋 <strong>কিভাবে জমা করবেন:</strong><br />
            ১. নিচের যেকোনো অ্যাকাউন্টে টাকা পাঠান<br />
            ২. "পাঠানো হয়েছে" বোতামে চাপুন<br />
            ৩. পরিমাণ ও শেষ ৪ সংখ্যা দিন<br />
            ৪. ভেরিফিকেশনের পর ব্যালেন্সে যোগ হবে
          </div>

          <div style={{ fontSize: ".76rem", color: "var(--text-3)", marginBottom: 10, fontFamily: "var(--font-bn)" }}>কোম্পানির অফিসিয়াল অ্যাকাউন্ট</div>

          {COMPANY_ACCOUNTS.map(acc => (
            <div
              key={acc.method}
              onClick={() => setSelectedMethod(acc)}
              style={{
                background: selectedMethod.method === acc.method ? acc.bgColor : "var(--bg-card)",
                border: `1.5px solid ${selectedMethod.method === acc.method ? acc.borderColor : "var(--border-1)"}`,
                borderRadius: "var(--r-lg)",
                padding: "16px 18px",
                marginBottom: 12,
                cursor: "pointer",
                transition: "all .2s",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ fontSize: "2rem" }}>{acc.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: ".9rem", fontWeight: 700, color: "var(--text-1)", marginBottom: 2 }}>{acc.method}</div>
                <div style={{ fontSize: "1.1rem", fontFamily: "monospace", fontWeight: 800, color: acc.color, letterSpacing: ".05em" }}>{acc.number}</div>
                <div style={{ fontSize: ".68rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 2 }}>সেন্ড মানি করুন</div>
              </div>
              {selectedMethod.method === acc.method && (
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: acc.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg fill="none" viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: "#fff" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </div>
          ))}

          <button
            id="deposit-sent-btn"
            className="btn-primary"
            style={{ marginTop: 8 }}
            onClick={() => setStep("form")}
          >
            ✅ পাঠানো হয়েছে — পরবর্তী ধাপ
          </button>
        </>
      )}

      {/* STEP 2 — Submission Form */}
      {step === "form" && (
        <>
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--r-lg)",
            padding: "16px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <div style={{ fontSize: "1.6rem" }}>{selectedMethod.icon}</div>
            <div>
              <div style={{ fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 2 }}>পাঠানো হয়েছে</div>
              <div style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--text-1)" }}>{selectedMethod.method} — {selectedMethod.number}</div>
            </div>
          </div>

          {/* Amount */}
          <label style={{ display: "block", fontSize: ".78rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 6 }}>
            কত টাকা পাঠিয়েছেন? (৳)
          </label>
          <input
            id="deposit-amount-input"
            type="number"
            placeholder="যেমন: 500"
            value={amount}
            onChange={e => { setAmount(e.target.value); setError(""); }}
            style={{
              width: "100%", background: "var(--bg-base)",
              border: "1.5px solid var(--border-1)", borderRadius: "var(--r-md)",
              padding: "14px 16px", fontSize: "1.1rem", color: "var(--text-1)",
              outline: "none", boxSizing: "border-box", marginBottom: 18,
              fontWeight: 700,
            }}
          />

          {/* Last 4 digits */}
          <label style={{ display: "block", fontSize: ".78rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 4 }}>
            যে নম্বর থেকে পাঠিয়েছেন তার শেষ ৪ সংখ্যা
          </label>
          <div style={{ fontSize: ".7rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 8, lineHeight: 1.5 }}>
            উদাহরণ: 01712-34<strong>5678</strong> → শেষ ৪ সংখ্যা: <strong>5678</strong>
          </div>
          <input
            id="deposit-last-four-input"
            type="text"
            placeholder="যেমন: 5678"
            maxLength={4}
            value={lastFour}
            onChange={e => { setLastFour(e.target.value.replace(/\D/g, "")); setError(""); }}
            style={{
              width: "100%", background: "var(--bg-base)",
              border: `1.5px solid ${error ? "#ef4444" : "var(--border-1)"}`, borderRadius: "var(--r-md)",
              padding: "14px 16px", fontSize: "1.4rem", color: "var(--text-1)",
              outline: "none", boxSizing: "border-box", marginBottom: 8,
              fontFamily: "monospace", letterSpacing: "0.3em", fontWeight: 800, textAlign: "center",
            }}
          />

          {error && (
            <div style={{ fontSize: ".76rem", color: "#ef4444", marginBottom: 14, fontFamily: "var(--font-bn)", padding: "8px 12px", background: "rgba(239,68,68,.1)", borderRadius: "var(--r-sm)" }}>
              {error}
            </div>
          )}

          <button
            id="deposit-submit-btn"
            className="btn-primary"
            disabled={loading}
            onClick={handleSubmit}
            style={{ marginTop: 6 }}
          >
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> যাচাই করা হচ্ছে...</> : "📤 সাবমিট করুন"}
          </button>
        </>
      )}

      {/* STEP 3 — Success */}
      {step === "success" && (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>
            রিচার্জ সম্পন্ন!
          </div>
          <div style={{ fontSize: ".85rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 24, lineHeight: 1.7 }}>
            আপনার জমার তথ্য সফলভাবে জমা হয়েছে।<br />
            হেড প্যানেল যাচাই করে ব্যালেন্স আপডেট করবে।
          </div>
          {newBalance !== null && (
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--emerald)", marginBottom: 24 }}>
              নতুন ব্যালেন্স: ৳ {newBalance.toLocaleString("bn-BD")}
            </div>
          )}
          <button className="btn-primary" onClick={() => router.replace("/home")}>
            🏠 হোমে ফিরুন
          </button>
        </div>
      )}
    </div>
  );
}
