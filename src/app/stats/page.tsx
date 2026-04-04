"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { useWorkoutLogs } from "@/lib/hooks/use-workout-logs";
import { getExerciseById } from "@/lib/exercise-data";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TimeRange = "week" | "month" | "3months" | "year" | "all";

const RANGE_LABELS: Record<TimeRange, string> = {
  week: "This Week",
  month: "This Month",
  "3months": "3 Months",
  year: "This Year",
  all: "All Time",
};

const NEON_PALETTE = [
  "#2FD9D9", // cyan
  "#D93A8C", // hot pink
  "#3AD977", // green
  "#E8C84A", // gold
  "#6B8FD9", // blue
  "#E83A3A", // red
  "#D9A83A", // amber
  "#A855F7", // purple
  "#F97316", // orange
  "#14B8A6", // teal
  "#EC4899", // pink
  "#84CC16", // lime
];

function getStartDate(range: TimeRange): Date {
  const now = new Date();
  switch (range) {
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "3months": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return d;
    }
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    case "all":
      return new Date(0);
  }
}

export default function StatsPage() {
  const allLogs = useWorkoutLogs();
  const [range, setRange] = useState<TimeRange>("month");

  const logs = useMemo(() => {
    const start = getStartDate(range);
    return allLogs.filter((l) => new Date(l.date) >= start);
  }, [allLogs, range]);

  // --- Workout Count ---
  const workoutCount = logs.length;
  const totalSets = logs.reduce(
    (n, l) => n + l.exercises.reduce((m, e) => m + e.sets.length, 0),
    0
  );
  const totalExercises = logs.reduce((n, l) => n + l.exercises.length, 0);

  // --- Muscle Group Distribution ---
  const muscleData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of logs) {
      for (const ex of log.exercises) {
        const info = getExerciseById(ex.exerciseId);
        if (info) {
          for (const m of info.primaryMuscles) {
            counts[m] = (counts[m] || 0) + ex.sets.length;
          }
        }
      }
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name: capitalize(name), value }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  // --- Plan Distribution ---
  const planData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of logs) {
      const name = log.name || "Freestyle";
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  // --- Most Repeated Exercises ---
  const exerciseData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of logs) {
      for (const ex of log.exercises) {
        const info = getExerciseById(ex.exerciseId);
        const name = info?.name ?? ex.exerciseId;
        counts[name] = (counts[name] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [logs]);

  const hasData = allLogs.length > 0;

  return (
    <div>
      <Header title="Stats" />

      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto pb-4">
        {/* Time Range Selector */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {(Object.keys(RANGE_LABELS) as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-[0.65rem] px-3 py-1.5 whitespace-nowrap uppercase tracking-wider font-semibold border transition-all ${
                range === r
                  ? "border-cyber-cyan text-cyber-bg bg-cyber-cyan"
                  : "border-cyber-border text-cyber-text-muted hover:text-cyber-text"
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Workouts" value={workoutCount} />
          <StatCard label="Exercises" value={totalExercises} />
          <StatCard label="Sets" value={totalSets} />
        </div>

        {!hasData ? (
          <div className="cyber-card text-center py-10">
            <p className="text-cyber-text-muted text-sm">
              No workout data yet. Log your first workout to see stats.
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="cyber-card text-center py-10">
            <p className="text-cyber-text-muted text-sm">
              No workouts in this time range.
            </p>
          </div>
        ) : (
          <>
            {/* Muscle Group Pie Chart */}
            {muscleData.length > 0 && (
              <section>
                <h2 className="cyber-heading mb-3">Muscle Groups</h2>
                <div className="cyber-card py-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={muscleData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={35}
                        strokeWidth={1}
                        stroke="#0A0A12"
                      >
                        {muscleData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={NEON_PALETTE[i % NEON_PALETTE.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#111520",
                          border: "1px solid rgba(47,217,217,0.3)",
                          borderRadius: 0,
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          color: "#D4D4D4",
                        }}
                        formatter={(value: any, name: any) => [
                          `${value} sets`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 px-2">
                    {muscleData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1">
                        <div
                          className="w-2 h-2"
                          style={{
                            background: NEON_PALETTE[i % NEON_PALETTE.length],
                          }}
                        />
                        <span className="text-[0.6rem] text-cyber-text-muted">
                          {d.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Plan Distribution Pie */}
            {planData.length > 0 && (
              <section>
                <h2 className="cyber-heading mb-3">Plans</h2>
                <div className="cyber-card py-4">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={planData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        innerRadius={30}
                        strokeWidth={1}
                        stroke="#0A0A12"
                      >
                        {planData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={NEON_PALETTE[i % NEON_PALETTE.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#111520",
                          border: "1px solid rgba(47,217,217,0.3)",
                          borderRadius: 0,
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          color: "#D4D4D4",
                        }}
                        formatter={(value: any, name: any) => [
                          `${value}x`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 px-2">
                    {planData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1">
                        <div
                          className="w-2 h-2"
                          style={{
                            background: NEON_PALETTE[i % NEON_PALETTE.length],
                          }}
                        />
                        <span className="text-[0.6rem] text-cyber-text-muted">
                          {d.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Most Repeated Exercises Bar Chart */}
            {exerciseData.length > 0 && (
              <section>
                <h2 className="cyber-heading mb-3">Top Exercises</h2>
                <div className="cyber-card py-4 pr-2">
                  <ResponsiveContainer width="100%" height={exerciseData.length * 32 + 16}>
                    <BarChart
                      data={exerciseData}
                      layout="vertical"
                      margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                    >
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "#6B7280", fontFamily: "monospace" }}
                        axisLine={{ stroke: "rgba(47,217,217,0.15)" }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 10, fill: "#D4D4D4" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#111520",
                          border: "1px solid rgba(47,217,217,0.3)",
                          borderRadius: 0,
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          color: "#D4D4D4",
                        }}
                        formatter={(value: any) => [`${value}x`, "Sessions"]}
                        cursor={{ fill: "rgba(47,217,217,0.08)" }}
                      />
                      <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                        {exerciseData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={NEON_PALETTE[i % NEON_PALETTE.length]}
                            opacity={i === 0 ? 1 : 0.75}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="cyber-card text-center py-3">
      <p className="text-xl font-bold font-mono text-cyber-cyan">{value}</p>
      <p className="text-[0.6rem] text-cyber-text-muted uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
