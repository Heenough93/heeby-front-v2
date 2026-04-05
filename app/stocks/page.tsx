import { redirect } from "next/navigation";

export default function StocksRoutePage() {
  redirect("/stocks/snapshots?scope=KR");
}
