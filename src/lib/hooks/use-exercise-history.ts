"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { calculate1RM } from "@/lib/utils";

export interface ExerciseSession {
  date: string;
  best1RM: number;
  bestWeight: number;
  bestReps: number;
  totalSets: number;
  workoutLogId: number;
}

/** Get all sessions for a specific exercise, sorted by date ascending */
export function useExerciseHistory(exerciseId: string): ExerciseSession[] {
  const logs = useLiveQuery(() => db.workoutLogs.toArray(), []);

  return useMemo(() => {
    if (!logs) return [];

    const sessions: ExerciseSession[] = [];

    for (const log of logs) {
      const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
      if (!ex || ex.sets.length === 0) continue;

      let best1RM = 0;
      let bestWeight = 0;
      let bestReps = 0;

      for (const set of ex.sets) {
        if (set.weight <= 0 || set.reps <= 0) continue;
        const e1rm = calculate1RM(set.weight, set.reps);
        if (e1rm > best1RM) {
          best1RM = e1rm;
          bestWeight = set.weight;
          bestReps = set.reps;
        }
      }

      if (best1RM > 0) {
        sessions.push({
          date: log.date,
          best1RM,
          bestWeight,
          bestReps,
          totalSets: ex.sets.filter((s) => s.weight > 0 && s.reps > 0).length,
          workoutLogId: log.id,
        });
      }
    }

    return sessions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [logs, exerciseId]);
}

export type Trend = "up" | "down" | "flat" | "new";

/** Determine the trend for an exercise based on recent sessions */
export function getTrend(sessions: ExerciseSession[]): Trend {
  if (sessions.length <= 1) return "new";

  // Compare the last session's best 1RM to the one before it
  const last = sessions[sessions.length - 1];
  const prev = sessions[sessions.length - 2];

  const diff = last.best1RM - prev.best1RM;
  const pct = Math.abs(diff) / prev.best1RM;

  // Less than 1% change = flat
  if (pct < 0.01) return "flat";
  return diff > 0 ? "up" : "down";
}

/** Check if the exercise has been stalling (no improvement over last N sessions) */
export function isStalling(sessions: ExerciseSession[], n = 3): boolean {
  if (sessions.length < n) return false;
  const recent = sessions.slice(-n);
  const max = Math.max(...recent.map((s) => s.best1RM));
  const min = Math.min(...recent.map((s) => s.best1RM));
  // If the range is within 2% of max, it's stalling
  return (max - min) / max < 0.02;
}
