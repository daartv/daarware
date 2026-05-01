import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeSwitcher } from "@/components/mode-switcher";

export default async function ProfessionalPage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const pro = dict.professional;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Soft pastel blobs */}
      <div
        aria-hidden
        className="pro-blob"
        style={{
          width: 480,
          height: 480,
          top: -160,
          right: -120,
          background: "var(--color-pro-accent-soft)",
        }}
      />
      <div
        aria-hidden
        className="pro-blob"
        style={{
          width: 360,
          height: 360,
          top: 200,
          left: -120,
          background: "var(--color-pro-accent-2-soft)",
        }}
      />
      <div
        aria-hidden
        className="pro-blob"
        style={{
          width: 320,
          height: 320,
          bottom: -120,
          right: 80,
          background: "var(--color-pro-accent-3-soft)",
        }}
      />

      <div className="relative mx-auto w-full max-w-3xl px-6 py-10 md:py-16">
        <header className="mb-12 flex items-center justify-between gap-4">
          <span className="pro-eyebrow">{dict.nav.professional}</span>
          <LanguageSwitcher currentLocale={lang} variant="professional" />
        </header>

        {/* Hero */}
        <section className="mb-20">
          <p className="pro-eyebrow mb-4">{pro.hero.eyebrow}</p>
          <h1 className="pro-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
            {pro.hero.name}
          </h1>
          <p className="mt-2 text-lg text-[var(--color-pro-text-muted)]">
            {pro.hero.role}
          </p>
          <p className="mt-8 max-w-xl text-lg leading-relaxed">
            {pro.hero.summary}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={`mailto:${pro.contact.email}`} className="pro-btn pro-btn-primary">
              {pro.hero.ctaContact}
            </a>
            <ModeSwitcher
              locale={lang}
              labelProfessional={dict.nav.professional}
              labelPersonal={dict.nav.personal}
            />
          </div>
        </section>

        {/* Experience */}
        <section className="mb-20">
          <h2 className="pro-eyebrow mb-6">{pro.experience.title}</h2>
          <ol className="space-y-4">
            {pro.experience.items.map((item, i) => (
              <li key={i} className="pro-card">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="pro-serif text-2xl tracking-tight">
                    {item.role}
                  </h3>
                  <span className="text-sm text-[var(--color-pro-text-soft)]">
                    {item.period}
                  </span>
                </div>
                <p className="mt-1 text-[var(--color-pro-text-muted)]">
                  {item.company} · {item.location}
                </p>
                <p className="mt-3 text-[var(--color-pro-text)]">
                  {item.summary}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Projects */}
        <section className="mb-20">
          <h2 className="pro-eyebrow mb-6">{pro.projects.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pro.projects.items.map((item, i) => {
              const accents = [
                "var(--color-pro-accent-soft)",
                "var(--color-pro-accent-2-soft)",
                "var(--color-pro-accent-3-soft)",
                "var(--color-pro-accent-4-soft)",
              ];
              const accent = accents[i % accents.length];
              return (
                <a
                  key={i}
                  href={item.link}
                  className="pro-card block"
                  style={{ background: accent }}
                  target={item.link.startsWith("http") ? "_blank" : undefined}
                  rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  <h3 className="pro-serif text-2xl tracking-tight">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-[var(--color-pro-text)]">
                    {item.summary}
                  </p>
                </a>
              );
            })}
          </div>
        </section>

        {/* Skills */}
        <section className="mb-20">
          <h2 className="pro-eyebrow mb-6">{pro.skills.title}</h2>
          <ul className="flex flex-wrap gap-2">
            {pro.skills.items.map((skill) => (
              <li key={skill} className="pro-pill">
                {skill}
              </li>
            ))}
          </ul>
        </section>

        {/* Contact */}
        <section className="mb-20">
          <h2 className="pro-eyebrow mb-6">{pro.contact.title}</h2>
          <p className="mb-6 text-lg text-[var(--color-pro-text-muted)]">
            {pro.contact.summary}
          </p>
          <ul className="space-y-3">
            <li>
              <span className="pro-eyebrow mr-2">{pro.contact.emailLabel}</span>
              <a className="pro-link" href={`mailto:${pro.contact.email}`}>
                {pro.contact.email}
              </a>
            </li>
            <li>
              <span className="pro-eyebrow mr-2">{pro.contact.linkedinLabel}</span>
              <a className="pro-link" href={pro.contact.linkedin} target="_blank" rel="noopener noreferrer">
                {pro.contact.linkedin.replace(/^https?:\/\//, "")}
              </a>
            </li>
            <li>
              <span className="pro-eyebrow mr-2">{pro.contact.githubLabel}</span>
              <a className="pro-link" href={pro.contact.github} target="_blank" rel="noopener noreferrer">
                {pro.contact.github.replace(/^https?:\/\//, "")}
              </a>
            </li>
          </ul>
        </section>

        <hr className="pro-divider mb-8" />

        <footer className="flex flex-wrap items-center justify-between gap-4 pb-10 text-sm text-[var(--color-pro-text-soft)]">
          <p>{pro.footer.switchPrompt}</p>
          <ModeSwitcher
            locale={lang}
            labelProfessional={dict.nav.professional}
            labelPersonal={pro.footer.switchCta}
          />
        </footer>
      </div>
    </div>
  );
}
