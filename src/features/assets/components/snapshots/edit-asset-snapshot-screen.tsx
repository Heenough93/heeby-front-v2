"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";
import { AssetSnapshotEditor } from "@/features/assets/components/snapshots/asset-snapshot-editor";
import { createDraftFromAssetSnapshot } from "@/features/assets/lib/asset-snapshot-utils";
import { useAssetStore } from "@/features/assets/store/asset-store";
import { useToastStore } from "@/stores/ui/use-toast-store";

type EditAssetSnapshotScreenProps = {
  snapshotId: string;
};

export function EditAssetSnapshotScreen({
  snapshotId
}: EditAssetSnapshotScreenProps) {
  const router = useRouter();
  const getSnapshotById = useAssetStore((state) => state.getSnapshotById);
  const getSnapshotItems = useAssetStore((state) => state.getSnapshotItems);
  const updateSnapshot = useAssetStore((state) => state.updateSnapshot);
  const showToast = useToastStore((state) => state.showToast);
  const snapshot = getSnapshotById(snapshotId);

  const initialValues = useMemo(() => {
    if (!snapshot) {
      return undefined;
    }

    return createDraftFromAssetSnapshot({
      snapshot,
      items: getSnapshotItems(snapshot.id)
    });
  }, [getSnapshotItems, snapshot]);

  if (!snapshot || !initialValues) {
    return (
      <AppShell title="스냅샷을 찾을 수 없습니다.">
        <div className="rounded-[28px] border border-dashed border-line/15 bg-surface p-10 text-center shadow-card">
          <p className="text-lg font-semibold">편집할 자산 스냅샷이 없습니다.</p>
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
      title: "자산 스냅샷을 수정했습니다.",
      variant: "success"
    });
    router.push(`/assets/snapshots/${nextSnapshot.id}`);
  };

  return (
    <AppShell title="자산 스냅샷 수정" actions={<ListBackAction href="/assets/snapshots" />}>
      <AssetSnapshotEditor
        value={initialValues}
        onSubmit={handleSubmit}
        submitLabel="수정 저장"
      />
    </AppShell>
  );
}
