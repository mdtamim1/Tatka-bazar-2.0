"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type DepositRequest } from "@/lib/api";

const COMPANY_ACCOUNTS = [
  { method: "bKash", icon: "💗", number: "01712-345678", color: "#e91e8c", bgColor: "rgba(233,30,140,.12)", borderColor: "rgba(233,30,140,.3)" },
  { method: "Nagad", icon: "🟠", number: "01811-456789", color: "#f7941d", bgColor: "rgba(247,148,29,.12)", borderColor: "rgba(247,148,29,.3)" },
];

type Step = "info" | "form" | "pending_success";

export default function DepositPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [selectedMethod, setSelectedMethod] = useState(COMPANY_ACCOUNTS[0]!);
  const [amount, setAmount] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedDeposit, setSubmittedDeposit] = useState<DepositRequest | null>(null);
  const [history, setHistory] = useState<DepositRequest[]>([]);

  // Load past deposits
  const loadDeposits = async () => {
    const res = await apiFetch<DepositRequest[]>("/rider-portal/deposits");
    if (res.success && Array.isArray(res.data)) {
      setHistory(res.data);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, [step]);

  async function handleSubmit() {
    setError("");
    const amt = Number(amount);
    if (!amt || amt < 10) { setError("সর্বনিম্ন ৳ ১০ জমা করুন"); return; }
    if (lastFour.length !== 4 || !/^\d{4}$/.test(lastFour)) { setError("শেষ ৪ সংখ্যা সঠিক নয় (শুধু সংখ্যা)"); return; }
    setLoading(true);
    const res = await apiFetch<{ message: string; deposit: DepositRequest; currentBalance?: number }>("/rider-portal/deposit", {
      method: "POST",
      body: JSON.stringify({ amount: amt, lastFour, paymentMethod: selectedMethod.method }),
    });
    setLoading(false);
    if (res.success && res.data) {
      setSubmittedDeposit((res.data as any).deposit);
      setStep("pending_success");
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
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-1)" }}>টাকা জমা (ক্যাশ ডিপোজিট)</div>
          <div style={{ fontSize: ".74rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>সংগৃহীত ক্যাশ জমা দিন ও ব্যালেন্স রিচার্জ করুন</div>
        </div>
      </div>

      {/* STEP 1 — Company Account Info */}
      {step === "info" && (
        <>
          <div style={{ padding: "16px", background: "rgba(0,214,143,.08)", border: "1px solid rgba(0,214,143,.2)", borderRadius: "var(--r-lg)", marginBottom: 20, lineHeight: 1.7, fontSize: ".8rem", color: "var(--text-2)", fontFamily: "var(--font-bn)" }}>
            📋 <strong>টাকা জমার নিয়মাবলী:</strong><br />
            ১. কোম্পানির নিচে দেওয়া বিকাশ বা নগদ নম্বরে সেন্ড মানি করুন<br />
            ২. টাকা পাঠানোর পর <strong>"পাঠানো হয়েছে"</strong> বোতামে চাপুন<br />
            ৩. জমার পরিমাণ ও আপনার প্রেরক নম্বরের শেষ ৪ ডিজিট দিন<br />
            ৪. <strong style={{ color: "var(--amber)" }}>অ্যাডমিন অনুমোদন করার সাথে সাথে</strong> টাকা ব্যালেন্সে জমা হবে
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
              <div style={{ fontSize: ".76rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 2 }}>নির্বাচিত অ্যাকাউন্ট</div>
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
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> সাবমিট হচ্ছে...</> : "📤 ডিপোজিট রিকোয়েস্ট পাঠান"}
          </button>
        </>
      )}

      {/* STEP 3 — Pending Success State */}
      {step === "pending_success" && (
        <div style={{ textAlign: "center", paddingTop: 20 }}>
          <div style={{
            width: 76, height: 76, borderRadius: "50%",
            background: "rgba(245, 158, 11, 0.15)", border: "2px solid rgba(245, 158, 11, 0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "36px", margin: "0 auto 16px",
            boxShadow: "0 0 25px rgba(245, 158, 11, 0.25)"
          }}>
            ⏳
          </div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>
            ডিপোজিট রিকোয়েস্ট জমা হয়েছে!
          </div>
          <div style={{ fontSize: ".84rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginBottom: 20, lineHeight: 1.6, maxWidth: 340, margin: "0 auto 20px" }}>
            আপনার জমার তথ্যটি অ্যাডমিন প্যানেলে পাঠানো হয়েছে।<br />
            অ্যাডমিন যাচাই করে <strong style={{ color: "var(--amber)" }}>অনুমোদন (Approve)</strong> করার পর টাকাটি আপনার ব্যালেন্সে যোগ হবে।
          </div>

          {/* Deposit Summary Card */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-1)",
            borderRadius: "16px",
            padding: "16px 20px",
            maxWidth: "340px",
            margin: "0 auto 24px",
            textAlign: "left",
            fontFamily: "var(--font-bn)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".85rem" }}>
              <span style={{ color: "var(--text-3)" }}>জমার পরিমাণ:</span>
              <strong style={{ fontSize: "1.15rem", color: "#00D68F" }}>৳ {Number(amount).toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".82rem" }}>
              <span style={{ color: "var(--text-3)" }}>পদ্ধতি:</span>
              <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{selectedMethod.method}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".82rem" }}>
              <span style={{ color: "var(--text-3)" }}>প্রেরক শেষ ৪ সংখ্যা:</span>
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--text-1)" }}>{lastFour}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".82rem", paddingTop: "6px", borderTop: "1px dashed var(--border-1)" }}>
              <span style={{ color: "var(--text-3)" }}>বর্তমান স্ট্যাটাস:</span>
              <span style={{ color: "#F59E0B", background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.3)", padding: "2px 8px", borderRadius: "6px", fontWeight: 700, fontSize: ".75rem" }}>
                ⏳ অপেক্ষারত (PENDING)
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", maxWidth: 340, margin: "0 auto" }}>
            <button
              onClick={() => { setStep("info"); setAmount(""); setLastFour(""); }}
              style={{
                flex: 1, padding: "13px", borderRadius: "14px",
                background: "var(--bg-card)", border: "1px solid var(--border-1)",
                color: "var(--text-2)", cursor: "pointer", fontSize: ".88rem",
                fontFamily: "var(--font-bn)", fontWeight: 600,
              }}
            >
              নতুন জমা
            </button>
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={() => router.replace("/home")}
            >
              🏠 হোমে ফিরুন
            </button>
          </div>
        </div>
      )}

      {/* ─── Recent Deposit Requests History ─── */}
      <div style={{ marginTop: "32px", borderTop: "1px solid var(--border-1)", paddingTop: "20px" }}>
        <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-3)", marginBottom: "12px", fontFamily: "var(--font-bn)", textTransform: "uppercase", letterSpacing: ".06em" }}>
          পূর্ববর্তী ডিপোজিট রিকোয়েস্টসমূহ
        </div>

        {history.length === 0 ? (
          <div style={{ fontSize: ".8rem", color: "var(--text-3)", textAlign: "center", padding: "20px 0", fontFamily: "var(--font-bn)" }}>
            এখনো কোনো ডিপোজিট রিকোয়েস্ট জমা দেওয়া হয়নি।
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {history.map((item) => {
              const isPending = item.status === "PENDING";
              const isApproved = item.status === "APPROVED";
              return (
                <div
                  key={item.id}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-1)",
                    borderRadius: "14px",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: "var(--font-bn)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <strong style={{ fontSize: ".98rem", color: "var(--text-1)" }}>৳ {Number(item.amount).toLocaleString()}</strong>
                      <span style={{ fontSize: ".72rem", color: "var(--text-3)" }}>({item.paymentMethod || "bKash"})</span>
                    </div>
                    <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>
                      প্রেরক: ***{item.lastFour} • {new Date(item.createdAt).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  <div>
                    {isPending && (
                      <span style={{ fontSize: ".72rem", color: "#F59E0B", background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.3)", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                        ⏳ অপেক্ষারত
                      </span>
                    )}
                    {isApproved && (
                      <span style={{ fontSize: ".72rem", color: "#10B981", background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.3)", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                        ✅ অনুমোদিত
                      </span>
                    )}
                    {!isPending && !isApproved && (
                      <span style={{ fontSize: ".72rem", color: "#EF4444", background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.3)", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                        ❌ বাতিল
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
