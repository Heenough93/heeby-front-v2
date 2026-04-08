"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout/app-shell";
import { ListBackAction } from "@/shared/components/layout/list-back-action";
import { AssetSnapshotEditor } from "@/features/assets/components/snapshots/asset-snapshot-editor";
import {
  createDraftFromLatestAssetSnapshot,
  createDraftFromSourceAssetSnapshot
} from "@/features/assets/lib/asset-snapshot-utils";
import { useAssetStore } from "@/features/assets/store/asset-store";
import { useToastStore } from "@/stores/ui/use-toast-store";

type NewAssetSnapshotScreenProps = {
  sourceSnapshotId?: string;
};

export function NewAssetSnapshotScreen({
  sourceSnapshotId
}: NewAssetSnapshotScreenProps) {
  const router = useRouter();
  const snapshots = useAssetStore((state) => state.snapshots);
  const getSnapshotById = useAssetStore((state) => state.getSnapshotById);
  const getSnapshotItems = useAssetStore((state) => state.getSnapshotItems);
  const addSnapshot = useAssetStore((state) => state.addSnapshot);
  const showToast = useToastStore((state) => state.showToast);
  const latestSnapshot = useAssetStore((state) => state.getLatestSnapshot());
  const sourceSnapshot = sourceSnapshotId
    ? getSnapshotById(sourceSnapshotId)
    : undefined;

  const initialValues = useMemo(() => {
    if (sourceSnapshot) {
      return createDraftFromSourceAssetSnapshot({
        sourceSnapshot,
        items: getSnapshotItems(sourceSnapshot.id)
      });
    }

    return createDraftFromLatestAssetSnapshot({
      latestSnapshot,
      items: latestSnapshot ? getSnapshotItems(latestSnapshot.id) : []
    });
  }, [getSnapshotItems, latestSnapshot, snapshots, sourceSnapshot]);

  const handleSubmit = (values: Parameters<typeof addSnapshot>[0]) => {
    const nextSnapshot = addSnapshot(values);

    showToast({
      title: "자산 스냅샷을 저장했습니다.",
      variant: "success"
    });
    router.push(`/assets/snapshots/${nextSnapshot.id}`);
  };

  return (
    <AppShell
      title="새 자산 스냅샷"
      actions={<ListBackAction href="/assets/snapshots" />}
    >
      <AssetSnapshotEditor
        value={initialValues}
        onSubmit={handleSubmit}
        submitLabel="스냅샷 저장"
      />
    </AppShell>
  );
}
