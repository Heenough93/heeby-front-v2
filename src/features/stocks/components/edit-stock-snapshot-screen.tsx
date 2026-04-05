"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";
import { StockSnapshotEditor } from "@/features/stocks/components/stock-snapshot-editor";
import { createDraftFromSnapshot } from "@/features/stocks/lib/stock-snapshot-utils";
import { useStockStore } from "@/features/stocks/store/stock-store";
import { useToastStore } from "@/stores/ui/use-toast-store";

type EditStockSnapshotScreenProps = {
  snapshotId: string;
};

export function EditStockSnapshotScreen({
  snapshotId
}: EditStockSnapshotScreenProps) {
  const router = useRouter();
  const stocks = useStockStore((state) => state.stocks);
  const getSnapshotById = useStockStore((state) => state.getSnapshotById);
  const getSnapshotItems = useStockStore((state) => state.getSnapshotItems);
  const updateSnapshot = useStockStore((state) => state.updateSnapshot);
  const showToast = useToastStore((state) => state.showToast);
  const snapshot = getSnapshotById(snapshotId);

  const initialValues = useMemo(() => {
    if (!snapshot) {
      return undefined;
    }

    return createDraftFromSnapshot({
      snapshot,
      items: getSnapshotItems(snapshot.id),
      stocks
    });
  }, [getSnapshotItems, snapshot, stocks]);

  if (!snapshot || !initialValues) {
    return (
      <AppShell
        title="스냅샷을 찾을 수 없습니다."
        description="잘못된 경로이거나 이미 삭제된 스냅샷입니다."
      >
        <div className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
          <p className="text-lg font-semibold">편집할 스냅샷이 없습니다.</p>
        </div>
      </AppShell>
    );
  }

  const handleSubmit = (values: Parameters<typeof updateSnapshot>[1]) => {
    const nextSnapshot = updateSnapshot(snapshotId, values);

    if (!nextSnapshot) {
      return;
    }

    showToast({
      title: "스냅샷을 수정했습니다.",
      variant: "success"
    });
    router.push(`/stocks/snapshots/${nextSnapshot.id}`);
  };

  return (
    <AppShell
      title="시총 스냅샷 수정"
      description="저장된 주차 기록을 다시 열어 순위, 종목, 메모를 조정합니다."
      actions={<ListBackAction href={`/stocks/snapshots?scope=${snapshot.marketScope}`} />}
    >
      <StockSnapshotEditor
        value={initialValues}
        onSubmit={handleSubmit}
        submitLabel="수정 저장"
      />
    </AppShell>
  );
}
