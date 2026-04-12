"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";
import { StockSnapshotEditor } from "@/features/stocks/components/snapshots/stock-snapshot-editor";
import {
  createDraftFromLatestSnapshot,
  createDraftFromSourceSnapshot
} from "@/features/stocks/lib/snapshots/stock-snapshot-utils";
import type { StockSnapshotScope } from "@/features/stocks/lib/snapshots/stock-snapshot-types";
import { useStockStore } from "@/features/stocks/store/stock-store";
import { useToastStore } from "@/stores/ui/use-toast-store";

type NewStockSnapshotScreenProps = {
  sourceSnapshotId?: string;
  initialScope?: StockSnapshotScope;
};

export function NewStockSnapshotScreen({
  sourceSnapshotId,
  initialScope = "KR"
}: NewStockSnapshotScreenProps) {
  const router = useRouter();
  const stocks = useStockStore((state) => state.stocks);
  const snapshots = useStockStore((state) => state.snapshots);
  const getSnapshotById = useStockStore((state) => state.getSnapshotById);
  const getSnapshotItems = useStockStore((state) => state.getSnapshotItems);
  const addSnapshot = useStockStore((state) => state.addSnapshot);
  const showToast = useToastStore((state) => state.showToast);
  const latestSnapshot = useMemo(
    () => snapshots.find((snapshot) => snapshot.marketScope === initialScope),
    [initialScope, snapshots]
  );
  const sourceSnapshot = sourceSnapshotId
    ? getSnapshotById(sourceSnapshotId)
    : undefined;

  const initialValues = useMemo(
    () => {
      if (sourceSnapshot) {
        return createDraftFromSourceSnapshot({
          sourceSnapshot,
          items: getSnapshotItems(sourceSnapshot.id),
          stocks,
          marketScope: initialScope
        });
      }

      return createDraftFromLatestSnapshot({
        latestSnapshot,
        items: latestSnapshot ? getSnapshotItems(latestSnapshot.id) : [],
        stocks,
        marketScope: initialScope
      });
    },
    [getSnapshotItems, initialScope, latestSnapshot, sourceSnapshot, stocks]
  );

  const handleSubmit = (values: Parameters<typeof addSnapshot>[0]) => {
    const existingSnapshot = snapshots.find(
      (snapshot) =>
        snapshot.marketScope === values.marketScope &&
        snapshot.weekKey === values.weekKey
    );

    if (existingSnapshot) {
      showToast({
        title: "이미 같은 시장과 주차의 스냅샷이 있습니다.",
        description: "기존 스냅샷으로 이동합니다.",
        variant: "info"
      });
      router.push(`/stocks/snapshots/${existingSnapshot.id}`);
      return;
    }

    const nextSnapshot = addSnapshot(values);

    showToast({
      title: "주간 시총 스냅샷을 저장했습니다.",
      variant: "success"
    });
    router.push(`/stocks/snapshots/${nextSnapshot.id}`);
  };

  const getLatestSnapshotDraft = (marketScope: StockSnapshotScope) => {
    const latestSnapshotByScope = snapshots.find(
      (snapshot) => snapshot.marketScope === marketScope
    );

    if (!latestSnapshotByScope) {
      return undefined;
    }

    return createDraftFromLatestSnapshot({
      latestSnapshot: latestSnapshotByScope,
      items: getSnapshotItems(latestSnapshotByScope.id),
      stocks,
      marketScope
    });
  };

  return (
    <AppShell
      title="새 시총 스냅샷"
      actions={<ListBackAction href={`/stocks/snapshots?scope=${initialScope}`} />}
    >
      <StockSnapshotEditor
        value={initialValues}
        onSubmit={handleSubmit}
        submitLabel="스냅샷 저장"
        getLatestSnapshotDraft={getLatestSnapshotDraft}
      />
    </AppShell>
  );
}
