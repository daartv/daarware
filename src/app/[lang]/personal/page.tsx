import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeSwitcher } from "@/components/mode-switcher";

const CARD_VARIANTS = ["pix-card-pink", "pix-card-green", "pix-card-yellow", "pix-card-cyan"] as const;

export default async function PersonalPage({
  params,
}: PageProps<"/[lang]/personal">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const p = dict.personal;

  return (
    <div className="pix-scanlines relative min-h-dvh">
      <div className="relative mx-auto w-full max-w-4xl px-5 py-8 md:py-12">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-3">
          <span className="pix-tag">{dict.nav.personal}</span>
          <LanguageSwitcher currentLocale={lang} variant="personal" />
        </header>

        {/* Hero */}
        <section className="mb-14 text-center">
          <h1 className="pix-display text-3xl text-[var(--color-pix-yellow)] md:text-5xl">
            {p.hero.title}
          </h1>
          <p className="pix-display mt-6 text-lg text-[var(--color-pix-cyan)] md:text-xl">
            <span className="pix-blink">{p.hero.subtitle}</span>
          </p>
          <p className="mx-auto mt-8 max-w-xl text-2xl leading-snug md:text-3xl">
            {p.hero.blurb}
          </p>
          <div className="mt-10">
            <ModeSwitcher
              locale={lang}
              labelProfessional={p.footer.switchCta}
              labelPersonal={dict.nav.personal}
            />
          </div>
        </section>

        {/* Hobbies */}
        <section className="mb-16">
          <h2 className="pix-display mb-6 text-2xl text-[var(--color-pix-yellow)]">
            {p.hobbies.title}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {p.hobbies.items.map((item, i) => (
              <article
                key={item.name}
                className={`pix-card ${CARD_VARIANTS[i % CARD_VARIANTS.length]}`}
              >
                <div className="text-4xl" aria-hidden>
                  {item.icon}
                </div>
                <h3 className="pix-display mt-3 text-base">{item.name}</h3>
                <p className="mt-3 text-xl leading-tight">{item.blurb}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Interests */}
        <section className="mb-16">
          <h2 className="pix-display mb-6 text-2xl text-[var(--color-pix-yellow)]">
            {p.interests.title}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {p.interests.items.map((item) => (
              <li key={item} className="pix-tag">
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Now */}
        <section className="mb-16">
          <h2 className="pix-display mb-6 text-2xl text-[var(--color-pix-yellow)]">
            {p.now.title}
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {p.now.items.map((item) => (
              <div key={item.label} className="pix-card">
                <dt className="pix-display text-xs text-[var(--color-pix-yellow)]">
                  {item.label}
                </dt>
                <dd className="mt-2 text-2xl leading-tight">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t-4 border-dashed border-[var(--color-pix-border)] pt-6 pb-10">
          <p className="pix-display text-sm text-[var(--color-pix-text-dim)]">
            {p.footer.credits}
          </p>
          <ModeSwitcher
            locale={lang}
            labelProfessional={p.footer.switchCta}
            labelPersonal={dict.nav.personal}
          />
        </footer>
      </div>
    </div>
  );
}
