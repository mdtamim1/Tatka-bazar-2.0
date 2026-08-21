"use client";

import React, { useState } from "react";
import { History, Shield, Filter, Search, UserCheck } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminAuditPage() {
  const { auditLogs } = useAdmin();
  const [filterModule, setFilterModule] = useState("all");

  const filteredLogs = auditLogs.filter((log) => {
    if (filterModule !== "all" && log.module.toLowerCase() !== filterModule.toLowerCase()) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
          সিস্টেম অডিট ও অ্যাকশন ট্রেইল লগ
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          কে, কখন, কোন রোল ব্যবহার করে কোন রেকর্ড পরিবর্তন করেছে তার সম্পূর্ণ অপরিবর্তনযোগ্য লগ
        </p>
      </div>

      <div className="admin-card" style={{ padding: "12px 18px", display: "flex", gap: "12px", alignItems: "center" }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)" }}>মডিউল ফিল্টার:</span>
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
        >
          <option value="all">সকল মডিউল</option>
          <option value="Orders">অর্ডার (Orders)</option>
          <option value="Products">পণ্য (Products)</option>
          <option value="Vendors">ভেন্ডর (Vendors)</option>
          <option value="B2B">B2B হোলসেল (B2B)</option>
          <option value="Riders">রাইডার (Riders)</option>
          <option value="Inventory">ইনভেন্টরি (Inventory)</option>
        </select>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>সময় ও তারিখ</th>
              <th>অ্যাডমিন ব্যবহারকারী ও রোল</th>
              <th>অ্যাকশন ধরন</th>
              <th>মডিউল</th>
              <th>বিবরণ ও পরিবর্তনের তথ্য</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>
                  <div style={{ fontWeight: 700, fontSize: "0.78rem" }}>{log.timestamp}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{log.actorName}</div>
                  <span style={{ fontSize: "0.68rem", background: "var(--primary-light)", color: "var(--primary-dark)", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                    {log.actorRole}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {log.action}
                  </span>
                </td>
                <td>
                  <span className="status-badge neutral">{log.module}</span>
                </td>
                <td>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{log.details}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
