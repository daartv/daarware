import exercisesJson from "@/data/exercises.json";

export interface Exercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

const exercises: Exercise[] = exercisesJson as Exercise[];

// Pre-compute unique filter values
const _muscles = new Set<string>();
const _equipment = new Set<string>();
const _categories = new Set<string>();

for (const ex of exercises) {
  for (const m of ex.primaryMuscles) _muscles.add(m);
  for (const m of ex.secondaryMuscles) _muscles.add(m);
  if (ex.equipment) _equipment.add(ex.equipment);
  _categories.add(ex.category);
}

export const ALL_MUSCLES = Array.from(_muscles).sort();
export const ALL_EQUIPMENT = Array.from(_equipment).sort();
export const ALL_CATEGORIES = Array.from(_categories).sort();

/** Image base URL for the Free Exercise DB */
const IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

/** Get full image URL from relative path */
export function getExerciseImageUrl(relativePath: string): string {
  return `${IMAGE_BASE}/${relativePath}`;
}

/** Get all exercises */
export function getAllExercises(): Exercise[] {
  return exercises;
}

/** Get exercise by ID */
export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

/** Search exercises by name (case-insensitive) */
export function searchExercises(query: string): Exercise[] {
  const q = query.toLowerCase().trim();
  if (!q) return exercises;
  return exercises.filter((e) => e.name.toLowerCase().includes(q));
}

/** Filter exercises by criteria (supports multi-select arrays) */
export function filterExercises(opts: {
  query?: string;
  muscles?: string[];
  equipment?: string[];
  categories?: string[];
}): Exercise[] {
  let result = exercises;

  if (opts.query) {
    const q = opts.query.toLowerCase().trim();
    result = result.filter((e) => e.name.toLowerCase().includes(q));
  }

  if (opts.muscles && opts.muscles.length > 0) {
    const ms = opts.muscles.map((m) => m.toLowerCase());
    result = result.filter(
      (e) =>
        e.primaryMuscles.some((pm) => ms.includes(pm.toLowerCase())) ||
        e.secondaryMuscles.some((sm) => ms.includes(sm.toLowerCase()))
    );
  }

  if (opts.equipment && opts.equipment.length > 0) {
    const eqs = opts.equipment.map((eq) => eq.toLowerCase());
    result = result.filter((e) => e.equipment && eqs.includes(e.equipment.toLowerCase()));
  }

  if (opts.categories && opts.categories.length > 0) {
    const cats = opts.categories.map((c) => c.toLowerCase());
    result = result.filter((e) => cats.includes(e.category.toLowerCase()));
  }

  return result;
}
