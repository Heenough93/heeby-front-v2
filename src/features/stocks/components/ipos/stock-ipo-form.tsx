"use client";

import { useState } from "react";
import { stockIpoBatchSchema } from "@/features/stocks/lib/ipos/stock-ipo-schema";
import { createEmptyIpoRow } from "@/features/stocks/lib/ipos/stock-ipo-utils";
import type { StockIpoDraftRow } from "@/features/stocks/lib/ipos/stock-ipo-types";
import { useStockStore } from "@/features/stocks/store/stock-store";
import { useToastStore } from "@/stores/ui/use-toast-store";
import { getOwnerScopeLabel, ownerScopeValues, type OwnerScope } from "@/types/domain";

type StockIpoFormProps = {
  onSubmitted?: () => void;
  submitLabel?: string;
  inline?: boolean;
  initialOwnerScope?: OwnerScope;
};

export function StockIpoForm({
  onSubmitted,
  submitLabel = "공모주 저장",
  inline = false,
  initialOwnerScope = "yumja"
}: StockIpoFormProps) {
  const addIpoEntries = useStockStore((state) => state.addIpoEntries);
  const showToast = useToastStore((state) => state.showToast);
  const [row, setRow] = useState<StockIpoDraftRow>({
    ...createEmptyIpoRow(),
    ownerScope: initialOwnerScope
  });
  const [error, setError] = useState<string>();

  const updateRow = <K extends keyof StockIpoDraftRow>(
    key: K,
    value: StockIpoDraftRow[K]
  ) => {
    setRow((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    const parsed = stockIpoBatchSchema.safeParse({ entries: [row] });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요.");
      return;
    }

    addIpoEntries(parsed.data);
    showToast({
      title: "공모주 기록을 저장했습니다.",
      variant: "success"
    });
    onSubmitted?.();
  };

  return (
    <section className={inline ? "" : "rounded-[28px] border border-line/10 bg-surface p-6 shadow-card"}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="대상">
          <select
            value={row.ownerScope}
            onChange={(e) => updateRow("ownerScope", e.target.value as OwnerScope)}
            className={inputClassName}
          >
            {ownerScopeValues.map((value) => (
              <option key={value} value={value}>
                {getOwnerScopeLabel(value)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="공모주 이름"><input value={row.stockName} onChange={(e) => updateRow("stockName", e.target.value)} className={inputClassName} /></Field>
        <Field label="증권사"><input value={row.brokerage} onChange={(e) => updateRow("brokerage", e.target.value)} className={inputClassName} /></Field>
        <Field label="청약일"><input type="date" value={row.subscribedAt} onChange={(e) => updateRow("subscribedAt", e.target.value)} className={inputClassName} /></Field>
        <Field label="증거금"><input type="number" min="0" step="0.01" value={row.deposit} onChange={(e) => updateRow("deposit", e.target.value)} className={inputClassName} /></Field>
        <Field label="배정수량"><input type="number" min="0" step="1" value={row.allocatedQuantity} onChange={(e) => updateRow("allocatedQuantity", e.target.value)} className={inputClassName} /></Field>
        <Field label="환불일"><input type="date" value={row.refundedAt} onChange={(e) => updateRow("refundedAt", e.target.value)} className={inputClassName} /></Field>
        <Field label="환불금"><input type="number" min="0" step="0.01" value={row.refundAmount} onChange={(e) => updateRow("refundAmount", e.target.value)} className={inputClassName} /></Field>
        <Field label="청약 수수료"><input type="number" min="0" step="0.01" value={row.subscriptionFee} onChange={(e) => updateRow("subscriptionFee", e.target.value)} className={inputClassName} /></Field>
        <Field label="입고일"><input type="date" value={row.listedAt} onChange={(e) => updateRow("listedAt", e.target.value)} className={inputClassName} /></Field>
        <Field label="매도액"><input type="number" min="0" step="0.01" value={row.sellAmount} onChange={(e) => updateRow("sellAmount", e.target.value)} className={inputClassName} /></Field>
        <Field label="정산일"><input type="date" value={row.settledAt} onChange={(e) => updateRow("settledAt", e.target.value)} className={inputClassName} /></Field>
        <Field label="세금 + 수수료"><input type="number" min="0" step="0.01" value={row.taxAndFee} onChange={(e) => updateRow("taxAndFee", e.target.value)} className={inputClassName} /></Field>
      </div>

      {error ? (
        <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {submitLabel}
        </button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-ink/75">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface";
