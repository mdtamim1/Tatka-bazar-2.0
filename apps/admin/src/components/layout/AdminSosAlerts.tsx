"use client";

import React, { useState, useEffect, useRef } from "react";

export interface AdminSosAlert {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  lat: number;
  lng: number;
  status: "ACTIVE" | "RESOLVED";
  triggeredAt: string;
  reason?: string;
}

const STORAGE_KEY = "tatka_active_sos_alerts";

export function AdminSosAlerts() {
  const [activeAlerts, setActiveAlerts] = useState<AdminSosAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AdminSosAlert | null>(null);

  useEffect(() => {
    checkAlerts();
    const interval = setInterval(checkAlerts, 3000);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) checkAlerts();
    };
    const handleCustom = () => checkAlerts();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("tatka_sos_alert_change", handleCustom);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("tatka_sos_alert_change", handleCustom);
    };
  }, []);

  function checkAlerts() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list: AdminSosAlert[] = JSON.parse(raw);
        const actives = list.filter((a) => a.status === "ACTIVE");
        setActiveAlerts(actives);
        if (selectedAlert && !actives.some((a) => a.id === selectedAlert.id)) {
          setSelectedAlert(null);
        }
      } else {
        setActiveAlerts([]);
      }
    } catch {
      setActiveAlerts([]);
    }
  }

  function resolveAlert(id: string) {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list: AdminSosAlert[] = JSON.parse(raw);
        const updated = list.map((a) => (a.id === id ? { ...a, status: "RESOLVED" as const } : a))
          .filter((a) => a.status === "ACTIVE");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("tatka_sos_alert_change", { detail: { resolvedId: id } }));
        setActiveAlerts(updated);
        setSelectedAlert(null);
      }
    } catch {}
  }

  if (activeAlerts.length === 0) return null;

  const currentAlert = activeAlerts[0]!;

  return (
    <>
      {/* ── High-Priority Pulsing Red Emergency Banner ── */}
      <div
        id="admin-sos-banner"
        onClick={() => setSelectedAlert(currentAlert)}
        style={{
          background: "linear-gradient(90deg, #7f1d1d 0%, #dc2626 50%, #7f1d1d 100%)",
          color: "#ffffff",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          borderBottom: "2px solid #ef4444",
          boxShadow: "0 4px 20px rgba(220, 38, 38, 0.4)",
          zIndex: 9999,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.5rem", animation: "bounce 1s infinite" }}>🚨</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong style={{ fontSize: ".92rem", textTransform: "uppercase", letterSpacing: ".06em", color: "#fef08a" }}>
                জরুরি বিপদ সংকেত (SOS ALERT)!
              </strong>
              <span style={{ background: "rgba(0,0,0,0.4)", padding: "2px 8px", borderRadius: 999, fontSize: ".72rem" }}>
                {activeAlerts.length > 1 ? `${activeAlerts.length} জন রাইডার` : "১ জন রাইডার"}
              </span>
            </div>
            <div style={{ fontSize: ".82rem", opacity: 0.95, marginTop: 2 }}>
              রাইডার <strong>{currentAlert.riderName}</strong> ({currentAlert.riderPhone}) সাহায্য চেয়েছেন — তাৎক্ষণিক পদক্ষেপ নিন!
            </div>
          </div>
        </div>

        <button
          type="button"
          style={{
            background: "#ffffff",
            color: "#991b1b",
            border: "none",
            borderRadius: "999px",
            padding: "6px 16px",
            fontSize: ".78rem",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          লোকেশন ও কন্ট্রোল রুম খুলুন →
        </button>
      </div>

      {/* ── Control Room Modal ── */}
      {selectedAlert && (
        <AdminSosModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onResolve={() => resolveAlert(selectedAlert.id)}
        />
      )}
    </>
  );
}

function AdminSosModal({
  alert,
  onClose,
  onResolve,
}: {
  alert: AdminSosAlert;
  onClose: () => void;
  onResolve: () => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let isMounted = true;
    import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current) return;

      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }

      const map = L.map(mapRef.current, {
        center: [alert.lat, alert.lng],
        zoom: 16,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const sirenIcon = L.divIcon({
        className: "sos-map-icon",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:rgba(239,68,68,0.4);animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:28px;height:28px;border-radius:50%;background:#ef4444;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 15px #ef4444;z-index:2;">
              🚨
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      L.marker([alert.lat, alert.lng], { icon: sirenIcon })
        .addTo(map)
        .bindPopup(`<strong>${alert.riderName}</strong><br/>বিপদের স্থান`)
        .openPopup();

      leafletMap.current = map;
    });

    return () => {
      isMounted = false;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [alert]);

  const googleMapsUrl = `https://www.google.com/maps?q=${alert.lat},${alert.lng}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "var(--bg-raised)",
          border: "2px solid #ef4444",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 0 50px rgba(239,68,68,0.4)",
          color: "var(--text-1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(90deg, #991b1b 0%, #b91c1c 100%)",
            color: "#fff",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.6rem" }}>🚨</span>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 800 }}>
                ইমার্জেন্সি এসওএস কন্ট্রোল রুম
              </div>
              <div style={{ fontSize: ".76rem", color: "#fca5a5" }}>
                বিপদ সংকেতের সময়: {new Date(alert.triggeredAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "none",
              color: "#fff",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px" }}>
          {/* Rider Info Card */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              background: "var(--bg-base)",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid var(--border-1)",
              marginBottom: "16px",
            }}
          >
            <div>
              <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>রাইডারের নাম</div>
              <div style={{ fontSize: ".92rem", fontWeight: 800, color: "var(--text-1)" }}>
                {alert.riderName}
              </div>
            </div>
            <div>
              <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>মোবাইল নম্বর</div>
              <div>
                <a
                  href={`tel:${alert.riderPhone}`}
                  style={{
                    fontSize: ".88rem",
                    fontWeight: 800,
                    color: "var(--orange)",
                    textDecoration: "none",
                  }}
                >
                  📞 {alert.riderPhone}
                </a>
              </div>
            </div>
            <div>
              <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>জিপিএস কো-অর্ডিনেট</div>
              <div style={{ fontSize: ".76rem", color: "var(--text-2)", fontFamily: "monospace" }}>
                📍 {alert.lat.toFixed(5)}, {alert.lng.toFixed(5)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>স্ট্যাটাস</div>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "rgba(239,68,68,0.2)",
                  color: "#ef4444",
                  fontSize: ".72rem",
                  fontWeight: 800,
                  border: "1px solid rgba(239,68,68,0.4)",
                }}
              >
                🔴 EMERGENCY ACTIVE
              </span>
            </div>
          </div>

          {/* Quick Call Emergency Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <a
              href={`tel:${alert.riderPhone}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "10px",
                borderRadius: "10px",
                background: "rgba(255,122,0,0.12)",
                border: "1.5px solid rgba(255,122,0,0.4)",
                color: "var(--orange)",
                fontWeight: 700,
                fontSize: ".84rem",
                textDecoration: "none",
              }}
            >
              📞 রাইডারকে কল করুন
            </a>

            <a
              href="tel:999"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "10px",
                borderRadius: "10px",
                background: "rgba(239,68,68,0.15)",
                border: "1.5px solid rgba(239,68,68,0.4)",
                color: "#ef4444",
                fontWeight: 700,
                fontSize: ".84rem",
                textDecoration: "none",
              }}
            >
              🚔 জাতীয় জরুরি সেবা (৯৯৯)
            </a>
          </div>

          {/* Leaflet Map Card */}
          <div
            style={{
              height: "220px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid var(--border-2)",
              position: "relative",
              marginBottom: "16px",
            }}
          >
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                zIndex: 1000,
                background: "rgba(10,15,26,0.9)",
                color: "var(--text-1)",
                border: "1px solid var(--border-2)",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: ".72rem",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Google Maps-এ খুলুন ↗
            </a>
          </div>

          {/* Resolve Action Button */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onResolve}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                border: "none",
                fontSize: ".88rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
              }}
            >
              ✅ বিপদ চিহ্নিত ও সমাধান করা হয়েছে (Resolve SOS)
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 18px",
                borderRadius: "12px",
                background: "var(--bg-card)",
                color: "var(--text-2)",
                border: "1px solid var(--border-1)",
                fontSize: ".88rem",
                cursor: "pointer",
              }}
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
