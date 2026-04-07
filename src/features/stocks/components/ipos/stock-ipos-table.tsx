"use client";

import { Fragment, useMemo, useState } from "react";
import { stockIpoBatchSchema } from "@/features/stocks/lib/ipos/stock-ipo-schema";
import {
  getIpoMonthKey,
  getIpoProfit,
  getIpoSettlementAmount,
  getIpoSharePrice
} from "@/features/stocks/lib/ipos/stock-ipo-utils";
import { useStockStore } from "@/features/stocks/store/stock-store";
import { AlertDialog } from "@/shared/components/feedback/alert-dialog";
import { useToastStore } from "@/stores/ui/use-toast-store";
import type {
  StockIpoDraftRow,
  StockIpoEntry
} from "@/features/stocks/lib/ipos/stock-ipo-types";
import { formatTradeCurrency } from "@/features/stocks/lib/trades/stock-trade-utils";
import { getOwnerScopeLabel, type OwnerScope } from "@/types/domain";

type IpoSortKey = "latest" | "oldest" | "profit-desc" | "profit-asc";

type StockIposTableProps = {
  scopeFilter: OwnerScope | "all";
  onScopeChange: (scope: OwnerScope | "all") => void;
};

export function StockIposTable({
  scopeFilter,
  onScopeChange
}: StockIposTableProps) {
  const ipoEntries = useStockStore((state) => state.ipoEntries);
  const getIpoDraftRowById = useStockStore((state) => state.getIpoDraftRowById);
  const updateIpoEntry = useStockStore((state) => state.updateIpoEntry);
  const removeIpoEntry = useStockStore((state) => state.removeIpoEntry);
  const showToast = useToastStore((state) => state.showToast);
  const monthOptions = useMemo(
    () => Array.from(new Set(ipoEntries.map((entry) => getIpoMonthKey(entry.subscribedAt)))),
    [ipoEntries]
  );
  const brokerageOptions = useMemo(
    () => Array.from(new Set(ipoEntries.map((entry) => entry.brokerage))).sort(),
    [ipoEntries]
  );
  const [month, setMonth] = useState("");
  const [brokerage, setBrokerage] = useState("전체");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<IpoSortKey>("latest");
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<StockIpoDraftRow | null>(null);
  const [editError, setEditError] = useState<string>();
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState<StockIpoEntry | null>(null);

  const baseEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return ipoEntries.filter((entry) => {
      if (month && getIpoMonthKey(entry.subscribedAt) !== month) {
        return false;
      }

      if (brokerage !== "전체" && entry.brokerage !== brokerage) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return `${entry.stockName} ${entry.brokerage}`.toLowerCase().includes(normalizedSearch);
    });
  }, [brokerage, ipoEntries, month, search]);

  const filteredEntries = useMemo(() => {
    const nextEntries = baseEntries.filter((entry) => {
      if (scopeFilter === "all") {
        return true;
      }

      return entry.ownerScope === scopeFilter;
    });

    return [...nextEntries].sort((a, b) => {
      switch (sortKey) {
        case "oldest":
          return a.subscribedAt.localeCompare(b.subscribedAt);
        case "profit-desc":
          return getIpoProfit(b) - getIpoProfit(a);
        case "profit-asc":
          return getIpoProfit(a) - getIpoProfit(b);
        case "latest":
        default:
          return b.subscribedAt.localeCompare(a.subscribedAt);
      }
    });
  }, [baseEntries, scopeFilter, sortKey]);

  const totalCount = baseEntries.length;
  const yumjaCount = baseEntries.filter((entry) => entry.ownerScope === "yumja").length;
  const heebyCount = baseEntries.filter((entry) => entry.ownerScope === "heeby").length;
  const yumjaProfit = baseEntries
    .filter((entry) => entry.ownerScope === "yumja")
    .reduce((sum, entry) => sum + getIpoProfit(entry), 0);
  const heebyProfit = baseEntries
    .filter((entry) => entry.ownerScope === "heeby")
    .reduce((sum, entry) => sum + getIpoProfit(entry), 0);

  const resetFilters = () => {
    setMonth("");
    setBrokerage("전체");
    setSearch("");
    setSortKey("latest");
  };

  const openEditModal = (entryId: string) => {
    const nextRow = getIpoDraftRowById(entryId);

    if (!nextRow) {
      showToast({
        title: "수정할 공모주 기록을 찾을 수 없습니다.",
        variant: "error"
      });
      return;
    }

    setEditError(undefined);
    setEditingRow(nextRow);
  };

  const closeEditModal = () => {
    setEditError(undefined);
    setEditingRow(null);
  };

  const updateEditingField = <K extends keyof StockIpoDraftRow>(key: K, value: StockIpoDraftRow[K]) => {
    setEditingRow((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleEditSubmit = () => {
    if (!editingRow) {
      return;
    }

    const parsed = stockIpoBatchSchema.safeParse({ entries: [editingRow] });

    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요.");
      return;
    }

    const nextEntry = updateIpoEntry(editingRow.id, parsed.data.entries[0]);

    if (!nextEntry) {
      setEditError("수정할 공모주 기록을 찾을 수 없습니다.");
      return;
    }

    showToast({
      title: "공모주 기록을 수정했습니다.",
      variant: "success"
    });
    closeEditModal();
  };

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { value: "all", label: "전체" },
            { value: "yumja", label: getOwnerScopeLabel("yumja") },
            { value: "heeby", label: getOwnerScopeLabel("heeby") }
          ].map((option) => {
            const isActive = scopeFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onScopeChange(option.value as OwnerScope | "all")}
                className={
                  isActive
                    ? "rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    : "rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_0.9fr_1.2fr_auto]">
          <Field label="월">
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className={inputClassName}
            >
              <option value="">전체</option>
              {monthOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="증권사">
            <select
              value={brokerage}
              onChange={(event) => setBrokerage(event.target.value)}
              className={inputClassName}
            >
              <option value="전체">전체</option>
              {brokerageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="검색">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="공모주 이름, 증권사"
              className={inputClassName}
            />
          </Field>
          <div className="grid gap-2 lg:grid-cols-2">
            <Field label="정렬">
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as IpoSortKey)}
                className={inputClassName}
              >
                <option value="latest">최신 청약순</option>
                <option value="oldest">오래된 청약순</option>
                <option value="profit-desc">수익 큰 순</option>
                <option value="profit-asc">수익 작은 순</option>
              </select>
            </Field>
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="전체 / 윰자 / 희비" value={`${totalCount} / ${yumjaCount} / ${heebyCount}`} />
        <SummaryCard label="윰자 총 수익" value={`${formatTradeCurrency(yumjaProfit)} 원`} />
        <SummaryCard label="희비 총 수익" value={`${formatTradeCurrency(heebyProfit)} 원`} />
      </div>

      <div className="rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full divide-y divide-line/10 text-sm">
            <thead>
              <tr className="text-left text-ink/55">
                {["대상", "공모주 이름", "증권사", "청약일", "배정수량", "주가", "매도액", "수익", "상세"].map((label) => (
                  <th key={label} className="px-3 py-3 font-semibold">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line/10">
              {filteredEntries.map((entry) => {
                const isExpanded = expandedEntryId === entry.id;

                return (
                  <Fragment key={entry.id}>
                    <tr className="align-top">
                      <td className="px-3 py-4">{getOwnerScopeLabel(entry.ownerScope)}</td>
                      <td className="px-3 py-4 font-semibold">{entry.stockName}</td>
                      <td className="px-3 py-4">{entry.brokerage}</td>
                      <td className="px-3 py-4">{entry.subscribedAt}</td>
                      <td className="px-3 py-4">{formatTradeCurrency(entry.allocatedQuantity)}</td>
                      <td className="px-3 py-4">{formatOptionalCurrency(getIpoSharePrice(entry))}</td>
                      <td className="px-3 py-4">{formatOptionalCurrency(entry.sellAmount)}</td>
                      <td className="px-3 py-4">{formatProfitCell(getIpoProfit(entry))}</td>
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          onClick={() => setExpandedEntryId((current) => (current === entry.id ? null : entry.id))}
                          className="rounded-full border border-line/10 bg-paper px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
                        >
                          {isExpanded ? "닫기" : "상세"}
                        </button>
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr>
                        <td colSpan={9} className="px-3 pb-5">
                          <div className="rounded-[24px] border border-line/10 bg-paper p-5">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <DetailItem label="증거금" value={`${formatTradeCurrency(entry.deposit)} 원`} />
                              <DetailItem label="환불일" value={entry.refundedAt ?? "-"} />
                              <DetailItem label="환불금" value={formatOptionalCurrency(entry.refundAmount)} />
                              <DetailItem label="청약 수수료" value={formatOptionalCurrency(entry.subscriptionFee)} />
                              <DetailItem label="입고일" value={entry.listedAt ?? "-"} />
                              <DetailItem label="정산일" value={entry.settledAt ?? "-"} />
                              <DetailItem label="세금 + 수수료" value={formatOptionalCurrency(entry.taxAndFee)} />
                              <DetailItem
                                label="정산액"
                                value={`${formatTradeCurrency(getIpoSettlementAmount(entry))} 원`}
                              />
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(entry.id)}
                                className="rounded-full border border-line/10 bg-surface px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingDeleteEntry(entry)}
                                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:hidden">
          {filteredEntries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[22px] border border-line/10 bg-paper p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-ink/52">{entry.subscribedAt}</p>
                  <h3 className="mt-1 text-lg font-semibold">{entry.stockName}</h3>
                  <p className="mt-1 text-sm text-ink/60">{entry.brokerage}</p>
                </div>
                <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink/68">
                  {getOwnerScopeLabel(entry.ownerScope)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <DetailItem label="대상" value={getOwnerScopeLabel(entry.ownerScope)} />
                <DetailItem label="배정수량" value={formatTradeCurrency(entry.allocatedQuantity)} />
                <DetailItem label="주가" value={formatOptionalCurrency(getIpoSharePrice(entry))} />
                <DetailItem label="매도액" value={formatOptionalCurrency(entry.sellAmount)} />
                <DetailItem label="수익" value={formatProfitCell(getIpoProfit(entry))} />
              </div>

              <div className="mt-4 rounded-[18px] border border-line/10 bg-surface px-4 py-3">
                <div className="grid gap-3 text-sm">
                  <DetailItem label="청약 수수료" value={formatOptionalCurrency(entry.subscriptionFee)} />
                  <DetailItem label="주가" value={formatOptionalCurrency(getIpoSharePrice(entry))} />
                  <DetailItem label="매도액" value={formatOptionalCurrency(entry.sellAmount)} />
                  <DetailItem label="세금 + 수수료" value={formatOptionalCurrency(entry.taxAndFee)} />
                  <DetailItem label="환불일" value={entry.refundedAt ?? "-"} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(entry.id)}
                  className="rounded-full border border-line/10 bg-surface px-4 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDeleteEntry(entry)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-line/15 bg-paper p-8 text-center">
            <p className="text-lg font-semibold">조건에 맞는 공모주 기록이 없습니다.</p>
            <p className="mt-2 text-sm text-ink/60">필터를 바꾸거나 새 공모주를 기록해보세요.</p>
          </div>
        ) : null}
      </div>

      {editingRow ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/35 px-5 py-6">
          <div className="mx-auto w-full max-w-6xl rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">공모주 기록 수정</h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                닫기
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FormFields row={editingRow} onChange={updateEditingField} />
            </div>

            {editError ? (
              <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {editError}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleEditSubmit}
                className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AlertDialog
        open={Boolean(pendingDeleteEntry)}
        title="공모주 기록을 삭제할까요?"
        description="삭제한 기록은 이 브라우저에서 다시 복구할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        onClose={() => setPendingDeleteEntry(null)}
        onConfirm={() => {
          if (!pendingDeleteEntry) {
            return;
          }

          removeIpoEntry(pendingDeleteEntry.id);
          showToast({
            title: "공모주 기록을 삭제했습니다.",
            variant: "success"
          });
          setPendingDeleteEntry(null);
        }}
      />
    </section>
  );
}

function FormFields({
  row,
  onChange
}: {
  row: StockIpoDraftRow;
  onChange: <K extends keyof StockIpoDraftRow>(key: K, value: StockIpoDraftRow[K]) => void;
}) {
  return (
    <>
      <Field label="공모주 이름"><input value={row.stockName} onChange={(e) => onChange("stockName", e.target.value)} className={inputClassName} /></Field>
      <Field label="증권사"><input value={row.brokerage} onChange={(e) => onChange("brokerage", e.target.value)} className={inputClassName} /></Field>
      <Field label="청약일"><input type="date" value={row.subscribedAt} onChange={(e) => onChange("subscribedAt", e.target.value)} className={inputClassName} /></Field>
      <Field label="증거금"><input type="number" min="0" step="0.01" value={row.deposit} onChange={(e) => onChange("deposit", e.target.value)} className={inputClassName} /></Field>
      <Field label="배정수량"><input type="number" min="0" step="1" value={row.allocatedQuantity} onChange={(e) => onChange("allocatedQuantity", e.target.value)} className={inputClassName} /></Field>
      <Field label="환불일"><input type="date" value={row.refundedAt} onChange={(e) => onChange("refundedAt", e.target.value)} className={inputClassName} /></Field>
      <Field label="환불금"><input type="number" min="0" step="0.01" value={row.refundAmount} onChange={(e) => onChange("refundAmount", e.target.value)} className={inputClassName} /></Field>
      <Field label="청약 수수료"><input type="number" min="0" step="0.01" value={row.subscriptionFee} onChange={(e) => onChange("subscriptionFee", e.target.value)} className={inputClassName} /></Field>
      <Field label="입고일"><input type="date" value={row.listedAt} onChange={(e) => onChange("listedAt", e.target.value)} className={inputClassName} /></Field>
      <Field label="매도액"><input type="number" min="0" step="0.01" value={row.sellAmount} onChange={(e) => onChange("sellAmount", e.target.value)} className={inputClassName} /></Field>
      <Field label="정산일"><input type="date" value={row.settledAt} onChange={(e) => onChange("settledAt", e.target.value)} className={inputClassName} /></Field>
      <Field label="세금 + 수수료"><input type="number" min="0" step="0.01" value={row.taxAndFee} onChange={(e) => onChange("taxAndFee", e.target.value)} className={inputClassName} /></Field>
    </>
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-line/10 bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-ink/60">{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">{label}</p>
      <p className="text-sm font-medium text-ink/85">{value}</p>
    </div>
  );
}

function formatOptionalCurrency(value?: number) {
  return value === undefined ? "-" : `${formatTradeCurrency(value)} 원`;
}

function formatProfitCell(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatTradeCurrency(value)} 원`;
}

const inputClassName =
  "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface";
