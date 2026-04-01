import { EditTravelTripScreen } from "@/features/travel/components/edit-travel-trip-screen";

type EditTravelTripRoutePageProps = {
  params: {
    id: string;
  };
};

export default function EditTravelTripRoutePage({
  params
}: EditTravelTripRoutePageProps) {
  return <EditTravelTripScreen tripId={params.id} />;
}
