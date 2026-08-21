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
            সেলস রিপোর্ট ও ফিন্যান্সিয়াল অ্যানালিটিক্স
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            ক্যাটাগরি, ভেন্ডর ও সময়সীমা ভিত্তিক বিক্রয় রিপোর্ট এবং CSV এক্সপোর্ট
          </p>
        </div>

        <button onClick={handleExportCSV} className="admin-btn admin-btn-primary">
          <Download size={16} />
          <span>{downloadSuccess ? "✓ ডাউনলোড সম্পন্ন!" : "CSV রিপোর্ট এক্সপোর্ট করুন"}</span>
        </button>
      </div>

      {/* Analytics Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div className="admin-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>মোট সংগৃহীত রাজস্ব</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary-dark)", marginTop: "6px" }}>
            ৳{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            গড় অর্ডার ভ্যালু: ৳{Math.round(orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length || 0)}
          </div>
        </div>

        <div className="admin-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>ভেন্ডর কমিশন আয়</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)", marginTop: "6px" }}>
            ৳{(orders.reduce((sum, o) => sum + o.totalAmount, 0) * 0.09).toFixed(0)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            গড় প্লাটফর্ম কমিশন: ৯.০%
          </div>
        </div>

        <div className="admin-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>সফল ডেলিভারি অনুপাত</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", marginTop: "6px" }}>
            ৯৮.৬%
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "4px", fontWeight: 700 }}>
            সর্বোচ্চ গ্রাহক সন্তুষ্টি
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="admin-card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 800 }}>
          ভেন্ডর অনুযায়ী বিক্রয় ও রাজস্ব বিশ্লেষণ
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ভেন্ডর শপ</th>
              <th>মোট বিক্রয় ভলিউম</th>
              <th>প্রদেয় কমিশন</th>
              <th>ভেন্ডর নেট পে-আউট</th>
              <th>মার্কেট শেয়ার</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => {
              const commission = Math.round((v.totalSales * v.commissionRate) / 100);
              const netPayout = v.totalSales - commission;
              return (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 800 }}>{v.nameBn}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{v.nameEn}</div>
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
