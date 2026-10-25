"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useVendorStore } from "@/store/vendorStore";
import { clearToken } from "@/lib/api";

const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <div style={{
    background: "var(--bg-card)",
    border: "1px solid var(--border-1)",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
  }}>
    <div style={{
      padding: "14px 18px",
      borderBottom: "1px solid var(--border-1)",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-2)" }}>{title}</span>
    </div>
    <div>{children}</div>
  </div>
);

const Row = ({
  label,
  sublabel,
  value,
  onClick,
  danger,
  disabled,
}: {
  label: string;
  sublabel?: string;
  value?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) => (
  <div
    onClick={disabled ? undefined : onClick}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      cursor: onClick && !disabled ? "pointer" : "default",
      transition: "background 0.15s",
      opacity: disabled ? 0.4 : 1,
    }}
    onMouseEnter={(e) => {
      if (onClick && !disabled)
        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.background = "transparent";
    }}
  >
    <div>
      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: danger ? "#EF4444" : "var(--text-1)" }}>
        {label}
      </div>
      {sublabel && (
        <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 2 }}>{sublabel}</div>
      )}
    </div>
    {value !== undefined ? (
      <div style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>{value}</div>
    ) : onClick ? (
      <span style={{ color: "var(--text-4)", fontSize: 16 }}>›</span>
    ) : null}
  </div>
);

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    style={{
      width: 44,
      height: 24,
      borderRadius: 99,
      background: on ? "var(--orange)" : "rgba(255,255,255,0.1)",
      border: "none",
      cursor: "pointer",
      position: "relative",
      transition: "background 0.2s",
      flexShrink: 0,
    }}
  >
    <span style={{
      position: "absolute",
      top: 2,
      left: on ? 22 : 2,
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "white",
      transition: "left 0.2s",
      boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
    }} />
  </button>
);

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, notifications: storeNotifs } = useVendorStore();
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);

  const handleLogout = () => {
    if (confirm("আপনি কি সত্যিই লগআউট করতে চান?")) {
      clearToken();
      router.replace("/login");
    }
  };

  return (
    <div className="page-content" style={{ paddingBottom: "calc(var(--nav-h) + 20px)" }}>
      {/* Header */}
      <div style={{ paddingBottom: 4 }}>
        <h1 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-1)" }}>⚙️ সেটিংস</h1>
        <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 4 }}>
          অ্যাকাউন্ট, নোটিফিকেশন ও অ্যাপ পছন্দ
        </p>
      </div>

      {/* Account */}
      <Section title="অ্যাকাউন্ট ও প্রোফাইল" icon="👤">
        <Row
          label="প্রোফাইল সম্পাদনা"
          sublabel="নাম, ফোন, ঠিকানা পরিবর্তন করুন"
          onClick={() => router.push("/profile")}
        />
        <Row
          label="পাসওয়ার্ড পরিবর্তন"
          sublabel="নিরাপদ থাকুন, নিয়মিত পাসওয়ার্ড বদলান"
          onClick={() => router.push("/profile?tab=security")}
        />
        <Row
          label="দোকানের তথ্য"
          sublabel="দোকানের নাম, ক্যাটাগরি, বিবরণ"
          onClick={() => router.push("/profile?tab=store")}
        />
      </Section>

      {/* Notifications */}
      <Section title="নোটিফিকেশন" icon="🔔">
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-1)" }}>অর্ডার অ্যালার্ট</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 2 }}>নতুন অর্ডার আসলে সতর্কতা দিন</div>
          </div>
          <Toggle on={orderAlerts} onToggle={() => setOrderAlerts(p => !p)} />
        </div>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-1)" }}>সাউন্ড অ্যালার্ট</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 2 }}>নতুন অর্ডারে শব্দ বাজবে</div>
          </div>
          <Toggle on={soundAlerts} onToggle={() => setSoundAlerts(p => !p)} />
        </div>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-1)" }}>পুশ নোটিফিকেশন</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 2 }}>ব্রাউজার বন্ধ থাকলেও জানান দেবে</div>
          </div>
          <Toggle on={pushNotifs} onToggle={() => setPushNotifs(p => !p)} />
        </div>
      </Section>

      {/* Orders */}
      <Section title="অর্ডার পরিচালনা" icon="📦">
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-1)" }}>অটো-অ্যাকসেপ্ট</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 2 }}>অর্ডার স্বয়ংক্রিয়ভাবে গ্রহণ (⚠️ পরীক্ষামূলক)</div>
          </div>
          <Toggle on={autoAccept} onToggle={() => setAutoAccept(p => !p)} />
        </div>
        <Row
          label="অর্ডার প্রস্তুতির সময়"
          sublabel="ডিফল্ট প্যাকিং সময় নির্ধারণ"
          value="৩০ মিনিট"
          onClick={() => {}}
        />
      </Section>

      {/* Appearance */}
      <Section title="অ্যাপ চেহারা" icon="🎨">
        <Row
          label="ভাষা"
          sublabel="বাংলা / English"
          value={language === "bn" ? "বাংলা 🇧🇩" : "English 🇬🇧"}
          onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
        />
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-1)" }}>ডার্ক মোড</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 2 }}>গাঢ় থিম (সবসময় চালু থাকার সুপারিশ)</div>
          </div>
          <Toggle on={darkMode} onToggle={() => setDarkMode(p => !p)} />
        </div>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-1)" }}>কম্প্যাক্ট ভিউ</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 2 }}>ছোট কার্ড, বেশি তথ্য একসাথে</div>
          </div>
          <Toggle on={compactView} onToggle={() => setCompactView(p => !p)} />
        </div>
      </Section>

      {/* Links */}
      <Section title="তথ্য ও সহায়তা" icon="ℹ️">
        <Row label="ভেন্ডর চুক্তিপত্র" sublabel="শর্তাবলী পড়ুন" onClick={() => {}} />
        <Row label="গোপনীয়তা নীতি" onClick={() => {}} />
        <Row label="কেন্দ্রীয় সহায়তা" sublabel="01700-000000" onClick={() => {}} />
        <Row label="অ্যাপ সংস্করণ" value="v2.0.1" />
      </Section>

      {/* Danger Zone */}
      <Section title="অ্যাকাউন্ট" icon="🔐">
        <Row
          label="লগআউট"
          sublabel="এই ডিভাইস থেকে বের হয়ে যান"
          danger
          onClick={handleLogout}
        />
      </Section>
    </div>
  );
}
