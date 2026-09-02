"use client";

import React, { useState } from "react";
import { Users, Search, ShoppingBag, MapPin, Phone, ShieldCheck, Ban, CheckCircle } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([
    {
      id: "cust-1",
      name: "Rafiq Ahmed",
      email: "customer@example.com",
      phone: "01700000002",
      totalOrders: 14,
      lifetimeValue: 24650,
      joinedDate: "15 Jan 2024",
      primaryAddress: "House 27, Road 8/A, Flat 4B, Dhanmondi R/A, Dhaka",
      status: "ACTIVE",
    },
    {
      id: "cust-2",
      name: "Farzana Haque",
      email: "farzana@gmail.com",
      phone: "01711223344",
      totalOrders: 8,
      lifetimeValue: 18200,
      joinedDate: "02 Mar 2024",
      primaryAddress: "House 12, Road 104, Gulshan 2, Dhaka",
      status: "ACTIVE",
    },
    {
      id: "cust-3",
      name: "Tanveer Hassan",
      email: "tanveer@yahoo.com",
      phone: "01911889900",
      totalOrders: 5,
      lifetimeValue: 8450,
      joinedDate: "20 Jun 2024",
      primaryAddress: "Near Mirpur 10 Circle, Dhaka",
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
          Customer Directory & Lifetime Value (LTV)
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          Registered customer accounts, cumulative order volume, and account access status
        </p>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer Name & Email</th>
              <th>Mobile Phone</th>
              <th>Primary Delivery Address</th>
              <th>Total Orders</th>
              <th>Lifetime Value (LTV)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 800 }}>{c.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.email}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Joined: {c.joinedDate}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 700 }}>{c.phone}</span>
                </td>
                <td>
                  <div style={{ fontSize: "0.8rem", maxWidth: "240px" }}>{c.primaryAddress}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 700, background: "#F1F5F9", padding: "2px 8px", borderRadius: "999px", fontSize: "0.8rem" }}>
                    {c.totalOrders} orders
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
                    {c.status === "ACTIVE" ? "Block Account" : "Unblock Account"}
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
