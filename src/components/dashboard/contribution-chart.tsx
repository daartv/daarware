"use client";

import { useMemo } from "react";
import { useWorkoutLogs } from "@/lib/hooks/use-workout-logs";

const WEEKS = 12;
const DAYS_PER_WEEK = 7;
const TOTAL_DAYS = WEEKS * DAYS_PER_WEEK;

type Intensity = 0 | 1 | 2 | 3 | 4;

interface Cell {
  date: string;
  volume: number;
  isFuture: boolean;
  isToday: boolean;
}

export function ContributionChart() {
  const logs = useWorkoutLogs();

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
    // Right-most column is the current week (Sun..Sat). Start = current Sunday - (WEEKS-1) weeks.
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

  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="cyber-heading">Activity</h2>
        <span className="text-[0.65rem] font-mono text-cyber-text-muted">
          {activeDays} {activeDays === 1 ? "day" : "days"} &middot; last 12 weeks
        </span>
      </div>
      <div className="cyber-card cyber-corners cyber-corners-bottom">
        <div
          className="grid gap-[3px] w-full"
          style={{
            gridTemplateColumns: `repeat(${WEEKS}, 1fr)`,
            gridTemplateRows: `repeat(${DAYS_PER_WEEK}, 1fr)`,
            gridAutoFlow: "column",
            aspectRatio: `${WEEKS} / ${DAYS_PER_WEEK}`,
          }}
        >
          {cells.map((c) => {
            const intensity = intensityOf(c.volume);
            return (
              <div
                key={c.date}
                title={
                  c.isFuture
                    ? c.date
                    : c.volume > 0
                    ? `${c.date} · ${formatVolume(c.volume)} volume`
                    : `${c.date} · rest`
                }
                className="rounded-[1px] transition-transform hover:scale-110"
                style={{
                  background: c.isFuture
                    ? "transparent"
                    : intensityColor(intensity),
                  outline: c.isToday
                    ? "1px solid var(--color-cyber-cyan)"
                    : undefined,
                  outlineOffset: c.isToday ? "0px" : undefined,
                  boxShadow:
                    !c.isFuture && intensity === 4
                      ? "0 0 4px rgba(47,217,217,0.7)"
                      : undefined,
                }}
              />
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-[0.6rem] font-mono text-cyber-text-muted">
          <span>
            {totalVolume > 0
              ? `${formatVolume(totalVolume)} total volume`
              : "No activity yet"}
          </span>
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

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `${(v / 1_000).toFixed(1)}k`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(2)}k`;
  return `${Math.round(v)}`;
}
