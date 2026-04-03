"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type WorkoutLog, type WorkoutExercise } from "@/lib/db";
import { calculate1RM, todayISO } from "@/lib/utils";

export function useWorkoutLogs() {
  const logs = useLiveQuery(() =>
    db.workoutLogs.orderBy("date").reverse().toArray()
  );
  return logs ?? [];
}

export function useRecentWorkouts(limit = 5) {
  const logs = useLiveQuery(() =>
    db.workoutLogs.orderBy("date").reverse().limit(limit).toArray()
  );
  return logs ?? [];
}

export function useWorkoutLog(id: number) {
  return useLiveQuery(() => db.workoutLogs.get(id), [id]);
}

export async function saveWorkoutLog(
  data: Omit<WorkoutLog, "id" | "createdAt">
): Promise<number> {
  const id = await db.workoutLogs.add({
    ...data,
    createdAt: new Date().toISOString(),
  } as WorkoutLog);

  // Check for new PRs
  await checkAndUpdatePRs(id as number, data.date, data.exercises);

  return id as number;
}

export async function updateWorkoutLog(
  id: number,
  data: Partial<Omit<WorkoutLog, "id">>
): Promise<void> {
  await db.workoutLogs.update(id, data);
}

export async function deleteWorkoutLog(id: number): Promise<void> {
  await db.workoutLogs.delete(id);
}

async function checkAndUpdatePRs(
  workoutLogId: number,
  date: string,
  exercises: WorkoutExercise[]
): Promise<string[]> {
  const newPRExerciseIds: string[] = [];

  for (const exercise of exercises) {
    // Find the best set by estimated 1RM
    let best1RM = 0;
    let bestWeight = 0;
    let bestReps = 0;

    for (const set of exercise.sets) {
      const e1rm = calculate1RM(set.weight, set.reps);
      if (e1rm > best1RM) {
        best1RM = e1rm;
        bestWeight = set.weight;
        bestReps = set.reps;
      }
    }

    if (best1RM <= 0) continue;

    // Check existing PR
    const existingPR = await db.personalRecords
      .where("exerciseId")
      .equals(exercise.exerciseId)
      .first();

    if (!existingPR || best1RM > existingPR.estimated1RM) {
      if (existingPR) {
        await db.personalRecords.update(existingPR.id, {
          weight: bestWeight,
          reps: bestReps,
          estimated1RM: best1RM,
          date,
          workoutLogId,
        });
      } else {
        await db.personalRecords.add({
          exerciseId: exercise.exerciseId,
          weight: bestWeight,
          reps: bestReps,
          estimated1RM: best1RM,
          date,
          workoutLogId,
        } as any);
      }
      newPRExerciseIds.push(exercise.exerciseId);
    }
  }

  return newPRExerciseIds;
}
