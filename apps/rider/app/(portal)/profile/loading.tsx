export default function ProfileLoading() {
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Profile Avatar & Header Skeleton */}
      <div style={{
        background: "var(--bg-card, rgba(15,30,50,.8))",
        borderRadius: 20,
        padding: "24px 16px",
        border: "1px solid var(--border-1, rgba(255,255,255,.08))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(255,255,255,.08)",
          animation: "skeleton-pulse 1.5s ease-in-out infinite",
        }} />
        <SkeletonLine width="150px" height={18} />
        <SkeletonLine width="110px" height={12} />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <SkeletonLine width="70px" height={22} />
          <SkeletonLine width="80px" height={22} />
        </div>
      </div>

      {/* Metrics Row Skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            background: "var(--bg-card, rgba(15,30,50,.8))",
            borderRadius: 14,
            padding: "14px 10px",
            textAlign: "center",
            border: "1px solid var(--border-1, rgba(255,255,255,.08))",
          }}>
            <SkeletonLine width="50%" height={10} mb={6} />
            <SkeletonLine width="80%" height={18} />
          </div>
        ))}
      </div>

      {/* Profile Details List Skeleton */}
      <div style={{
        background: "var(--bg-card, rgba(15,30,50,.8))",
        borderRadius: 18,
        padding: "18px 16px",
        border: "1px solid var(--border-1, rgba(255,255,255,.08))",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SkeletonLine width="35%" height={12} />
            <SkeletonLine width="45%" height={12} />
          </div>
        ))}
      </div>

      {/* Action Buttons Skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
        <SkeletonLine width="100%" height={44} />
        <SkeletonLine width="100%" height={44} />
      </div>

      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function SkeletonLine({ width, height, mb = 0 }: { width: string | number; height: number; mb?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: height / 2,
        background: "rgba(255,255,255,.07)",
        animation: "skeleton-pulse 1.5s ease-in-out infinite",
        marginBottom: mb,
        marginInline: "auto",
      }}
    />
  );
}
