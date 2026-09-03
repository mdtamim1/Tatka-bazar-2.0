"use client";

import React from "react";
import Link from "next/link";
import { X, CheckCheck, Bell, ShoppingBag, AlertTriangle, Wallet, MessageSquare } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
}: NotificationDrawerProps) {
  const {
    language,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useVendorStore();
  const t = translations[language];

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <ShoppingBag size={16} className="text-emerald-400" />;
      case "STOCK":
        return <AlertTriangle size={16} className="text-amber-400" />;
      case "PAYOUT":
        return <Wallet size={16} className="text-sky-400" />;
      case "REVIEW":
        return <MessageSquare size={16} className="text-purple-400" />;
      default:
        return <Bell size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm bg-[#111C20] border-l border-[#20333B] h-full shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#20333B]">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              {t.notifications}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              title={t.markAllRead}
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">{t.markAllRead}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              {t.noNotifications}
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  !n.read
                    ? "bg-[#152227] border-emerald-500/30 shadow-sm"
                    : "bg-[#0E171B] border-[#20333B]/60 text-slate-400"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded bg-[#111C20] border border-[#20333B] mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          !n.read ? "text-slate-100" : "text-slate-400"
                        }`}
                      >
                        {language === "bn" ? n.titleBn : n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {language === "bn" ? n.messageBn : n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#20333B]/50 text-[10px] text-slate-500">
                      <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={onClose}
                          className="text-emerald-400 hover:underline font-medium"
                        >
                          {language === "bn" ? "বিস্তারিত দেখুন →" : "View details →"}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
