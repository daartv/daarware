"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Header } from "@/components/layout/header";
import { ExercisePicker } from "@/components/exercises/exercise-picker";
import { getExerciseById, getExerciseImageUrl } from "@/lib/exercise-data";
import { useTemplates } from "@/lib/hooks/use-templates";
import { usePersonalRecords } from "@/lib/hooks/use-personal-records";
import { saveWorkoutLog } from "@/lib/hooks/use-workout-logs";
import { todayISO, calculate1RM, formatDate, timeAgo } from "@/lib/utils";
import { db, type WorkoutExercise, type WorkoutSet } from "@/lib/db";
import Image from "next/image";
import { ExerciseInfoButton } from "@/components/exercises/exercise-info-drawer";
import { EstMaxLabel, EstMaxInline } from "@/components/ui/est-max-label";
import {
  prefillSetsForExercise,
  type PrefillResult,
} from "@/lib/prefill";

type Step = "setup" | "logging" | "summary";

function getTemplateIdFromUrl(): number | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const val = params.get("template");
  return val ? Number(val) : undefined;
}

export default function LogWorkoutPage() {
  const router = useRouter();
  const preselectedTemplateId = useMemo(getTemplateIdFromUrl, []);

  const templates = useTemplates();
  const allRecords = usePersonalRecords();
  // Raw useLiveQuery (not the wrapper) so we can distinguish "still loading"
  // (undefined) from "no logs yet" ([]). Prefill needs to wait for the first.
  const allLogs = useLiveQuery(() =>
    db.workoutLogs.orderBy("date").reverse().toArray()
  );

  // --- State ---
  const [step, setStep] = useState<Step>("setup");
  const [date, setDate] = useState(todayISO());
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [newPRs, setNewPRs] = useState<string[]>([]);
  const [completedSets, setCompletedSets] = useState<
    Record<string, boolean[]>
  >({});
  const [loadedTemplateId, setLoadedTemplateId] = useState<number | undefined>(undefined);
  const [extraExerciseCount, setExtraExerciseCount] = useState(0);
  const [prefillReasons, setPrefillReasons] = useState<
    Record<string, PrefillResult>
  >({});
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // Derive display info
  const loadedTemplate = templates.find((t) => t.id === loadedTemplateId);
  const workoutName = loadedTemplate
    ? extraExerciseCount > 0
      ? `${loadedTemplate.name} +${extraExerciseCount}`
      : loadedTemplate.name
    : exercises.length > 0
    ? `Workout`
    : "";

  // Load template exercises
  const loadTemplate = useCallback(
    (templateId: number) => {
      const t = templates.find((t) => t.id === templateId);
      if (!t) return;
      setLoadedTemplateId(templateId);
      setExtraExerciseCount(0);

      const logsForPrefill = allLogs ?? [];
      const reasons: Record<string, PrefillResult> = {};
      const nextExercises = t.exerciseIds.map((id) => {
        const result = prefillSetsForExercise(
          logsForPrefill,
          id,
          t.defaultSets || 3
        );
        if (result.reason !== "new") reasons[id] = result;
        return { exerciseId: id, sets: result.sets };
      });
      setExercises(nextExercises);
      setPrefillReasons(reasons);
    },
    [templates, allLogs]
  );

  // Auto-load preselected template — wait for logs so prefill has full history.
  const [autoLoaded, setAutoLoaded] = useState(false);
  if (
    preselectedTemplateId &&
    templates.length > 0 &&
    allLogs !== undefined &&
    !autoLoaded
  ) {
    loadTemplate(preselectedTemplateId);
    setAutoLoaded(true);
  }

  const addExercise = useCallback((exerciseId: string) => {
    const result = prefillSetsForExercise(allLogs ?? [], exerciseId, 1);
    setExercises((prev) => [
      ...prev,
      { exerciseId, sets: result.sets },
    ]);
    if (result.reason !== "new") {
      setPrefillReasons((prev) => ({ ...prev, [exerciseId]: result }));
    }
    if (loadedTemplateId) {
      setExtraExerciseCount((p) => p + 1);
    }
    setShowPicker(false);
  }, [allLogs, loadedTemplateId]);

  const removeExercise = useCallback(
    (index: number) => {
      if (exercises.length <= 1 && step === "logging") {
        // Last exercise removed during logging — go to setup
        setExercises([]);
        setStep("setup");
        return;
      }
      setExercises((prev) => prev.filter((_, i) => i !== index));
      if (currentExIdx >= exercises.length - 1 && currentExIdx > 0) {
        setCurrentExIdx((p) => p - 1);
      }
    },
    [currentExIdx, exercises.length, step]
  );

  const moveExercise = useCallback(
    (fromIdx: number, direction: "up" | "down") => {
      const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
      setExercises((prev) => {
        if (toIdx < 0 || toIdx >= prev.length) return prev;
        const next = [...prev];
        [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
        return next;
      });
      // Follow the current exercise
      setCurrentExIdx(toIdx);
    },
    []
  );

  const addSet = useCallback((exerciseIndex: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const lastSet = next[exerciseIndex].sets.at(-1);
      next[exerciseIndex] = {
        ...next[exerciseIndex],
        sets: [
          ...next[exerciseIndex].sets,
          { reps: lastSet?.reps ?? 0, weight: lastSet?.weight ?? 0 },
        ],
      };
      return next;
    });
  }, []);

  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const next = [...prev];
      next[exerciseIndex] = {
        ...next[exerciseIndex],
        sets: next[exerciseIndex].sets.filter((_, i) => i !== setIndex),
      };
      return next;
    });
  }, []);

  const updateSet = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      field: keyof WorkoutSet,
      value: number
    ) => {
      setExercises((prev) => {
        const next = [...prev];
        const target = next[exerciseIndex];
        next[exerciseIndex] = {
          ...target,
          sets: target.sets.map((s, i) =>
            i === setIndex ? { ...s, [field]: value } : s
          ),
        };
        // Clear any prefill explanation once the user touches values themselves.
        setPrefillReasons((reasons) => {
          if (!reasons[target.exerciseId]) return reasons;
          const next = { ...reasons };
          delete next[target.exerciseId];
          return next;
        });
        return next;
      });
    },
    []
  );

  const markSetComplete = useCallback(
    (exerciseId: string, setIndex: number) => {
      setCompletedSets((prev) => {
        const arr = [...(prev[exerciseId] ?? [])];
        arr[setIndex] = true;
        return { ...prev, [exerciseId]: arr };
      });
    },
    []
  );

  const isSetCompleted = (exerciseId: string, setIndex: number) =>
    completedSets[exerciseId]?.[setIndex] ?? false;

  const getPRForExercise = (exerciseId: string) =>
    allRecords.find((r) => r.exerciseId === exerciseId);

  const startLogging = () => {
    if (exercises.length === 0) return;
    setCurrentExIdx(0);
    // Capture the workout start once — re-entering logging from summary keeps the original time.
    setStartedAt((prev) => prev ?? new Date().toISOString());
    setStep("logging");
  };

  const goToSummary = () => {
    setStep("summary");
  };

  const handleSave = async () => {
    const cleanExercises = exercises
      .map((e) => ({
        ...e,
        sets: e.sets.filter((s) => s.weight > 0 || s.reps > 0),
      }))
      .filter((e) => e.sets.length > 0);

    if (cleanExercises.length === 0) return;

    setSaving(true);
    try {
      const autoName = loadedTemplate
        ? extraExerciseCount > 0
          ? `${loadedTemplate.name} +${extraExerciseCount}`
          : loadedTemplate.name
        : formatDate(date);
      await saveWorkoutLog({
        date,
        name: autoName,
        templateId: loadedTemplateId,
        exercises: cleanExercises,
        notes: notes.trim() || undefined,
        startedAt: startedAt ?? undefined,
      });
      router.push("/");
    } catch (err) {
      console.error("Failed to save workout:", err);
    } finally {
      setSaving(false);
    }
  };

  // ========== SETUP STEP ==========
  if (step === "setup") {
    return (
      <div>
        <Header title="Log Workout" back />
        <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto pb-4">
          {/* Date & Tags */}
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="cyber-input w-auto flex-shrink-0"
            />
            <div className="flex gap-1.5 flex-wrap">
              {loadedTemplate && (
                <span className="cyber-badge cyber-badge-cyan">
                  {loadedTemplate.name}
                </span>
              )}
              {extraExerciseCount > 0 && (
                <span className="cyber-badge cyber-badge-yellow">
                  +{extraExerciseCount} other
                </span>
              )}
            </div>
          </div>

          {/* Load from Plan */}
          {templates.length > 0 && (
            <section>
              <h2 className="cyber-heading mb-2">Load a Plan</h2>
              <div className="space-y-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => loadTemplate(t.id)}
                    className={`cyber-card w-full text-left py-2.5 px-3 transition-all ${
                      loadedTemplateId === t.id
                        ? "border-cyber-border-active bg-cyber-cyan-dim border-l-2 border-l-cyber-cyan shadow-[0_0_8px_rgba(47,217,217,0.3)]"
                        : ""
                    }`}
                  >
                    <p className="text-sm font-semibold text-cyber-cyan">
                      {t.name}
                    </p>
                    <p className="text-xs text-cyber-text-muted mt-0.5">
                      {t.exerciseIds.length} exercises &middot;{" "}
                      {t.defaultSets || 3} sets each
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="cyber-divider flex-1" />
            <span className="text-[0.6rem] text-cyber-text-muted uppercase tracking-widest">
              or build your own
            </span>
            <div className="cyber-divider flex-1" />
          </div>

          {/* Exercise List */}
          {exercises.length > 0 && (
            <section>
              <h2 className="cyber-heading mb-2">
                Exercises ({exercises.length})
              </h2>
              <div className="space-y-1.5">
                {exercises.map((ex, i) => {
                  const info = getExerciseById(ex.exerciseId);
                  return (
                    <div
                      key={`${ex.exerciseId}-${i}`}
                      className="cyber-card flex items-center justify-between py-2 px-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyber-text-muted w-5 text-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            {info?.name ?? ex.exerciseId}
                          </p>
                          <div className="flex gap-1 mt-0.5">
                            {info?.primaryMuscles.map((m) => (
                              <span
                                key={m}
                                className="text-[0.55rem] text-cyber-cyan capitalize"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ExerciseInfoButton exerciseId={ex.exerciseId} />
                        <button
                          onClick={() => removeExercise(i)}
                          className="text-cyber-text-dim hover:text-cyber-red transition-colors p-1"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Add Exercise */}
          <button
            onClick={() => setShowPicker(true)}
            className="w-full cyber-slot py-3.5 text-sm"
          >
            + Add Exercise from DB
          </button>

          {/* Start Button */}
          {exercises.length > 0 && (
            <button
              onClick={startLogging}
              className="w-full cyber-btn cyber-btn-primary py-3 text-sm"
            >
              Start Workout ({exercises.length} exercise{exercises.length !== 1 ? "s" : ""})
            </button>
          )}
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

  // ========== LOGGING STEP (exercise by exercise) ==========
  if (step === "logging") {
    const exercise = exercises[currentExIdx];
    const info = getExerciseById(exercise.exerciseId);
    const pr = getPRForExercise(exercise.exerciseId);

    // Check if any set in current exercise beats the PR
    const checkBeatsPR = (set: WorkoutSet) => {
      if (!pr || set.weight <= 0 || set.reps <= 0) return false;
      const est1RM = calculate1RM(set.weight, set.reps);
      return est1RM > pr.estimated1RM;
    };

    // Check if any completed set is a new PR
    const hasNewPR = exercise.sets.some(
      (s, i) =>
        isSetCompleted(exercise.exerciseId, i) && checkBeatsPR(s)
    );

    const allSetsCompleted = exercise.sets.every((_, i) =>
      isSetCompleted(exercise.exerciseId, i)
    );

    const isFirst = currentExIdx === 0;
    const isLast = currentExIdx === exercises.length - 1;

    return (
      <div>
        <Header
          title={`Exercise ${currentExIdx + 1}/${exercises.length}`}
          subtitle={formatDate(date)}
          back
          action={
            <button
              onClick={goToSummary}
              className="cyber-btn text-xs"
            >
              Summary
            </button>
          }
        />

        <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto pb-4">
          {/* Progress bar */}
          <div className="flex gap-1">
            {exercises.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 transition-all ${
                  i < currentExIdx
                    ? "bg-cyber-green"
                    : i === currentExIdx
                    ? "bg-cyber-cyan"
                    : "bg-cyber-surface"
                }`}
              />
            ))}
          </div>

          {/* Exercise Header */}
          <div className="cyber-card cyber-corners cyber-corners-bottom">
            <div className="flex items-start gap-3">
              {info?.images?.[0] && (
                <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden border border-cyber-border">
                  <Image
                    src={getExerciseImageUrl(info.images[0])}
                    alt={info.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold truncate">
                    {info?.name ?? exercise.exerciseId}
                  </h2>
                  <ExerciseInfoButton exerciseId={exercise.exerciseId} />
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {info?.primaryMuscles.map((m) => (
                    <span
                      key={m}
                      className="cyber-badge cyber-badge-cyan text-[0.55rem]"
                    >
                      {m}
                    </span>
                  ))}
                  {info?.equipment && (
                    <span className="cyber-badge cyber-badge-yellow text-[0.55rem]">
                      {info.equipment}
                    </span>
                  )}
                  <PrefillBadge result={prefillReasons[exercise.exerciseId]} />
                </div>
              </div>
            </div>

            {/* Exercise Toolbar */}
            <div className="mt-3 pt-3 border-t border-cyber-border flex items-center justify-between">
              <div className="flex gap-1.5">
                <button
                  onClick={() => moveExercise(currentExIdx, "up")}
                  disabled={isFirst}
                  className="cyber-btn text-[0.6rem] px-2 py-1 disabled:opacity-20"
                  title="Move up"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                </button>
                <button
                  onClick={() => moveExercise(currentExIdx, "down")}
                  disabled={isLast}
                  className="cyber-btn text-[0.6rem] px-2 py-1 disabled:opacity-20"
                  title="Move down"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                </button>
                <button
                  onClick={() => setShowPicker(true)}
                  className="cyber-btn text-[0.6rem] px-2 py-1"
                  title="Add exercise"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
              <button
                onClick={() => removeExercise(currentExIdx)}
                className="cyber-btn cyber-btn-danger text-[0.6rem] px-2 py-1"
                title="Remove exercise"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>

            {/* Current PR */}
            {pr ? (
              <div className="mt-3 pt-3 border-t border-cyber-border">
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] text-cyber-text-muted uppercase tracking-wider font-mono">
                    Current PR
                  </span>
                  <span className="text-xs text-cyber-text-muted">
                    {timeAgo(pr.date)}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-cyber-yellow">
                    {pr.weight}
                  </span>
                  <span className="text-sm text-cyber-text-muted">
                    x {pr.reps}
                  </span>
                  <span className="text-xs text-cyber-text-muted ml-auto">
                    <EstMaxInline value={pr.estimated1RM} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-cyber-border">
                <p className="text-xs text-cyber-text-muted italic">
                  No PR recorded yet — set one today
                </p>
              </div>
            )}
          </div>

          {/* Sets */}
          <div className="space-y-2">
            <div className="grid grid-cols-[2.5rem_1fr_1fr_auto] gap-2 text-[0.6rem] text-cyber-text-muted uppercase tracking-wider font-mono px-1">
              <span>Set</span>
              <span>Weight</span>
              <span>Reps</span>
              <span className="w-16 text-center">Status</span>
            </div>

            {exercise.sets.map((set, setIdx) => {
              const completed = isSetCompleted(exercise.exerciseId, setIdx);
              const beatsPR =
                set.weight > 0 && set.reps > 0 && checkBeatsPR(set);
              const est1RM =
                set.weight > 0 && set.reps > 0
                  ? calculate1RM(set.weight, set.reps)
                  : 0;

              return (
                <div
                  key={setIdx}
                  className={`grid grid-cols-[2.5rem_1fr_1fr_auto] gap-2 items-center p-2 transition-all ${
                    completed
                      ? beatsPR
                        ? "bg-cyber-green-dim border border-cyber-green/30"
                        : "bg-cyber-surface border border-cyber-border opacity-60"
                      : "bg-cyber-surface border border-cyber-border"
                  }`}
                >
                  <span
                    className={`text-sm font-mono text-center font-bold ${
                      completed ? "text-cyber-green" : "text-cyber-text-muted"
                    }`}
                  >
                    {setIdx + 1}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={set.weight || ""}
                    onChange={(e) =>
                      updateSet(
                        currentExIdx,
                        setIdx,
                        "weight",
                        Number(e.target.value)
                      )
                    }
                    disabled={completed}
                    className="cyber-input text-sm py-1.5 text-center disabled:opacity-50"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={set.reps || ""}
                    onChange={(e) =>
                      updateSet(
                        currentExIdx,
                        setIdx,
                        "reps",
                        Number(e.target.value)
                      )
                    }
                    disabled={completed}
                    className="cyber-input text-sm py-1.5 text-center disabled:opacity-50"
                  />
                  <div className="w-16 flex justify-center">
                    {completed ? (
                      beatsPR ? (
                        <span className="cyber-badge cyber-badge-green text-[0.55rem] text-glow-green">
                          NEW PR
                        </span>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-cyber-green"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )
                    ) : (
                      <button
                        onClick={() =>
                          markSetComplete(exercise.exerciseId, setIdx)
                        }
                        disabled={set.weight <= 0 || set.reps <= 0}
                        className={`w-8 h-8 border-2 flex items-center justify-center transition-all ${
                          set.weight > 0 && set.reps > 0
                            ? beatsPR
                              ? "border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-cyber-bg animate-pulse-neon"
                              : "border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-bg"
                            : "border-cyber-text-dim text-cyber-text-dim cursor-not-allowed"
                        }`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add/Remove Set */}
          <div className="flex gap-2">
            <button
              onClick={() => addSet(currentExIdx)}
              className="flex-1 cyber-slot py-2 text-xs"
            >
              + Add Set
            </button>
            {exercise.sets.length > 1 && (
              <button
                onClick={() =>
                  removeSet(currentExIdx, exercise.sets.length - 1)
                }
                className="cyber-btn cyber-btn-danger text-xs px-3"
              >
                - Remove
              </button>
            )}
          </div>

          {/* Est Max feedback */}
          {exercise.sets.some((s) => s.weight > 0 && s.reps > 0) && (
            <div className="text-center">
              <span className="text-[0.65rem] text-cyber-text-muted uppercase tracking-wider">
                <EstMaxLabel
                  value={Math.max(
                    ...exercise.sets
                      .filter((s) => s.weight > 0 && s.reps > 0)
                      .map((s) => calculate1RM(s.weight, s.reps))
                  )}
                  className={`text-[0.65rem] ${hasNewPR ? "text-glow-green" : ""}`}
                />
                {pr && (
                  <span className="text-cyber-text-dim ml-1">
                    / PR: {pr.estimated1RM}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setCurrentExIdx((p) => p - 1)}
              disabled={isFirst}
              className="cyber-btn flex-1 disabled:opacity-30"
            >
              &larr; Previous
            </button>
            {isLast ? (
              <button onClick={goToSummary} className="cyber-btn cyber-btn-primary flex-1">
                Finish &rarr;
              </button>
            ) : (
              <button
                onClick={() => setCurrentExIdx((p) => p + 1)}
                className="cyber-btn cyber-btn-primary flex-1"
              >
                Next &rarr;
              </button>
            )}
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

  // ========== SUMMARY STEP ==========
  return (
    <div>
      <Header
        title="Workout Summary"
        back
        action={
          <button
            onClick={handleSave}
            disabled={saving}
            className="cyber-btn cyber-btn-primary text-xs disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save Workout"}
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto pb-4">
        {/* Overview */}
        <div className="cyber-card cyber-corners cyber-corners-bottom">
          <h2 className="text-lg font-bold text-cyber-cyan">
            {formatDate(date)}
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            {loadedTemplate && (
              <span className="cyber-badge cyber-badge-cyan">
                {loadedTemplate.name}
              </span>
            )}
            {extraExerciseCount > 0 && (
              <span className="cyber-badge cyber-badge-yellow">
                +{extraExerciseCount} other
              </span>
            )}
            <span className="text-xs text-cyber-text-muted">
              {exercises.length} exercises &middot;{" "}
              {exercises.reduce(
                (n, e) =>
                  n + e.sets.filter((s) => s.weight > 0 || s.reps > 0).length,
                0
              )}{" "}
              sets
            </span>
          </div>
        </div>

        {/* Exercises Summary */}
        {exercises.map((exercise, i) => {
          const info = getExerciseById(exercise.exerciseId);
          const pr = getPRForExercise(exercise.exerciseId);
          const completedSetCount = exercise.sets.filter(
            (_, si) => isSetCompleted(exercise.exerciseId, si)
          ).length;
          const bestSet = exercise.sets.reduce<{ est: number; weight: number; reps: number }>(
            (best, s) => {
              const est = calculate1RM(s.weight, s.reps);
              return est > best.est ? { est, weight: s.weight, reps: s.reps } : best;
            },
            { est: 0, weight: 0, reps: 0 }
          );
          const isNewPR = pr ? bestSet.est > pr.estimated1RM : bestSet.est > 0;

          return (
            <div key={i} className="cyber-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {info?.name ?? exercise.exerciseId}
                    </p>
                    <p className="text-xs text-cyber-text-muted mt-0.5">
                      {completedSetCount}/{exercise.sets.length} sets completed
                    </p>
                  </div>
                  <ExerciseInfoButton exerciseId={exercise.exerciseId} />
                </div>
                {isNewPR && bestSet.est > 0 && (
                  <span className="cyber-badge cyber-badge-green text-glow-green">
                    NEW PR
                  </span>
                )}
              </div>
              {bestSet.weight > 0 && (
                <div className="mt-2 flex items-baseline gap-2 text-sm font-mono">
                  <span className="text-cyber-text-muted">Best:</span>
                  <span className="text-cyber-cyan font-bold">
                    {bestSet.weight} x {bestSet.reps}
                  </span>
                  <span className="text-cyber-text-muted text-xs">
                    (<EstMaxInline value={bestSet.est} />)
                  </span>
                </div>
              )}
              {/* Edit action */}
              <div className="mt-3 pt-2 border-t border-cyber-border flex justify-end">
                <button
                  onClick={() => {
                    setCurrentExIdx(i);
                    setStep("logging");
                  }}
                  className="cyber-btn text-[0.7rem] py-1.5 px-3"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Sets
                </button>
              </div>
            </div>
          );
        })}

        {/* Notes */}
        <div>
          <label className="cyber-heading text-[0.65rem] block mb-1">
            Notes
          </label>
          <textarea
            placeholder="Optional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="cyber-input resize-none"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full cyber-btn cyber-btn-primary py-3 text-sm disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Workout"}
        </button>
      </div>
    </div>
  );
}

function PrefillBadge({ result }: { result: PrefillResult | undefined }) {
  if (!result || result.reason === "new") return null;
  if (result.reason === "match") {
    return (
      <span className="cyber-badge cyber-badge-cyan text-[0.55rem]">
        From last session
      </span>
    );
  }
  if (result.reason === "plateau-bump") {
    return (
      <span className="cyber-badge cyber-badge-yellow text-[0.55rem]">
        Plateau → +{result.bumpIncrement}kg
      </span>
    );
  }
  return (
    <span className="cyber-badge cyber-badge-green text-[0.55rem]">
      Restored from peak
    </span>
  );
}

