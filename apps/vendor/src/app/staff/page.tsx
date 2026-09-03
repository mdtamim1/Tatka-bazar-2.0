"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Phone,
  Key,
  CheckCircle,
  XCircle,
  History,
  Lock,
  X,
  Plus,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { VendorRole } from "@/types/vendor";
import { translations } from "@/utils/translations";

export default function StaffPage() {
  const {
    language,
    currentRole,
    staffAccounts,
    staffLogs,
    addStaff,
    toggleStaffStatus,
  } = useVendorStore();
  const t = translations[language];

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<VendorRole>("STAFF");
  const [pin, setPin] = useState("");

  if (currentRole !== "OWNER") {
    return (
      <div className="p-12 text-center max-w-md mx-auto my-12 bg-[#111C20] border border-[#20333B] rounded-2xl shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <Lock size={24} />
        </div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          {t.accessRestricted}
        </h2>
        <p className="text-xs text-slate-400">{t.accessRestrictedDesc}</p>
      </div>
    );
  }

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !pin) return;
    addStaff({
      name,
      phone,
      role,
      pin,
      isActive: true,
    });
    setName("");
    setPhone("");
    setPin("");
    setIsAddStaffOpen(false);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t.staffTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.staffSub}</p>
        </div>

        <button
          onClick={() => setIsAddStaffOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
        >
          <UserPlus size={15} />
          <span>{t.addStaffBtn}</span>
        </button>
      </div>

      {/* Staff Accounts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffAccounts.map((staff) => (
          <div
            key={staff.id}
            className="p-5 rounded-xl bg-[#111C20] border border-[#20333B] hover:border-slate-600 transition-colors space-y-3 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{staff.name}</h3>
                  <span
                    className={`badge-${
                      staff.role === "MANAGER" ? "sky" : "amber"
                    } text-[10px] font-bold`}
                  >
                    {staff.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                  <Phone size={12} className="text-slate-500" />
                  <span>{staff.phone}</span>
                  <span>•</span>
                  <Key size={12} className="text-slate-500" />
                  <span>PIN: ••••</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  staff.isActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {staff.isActive ? t.activeBadge : t.revokedBadge}
              </span>
            </div>

            <div className="pt-3 border-t border-[#20333B] flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Active: {staff.lastActive}
              </span>

              <button
                onClick={() => toggleStaffStatus(staff.id)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors border ${
                  staff.isActive
                    ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/30"
                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30"
                }`}
              >
                {staff.isActive ? t.revokeBtn : t.reactivateBtn}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Activity Audit Trail */}
      <div className="bg-[#111C20] border border-[#20333B] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#20333B]">
          <History size={16} className="text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {t.staffLogTitle}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-[#20333B]/60 pb-2">
              <tr>
                <th className="py-2">Timestamp</th>
                <th className="py-2">Staff Member</th>
                <th className="py-2">Operational Action</th>
                <th className="py-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20333B]/40">
              {staffLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#152227]/40">
                  <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2.5 font-semibold text-slate-200">
                    {log.staffName}
                  </td>
                  <td className="py-2.5">
                    <span className="badge-sky text-[10px]">
                      {language === "bn" ? log.actionBn : log.action}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400 italic text-[11px]">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsAddStaffOpen(false)}
          />
          <div className="relative bg-[#111C20] border border-[#20333B] rounded-xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#20333B]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.addStaffBtn}
              </h3>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {t.staffName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariqul Islam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {t.staffPhone} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+8801700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {t.staffRole}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as VendorRole)}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="MANAGER">Manager (ক্যাটালগ ও অর্ডার)</option>
                  <option value="STAFF">Packing Staff (ওজন ও প্যাকিং)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {t.staffPin} (4-digit) *
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono tracking-widest text-center text-base focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 border-t border-[#20333B] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="py-2 px-3 rounded-lg bg-[#152227] text-slate-300"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
