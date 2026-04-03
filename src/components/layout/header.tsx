"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, back, action }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-cyber-bg/95 backdrop-blur-sm border-b border-cyber-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {back && (
            <button
              onClick={() => router.back()}
              className="text-cyber-text-muted hover:text-cyber-cyan transition-colors"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="cyber-heading text-sm">{title}</h1>
            {subtitle && (
              <p className="text-cyber-text-muted text-xs mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="cyber-divider" />
    </header>
  );
}
