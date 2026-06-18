"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { useWorkoutLogs } from "@/lib/hooks/use-workout-logs";
import { getExerciseById } from "@/lib/exercise-data";
import { formatDate } from "@/lib/utils";
import {
  formatExerciseExport,
  formatWorkoutDuration,
} from "@/lib/format-export";
import type { WorkoutExercise, WorkoutLog } from "@/lib/db";

interface Entry {
  log: WorkoutLog;
  exercise: WorkoutExercise;
  /** Stable identifier across renders, since exercise objects don't carry their own id. */
  key: string;
}

export default function HistoryPage() {
  const logs = useWorkoutLogs();

  const entries = useMemo<Entry[]>(() => {
    const out: Entry[] = [];
    for (const log of logs) {
      log.exercises.forEach((exercise, idx) => {
        out.push({
          log,
          exercise,
          key: `${log.id}-${idx}-${exercise.exerciseId}`,
        });
      });
    }
    return out;
  }, [logs]);

  return (
    <div>
      <Header
        title="Exercise Log"
        subtitle={`${entries.length} entries`}
        back
      />

      <div className="px-4 pt-4 space-y-2 max-w-lg mx-auto pb-4">
        {entries.length === 0 ? (
          <div className="cyber-card text-center py-10">
            <p className="text-cyber-text-muted text-sm">
              No exercises logged yet. Log a workout to start your history.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <HistoryRow key={entry.key} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}

function HistoryRow({ entry }: { entry: Entry }) {
  const router = useRouter();
  const { log, exercise } = entry;
  const info = getExerciseById(exercise.exerciseId);
  const name = info?.name ?? exercise.exerciseId;
  const duration = formatWorkoutDuration(log);
  const nonEmptySets = exercise.sets.filter(
    (s) => s.weight > 0 || s.reps > 0
  );
  const setSummary = formatSetSummary(nonEmptySets);

  const [copied, setCopied] = useState(false);

  const handleRowClick = () => {
    router.push(`/log/${log.id}`);
  };

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        formatExerciseExport(exercise, name, log)
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy exercise:", err);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRowClick();
        }
      }}
      className="cyber-card py-2.5 px-3 cursor-pointer hover:border-cyber-border-active transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[0.65rem] text-cyber-text-muted font-mono">
              {formatDate(log.date)}
            </span>
            {duration && (
              <span className="cyber-badge cyber-badge-cyan text-[0.55rem]">
                {duration}
              </span>
            )}
            {info?.primaryMuscles?.[0] && (
              <span className="text-[0.55rem] text-cyber-cyan capitalize">
                {info.primaryMuscles[0]}
              </span>
            )}
          </div>
          {setSummary && (
            <p className="text-xs font-mono text-cyber-text-muted mt-1">
              {setSummary}
            </p>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="cyber-btn text-[0.65rem] py-1 px-2 flex-shrink-0"
          aria-label={`Copy ${name} summary to clipboard`}
        >
          {copied ? (
            <span className="text-cyber-green">Copied!</span>
          ) : (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function formatSetSummary(sets: { weight: number; reps: number }[]): string {
  if (sets.length === 0) return "";
  const allSameWeight =
    sets.every((s) => s.weight === sets[0].weight) && sets[0].weight > 0;
  if (allSameWeight) {
    return `${sets.length} sets · ${sets[0].weight}kg × ${sets
      .map((s) => s.reps)
      .join("/")}`;
  }
  return `${sets.length} sets · ${sets
    .map((s) => `${s.weight}×${s.reps}`)
    .join(", ")}`;
}
