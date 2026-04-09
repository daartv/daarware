"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function useFavorites() {
  const rows = useLiveQuery(() => db.favorites.toArray());

  const favoriteIds = useMemo(
    () => new Set((rows ?? []).map((r) => r.exerciseId)),
    [rows]
  );

  const toggle = async (exerciseId: string) => {
    const existing = await db.favorites
      .where("exerciseId")
      .equals(exerciseId)
      .first();
    if (existing) {
      await db.favorites.delete(existing.id);
    } else {
      await db.favorites.add({ exerciseId } as any);
    }
  };

  const isFavorite = (exerciseId: string) => favoriteIds.has(exerciseId);

  return { favoriteIds, toggle, isFavorite };
}
