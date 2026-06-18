"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { useWorkoutLogs } from "@/lib/hooks/use-workout-logs";
import { getExerciseById } from "@/lib/exercise-data";
import { formatDate } from "@/lib/utils";
import {
  formatWorkoutExport,
  formatWorkoutDuration,
} from "@/lib/format-export";
import type { WorkoutLog } from "@/lib/db";

export default function HistoryPage() {
  const logs = useWorkoutLogs();

  return (
    <div>
      <Header
        title="Workout History"
        subtitle={`${logs.length} workout${logs.length === 1 ? "" : "s"}`}
        back
      />

      <div className="px-4 pt-4 space-y-2 max-w-lg mx-auto pb-4">
        {logs.length === 0 ? (
          <div className="cyber-card text-center py-10">
            <p className="text-cyber-text-muted text-sm">
              No workouts logged yet. Log a workout to start your history.
            </p>
          </div>
        ) : (
          logs.map((log) => <WorkoutRow key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
}

function WorkoutRow({ log }: { log: WorkoutLog }) {
  const router = useRouter();
  const duration = formatWorkoutDuration(log);
  const nonEmptyExercises = log.exercises.filter((ex) =>
    ex.sets.some((s) => s.weight > 0 || s.reps > 0)
  );
  const totalSets = nonEmptyExercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => s.weight > 0 || s.reps > 0).length,
    0
  );

  const exerciseNames = nonEmptyExercises.map(
    (ex) => getExerciseById(ex.exerciseId)?.name ?? ex.exerciseId
  );
  const preview = exerciseNames.join(", ");

  const [copied, setCopied] = useState(false);

  const handleRowClick = () => {
    router.push(`/log/${log.id}`);
  };

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        formatWorkoutExport(
          log,
          (id) => getExerciseById(id)?.name ?? id
        )
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy workout:", err);
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
          <p className="text-sm font-semibold truncate">{log.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[0.65rem] text-cyber-text-muted font-mono">
              {formatDate(log.date)}
            </span>
            {duration && (
              <span className="cyber-badge cyber-badge-cyan text-[0.55rem]">
                {duration}
              </span>
            )}
            <span className="text-[0.6rem] text-cyber-text-muted font-mono">
              {nonEmptyExercises.length} exercise
              {nonEmptyExercises.length === 1 ? "" : "s"} &middot; {totalSets}{" "}
              set{totalSets === 1 ? "" : "s"}
            </span>
          </div>
          {preview && (
            <p className="text-xs text-cyber-text-muted mt-1 truncate">
              {preview}
            </p>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="cyber-btn text-[0.65rem] py-1 px-2 flex-shrink-0"
          aria-label={`Copy ${log.name} summary to clipboard`}
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
