"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useVendorStore } from "@/store/vendorStore";
import { PayoutMethod } from "@/types/vendor";
import { apiFetch } from "@/lib/api";
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LedgerEntry {
  id: string;
  orderId: string;
  displayId: string;
  date: string;
  grossAmount: number;
  commissionRate: number;
  commissionFee: number;
  netPayable: number;
  settlementStatus: "PENDING" | "SETTLED";
}

interface PayoutEntry {
  id: string;
  amount: number;
  method: string;
  accountNumber: string;
  status: string;
  requestedAt: string;
  processedAt?: string;
  transactionRef?: string;
  notes?: string;
}

function useSettlementsData() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [payouts, setPayouts] = useState<PayoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ ledger: LedgerEntry[]; payouts: PayoutEntry[] }>(
        "/api/vendor-portal/settlements"
      );
      if (res.success && res.data) {
        setLedger(res.data.ledger || []);
        setPayouts(res.data.payouts || []);
      } else {
        setError(res.error || "সেটেলমেন্ট তথ্য লোড ব্যর্থ।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const availableBalance = ledger
    .filter((c) => c.settlementStatus === "PENDING")
    .reduce((s, c) => s + c.netPayable, 0);

  const totalCompleted = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + p.amount, 0);

  return { ledger, payouts, loading, error, availableBalance, totalCompleted, reload: load };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "অপেক্ষমাণ", cls: "badge-amber" },
    APPROVED: { label: "অনুমোদিত", cls: "badge-emerald" },
    OTP_SENT: { label: "OTP পাঠানো হয়েছে", cls: "badge-emerald" },
    RIDER_DISPATCHED: { label: "রাইডার ডিসপ্যাচড", cls: "badge-emerald" },
    COMPLETED: { label: "সম্পন্ন", cls: "badge-emerald" },
    REJECTED: { label: "বাতিল", cls: "badge-red" },
    PROCESSING: { label: "প্রক্রিয়াধীন", cls: "badge-amber" },
  };
  const { label, cls } = map[status] || { label: status, cls: "badge-slate" };
  return <span className={cls}>{label}</span>;
}

function OTPModal({
  isOpen,
  onClose,
  onVerify,
  riderName,
  amount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => boolean;
  riderName?: string;
  amount: number;
}) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const handleVerify = () => {
    const ok = onVerify(otp.trim());
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setOtp("");
        setError("");
      }, 2000);
    } else {
      setError("ভুল OTP! রাইডারের কাছ থেকে সঠিক কোডটি নিন।");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 460, borderRadius: "28px 28px 0 0" }}
      >
        <div className="modal-handle" />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#22C55E,#16A34A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              margin: "0 auto 12px",
              boxShadow: "0 0 24px rgba(34,197,94,.4)",
            }}
          >
            🔐
          </div>
          <div className="modal-title">OTP যাচাই করুন</div>
          <p
            style={{
              fontSize: ".82rem",
              color: "var(--text-3)",
              fontFamily: "var(--font-bn)",
              marginTop: 6,
            }}
          >
            {riderName || "রাইডার"} আপনার কাছে নগদ ৳{amount.toLocaleString()} নিয়ে এসেছেন।
            <br />
            রাইডারের কাছ থেকে ৬-ডিজিটের OTP নিন।
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "var(--red-glass)",
              border: "1px solid var(--red-glow)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: ".80rem",
              color: "var(--red)",
              fontFamily: "var(--font-bn)",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: "3rem" }}>✅</div>
            <div
              style={{
                color: "var(--emerald)",
                fontWeight: 800,
                fontFamily: "var(--font-bn)",
                marginTop: 8,
              }}
            >
              সফলভাবে নিশ্চিত হয়েছে!
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="form-label">OTP কোড (রাইডারের কাছ থেকে)</label>
              <input
                className="otp-full-input"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                placeholder="______"
                style={{ animation: shake ? "shake 0.5s" : "none" }}
                autoFocus
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
              <button className="btn-secondary" onClick={onClose}>
                বাতিল
              </button>
              <button className="btn-primary" onClick={handleVerify} disabled={otp.length < 6}>
                ⚡ যাচাই করুন
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

