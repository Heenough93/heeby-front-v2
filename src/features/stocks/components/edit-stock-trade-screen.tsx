"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { stockTradeBatchSchema } from "@/features/stocks/lib/stock-trade-schema";
import type {
  StockTradeAccountType,
  StockTradeDraftRow,
  StockTradeSide
} from "@/features/stocks/lib/stock-types";
import { useStockStore } from "@/features/stocks/store/stock-store";
import { useToastStore } from "@/stores/ui/use-toast-store";

type EditStockTradeScreenProps = {
  tradeId: string;
};

export function EditStockTradeScreen({ tradeId }: EditStockTradeScreenProps) {
  const router = useRouter();
  const getTradeDraftRowById = useStockStore((state) => state.getTradeDraftRowById);
  const updateTradeEntry = useStockStore((state) => state.updateTradeEntry);
  const showToast = useToastStore((state) => state.showToast);
  const initialRow = getTradeDraftRowById(tradeId);
  const [row, setRow] = useState<StockTradeDraftRow | undefined>(initialRow);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setRow(initialRow);
  }, [initialRow]);

  if (!row) {
    return (
      <AppShell
        title="거래를 찾을 수 없습니다."
        description="잘못된 경로이거나 이미 삭제된 거래입니다."
      >
        <div className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
          <p className="text-lg font-semibold">편집할 거래가 없습니다.</p>
        </div>
      </AppShell>
    );
  }

  const updateField = <K extends keyof StockTradeDraftRow>(
    key: K,
    value: StockTradeDraftRow[K]
  ) => {
    setRow((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = () => {
    const parsed = stockTradeBatchSchema.safeParse({ entries: [row] });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요.");
      return;
    }

    const nextEntry = updateTradeEntry(tradeId, parsed.data.entries[0]);

    if (!nextEntry) {
      setError("수정할 거래를 찾을 수 없습니다.");
      return;
    }

    showToast({
      title: "거래를 수정했습니다.",
      variant: "success"
    });
    router.push("/stocks/trades");
  };

  return (
    <AppShell
      title="거래 수정"
      description="선택한 매매 기록을 수정하고 다시 통합 매매일지 테이블로 돌아갑니다."
    >
      <section className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="grid gap-4 xl:grid-cols-6 md:grid-cols-3">
          <Field label="거래일">
            <input
              type="date"
              value={row.tradedAt}
              onChange={(event) => updateField("tradedAt", event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="계좌명">
            <input
              value={row.accountName}
              onChange={(event) => updateField("accountName", event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="계좌 성격">
            <select
              value={row.accountType}
              onChange={(event) =>
                updateField("accountType", event.target.value as StockTradeAccountType)
              }
              className={inputClassName}
            >
              <option value="general">일반</option>
              <option value="isa">ISA</option>
              <option value="pension">연금</option>
              <option value="overseas">해외</option>
              <option value="ipo">공모주</option>
            </select>
          </Field>
          <Field label="종목명">
            <input
              value={row.stockName}
              onChange={(event) => updateField("stockName", event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="티커">
            <input
              value={row.ticker}
              onChange={(event) => updateField("ticker", event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="시장">
            <select
              value={row.market}
              onChange={(event) =>
                updateField("market", event.target.value as StockTradeDraftRow["market"])
              }
              className={inputClassName}
            >
              <option value="KR">국내</option>
              <option value="US">미국</option>
              <option value="ETF">ETF</option>
              <option value="OTHER">기타</option>
            </select>
          </Field>
          <Field label="구분">
            <select
              value={row.side}
              onChange={(event) => updateField("side", event.target.value as StockTradeSide)}
              className={inputClassName}
            >
              <option value="buy">매수</option>
              <option value="sell">매도</option>
            </select>
          </Field>
          <Field label="수량">
            <input
              type="number"
              min="0"
              step="0.0001"
              value={row.quantity}
              onChange={(event) => updateField("quantity", event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="단가">
            <input
              type="number"
              min="0"
              step="0.0001"
              value={row.price}
              onChange={(event) => updateField("price", event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="수수료">
            <input
              type="number"
              min="0"
              step="0.0001"
              value={row.fee}
              onChange={(event) => updateField("fee", event.target.value)}
              className={inputClassName}
            />
          </Field>
          <div className="xl:col-span-2 md:col-span-3">
            <Field label="메모">
              <textarea
                value={row.note}
                onChange={(event) => updateField("note", event.target.value)}
                rows={3}
                className={`${inputClassName} min-h-24 resize-y py-3`}
              />
            </Field>
          </div>
        </div>

        {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            수정 저장
          </button>
        </div>
      </section>
    </AppShell>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-ink/75">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-12 rounded-2xl border border-line/10 bg-surface px-4 text-sm outline-none transition focus:border-coral focus:bg-paper";
