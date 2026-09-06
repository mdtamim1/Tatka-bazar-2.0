"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  getChatMessages,
  sendChatMessage,
  type ChatMessage,
} from "@/lib/api";
import { sound } from "@/lib/sound";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultChannel?: "CUSTOMER" | "SUPPORT";
  taskId?: string;
  customerName?: string;
  riderName?: string;
}

const CUSTOMER_QUICK_CHIPS = [
  "আমি আপনার গেটের সামনে দাঁড়িয়ে আছি 🛵",
  "আপনার ফোনে কল ঢুকছে না, একটু কল করুন 📞",
  "রাস্তায় জ্যামের কারণে ৫-১০ মিনিট দেরি হতে পারে 🚦",
  "পার্সেল সংগ্রহ করা হয়েছে, আপনার ঠিকানায় আসছি 📦",
  "আপনার ঠিকানা খুঁজে পাচ্ছি না, একটু পথ নির্দেশনা দিন 📍",
];

const SUPPORT_QUICK_CHIPS = [
  "কাস্টমারের ফোন বন্ধ বা রিসিভ করছেন না ⚠️",
  "ভেন্ডর এখনো পণ্য রেডি করেনি 🏪",
  "পেমেন্ট বা টাকা কালেকশন নিয়ে সমস্যা হচ্ছে 💵",
  "বাইকে যান্ত্রিক সমস্যা হয়েছে, ব্যাকআপ প্রয়োজন 🏍️",
];

const DEMO_AUTO_REPLIES: Record<string, string[]> = {
  CUSTOMER: [
    "ঠিক আছে ভাইয়া, আমি নিচে দারোয়ানকে বলে রাখছি।",
    "ধন্যবাদ ভাইয়া, ৫ তলায় পাঠিয়ে দিন প্লিজ।",
    "আচ্ছা ভাইয়া, আমি একটু পরেই নিচে আসছি। সাবধানে আসবেন।",
    "হ্যাঁ ভাইয়া, আমার ফোনে একটু নেটওয়ার্ক সমস্যা ছিল, এখন ঠিক আছে।",
  ],
  SUPPORT: [
    "ধন্যবাদ আপনার আপডেটের জন্য। আমরা কাস্টমারকে সেন্ট্রাল থেকে কল দিচ্ছি। আপনি অপেক্ষা করুন।",
    "নোট নেওয়া হয়েছে। ভেন্ডরের সাথে সরাসরি কথা বলে দ্রুত পার্সেল হ্যান্ডওভার নিশ্চিত করা হচ্ছে।",
    "আপনার লোকেশন ও ডিউটি কন্ট্রোল রুম থেকে ট্র্যাক করা হচ্ছে। কোনো বিপদ হলে SOS বাটন ব্যবহার করবেন।",
  ],
};

