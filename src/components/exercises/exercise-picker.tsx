"use client";

import { useState, useMemo } from "react";
import { filterExercises, ALL_MUSCLES } from "@/lib/exercise-data";
import { ExerciseInfoButton } from "@/components/exercises/exercise-info-drawer";

interface ExercisePickerProps {
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
}

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("");

  const exercises = useMemo(
    () => filterExercises({ query, muscles: muscle ? [muscle] : [] }),
    [query, muscle]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg max-h-[80vh] bg-cyber-bg border-t border-cyber-border sm:border sm:rounded overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-border">
          <h2 className="cyber-heading text-sm">Select Exercise</h2>
          <button
            onClick={onClose}
            className="text-cyber-text-muted hover:text-cyber-red transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="px-4 py-2 space-y-2 border-b border-cyber-border">
          <input
            type="text"
            placeholder="Search exercises..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="cyber-input"
            autoFocus
          />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setMuscle("")}
              className={`text-[0.65rem] px-2 py-1 whitespace-nowrap uppercase tracking-wider border transition-colors ${
                !muscle
                  ? "border-cyber-cyan text-cyber-cyan bg-cyber-cyan-dim"
                  : "border-cyber-border text-cyber-text-muted"
              }`}
            >
              All
            </button>
            {ALL_MUSCLES.map((m) => (
              <button
                key={m}
                onClick={() => setMuscle(m)}
                className={`text-[0.65rem] px-2 py-1 whitespace-nowrap uppercase tracking-wider border transition-colors capitalize ${
                  muscle === m
                    ? "border-cyber-cyan text-cyber-cyan bg-cyber-cyan-dim"
                    : "border-cyber-border text-cyber-text-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {exercises.slice(0, 50).map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center border-b border-cyber-border/50 hover:bg-cyber-surface-hover transition-colors"
            >
              <button
                onClick={() => onSelect(exercise.id)}
                className="flex-1 text-left px-4 py-2.5"
              >
                <p className="text-sm font-semibold">{exercise.name}</p>
                <div className="flex gap-1 mt-0.5">
                  {exercise.primaryMuscles.map((m) => (
                    <span
                      key={m}
                      className="text-[0.55rem] text-cyber-cyan capitalize"
                    >
                      {m}
                    </span>
                  ))}
                  {exercise.equipment && (
                    <span className="text-[0.55rem] text-cyber-yellow capitalize">
                      &middot; {exercise.equipment}
                    </span>
                  )}
                </div>
              </button>
              <div className="pr-3">
                <ExerciseInfoButton exerciseId={exercise.id} />
              </div>
            </div>
          ))}
          {exercises.length === 0 && (
            <p className="text-center text-cyber-text-muted text-sm py-8">
              No exercises found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
