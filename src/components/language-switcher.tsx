"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  type Locale,
  isLocale,
} from "@/i18n/config";

function replaceLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/");
  if (segments.length > 1 && isLocale(segments[1])) {
    segments[1] = nextLocale;
    return segments.join("/") || "/";
  }
  return `/${nextLocale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function rememberLocale(locale: Locale) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
}

type Props = { currentLocale: Locale; variant?: "professional" | "personal" };

export function LanguageSwitcher({ currentLocale, variant = "professional" }: Props) {
  const pathname = usePathname() ?? `/${currentLocale}`;

  const isPro = variant === "professional";
  const wrapperClass = isPro
    ? "inline-flex items-center gap-1 rounded-full border border-[var(--color-pro-border)] bg-[var(--color-pro-surface)] p-1 text-xs"
    : "inline-flex items-center gap-1 border-2 border-[var(--color-pix-border)] bg-[var(--color-pix-bg-alt)] p-1 text-[0.7rem]";

  const itemBase = isPro
    ? "rounded-full px-2.5 py-1 transition-colors"
    : "px-2 py-0.5 pix-display";

  const activeClass = isPro
    ? "bg-[var(--color-pro-text)] text-[var(--color-pro-bg)]"
    : "bg-[var(--color-pix-yellow)] text-[var(--color-pix-bg)]";

  const inactiveClass = isPro
    ? "text-[var(--color-pro-text-muted)] hover:text-[var(--color-pro-text)]"
    : "text-[var(--color-pix-text)] hover:text-[var(--color-pix-yellow)]";

  return (
    <div
      className={wrapperClass}
      role="group"
      aria-label="Language selector"
    >
      {LOCALES.map((locale) => {
        const href = replaceLocaleInPath(pathname, locale);
        const isActive = locale === currentLocale;
        return (
          <Link
            key={locale}
            href={href}
            onClick={() => rememberLocale(locale)}
            aria-current={isActive ? "page" : undefined}
            className={`${itemBase} ${isActive ? activeClass : inactiveClass}`}
            title={LOCALE_LABELS[locale]}
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
