"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import Image from "next/image";
import {
  getExerciseById,
  getExerciseImageUrl,
} from "@/lib/exercise-data";
import { MuscleMap } from "@/components/exercises/muscle-map";
import { ProgressionChart } from "@/components/records/progression-chart";
import { EstMaxLabel } from "@/components/ui/est-max-label";
import { usePersonalRecord } from "@/lib/hooks/use-personal-records";
import {
  formatDate,
  timeAgo,
  getPRStaleness,
  getNudgeInfo,
  youtubeSearchUrl,
} from "@/lib/utils";

/** Small info icon button that opens the exercise detail drawer */
export function ExerciseInfoButton({ exerciseId }: { exerciseId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-cyber-text-dim hover:text-cyber-cyan transition-colors"
        aria-label="Exercise info"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>

      <ExerciseDrawer
        exerciseId={exerciseId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

function ExerciseDrawer({
  exerciseId,
  open,
  onOpenChange,
}: {
  exerciseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const exercise = getExerciseById(exerciseId);
  const pr = usePersonalRecord(exerciseId);

  if (!exercise) return null;

  const staleness = pr ? getPRStaleness(pr.date) : null;
  const nudge =
    staleness && staleness !== "fresh" ? getNudgeInfo(staleness) : null;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 outline-none">
          <div className="bg-cyber-bg border-t border-cyber-border max-h-[85vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-cyber-text-dim" />
            </div>

            <div className="px-4 pb-6 space-y-4 max-w-lg mx-auto">
              {/* Title */}
              <Drawer.Title className="text-lg font-bold text-cyber-text-bright">
                {exercise.name}
              </Drawer.Title>

              {/* Images */}
              {exercise.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {exercise.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative flex-shrink-0 w-36 h-36 border border-cyber-border overflow-hidden"
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

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {exercise.primaryMuscles.map((m) => (
                  <span
                    key={m}
                    className="cyber-badge cyber-badge-cyan capitalize"
                  >
                    {m}
                  </span>
                ))}
                {exercise.secondaryMuscles.map((m) => (
                  <span
                    key={m}
                    className="cyber-badge cyber-badge-cyan capitalize opacity-60"
                  >
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
                    <span className="cyber-heading">Personal Record</span>
                    {nudge && (
                      <span
                        className={`cyber-badge ${
                          nudge.color === "red"
                            ? "cyber-badge-red"
                            : "cyber-badge-yellow"
                        }`}
                      >
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
                    <span className="text-xs text-cyber-text-muted ml-auto">
                      <EstMaxLabel value={pr.estimated1RM} className="text-xs" />
                    </span>
                  </div>
                  <p className="text-xs text-cyber-text-muted mt-1">
                    {formatDate(pr.date)} &middot; {timeAgo(pr.date)}
                  </p>
                </div>
              )}

              {/* Progression Chart */}
              <div className="cyber-card">
                <ProgressionChart exerciseId={exerciseId} />
              </div>

              {/* YouTube Link */}
              <a
                href={youtubeSearchUrl(exercise.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-btn w-full justify-center"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Watch Form Tutorial
              </a>

              {/* Instructions */}
              {exercise.instructions.length > 0 && (
                <div>
                  <h3 className="cyber-heading mb-2">Instructions</h3>
                  <ol className="space-y-2">
                    {exercise.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-xs font-mono font-bold text-cyber-cyan border border-cyber-border">
                          {i + 1}
                        </span>
                        <p className="text-cyber-text leading-relaxed">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
