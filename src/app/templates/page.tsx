"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { useTemplates, deleteTemplate } from "@/lib/hooks/use-templates";
import { getExerciseById } from "@/lib/exercise-data";

export default function TemplatesPage() {
  const templates = useTemplates();

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Delete template "${name}"?`)) {
      await deleteTemplate(id);
    }
  };

  return (
    <div>
      <Header
        title="Workout Plans"
        action={
          <Link href="/templates/new" className="cyber-btn cyber-btn-primary text-xs">
            + New
          </Link>
        }
      />

      <div className="px-4 pt-4 space-y-3 max-w-lg mx-auto pb-4">
        {templates.length === 0 ? (
          <div className="cyber-card text-center py-8">
            <p className="text-cyber-text-muted text-sm mb-3">
              No workout plans yet
            </p>
            <Link href="/templates/new" className="cyber-btn cyber-btn-primary text-xs">
              Create First Plan
            </Link>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="cyber-card cyber-corners cyber-corners-bottom"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cyber-cyan">
                    {template.name}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {template.exerciseIds.map((id) => {
                      const ex = getExerciseById(id);
                      return (
                        <span
                          key={id}
                          className="text-[0.6rem] text-cyber-text-muted bg-cyber-surface px-1.5 py-0.5 border border-cyber-border"
                        >
                          {ex?.name ?? id}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Link
                    href={`/templates/new?edit=${template.id}`}
                    className="text-cyber-text-muted hover:text-cyber-cyan transition-colors p-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(template.id, template.name)}
                    className="text-cyber-text-muted hover:text-cyber-red transition-colors p-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Link
                  href={`/log?template=${template.id}`}
                  className="cyber-btn cyber-btn-primary text-xs flex-1"
                >
                  Start Workout
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
