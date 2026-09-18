export default function NotificationsLoading() {
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header Skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <SkeletonLine width="130px" height={22} />
        <SkeletonLine width="75px" height={16} />
      </div>

      {/* Notification items */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            background: "var(--bg-card, rgba(15,30,50,.8))",
            borderRadius: 16,
            padding: "16px",
            border: "1px solid var(--border-1, rgba(255,255,255,.08))",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "rgba(255,255,255,.08)",
              animation: "skeleton-pulse 1.5s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <SkeletonLine width="55%" height={12} />
              <SkeletonLine width="20%" height={10} />
            </div>
            <SkeletonLine width="90%" height={10} mb={6} />
            <SkeletonLine width="65%" height={10} />
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
