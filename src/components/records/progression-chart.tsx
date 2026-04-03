"use client";

import {
  useExerciseHistory,
  getTrend,
  type ExerciseSession,
} from "@/lib/hooks/use-exercise-history";
import { TrendIndicator } from "@/components/records/trend-indicator";
import { formatDate } from "@/lib/utils";

interface ProgressionChartProps {
  exerciseId: string;
  compact?: boolean;
}

export function ProgressionChart({ exerciseId, compact }: ProgressionChartProps) {
  const sessions = useExerciseHistory(exerciseId);

  if (sessions.length === 0) {
    return (
      <p className="text-xs text-cyber-text-dim italic">No history yet</p>
    );
  }

  const trend = getTrend(sessions);
  const max1RM = Math.max(...sessions.map((s) => s.best1RM));
  const min1RM = Math.min(...sessions.map((s) => s.best1RM));
  const range = max1RM - min1RM || 1;

  // Compact: just sparkline + trend
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Sparkline sessions={sessions} max1RM={max1RM} min1RM={min1RM} range={range} />
        <TrendIndicator trend={trend} />
      </div>
    );
  }

  // Full: sparkline + trend + session list
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="cyber-heading">Progression</span>
        <TrendIndicator trend={trend} />
      </div>

      {/* Chart area */}
      <div className="relative">
        <Sparkline
          sessions={sessions}
          max1RM={max1RM}
          min1RM={min1RM}
          range={range}
          tall
        />
        {/* Y-axis labels */}
        <div className="absolute top-0 right-1 text-[0.5rem] font-mono text-cyber-text-dim">
          {max1RM}
        </div>
        <div className="absolute bottom-0 right-1 text-[0.5rem] font-mono text-cyber-text-dim">
          {min1RM}
        </div>
      </div>

      {/* Session list */}
      {sessions.length > 1 && (
        <div className="space-y-0.5 max-h-28 overflow-y-auto scrollbar-hide">
          {[...sessions].reverse().map((s, i) => {
            const prev = sessions[sessions.length - 2 - i];
            const delta = prev ? s.best1RM - prev.best1RM : 0;
            return (
              <div
                key={`${s.date}-${s.workoutLogId}`}
                className="flex items-center justify-between text-[0.65rem] font-mono py-0.5 px-1"
              >
                <span className="text-cyber-text-muted">
                  {formatDate(s.date)}
                </span>
                <span className="text-cyber-text">
                  {s.bestWeight}x{s.bestReps}
                </span>
                <span className="text-cyber-cyan">{s.best1RM}</span>
                {delta !== 0 && (
                  <span
                    className={
                      delta > 0 ? "text-cyber-green" : "text-cyber-red"
                    }
                  >
                    {delta > 0 ? "+" : ""}
                    {Math.round(delta * 10) / 10}
                  </span>
                )}
                {delta === 0 && i < sessions.length - 1 && (
                  <span className="text-cyber-text-dim">=</span>
                )}
                {i === sessions.length - 1 && (
                  <span className="text-cyber-text-dim">-</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** SVG sparkline chart */
function Sparkline({
  sessions,
  max1RM,
  min1RM,
  range,
  tall,
}: {
  sessions: ExerciseSession[];
  max1RM: number;
  min1RM: number;
  range: number;
  tall?: boolean;
}) {
  const w = 280;
  const h = tall ? 60 : 28;
  const pad = 2;

  if (sessions.length < 2) {
    // Single dot
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <circle cx={w / 2} cy={h / 2} r="3" fill="#2FD9D9" />
      </svg>
    );
  }

  const points = sessions.map((s, i) => {
    const x = pad + (i / (sessions.length - 1)) * (w - pad * 2);
    const y = h - pad - ((s.best1RM - min1RM) / range) * (h - pad * 2);
    return { x, y, session: s };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  // Gradient fill area
  const areaPath = `${linePath} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  // Determine colors based on overall trend
  const overall = sessions[sessions.length - 1].best1RM - sessions[0].best1RM;
  const lineColor = overall > 0 ? "#2FD9D9" : overall < 0 ? "#E83A3A" : "#E8C84A";
  const fillColor =
    overall > 0
      ? "rgba(47,217,217,0.1)"
      : overall < 0
      ? "rgba(232,58,58,0.1)"
      : "rgba(232,200,74,0.1)";

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
      {/* Fill area */}
      <path d={areaPath} fill={fillColor} />

      {/* Grid lines */}
      {tall && (
        <>
          <line x1="0" y1={h * 0.25} x2={w} y2={h * 0.25} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <line x1="0" y1={h * 0.5} x2={w} y2={h * 0.5} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <line x1="0" y1={h * 0.75} x2={w} y2={h * 0.75} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        </>
      )}

      {/* Line */}
      <path d={linePath} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 3 : 1.5}
          fill={lineColor}
          stroke={i === points.length - 1 ? lineColor : "none"}
          strokeWidth="1"
          opacity={i === points.length - 1 ? 1 : 0.7}
        />
      ))}

      {/* Last value label */}
      {tall && (
        <text
          x={points[points.length - 1].x - 4}
          y={points[points.length - 1].y - 6}
          fontSize="7"
          fill={lineColor}
          fontFamily="monospace"
          textAnchor="end"
        >
          {sessions[sessions.length - 1].best1RM}
        </text>
      )}
    </svg>
  );
}
