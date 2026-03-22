type AppShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function AppShell({
  children,
  title,
  description,
  actions
}: AppShellProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 text-ink">
      <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-coral">
              Heeby
            </p>
            <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70 md:text-base">
              {description}
            </p>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </section>

      {children}
    </div>
  );
}
