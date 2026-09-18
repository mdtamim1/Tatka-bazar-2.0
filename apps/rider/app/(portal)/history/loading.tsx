export default function HistoryLoading() {
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header Skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <SkeletonLine width="120px" height={22} />
        <SkeletonLine width="80px" height={16} />
      </div>

      {/* Date Filter Tabs Skeleton */}
      <div style={{ display: "flex", gap: 8, overflowX: "hidden", paddingBottom: 4 }}>
        {[80, 90, 75, 100].map((w, i) => (
          <div
            key={i}
            style={{
              width: w,
              height: 34,
              borderRadius: 18,
              background: "rgba(255,255,255,.06)",
              animation: "skeleton-pulse 1.5s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Summary Stat Box Skeleton */}
      <div style={{
        background: "var(--bg-card, rgba(15,30,50,.8))",
        borderRadius: 16,
        padding: "16px",
        border: "1px solid var(--border-1, rgba(255,255,255,.08))",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}>
        <div>
          <SkeletonLine width="60%" height={10} mb={8} />
          <SkeletonLine width="85%" height={24} />
        </div>
        <div>
          <SkeletonLine width="60%" height={10} mb={8} />
          <SkeletonLine width="70%" height={24} />
        </div>
      </div>

      {/* History Items List Skeleton */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            background: "var(--bg-card, rgba(15,30,50,.8))",
            borderRadius: 16,
            padding: "16px",
            border: "1px solid var(--border-1, rgba(255,255,255,.08))",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <SkeletonLine width="45%" height={13} />
            <SkeletonLine width="20%" height={13} />
          </div>
          <SkeletonLine width="75%" height={11} mb={8} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SkeletonLine width="35%" height={10} />
            <SkeletonLine width="25%" height={16} />
          </div>
        </div>
      ))}

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
      }}
    />
  );
}
