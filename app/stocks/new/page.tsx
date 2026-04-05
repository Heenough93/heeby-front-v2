import { redirect } from "next/navigation";

type LegacyStockNewRoutePageProps = {
  searchParams?: {
    sourceId?: string;
    scope?: string;
  };
};

export default function LegacyStockNewRoutePage({
  searchParams
}: LegacyStockNewRoutePageProps) {
  const params = new URLSearchParams();

  if (searchParams?.sourceId) {
    params.set("sourceId", searchParams.sourceId);
  }

  if (searchParams?.scope) {
    params.set("scope", searchParams.scope);
  }

  redirect(`/stocks/snapshots/new${params.toString() ? `?${params.toString()}` : ""}`);
}
