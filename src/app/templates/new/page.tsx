"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ExercisePicker } from "@/components/exercises/exercise-picker";
import { getExerciseById } from "@/lib/exercise-data";
import { ExerciseInfoButton } from "@/components/exercises/exercise-info-drawer";
import { useTemplate, saveTemplate, updateTemplate } from "@/lib/hooks/use-templates";

const COLORS = [
  { key: "cyan", label: "Cyan", className: "bg-cyber-cyan" },
  { key: "yellow", label: "Gold", className: "bg-cyber-yellow" },
  { key: "green", label: "Green", className: "bg-cyber-green" },
  { key: "pink", label: "Pink", className: "bg-cyber-pink" },
  { key: "red", label: "Red", className: "bg-cyber-red" },
];

function NewTemplateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const editTemplate = editId ? useTemplate(Number(editId)) : undefined;

  const [name, setName] = useState(editTemplate?.name ?? "");
  const [color, setColor] = useState(editTemplate?.color ?? "cyan");
  const [exerciseIds, setExerciseIds] = useState<string[]>(
    editTemplate?.exerciseIds ?? []
  );
  const [defaultSets, setDefaultSets] = useState(
    editTemplate?.defaultSets ?? 3
  );
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync from loaded template
  const [synced, setSynced] = useState(false);
  if (editTemplate && !synced) {
    setName(editTemplate.name);
    setColor(editTemplate.color);
    setExerciseIds(editTemplate.exerciseIds);
    setDefaultSets(editTemplate.defaultSets);
    setSynced(true);
  }

  const addExercise = (id: string) => {
    if (!exerciseIds.includes(id)) {
      setExerciseIds((prev) => [...prev, id]);
    }
    setShowPicker(false);
  };

  const removeExercise = (id: string) => {
    setExerciseIds((prev) => prev.filter((e) => e !== id));
  };

  const handleSave = async () => {
    if (!name.trim() || exerciseIds.length === 0) return;
    setSaving(true);
    try {
      if (editId) {
        await updateTemplate(Number(editId), {
          name: name.trim(),
          color,
          exerciseIds,
          defaultSets,
        });
      } else {
        await saveTemplate({
          name: name.trim(),
          color,
          exerciseIds,
          defaultSets,
        });
      }
      router.push("/templates");
    } catch (err) {
      console.error("Failed to save template:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header
        title={editId ? "Edit Plan" : "New Plan"}
        back
        action={
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || exerciseIds.length === 0}
            className="cyber-btn cyber-btn-primary text-xs disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto pb-4">
        {/* Name */}
        <div>
          <label className="cyber-heading text-[0.65rem] block mb-1">
            Plan Name
          </label>
          <input
            type="text"
            placeholder="e.g. Back & Biceps"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="cyber-input"
          />
        </div>

        {/* Color */}
        <div>
          <label className="cyber-heading text-[0.65rem] block mb-1">
            Color
          </label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.key}
                onClick={() => setColor(c.key)}
                className={`w-8 h-8 rounded-sm ${c.className} transition-all ${
                  color === c.key
                    ? "ring-2 ring-offset-2 ring-offset-cyber-bg ring-white scale-110"
                    : "opacity-50 hover:opacity-75"
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Default Sets */}
        <div>
          <label className="cyber-heading text-[0.65rem] block mb-1">
            Default Sets per Exercise
          </label>
          <div className="flex gap-2">
            {[2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setDefaultSets(n)}
                className={`w-10 h-10 text-sm font-mono border transition-colors ${
                  defaultSets === n
                    ? "border-cyber-cyan text-cyber-cyan bg-cyber-cyan-dim"
                    : "border-cyber-border text-cyber-text-muted"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div>
          <label className="cyber-heading text-[0.65rem] block mb-2">
            Exercises ({exerciseIds.length})
          </label>
          <div className="space-y-2">
            {exerciseIds.map((id, i) => {
              const ex = getExerciseById(id);
              return (
                <div
                  key={id}
                  className="cyber-card flex items-center justify-between py-2 px-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyber-text-muted">
                      {i + 1}
                    </span>
                    <span className="text-sm">{ex?.name ?? id}</span>
                    <ExerciseInfoButton exerciseId={id} />
                  </div>
                  <button
                    onClick={() => removeExercise(id)}
                    className="text-cyber-text-dim hover:text-cyber-red transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setShowPicker(true)}
            className="mt-2 w-full cyber-slot py-3 text-sm"
          >
            + Add Exercise
          </button>
        </div>
      </div>

      {showPicker && (
        <ExercisePicker
          onSelect={addExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

export default function NewTemplatePage() {
  return (
    <Suspense>
      <NewTemplateContent />
    </Suspense>
  );
}
