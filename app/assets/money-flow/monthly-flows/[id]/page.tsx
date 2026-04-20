import { MoneyFlowMonthlyFlowDetail } from "@/features/assets/components/money-flow/money-flow-monthly-flow-detail";

type MoneyFlowMonthlyFlowDetailRoutePageProps = {
  params: {
    id: string;
  };
};

export default function MoneyFlowMonthlyFlowDetailRoutePage({
  params
}: MoneyFlowMonthlyFlowDetailRoutePageProps) {
  return <MoneyFlowMonthlyFlowDetail snapshotId={params.id} />;
}
