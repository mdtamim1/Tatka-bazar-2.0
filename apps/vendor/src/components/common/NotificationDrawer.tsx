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
        return <ShoppingBag size={16} className="text-emerald-600" />;
      case "STOCK":
        return <AlertTriangle size={16} className="text-amber-600" />;
      case "PAYOUT":
        return <Wallet size={16} className="text-sky-600" />;
      case "REVIEW":
        return <MessageSquare size={16} className="text-purple-600" />;
      default:
        return <Bell size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bell size={16} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {t.notifications}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-[11px] text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
              title={t.markAllRead}
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">{t.markAllRead}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {t.noNotifications}
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !n.read
                    ? "bg-emerald-50/50 border-emerald-200 shadow-2xs"
                    : "bg-slate-50 border-slate-200/80 text-slate-600"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 mt-0.5 shadow-2xs">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold truncate ${
                          !n.read ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {language === "bn" ? n.titleBn : n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-1 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {language === "bn" ? n.messageBn : n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={onClose}
                          className="text-emerald-700 hover:underline font-bold"
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
