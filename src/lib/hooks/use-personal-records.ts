"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type PersonalRecord } from "@/lib/db";

export function usePersonalRecords() {
  const records = useLiveQuery(() => db.personalRecords.toArray());
  return records ?? [];
}

export function usePersonalRecord(exerciseId: string) {
  return useLiveQuery(
    () => db.personalRecords.where("exerciseId").equals(exerciseId).first(),
    [exerciseId]
  );
}

export function useStaleRecords(daysThreshold = 30) {
  const records = useLiveQuery(() => db.personalRecords.toArray());
  if (!records) return [];

  const now = new Date();
  return records.filter((r) => {
    const daysSince = Math.floor(
      (now.getTime() - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince >= daysThreshold;
  });
}
