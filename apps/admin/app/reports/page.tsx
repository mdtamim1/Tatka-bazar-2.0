"use client";

import React, { useState } from "react";
import { BarChart3, Download, Calendar, Filter, TrendingUp, DollarSign } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminReportsPage() {
  const { orders, products, vendors } = useAdmin();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportCSV = () => {
    const headers = "OrderNumber,Customer,Amount,Payment,Status,Date\n";
    const rows = orders.map((o) => `"${o.orderNumber}","${o.customerName}",${o.totalAmount},"${o.paymentMethod}","${o.status}","${o.createdAt}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tatka_bazar_sales_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            Sales Reports & Financial Analytics
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Sales performance by vendor, category, and time range with full CSV export
          </p>
        </div>

        <button onClick={handleExportCSV} className="admin-btn admin-btn-primary">
          <Download size={16} />
          <span>{downloadSuccess ? "✓ Downloaded!" : "Export CSV Report"}</span>
        </button>
      </div>

      {/* Analytics Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div className="admin-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Total Collected Revenue</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary-dark)", marginTop: "6px" }}>
            ৳{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Average Order Value: ৳{Math.round(orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length || 0)}
          </div>
        </div>

        <div className="admin-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Vendor Commission Earned</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)", marginTop: "6px" }}>
            ৳{(orders.reduce((sum, o) => sum + o.totalAmount, 0) * 0.09).toFixed(0)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Average Commission Rate: 9.0%
          </div>
        </div>

        <div className="admin-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Successful Delivery Ratio</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", marginTop: "6px" }}>
            98.6%
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "4px", fontWeight: 700 }}>
            Top Customer Trust
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="admin-card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 800 }}>
          Sales & Revenue Breakdown by Partner Vendor
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Vendor Shop</th>
              <th>Sales Volume</th>
              <th>Platform Commission</th>
              <th>Vendor Net Payout</th>
              <th>Market Share</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => {
              const commission = Math.round((v.totalSales * v.commissionRate) / 100);
              const netPayout = v.totalSales - commission;
              return (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 800 }}>{v.nameEn || v.nameBn}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800 }}>৳{v.totalSales.toLocaleString()}</span>
                  </td>
                  <td>
                    <span style={{ color: "var(--primary-dark)", fontWeight: 700 }}>৳{commission.toLocaleString()} ({v.commissionRate}%)</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: "var(--accent)" }}>৳{netPayout.toLocaleString()}</span>
                  </td>
                  <td>
                    <div style={{ width: "100px", height: "6px", background: "#F1F5F9", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, (v.totalSales / 620000) * 100)}%`, height: "100%", background: "var(--primary)" }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
