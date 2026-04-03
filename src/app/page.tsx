"use client";

import Link from "next/link";
import { useRecentWorkouts } from "@/lib/hooks/use-workout-logs";
import { usePersonalRecords, useStaleRecords } from "@/lib/hooks/use-personal-records";
import { useTemplates } from "@/lib/hooks/use-templates";
import { getExerciseById } from "@/lib/exercise-data";
import { formatDate, timeAgo, getPRStaleness, getNudgeInfo } from "@/lib/utils";

export default function Dashboard() {
  const recentWorkouts = useRecentWorkouts(5);
  const allRecords = usePersonalRecords();
  const staleRecords = useStaleRecords(30);
  const templates = useTemplates();

  return (
    <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cyber-text-muted text-xs uppercase tracking-widest font-mono">
              System Online
            </p>
            <h1 className="text-2xl font-bold text-cyber-cyan tracking-wide">
              DAARWARE
            </h1>
          </div>
          <Link href="/settings" className="text-cyber-text-muted hover:text-cyber-cyan transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
        </div>
        <div className="cyber-divider mt-3" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/log"
          className="cyber-card cyber-corners cyber-corners-bottom flex flex-col items-center gap-2 py-4 text-center hover:border-cyber-border-active"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyber-cyan">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="text-sm font-semibold uppercase tracking-wider text-cyber-cyan">
            Log Workout
          </span>
        </Link>
        <Link
          href="/exercises"
          className="cyber-card cyber-corners cyber-corners-bottom flex flex-col items-center gap-2 py-4 text-center hover:border-cyber-border-active"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyber-yellow">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
            <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
          </svg>
          <span className="text-sm font-semibold uppercase tracking-wider text-cyber-yellow">
            Exercise DB
          </span>
        </Link>
      </div>

      {/* Stale PR Alerts */}
      {staleRecords.length > 0 && (
        <section>
          <h2 className="cyber-heading mb-2">System Alerts</h2>
          <div className="space-y-2">
            {staleRecords.slice(0, 3).map((record) => {
              const exercise = getExerciseById(record.exerciseId);
              const staleness = getPRStaleness(record.date);
              if (staleness === "fresh") return null;
              const nudge = getNudgeInfo(staleness);
              return (
                <div
                  key={record.id}
                  className={`cyber-card flex items-center justify-between py-2 px-3 border-l-2 ${
                    nudge.color === "red"
                      ? "border-l-cyber-red"
                      : "border-l-cyber-yellow"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {exercise?.name ?? record.exerciseId}
                    </p>
                    <p className="text-xs text-cyber-text-muted">
                      PR: {record.weight}x{record.reps} &middot;{" "}
                      {timeAgo(record.date)}
                    </p>
                  </div>
                  <span
                    className={`cyber-badge ${
                      nudge.color === "red"
                        ? "cyber-badge-red"
                        : "cyber-badge-yellow"
                    }`}
                  >
                    {nudge.message}
                  </span>
                </div>
              );
            })}
            {staleRecords.length > 3 && (
              <Link
                href="/records"
                className="block text-center text-xs text-cyber-text-muted hover:text-cyber-cyan transition-colors py-1"
              >
                +{staleRecords.length - 3} more alerts
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Recent Workouts */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="cyber-heading">Recent Workouts</h2>
          {recentWorkouts.length > 0 && (
            <span className="cyber-badge cyber-badge-cyan">
              {recentWorkouts.length}
            </span>
          )}
        </div>
        {recentWorkouts.length === 0 ? (
          <div className="cyber-card text-center py-8">
            <p className="text-cyber-text-muted text-sm">
              No workouts logged yet
            </p>
            <Link
              href="/log"
              className="inline-block mt-3 cyber-btn cyber-btn-primary text-xs"
            >
              Start First Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentWorkouts.map((log) => (
              <Link
                key={log.id}
                href={`/log/${log.id}`}
                className="cyber-card block py-2 px-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{log.name}</p>
                    <p className="text-xs text-cyber-text-muted">
                      {log.exercises.length} exercise
                      {log.exercises.length !== 1 ? "s" : ""} &middot;{" "}
                      {log.exercises.reduce((n, e) => n + e.sets.length, 0)} sets
                    </p>
                  </div>
                  <span className="text-xs font-mono text-cyber-text-muted">
                    {formatDate(log.date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Latest PRs */}
      {allRecords.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="cyber-heading">Personal Records</h2>
            <Link
              href="/records"
              className="text-xs text-cyber-text-muted hover:text-cyber-cyan transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {allRecords
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .slice(0, 4)
              .map((record) => {
                const exercise = getExerciseById(record.exerciseId);
                const staleness = getPRStaleness(record.date);
                return (
                  <div
                    key={record.id}
                    className="cyber-card flex items-center justify-between py-2 px-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {exercise?.name ?? record.exerciseId}
                      </p>
                      <p className="text-xs font-mono text-cyber-text-muted">
                        {record.weight} x {record.reps} &middot; est 1RM:{" "}
                        {record.estimated1RM}
                      </p>
                    </div>
                    {staleness === "fresh" ? (
                      <span className="cyber-badge cyber-badge-green">
                        {timeAgo(record.date)}
                      </span>
                    ) : (
                      <span
                        className={`cyber-badge ${
                          staleness === "critical"
                            ? "cyber-badge-red"
                            : "cyber-badge-yellow"
                        }`}
                      >
                        {timeAgo(record.date)}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Templates Quick Access */}
      {templates.length > 0 && (
        <section className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="cyber-heading">Workout Plans</h2>
            <Link
              href="/templates"
              className="text-xs text-cyber-text-muted hover:text-cyber-cyan transition-colors"
            >
              Manage
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {templates.map((t) => (
              <Link
                key={t.id}
                href={`/log?template=${t.id}`}
                className="cyber-card flex-shrink-0 py-2 px-4 min-w-[120px] text-center"
              >
                <p className="text-sm font-semibold text-cyber-cyan">
                  {t.name}
                </p>
                <p className="text-xs text-cyber-text-muted mt-0.5">
                  {t.exerciseIds.length} exercises
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
