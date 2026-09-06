"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Phone, Send, ShieldCheck, MapPin, Navigation, Clock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CustomerLiveTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  orderNumber?: string;
  deliveryAddress?: string;
  total?: number;
}

interface ChatMsg {
  id: string;
  sender: "RIDER" | "CUSTOMER" | "SUPPORT";
  senderName: string;
  text: string;
  timestamp: string;
}

export function CustomerLiveTrackingModal({
  isOpen,
  onClose,
  orderId = "TB-8942",
  orderNumber = "TB-8942",
  deliveryAddress = "বাড়ি #৪২, রোড #৭/এ, ধানমন্ডি, ঢাকা",
  total = 1530,
}: CustomerLiveTrackingModalProps) {
  const { locale } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);

  // Live coordinates in Dhaka
  const [riderCoords, setRiderCoords] = useState<{ lat: number; lng: number }>({
    lat: 23.7505,
    lng: 90.3855,
  });

  const customerCoords = { lat: 23.7461, lng: 90.3742 }; // Dhanmondi
  const vendorCoords = { lat: 23.7588, lng: 90.3902 }; // Farmgate vendor

  // Chat state
  const channelId = "task-01"; // Unified with active demo task
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Customer Delivery OTP Code (Proof of Delivery)
  const deliveryOtp = "4826";

  useEffect(() => {
    if (!isOpen) return;

    // 1. Load initial chat messages
    loadMessages();

    // Listen for incoming messages from rider
    const handleChatUpdate = (e: any) => {
      loadMessages();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes("tatka_chat") || e.key?.includes("rider_gps")) {
        loadMessages();
        loadRiderGps();
      }
    };

    window.addEventListener("tatka_chat_updated", handleChatUpdate);
    window.addEventListener("storage", handleStorage);

    // 2. Poll rider GPS or smooth move
    loadRiderGps();
    const gpsInterval = setInterval(() => {
      // Simulate minor progress towards customer if idle
      setRiderCoords((prev) => {
        const stepLat = (customerCoords.lat - prev.lat) * 0.04;
        const stepLng = (customerCoords.lng - prev.lng) * 0.04;
        const next = {
          lat: prev.lat + stepLat,
          lng: prev.lng + stepLng,
        };
        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng([next.lat, next.lng]);
        }
        return next;
      });
    }, 4000);

    return () => {
      window.removeEventListener("tatka_chat_updated", handleChatUpdate);
      window.removeEventListener("storage", handleStorage);
      clearInterval(gpsInterval);
    };
  }, [isOpen]);

  function loadRiderGps() {
    try {
      const raw = localStorage.getItem("rider_gps_rider-demo-01");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.lat && parsed.lng) {
          setRiderCoords({ lat: parsed.lat, lng: parsed.lng });
          if (riderMarkerRef.current) {
            riderMarkerRef.current.setLatLng([parsed.lat, parsed.lng]);
          }
        }
      }
    } catch {}
  }

  function loadMessages() {
    try {
      const raw = localStorage.getItem(`tatka_chat_${channelId}`);
      if (raw) {
        setMessages(JSON.parse(raw));
      } else {
        // Sample starter message from rider
        const starter: ChatMsg[] = [
          {
            id: "m-1",
            sender: "RIDER",
            senderName: "তামীম ইকবাল (রাইডার)",
            text: "আসসালামু আলাইকুম, আমি ভেন্ডর থেকে আপনার পার্সেল সংগ্রহ করেছি। আপনার ঠিকানায় রওনা দিচ্ছি 🛵",
            timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          },
        ];
        setMessages(starter);
        localStorage.setItem(`tatka_chat_${channelId}`, JSON.stringify(starter));
      }
    } catch {}
  }

  function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userRaw = localStorage.getItem("tatka_user");
    let senderName = "কাস্টমার";
    if (userRaw) {
      try { senderName = JSON.parse(userRaw).name || "কাস্টমার"; } catch {}
    }

    const newMsg: ChatMsg = {
      id: `msg-${Date.now()}`,
      sender: "CUSTOMER",
      senderName,
      text,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    if (!textToSend) setInputText("");

    try {
      localStorage.setItem(`tatka_chat_${channelId}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("tatka_chat_updated", { detail: { channelId, message: newMsg } }));
    } catch {}

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let isMounted = true;
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean old instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([riderCoords.lat, riderCoords.lng], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Rider Marker Icon (pulsing bike)
      const riderIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; inset:0; border-radius:50%; background:rgba(0,214,143,0.3); animation:pulse 2s infinite;"></div>
            <div style="width:36px; height:36px; border-radius:50%; background:#051322; border:2.5px solid #00d68f; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 4px 12px rgba(0,214,143,0.5);">
              🛵
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      // Customer Pin Icon
      const customerIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
            <div style="width:34px; height:34px; border-radius:50%; background:#ff5722; border:2px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:16px; color:#fff; box-shadow:0 4px 12px rgba(255,87,34,0.4);">
              📍
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Vendor Store Icon
      const vendorIcon = L.divIcon({
        className: "",
        html: `
          <div style="width:32px; height:32px; border-radius:50%; background:#0f172a; border:2px solid #f59e0b; display:flex; align-items:center; justify-content:center; font-size:15px; color:#fff;">
            🏪
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const rMarker = L.marker([riderCoords.lat, riderCoords.lng], { icon: riderIcon }).addTo(map);
      riderMarkerRef.current = rMarker;

      L.marker([customerCoords.lat, customerCoords.lng], { icon: customerIcon })
        .addTo(map)
        .bindPopup("<b>আপনার ডেলিভারি ঠিকানা</b><br>" + deliveryAddress);

      L.marker([vendorCoords.lat, vendorCoords.lng], { icon: vendorIcon })
        .addTo(map)
        .bindPopup("<b>সাদিক এগ্রো ফ্রেশ ফুডস</b>");

      // Polyline route
      const latlngs: [number, number][] = [
        [vendorCoords.lat, vendorCoords.lng],
        [riderCoords.lat, riderCoords.lng],
        [customerCoords.lat, customerCoords.lng],
      ];
      L.polyline(latlngs, {
        color: "#00d68f",
        weight: 4,
        dashArray: "6, 8",
        opacity: 0.85,
      }).addTo(map);

      // Fit bounds to show rider and destination
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [35, 35] });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "28px",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-body, system-ui, sans-serif)",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                লাইভ ট্র্যাকিং
              </span>
              <span
                style={{
                  fontSize: ".72rem",
                  fontWeight: 800,
                  color: "#059669",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  padding: "2px 8px",
                  borderRadius: "999px",
                }}
              >
                🟢 রাইডার পথে আছেন
              </span>
            </div>
            <div style={{ fontSize: ".76rem", color: "#64748b", marginTop: 2 }}>
              অর্ডার #{orderNumber} • {deliveryAddress}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Leaflet Map Card */}
        <div style={{ padding: "16px 20px 0 20px" }}>
          <div
            ref={mapContainerRef}
            style={{
              width: "100%",
              height: "230px",
              borderRadius: "18px",
              overflow: "hidden",
              border: "1.5px solid #e2e8f0",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
            }}
          />
        </div>

        {/* Rider Info Strip */}
        <div style={{ padding: "14px 20px 0 20px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              color: "#ffffff",
              borderRadius: "18px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#00d68f",
                  color: "#051322",
                  fontSize: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                }}
              >
                🛵
              </div>
              <div>
                <div style={{ fontSize: ".92rem", fontWeight: 800 }}>তামীম ইকবাল</div>
                <div style={{ fontSize: ".74rem", color: "#94a3b8" }}>
                  রাইডার (হোন্ডা বাইক) • আনুমানিক ১২-১৫ মিনিট
                </div>
              </div>
            </div>

            <a
              href="tel:01700000001"
              style={{
                background: "rgba(0, 214, 143, 0.15)",
                border: "1px solid #00d68f",
                color: "#00d68f",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: ".78rem",
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Phone size={14} />
              <span>কল দিন</span>
            </a>
          </div>
        </div>

        {/* Customer Proof-of-Delivery OTP Box */}
        <div style={{ padding: "14px 20px 0 20px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(0, 214, 143, 0.08), rgba(16, 185, 129, 0.03))",
              border: "1.5px dashed #00d68f",
              borderRadius: "18px",
              padding: "14px 18px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: ".76rem", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: ".06em" }}>
              🔐 আপনার ডেলিভারি ওটিপি (Proof of Delivery)
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", letterSpacing: 6, margin: "6px 0 4px 0" }}>
              {deliveryOtp}
            </div>
            <div style={{ fontSize: ".74rem", color: "#64748b" }}>
              রাইডার পার্সেল পৌঁছে দিলে এই ৪-সংখ্যার ওটিপি কোডটি তাকে দিন। ওটিপি যাচাইয়ের পর ডেলিভারি নিশ্চিত হবে।
            </div>
          </div>
        </div>

        {/* In-App Chat with Rider */}
        <div style={{ padding: "16px 20px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: ".84rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
            <span>💬 রাইডারের সাথে লাইভ চ্যাট / SMS</span>
            <span style={{ fontSize: ".68rem", background: "#ecfdf5", color: "#059669", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
              রেজিস্টার্ড
            </span>
          </div>

          {/* Quick Preset Reply Chips */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {[
              "আমি নিচে দারোয়ানকে বলে রাখছি 🏢",
              "একটু পরেই নিচে আসছি, অপেক্ষা করুন 🛵",
              "ফোন ধরছি, ১ মিনিট 📞",
              "৫ তলায় পাঠিয়ে দিন প্লিজ 🚪",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSendMessage(chip)}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: "999px",
                  padding: "5px 10px",
                  fontSize: ".70rem",
                  fontWeight: 600,
                  color: "#334155",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Box */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "12px",
              height: "150px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: ".76rem" }}>
                রাইডারের সাথে মেসেজ আদান-প্রদান করতে নিচে টাইপ করুন।
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender === "CUSTOMER";
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                      background: isMe ? "#0f172a" : "#ffffff",
                      color: isMe ? "#ffffff" : "#0f172a",
                      border: isMe ? "none" : "1px solid #e2e8f0",
                      padding: "8px 12px",
                      borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    }}
                  >
                    {!isMe && (
                      <div style={{ fontSize: ".64rem", fontWeight: 800, color: "#00d68f", marginBottom: 2 }}>
                        {m.senderName}
                      </div>
                    )}
                    <div style={{ fontSize: ".78rem", lineHeight: 1.4 }}>{m.text}</div>
                    <div
                      style={{
                        fontSize: ".60rem",
                        color: isMe ? "#94a3b8" : "#94a3b8",
                        textAlign: "right",
                        marginTop: 3,
                      }}
                    >
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="রাইডারকে মেসেজ লিখুন..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                fontSize: ".82rem",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              style={{
                background: "#00d68f",
                color: "#051322",
                border: "none",
                borderRadius: "12px",
                padding: "0 16px",
                fontWeight: 800,
                fontSize: ".82rem",
                cursor: inputText.trim() ? "pointer" : "not-allowed",
                opacity: inputText.trim() ? 1 : 0.6,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Send size={14} />
              <span>পাঠান</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
