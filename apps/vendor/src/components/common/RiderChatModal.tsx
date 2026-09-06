"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Phone,
  Send,
  Bike,
  CheckCheck,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { audioAlert } from "@/utils/audioAlert";

interface ChatMsg {
  id: string;
  sender: "VENDOR" | "RIDER" | "CUSTOMER" | "SUPPORT";
  senderName: string;
  text: string;
  timestamp: string;
}

interface RiderChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  riderName?: string;
  riderPhone?: string;
  riderVehicle?: string;
  riderRating?: string;
}

export default function RiderChatModal({
  isOpen,
  onClose,
  orderNumber = "TB-9824",
  riderName = "তামীম ইকবাল (রাইডার #১০১)",
  riderPhone = "01700000001",
  riderVehicle = "মোটরসাইকেল (ঢাকা মেট্রো-হ-৪৫-১২৩৪)",
  riderRating = "4.95 ★",
}: RiderChatModalProps) {
  const channelId = "task-01"; // Unified with active demo channel
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    loadMessages();

    const handleChatUpdate = () => {
      loadMessages();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes("tatka_chat")) {
        loadMessages();
      }
    };

    window.addEventListener("tatka_chat_updated", handleChatUpdate);
    window.addEventListener("storage", handleStorage);

    // Poll cloud dispatch for new rider messages every 3s
    const pollInterval = setInterval(() => {
      fetch(`/api/dispatch?chatOrderId=${channelId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages((prev) => {
              const ids = new Set(prev.map((m) => m.id));
              const newOnes = data.messages.filter((m: ChatMsg) => !ids.has(m.id));
              return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
            });
          }
        })
        .catch(() => {});
    }, 3000);

    return () => {
      window.removeEventListener("tatka_chat_updated", handleChatUpdate);
      window.removeEventListener("storage", handleStorage);
      clearInterval(pollInterval);
    };
  }, [isOpen]);

  function loadMessages() {
    try {
      const raw = localStorage.getItem(`tatka_chat_${channelId}`);
      if (raw) {
        setMessages(JSON.parse(raw));
      } else {
        const starter: ChatMsg[] = [
          {
            id: "m-1",
            sender: "RIDER",
            senderName: riderName,
            text: "আসসালামু আলাইকুম ভেন্ডর ভাই, আমি পার্সেল সংগ্রহ করতে দোকানে আসছি। পার্সেল রেডি আছে কি? 🛵",
            timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          },
        ];
        setMessages(starter);
        localStorage.setItem(`tatka_chat_${channelId}`, JSON.stringify(starter));
      }
    } catch {}
  }

  function handleSendMessage(customText?: string) {
    const text = (customText || inputText).trim();
    if (!text) return;

    const newMsg: ChatMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: "VENDOR",
      senderName: "সবুজ খামার গ্রোসারি (ভেন্ডর)",
      text,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    if (!customText) setInputText("");

    try {
      localStorage.setItem(`tatka_chat_${channelId}`, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("tatka_chat_updated", {
          detail: { channelId, message: newMsg },
        })
      );
      audioAlert.playSuccessSound();

      // Broadcast to cloud dispatch endpoints
      const endpoints = [
        "/api/dispatch",
        "https://tatka-bazar-2-0-rider-seven.vercel.app/api/dispatch",
      ];
      endpoints.forEach((url) => {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SEND_CHAT",
            orderId: channelId,
            sender: "VENDOR",
            senderName: "সবুজ খামার গ্রোসারি (ভেন্ডর)",
            text,
          }),
        }).catch(() => {});
      });
    } catch {}

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FBFBF9] border border-emerald-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[560px] animate-in zoom-in-95 duration-200">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-100 font-extrabold text-lg">
              <Bike size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {riderName}
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  {riderRating}
                </span>
              </div>
              <span className="text-[11px] text-emerald-200/80 block">
                অর্ডার #{orderNumber} • {riderVehicle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${riderPhone}`}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
              title="কল দিন"
            >
              <Phone size={16} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Reply Preset Chips */}
        <div className="p-3 bg-white border-b border-emerald-100 flex gap-2 overflow-x-auto scrollbar-none">
          {[
            "পার্সেল রেডি, কাউন্টার থেকে নিন 🛵",
            "মাছ কাটা চলছে, ৩ মিনিট লাগবে 🐟",
            "সব আইটেম বক্সে সিল করা শেষ 📦",
            "দোকানের সামনে অপেক্ষা করুন 🏢",
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold transition-all hover:scale-[1.02] shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBFBF9]">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-40 text-emerald-600" />
              <span>রাইডারের সাথে পিকআপ সমন্বয়ের জন্য নিচে মেসেজ লিখুন</span>
            </div>
          ) : (
            messages.map((m) => {
              const isVendor = m.sender === "VENDOR";

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    isVendor ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isVendor
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                    }`}
                  >
                    {!isVendor && (
                      <span className="block text-[10px] font-extrabold text-emerald-700 mb-0.5">
                        {m.senderName}
                      </span>
                    )}
                    <span>{m.text}</span>
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        isVendor ? "text-emerald-100" : "text-slate-400"
                      }`}
                    >
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing & Send Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-emerald-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="রাইডারকে মেসেজ লিখুন..."
            className="flex-1 bg-[#F8FAF8] border border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
