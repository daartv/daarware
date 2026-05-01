import "server-only";

import type { Locale } from "./config";

export type Dictionary = {
  meta: {
    title: string;
    tagline: string;
    description: string;
  };
  nav: {
    professional: string;
    personal: string;
    languageLabel: string;
    modeLabel: string;
  };
  professional: {
    hero: {
      eyebrow: string;
      name: string;
      role: string;
      summary: string;
      ctaContact: string;
      ctaResume: string;
    };
    experience: {
      title: string;
      items: Array<{
        company: string;
        role: string;
        period: string;
        location: string;
        summary: string;
      }>;
    };
    projects: {
      title: string;
      items: Array<{ name: string; summary: string; link: string }>;
    };
    skills: { title: string; items: string[] };
    contact: {
      title: string;
      summary: string;
      emailLabel: string;
      email: string;
      linkedinLabel: string;
      linkedin: string;
      githubLabel: string;
      github: string;
    };
    footer: { switchPrompt: string; switchCta: string };
  };
  personal: {
    hero: { title: string; subtitle: string; blurb: string };
    hobbies: {
      title: string;
      items: Array<{ icon: string; name: string; blurb: string }>;
    };
    interests: { title: string; items: string[] };
    now: { title: string; items: Array<{ label: string; value: string }> };
    footer: { switchPrompt: string; switchCta: string; credits: string };
  };
};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default as Dictionary),
  es: () => import("./dictionaries/es.json").then((m) => m.default as Dictionary),
  nl: () => import("./dictionaries/nl.json").then((m) => m.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
