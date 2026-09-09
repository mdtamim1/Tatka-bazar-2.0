"use client";
import React, { useState } from "react";
import { useVendorStore } from "@/store/vendorStore";
import { PayoutMethod } from "@/types/vendor";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING:          { label: "অপেক্ষমাণ", cls: "badge-amber" },
    APPROVED:         { label: "অনুমোদিত", cls: "badge-emerald" },
    OTP_SENT:         { label: "OTP পাঠানো হয়েছে", cls: "badge-emerald" },
    RIDER_DISPATCHED: { label: "রাইডার ডিসপ্যাচড", cls: "badge-emerald" },
    COMPLETED:        { label: "সম্পন্ন", cls: "badge-emerald" },
    REJECTED:         { label: "বাতিল", cls: "badge-red" },
    PROCESSING:       { label: "প্রক্রিয়াধীন", cls: "badge-amber" },
  };
  const { label, cls } = map[status] || { label: status, cls: "badge-slate" };
  return <span className={cls}>{label}</span>;
}

function OTPModal({
  isOpen, onClose, onVerify, riderName, amount, otpForDemo,
}: {
  isOpen: boolean; onClose: () => void;
  onVerify: (otp: string) => boolean;
  riderName?: string; amount: number; otpForDemo?: string;
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
      setTimeout(() => { onClose(); setSuccess(false); setOtp(""); setError(""); }, 2000);
    } else {
      setError("ভুল OTP! রাইডারের কাছ থেকে সঠিক কোডটি নিন।");
      setShake(true); setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 460, borderRadius: "28px 28px 0 0" }}>
        <div className="modal-handle" />
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg,#22C55E,#16A34A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.8rem", margin: "0 auto 12px",
            boxShadow: "0 0 24px rgba(34,197,94,.4)"
          }}>🔐</div>
          <div className="modal-title">OTP যাচাই করুন</div>
          <p style={{ fontSize: ".82rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 6 }}>
            {riderName || "রাইডার"} আপনার কাছে নগদ ৳{amount.toLocaleString()} নিয়ে এসেছেন।
            <br />রাইডারের কাছ থেকে ৬-ডিজিটের OTP নিন।
          </p>
        </div>

        {otpForDemo && (
          <div style={{
            background: "rgba(245,158,11,.08)", border: "1px dashed rgba(245,158,11,.4)",
            borderRadius: 12, padding: "10px 14px", textAlign: "center",
            fontSize: ".78rem", color: "var(--amber)", fontFamily: "var(--font-bn)"
          }}>
            🎭 <strong>Demo OTP (রাইডার সিমুলেশন):</strong>{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 800, letterSpacing: 4 }}>
              {otpForDemo}
            </span>
          </div>
        )}

        {error && (
          <div style={{
            background: "var(--red-glass)", border: "1px solid var(--red-glow)",
            borderRadius: 10, padding: "10px 14px", fontSize: ".80rem",
            color: "var(--red)", fontFamily: "var(--font-bn)", textAlign: "center"
          }}>{error}</div>
        )}

        {success ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: "3rem" }}>✅</div>
            <div style={{ color: "var(--emerald)", fontWeight: 800, fontFamily: "var(--font-bn)", marginTop: 8 }}>
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
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                placeholder="______"
                style={{ animation: shake ? "shake 0.5s" : "none" }}
                autoFocus
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
              <button className="btn-secondary" onClick={onClose}>বাতিল</button>
              <button className="btn-primary" onClick={handleVerify} disabled={otp.length < 6}>
                ⚡ যাচাই করুন
              </button>
            </div>
          </>
        )}
      </div>
      <style>{"@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}"}</style>
    </div>
  );
}

