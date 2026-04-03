"use client";

import { Header } from "@/components/layout/header";
import { usePersonalRecords } from "@/lib/hooks/use-personal-records";
import { getExerciseById } from "@/lib/exercise-data";
import { ExerciseInfoButton } from "@/components/exercises/exercise-info-drawer";
import { ProgressionChart } from "@/components/records/progression-chart";
import { EstMaxLabel } from "@/components/ui/est-max-label";
import {
  formatDate,
  timeAgo,
  daysSince,
  getPRStaleness,
  getNudgeInfo,
} from "@/lib/utils";

export default function RecordsPage() {
  const records = usePersonalRecords();

  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const staleCount = records.filter(
    (r) => getPRStaleness(r.date) !== "fresh"
  ).length;

  return (
    <div>
      <Header
        title="Personal Records"
        subtitle={`${records.length} records${staleCount > 0 ? ` \u00b7 ${staleCount} stale` : ""}`}
      />

      <div className="px-4 pt-4 space-y-2 max-w-lg mx-auto pb-4">
        {sorted.length === 0 ? (
          <div className="cyber-card text-center py-8">
            <p className="text-cyber-text-muted text-sm">
              No personal records yet. Log a workout to start tracking.
            </p>
          </div>
        ) : (
          sorted.map((record) => {
            const exercise = getExerciseById(record.exerciseId);
            const staleness = getPRStaleness(record.date);
            const nudge =
              staleness !== "fresh" ? getNudgeInfo(staleness) : null;
            const days = daysSince(record.date);

            return (
              <div
                key={record.id}
                className={`cyber-card cyber-corners cyber-corners-bottom ${
                  nudge
                    ? nudge.color === "red"
                      ? "border-l-2 border-l-cyber-red"
                      : "border-l-2 border-l-cyber-yellow"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        {exercise?.name ?? record.exerciseId}
                    </p>
                    {exercise?.primaryMuscles && (
                      <div className="flex gap-1 mt-0.5">
                        {exercise.primaryMuscles.map((m) => (
                          <span
                            key={m}
                            className="cyber-badge cyber-badge-cyan text-[0.55rem]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                    </div>
                    <ExerciseInfoButton exerciseId={record.exerciseId} />
                  </div>
                  {nudge && (
                    <span
                      className={`cyber-badge ${
                        nudge.color === "red"
                          ? "cyber-badge-red"
                          : "cyber-badge-yellow"
                      } flex-shrink-0`}
                    >
                      {nudge.message}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-baseline gap-4">
                  <div>
                    <span className="text-xl font-bold font-mono text-cyber-cyan">
                      {record.weight}
                    </span>
                    <span className="text-cyber-text-muted text-sm ml-1">
                      x {record.reps}
                    </span>
                  </div>
                  <div className="text-xs text-cyber-text-muted">
                    <EstMaxLabel value={record.estimated1RM} className="text-xs" />
                  </div>
                  <div className="ml-auto text-xs text-cyber-text-muted">
                    {formatDate(record.date)} &middot; {days}d ago
                  </div>
                </div>

                {/* Progression Chart */}
                <div className="mt-3 pt-3 border-t border-cyber-border">
                  <ProgressionChart exerciseId={record.exerciseId} compact />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
