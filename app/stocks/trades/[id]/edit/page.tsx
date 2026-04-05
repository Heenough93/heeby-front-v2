import { redirect } from "next/navigation";

type EditStockTradeRoutePageProps = {
  params: {
    id: string;
  };
};

export default function EditStockTradeRoutePage({
  params
}: EditStockTradeRoutePageProps) {
  redirect("/stocks/trades");
}
