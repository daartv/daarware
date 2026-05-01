"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  labelProfessional: string;
  labelPersonal: string;
};

export function ModeSwitcher({ locale, labelProfessional, labelPersonal }: Props) {
  const pathname = usePathname() ?? `/${locale}`;
  const isPersonal = pathname.includes("/personal");

  const proHref = `/${locale}`;
  const personalHref = `/${locale}/personal`;

  if (isPersonal) {
    return (
      <Link href={proHref} className="pix-btn" aria-label={labelProfessional}>
        ◄ {labelProfessional}
      </Link>
    );
  }

  return (
    <Link
      href={personalHref}
      className="pro-btn"
      aria-label={labelPersonal}
    >
      <span aria-hidden>✦</span>
      {labelPersonal}
    </Link>
  );
}
