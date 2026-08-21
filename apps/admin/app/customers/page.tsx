"use client";

import React, { useState } from "react";
import { Users, Search, ShoppingBag, MapPin, Phone, ShieldCheck, Ban, CheckCircle } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([
    {
      id: "cust-1",
      name: "রাফিক আহমেদ (Rafiq Ahmed)",
      email: "customer@example.com",
      phone: "01700000002",
      totalOrders: 14,
      lifetimeValue: 24650,
      joinedDate: "15 Jan 2024",
      primaryAddress: "বাড়ি ২৭, রোড ৮/এ, ধানমন্ডি আ/এ, ঢাকা",
      status: "ACTIVE",
    },
    {
      id: "cust-2",
      name: "ফারজানা হক (Farzana Haque)",
      email: "farzana@gmail.com",
      phone: "01711223344",
      totalOrders: 8,
      lifetimeValue: 18200,
      joinedDate: "02 Mar 2024",
      primaryAddress: "বাড়ি ১২, রোড ১০৪, গুলশান ২, ঢাকা",
      status: "ACTIVE",
    },
    {
      id: "cust-3",
      name: "তানভীর হাসান (Tanveer Hassan)",
      email: "tanveer@yahoo.com",
      phone: "01911889900",
      totalOrders: 5,
      lifetimeValue: 8450,
      joinedDate: "20 Jun 2024",
      primaryAddress: "মিরপুর ১০ গোলচত্বর সংলগ্ন, ঢাকা",
      status: "ACTIVE",
    },
  ]);

  const [search, setSearch] = useState("");

  const toggleBlockStatus = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "ACTIVE" ? "BLOCKED" : "ACTIVE" }
          : c
      )
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
          গ্রাহক ডিরেক্টরি ও লাইফটাইম ভ্যালু (LTV)
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          গ্রাহকদের মোট অর্ডার সংখ্যা, লাইফটাইম ক্রয়মূল্য ও অ্যাক্টিভ স্ট্যাটাস নিয়ন্ত্রণ
        </p>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>গ্রাহকের নাম ও ইমেইল</th>
              <th>মোবাইল নম্বর</th>
              <th>প্রধান ডেলিভারি ঠিকানা</th>
              <th>মোট অর্ডার</th>
              <th>লাইফটাইম ভ্যালু (LTV)</th>
              <th>স্ট্যাটাস</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 800 }}>{c.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.email}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>যোগদান: {c.joinedDate}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 700 }}>{c.phone}</span>
                </td>
                <td>
                  <div style={{ fontSize: "0.8rem", maxWidth: "240px" }}>{c.primaryAddress}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 700, background: "#F1F5F9", padding: "2px 8px", borderRadius: "999px", fontSize: "0.8rem" }}>
                    {c.totalOrders} টি অর্ডার
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 800, color: "var(--primary-dark)", fontSize: "0.95rem" }}>
                    ৳{c.lifetimeValue.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${c.status === "ACTIVE" ? "success" : "danger"}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggleBlockStatus(c.id)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      background: c.status === "ACTIVE" ? "#FEE2E2" : "var(--primary-light)",
                      color: c.status === "ACTIVE" ? "var(--danger)" : "var(--primary-dark)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {c.status === "ACTIVE" ? "ব্লক করুন" : "আনব্লক করুন"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
