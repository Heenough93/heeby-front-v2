import type {
  AssetSnapshot,
  AssetSnapshotItem
} from "@/features/assets/lib/asset-snapshot-types";

const monthRows = [
  {
    monthKey: "2025-01",
    memo: "연초 기준으로 현금 여력을 먼저 정리했습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 3100000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 11900000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 5600000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 1750000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 7100000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 4800000]
    ]
  },
  {
    monthKey: "2025-02",
    memo: "예적금과 연금 중심으로 조금씩 늘렸습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 3050000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 12150000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 5650000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 1800000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 7250000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 4850000]
    ]
  },
  {
    monthKey: "2025-03",
    memo: "주식 비중이 조금 올라가고 현금은 비슷하게 유지했습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 3000000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 12400000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 5700000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 1820000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 7350000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 4900000]
    ]
  },
  {
    monthKey: "2025-04",
    memo: "생활 현금은 줄고 투자 비중이 올라간 달입니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2920000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 12700000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 5750000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 1860000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 7480000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 4950000]
    ]
  },
  {
    monthKey: "2025-05",
    memo: "노후 자금은 유지하고 현금 계좌를 조금 더 늘렸습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2960000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 12950000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 5820000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 1920000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 7600000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5000000]
    ]
  },
  {
    monthKey: "2025-06",
    memo: "중간 점검 기준으로 전체 자산이 완만하게 늘었습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2890000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 13100000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 5880000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 1970000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 7740000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5070000]
    ]
  },
  {
    monthKey: "2025-07",
    memo: "휴가 비용을 반영해 현금은 줄고 투자 비중은 유지했습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2760000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 13300000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 5940000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 1890000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 7880000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5130000]
    ]
  },
  {
    monthKey: "2025-08",
    memo: "현금은 회복되고 증권 계좌도 조금 늘었습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2810000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 13550000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 6010000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 1960000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 8020000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5200000]
    ]
  },
  {
    monthKey: "2025-09",
    memo: "현금과 투자 비중을 같이 챙긴 달입니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2850000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 13750000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 6070000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 2010000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 8150000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5260000]
    ]
  },
  {
    monthKey: "2025-10",
    memo: "생활 계좌를 보강하고 노후 자금도 추가 적립했습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2900000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 13900000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 6120000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 2050000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 8200000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5310000]
    ]
  },
  {
    monthKey: "2025-11",
    memo: "여윳돈 계좌를 따로 두기 시작했습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2860000],
      ["yumja", "deposit", "토스뱅크", "여윳돈", "cash", 900000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 13980000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 6160000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 2080000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 8210000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5350000]
    ]
  },
  {
    monthKey: "2025-12",
    memo: "연말 기준으로 여윳돈과 노후 자금을 다시 점검했습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2790000],
      ["yumja", "deposit", "토스뱅크", "여윳돈", "cash", 1250000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 14050000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 6190000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 2120000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 8240000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5380000]
    ]
  },
  {
    monthKey: "2026-01",
    memo: "연초 기준으로 가용 현금을 늘리고 포지션을 유지했습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2910000],
      ["yumja", "deposit", "토스뱅크", "여윳돈", "cash", 1480000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 14100000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 6200000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 2140000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 8260000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5400000]
    ]
  },
  {
    monthKey: "2026-02",
    memo: "현금 여력을 조금 줄이고 투자 비중을 유지했습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2860000],
      ["yumja", "deposit", "토스뱅크", "여윳돈", "cash", 1600000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 14150000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 6200000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 2145000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 8270000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5420000]
    ]
  },
  {
    monthKey: "2026-03",
    memo: "월말 정리 기준으로 현금 비중을 다시 확인했습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2800000],
      ["yumja", "securities", "키움증권", "미국주식", "invest", 14200000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 6200000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 2100000],
      ["heeby", "securities", "미래에셋증권", "국내주식", "invest", 8300000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5400000]
    ]
  },
  {
    monthKey: "2026-04",
    memo: "생활 현금은 줄고 투자 비중이 조금 올라갔습니다.",
    items: [
      ["yumja", "deposit", "카카오뱅크", "생활비", "cash", 2550000],
      ["yumja", "deposit", "토스뱅크", "여윳돈", "cash", 1800000],
      ["yumja", "insurance", "미래에셋생명", "연금저축", "retirement", 6350000],
      ["heeby", "deposit", "토스뱅크", "비상금", "cash", 2250000],
      ["heeby", "deposit", "신한은행", "생활예비비", "cash", 950000],
      ["heeby", "insurance", "삼성생명", "개인연금", "retirement", 5500000]
    ]
  }
] as const;

type ItemSeed = readonly [
  ownerScope: AssetSnapshotItem["ownerScope"],
  majorType: AssetSnapshotItem["majorType"],
  institution: string,
  label: string,
  category: AssetSnapshotItem["category"],
  amount: number
];

function getSnapshotTimestamp(monthKey: string) {
  return `${monthKey}-01T12:00:00.000Z`;
}

export const assetSnapshots: AssetSnapshot[] = monthRows.map((row, index) => ({
  id: `asset-snapshot-${row.monthKey}`,
  title: `${row.monthKey} 자산 스냅샷`,
  monthKey: row.monthKey,
  memo: row.memo,
  sourceSnapshotId: index > 0 ? `asset-snapshot-${monthRows[index - 1].monthKey}` : undefined,
  createdAt: getSnapshotTimestamp(row.monthKey),
  updatedAt: getSnapshotTimestamp(row.monthKey)
}));

export const assetSnapshotItems: AssetSnapshotItem[] = monthRows.flatMap((row) =>
  row.items.map((item, index) => {
    const [ownerScope, majorType, institution, label, category, amount] = item as ItemSeed;

    return {
      id: `asset-${row.monthKey}-${ownerScope}-${index + 1}`,
      snapshotId: `asset-snapshot-${row.monthKey}`,
      ownerScope,
      majorType,
      institution,
      label,
      category,
      amount,
      createdAt: getSnapshotTimestamp(row.monthKey),
      updatedAt: getSnapshotTimestamp(row.monthKey)
    };
  })
);
