import Link from "next/link";
import { themes } from "@/constants/themes";
import { templates } from "@/mocks/templates";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="rounded-[32px] bg-gradient-to-br from-sand via-paper to-white p-8 shadow-card md:p-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-moss">
            Heeby
          </p>
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
                Free writing is hard. Start with a template instead.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-ink/75 md:text-lg">
                Heeby helps you capture retrospectives and personal notes
                through topic-based templates, then turns them into readable
                journal-style documents.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/journals/new"
                  className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Start a journal
                </Link>
                <Link
                  href="/templates"
                  className="rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink/30"
                >
                  Manage templates
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] bg-white/85 p-6 shadow-card">
              <p className="mb-3 text-sm font-semibold text-ink/60">
                Product principles
              </p>
              <ul className="space-y-3 text-sm leading-6 text-ink/80">
                <li>New journals should start fast.</li>
                <li>Forms should stay short and structured.</li>
                <li>Saved entries should read like documents.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] bg-white p-7 shadow-card">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-moss">
              Themes
            </p>
            <div className="flex flex-wrap gap-3">
              {themes.map((theme) => (
                <span
                  key={theme}
                  className="rounded-full bg-ink px-4 py-2 text-sm text-white"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-7 shadow-card">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-moss">
              Sample templates
            </p>
            <ul className="space-y-4">
              {templates.slice(0, 3).map((template) => (
                <li key={template.id} className="rounded-2xl bg-paper p-4">
                  <p className="font-semibold">{template.name}</p>
                  <p className="mt-1 text-sm text-ink/65">{template.theme}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
