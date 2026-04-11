"use client";

import Link from "next/link";
import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";
import { useAssetStore } from "@/features/assets/store/asset-store";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";
import { MoneyFlowDashboard } from "@/features/assets/components/money-flow/money-flow-dashboard";
import { MoneyFlowAccounts } from "@/features/assets/components/money-flow/money-flow-accounts";
import { MoneyFlowRules } from "@/features/assets/components/money-flow/money-flow-rules";
import { MoneyFlowMonthly } from "@/features/assets/components/money-flow/money-flow-monthly";

type MoneyFlowSection = "dashboard" | "accounts" | "rules" | "monthly";

type MoneyFlowScreenProps = {
  section: MoneyFlowSection;
};

const sectionMeta: Record<MoneyFlowSection, { title: string; href: string }> = {
  dashboard: { title: "대시보드", href: "/assets/money-flow" },
  accounts: { title: "통장 관리", href: "/assets/money-flow/accounts" },
  rules: { title: "배분 규칙", href: "/assets/money-flow/rules" },
  monthly: { title: "월간 체크", href: "/assets/money-flow/monthly" }
};

export function MoneyFlowScreen({ section }: MoneyFlowScreenProps) {
  const accounts = useMoneyFlowStore((state) => state.accounts);
  const rules = useMoneyFlowStore((state) => state.rules);
  const monthlyEntries = useMoneyFlowStore((state) => state.monthlyEntries);
  const assetSnapshots = useAssetStore((state) => state.snapshots);

  return (
    <AppShell
      title="현금 흐름"
      actions={<ListBackAction href="/assets" />}
    >
      <MoneyFlowNavigation currentSection={section} />

      {section === "dashboard" ? (
        <MoneyFlowDashboard
          accounts={accounts}
          rules={rules}
          monthlyEntries={monthlyEntries}
          assetSnapshots={assetSnapshots}
        />
      ) : null}
      {section === "accounts" ? <MoneyFlowAccounts /> : null}
      {section === "rules" ? <MoneyFlowRules /> : null}
      {section === "monthly" ? <MoneyFlowMonthly /> : null}
    </AppShell>
  );
}

function MoneyFlowNavigation({
  currentSection
}: {
  currentSection: MoneyFlowSection;
}) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      {Object.entries(sectionMeta).map(([key, item]) => (
        <Link
          key={key}
          href={item.href}
          className={
            currentSection === key
              ? "rounded-[24px] border border-coral/35 bg-coral/10 px-5 py-4 text-sm font-semibold text-ink shadow-card"
              : "rounded-[24px] border border-line/10 bg-surface px-5 py-4 text-sm font-semibold text-ink transition hover:border-coral/30 hover:bg-soft"
          }
        >
          {item.title}
        </Link>
      ))}
    </section>
  );
}
