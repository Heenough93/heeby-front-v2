import type { ContentVisibility } from "@/types/domain";

export type TravelTrip = {
  id: string;
  name: string;
  visibility: ContentVisibility;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type TravelVisit = {
  id: string;
  tripId: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  startedAt: string;
  endedAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};
