"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";
import {
  formatAssetAmount,
  getAssetSnapshotCategoryBreakdown,
  getAssetSnapshotTotalAmount
} from "@/features/assets/lib/asset-snapshot-utils";
import { useAssetStore } from "@/features/assets/store/asset-store";

type AssetChartRow = {
  monthKey: string;
  total: number;
  cash: number;
  invest: number;
  retirement: number;
};

type AssetPeriodFilter = "3m" | "6m" | "12m" | "all";

function getChartWidth(length: number) {
  return Math.max(720, 140 + length * 120);
}

function shouldFillChartWidth(length: number) {
  return length <= 6;
}

function buildLinePoints(values: number[], width: number, height: number, padding: number) {
  const maxValue = Math.max(...values, 1);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return values
    .map((value, index) => {
      const x = padding + (values.length === 1 ? innerWidth / 2 : (innerWidth / (values.length - 1)) * index);
      const y = padding + innerHeight - (value / maxValue) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

function TotalAssetLineChart({ rows }: { rows: AssetChartRow[] }) {
  const fillWidth = shouldFillChartWidth(rows.length);
  const width = fillWidth ? 920 : getChartWidth(rows.length);
  const height = 280;
  const padding = 28;
  const values = rows.map((row) => row.total);
  const maxValue = Math.max(...values, 1);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const points = buildLinePoints(values, width, height, padding);

  return (
    <div
      className="mt-6 rounded-[22px] border border-line/10 bg-paper p-4"
      style={fillWidth ? undefined : { width: `${width}px` }}
    >
      <div className="h-[320px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + innerHeight - innerHeight * ratio;
            const value = Math.round(maxValue * ratio);

            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-ink/45 text-[11px]"
                >
                  {value.toLocaleString("ko-KR")}
                </text>
              </g>
            );
          })}

          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-coral"
            points={points}
          />

          {rows.map((row, index) => {
            const x =
              padding + (rows.length === 1 ? innerWidth / 2 : (innerWidth / (rows.length - 1)) * index);
            const y = padding + innerHeight - (row.total / maxValue) * innerHeight;

            return (
              <g key={row.monthKey}>
                <circle cx={x} cy={y} r="6" className="fill-coral stroke-paper" strokeWidth="3" />
                <text x={x} y={height - 6} textAnchor="middle" className="fill-ink/58 text-[11px]">
                  {row.monthKey}
                </text>
                <text x={x} y={y - 14} textAnchor="middle" className="fill-ink/68 text-[11px]">
                  {Math.round(row.total).toLocaleString("ko-KR")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function CategoryBarChart({ rows }: { rows: AssetChartRow[] }) {
  const fillWidth = shouldFillChartWidth(rows.length);
  const width = fillWidth ? 920 : getChartWidth(rows.length);
  const height = 320;
  const padding = 28;
  const barWidth = 24;
  const groupWidth = barWidth * 3 + 12;
  const maxValue = Math.max(
    ...rows.flatMap((row) => [row.cash, row.invest, row.retirement]),
    1
  );
  const innerHeight = height - padding * 2;
  const innerWidth = width - padding * 2;
  const slotWidth = rows.length > 0 ? innerWidth / rows.length : innerWidth;

  return (
    <div
      className="mt-6 rounded-[22px] border border-line/10 bg-paper p-4"
      style={fillWidth ? undefined : { width: `${width}px` }}
    >
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-2 text-ink/70">
          <span className="h-3 w-3 rounded-full bg-coral" />
          현금
        </span>
        <span className="inline-flex items-center gap-2 text-ink/70">
          <span className="h-3 w-3 rounded-full bg-sky-500" />
          투자
        </span>
        <span className="inline-flex items-center gap-2 text-ink/70">
          <span className="h-3 w-3 rounded-full bg-sand" />
          노후
        </span>
      </div>

      <div className="mt-4 h-[340px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + innerHeight - innerHeight * ratio;
            const value = Math.round(maxValue * ratio);

            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-ink/45 text-[11px]"
                >
                  {value.toLocaleString("ko-KR")}
                </text>
              </g>
            );
          })}

          {rows.map((row, index) => {
            const slotStart = padding + slotWidth * index;
            const baseX = slotStart + Math.max((slotWidth - groupWidth) / 2, 0);
            const bars = [
              { key: "cash", value: row.cash, className: "fill-coral" },
              { key: "invest", value: row.invest, className: "fill-sky-500" },
              { key: "retirement", value: row.retirement, className: "fill-sand" }
            ];

            return (
              <g key={row.monthKey}>
                {bars.map((bar, barIndex) => {
                  const barHeight = (bar.value / maxValue) * innerHeight;
                  const x = baseX + barIndex * (barWidth + 6);
                  const y = padding + innerHeight - barHeight;

                  return (
                    <g key={bar.key}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(barHeight, 4)}
                        rx="8"
                        className={bar.className}
                      />
                    </g>
                  );
                })}

                <text
                  x={slotStart + slotWidth / 2}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-ink/58 text-[11px]"
                >
                  {row.monthKey}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function AssetChangeBarChart({ rows }: { rows: AssetChartRow[] }) {
  const fillWidth = shouldFillChartWidth(rows.length);
  const width = fillWidth ? 920 : getChartWidth(rows.length);
  const height = 340;
  const padding = 28;
  const zeroLine = height / 2;
  const barWidth = 20;
  const groupWidth = barWidth * 3 + 12;

  const changeRows = rows.map((row, index) => {
    const previousRow = rows[index - 1];

    return {
      monthKey: row.monthKey,
      cash: previousRow ? row.cash - previousRow.cash : 0,
      invest: previousRow ? row.invest - previousRow.invest : 0,
      retirement: previousRow ? row.retirement - previousRow.retirement : 0
    };
  });

  const maxAbsValue = Math.max(
    ...changeRows.flatMap((row) => [Math.abs(row.cash), Math.abs(row.invest), Math.abs(row.retirement)]),
    1
  );
  const chartHeight = height / 2 - padding - 16;
  const innerWidth = width - padding * 2;
  const slotWidth = changeRows.length > 0 ? innerWidth / changeRows.length : innerWidth;

  return (
    <div
      className="mt-6 rounded-[22px] border border-line/10 bg-paper p-4"
      style={fillWidth ? undefined : { width: `${width}px` }}
    >
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-2 text-ink/70">
          <span className="h-3 w-3 rounded-full bg-coral" />
          현금
        </span>
        <span className="inline-flex items-center gap-2 text-ink/70">
          <span className="h-3 w-3 rounded-full bg-sky-500" />
          투자
        </span>
        <span className="inline-flex items-center gap-2 text-ink/70">
          <span className="h-3 w-3 rounded-full bg-sand" />
          노후
        </span>
      </div>

      <div className="mt-4 h-[360px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
          {[1, 0.5, 0, -0.5, -1].map((ratio) => {
            const y = zeroLine - chartHeight * ratio;
            const value = Math.round(maxAbsValue * ratio);

            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={ratio === 0 ? "0.18" : "0.1"}
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-ink/45 text-[11px]"
                >
                  {value.toLocaleString("ko-KR")}
                </text>
              </g>
            );
          })}

          {changeRows.map((row, index) => {
            const slotStart = padding + slotWidth * index;
            const baseX = slotStart + Math.max((slotWidth - groupWidth) / 2, 0);
            const bars = [
              { key: "cash", value: row.cash, className: "fill-coral" },
              { key: "invest", value: row.invest, className: "fill-sky-500" },
              { key: "retirement", value: row.retirement, className: "fill-sand" }
            ];

            return (
              <g key={row.monthKey}>
                {bars.map((bar, barIndex) => {
                  const barHeight = (Math.abs(bar.value) / maxAbsValue) * chartHeight;
                  const x = baseX + barIndex * (barWidth + 6);
                  const y = bar.value >= 0 ? zeroLine - barHeight : zeroLine;

                  return (
                    <rect
                      key={bar.key}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 4)}
                      rx="8"
                      className={bar.className}
                    />
                  );
                })}

                <text
                  x={slotStart + slotWidth / 2}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-ink/58 text-[11px]"
                >
                  {row.monthKey}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function AssetChartsEmptyState() {
  return (
    <section className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
      <p className="text-sm font-semibold text-coral">자산 차트</p>
      <h2 className="mt-3 text-2xl font-bold">아직 차트를 만들 자산기록이 없습니다.</h2>
      <p className="mt-3 text-sm leading-6 text-ink/62">
        월별 자산 스냅샷을 먼저 저장하면 총자산, 현금, 투자, 노후 흐름을 차트로 확인할 수 있습니다.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/assets/snapshots"
          className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
        >
          자산기록 목록
        </Link>
        <Link
          href="/assets/snapshots/new"
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          새 스냅샷 만들기
        </Link>
      </div>
    </section>
  );
}

function AssetChartsSingleSnapshotNotice({ row }: { row: AssetChartRow }) {
  return (
    <section className="rounded-[28px] border border-amber-200 bg-amber-50/80 p-6 shadow-card">
      <p className="text-sm font-semibold text-amber-800">비교 데이터 준비 중</p>
      <h2 className="mt-2 text-2xl font-bold">추이는 다음 스냅샷부터 비교됩니다.</h2>
      <p className="mt-2 text-sm leading-6 text-ink/68">
        현재 {row.monthKey} 자산기록 1개만 있어 총자산과 카테고리 구성은 볼 수 있지만, 월별 증감은 아직 의미 있게 계산하기 어렵습니다.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/assets/snapshots/new"
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          다음 스냅샷 만들기
        </Link>
        <Link
          href="/assets/snapshots"
          className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
        >
          자산기록 목록
        </Link>
      </div>
    </section>
  );
}

export function AssetChartsScreen() {
  const snapshots = useAssetStore((state) => state.snapshots);
  const getSnapshotItems = useAssetStore((state) => state.getSnapshotItems);
  const [periodFilter, setPeriodFilter] = useState<AssetPeriodFilter>("6m");

  const chartRows = useMemo(
    () =>
      snapshots
        .slice()
        .reverse()
        .map((snapshot) => {
          const items = getSnapshotItems(snapshot.id);
          const breakdown = getAssetSnapshotCategoryBreakdown(items);

          return {
            monthKey: snapshot.monthKey,
            total: getAssetSnapshotTotalAmount(items),
            cash: breakdown.yumja.cash + breakdown.heeby.cash,
            invest: breakdown.yumja.invest + breakdown.heeby.invest,
            retirement: breakdown.yumja.retirement + breakdown.heeby.retirement
          };
        }),
    [getSnapshotItems, snapshots]
  );

  const filteredRows = useMemo(() => {
    if (periodFilter === "all") {
      return chartRows;
    }

    const limit = periodFilter === "3m" ? 3 : periodFilter === "6m" ? 6 : 12;
    return chartRows.slice(-limit);
  }, [chartRows, periodFilter]);

  const periodOptions: { value: AssetPeriodFilter; label: string }[] = [
    { value: "3m", label: "3개월" },
    { value: "6m", label: "6개월" },
    { value: "12m", label: "12개월" },
    { value: "all", label: "전체" }
  ];

  if (chartRows.length === 0) {
    return (
      <AppShell title="자산 차트" actions={<ListBackAction href="/assets/snapshots" />}>
        <AssetChartsEmptyState />
      </AppShell>
    );
  }

  return (
    <AppShell title="자산 차트" actions={<ListBackAction href="/assets/snapshots" />}>
      <section className="grid min-w-0 gap-6">
        <div className="flex flex-wrap items-center gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriodFilter(option.value)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                periodFilter === option.value
                  ? "border-coral bg-coral text-white"
                  : "border-line/10 bg-surface text-ink/68 hover:border-coral/30 hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="min-w-0 rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
          <h2 className="text-2xl font-bold">월별 자산 요약</h2>
          <div className="mt-6 min-w-0 overflow-x-auto rounded-[22px] border-2 border-line/30 bg-paper shadow-card">
            <table
              className="w-full border-collapse table-fixed text-sm"
              style={
                shouldFillChartWidth(filteredRows.length)
                  ? undefined
                  : { width: `${120 + filteredRows.length * 160}px` }
              }
            >
              <thead className="bg-surface text-ink/62">
                <tr>
                  <th
                    className="whitespace-nowrap border-b-2 border-r border-line/25 px-4 py-2.5 text-center text-[13px] font-medium leading-none"
                    style={{ width: "120px" }}
                  >
                    구분
                  </th>
                  {filteredRows.map((row) => (
                    <th
                      key={row.monthKey}
                      className="whitespace-nowrap border-b-2 border-line/25 px-4 py-2.5 text-center text-[13px] font-medium leading-none"
                      style={{ width: "160px" }}
                    >
                      {row.monthKey}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "총", getValue: (row: AssetChartRow) => row.total, strong: true },
                  { label: "현금", getValue: (row: AssetChartRow) => row.cash },
                  { label: "투자", getValue: (row: AssetChartRow) => row.invest },
                  { label: "노후", getValue: (row: AssetChartRow) => row.retirement }
                ].map((summaryRow) => (
                  <tr key={summaryRow.label} className="odd:bg-paper even:bg-surface/35">
                    <th className="whitespace-nowrap border-r border-t border-line/25 px-4 py-2.5 text-center text-[13px] font-semibold leading-none text-ink">
                      {summaryRow.label}
                    </th>
                    {filteredRows.map((row) => (
                      <td
                        key={`${summaryRow.label}-${row.monthKey}`}
                        className={`whitespace-nowrap border-l border-t border-line/25 px-4 py-2.5 text-right text-[13px] leading-none ${
                          summaryRow.strong ? "font-semibold text-ink" : "text-ink/72"
                        }`}
                      >
                        {formatAssetAmount(summaryRow.getValue(row))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0 rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
          <h2 className="text-2xl font-bold">월별 총 자산</h2>
          <div className="min-w-0 overflow-x-auto">
            <TotalAssetLineChart rows={filteredRows} />
          </div>
        </div>

        <div className="min-w-0 rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
          <h2 className="text-2xl font-bold">월별 현금 · 투자 · 노후</h2>
          <div className="min-w-0 overflow-x-auto">
            <CategoryBarChart rows={filteredRows} />
          </div>
        </div>

        <div className="min-w-0 rounded-[28px] border border-line/10 bg-surface p-6 shadow-card">
          <h2 className="text-2xl font-bold">월별 현금 · 투자 · 노후 증감</h2>
          {filteredRows.length < 2 ? (
            <div className="mt-6">
              <AssetChartsSingleSnapshotNotice row={filteredRows[0] ?? chartRows[0]} />
            </div>
          ) : (
            <div className="min-w-0 overflow-x-auto">
              <AssetChangeBarChart rows={filteredRows} />
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
