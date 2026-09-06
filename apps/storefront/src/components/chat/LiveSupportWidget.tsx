"use client";

import React, { useState } from "react";
import { X, Send, CheckCheck, ExternalLink } from "lucide-react";

// Official WhatsApp Vector Icon
function WhatsAppIcon({ className = "w-7 h-7", fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16.02 2C8.28 2 2 8.28 2 16.02c0 2.64.73 5.12 2 7.25L2.1 30l6.93-1.82a13.97 13.97 0 006.99 1.86c7.74 0 14.02-6.28 14.02-14.02S23.76 2 16.02 2zm8.17 19.86c-.34.96-1.7 1.76-2.38 1.82-.64.06-1.44.09-4.63-1.22-4.07-1.68-6.7-5.84-6.91-6.11-.21-.27-1.64-2.18-1.64-4.17 0-1.99 1.04-2.97 1.41-3.38.37-.41.81-.51 1.08-.51.27 0 .54 0 .77.01.25.01.58-.1 1.02.94.34.82 1.16 2.85 1.27 3.06.1.21.17.45.03.71-.14.27-.21.44-.41.67-.2.24-.43.52-.61.71-.2.2-.42.43-.18.83.24.4 1.05 1.73 2.26 2.8 1.54 1.38 2.85 1.8 3.26 2.01.41.2.64.17.88-.1.24-.27 1.01-1.19 1.42-1.59.41-.41.81-.34 1.35-.14.54.2 3.42 1.61 4 1.9.58.3.98.44 1.12.67.14.24.14 1.39-.2 2.35z" />
    </svg>
  );
}

export function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");

  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801700000000";

  const quickInquiries = [
    {
      label: "🚚 অর্ডার ট্র্যাক করতে চাই",
      message: "হ্যালো টাটকা বাজার, আমি আমার অর্ডারের ডেলিভারি স্ট্যাটাস জানতে চাই।",
    },
    {
      label: "🐟 তাজা মাছ ও সবজির স্টক",
      message: "হ্যালো, আজকের পদ্মার ইলিশ ও টাটকা শাক-সবজির বর্তমান স্টক সম্পর্কে জানতে চাই।",
    },
    {
      label: "⚡ ডেলিভারি সময় ও চার্জ",
      message: "হ্যালো, আজকের ডেলিভারি স্লট ও ডেলিভারি চার্জ কত জানতে চাচ্ছিলাম।",
    },
    {
      label: "💳 পেমেন্ট বা অফার সংক্রান্ত",
      message: "হ্যালো, টাটকা বাজারের বিকাশ পেমেন্ট ও ডিসকাউন্ট অফার সম্পর্কে জানতে চাই।",
    },
  ];

  const openWhatsApp = (customMessage?: string) => {
    const text = customMessage || inputText.trim() || "হ্যালো টাটকা বাজার টিম, আমি একটি অর্ডার সম্পর্কে সাহায্য চাই।";
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    if (!customMessage) {
      setInputText("");
    }
  };

  return (
    <>
      {/* Floating WhatsApp Action Button Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3">
        {/* Hover/Idle Tooltip Pill (Desktop) */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-background/95 backdrop-blur-md text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-border/80 cursor-pointer hover:border-[#25D366] transition-all duration-300 hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>হোয়াটসঅ্যাপ সাপোর্ট</span>
          </div>
        )}

        {/* Pulse Ripple Effect behind WhatsApp Button */}
        <div className="relative">
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
            style={{
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
            }}
            aria-label="Official WhatsApp Support"
            title="Chat with Tatka Bazar on WhatsApp"
          >
            {isOpen ? (
              <X size={26} className="text-white transition-transform duration-200" />
            ) : (
              <>
                <WhatsAppIcon className="w-8 h-8 fill-white drop-shadow-sm" />
                {/* Active Online Indicator Dot */}
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                  <span className="w-2.5 h-2.5 bg-[#25D366] rounded-full animate-pulse" />
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WhatsApp Chat Card Modal */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[370px] max-w-[370px] bg-background border border-border shadow-2xl rounded-2xl overflow-hidden z-[9999] flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300"
          style={{ height: "490px" }}
        >
          {/* Official WhatsApp Brand Header */}
          <div
            className="p-4 text-white flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, #075E54 0%, #128C7E 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
                  <WhatsAppIcon className="w-6 h-6 fill-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#25D366] border-2 border-[#075E54] rounded-full" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Tatka Bazar Support
                  <span className="text-[10px] bg-[#25D366] text-white px-1.5 py-0.2 rounded-full font-semibold">
                    ✓
                  </span>
                </div>
                <div className="text-[11px] text-emerald-100 flex items-center gap-1 mt-0.5">
                  <span>সাধারণত ৫ মিনিটে রিপ্লাই দেয় • Online</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* WhatsApp Conversation Canvas */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-3"
            style={{
              backgroundColor: "hsl(var(--muted)/0.35)",
              backgroundImage: "radial-gradient(circle at center, rgba(37,211,102,0.03) 0, transparent 70%)",
            }}
          >
            {/* Incoming Message Bubble */}
            <div className="flex flex-col items-start max-w-[88%]">
              <div className="bg-card text-card-foreground p-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-border/60 text-xs leading-relaxed">
                <p className="font-semibold text-foreground mb-1">
                  আসসালামু আলাইকুম! 👋
                </p>
                <p className="text-muted-foreground">
                  টাটকা বাজার হেল্পডেস্কে আপনাকে স্বাগতম। আপনার অর্ডার, পণ্যের মান বা ডেলিভারি বিষয়ে সরাসরি আমাদের অফিসিয়াল হোয়াটসঅ্যাপে চ্যাট করুন।
                </p>
                <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-muted-foreground">
                  <span>এখন</span>
                  <CheckCheck size={13} className="text-[#25D366]" />
                </div>
              </div>
            </div>

            {/* Quick Topic Chips */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground px-1 block">
                এক ক্লিকে জিজ্ঞাসা করুন:
              </span>
              <div className="flex flex-col gap-1.5">
                {quickInquiries.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openWhatsApp(item.message)}
                    className="w-full text-left text-xs bg-background hover:bg-[#25D366]/10 hover:border-[#25D366]/50 transition-colors border border-border/80 px-3 py-2 rounded-xl text-foreground font-medium flex items-center justify-between group shadow-2xs"
                  >
                    <span>{item.label}</span>
                    <ExternalLink size={12} className="text-muted-foreground group-hover:text-[#25D366] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              openWhatsApp();
            }}
            className="p-3 bg-background border-t border-border flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="মেসেজ লিখুন..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-muted/40 border border-border/80 rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-[#25D366] transition-colors placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 shrink-0"
                style={{
                  background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                }}
                aria-label="Send via WhatsApp"
              >
                <Send size={15} />
              </button>
            </div>

            {/* Direct Open WhatsApp Button */}
            <button
              type="button"
              onClick={() => openWhatsApp()}
              className="w-full py-2.5 px-3 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-105 active:scale-[0.99] shadow-sm"
              style={{
                background: "linear-gradient(135deg, #25D366 0%, #20BA59 100%)",
              }}
            >
              <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
              <span>সরাসরি হোয়াটসঅ্যাপে চ্যাট করুন</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