function RequestStepper({ statusKeys, labels, descs, currentStatus }:
  { statusKeys: string[]; labels: string[]; descs: string[]; currentStatus: string }) {
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
function WithdrawTab() {
  const {
    commissionLedger, profile, withdrawRequests,
    requestWithdraw, approveWithdrawSimulate, verifyWithdrawOTP,
  } = useVendorStore();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PayoutMethod>(profile.payoutMethod || "BKASH");
  const [account, setAccount] = useState(profile.payoutAccount || "");
  const [formError, setFormError] = useState("");
  const [otpModal, setOtpModal] = useState<{ requestId: string; amount: number; otp?: string } | null>(null);

  const availableBalance = commissionLedger
    .filter((c) => c.settlementStatus === "PENDING")
    .reduce((sum, c) => sum + c.netPayable, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setFormError("সঠিক পরিমাণ দিন।"); return; }
    if (amt < 100) { setFormError("সর্বনিম্ন উত্তোলন ৳১০০।"); return; }
    requestWithdraw(amt, method, account);
    setAmount(""); setFormError("");
  };

  const handleApproveSimulate = (id: string) => {
    const otp = approveWithdrawSimulate(id) as unknown as string;
    const req = useVendorStore.getState().withdrawRequests.find((r) => r.id === id);
    if (req) setOtpModal({ requestId: id, amount: req.amount, otp });
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
            <span className="currency">৳</span>{availableBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: ".75rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
            কমিশন বাদ দিয়ে পরিষ্কার ব্যালেন্স
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">💸 উইথড্র রিকোয়েস্ট</div>
        {formError && (
          <div style={{ background: "var(--red-glass)", border: "1px solid var(--red-glow)", borderRadius: 10, padding: "10px 14px", fontSize: ".80rem", color: "var(--red)", fontFamily: "var(--font-bn)" }}>
            ⚠️ {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">পরিমাণ (টাকা) *</label>
            <div className="amount-input-wrapper">
              <span className="amount-currency">৳</span>
              <input type="number" min="100" step="50" placeholder="0"
                value={amount} onChange={(e) => { setAmount(e.target.value); setFormError(""); }}
                className="amount-input" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">পেমেন্ট পদ্ধতি *</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as PayoutMethod)}
              className="form-input" style={{ cursor: "pointer" }}>
              <option value="BKASH">📱 bKash মার্চেন্ট (তাৎক্ষণিক)</option>
              <option value="NAGAD">📱 Nagad মার্চেন্ট (তাৎক্ষণিক)</option>
              <option value="BANK_TRANSFER">🏦 ব্যাংক ট্রান্সফার (BEFTN)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">অ্যাকাউন্ট নম্বর *</label>
            <input type="text" value={account} onChange={(e) => setAccount(e.target.value)}
              className="form-input" placeholder="+88018XXXXXXXX" required />
          </div>
          <button type="submit" className="btn-primary">📤 উইথড্র রিকোয়েস্ট পাঠান</button>
        </form>
      </div>

      <div className="info-box green">
        <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div className="info-box-text">
          উইথড্র অনুমোদন হলে একটি OTP তৈরি হবে। রাইডার নগদ নিয়ে আসলে OTP দিয়ে কনফার্ম করুন।
        </div>
      </div>

      {withdrawRequests.length > 0 && (
        <div className="form-section" style={{ gap: 12 }}>
          <div className="form-section-title">📋 উইথড্র হিস্ট্রি</div>
          {withdrawRequests.map((req) => (
            <div key={req.id} style={{
              background: "var(--bg-raised)", border: "1px solid var(--border-2)",
              borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 10
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: ".70rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                    {new Date(req.requestedAt).toLocaleString("bn-BD")}
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--orange)", fontFamily: "var(--font-mono)" }}>
                    ৳{req.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: ".74rem", color: "var(--text-3)" }}>{req.method} • {req.accountDetails}</div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <RequestStepper
                statusKeys={["PENDING", "OTP_SENT", "COMPLETED"]}
                labels={["রিকোয়েস্ট জমা", "OTP পাঠানো হয়েছে", "সম্পন্ন"]}
                descs={[
                  "অ্যাডমিন অনুমোদনের অপেক্ষায়",
                  req.riderName ? `${req.riderName} আপনার কাছে আসছেন` : "রাইডার ডিসপ্যাচড",
                  "নগদ বুঝে পেয়েছেন"
                ]}
                currentStatus={req.status}
              />

              {req.status === "PENDING" && (
                <button className="btn-secondary" style={{ fontSize: ".78rem" }} onClick={() => handleApproveSimulate(req.id)}>
                  🎭 অ্যাডমিন অনুমোদন সিমুলেট করুন (Demo)
                </button>
              )}
              {req.status === "OTP_SENT" && (
                <button className="btn-primary" onClick={() => setOtpModal({ requestId: req.id, amount: req.amount, otp: req.otp })}>
                  🔐 OTP যাচাই করুন
                </button>
              )}
              {req.status === "COMPLETED" && (
                <div style={{ background: "var(--emerald-glass)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 10, padding: "10px 14px", textAlign: "center", fontSize: ".80rem", color: "var(--emerald)", fontFamily: "var(--font-bn)" }}>
                  ✅ নগদ সফলভাবে প্রাপ্ত — {req.completedAt ? new Date(req.completedAt).toLocaleString("bn-BD") : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <OTPModal
        isOpen={!!otpModal} onClose={() => setOtpModal(null)} onVerify={handleOTPVerify}
        riderName={otpModal ? withdrawRequests.find((r) => r.id === otpModal.requestId)?.riderName : undefined}
        amount={otpModal?.amount || 0} otpForDemo={otpModal?.otp}
      />
    </div>
  );
}

// ── Settlement Tab ────────────────────────────────────────────────────────────
function SettlementTab() {
  const {
    commissionLedger, settlementRequests,
    requestSettlement, approveSettlementSimulate, verifySettlementOTP,
  } = useVendorStore();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [otpModal, setOtpModal] = useState<{ requestId: string; amount: number; otp?: string } | null>(null);

  const pendingLedger = commissionLedger.filter((c) => c.settlementStatus === "PENDING");
  const totalSelected = pendingLedger.filter((c) => selectedIds.has(c.id)).reduce((s, c) => s + c.netPayable, 0);

  const toggle = (id: string) => setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelectedIds(selectedIds.size === pendingLedger.length ? new Set() : new Set(pendingLedger.map((c) => c.id)));

  const handleSubmit = () => {
    if (selectedIds.size === 0) return;
    const sel = pendingLedger.filter((c) => selectedIds.has(c.id));
    requestSettlement(sel.map((c) => c.orderId), sel.map((c) => c.displayId), sel.reduce((s, c) => s + c.netPayable, 0));
    setSelectedIds(new Set());
  };

  const handleApproveSimulate = (id: string) => {
    const otp = approveSettlementSimulate(id) as unknown as string;
    const req = useVendorStore.getState().settlementRequests.find((r) => r.id === id);
    if (req) setOtpModal({ requestId: id, amount: req.totalAmount, otp });
  };

  const handleOTPVerify = (otp: string) => {
    if (!otpModal) return false;
    return verifySettlementOTP(otpModal.requestId, otp);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-box green">
        <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div className="info-box-text">
          অর্ডার সিলেক্ট করে সেটেলমেন্ট রিকোয়েস্ট পাঠান। অ্যাডমিন রাইডার পাঠাবে — রাইডার নগদ নিয়ে
          আসলে OTP দিয়ে কনফার্ম করুন।
        </div>
      </div>

      {pendingLedger.length > 0 ? (
        <div className="form-section" style={{ gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="form-section-title" style={{ border: "none", paddingBottom: 0 }}>
              📦 পেন্ডিং সেটেলমেন্ট অর্ডার
            </div>
            <button className="btn-secondary" style={{ width: "auto", padding: "6px 14px", fontSize: ".74rem" }} onClick={toggleAll}>
              {selectedIds.size === pendingLedger.length ? "সব বাতিল" : "সব সিলেক্ট"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingLedger.map((c) => (
              <div key={c.id} className={`settlement-order-row${selectedIds.has(c.id) ? " selected" : ""}`} onClick={() => toggle(c.id)}>
                <input type="checkbox" checked={selectedIds.has(c.id)} readOnly />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-mono)", fontSize: ".84rem" }}>
                      #{c.displayId}
                    </div>
                    <div style={{ fontWeight: 800, color: "var(--emerald)", fontFamily: "var(--font-mono)" }}>
                      ৳{c.netPayable.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: ".70rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 2 }}>
                    {c.date} • গ্রস ৳{c.grossAmount} • কমিশন {c.commissionRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedIds.size > 0 && (
            <div style={{
              background: "var(--orange-glass)", border: "1px solid var(--border-orange)",
              borderRadius: 14, padding: "14px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: ".74rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                  {selectedIds.size}টি অর্ডার সিলেক্ট
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--orange)" }}>
                  ৳{totalSelected.toLocaleString()}
                </div>
              </div>
              <button className="btn-primary" style={{ width: "auto", padding: "12px 20px" }} onClick={handleSubmit}>
                📤 রিকোয়েস্ট পাঠান
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title">কোনো পেন্ডিং সেটেলমেন্ট নেই</div>
          <div className="empty-state-text">সমস্ত অর্ডার সেটেল হয়ে গেছে।</div>
        </div>
      )}

      {settlementRequests.length > 0 && (
        <div className="form-section" style={{ gap: 12 }}>
          <div className="form-section-title">📋 সেটেলমেন্ট রিকোয়েস্ট হিস্ট্রি</div>
          {settlementRequests.map((req) => (
            <div key={req.id} style={{
              background: "var(--bg-raised)", border: "1px solid var(--border-2)",
              borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 10
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: ".70rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                    {new Date(req.requestedAt).toLocaleString("bn-BD")}
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--orange)", fontFamily: "var(--font-mono)" }}>
                    ৳{req.totalAmount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: ".70rem", color: "var(--text-3)", fontFamily: "var(--font-bn)" }}>
                    অর্ডার: {req.orderDisplayIds.map((d) => `#${d}`).join(", ")}
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <RequestStepper
                statusKeys={["PENDING", "OTP_SENT", "COMPLETED"]}
                labels={["রিকোয়েস্ট জমা", "রাইডার ডিসপ্যাচড", "সম্পন্ন"]}
                descs={[
                  "অ্যাডমিন অনুমোদনের অপেক্ষায়",
                  req.riderName ? `${req.riderName} আপনার কাছে আসছেন` : "রাইডার নগদ নিয়ে আসছে",
                  "নগদ বুঝে পেয়েছেন"
                ]}
                currentStatus={req.status === "RIDER_DISPATCHED" ? "OTP_SENT" : req.status}
              />

              {req.status === "PENDING" && (
                <button className="btn-secondary" style={{ fontSize: ".78rem" }} onClick={() => handleApproveSimulate(req.id)}>
                  🎭 অ্যাডমিন অনুমোদন সিমুলেট করুন (Demo)
                </button>
              )}
              {(req.status === "OTP_SENT" || req.status === "RIDER_DISPATCHED") && (
                <button className="btn-primary" onClick={() => setOtpModal({ requestId: req.id, amount: req.totalAmount, otp: req.otp })}>
                  🔐 OTP যাচাই করুন
                </button>
              )}
              {req.status === "COMPLETED" && (
                <div style={{ background: "var(--emerald-glass)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 10, padding: "10px 14px", textAlign: "center", fontSize: ".80rem", color: "var(--emerald)", fontFamily: "var(--font-bn)" }}>
                  ✅ সেটেলমেন্ট সম্পন্ন — {req.completedAt ? new Date(req.completedAt).toLocaleString("bn-BD") : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <OTPModal
        isOpen={!!otpModal} onClose={() => setOtpModal(null)} onVerify={handleOTPVerify}
        riderName={otpModal ? settlementRequests.find((r) => r.id === otpModal.requestId)?.riderName : undefined}
        amount={otpModal?.amount || 0} otpForDemo={otpModal?.otp}
      />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SettlementsPage() {
  const { commissionLedger, withdrawRequests, settlementRequests } = useVendorStore();
  const [activeTab, setActiveTab] = useState<"withdraw" | "settlement">("withdraw");

  const availableBalance = commissionLedger.filter((c) => c.settlementStatus === "PENDING").reduce((s, c) => s + c.netPayable, 0);
  const totalCompleted = [...withdrawRequests.filter((r) => r.status === "COMPLETED").map((r) => r.amount),
    ...settlementRequests.filter((r) => r.status === "COMPLETED").map((r) => r.totalAmount)].reduce((a, b) => a + b, 0);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px calc(var(--nav-h) + 24px)", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-bn)" }}>
          💰 উইথড্র ও সেটেলমেন্ট
        </h1>
        <p style={{ fontSize: ".78rem", color: "var(--text-3)", fontFamily: "var(--font-bn)", marginTop: 3 }}>
          আপনার আয় উত্তোলন করুন — সরাসরি উইথড্র বা অর্ডার সেটেলমেন্টের মাধ্যমে
        </p>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-card-icon emerald">💵</div>
          <div className="stat-card-label">উপলব্ধ ব্যালেন্স</div>
          <div className="stat-card-value" style={{ color: "var(--emerald)" }}>৳{availableBalance.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange">✅</div>
          <div className="stat-card-label">মোট উত্তোলিত</div>
          <div className="stat-card-value">৳{totalCompleted.toLocaleString()}</div>
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn${activeTab === "withdraw" ? " active" : ""}`} onClick={() => setActiveTab("withdraw")}>
          💸 উইথড্র
        </button>
        <button className={`tab-btn${activeTab === "settlement" ? " active" : ""}`} onClick={() => setActiveTab("settlement")}>
          📦 সেটেলমেন্ট
        </button>
      </div>

      {activeTab === "withdraw" ? <WithdrawTab /> : <SettlementTab />}
    </div>
  );
}
