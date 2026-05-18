"use client";

import { useMemo, useState } from "react";
import { useWorkoutLogs } from "@/lib/hooks/use-workout-logs";

const WEEKS = 12;
const DAYS_PER_WEEK = 7;
const TOTAL_DAYS = WEEKS * DAYS_PER_WEEK;

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type Intensity = 0 | 1 | 2 | 3 | 4;

interface Cell {
  date: string;
  volume: number;
  isFuture: boolean;
  isToday: boolean;
}

export function ContributionChart() {
  const logs = useWorkoutLogs();
  const [selected, setSelected] = useState<Cell | null>(null);

  const { cells, totalVolume, activeDays } = useMemo(() => {
    const volumeByDay = new Map<string, number>();
    for (const log of logs) {
      const vol = log.exercises.reduce(
        (sum, ex) =>
          sum +
          ex.sets.reduce(
            (s, set) => s + (set.weight || 0) * (set.reps || 0),
            0
          ),
        0
      );
      volumeByDay.set(log.date, (volumeByDay.get(log.date) || 0) + vol);
    }

    const today = startOfDay(new Date());
    const todayKey = dayKey(today);
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7);

    const out: Cell[] = [];
    let totalVolume = 0;
    let activeDays = 0;

    for (let i = 0; i < TOTAL_DAYS; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = dayKey(d);
      const volume = volumeByDay.get(key) ?? 0;
      const isFuture = d.getTime() > today.getTime();
      out.push({ date: key, volume, isFuture, isToday: key === todayKey });
      if (!isFuture && volume > 0) {
        totalVolume += volume;
        activeDays += 1;
      }
    }

    return { cells: out, totalVolume, activeDays };
  }, [logs]);

  const thresholds = useMemo(() => {
    const volumes = cells
      .filter((c) => !c.isFuture && c.volume > 0)
      .map((c) => c.volume)
      .sort((a, b) => a - b);
    if (volumes.length === 0) return [0, 0, 0];
    return [
      volumes[Math.floor(volumes.length * 0.33)] ?? 0,
      volumes[Math.floor(volumes.length * 0.66)] ?? 0,
      volumes[Math.floor(volumes.length * 0.9)] ?? 0,
    ];
  }, [cells]);

  const intensityOf = (volume: number): Intensity => {
    if (volume <= 0) return 0;
    if (volume <= thresholds[0]) return 1;
    if (volume <= thresholds[1]) return 2;
    if (volume <= thresholds[2]) return 3;
    return 4;
  };

  // For each week column, the label of the first month it contains (or null if same as previous column).
  const monthLabels = useMemo(() => {
    const labels: (string | null)[] = [];
    let prev = -1;
    for (let col = 0; col < WEEKS; col++) {
      const sunday = cells[col * DAYS_PER_WEEK];
      if (!sunday) {
        labels.push(null);
        continue;
      }
      const m = parseLocalDate(sunday.date).getMonth();
      labels.push(m !== prev ? MONTH_NAMES[m] : null);
      prev = m;
    }
    return labels;
  }, [cells]);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="cyber-heading">Activity</h2>
        <span className="text-[0.65rem] font-mono text-cyber-text-muted">
          {activeDays} {activeDays === 1 ? "day" : "days"} &middot; last 12 weeks
        </span>
      </div>

      <div className="cyber-card cyber-corners cyber-corners-bottom">
        {/* Month labels row, aligned over cell columns */}
        <div className="flex mb-1" style={{ paddingLeft: "1rem" }}>
          <div
            className="grid flex-1 text-[0.55rem] font-mono uppercase tracking-wider text-cyber-text-muted"
            style={{
              gridTemplateColumns: `repeat(${WEEKS}, 1fr)`,
              gap: "3px",
            }}
          >
            {monthLabels.map((m, i) => (
              <div key={i} className="leading-none truncate">
                {m ?? ""}
              </div>
            ))}
          </div>
        </div>

        {/* Day labels column + cells grid */}
        <div className="flex gap-[3px]">
          <div
            className="grid text-[0.55rem] font-mono text-cyber-text-muted"
            style={{
              gridTemplateRows: `repeat(${DAYS_PER_WEEK}, 1fr)`,
              gap: "3px",
              width: "1rem",
            }}
          >
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="flex items-center leading-none">
                {/* Show Mon/Wed/Fri only to avoid clutter */}
                {i === 1 || i === 3 || i === 5 ? d : ""}
              </div>
            ))}
          </div>

          <div
            className="grid flex-1"
            style={{
              gridTemplateColumns: `repeat(${WEEKS}, 1fr)`,
              gridTemplateRows: `repeat(${DAYS_PER_WEEK}, 1fr)`,
              gridAutoFlow: "column",
              gap: "3px",
              aspectRatio: `${WEEKS} / ${DAYS_PER_WEEK}`,
            }}
          >
            {cells.map((c) => {
              const intensity = intensityOf(c.volume);
              const isSelected = selected?.date === c.date;
              return (
                <button
                  key={c.date}
                  type="button"
                  onClick={() => setSelected(isSelected ? null : c)}
                  disabled={c.isFuture}
                  aria-label={describeCell(c)}
                  className="rounded-[1px] transition-transform hover:scale-110 focus:outline-none focus:scale-110 disabled:cursor-default"
                  style={{
                    background: c.isFuture
                      ? "transparent"
                      : intensityColor(intensity),
                    outline: c.isToday
                      ? "1px solid var(--color-cyber-cyan)"
                      : isSelected
                      ? "1px solid rgba(255,255,255,0.7)"
                      : undefined,
                    boxShadow:
                      !c.isFuture && intensity === 4
                        ? "0 0 4px rgba(47,217,217,0.7)"
                        : undefined,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Selected cell info (or default total) */}
        <div className="mt-3 text-[0.65rem] font-mono flex items-center justify-between min-h-[1rem]">
          {selected ? (
            <>
              <span className="text-cyber-cyan">
                {formatLongDate(selected.date)}
                {selected.isToday && " (Today)"}
              </span>
              <span className="text-cyber-text">
                {selected.volume > 0
                  ? `${formatVolume(selected.volume)} volume`
                  : "Rest day"}
              </span>
            </>
          ) : (
            <span className="text-cyber-text-muted">
              {totalVolume > 0
                ? `${formatVolume(totalVolume)} total volume`
                : "No activity yet"}
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center justify-between text-[0.55rem] font-mono text-cyber-text-muted">
          <span>Each cell = 1 day &middot; brighter = more volume</span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            {([0, 1, 2, 3, 4] as Intensity[]).map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-[1px]"
                style={{ background: intensityColor(i) }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function intensityColor(i: Intensity): string {
  switch (i) {
    case 0:
      return "rgba(47, 217, 217, 0.06)";
    case 1:
      return "rgba(47, 217, 217, 0.25)";
    case 2:
      return "rgba(47, 217, 217, 0.5)";
    case 3:
      return "rgba(47, 217, 217, 0.75)";
    case 4:
      return "rgba(47, 217, 217, 1)";
  }
}

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocalDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatLongDate(key: string): string {
  const d = parseLocalDate(key);
  const day = d.toLocaleDateString(undefined, { weekday: "short" });
  const month = MONTH_NAMES[d.getMonth()];
  return `${day} ${month} ${d.getDate()}`;
}

function describeCell(c: Cell): string {
  if (c.isFuture) return `${c.date}, future`;
  if (c.volume <= 0) return `${c.date}, rest day`;
  return `${c.date}, ${formatVolume(c.volume)} volume`;
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `${(v / 1_000).toFixed(1)}k`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(2)}k`;
  return `${Math.round(v)}`;
}
