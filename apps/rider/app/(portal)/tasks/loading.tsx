export default function TasksLoading() {
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <SkeletonLine width="40%" height={18} />
        <SkeletonLine width="20%" height={13} />
      </div>

      {/* Task cards */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{
          background: "rgba(15,30,50,.8)",
          borderRadius: 18, padding: "16px",
          border: "1px solid rgba(255,255,255,.08)",
          animation: `skeleton-pulse 1.5s ease-in-out ${i * 0.1}s infinite`,
        }}>
          {/* Status bar */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <SkeletonLine width="30%" height={22} />
            <SkeletonLine width="20%" height={22} />
          </div>
          {/* Route */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <SkeletonLine width={20} height={20} />
            <SkeletonLine width="70%" height={11} />
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <SkeletonLine width={20} height={20} />
            <SkeletonLine width="60%" height={11} />
          </div>
          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 12,
          }}>
            <SkeletonLine width="35%" height={11} />
            <SkeletonLine width="25%" height={28} />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}

function SkeletonLine({ width, height }: { width: string | number; height: number }) {
  return (
    <div style={{
      width, height, borderRadius: height / 2,
      background: "rgba(255,255,255,.07)",
    }} />
  );
}
