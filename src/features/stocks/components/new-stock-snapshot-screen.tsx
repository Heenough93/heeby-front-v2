"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { StockSnapshotEditor } from "@/features/stocks/components/stock-snapshot-editor";
import {
  createDraftFromLatestSnapshot,
  createDraftFromSourceSnapshot
} from "@/features/stocks/lib/stock-snapshot-utils";
import { useStockStore } from "@/features/stocks/store/stock-store";
import { useToastStore } from "@/stores/ui/use-toast-store";

type NewStockSnapshotScreenProps = {
  sourceSnapshotId?: string;
};

export function NewStockSnapshotScreen({
  sourceSnapshotId
}: NewStockSnapshotScreenProps) {
  const router = useRouter();
  const stocks = useStockStore((state) => state.stocks);
  const getLatestSnapshot = useStockStore((state) => state.getLatestSnapshot);
  const getSnapshotById = useStockStore((state) => state.getSnapshotById);
  const getSnapshotItems = useStockStore((state) => state.getSnapshotItems);
  const addSnapshot = useStockStore((state) => state.addSnapshot);
  const showToast = useToastStore((state) => state.showToast);
  const latestSnapshot = getLatestSnapshot();
  const sourceSnapshot = sourceSnapshotId
    ? getSnapshotById(sourceSnapshotId)
    : undefined;

  const initialValues = useMemo(
    () => {
      if (sourceSnapshot) {
        return createDraftFromSourceSnapshot({
          sourceSnapshot,
          items: getSnapshotItems(sourceSnapshot.id),
          stocks
        });
      }

      return createDraftFromLatestSnapshot({
        latestSnapshot,
        items: latestSnapshot ? getSnapshotItems(latestSnapshot.id) : [],
        stocks
      });
    },
    [getSnapshotById, getSnapshotItems, latestSnapshot, sourceSnapshot, stocks]
  );

  const handleSubmit = (values: Parameters<typeof addSnapshot>[0]) => {
    const nextSnapshot = addSnapshot(values);

    showToast({
      title: "주간 시총 스냅샷을 저장했습니다.",
      variant: "success"
    });
    router.push(`/stocks/${nextSnapshot.id}`);
  };

  return (
    <AppShell
      title="새 시총 스냅샷"
      description={
        sourceSnapshot
          ? `${sourceSnapshot.weekKey} 스냅샷을 복사한 뒤, 이번 주 순위를 다시 정리하고 한 줄 총평을 남깁니다.`
          : "기본값으로 지난 스냅샷을 불러온 뒤, 이번 주 순서를 다시 정리하고 한 줄 총평을 남깁니다."
      }
    >
      <StockSnapshotEditor
        value={initialValues}
        onSubmit={handleSubmit}
        submitLabel="스냅샷 저장"
      />
    </AppShell>
  );
}
