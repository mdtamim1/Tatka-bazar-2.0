export default function HomeLoading() {
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Earnings card skeleton */}
      <div style={{
        background: "var(--bg-card, rgba(15,30,50,.8))",
        borderRadius: 20,
        padding: "20px",
        border: "1px solid var(--border-1, rgba(255,255,255,.08))",
      }}>
        <SkeletonLine width="45%" height={11} mb={12} />
        <SkeletonLine width="70%" height={32} mb={8} />
        <div style={{ display: "flex", gap: 10 }}>
          <SkeletonLine width="30%" height={11} />
          <SkeletonLine width="30%" height={11} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[0, 1].map((i) => (
          <div key={i} style={{
            background: "var(--bg-card, rgba(15,30,50,.8))",
            borderRadius: 16, padding: "16px",
            border: "1px solid var(--border-1, rgba(255,255,255,.08))",
          }}>
            <SkeletonLine width="60%" height={11} mb={10} />
            <SkeletonLine width="80%" height={24} />
          </div>
        ))}
      </div>

      {/* Recent orders list */}
      <div style={{
        background: "var(--bg-card, rgba(15,30,50,.8))",
        borderRadius: 20, padding: "16px",
        border: "1px solid var(--border-1, rgba(255,255,255,.08))",
      }}>
        <SkeletonLine width="40%" height={13} mb={16} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: "var(--border-1, rgba(255,255,255,.08))",
              animation: "skeleton-pulse 1.5s ease-in-out infinite",
            }} />
            <div style={{ flex: 1 }}>
              <SkeletonLine width="75%" height={11} mb={7} />
              <SkeletonLine width="50%" height={9} />
            </div>
            <SkeletonLine width="15%" height={20} />
          </div>
        ))}
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
    <div style={{
      width, height,
      borderRadius: height / 2,
      background: "rgba(255,255,255,.07)",
      animation: "skeleton-pulse 1.5s ease-in-out infinite",
      marginBottom: mb,
    }} />
  );
}
