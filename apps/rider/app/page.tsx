"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function Root() {
  const router = useRouter();
  useEffect(() => {
    apiFetch("/rider-portal/me")
      .then((res) => {
        router.replace(res.success && res.data ? "/home" : "/login");
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  return (
    <div style={{ minHeight: "100dvh", background: "#050810", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  );
}
