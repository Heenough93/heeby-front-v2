"use client";

import { useState } from "react";
import { stockTradeBatchSchema } from "@/features/stocks/lib/trades/stock-trade-schema";
import { createEmptyTradeRow } from "@/features/stocks/lib/trades/stock-trade-utils";
import type {
  StockTradeAccountType,
  StockTradeDraftRow
} from "@/features/stocks/lib/trades/stock-trade-types";
import type { StockSnapshotScope } from "@/features/stocks/lib/snapshots/stock-snapshot-types";
import { useStockStore } from "@/features/stocks/store/stock-store";
import { useToastStore } from "@/stores/ui/use-toast-store";

type StockTradeBatchFormProps = {
  onSubmitted?: () => void;
  submitLabel?: string;
  inline?: boolean;
  initialScope?: StockSnapshotScope;
};

export function StockTradeBatchForm({
  onSubmitted,
  submitLabel = "거래 저장",
  inline = false,
  initialScope = "KR"
}: StockTradeBatchFormProps) {
  const addTradeEntries = useStockStore((state) => state.addTradeEntries);
  const showToast = useToastStore((state) => state.showToast);
  const [rows, setRows] = useState<StockTradeDraftRow[]>([
    createEmptyTradeRow(undefined, initialScope === "US" ? "US" : "KR")
  ]);
  const [error, setError] = useState<string>();

  const updateRow = <K extends keyof StockTradeDraftRow>(
    rowId: string,
    key: K,
    value: StockTradeDraftRow[K]
  ) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        if (key === "market") {
          return {
            ...row,
            market: value as StockTradeDraftRow["market"]
          };
        }

        if (key === "positionStatus") {
          return {
            ...row,
            positionStatus: value as StockTradeDraftRow["positionStatus"],
            currentPrice: value === "open" ? row.currentPrice : "",
            soldAt: value === "closed" ? row.soldAt : "",
            sellPrice: value === "closed" ? row.sellPrice : ""
          };
        }

        return { ...row, [key]: value };
      })
    );
  };

  const addRow = () => {
    setRows((current) => [
      ...current,
      createEmptyTradeRow(undefined, initialScope === "US" ? "US" : "KR")
    ]);
  };

  const removeRow = (rowId: string) => {
    setRows((current) => current.filter((row) => row.id !== rowId));
  };

  const handleSubmit = () => {
    const parsed = stockTradeBatchSchema.safeParse({ entries: rows });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요.");
      return;
    }

    addTradeEntries(parsed.data);
    showToast({
      title: "통합 매매일지를 저장했습니다.",
      variant: "success"
    });
    onSubmitted?.();
  };

  return (
    <section
      className={
        inline
          ? ""
          : "rounded-[28px] border border-line/10 bg-surface p-6 shadow-card"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {inline ? null : (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
              Entry Rows
            </p>
            <h2 className="mt-2 text-2xl font-bold">거래 입력</h2>
          </div>
        )}
        <button
          type="button"
          onClick={addRow}
          className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
        >
          행 추가
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {rows.map((row, index) => (
          <article
            key={row.id}
            className="rounded-[24px] border border-line/10 bg-paper p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">거래 #{index + 1}</p>
              {rows.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  삭제
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="거래일">
                <input
                  type="date"
                  value={row.tradedAt}
                  onChange={(event) => updateRow(row.id, "tradedAt", event.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field label="계좌명">
                <input
                  value={row.accountName}
                  onChange={(event) => updateRow(row.id, "accountName", event.target.value)}
                  className={inputClassName}
                  placeholder="예: 미래에셋 일반"
                />
              </Field>
              <Field label="계좌 성격">
                <select
                  value={row.accountType}
                  onChange={(event) =>
                    updateRow(
                      row.id,
                      "accountType",
                      event.target.value as StockTradeAccountType
                    )
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
                  onChange={(event) => updateRow(row.id, "stockName", event.target.value)}
                  className={inputClassName}
                  placeholder="예: NVIDIA"
                />
              </Field>
              <Field label="티커">
                <input
                  value={row.ticker}
                  onChange={(event) => updateRow(row.id, "ticker", event.target.value)}
                  className={inputClassName}
                  placeholder="예: NVDA"
                />
              </Field>
              <Field label="시장">
                <select
                  value={row.market}
                  onChange={(event) =>
                    updateRow(
                      row.id,
                      "market",
                      event.target.value as StockTradeDraftRow["market"]
                    )
                  }
                  className={inputClassName}
                >
                  <option value="KR">국내</option>
                  <option value="US">미국</option>
                  <option value="ETF">ETF</option>
                  <option value="OTHER">기타</option>
                </select>
              </Field>
              <Field label="보유 상태">
                <select
                  value={row.positionStatus}
                  onChange={(event) =>
                    updateRow(
                      row.id,
                      "positionStatus",
                      event.target.value as StockTradeDraftRow["positionStatus"]
                    )
                  }
                  className={inputClassName}
                >
                  <option value="open">보유중</option>
                  <option value="closed">매도완료</option>
                </select>
              </Field>
              <Field label="수량">
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={row.quantity}
                  onChange={(event) => updateRow(row.id, "quantity", event.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field label="매수가">
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={row.buyPrice}
                  onChange={(event) => updateRow(row.id, "buyPrice", event.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field label={row.positionStatus === "closed" ? "매도일" : "현재가 기준일"}>
                <input
                  type={row.positionStatus === "closed" ? "date" : "text"}
                  value={row.positionStatus === "closed" ? row.soldAt : "실시간/수동 입력"}
                  onChange={(event) => updateRow(row.id, "soldAt", event.target.value)}
                  className={inputClassName}
                  disabled={row.positionStatus !== "closed"}
                />
              </Field>
              <Field label={row.positionStatus === "closed" ? "매도가" : "현재가"}>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={row.positionStatus === "closed" ? row.sellPrice : row.currentPrice}
                  onChange={(event) =>
                    updateRow(
                      row.id,
                      row.positionStatus === "closed" ? "sellPrice" : "currentPrice",
                      event.target.value
                    )
                  }
                  className={inputClassName}
                  placeholder={row.positionStatus === "closed" ? "매도가 입력" : "현재가 입력"}
                />
              </Field>
              <Field label="수수료">
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={row.fee}
                  onChange={(event) => updateRow(row.id, "fee", event.target.value)}
                  className={inputClassName}
                />
              </Field>
              <div className="xl:col-span-4 md:col-span-2">
                <Field label="메모">
                  <textarea
                    value={row.note}
                    onChange={(event) => updateRow(row.id, "note", event.target.value)}
                    rows={3}
                    className={`${inputClassName} min-h-24 resize-y py-3`}
                    placeholder="진입 이유, 익절/손절 판단 등을 짧게 남깁니다."
                  />
                </Field>
              </div>
            </div>
          </article>
        ))}
      </div>

      {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}

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
