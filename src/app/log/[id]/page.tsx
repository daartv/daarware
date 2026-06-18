"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { useWorkoutLog, deleteWorkoutLog } from "@/lib/hooks/use-workout-logs";
import { getExerciseById } from "@/lib/exercise-data";
import { formatDate } from "@/lib/utils";
import { formatWorkoutDuration } from "@/lib/format-export";
import { ExerciseInfoButton } from "@/components/exercises/exercise-info-drawer";

export default function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const workoutId = Number(id);
  const workout = useWorkoutLog(workoutId);
  const router = useRouter();

  if (workout === undefined) {
    return (
      <div>
        <Header title="Loading..." back />
        <div className="px-4 pt-8 text-center">
          <div className="animate-pulse-neon text-cyber-text-muted">Loading...</div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div>
        <Header title="Not Found" back />
        <div className="px-4 pt-8 text-center">
          <p className="text-cyber-text-muted">Workout not found</p>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm("Delete this workout log?")) {
      await deleteWorkoutLog(workoutId);
      router.push("/");
    }
  };

  return (
    <div>
      <Header
        title={workout.name}
        subtitle={
          formatWorkoutDuration(workout)
            ? `${formatDate(workout.date)} · ${formatWorkoutDuration(workout)}`
            : formatDate(workout.date)
        }
        back
        action={
          <button
            onClick={handleDelete}
            className="cyber-btn cyber-btn-danger text-xs"
          >
            Delete
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-3 max-w-lg mx-auto pb-4">
        {workout.exercises.map((exercise, i) => {
          const info = getExerciseById(exercise.exerciseId);
          return (
            <div key={i} className="cyber-card cyber-corners cyber-corners-bottom">
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">
                    {info?.name ?? exercise.exerciseId}
                  </p>
                  <ExerciseInfoButton exerciseId={exercise.exerciseId} />
                </div>
                {info?.primaryMuscles && (
                  <div className="flex gap-1 mt-0.5">
                    {info.primaryMuscles.map((m) => (
                      <span key={m} className="cyber-badge cyber-badge-cyan text-[0.55rem]">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-1 text-[0.6rem] text-cyber-text-muted uppercase tracking-wider font-mono">
                  <span>Set</span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span>RPE</span>
                </div>
                {exercise.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-1 text-sm font-mono"
                  >
                    <span className="text-cyber-text-muted text-center">
                      {setIdx + 1}
                    </span>
                    <span className="text-center">{set.weight}</span>
                    <span className="text-center">{set.reps}</span>
                    <span className="text-center text-cyber-text-muted">
                      {set.rpe ?? "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {workout.notes && (
          <div className="cyber-card">
            <h3 className="cyber-heading text-[0.65rem] mb-1">Notes</h3>
            <p className="text-sm text-cyber-text">{workout.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
