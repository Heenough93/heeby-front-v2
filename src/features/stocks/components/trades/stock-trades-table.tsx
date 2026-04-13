"use client";

import { Fragment, useMemo, useState } from "react";
import { stockTradeBatchSchema } from "@/features/stocks/lib/trades/stock-trade-schema";
import { useStockStore } from "@/features/stocks/store/stock-store";
import {
  getTradeCurrencyUnit,
  formatTradeCurrency,
  formatTradePrice,
  formatTradeRate,
  getTradeAccountTypeLabel,
  getTradeBuyAmountKrw,
  getTradeCurrentAmountKrw,
  getTradeMonthKey,
  getTradePositionStatusLabel,
  getTradeProfitAmountKrw,
  getTradeProfitRate,
  getTradeReferencePrice,
  getTradeScope,
  getTradeSellAmountKrw
} from "@/features/stocks/lib/trades/stock-trade-utils";
import { AlertDialog } from "@/shared/components/feedback/alert-dialog";
import type {
  StockTradeAccountType,
  StockTradeDraftRow,
  StockTradeEntry,
  StockTradePositionStatus
} from "@/features/stocks/lib/trades/stock-trade-types";
import type { StockSnapshotScope } from "@/features/stocks/lib/snapshots/stock-snapshot-types";
import { useToastStore } from "@/stores/ui/use-toast-store";

type TradeSortKey = "latest" | "oldest" | "buy-desc" | "buy-asc" | "profit-desc" | "profit-asc";

type StockTradesTableProps = {
  scopeFilter: StockSnapshotScope;
  onScopeChange: (scope: StockSnapshotScope) => void;
  canManage: boolean;
};

