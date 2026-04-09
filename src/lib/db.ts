import Dexie, { type EntityTable } from "dexie";

// --- Types ---

export interface WorkoutSet {
  reps: number;
  weight: number;
  rpe?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutLog {
  id: number;
  date: string; // ISO date string
  name: string;
  templateId?: number;
  exercises: WorkoutExercise[];
  notes?: string;
  createdAt: string;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  color: string; // accent color key
  exerciseIds: string[];
  defaultSets: number;
  createdAt: string;
}

export interface PersonalRecord {
  id: number;
  exerciseId: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  date: string;
  workoutLogId: number;
}

export interface UserSettings {
  id: number;
}

export interface FavoriteExercise {
  id: number;
  exerciseId: string;
}

// --- Database ---

const db = new Dexie("DaarWareDB") as Dexie & {
  workoutLogs: EntityTable<WorkoutLog, "id">;
  workoutTemplates: EntityTable<WorkoutTemplate, "id">;
  personalRecords: EntityTable<PersonalRecord, "id">;
  userSettings: EntityTable<UserSettings, "id">;
  favorites: EntityTable<FavoriteExercise, "id">;
};

db.version(1).stores({
  workoutLogs: "++id, date, templateId",
  workoutTemplates: "++id, name",
  personalRecords: "++id, exerciseId, date, [exerciseId+date]",
  userSettings: "++id",
});

db.version(2).stores({
  workoutLogs: "++id, date, templateId",
  workoutTemplates: "++id, name",
  personalRecords: "++id, exerciseId, date, [exerciseId+date]",
  userSettings: "++id",
  favorites: "++id, &exerciseId",
});

export { db };
