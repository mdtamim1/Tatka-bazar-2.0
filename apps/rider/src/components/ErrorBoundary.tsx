"use client";
import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to API (non-blocking)
    try {
      fetch("/api/log/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack?.substring(0, 1000),
          componentStack: errorInfo.componentStack?.substring(0, 500),
          url: window.location.href,
          userAgent: navigator.userAgent,
          ts: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch {}
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          minHeight: "100dvh",
          background: "linear-gradient(160deg, #050810, #0D1929)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "24px", textAlign: "center", color: "#F0F6FF",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(239,68,68,0.15)",
            border: "2px solid rgba(239,68,68,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2.5rem", marginBottom: 24,
          }}>
            ⚠️
          </div>

          <h1 style={{
            fontSize: "1.3rem", fontWeight: 900, margin: "0 0 10px",
            color: "#fca5a5",
          }}>
            একটি সমস্যা হয়েছে
          </h1>

          <p style={{
            fontSize: ".88rem", color: "rgba(168,192,216,.7)",
            maxWidth: 280, margin: "0 0 28px", lineHeight: 1.6,
            fontFamily: "system-ui, sans-serif",
          }}>
            অ্যাপটি একটি অপ্রত্যাশিত ত্রুটির সম্মুখীন হয়েছে। পেজ রিফ্রেশ করুন বা আবার চেষ্টা করুন।
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => this.handleReset()}
              style={{
                padding: "12px 24px",
                background: "rgba(255,107,43,0.15)", border: "1px solid rgba(255,107,43,0.4)",
                color: "#FF6B2B", borderRadius: "12px",
                fontSize: ".9rem", fontWeight: 700, cursor: "pointer",
              }}
            >
              আবার চেষ্টা করুন
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #FF6B2B, #E05520)",
                border: "none", color: "#fff", borderRadius: "12px",
                fontSize: ".9rem", fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 20px rgba(255,107,43,.4)",
              }}
            >
              🔄 রিফ্রেশ করুন
            </button>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details style={{
              marginTop: 24, maxWidth: "100%", textAlign: "left",
              background: "rgba(0,0,0,0.4)", padding: 12, borderRadius: 8,
              fontSize: ".7rem", color: "#fca5a5", wordBreak: "break-all",
            }}>
              <summary style={{ cursor: "pointer", marginBottom: 8 }}>Error Details (Dev Only)</summary>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {this.state.error.message}
                {"\n\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