export function StockTradesTable({
  scopeFilter,
  onScopeChange,
  canManage
}: StockTradesTableProps) {
  const tradeEntries = useStockStore((state) => state.tradeEntries);
  const getTradeDraftRowById = useStockStore((state) => state.getTradeDraftRowById);
  const updateTradeEntry = useStockStore((state) => state.updateTradeEntry);
  const refreshTradePrices = useStockStore((state) => state.refreshTradePrices);
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
  const [positionStatus, setPositionStatus] = useState<"전체" | StockTradePositionStatus>("전체");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<TradeSortKey>("latest");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<StockTradeDraftRow | null>(null);
  const [editError, setEditError] = useState<string>();
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState<StockTradeEntry | null>(null);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<string>();
  const [lastFailedSymbols, setLastFailedSymbols] = useState<string[]>([]);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const nextEntries = tradeEntries.filter((entry) => {
      if (getTradeScope(entry.market) !== scopeFilter) {
        return false;
      }

      if (month && getTradeMonthKey(entry.tradedAt) !== month) {
        return false;
      }

      if (accountName !== "전체" && entry.accountName !== accountName) {
        return false;
      }

      if (accountType !== "전체" && entry.accountType !== accountType) {
        return false;
      }

      if (positionStatus !== "전체" && entry.positionStatus !== positionStatus) {
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
        case "buy-desc":
          return getTradeBuyAmountKrw(b) - getTradeBuyAmountKrw(a);
        case "buy-asc":
          return getTradeBuyAmountKrw(a) - getTradeBuyAmountKrw(b);
        case "profit-desc":
          return (getTradeProfitAmountKrw(b) ?? Number.NEGATIVE_INFINITY) -
            (getTradeProfitAmountKrw(a) ?? Number.NEGATIVE_INFINITY);
        case "profit-asc":
          return (getTradeProfitAmountKrw(a) ?? Number.POSITIVE_INFINITY) -
            (getTradeProfitAmountKrw(b) ?? Number.POSITIVE_INFINITY);
        case "latest":
        default:
          return b.tradedAt.localeCompare(a.tradedAt);
      }
    });
  }, [accountName, accountType, month, positionStatus, scopeFilter, search, sortKey, tradeEntries]);

  const activeFilterChips = [
    month || null,
    accountName !== "전체" ? accountName : null,
    accountType !== "전체" ? getTradeAccountTypeLabel(accountType) : null,
    positionStatus !== "전체" ? getTradePositionStatusLabel(positionStatus) : null,
    search.trim() ? `검색: ${search.trim()}` : null
  ].filter(Boolean) as string[];

  const openCount = filteredEntries.filter((entry) => entry.positionStatus === "open").length;
  const closedCount = filteredEntries.filter((entry) => entry.positionStatus === "closed").length;
  const totalBuyAmountKrw = filteredEntries.reduce(
    (sum, entry) => sum + getTradeBuyAmountKrw(entry),
    0
  );
  const totalProfitAmountKrw = filteredEntries.reduce(
    (sum, entry) => sum + (getTradeProfitAmountKrw(entry) ?? 0),
    0
  );
  const totalProfitRate =
    totalBuyAmountKrw > 0 ? (totalProfitAmountKrw / totalBuyAmountKrw) * 100 : undefined;

  const resetFilters = () => {
    setMonth("");
    setAccountName("전체");
    setAccountType("전체");
    setPositionStatus("전체");
    setSearch("");
    setSortKey("latest");
    setIsAdvancedOpen(false);
  };

  const updateEditingField = <K extends keyof StockTradeDraftRow>(
    key: K,
    value: StockTradeDraftRow[K]
  ) => {
    setEditingRow((current) => {
      if (!current) {
        return current;
      }

      if (key === "market") {
        return {
          ...current,
          market: value as StockTradeDraftRow["market"]
        };
      }

      if (key === "positionStatus") {
        return {
          ...current,
          positionStatus: value as StockTradeDraftRow["positionStatus"],
          currentPrice: value === "open" ? current.currentPrice : "",
          soldAt: value === "closed" ? current.soldAt : "",
          sellPrice: value === "closed" ? current.sellPrice : ""
        };
      }

      return { ...current, [key]: value };
    });
  };

  const openEditModal = (entryId: string) => {
    if (!canManage) {
      return;
    }

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
    if (!canManage || !editingRow) {
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

  const handleRefreshPrices = async () => {
    if (!canManage) {
      return;
    }

    const openEntries = tradeEntries.filter(
      (entry) =>
        entry.positionStatus === "open" && (entry.market === "KR" || entry.market === "US" || entry.market === "ETF")
    );

    if (openEntries.length === 0) {
      showToast({
        title: "갱신할 보유 포지션이 없습니다.",
        variant: "error"
      });
      return;
    }

    setIsRefreshingPrices(true);

    try {
      const response = await fetch("/api/stocks/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          entries: openEntries.map((entry) => ({
            id: entry.id,
            ticker: entry.ticker,
            market: entry.market
          }))
        })
      });

      const payload = (await response.json()) as {
        quotes?: Array<{ id: string; currentPrice: number }>;
        failures?: Array<{ id: string; symbol: string }>;
        message?: string;
      };

      if (!response.ok) {
        showToast({
          title: payload.message ?? "현재가를 갱신하지 못했습니다.",
          variant: "error"
        });
        return;
      }

      const updatedAt = new Date().toISOString();
      const quotes: Array<{ id: string; currentPrice: number }> = payload.quotes ?? [];
      const failures = payload.failures ?? [];

      refreshTradePrices(
        quotes.map((quote) => ({
          id: quote.id,
          currentPrice: quote.currentPrice,
          updatedAt
        }))
      );
      setLastRefreshAt(updatedAt);
      setLastFailedSymbols(failures.map((failure) => failure.symbol));

      showToast({
        title:
          quotes.length > 0
            ? `${quotes.length}개 포지션의 현재가를 갱신했습니다.`
            : "조회 가능한 현재가가 없었습니다.",
        variant: quotes.length > 0 ? "success" : "error"
      });
    } catch {
      showToast({
        title: "현재가 조회 중 오류가 발생했습니다.",
        variant: "error"
      });
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  return (
    <section className="grid gap-6">
      <div className="w-full rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { value: "KR", label: "한국시장" },
            { value: "US", label: "미국시장" }
          ].map((option) => {
            const isActive = scopeFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onScopeChange(option.value as StockSnapshotScope)}
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
                <option value="latest">최신 등록순</option>
                <option value="oldest">오래된 등록순</option>
                <option value="buy-desc">매수금액 큰 순</option>
                <option value="buy-asc">매수금액 작은 순</option>
                <option value="profit-desc">손익 큰 순</option>
                <option value="profit-asc">손익 작은 순</option>
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
              <span className="text-sm font-semibold text-ink/75">보유 상태</span>
              <select
                value={positionStatus}
                onChange={(event) =>
                  setPositionStatus(
                    event.target.value as "전체" | StockTradePositionStatus
                  )
                }
                className="h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface"
              >
                <option value="전체">전체</option>
                <option value="open">보유중</option>
                <option value="closed">매도완료</option>
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
        <SummaryCard label="전체 / 보유중 / 매도완료" value={`${filteredEntries.length} / ${openCount} / ${closedCount}`} />
        <SummaryCard
          label="총 손익"
          value={`${formatProfitValue(totalProfitAmountKrw)} ${scopeFilter === "US" ? "USD" : "원"}`}
        />
        <SummaryCard label="총 수익률" value={formatTradeRate(totalProfitRate)} />
      </div>

      <div className="w-full rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">포지션 목록</h2>
            {lastRefreshAt ? (
              <p className="mt-2 text-sm text-ink/58">
                마지막 현재가 갱신 {formatRefreshDate(lastRefreshAt)}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canManage ? (
              <button
                type="button"
                onClick={handleRefreshPrices}
                disabled={isRefreshingPrices}
                className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft disabled:cursor-wait disabled:opacity-60"
              >
                {isRefreshingPrices ? "현재가 갱신 중..." : "현재가 갱신"}
              </button>
            ) : null}
            <span className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink/68">
              포지션 {filteredEntries.length}건
            </span>
          </div>
        </div>

        {lastFailedSymbols.length ? (
          <div className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            조회 실패 종목: {lastFailedSymbols.join(", ")}
          </div>
        ) : null}

        <div className="mt-6 hidden overflow-x-auto md:block">
          <table className="w-full divide-y divide-line/10 text-sm">
            <thead>
              <tr className="text-left text-ink/55">
                <th className="px-3 py-3 font-semibold">매수일</th>
                <th className="px-3 py-3 font-semibold">계좌</th>
                <th className="px-3 py-3 font-semibold">종목</th>
                <th className="px-3 py-3 font-semibold">상태</th>
                <th className="px-3 py-3 font-semibold">매수가</th>
                <th className="px-3 py-3 font-semibold">현재가/매도가</th>
                <th className="px-3 py-3 font-semibold">손익</th>
                <th className="px-3 py-3 font-semibold">수익률</th>
                <th className="px-3 py-3 font-semibold">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/10">
              {filteredEntries.map((entry) => {
                const isExpanded = expandedEntryId === entry.id;
                const referencePrice = getTradeReferencePrice(entry);
                const profitAmount = getTradeProfitAmountKrw(entry);
                const profitRate = getTradeProfitRate(entry);

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
                        <StatusBadge status={entry.positionStatus} />
                      </td>
                      <td className="px-3 py-4">{formatTradePrice(entry.buyPrice, entry.market)}</td>
                      <td className="px-3 py-4">
                        {referencePrice ? formatTradePrice(referencePrice, entry.market) : "-"}
                      </td>
                      <td className="px-3 py-4">
                        <ProfitText value={profitAmount} market={entry.market} />
                      </td>
                      <td className="px-3 py-4">
                        <ProfitRateText value={profitRate} />
                      </td>
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
                        <td colSpan={9} className="px-3 pb-4">
                          <div className="rounded-[20px] border border-line/10 bg-paper p-4">
                            <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                              <DetailItem
                                label="계좌 성격"
                                value={getTradeAccountTypeLabel(entry.accountType)}
                              />
                              <DetailItem label="시장" value={entry.market} />
                              <DetailItem
                                label="수량"
                                value={formatTradeCurrency(entry.quantity)}
                              />
                              <DetailItem
                                label="현재가 갱신"
                                value={entry.currentPriceUpdatedAt ? formatRefreshDate(entry.currentPriceUpdatedAt) : "-"}
                              />
                              <DetailItem
                                label="매수금액"
                                value={`${formatTradeCurrency(getTradeBuyAmountKrw(entry))} ${getTradeCurrencyUnit(entry.market)}`}
                              />
                              <DetailItem
                                label="평가금액/매도금액"
                                value={`${formatTradeCurrency(
                                  entry.positionStatus === "closed"
                                    ? getTradeSellAmountKrw(entry)
                                    : getTradeCurrentAmountKrw(entry)
                                )} ${getTradeCurrencyUnit(entry.market)}`}
                              />
                              <DetailItem
                                label="매도일"
                                value={entry.soldAt ?? "-"}
                              />
                              <DetailItem
                                label="수수료"
                                value={entry.fee ? formatTradeCurrency(entry.fee) : "-"}
                              />
                              <DetailItem label="티커" value={entry.ticker} />
                            </div>
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-ink/52">메모</p>
                              <p className="mt-2 text-sm leading-6 text-ink/64">
                                {entry.note ?? "메모가 없습니다."}
                              </p>
                            </div>
                            {canManage ? (
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
                            ) : null}
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
                <StatusBadge status={entry.positionStatus} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <DetailItem label="매수가" value={formatTradePrice(entry.buyPrice, entry.market)} />
                <DetailItem
                  label={entry.positionStatus === "closed" ? "매도가" : "현재가"}
                  value={
                    getTradeReferencePrice(entry)
                      ? formatTradePrice(getTradeReferencePrice(entry)!, entry.market)
                      : "-"
                  }
                />
                <DetailItem
                  label="손익"
                  value={`${formatProfitValue(getTradeProfitAmountKrw(entry))} ${getTradeCurrencyUnit(entry.market)}`}
                />
                <DetailItem
                  label="수익률"
                  value={formatTradeRate(getTradeProfitRate(entry))}
                />
                <DetailItem label="수량" value={formatTradeCurrency(entry.quantity)} />
              </div>

              <div className="mt-4 rounded-[18px] border border-line/10 bg-surface px-4 py-3">
                <p className="text-xs font-semibold text-ink/52">메모</p>
                <p className="mt-2 text-sm leading-6 text-ink/64">
                  {entry.note ?? "메모가 없습니다."}
                </p>
              </div>

              {canManage ? (
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
              ) : null}
            </article>
          ))}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-line/15 bg-paper p-8 text-center">
            <p className="text-lg font-semibold">조건에 맞는 거래가 없습니다.</p>
            <p className="mt-2 text-sm text-ink/60">
              필터를 바꾸거나 새 거래를 등록해보세요.
            </p>
          </div>
        ) : null}
      </div>

      {canManage && editingRow ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/35 px-5 py-6">
          <div className="mx-auto w-full max-w-5xl rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">거래 수정</h2>
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
              <TradeField label="매수일">
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
              <TradeField label="보유 상태">
                <select
                  value={editingRow.positionStatus}
                  onChange={(event) =>
                    updateEditingField(
                      "positionStatus",
                      event.target.value as StockTradeDraftRow["positionStatus"]
                    )
                  }
                  className={editInputClassName}
                >
                  <option value="open">보유중</option>
                  <option value="closed">매도완료</option>
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
              <TradeField label="매수가">
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={editingRow.buyPrice}
                  onChange={(event) => updateEditingField("buyPrice", event.target.value)}
                  className={editInputClassName}
                />
              </TradeField>
              <TradeField label={editingRow.positionStatus === "closed" ? "매도일" : "현재가 기준일"}>
                <input
                  type={editingRow.positionStatus === "closed" ? "date" : "text"}
                  value={
                    editingRow.positionStatus === "closed"
                      ? editingRow.soldAt
                      : "실시간/수동 입력"
                  }
                  onChange={(event) => updateEditingField("soldAt", event.target.value)}
                  className={editInputClassName}
                  disabled={editingRow.positionStatus !== "closed"}
                />
              </TradeField>
              <TradeField label={editingRow.positionStatus === "closed" ? "매도가" : "현재가"}>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={
                    editingRow.positionStatus === "closed"
                      ? editingRow.sellPrice
                      : editingRow.currentPrice
                  }
                  onChange={(event) =>
                    updateEditingField(
                      editingRow.positionStatus === "closed" ? "sellPrice" : "currentPrice",
                      event.target.value
                    )
                  }
                  className={editInputClassName}
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
              <div className="md:col-span-2 xl:col-span-4">
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

      {canManage ? (
        <AlertDialog
          open={Boolean(pendingDeleteEntry)}
          title="거래를 삭제할까요?"
          description={
            pendingDeleteEntry
              ? `${pendingDeleteEntry.tradedAt} ${pendingDeleteEntry.stockName} 기록을 삭제하면 이 브라우저의 로컬 기록에서 사라집니다.`
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
      ) : null}
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

function StatusBadge({ status }: { status: StockTradePositionStatus }) {
  return (
    <span
      className={
        status === "open"
          ? "rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral"
          : "rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink/70"
      }
    >
      {getTradePositionStatusLabel(status)}
    </span>
  );
}

function ProfitText({
  value,
  market
}: {
  value?: number;
  market: StockTradeEntry["market"];
}) {
  const className =
    value === undefined
      ? "text-ink/55"
      : value >= 0
        ? "text-coral"
        : "text-sky-700";

  return (
    <span className={`font-semibold ${className}`}>
      {formatProfitValue(value)} {getTradeCurrencyUnit(market)}
    </span>
  );
}

function ProfitRateText({ value }: { value?: number }) {
  const className =
    value === undefined
      ? "text-ink/55"
      : value >= 0
        ? "text-coral"
        : "text-sky-700";

  return <span className={`font-semibold ${className}`}>{formatTradeRate(value)}</span>;
}

function formatProfitValue(value?: number) {
  if (value === undefined) {
    return "-";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${formatTradeCurrency(value)}`;
}

function formatRefreshDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

const editInputClassName =
  "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral focus:bg-surface";

const editTextareaClassName =
  "min-h-24 rounded-2xl border border-line/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-coral focus:bg-surface";
