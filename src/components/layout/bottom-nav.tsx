"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "HUD", icon: HudIcon },
  { href: "/log", label: "LOG", icon: LogIcon },
  { href: "/stats", label: "STATS", icon: StatsIcon },
  { href: "/templates", label: "PLANS", icon: PlanIcon },
  { href: "/records", label: "PR", icon: PrIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-cyber-border bg-cyber-bg/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-[0.65rem] font-semibold uppercase tracking-widest transition-colors ${
                active
                  ? "text-cyber-cyan"
                  : "text-cyber-text-muted hover:text-cyber-text"
              }`}
            >
              <Icon active={active} />
              <span>{label}</span>
              {active && (
                <div className="h-[2px] w-6 bg-cyber-cyan mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HudIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function LogIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function StatsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

function PlanIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function PrIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <path d="M6 15l6-8 6 8" />
      <path d="M6 19h12" />
    </svg>
  );
}
