import type {
  Stock,
  StockSnapshot,
  StockSnapshotItem
} from "@/features/stocks/lib/stock-types";

export const stocks: Stock[] = [
  {
    id: "stock-nvda",
    name: "NVIDIA",
    ticker: "NVDA",
    market: "US",
    sector: "반도체",
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-20T09:00:00.000Z"
  },
  {
    id: "stock-aapl",
    name: "Apple",
    ticker: "AAPL",
    market: "US",
    sector: "플랫폼",
    createdAt: "2026-03-20T09:05:00.000Z",
    updatedAt: "2026-03-20T09:05:00.000Z"
  },
  {
    id: "stock-msft",
    name: "Microsoft",
    ticker: "MSFT",
    market: "US",
    sector: "플랫폼",
    createdAt: "2026-03-20T09:10:00.000Z",
    updatedAt: "2026-03-20T09:10:00.000Z"
  },
  {
    id: "stock-tsla",
    name: "Tesla",
    ticker: "TSLA",
    market: "US",
    sector: "전기차",
    createdAt: "2026-03-20T09:15:00.000Z",
    updatedAt: "2026-03-20T09:15:00.000Z"
  }
];

export const stockSnapshots: StockSnapshot[] = [
  {
    id: "snapshot-2026-w13",
    title: "2026-W13 시총 스냅샷",
    weekKey: "2026-W13",
    comment: "AI 인프라와 플랫폼 대형주를 우선순위로 유지했습니다.",
    createdAt: "2026-03-29T04:00:00.000Z",
    updatedAt: "2026-03-29T04:00:00.000Z"
  },
  {
    id: "snapshot-2026-w14",
    title: "2026-W14 시총 스냅샷",
    weekKey: "2026-W14",
    comment: "반도체 비중을 높이고 자동차는 뒤로 밀었습니다.",
    sourceSnapshotId: "snapshot-2026-w13",
    createdAt: "2026-04-02T04:00:00.000Z",
    updatedAt: "2026-04-02T04:00:00.000Z"
  }
];

export const stockSnapshotItems: StockSnapshotItem[] = [
  {
    id: "snapshot-2026-w13-item-1",
    snapshotId: "snapshot-2026-w13",
    stockId: "stock-aapl",
    rank: 1,
    marketCap: "3.1T",
    price: "$211",
    note: "서비스 매출 방어력.",
    createdAt: "2026-03-29T04:00:00.000Z",
    updatedAt: "2026-03-29T04:00:00.000Z"
  },
  {
    id: "snapshot-2026-w13-item-2",
    snapshotId: "snapshot-2026-w13",
    stockId: "stock-msft",
    rank: 2,
    marketCap: "2.9T",
    price: "$428",
    note: "AI 번들 확장.",
    createdAt: "2026-03-29T04:00:00.000Z",
    updatedAt: "2026-03-29T04:00:00.000Z"
  },
  {
    id: "snapshot-2026-w13-item-3",
    snapshotId: "snapshot-2026-w13",
    stockId: "stock-nvda",
    rank: 3,
    marketCap: "2.7T",
    price: "$944",
    note: "칩 수요 재가속 확인 필요.",
    createdAt: "2026-03-29T04:00:00.000Z",
    updatedAt: "2026-03-29T04:00:00.000Z"
  },
  {
    id: "snapshot-2026-w13-item-4",
    snapshotId: "snapshot-2026-w13",
    stockId: "stock-tsla",
    rank: 4,
    marketCap: "620B",
    price: "$194",
    note: "가격 정책 변수.",
    createdAt: "2026-03-29T04:00:00.000Z",
    updatedAt: "2026-03-29T04:00:00.000Z"
  },
  {
    id: "snapshot-2026-w14-item-1",
    snapshotId: "snapshot-2026-w14",
    stockId: "stock-nvda",
    rank: 1,
    marketCap: "2.8T",
    price: "$973",
    note: "AI 서버 수요가 다시 핵심 테마로 보임.",
    createdAt: "2026-04-02T04:00:00.000Z",
    updatedAt: "2026-04-02T04:00:00.000Z"
  },
  {
    id: "snapshot-2026-w14-item-2",
    snapshotId: "snapshot-2026-w14",
    stockId: "stock-aapl",
    rank: 2,
    marketCap: "3.0T",
    price: "$207",
    note: "방어력은 유지되지만 순위는 한 칸 하향.",
    createdAt: "2026-04-02T04:00:00.000Z",
    updatedAt: "2026-04-02T04:00:00.000Z"
  },
  {
    id: "snapshot-2026-w14-item-3",
    snapshotId: "snapshot-2026-w14",
    stockId: "stock-msft",
    rank: 3,
    marketCap: "2.9T",
    price: "$425",
    note: "플랫폼 축은 유지.",
    createdAt: "2026-04-02T04:00:00.000Z",
    updatedAt: "2026-04-02T04:00:00.000Z"
  }
];
