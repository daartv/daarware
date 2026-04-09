"use client";

import { useState, useMemo, useCallback } from "react";
import { Drawer } from "vaul";
import {
  filterExercises,
  ALL_MUSCLES,
  ALL_EQUIPMENT,
  ALL_CATEGORIES,
} from "@/lib/exercise-data";
import { ExerciseInfoButton } from "@/components/exercises/exercise-info-drawer";
import { FavoriteButton } from "@/components/exercises/favorite-button";
import { useFavorites } from "@/lib/hooks/use-favorites";

interface ExercisePickerProps {
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
}

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [muscles, setMuscles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { favoriteIds, toggle: toggleFav, isFavorite } = useFavorites();

  const totalFilters = muscles.length + equipment.length + categories.length;

  const exercises = useMemo(
    () =>
      filterExercises({
        query,
        muscles,
        equipment,
        categories,
        favoriteIds,
      }),
    [query, muscles, equipment, categories, favoriteIds]
  );

  const toggleChip = useCallback(
    (
      value: string,
      setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
      setter((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      );
    },
    []
  );

  const clearFilters = () => {
    setMuscles([]);
    setEquipment([]);
    setCategories([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[80vh] bg-cyber-bg border-t border-cyber-border sm:border sm:rounded overflow-hidden flex flex-col animate-slide-up">
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

        {/* Search + Filter Button */}
        <div className="px-4 py-2 space-y-2 border-b border-cyber-border">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search exercises..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="cyber-input flex-1"
              autoFocus
            />
            <button
              onClick={() => setShowFilters(true)}
              className={`cyber-btn text-xs px-3 flex-shrink-0 ${
                totalFilters > 0 ? "border-cyber-cyan text-cyber-cyan" : ""
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              {totalFilters > 0 && (
                <span className="w-4 h-4 flex items-center justify-center text-[0.55rem] font-mono bg-cyber-cyan text-cyber-bg rounded-sm">
                  {totalFilters}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {totalFilters > 0 && (
            <div className="flex flex-wrap gap-1 animate-fade-in">
              {muscles.map((m) => (
                <ActiveChip key={`m-${m}`} label={m} color="cyan" onRemove={() => toggleChip(m, setMuscles)} />
              ))}
              {equipment.map((e) => (
                <ActiveChip key={`e-${e}`} label={e} color="yellow" onRemove={() => toggleChip(e, setEquipment)} />
              ))}
              {categories.map((c) => (
                <ActiveChip key={`c-${c}`} label={c} color="green" onRemove={() => toggleChip(c, setCategories)} />
              ))}
              <button onClick={clearFilters} className="text-[0.55rem] text-cyber-red px-1">
                Clear
              </button>
            </div>
          )}
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
                <div className="flex items-center gap-1.5">
                  {isFavorite(exercise.id) && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#E8C84A" stroke="none" className="flex-shrink-0">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                  <p className="text-sm font-semibold">{exercise.name}</p>
                </div>
                <div className="flex gap-1 mt-0.5">
                  {exercise.primaryMuscles.map((m) => (
                    <span key={m} className="text-[0.55rem] text-cyber-cyan capitalize">{m}</span>
                  ))}
                  {exercise.equipment && (
                    <span className="text-[0.55rem] text-cyber-yellow capitalize">&middot; {exercise.equipment}</span>
                  )}
                </div>
              </button>
              <div className="pr-2 flex items-center gap-0.5">
                <FavoriteButton isFavorite={isFavorite(exercise.id)} onToggle={() => toggleFav(exercise.id)} />
                <ExerciseInfoButton exerciseId={exercise.id} />
              </div>
            </div>
          ))}
          {exercises.length === 0 && (
            <p className="text-center text-cyber-text-muted text-sm py-8">No exercises found</p>
          )}
        </div>
      </div>

      {/* Filter Bottom Sheet */}
      <Drawer.Root open={showFilters} onOpenChange={setShowFilters}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 z-[60]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[60] outline-none">
            <div className="bg-cyber-bg border-t border-cyber-border max-h-[70vh] overflow-y-auto">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-cyber-text-dim" />
              </div>
              <div className="px-4 pb-6 space-y-4 max-w-lg mx-auto">
                <Drawer.Title className="cyber-heading text-sm">Filters</Drawer.Title>

                <FilterSection
                  label="Muscles"
                  options={ALL_MUSCLES}
                  selected={muscles}
                  onToggle={(v) => toggleChip(v, setMuscles)}
                />
                <FilterSection
                  label="Equipment"
                  options={ALL_EQUIPMENT}
                  selected={equipment}
                  onToggle={(v) => toggleChip(v, setEquipment)}
                />
                <FilterSection
                  label="Category"
                  options={ALL_CATEGORIES}
                  selected={categories}
                  onToggle={(v) => toggleChip(v, setCategories)}
                />

                <div className="flex gap-2">
                  <button onClick={clearFilters} className="cyber-btn cyber-btn-danger flex-1">
                    Clear All
                  </button>
                  <button onClick={() => setShowFilters(false)} className="cyber-btn cyber-btn-primary flex-1">
                    Apply ({exercises.length})
                  </button>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

function FilterSection({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <h3 className="cyber-heading text-[0.6rem] mb-1.5">
        {label} {selected.length > 0 && <span className="text-cyber-cyan">({selected.length})</span>}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={`text-[0.6rem] px-2 py-1 uppercase tracking-wider border transition-all capitalize ${
                isSelected
                  ? "border-cyber-cyan text-cyber-bg bg-cyber-cyan font-bold"
                  : "border-cyber-border text-cyber-text-muted hover:border-cyber-border-active"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActiveChip({
  label,
  color,
  onRemove,
}: {
  label: string;
  color: "cyan" | "yellow" | "green";
  onRemove: () => void;
}) {
  const cls = { cyan: "cyber-badge-cyan", yellow: "cyber-badge-yellow", green: "cyber-badge-green" };
  return (
    <span className={`cyber-badge ${cls[color]} text-[0.55rem] capitalize flex items-center gap-1`}>
      {label}
      <button onClick={onRemove} className="hover:opacity-70">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
