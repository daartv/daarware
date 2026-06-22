"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/exercise-data";

/**
 * Collapsible favorites section that sits at the top of exercise lists.
 * Renders children (the exercise rows) when expanded.
 */
export function FavoritesSection({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  if (count === 0) return null;

  return (
    <div className="border border-cyber-yellow/40 bg-cyber-yellow-dim mb-2">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors hover:bg-cyber-yellow-dim/70"
      >
        <div className="flex items-center gap-2">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="#E8C84A"
            stroke="none"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyber-yellow">
            Favorites
          </span>
          <span className="text-[0.6rem] font-mono text-cyber-yellow/70">
            ({count})
          </span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-cyber-yellow transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-cyber-yellow/10 animate-slide-up">
          {children}
        </div>
      )}
    </div>
  );
}
