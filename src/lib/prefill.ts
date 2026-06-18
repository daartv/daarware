import type { WorkoutLog, WorkoutSet } from "@/lib/db";
import { calculate1RM } from "@/lib/utils";

export type PrefillReason = "new" | "match" | "plateau-bump" | "restore-peak";

export interface PrefillResult {
  sets: WorkoutSet[];
  reason: PrefillReason;
  /** Detected weight interval used for plateau bumps. Undefined for "new"/"match"/"restore-peak". */
  bumpIncrement?: number;
}

const TREND_THRESHOLD = 0.01;
const REGRESSION_LOOKBACK = 5;
const DEFAULT_INTERVAL = 2.5;

interface SessionData {
  date: string;
  sets: WorkoutSet[];
}

export function prefillSetsForExercise(
  logs: WorkoutLog[],
  exerciseId: string,
  defaultSetCount: number
): PrefillResult {
  const sessions = collectSessions(logs, exerciseId);

  if (sessions.length === 0) {
    return {
      sets: Array.from({ length: Math.max(1, defaultSetCount) }, () => ({
        reps: 0,
        weight: 0,
      })),
      reason: "new",
    };
  }

  const last = sessions[sessions.length - 1];

  if (sessions.length === 1) {
    return { sets: cloneSets(last.sets), reason: "match" };
  }

  const prev = sessions[sessions.length - 2];
  const lastBest = bestE1RM(last.sets);
  const prevBest = bestE1RM(prev.sets);
  const pct = prevBest > 0 ? (lastBest - prevBest) / prevBest : 0;

  if (pct >= TREND_THRESHOLD) {
    return { sets: cloneSets(last.sets), reason: "match" };
  }

  if (pct <= -TREND_THRESHOLD) {
    return {
      sets: floorWithRecentPeak(last.sets, sessions),
      reason: "restore-peak",
    };
  }

  const bump = detectInterval(sessions);
  return {
    sets: last.sets.map((s) => ({ ...s, weight: s.weight + bump })),
    reason: "plateau-bump",
    bumpIncrement: bump,
  };
}

function collectSessions(
  logs: WorkoutLog[],
  exerciseId: string
): SessionData[] {
  const out: SessionData[] = [];
  for (const log of logs) {
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;
    const cleanSets = ex.sets.filter((s) => s.weight > 0 || s.reps > 0);
    if (cleanSets.length === 0) continue;
    out.push({ date: log.date, sets: cleanSets });
  }
  // sort oldest -> newest
  out.sort((a, b) => a.date.localeCompare(b.date));
  return out;
}

function cloneSets(sets: WorkoutSet[]): WorkoutSet[] {
  return sets.map((s) => ({ ...s }));
}

function bestE1RM(sets: WorkoutSet[]): number {
  let best = 0;
  for (const s of sets) {
    const e = calculate1RM(s.weight, s.reps);
    if (e > best) best = e;
  }
  return best;
}

function floorWithRecentPeak(
  lastSets: WorkoutSet[],
  sessions: SessionData[]
): WorkoutSet[] {
  const recent = sessions.slice(-REGRESSION_LOOKBACK);
  return lastSets.map((s, i) => {
    let maxW = s.weight;
    for (const sess of recent) {
      const other = sess.sets[i];
      if (other && other.weight > maxW) maxW = other.weight;
    }
    return { ...s, weight: maxW };
  });
}

/**
 * Infer the user's weight progression granularity for this exercise from their
 * own history. Returns the most common positive delta between adjacent unique
 * weights; defaults to 2.5 when there's insufficient signal.
 */
export function detectInterval(sessions: SessionData[]): number {
  const weights = new Set<number>();
  for (const sess of sessions) {
    for (const set of sess.sets) {
      if (set.weight > 0) weights.add(set.weight);
    }
  }
  const sorted = [...weights].sort((a, b) => a - b);
  if (sorted.length < 2) return DEFAULT_INTERVAL;

  const counts = new Map<number, number>();
  for (let i = 1; i < sorted.length; i++) {
    const d = sorted[i] - sorted[i - 1];
    if (d > 0) counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  if (counts.size === 0) return DEFAULT_INTERVAL;

  let bestDelta = Infinity;
  let bestCount = 0;
  for (const [delta, count] of counts) {
    if (count > bestCount || (count === bestCount && delta < bestDelta)) {
      bestDelta = delta;
      bestCount = count;
    }
  }
  return bestDelta;
}