export function ChatModal({
  isOpen,
  onClose,
  defaultChannel = "CUSTOMER",
  taskId = "task-01",
  customerName = "কাস্টমার",
  riderName = "রাইডার",
}: ChatModalProps) {
  const [activeChannel, setActiveChannel] = useState<"CUSTOMER" | "SUPPORT">(defaultChannel);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channelId = activeChannel === "CUSTOMER" ? taskId : "support";

  useEffect(() => {
    if (defaultChannel) {
      setActiveChannel(defaultChannel);
    }
  }, [defaultChannel, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    loadMessages();

    const handleUpdate = (e: any) => {
      if (e.detail?.channelId === channelId) {
        setMessages(getChatMessages(channelId));
      }
    };
    window.addEventListener("tatka_chat_updated", handleUpdate);
    return () => window.removeEventListener("tatka_chat_updated", handleUpdate);
  }, [isOpen, channelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function loadMessages() {
    setMessages(getChatMessages(channelId));
  }

  function handleSend(textToSend?: string) {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    sound.playMessagePop();
    const sent = sendChatMessage(channelId, "RIDER", riderName, text);
    setMessages((prev) => [...prev, sent]);
    setInputText("");

    // Simulate auto-reply from Customer or Support after 2.5s for demo realism
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const pool = DEMO_AUTO_REPLIES[activeChannel] || ["ঠিক আছে ভাইয়া, ধন্যবাদ।"];
      const replyText = pool[Math.floor(Math.random() * pool.length)] || "ঠিক আছে ভাইয়া, ধন্যবাদ।";
      const replySender = activeChannel === "CUSTOMER" ? "CUSTOMER" : "SUPPORT";
      const replySenderName = activeChannel === "CUSTOMER" ? customerName : "তাতকা হেল্পডেস্ক (সাপোর্ট)";

      const received = sendChatMessage(channelId, replySender, replySenderName, replyText);
      setMessages((prev) => [...prev, received]);
      sound.playMessagePop();
    }, 2400);
  }

  if (!isOpen) return null;

  const currentChips = activeChannel === "CUSTOMER" ? CUSTOMER_QUICK_CHIPS : SUPPORT_QUICK_CHIPS;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(3, 7, 18, 0.82)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "88vh",
          maxHeight: "720px",
          background: "var(--bg-raised)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          border: "1px solid var(--border-2)",
          borderBottom: "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Channel Switcher & Close */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border-1)",
            background: "rgba(18, 26, 43, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Tab Switcher */}
          <div style={{ display: "flex", gap: "6px", background: "var(--bg-base)", padding: "3px", borderRadius: "10px" }}>
            {taskId && (
              <button
                type="button"
                onClick={() => setActiveChannel("CUSTOMER")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: ".75rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-bn)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: activeChannel === "CUSTOMER" ? "var(--orange)" : "transparent",
                  color: activeChannel === "CUSTOMER" ? "#fff" : "var(--text-3)",
                }}
              >
                👤 {customerName}
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveChannel("SUPPORT")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                fontSize: ".75rem",
                fontWeight: 700,
                fontFamily: "var(--font-bn)",
                cursor: "pointer",
                transition: "all 0.2s",
                background: activeChannel === "SUPPORT" ? "var(--green)" : "transparent",
                color: activeChannel === "SUPPORT" ? "#000" : "var(--text-3)",
              }}
            >
              🏢 তাতকা সাপোর্ট
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--bg-base)",
              border: "1px solid var(--border-1)",
              color: "var(--text-2)",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Info Strip */}
        <div
          style={{
            padding: "8px 16px",
            background: activeChannel === "CUSTOMER" ? "rgba(255,122,0,0.08)" : "rgba(0,214,143,0.08)",
            borderBottom: "1px solid var(--border-1)",
            fontSize: ".72rem",
            color: activeChannel === "CUSTOMER" ? "var(--orange)" : "var(--green)",
            fontFamily: "var(--font-bn)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>💬</span>
          <span>
            {activeChannel === "CUSTOMER"
              ? `কাস্টমার "${customerName}"-এর সাথে সরাসরি চ্যাট। ফোন না ধরলে দ্রুত মেসেজ দিন।`
              : "তাতকা সেন্ট্রাল সাপোর্ট ডেস্কে যোগাযোগ। জরুরি রাস্তায় যেকোনো সমস্যায় লিখুন।"}
          </span>
        </div>

        {/* Message List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {messages.map((m) => {
            const isMe = m.sender === "RIDER";
            const timeStr = new Date(m.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    fontSize: ".66rem",
                    color: "var(--text-3)",
                    marginBottom: "3px",
                    paddingLeft: isMe ? 0 : "4px",
                    paddingRight: isMe ? "4px" : 0,
                  }}
                >
                  {isMe ? "আপনি" : m.senderName} • {timeStr}
                </div>
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "10px 14px",
                    borderRadius: "16px",
                    borderBottomRightRadius: isMe ? "4px" : "16px",
                    borderBottomLeftRadius: !isMe ? "4px" : "16px",
                    background: isMe
                      ? "linear-gradient(135deg, var(--orange) 0%, #ea580c 100%)"
                      : "var(--bg-card)",
                    color: isMe ? "#ffffff" : "var(--text-1)",
                    border: isMe ? "none" : "1px solid var(--border-1)",
                    fontSize: ".84rem",
                    lineHeight: 1.4,
                    fontFamily: "var(--font-bn)",
                    boxShadow: isMe ? "0 2px 8px rgba(255,122,0,0.3)" : "none",
                    wordBreak: "break-word",
                  }}
                >
                  {m.text}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-3)", fontSize: ".74rem", fontFamily: "var(--font-bn)", paddingLeft: 8 }}>
              <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              <span>{activeChannel === "CUSTOMER" ? `${customerName} টাইপ করছেন...` : "সাপোর্ট এজেন্ট লিখছেন..."}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Chips (Scrollable) */}
        <div
          style={{
            padding: "8px 12px",
            background: "rgba(10, 15, 26, 0.95)",
            borderTop: "1px solid var(--border-1)",
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {currentChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip)}
              style={{
                flexShrink: 0,
                padding: "6px 12px",
                borderRadius: "999px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-2)",
                color: "var(--text-2)",
                fontSize: ".73rem",
                fontFamily: "var(--font-bn)",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--orange)";
                e.currentTarget.style.color = "var(--text-1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-2)";
                e.currentTarget.style.color = "var(--text-2)";
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: "10px 14px",
            background: "var(--bg-raised)",
            borderTop: "1px solid var(--border-1)",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="মেসেজ লিখুন..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "999px",
              background: "var(--bg-base)",
              border: "1px solid var(--border-2)",
              color: "var(--text-1)",
              fontSize: ".84rem",
              fontFamily: "var(--font-bn)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: inputText.trim() ? "var(--orange)" : "var(--bg-card)",
              color: inputText.trim() ? "#fff" : "var(--text-3)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: inputText.trim() ? "pointer" : "default",
              transition: "all 0.2s",
              fontSize: "1.1rem",
              flexShrink: 0,
            }}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
