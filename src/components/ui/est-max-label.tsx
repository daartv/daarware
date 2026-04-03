"use client";

import { useState } from "react";

/**
 * Inline "Est. Max" label with an info tooltip explaining the concept.
 * Use instead of raw "est 1RM" text everywhere.
 */
export function EstMaxLabel({ value, className }: { value: number; className?: string }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      <span>Est. Max:</span>
      <span className="text-cyber-green font-mono font-bold">{value}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowTip((p) => !p);
        }}
        className="relative w-3.5 h-3.5 flex items-center justify-center text-cyber-text-dim hover:text-cyber-cyan transition-colors"
        aria-label="What is Est. Max?"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
        {showTip && (
          <span
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 text-[0.6rem] leading-relaxed text-left font-sans font-normal normal-case tracking-normal bg-cyber-surface border border-cyber-border shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-cyber-cyan font-bold">Estimated One-Rep Max</span>
            <br />
            Predicts the max weight you could lift for 1 rep, calculated from your set using the Epley formula:
            <br />
            <span className="text-cyber-text font-mono text-[0.55rem]">weight × (1 + reps ÷ 30)</span>
            <br />
            <span className="text-cyber-text-dim">Used to compare PRs across different rep ranges.</span>
          </span>
        )}
      </button>
    </span>
  );
}

/** Compact inline version — just "Est. Max: {value}" without tooltip */
export function EstMaxInline({ value }: { value: number }) {
  return (
    <span>
      Est. Max: <span className="text-cyber-green font-mono">{value}</span>
    </span>
  );
}
