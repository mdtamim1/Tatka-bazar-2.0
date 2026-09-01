"use client";

import React, { useEffect, useState } from "react";

export function ScrollProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el     = document.documentElement;
      const scroll = el.scrollTop  || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setWidth(height > 0 ? (scroll / height) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        height: "2px",
        width: `${width}%`,
        background: "linear-gradient(90deg, #10D876, #F5C842, #4F9EFF)",
        zIndex: 9999,
        boxShadow: "0 0 8px rgba(16,216,118,0.6)",
        transition: "width 0.05s linear",
        pointerEvents: "none",
      }}
    />
  );
}
