import type { WorkoutExercise, WorkoutLog } from "@/lib/db";
import { formatDate } from "@/lib/utils";

/**
 * Multi-line plaintext summary of a single exercise within a workout. Kept
 * available as a helper for future per-exercise copy actions; the history
 * page uses formatWorkoutExport instead.
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
 * Multi-line plaintext summary of a whole workout: title, date, duration,
 * and every non-empty exercise with its set list. Suitable for pasting into
 * a chat AI to log the session.
 *
 * The exercise-name resolver is passed in so this module stays UI-free
 * (no direct dependency on @/lib/exercise-data).
 *
 * Example:
 *   Push Day · Jun 18, 2026
 *   Duration: 1h 12m
 *
 *   Bench Press
 *   - 60kg × 10
 *   - 60kg × 8
 *
 *   Triceps Pushdown
 *   - 25kg × 12
 *   - 25kg × 12
 */
export function formatWorkoutExport(
  log: WorkoutLog,
  getExerciseName: (exerciseId: string) => string
): string {
  const blocks: string[] = [];

  const headerLines: string[] = [`${log.name} · ${formatDate(log.date)}`];
  const duration = formatWorkoutDuration(log);
  if (duration) headerLines.push(`Duration: ${duration}`);
  blocks.push(headerLines.join("\n"));

  for (const exercise of log.exercises) {
    const sets = exercise.sets.filter((s) => s.weight > 0 || s.reps > 0);
    if (sets.length === 0) continue;
    const lines: string[] = [getExerciseName(exercise.exerciseId)];
    for (const set of sets) {
      lines.push(`- ${set.weight}kg × ${set.reps}`);
    }
    blocks.push(lines.join("\n"));
  }

  return blocks.join("\n\n");
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
