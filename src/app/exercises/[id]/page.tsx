"use client";

import { use } from "react";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { getExerciseById, getExerciseImageUrl } from "@/lib/exercise-data";
import { usePersonalRecord } from "@/lib/hooks/use-personal-records";
import { formatDate, timeAgo, getPRStaleness, getNudgeInfo, youtubeSearchUrl } from "@/lib/utils";
import { MuscleMap } from "@/components/exercises/muscle-map";
import { ProgressionChart } from "@/components/records/progression-chart";

export default function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const exercise = getExerciseById(decodeURIComponent(id));
  const pr = usePersonalRecord(decodeURIComponent(id));

  if (!exercise) {
    return (
      <div>
        <Header title="Not Found" back />
        <div className="px-4 pt-8 text-center">
          <p className="text-cyber-text-muted">Exercise not found</p>
        </div>
      </div>
    );
  }

  const staleness = pr ? getPRStaleness(pr.date) : null;
  const nudge = staleness && staleness !== "fresh" ? getNudgeInfo(staleness) : null;

  return (
    <div>
      <Header title={exercise.name} back />

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto pb-4">
        {/* Images */}
        {exercise.images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {exercise.images.map((img, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 w-40 h-40 cyber-card overflow-hidden p-0"
              >
                <Image
                  src={getExerciseImageUrl(img)}
                  alt={`${exercise.name} step ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}

        {/* Info Badges */}
        <div className="flex flex-wrap gap-2">
          {exercise.primaryMuscles.map((m) => (
            <span key={m} className="cyber-badge cyber-badge-cyan capitalize">
              {m}
            </span>
          ))}
          {exercise.secondaryMuscles.map((m) => (
            <span key={m} className="cyber-badge cyber-badge-cyan capitalize" style={{ opacity: 0.6 }}>
              {m}
            </span>
          ))}
          {exercise.equipment && (
            <span className="cyber-badge cyber-badge-yellow capitalize">
              {exercise.equipment}
            </span>
          )}
          <span className="cyber-badge cyber-badge-green capitalize">
            {exercise.level}
          </span>
        </div>

        {/* Muscle Map */}
        <div className="cyber-card py-3 flex justify-center">
          <MuscleMap
            primaryMuscles={exercise.primaryMuscles}
            secondaryMuscles={exercise.secondaryMuscles}
          />
        </div>

        {/* Personal Record */}
        {pr && (
          <div className="cyber-card cyber-corners cyber-corners-bottom">
            <div className="flex items-center justify-between mb-1">
              <h3 className="cyber-heading">Personal Record</h3>
              {nudge && (
                <span className={`cyber-badge ${nudge.color === "red" ? "cyber-badge-red" : "cyber-badge-yellow"}`}>
                  {nudge.message}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold font-mono text-cyber-cyan">
                {pr.weight}
              </span>
              <span className="text-cyber-text-muted text-sm">
                x {pr.reps} reps
              </span>
              <span className="text-cyber-text-muted text-xs ml-auto">
                est 1RM: <span className="text-cyber-green font-mono">{pr.estimated1RM}</span>
              </span>
            </div>
            <p className="text-xs text-cyber-text-muted mt-1">
              {formatDate(pr.date)} &middot; {timeAgo(pr.date)}
            </p>
          </div>
        )}

        {/* Progression Chart */}
        <div className="cyber-card">
          <ProgressionChart exerciseId={decodeURIComponent(id)} />
        </div>

        {/* YouTube Link */}
        <a
          href={youtubeSearchUrl(exercise.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="cyber-btn w-full justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          Watch Form Tutorial
        </a>

        {/* Instructions */}
        {exercise.instructions.length > 0 && (
          <section>
            <h3 className="cyber-heading mb-2">Instructions</h3>
            <ol className="space-y-2">
              {exercise.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-xs font-mono font-bold text-cyber-cyan border border-cyber-border">
                    {i + 1}
                  </span>
                  <p className="text-cyber-text leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
