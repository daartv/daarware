import { db } from "@/lib/db";

interface ExportData {
  version: 1;
  exportedAt: string;
  workoutLogs: any[];
  workoutTemplates: any[];
  personalRecords: any[];
  userSettings: any[];
}

export async function exportAllData(): Promise<string> {
  const [workoutLogs, workoutTemplates, personalRecords, userSettings] =
    await Promise.all([
      db.workoutLogs.toArray(),
      db.workoutTemplates.toArray(),
      db.personalRecords.toArray(),
      db.userSettings.toArray(),
    ]);

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    workoutLogs,
    workoutTemplates,
    personalRecords,
    userSettings,
  };

  return JSON.stringify(data, null, 2);
}

export async function importAllData(jsonStr: string): Promise<void> {
  const data: ExportData = JSON.parse(jsonStr);

  if (data.version !== 1) {
    throw new Error(`Unsupported export version: ${data.version}`);
  }

  await db.transaction(
    "rw",
    db.workoutLogs,
    db.workoutTemplates,
    db.personalRecords,
    db.userSettings,
    async () => {
      await db.workoutLogs.clear();
      await db.workoutTemplates.clear();
      await db.personalRecords.clear();
      await db.userSettings.clear();

      if (data.workoutLogs?.length) await db.workoutLogs.bulkAdd(data.workoutLogs);
      if (data.workoutTemplates?.length) await db.workoutTemplates.bulkAdd(data.workoutTemplates);
      if (data.personalRecords?.length) await db.personalRecords.bulkAdd(data.personalRecords);
      if (data.userSettings?.length) await db.userSettings.bulkAdd(data.userSettings);
    }
  );
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    db.workoutLogs,
    db.workoutTemplates,
    db.personalRecords,
    db.userSettings,
    async () => {
      await db.workoutLogs.clear();
      await db.workoutTemplates.clear();
      await db.personalRecords.clear();
      await db.userSettings.clear();
    }
  );
}

export function downloadJson(data: string, filename: string): void {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
