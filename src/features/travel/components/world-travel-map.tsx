"use client";

import dynamic from "next/dynamic";
import type { TravelVisit } from "@/features/travel/lib/travel-types";
import { cn } from "@/lib/utils";

type WorldTravelMapProps = {
  visits: TravelVisit[];
  className?: string;
  compact?: boolean;
};

const LeafletTravelMap = dynamic(
  () =>
    import("@/features/travel/components/leaflet-travel-map").then((module) => ({
      default: module.LeafletTravelMap
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(241,245,249,0.96))] text-sm text-ink/55">
        지도를 불러오는 중...
      </div>
    )
  }
);

export function WorldTravelMap({
  visits,
  className,
  compact = false
}: WorldTravelMapProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[28px] border border-line/10 shadow-card",
        className
      )}
    >
      <LeafletTravelMap visits={visits} compact={compact} />
    </div>
  );
}
