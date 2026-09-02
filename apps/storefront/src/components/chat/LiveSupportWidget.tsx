"use client";

import React, { useState } from "react";
import { MessageCircle, X, Send, Bot, User, Phone, CheckCircle } from "lucide-react";

export function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: "bot" | "user"; text: string; time: string }[]>([
    {
      sender: "bot",
      text: "👋 Hello! Welcome to Tatka Bazar Live Helpdesk. How can we assist you today?",
      time: "Now",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const quickQuestions = [
    "When are delivery slots available?",
    "Is fish & meat cleaned and dressed?",
    "How can I cancel or modify my order?",
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
      const lower = text.toLowerCase();
      let botReply = "Thank you for reaching out! Our support team is here to help. Hotline: 09612-000000";
      if (lower.includes("slot") || lower.includes("delivery") || lower.includes("when")) {
        botReply = "⚡ We deliver across 3 convenient daily slots: Morning (07:00 - 09:00 AM), Midday (11:00 AM - 01:00 PM), and Evening (05:00 - 07:00 PM).";
      } else if (lower.includes("fish") || lower.includes("meat") || lower.includes("clean") || lower.includes("dress")) {
        botReply = "🐟 Yes! All Padma fish and poultry items are professionally cleaned, cut to your preferred portions, and packed in temperature-controlled boxes.";
      } else if (lower.includes("cancel") || lower.includes("modify") || lower.includes("change")) {
        botReply = "⏱️ You can modify or cancel your order within 15 minutes of placing it directly from the app or by calling our hotline.";
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
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Tatka Live Support</div>
                <div style={{ fontSize: "0.72rem", color: "#4ADE80", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>● Online & Active</span>
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
              placeholder="Ask a question..."
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
