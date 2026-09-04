"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Root() {
  const router = useRouter();
  useEffect(() => {
    const t = localStorage.getItem("rider_token");
    router.replace(t ? "/home" : "/login");
  }, [router]);
  return <div style={{ minHeight: "100dvh", background: "#050810", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" /></div>;
}