function RequestStepper({
  statusKeys,
  labels,
  descs,
  currentStatus,
}: {
  statusKeys: string[];
  labels: string[];
  descs: string[];
  currentStatus: string;
}) {
  const currentIdx = statusKeys.indexOf(currentStatus);
  return (
    <div className="request-stepper">
      {statusKeys.map((key, i) => {
        const isDone = currentIdx > i || currentStatus === statusKeys[statusKeys.length - 1];
        const isActive = currentIdx === i && currentStatus !== statusKeys[statusKeys.length - 1];
        return (
          <div key={key} className={`request-step${isDone ? " done" : isActive ? " active" : ""}`}>
            <div className="request-step-dot">{isDone ? "✓" : i + 1}</div>
            <div className="request-step-body">
              <div className="request-step-title">{labels[i]}</div>
              <div className="request-step-desc">{descs[i]}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Withdraw Tab ──────────────────────────────────────────────────────────────
function WithdrawTab({
  availableBalance,
  payouts,
  reload,
}: {
  availableBalance: number;
  payouts: PayoutEntry[];
  reload: () => void;
}) {
  const { profile, verifyWithdrawOTP } = useVendorStore();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PayoutMethod>(profile.payoutMethod || "BKASH");
  const [account, setAccount] = useState(profile.payoutAccount || "");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpModal, setOtpModal] = useState<{
    requestId: string;
    amount: number;
    otp?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setFormError("সঠিক পরিমাণ দিন।");
      return;
    }
    if (amt < 100) {
      setFormError("সর্বনিম্ন উত্তোলন ৳১০০।");
      return;
    }
    if (availableBalance > 0 && amt > availableBalance) {
      setFormError(`সর্বোচ্চ উত্তোলনযোগ্য ব্যালেন্স ৳${availableBalance.toLocaleString()}।`);
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const res = await apiFetch("/api/vendor-portal/settlements", {
        method: "POST",
        body: JSON.stringify({ amount: amt, method, account }),
      });

      if (!res.success) {
        setFormError(res.error || "উইথড্র রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে।");
        return;
      }

      setFormSuccess(`৳${amt.toLocaleString()} উত্তোলনের আবেদন সফলভাবে ডাটাবেজে জমা হয়েছে!`);
      setAmount("");
      reload();
    } catch {
      setFormError("সার্ভারের সাথে যোগাযোগ করা যায়নি।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerify = (otp: string) => {
    if (!otpModal) return false;
    return verifyWithdrawOTP(otpModal.requestId, otp);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="withdrawal-summary-card">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="balance-label">📊 উপলব্ধ উইথড্র ব্যালেন্স</div>
          <div className="balance-amount">
            <span className="currency">৳</span>
            {availableBalance.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: ".75rem",
              color: "var(--text-3)",
              fontFamily: "var(--font-bn)",
            }}
          >
            কমিশন বাদ দিয়ে ডাটাবেজ থেকে গণনাকৃত পরিষ্কার ব্যালেন্স
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">💸 উইথড্র রিকোয়েস্ট</div>

        {formError && (
          <div
            style={{
              background: "var(--red-glass)",
              border: "1px solid var(--red-glow)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: ".80rem",
              color: "var(--red)",
              fontFamily: "var(--font-bn)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        {formSuccess && (
          <div
            style={{
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.4)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: ".80rem",
              color: "var(--emerald)",
              fontFamily: "var(--font-bn)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} />
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">পরিমাণ (টাকা) *</label>
            <div className="amount-input-wrapper">
              <span className="amount-currency">৳</span>
              <input
                type="number"
                min="100"
                step="50"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setFormError("");
                }}
                className="amount-input"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">পেমেন্ট পদ্ধতি *</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PayoutMethod)}
              className="form-input"
              style={{ cursor: "pointer" }}
            >
              <option value="BKASH">📱 bKash মার্চেন্ট (তাৎক্ষণিক)</option>
              <option value="NAGAD">📱 Nagad মার্চেন্ট (তাৎক্ষণিক)</option>
              <option value="BANK_TRANSFER">🏦 ব্যাংক ট্রান্সফার (BEFTN)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">অ্যাকাউন্ট নম্বর *</label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="form-input"
              placeholder="+88018XXXXXXXX"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Loader2 size={16} className="animate-spin" /> আবেদন পাঠানো হচ্ছে...
              </span>
            ) : (
              "📤 উইথড্র রিকোয়েস্ট পাঠান"
            )}
          </button>
        </form>
      </div>

      <div className="info-box green">
        <svg fill="none" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="info-box-text">
          উইথড্র অনুমোদন হলে অ্যাডমিন বা রাইডার নগদ প্রদান করবে। রাইডার নগদ নিয়ে আসলে OTP দিয়ে কনফার্ম করুন।
        </div>
      </div>

      {payouts.length > 0 && (
        <div className="form-section" style={{ gap: 12 }}>
          <div className="form-section-title">📋 উইথড্র হিস্ট্রি (ডাটাবেজ রেকর্ড)</div>
          {payouts.map((req) => (
            <div
              key={req.id}
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-2)",
                borderRadius: 14,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: ".70rem",
                      color: "var(--text-3)",
                      fontFamily: "var(--font-bn)",
                    }}
                  >
                    {new Date(req.requestedAt).toLocaleString("bn-BD")}
                  </div>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 900,
                      color: "var(--orange)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ৳{req.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: ".74rem", color: "var(--text-3)" }}>
                    {req.method} {req.accountNumber ? `• ${req.accountNumber}` : ""}
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <RequestStepper
                statusKeys={["PENDING", "OTP_SENT", "COMPLETED"]}
                labels={["রিকোয়েস্ট জমা", "প্রসেসিং / OTP", "সম্পন্ন"]}
                descs={[
                  "অ্যাডমিন পর্যালোচনার অপেক্ষায়",
                  "অর্থ প্রেরণ / রাইডার ডিসপ্যাচড",
                  "অর্থ প্রাপ্তি সম্পন্ন",
                ]}
                currentStatus={
                  req.status === "APPROVED" || req.status === "OTP_SENT"
                    ? "OTP_SENT"
                    : req.status === "COMPLETED"
                    ? "COMPLETED"
                    : "PENDING"
                }
              />

              {req.status === "OTP_SENT" && (
                <button
                  className="btn-primary"
                  onClick={() => setOtpModal({ requestId: req.id, amount: req.amount })}
                >
                  🔐 OTP যাচাই করুন
                </button>
              )}
              {req.status === "COMPLETED" && (
                <div
                  style={{
                    background: "var(--emerald-glass)",
                    border: "1px solid rgba(34,197,94,.3)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    textAlign: "center",
                    fontSize: ".80rem",
                    color: "var(--emerald)",
                    fontFamily: "var(--font-bn)",
                  }}
                >
                  ✅ সফলভাবে প্রাপ্ত — {req.processedAt ? new Date(req.processedAt).toLocaleString("bn-BD") : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <OTPModal
        isOpen={!!otpModal}
        onClose={() => setOtpModal(null)}
        onVerify={handleOTPVerify}
        riderName="Tatka Hub রাইডার"
        amount={otpModal?.amount || 0}
      />
    </div>
  );
}

// ── Settlement Tab ────────────────────────────────────────────────────────────
function SettlementTab({
  ledger,
  reload,
}: {
  ledger: LedgerEntry[];
  reload: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const pendingLedger = ledger.filter((c) => c.settlementStatus === "PENDING");
  const totalSelected = pendingLedger
    .filter((c) => selectedIds.has(c.id))
    .reduce((s, c) => s + c.netPayable, 0);

  const toggle = (id: string) =>
    setSelectedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleAll = () =>
    setSelectedIds(
      selectedIds.size === pendingLedger.length
        ? new Set()
        : new Set(pendingLedger.map((c) => c.id))
    );

  const handleSubmit = async () => {
    if (selectedIds.size === 0 || totalSelected < 100) return;
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await apiFetch("/api/vendor-portal/settlements", {
        method: "POST",
        body: JSON.stringify({
          amount: totalSelected,
          method: "BKASH",
          account: "অর্ডার সেটেলমেন্ট রিকোয়েস্ট",
        }),
      });

      if (!res.success) {
        setStatusMsg({ text: res.error || "সেটেলমেন্ট রিকোয়েস্ট ব্যর্থ।", ok: false });
        return;
      }

      setStatusMsg({
        text: `৳${totalSelected.toLocaleString()} সমপরিমাণ ${selectedIds.size}টি অর্ডারের সেটেলমেন্ট রিকোয়েস্ট জমা হয়েছে!`,
        ok: true,
      });
      setSelectedIds(new Set());
      reload();
    } catch {
      setStatusMsg({ text: "সার্ভারে যোগাযোগ করা যায়নি।", ok: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-box green">
        <svg fill="none" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="info-box-text">
          অর্ডার সিলেক্ট করে সেটেলমেন্ট রিকোয়েস্ট পাঠান। প্ল্যাটফর্ম অ্যাডমিন অনুমোদন করার পর সরাসরি
          আপনার অ্যাকাউন্টে টাকা পাঠানো হবে।
        </div>
      </div>

      {statusMsg && (
        <div
          style={{
            background: statusMsg.ok ? "rgba(34,197,94,0.15)" : "var(--red-glass)",
            border: `1px solid ${statusMsg.ok ? "rgba(34,197,94,0.4)" : "var(--red-glow)"}`,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: ".82rem",
            color: statusMsg.ok ? "var(--emerald)" : "var(--red)",
            fontFamily: "var(--font-bn)",
          }}
        >
          {statusMsg.ok ? "✅ " : "⚠️ "}
          {statusMsg.text}
        </div>
      )}

      {pendingLedger.length > 0 ? (
        <div className="form-section" style={{ gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="form-section-title" style={{ border: "none", paddingBottom: 0 }}>
              📦 পেন্ডিং সেটেলমেন্ট অর্ডার ({pendingLedger.length}টি)
            </div>
            <button
              className="btn-secondary"
              style={{ width: "auto", padding: "6px 14px", fontSize: ".74rem" }}
              onClick={toggleAll}
            >
              {selectedIds.size === pendingLedger.length ? "সব বাতিল" : "সব সিলেক্ট"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingLedger.map((c) => (
              <div
                key={c.id}
                className={`settlement-order-row${selectedIds.has(c.id) ? " selected" : ""}`}
                onClick={() => toggle(c.id)}
              >
                <input type="checkbox" checked={selectedIds.has(c.id)} readOnly />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "var(--text-1)",
                        fontFamily: "var(--font-mono)",
                        fontSize: ".84rem",
                      }}
                    >
                      #{c.displayId}
                    </div>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "var(--emerald)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      ৳{c.netPayable.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: ".70rem",
                      color: "var(--text-3)",
                      fontFamily: "var(--font-bn)",
                      marginTop: 2,
                    }}
                  >
                    {c.date} • মোট ৳{c.grossAmount} • কমিশন {c.commissionRate}% (৳{c.commissionFee})
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedIds.size > 0 && (
            <div
              style={{
                background: "var(--orange-glass)",
                border: "1px solid var(--border-orange)",
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: ".74rem",
                    color: "var(--text-3)",
                    fontFamily: "var(--font-bn)",
                  }}
                >
                  {selectedIds.size}টি অর্ডার সিলেক্ট
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--orange)" }}>
                  ৳{totalSelected.toLocaleString()}
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ width: "auto", padding: "12px 20px" }}
                onClick={handleSubmit}
                disabled={isSubmitting || totalSelected < 100}
              >
                {isSubmitting ? "পাঠানো হচ্ছে..." : "📤 রিকোয়েস্ট পাঠান"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title">কোনো পেন্ডিং সেটেলমেন্ট নেই</div>
          <div className="empty-state-text">সমস্ত অর্ডারের পেমেন্ট সেটেল হয়ে গেছে।</div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SettlementsPage() {
  const { ledger, payouts, loading, error, availableBalance, totalCompleted, reload } =
    useSettlementsData();
  const [activeTab, setActiveTab] = useState<"withdraw" | "settlement">("withdraw");

  return (
    <div className="page-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1
            style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "var(--text-1)",
              fontFamily: "var(--font-bn)",
            }}
          >
            💰 উইথড্র ও সেটেলমেন্ট
          </h1>
          <p
            style={{
              fontSize: ".78rem",
              color: "var(--text-3)",
              fontFamily: "var(--font-bn)",
              marginTop: 3,
            }}
          >
            আপনার দোকান থেকে অর্জিত অর্থ উত্তোলন ও সেটেলমেন্ট পরিচালনা
          </p>
        </div>
        <button
          onClick={reload}
          className="btn-secondary"
          style={{ width: "auto", padding: "8px 12px", fontSize: ".76rem", gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> রিফ্রেশ
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "var(--red-glass)",
            border: "1px solid var(--red-glow)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: ".80rem",
            color: "var(--red)",
            fontFamily: "var(--font-bn)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-card-icon emerald">💵</div>
          <div className="stat-card-label">উপলব্ধ ব্যালেন্স</div>
          <div className="stat-card-value" style={{ color: "var(--emerald)" }}>
            ৳{availableBalance.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange">✅</div>
          <div className="stat-card-label">মোট উত্তোলিত</div>
          <div className="stat-card-value">৳{totalCompleted.toLocaleString()}</div>
        </div>
      </div>

      <div className="tab-bar">
        <button
          className={`tab-btn${activeTab === "withdraw" ? " active" : ""}`}
          onClick={() => setActiveTab("withdraw")}
        >
          💸 উইথড্র ({payouts.length})
        </button>
        <button
          className={`tab-btn${activeTab === "settlement" ? " active" : ""}`}
          onClick={() => setActiveTab("settlement")}
        >
          📦 সেটেলমেন্ট ({ledger.filter((c) => c.settlementStatus === "PENDING").length})
        </button>
      </div>

      {loading && payouts.length === 0 && ledger.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Loader2 size={24} className="animate-spin text-emerald-500 mx-auto mb-2" />
          <div style={{ fontSize: ".82rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
            ডাটাবেজ থেকে সেটেলমেন্ট তথ্য লোড হচ্ছে...
          </div>
        </div>
      ) : activeTab === "withdraw" ? (
        <WithdrawTab
          availableBalance={availableBalance}
          payouts={payouts}
          reload={reload}
        />
      ) : (
        <SettlementTab ledger={ledger} reload={reload} />
      )}
    </div>
  );
}
