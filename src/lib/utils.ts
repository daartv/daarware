/**
 * Calculate estimated 1 Rep Max using the Epley formula.
 * Returns the weight itself if reps === 1.
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Format a date string as a readable date.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format as relative time (e.g., "3 days ago", "2 months ago").
 */
export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Days since a given date string.
 */
export function daysSince(dateStr: string): number {
  const now = new Date();
  const date = new Date(dateStr);
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get PR staleness level based on days since record.
 */
export function getPRStaleness(
  dateStr: string
): "fresh" | "stale" | "outdated" | "critical" {
  const days = daysSince(dateStr);
  if (days < 30) return "fresh";
  if (days < 60) return "stale";
  if (days < 90) return "outdated";
  return "critical";
}

/**
 * Get nudge message and color based on staleness.
 */
export function getNudgeInfo(staleness: "stale" | "outdated" | "critical") {
  switch (staleness) {
    case "stale":
      return { message: "UPGRADE AVAILABLE", color: "yellow" as const };
    case "outdated":
      return { message: "CYBERWARE OUTDATED", color: "yellow" as const };
    case "critical":
      return { message: "CRITICAL: SYSTEM STALE", color: "red" as const };
  }
}

/**
 * Convert between kg and lbs.
 */
export function convertWeight(
  weight: number,
  from: "kg" | "lbs",
  to: "kg" | "lbs"
): number {
  if (from === to) return weight;
  if (from === "kg" && to === "lbs") return Math.round(weight * 2.20462 * 10) / 10;
  return Math.round(weight / 2.20462 * 10) / 10;
}

/**
 * Today's date in ISO format (YYYY-MM-DD).
 */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Generate YouTube search URL for exercise form.
 */
export function youtubeSearchUrl(exerciseName: string): string {
  const query = encodeURIComponent(`${exerciseName} proper form tutorial`);
  return `https://www.youtube.com/results?search_query=${query}`;
}
