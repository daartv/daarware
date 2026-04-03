"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type WorkoutTemplate } from "@/lib/db";

export function useTemplates() {
  const templates = useLiveQuery(() =>
    db.workoutTemplates.toArray()
  );
  return templates ?? [];
}

export function useTemplate(id: number) {
  return useLiveQuery(() => db.workoutTemplates.get(id), [id]);
}

export async function saveTemplate(
  data: Omit<WorkoutTemplate, "id" | "createdAt">
): Promise<number> {
  return (await db.workoutTemplates.add({
    ...data,
    createdAt: new Date().toISOString(),
  } as WorkoutTemplate)) as number;
}

export async function updateTemplate(
  id: number,
  data: Partial<Omit<WorkoutTemplate, "id">>
): Promise<void> {
  await db.workoutTemplates.update(id, data);
}

export async function deleteTemplate(id: number): Promise<void> {
  await db.workoutTemplates.delete(id);
}
