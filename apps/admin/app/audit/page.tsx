"use client";

import React, { useState } from "react";
import { History, Search, X, Filter } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const MODULE_COLORS: Record<string, string> = {
  Orders: "var(--amber)", Dispatch: "var(--green)", Products: "var(--indigo)",
  Vendors: "var(--cyan)", Riders: "var(--blue)", B2B: "var(--purple)",
  Staff: "var(--rose)", Marketing: "var(--pink)", Branches: "var(--teal)",
  Categories: "var(--green)", Reviews: "var(--amber)", System: "var(--text-3)",
};

export default function AuditPage() {
  const { auditLogs } = useAdmin();
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("ALL");

  const modules = ["ALL", ...Array.from(new Set(auditLogs.map(l => l.module)))];

  const filtered = auditLogs.filter(l => {
    const ms = !search || l.action.toLowerCase().includes(search.toLowerCase()) || l.actorName.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase()) || l.targetId.toLowerCase().includes(search.toLowerCase());
    const mm = module === "ALL" || l.module === module;
    return ms && mm;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">{auditLogs.length} events logged · Full action trail</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: "220px" }}>
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder="Search actions, actors, details…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="admin-select" style={{ width: "160px" }} value={module} onChange={e => setModule(e.target.value)}>
          {modules.map(m => <option key={m} value={m}>{m === "ALL" ? "All Modules" : m}</option>)}
        </select>
        <span style={{ fontSize: "0.78rem", color: "var(--text-3)", alignSelf: "center", marginLeft: "auto" }}>
          {filtered.length} results
        </span>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Module</th>
                <th>Action</th>
                <th>Target ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td style={{ fontSize: "0.75rem", color: "var(--text-3)", whiteSpace: "nowrap" }}>{l.timestamp}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{l.actorName}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: "0.68rem", fontWeight: 700, padding: "2px 7px",
                      borderRadius: "var(--r-full)", background: "var(--bg-elevated)",
                      border: "1px solid var(--border-1)", color: "var(--text-2)",
                      whiteSpace: "nowrap",
                    }}>
                      {l.actorRole.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px",
                      borderRadius: "var(--r-full)",
                      background: `${MODULE_COLORS[l.module] || "var(--text-3)"}15`,
                      color: MODULE_COLORS[l.module] || "var(--text-3)",
                      border: `1px solid ${MODULE_COLORS[l.module] || "var(--text-3)"}30`,
                    }}>
                      {l.module}
                    </span>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-2)", fontWeight: 600 }}>
                      {l.action}
                    </span>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: "0.70rem", color: "var(--text-4)" }}>
                      {l.targetId.slice(0, 16)}{l.targetId.length > 16 ? "…" : ""}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.80rem", color: "var(--text-2)", maxWidth: "300px" }}>
                    {l.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No audit events found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
