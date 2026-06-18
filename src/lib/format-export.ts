import type { WorkoutExercise, WorkoutLog } from "@/lib/db";
import { formatDate } from "@/lib/utils";

/**
 * Multi-line plaintext summary of a single exercise within a workout, suitable
 * for pasting into a chat AI to log an activity. Includes the whole workout's
 * duration as context (not per-exercise timing).
 *
 * Example:
 *   Bench Press · Jun 18, 2026
 *   - 60kg × 10
 *   - 60kg × 8
 *   - 60kg × 6
 *   Workout duration: 1h 12m
 */
export function formatExerciseExport(
  exercise: WorkoutExercise,
  exerciseName: string,
  log: WorkoutLog
): string {
  const lines: string[] = [];
  lines.push(`${exerciseName} · ${formatDate(log.date)}`);

  const sets = exercise.sets.filter((s) => s.weight > 0 || s.reps > 0);
  for (const set of sets) {
    lines.push(`- ${set.weight}kg × ${set.reps}`);
  }

  const duration = formatWorkoutDuration(log);
  if (duration) {
    lines.push(`Workout duration: ${duration}`);
  }

  return lines.join("\n");
}

/**
 * Format the workout's total duration as "Xh Ym" / "Xm" / "Xs", or return
 * undefined when either timestamp is missing or the math doesn't make sense
 * (pre-schema-change rows lack startedAt).
 */
export function formatWorkoutDuration(log: WorkoutLog): string | undefined {
  if (!log.startedAt || !log.createdAt) return undefined;
  const startMs = Date.parse(log.startedAt);
  const endMs = Date.parse(log.createdAt);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return undefined;
  const diffMs = endMs - startMs;
  if (diffMs <= 0) return undefined;

  const totalSeconds = Math.round(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}
