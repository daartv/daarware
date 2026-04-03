"use client";

import type { Trend } from "@/lib/hooks/use-exercise-history";

const TREND_CONFIG: Record<
  Trend,
  { label: string; color: string; badgeClass: string }
> = {
  up: { label: "PROGRESSING", color: "text-cyber-green", badgeClass: "cyber-badge-green" },
  down: { label: "REGRESSING", color: "text-cyber-red", badgeClass: "cyber-badge-red" },
  flat: { label: "PLATEAU", color: "text-cyber-yellow", badgeClass: "cyber-badge-yellow" },
  new: { label: "NEW", color: "text-cyber-cyan", badgeClass: "cyber-badge-cyan" },
};

export function TrendIndicator({ trend }: { trend: Trend }) {
  const config = TREND_CONFIG[trend];

  return (
    <span className={`inline-flex items-center gap-1 cyber-badge ${config.badgeClass}`}>
      <TrendArrow trend={trend} />
      {config.label}
    </span>
  );
}

export function TrendArrow({ trend, size = 12 }: { trend: Trend; size?: number }) {
  const config = TREND_CONFIG[trend];

  if (trend === "up") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={config.color}>
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    );
  }

  if (trend === "down") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={config.color}>
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    );
  }

  if (trend === "flat") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={config.color}>
        <path d="M5 12h14" />
      </svg>
    );
  }

  // "new"
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={config.color}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
