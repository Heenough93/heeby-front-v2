import { EditStockTradeScreen } from "@/features/stocks/components/edit-stock-trade-screen";

type EditStockTradeRoutePageProps = {
  params: {
    id: string;
  };
};

export default function EditStockTradeRoutePage({
  params
}: EditStockTradeRoutePageProps) {
  return <EditStockTradeScreen tradeId={params.id} />;
}
