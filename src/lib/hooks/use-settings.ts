"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type UserSettings } from "@/lib/db";

export function useSettings() {
  const settings = useLiveQuery(() => db.userSettings.toCollection().first());
  return { data: settings ?? null, isLoading: settings === undefined };
}

export async function updateSettings(
  data: Partial<Omit<UserSettings, "id">>
): Promise<void> {
  const existing = await db.userSettings.toCollection().first();
  if (existing) {
    await db.userSettings.update(existing.id, data);
  } else {
    await db.userSettings.add({ ...data } as UserSettings);
  }
}
