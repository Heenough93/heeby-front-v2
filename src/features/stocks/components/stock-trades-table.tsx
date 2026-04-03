"use client";

import { Fragment, useMemo, useState } from "react";
import { stockTradeBatchSchema } from "@/features/stocks/lib/stock-trade-schema";
import { useStockStore } from "@/features/stocks/store/stock-store";
import {
  formatTradeCurrency,
  getTradeAccountTypeLabel,
  getTradeAmount,
  getTradeAmountKrw,
  getTradeMonthKey,
  getTradeSideLabel
} from "@/features/stocks/lib/stock-trade-utils";
import { AlertDialog } from "@/shared/components/feedback/alert-dialog";
import type {
  StockTradeAccountType,
  StockTradeDraftRow,
  StockTradeEntry,
  StockTradeSide
} from "@/features/stocks/lib/stock-types";
import { useToastStore } from "@/stores/ui/use-toast-store";

type TradeSortKey = "latest" | "oldest" | "amount-desc" | "amount-asc";

export function StockTradesTable() {
  const tradeEntries = useStockStore((state) => state.tradeEntries);
  const getTradeDraftRowById = useStockStore((state) => state.getTradeDraftRowById);
  const updateTradeEntry = useStockStore((state) => state.updateTradeEntry);
  const removeTradeEntry = useStockStore((state) => state.removeTradeEntry);
  const showToast = useToastStore((state) => state.showToast);
  const monthOptions = useMemo(
    () => Array.from(new Set(tradeEntries.map((entry) => getTradeMonthKey(entry.tradedAt)))),
    [tradeEntries]
  );
  const accountOptions = useMemo(
    () => Array.from(new Set(tradeEntries.map((entry) => entry.accountName))).sort(),
    [tradeEntries]
  );
  const [month, setMonth] = useState("");
  const [accountName, setAccountName] = useState("전체");
  const [accountType, setAccountType] = useState<"전체" | StockTradeAccountType>("전체");
  const [side, setSide] = useState<"전체" | StockTradeSide>("전체");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<TradeSortKey>("latest");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<StockTradeDraftRow | null>(null);
  const [editError, setEditError] = useState<string>();
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState<StockTradeEntry | null>(null);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const nextEntries = tradeEntries.filter((entry) => {
      if (month && getTradeMonthKey(entry.tradedAt) !== month) {
        return false;
      }

      if (accountName !== "전체" && entry.accountName !== accountName) {
        return false;
      }

      if (accountType !== "전체" && entry.accountType !== accountType) {
        return false;
      }

      if (side !== "전체" && entry.side !== side) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return `${entry.stockName} ${entry.ticker} ${entry.note ?? ""} ${entry.accountName}`
        .toLowerCase()
        .includes(normalizedSearch);
    });

    return [...nextEntries].sort((a, b) => {
      switch (sortKey) {
        case "oldest":
          return a.tradedAt.localeCompare(b.tradedAt);
        case "amount-desc":
          return getTradeAmountKrw(b) - getTradeAmountKrw(a);
        case "amount-asc":
          return getTradeAmountKrw(a) - getTradeAmountKrw(b);
        case "latest":
        default:
          return b.tradedAt.localeCompare(a.tradedAt);
      }
    });
  }, [accountName, accountType, month, search, side, sortKey, tradeEntries]);

  const activeFilterChips = [
    month ? `${month}` : null,
    accountName !== "전체" ? accountName : null,
    accountType !== "전체" ? getTradeAccountTypeLabel(accountType) : null,
    side !== "전체" ? getTradeSideLabel(side) : null,
    search.trim() ? `검색: ${search.trim()}` : null
  ].filter(Boolean) as string[];
  const buyAmountKrw = filteredEntries
    .filter((entry) => entry.side === "buy")
    .reduce((sum, entry) => sum + getTradeAmountKrw(entry), 0);
  const sellAmountKrw = filteredEntries
    .filter((entry) => entry.side === "sell")
    .reduce((sum, entry) => sum + getTradeAmountKrw(entry), 0);

  const resetFilters = () => {
    setMonth("");
    setAccountName("전체");
    setAccountType("전체");
    setSide("전체");
    setSearch("");
    setSortKey("latest");
    setIsAdvancedOpen(false);
  };

  const updateEditingField = <K extends keyof StockTradeDraftRow>(
    key: K,
    value: StockTradeDraftRow[K]
  ) => {
    setEditingRow((current) => (current ? { ...current, [key]: value } : current));
  };

  const openEditModal = (entryId: string) => {
    const nextRow = getTradeDraftRowById(entryId);

    if (!nextRow) {
      showToast({
        title: "수정할 거래를 찾을 수 없습니다.",
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

  const handleEditSubmit = () => {
    if (!editingRow) {
      return;
    }

    const parsed = stockTradeBatchSchema.safeParse({ entries: [editingRow] });

    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요.");
      return;
    }

    const nextEntry = updateTradeEntry(editingRow.id, parsed.data.entries[0]);

    if (!nextEntry) {
      setEditError("수정할 거래를 찾을 수 없습니다.");
      return;
    }

    showToast({
      title: "거래를 수정했습니다.",
      variant: "success"
    });
    closeEditModal();
  };

  return (
    <section className="grid gap-6">
      <div className="w-full rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1fr_1.1fr_auto]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">월</span>
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
            >
              <option value="">전체</option>
              {monthOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">계좌</span>
            <select
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
            >
              <option value="전체">전체</option>
              {accountOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/75">검색</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="종목, 티커, 메모"
              className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
            />
          </label>

          <div className="grid gap-2 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-ink/75">정렬</span>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as TradeSortKey)}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
              >
                <option value="latest">최신 거래순</option>
                <option value="oldest">오래된 거래순</option>
                <option value="amount-desc">거래금액 큰 순</option>
                <option value="amount-asc">거래금액 작은 순</option>
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen((current) => !current)}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                {isAdvancedOpen ? "고급 필터 닫기" : "고급 필터"}
              </button>
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

        {isAdvancedOpen ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-ink/75">계좌 성격</span>
              <select
                value={accountType}
                onChange={(event) =>
                  setAccountType(event.target.value as "전체" | StockTradeAccountType)
                }
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
              >
                <option value="전체">전체</option>
                <option value="general">일반</option>
                <option value="isa">ISA</option>
                <option value="pension">연금</option>
                <option value="overseas">해외</option>
                <option value="ipo">공모주</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-ink/75">매수/매도</span>
              <select
                value={side}
                onChange={(event) => setSide(event.target.value as "전체" | StockTradeSide)}
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
              >
                <option value="전체">전체</option>
                <option value="buy">매수</option>
                <option value="sell">매도</option>
              </select>
            </label>
          </div>
        ) : null}

        {activeFilterChips.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/62"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid w-full gap-4 md:grid-cols-3">
        <SummaryCard label="전체 / 매수 / 매도" value={`${filteredEntries.length} / ${filteredEntries.filter((entry) => entry.side === "buy").length} / ${filteredEntries.filter((entry) => entry.side === "sell").length}`} />
        <SummaryCard label="매수 합" value={`${formatTradeCurrency(buyAmountKrw)}원`} />
        <SummaryCard label="매도 합" value={`${formatTradeCurrency(sellAmountKrw)}원`} />
      </div>

      <div className="w-full rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
              Trade Table
            </p>
            <h2 className="mt-2 text-2xl font-bold">통합 매매일지</h2>
          </div>
          <span className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink/68">
            거래 {filteredEntries.length}건
          </span>
        </div>

        <div className="mt-6 hidden overflow-x-auto md:block">
          <table className="w-full divide-y divide-line/10 text-sm">
            <thead>
              <tr className="text-left text-ink/55">
                <th className="px-3 py-3 font-semibold">거래일</th>
                <th className="px-3 py-3 font-semibold">계좌</th>
                <th className="px-3 py-3 font-semibold">종목</th>
                <th className="px-3 py-3 font-semibold">구분</th>
                <th className="px-3 py-3 font-semibold">수량</th>
                <th className="px-3 py-3 font-semibold">단가</th>
                <th className="px-3 py-3 font-semibold">거래금액</th>
                <th className="px-3 py-3 font-semibold">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/10">
              {filteredEntries.map((entry) => {
                const isExpanded = expandedEntryId === entry.id;

                return (
                  <Fragment key={entry.id}>
                    <tr className="align-top">
                      <td className="px-3 py-4">{entry.tradedAt}</td>
                      <td className="px-3 py-4">{entry.accountName}</td>
                      <td className="px-3 py-4">
                        <div className="font-semibold">{entry.stockName}</div>
                        <div className="mt-1 text-xs text-ink/52">{entry.ticker}</div>
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={
                            entry.side === "buy"
                              ? "rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral"
                              : "rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink/70"
                          }
                        >
                          {getTradeSideLabel(entry.side)}
                        </span>
                      </td>
                      <td className="px-3 py-4">{formatTradeCurrency(entry.quantity)}</td>
                      <td className="px-3 py-4">{formatTradeCurrency(entry.price)}</td>
                      <td className="px-3 py-4">{formatTradeCurrency(getTradeAmountKrw(entry))}</td>
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedEntryId((current) =>
                              current === entry.id ? null : entry.id
                            )
                          }
                          className="rounded-full border border-line/10 bg-paper px-3 py-2 text-xs font-semibold transition hover:border-coral/35 hover:bg-soft"
                        >
                          {isExpanded ? "접기" : "상세"}
                        </button>
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr>
                        <td colSpan={8} className="px-3 pb-4">
                          <div className="rounded-[20px] border border-line/10 bg-paper p-4">
                            <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                              <DetailItem
                                label="계좌 성격"
                                value={getTradeAccountTypeLabel(entry.accountType)}
                              />
                              <DetailItem label="시장" value={entry.market} />
                              <DetailItem
                                label="환율"
                                value={
                                  entry.market === "US" && entry.exchangeRate
                                    ? formatTradeCurrency(entry.exchangeRate)
                                    : "-"
                                }
                              />
                              <DetailItem
                                label="수수료"
                                value={
                                  entry.fee ? formatTradeCurrency(entry.fee) : "-"
                                }
                              />
                              <DetailItem label="티커" value={entry.ticker} />
                            </div>
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-ink/52">메모</p>
                              <p className="mt-2 text-sm leading-6 text-ink/64">
                                {entry.note ?? "메모가 없습니다."}
                              </p>
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

        <div className="mt-6 grid gap-3 md:hidden">
          {filteredEntries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[22px] border border-line/10 bg-paper p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-ink/52">{entry.tradedAt}</p>
                  <h3 className="mt-1 text-lg font-semibold">{entry.stockName}</h3>
                  <p className="mt-1 text-sm text-ink/60">
                    {entry.accountName} · {entry.ticker}
                  </p>
                </div>
                <span
                  className={
                    entry.side === "buy"
                      ? "rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral"
                      : "rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink/70"
                  }
                >
                  {getTradeSideLabel(entry.side)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <DetailItem label="수량" value={formatTradeCurrency(entry.quantity)} />
                <DetailItem label="단가" value={formatTradeCurrency(entry.price)} />
                <DetailItem
                  label="거래금액"
                  value={formatTradeCurrency(getTradeAmountKrw(entry))}
                />
                <DetailItem
                  label="환율"
                  value={
                    entry.market === "US" && entry.exchangeRate
                      ? formatTradeCurrency(entry.exchangeRate)
                      : "-"
                  }
                />
                <DetailItem
                  label="수수료"
                  value={entry.fee ? formatTradeCurrency(entry.fee) : "-"}
                />
              </div>

              <div className="mt-4 rounded-[18px] border border-line/10 bg-surface px-4 py-3">
                <p className="text-xs font-semibold text-ink/52">메모</p>
                <p className="mt-2 text-sm leading-6 text-ink/64">
                  {entry.note ?? "메모가 없습니다."}
                </p>
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
            <p className="text-lg font-semibold">조건에 맞는 거래가 없습니다.</p>
            <p className="mt-2 text-sm text-ink/60">
              필터를 조정하거나 새 거래를 추가해보세요.
            </p>
          </div>
        ) : null}
      </div>

      {editingRow ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/35 px-5 py-6">
          <div className="mx-auto w-full max-w-5xl rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                  Edit Trade
                </p>
                <h2 className="mt-2 text-2xl font-bold">거래 수정</h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                닫기
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TradeField label="거래일">
                <input
                  type="date"
                  value={editingRow.tradedAt}
                  onChange={(event) => updateEditingField("tradedAt", event.target.value)}
                  className={editInputClassName}
                />
              </TradeField>
              <TradeField label="계좌명">
                <input
                  value={editingRow.accountName}
                  onChange={(event) => updateEditingField("accountName", event.target.value)}
                  className={editInputClassName}
                />
              </TradeField>
              <TradeField label="계좌 성격">
                <select
                  value={editingRow.accountType}
                  onChange={(event) =>
                    updateEditingField(
                      "accountType",
                      event.target.value as StockTradeAccountType
                    )
                  }
                  className={editInputClassName}
                >
                  <option value="general">일반</option>
                  <option value="isa">ISA</option>
                  <option value="pension">연금</option>
                  <option value="overseas">해외</option>
                  <option value="ipo">공모주</option>
                </select>
              </TradeField>
              <TradeField label="종목명">
                <input
                  value={editingRow.stockName}
                  onChange={(event) => updateEditingField("stockName", event.target.value)}
                  className={editInputClassName}
                />
              </TradeField>
              <TradeField label="티커">
                <input
                  value={editingRow.ticker}
                  onChange={(event) => updateEditingField("ticker", event.target.value)}
                  className={editInputClassName}
                />
              </TradeField>
              <TradeField label="시장">
                <select
                  value={editingRow.market}
                  onChange={(event) =>
                    updateEditingField(
                      "market",
                      event.target.value as StockTradeDraftRow["market"]
                    )
                  }
                  className={editInputClassName}
                >
                  <option value="KR">국내</option>
                  <option value="US">미국</option>
                  <option value="ETF">ETF</option>
                  <option value="OTHER">기타</option>
                </select>
              </TradeField>
              <TradeField label="구분">
                <select
                  value={editingRow.side}
                  onChange={(event) =>
                    updateEditingField("side", event.target.value as StockTradeSide)
                  }
                  className={editInputClassName}
                >
                  <option value="buy">매수</option>
                  <option value="sell">매도</option>
                </select>
              </TradeField>
              <TradeField label="수량">
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={editingRow.quantity}
                  onChange={(event) => updateEditingField("quantity", event.target.value)}
                  className={editInputClassName}
                />
              </TradeField>
              <TradeField label="단가">
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={editingRow.price}
                  onChange={(event) => updateEditingField("price", event.target.value)}
                  className={editInputClassName}
                />
              </TradeField>
              <TradeField label="환율">
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={editingRow.exchangeRate}
                  onChange={(event) => updateEditingField("exchangeRate", event.target.value)}
                  className={editInputClassName}
                  placeholder={editingRow.market === "US" ? "예: 1371.2" : "미국 거래만 입력"}
                  disabled={editingRow.market !== "US"}
                />
              </TradeField>
              <TradeField label="수수료">
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={editingRow.fee}
                  onChange={(event) => updateEditingField("fee", event.target.value)}
                  className={editInputClassName}
                />
              </TradeField>
              <div className="xl:col-span-4 md:col-span-2">
                <TradeField label="메모">
                  <textarea
                    value={editingRow.note}
                    onChange={(event) => updateEditingField("note", event.target.value)}
                    rows={3}
                    className={editTextareaClassName}
                  />
                </TradeField>
              </div>
            </div>

            {editError ? <p className="mt-5 text-sm text-red-600">{editError}</p> : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                수정 저장
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AlertDialog
        open={Boolean(pendingDeleteEntry)}
        title="거래를 삭제할까요?"
        description={
          pendingDeleteEntry
            ? `${pendingDeleteEntry.tradedAt} ${pendingDeleteEntry.stockName} 거래를 삭제하면 이 브라우저의 로컬 기록에서 사라집니다.`
            : ""
        }
        confirmLabel="거래 삭제"
        variant="danger"
        onClose={() => setPendingDeleteEntry(null)}
        onConfirm={() => {
          if (!pendingDeleteEntry) {
            return;
          }

          removeTradeEntry(pendingDeleteEntry.id);
          setExpandedEntryId(null);
          setPendingDeleteEntry(null);
          showToast({
            title: "거래를 삭제했습니다.",
            variant: "success"
          });
        }}
      />
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-line/10 bg-surface px-4 py-3">
      <p className="text-xs font-semibold text-ink/52">{label}</p>
      <p className="mt-2 font-medium text-ink/75">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-line/10 bg-surface p-5 shadow-card">
      <p className="text-sm text-ink/55">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function TradeField({
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

const editInputClassName =
  "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface";

const editTextareaClassName =
  "min-h-24 rounded-2xl border border-line/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-coral focus:bg-surface";
