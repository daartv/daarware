"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ExerciseInfoButton } from "@/components/exercises/exercise-info-drawer";
import {
  filterExercises,
  ALL_MUSCLES,
  ALL_EQUIPMENT,
  ALL_CATEGORIES,
} from "@/lib/exercise-data";

export default function ExercisesPage() {
  const [query, setQuery] = useState("");
  const [muscles, setMuscles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const exercises = useMemo(
    () => filterExercises({ query, muscles, equipment, categories }),
    [query, muscles, equipment, categories]
  );

  const hasFilters = muscles.length > 0 || equipment.length > 0 || categories.length > 0;
  const totalFilters = muscles.length + equipment.length + categories.length;

  const toggleChip = useCallback(
    (
      value: string,
      selected: string[],
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

  return (
    <div>
      <Header
        title="Exercise Database"
        subtitle={`${exercises.length} exercises`}
      />

      <div className="px-4 pt-4 space-y-3 max-w-lg mx-auto">
        {/* Search */}
        <input
          type="text"
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="cyber-input"
        />

        {/* Filter Toggles */}
        <div className="flex gap-2 items-center">
          <FilterToggle
            label="Muscles"
            count={muscles.length}
            active={expandedFilter === "muscles"}
            onClick={() =>
              setExpandedFilter((v) => (v === "muscles" ? null : "muscles"))
            }
          />
          <FilterToggle
            label="Equipment"
            count={equipment.length}
            active={expandedFilter === "equipment"}
            onClick={() =>
              setExpandedFilter((v) =>
                v === "equipment" ? null : "equipment"
              )
            }
          />
          <FilterToggle
            label="Category"
            count={categories.length}
            active={expandedFilter === "categories"}
            onClick={() =>
              setExpandedFilter((v) =>
                v === "categories" ? null : "categories"
              )
            }
          />
          {hasFilters && (
            <button
              onClick={() => {
                setMuscles([]);
                setEquipment([]);
                setCategories([]);
                setExpandedFilter(null);
              }}
              className="text-xs text-cyber-red hover:text-cyber-red/80 whitespace-nowrap px-1 ml-auto"
            >
              Clear ({totalFilters})
            </button>
          )}
        </div>

        {/* Expanded Filter Chips */}
        {expandedFilter === "muscles" && (
          <ChipGroup
            options={ALL_MUSCLES}
            selected={muscles}
            onToggle={(v) => toggleChip(v, muscles, setMuscles)}
          />
        )}
        {expandedFilter === "equipment" && (
          <ChipGroup
            options={ALL_EQUIPMENT}
            selected={equipment}
            onToggle={(v) => toggleChip(v, equipment, setEquipment)}
          />
        )}
        {expandedFilter === "categories" && (
          <ChipGroup
            options={ALL_CATEGORIES}
            selected={categories}
            onToggle={(v) => toggleChip(v, categories, setCategories)}
          />
        )}

        {/* Active filter summary */}
        {hasFilters && (
          <div className="flex flex-wrap gap-1">
            {muscles.map((m) => (
              <ActiveChip
                key={`m-${m}`}
                label={m}
                color="cyan"
                onRemove={() => setMuscles((p) => p.filter((v) => v !== m))}
              />
            ))}
            {equipment.map((e) => (
              <ActiveChip
                key={`e-${e}`}
                label={e}
                color="yellow"
                onRemove={() => setEquipment((p) => p.filter((v) => v !== e))}
              />
            ))}
            {categories.map((c) => (
              <ActiveChip
                key={`c-${c}`}
                label={c}
                color="green"
                onRemove={() => setCategories((p) => p.filter((v) => v !== c))}
              />
            ))}
          </div>
        )}

        {/* Results */}
        <div className="space-y-2 pb-4">
          {exercises.slice(0, 50).map((exercise) => (
            <Link
              key={exercise.id}
              href={`/exercises/${exercise.id}`}
              className="cyber-card block py-2.5 px-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {exercise.name}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {exercise.primaryMuscles.map((m) => (
                      <span
                        key={m}
                        className="cyber-badge cyber-badge-cyan text-[0.6rem]"
                      >
                        {m}
                      </span>
                    ))}
                    {exercise.equipment && (
                      <span className="cyber-badge cyber-badge-yellow text-[0.6rem]">
                        {exercise.equipment}
                      </span>
                    )}
                  </div>
                </div>
                <ExerciseInfoButton exerciseId={exercise.id} />
              </div>
            </Link>
          ))}
          {exercises.length > 50 && (
            <p className="text-center text-xs text-cyber-text-muted py-2">
              Showing 50 of {exercises.length} results. Refine your search.
            </p>
          )}
          {exercises.length === 0 && (
            <div className="text-center py-8">
              <p className="text-cyber-text-muted text-sm">
                No exercises found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterToggle({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs py-1.5 px-3 uppercase tracking-wider font-semibold border transition-all flex items-center gap-1.5 ${
        active
          ? "border-cyber-cyan text-cyber-cyan bg-cyber-cyan-dim"
          : count > 0
          ? "border-cyber-border-active text-cyber-cyan"
          : "border-cyber-border text-cyber-text-muted hover:text-cyber-text"
      }`}
    >
      {label}
      {count > 0 && (
        <span className="w-4 h-4 flex items-center justify-center text-[0.6rem] font-mono bg-cyber-cyan text-cyber-bg rounded-sm">
          {count}
        </span>
      )}
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={`transition-transform ${active ? "rotate-180" : ""}`}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 py-1">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`text-[0.65rem] px-2.5 py-1 uppercase tracking-wider border transition-all capitalize ${
              isSelected
                ? "border-cyber-cyan text-cyber-bg bg-cyber-cyan font-bold"
                : "border-cyber-border text-cyber-text-muted hover:border-cyber-border-active hover:text-cyber-text"
            }`}
          >
            {opt}
          </button>
        );
      })}
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
  const colorClasses = {
    cyan: "cyber-badge-cyan",
    yellow: "cyber-badge-yellow",
    green: "cyber-badge-green",
  };
  return (
    <span className={`cyber-badge ${colorClasses[color]} text-[0.6rem] capitalize flex items-center gap-1`}>
      {label}
      <button
        onClick={onRemove}
        className="hover:opacity-70 transition-opacity"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
