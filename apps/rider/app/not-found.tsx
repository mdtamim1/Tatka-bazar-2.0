import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "#f8fafc",
      fontFamily: "var(--font-geist-sans), sans-serif",
    }}>
      <div style={{
        maxWidth: "420px",
        width: "100%",
        textAlign: "center",
        background: "#ffffff",
        borderRadius: "24px",
        padding: "36px 28px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        border: "1px solid #e2e8f0",
      }}>
        <div style={{ fontSize: "56px", fontWeight: 900, color: "#16a34a", marginBottom: "8px" }}>
          404
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
          পেজটি পাওয়া যায়নি
        </h2>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px", lineHeight: "1.6" }}>
          আপনি যে পেজটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা মুছে ফেলা হয়েছে।
        </p>
        <Link
          href="/home"
          style={{
            display: "block",
            width: "100%",
            padding: "12px 20px",
            background: "#16a34a",
            color: "#ffffff",
            fontWeight: 600,
            borderRadius: "12px",
            textDecoration: "none",
            fontSize: "15px",
          }}
        >
          হোম ড্যাশবোর্ডে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
