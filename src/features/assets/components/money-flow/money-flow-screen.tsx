"use client";

import Link from "next/link";
import { AppShell } from "@/shared/components/layout/app-shell";
import { canManageAsset } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";
import { useAssetStore } from "@/features/assets/store/asset-store";
import { useMoneyFlowStore } from "@/features/assets/store/money-flow-store";
import { MoneyFlowDashboard } from "@/features/assets/components/money-flow/money-flow-dashboard";
import { MoneyFlowAccounts } from "@/features/assets/components/money-flow/money-flow-accounts";
import { MoneyFlowRules } from "@/features/assets/components/money-flow/money-flow-rules";
import { MoneyFlowMonthly } from "@/features/assets/components/money-flow/money-flow-monthly";
import { MoneyFlowMonthlyFlows } from "@/features/assets/components/money-flow/money-flow-monthly-flows";
import {
  getMoneyFlowHref,
  MoneyFlowOwnerSwitcher,
  useMoneyFlowOwnerScope
} from "@/features/assets/components/money-flow/money-flow-shared";
import type { OwnerScope } from "@/types/domain";

type MoneyFlowSection = "dashboard" | "accounts" | "rules" | "monthly" | "monthlyFlows";

type MoneyFlowScreenProps = {
  section: MoneyFlowSection;
};

const sectionMeta: Record<MoneyFlowSection, { title: string; href: string }> = {
  dashboard: { title: "대시보드", href: "/assets/money-flow" },
  accounts: { title: "통장 관리", href: "/assets/money-flow/accounts" },
  rules: { title: "배분 규칙", href: "/assets/money-flow/rules" },
  monthly: { title: "월간 체크", href: "/assets/money-flow/monthly" },
  monthlyFlows: { title: "월간흐름", href: "/assets/money-flow/monthly-flows" }
};

export function MoneyFlowScreen({ section }: MoneyFlowScreenProps) {
  const accessMode = useAccessStore(getAccessMode);
  const canManage = canManageAsset(accessMode);
  const ownerScope = useMoneyFlowOwnerScope();
  const accounts = useMoneyFlowStore((state) => state.accounts);
  const rules = useMoneyFlowStore((state) => state.rules);
  const snapshots = useMoneyFlowStore((state) => state.snapshots);
  const transfers = useMoneyFlowStore((state) => state.transfers);
  const assetSnapshots = useAssetStore((state) => state.snapshots);
  const scopedAccounts = accounts.filter((account) => account.ownerScope === ownerScope);
  const scopedRules = rules.filter((rule) => rule.ownerScope === ownerScope);
  const scopedMoneyFlowSnapshots = snapshots.filter(
    (snapshot) => snapshot.ownerScope === ownerScope
  );
  const scopedMoneyFlowSnapshotIds = new Set(
    scopedMoneyFlowSnapshots.map((snapshot) => snapshot.id)
  );
  const scopedTransfers = transfers.filter((transfer) =>
    scopedMoneyFlowSnapshotIds.has(transfer.snapshotId)
  );

  return (
    <AppShell title="현금 흐름">
      <MoneyFlowOwnerSwitcher ownerScope={ownerScope} />
      <MoneyFlowNavigation currentSection={section} ownerScope={ownerScope} />

      {section === "dashboard" ? (
        <MoneyFlowDashboard
          ownerScope={ownerScope}
          accounts={scopedAccounts}
          snapshots={scopedMoneyFlowSnapshots}
          transfers={scopedTransfers}
          assetSnapshots={assetSnapshots}
          canManage={canManage}
        />
      ) : null}
      {section === "accounts" ? (
        <MoneyFlowAccounts ownerScope={ownerScope} canManage={canManage} />
      ) : null}
      {section === "rules" ? (
        <MoneyFlowRules ownerScope={ownerScope} canManage={canManage} />
      ) : null}
      {section === "monthly" ? (
        <MoneyFlowMonthly ownerScope={ownerScope} canManage={canManage} />
      ) : null}
      {section === "monthlyFlows" ? (
        <MoneyFlowMonthlyFlows ownerScope={ownerScope} />
      ) : null}
    </AppShell>
  );
}

function MoneyFlowNavigation({
  currentSection,
  ownerScope
}: {
  currentSection: MoneyFlowSection;
  ownerScope: OwnerScope;
}) {
  return (
    <section className="grid gap-3 md:grid-cols-5">
      {Object.entries(sectionMeta).map(([key, item]) => (
        <Link
          key={key}
          href={getMoneyFlowHref(item.href, ownerScope)}
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
