import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
  className?: string;
};

export function AppShell({
  children,
  title,
  actions,
  className
}: AppShellProps) {
  return (
    <div className={cn("mx-auto flex max-w-6xl flex-col gap-8 text-ink", className)}>
      <section className="rounded-[30px] border border-line/10 bg-surface p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </section>

      {children}
    </div>
  );
}
