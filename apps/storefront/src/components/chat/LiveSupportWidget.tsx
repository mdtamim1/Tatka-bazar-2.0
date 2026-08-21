"use client";

import React, { useState } from "react";
import { MessageCircle, X, Send, Bot, User, Phone, CheckCircle } from "lucide-react";

export function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: "bot" | "user"; text: string; time: string }[]>([
    {
      sender: "bot",
      text: "👋 আসসালামু আলাইকুম! তাতকা বাজার লাইভ হেল্প ডেস্কে স্বাগতম। আপনাকে কীভাবে সাহায্য করতে পারি?",
      time: "এখন",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const quickQuestions = [
    "ডেলিভারি স্লট কখন পাওয়া যাবে?",
    "মাছ বা মাংস কি কেটে পরিষ্কার করে দেওয়া হয়?",
    "অর্ডার বাতিল বা পরিবর্তন করার নিয়ম কী?",
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const userMsg = { sender: "user" as const, text, time };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");

    // Simulate smart automated response
    setTimeout(() => {
      let botReply = "ধন্যবাদ আপনার বার্তার জন্য। আমাদের সাপোর্ট প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন। হটলাইন: ০৯৬১২-০০০০০০";
      if (text.includes("স্লট") || text.includes("ডেলিভারি")) {
        botReply = "⚡ তাতকা বাজারে প্রতিদিন ৩টি স্লট রয়েছে: তাজা সকাল (০৭:০০ - ০৯:০০), দুপুর (১১:০০ - ০১:০০), এবং সন্ধ্যা (০৫:০০ - ০৭:০০)।";
      } else if (text.includes("মাছ") || text.includes("কেটে") || text.includes("পরিষ্কার")) {
        botReply = "🐟 হ্যাঁ! আমাদের পদ্মার ইলিশ ও দেশি মাছ আপনার পছন্দ অনুযায়ী ফ্রি ড্রেসিং ও সাইজ করে বরফ ড্রামে ডেলিভারি করা হয়।";
      } else if (text.includes("বাতিল") || text.includes("পরিবর্তন")) {
        botReply = "⏱️ অর্ডার করার পর হাবে প্যাকিং শুরুর পূর্ব পর্যন্ত (প্রথম ১৫ মিনিট) সরাসরি কল বা অ্যাপ থেকে অর্ডার পরিবর্তন করা যায়।";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botReply,
          time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--primary)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(21, 128, 61, 0.4)",
          zIndex: 999,
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Live Support Chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={26} />}
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            width: "360px",
            height: "480px",
            background: "var(--surface)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #15803D 0%, #064E3B 100%)",
              color: "#FFFFFF",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>তাতকা লাইভ সাপোর্ট</div>
                <div style={{ fontSize: "0.72rem", color: "#4ADE80", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>● অনলাইনে সক্রিয়</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: "#FFF" }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "14px",
                    background: msg.sender === "user" ? "var(--primary)" : "#F1F5F9",
                    color: msg.sender === "user" ? "#FFFFFF" : "var(--text-main)",
                    fontSize: "0.85rem",
                    lineHeight: 1.4,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  {msg.text}
                </div>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {msg.time}
                </span>
              </div>
            ))}
          </div>

          {/* Quick FAQ Chips */}
          <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border-subtle)", background: "#F8FAFC", display: "flex", gap: "6px", overflowX: "auto" }}>
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                style={{
                  whiteSpace: "nowrap",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  background: "#FFF",
                  border: "1px solid var(--border-medium)",
                  padding: "4px 8px",
                  borderRadius: "999px",
                  color: "var(--text-main)",
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "10px 12px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              background: "var(--surface)",
            }}
          >
            <input
              type="text"
              placeholder="একটি প্রশ্ন লিখুন..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-medium)",
                outline: "none",
                fontSize: "0.85rem",
              }}
            />
            <button
              type="submit"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "var(--primary)",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
