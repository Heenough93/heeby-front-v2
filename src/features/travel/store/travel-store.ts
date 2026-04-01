"use client";

import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { canReadTravelTrip } from "@/features/access/lib/access-policy";
import type { AccessMode } from "@/features/access/store/access-store";
import { travelTrips as initialTravelTrips } from "@/mocks/travel-trips";
import { travelVisits as initialTravelVisits } from "@/mocks/travel-visits";
import type { TravelTripFormValues } from "@/features/travel/lib/travel-trip-schema";
import type { TravelVisitFormValues } from "@/features/travel/lib/travel-visit-schema";
import type { TravelTrip, TravelVisit } from "@/features/travel/lib/travel-types";

const legacyTripId = "trip-imported-legacy";

function createLegacyTrip(now: string): TravelTrip {
  return {
    id: legacyTripId,
    name: "기존 여행 기록",
    visibility: "private",
    note: "Trip 구조 도입 전 로컬에 저장된 방문지를 한데 묶은 여행.",
    createdAt: now,
    updatedAt: now
  };
}

type TravelStore = {
  trips: TravelTrip[];
  visits: TravelVisit[];
  addTrip: (values: TravelTripFormValues) => TravelTrip;
  updateTrip: (id: string, values: TravelTripFormValues) => TravelTrip | undefined;
  getReadableTrips: (accessMode: AccessMode) => TravelTrip[];
  getTripById: (id: string) => TravelTrip | undefined;
  getReadableTripById: (id: string, accessMode: AccessMode) => TravelTrip | undefined;
  getVisitsByTripId: (tripId: string) => TravelVisit[];
  removeTrip: (id: string) => void;
  addVisit: (tripId: string, values: TravelVisitFormValues) => TravelVisit;
  updateVisit: (
    id: string,
    values: TravelVisitFormValues
  ) => TravelVisit | undefined;
  removeVisit: (id: string) => void;
  resetVisits: () => void;
};

export const useTravelStore = create<TravelStore>()(
  persist(
    (set, get) => ({
      trips: initialTravelTrips,
      visits: initialTravelVisits,
      addTrip: (values) => {
        const now = dayjs().toISOString();
        const nextTrip: TravelTrip = {
          id: nanoid(),
          name: values.name.trim(),
          visibility: values.visibility,
          note: values.note?.trim() || undefined,
          createdAt: now,
          updatedAt: now
        };

        set((state) => ({
          trips: [nextTrip, ...state.trips]
        }));

        return nextTrip;
      },
      updateTrip: (id, values) => {
        const currentTrip = get().trips.find((trip) => trip.id === id);

        if (!currentTrip) {
          return undefined;
        }

        const nextTrip: TravelTrip = {
          ...currentTrip,
          name: values.name.trim(),
          visibility: values.visibility,
          note: values.note?.trim() || undefined,
          updatedAt: dayjs().toISOString()
        };

        set((state) => ({
          trips: state.trips.map((trip) => (trip.id === id ? nextTrip : trip))
        }));

        return nextTrip;
      },
      getReadableTrips: (accessMode) =>
        get().trips.filter((trip) => canReadTravelTrip(accessMode, trip.visibility)),
      getTripById: (id) => get().trips.find((trip) => trip.id === id),
      getReadableTripById: (id, accessMode) => {
        const trip = get().trips.find((item) => item.id === id);

        if (!trip || !canReadTravelTrip(accessMode, trip.visibility)) {
          return undefined;
        }

        return trip;
      },
      getVisitsByTripId: (tripId) => get().visits.filter((visit) => visit.tripId === tripId),
      removeTrip: (id) =>
        set((state) => ({
          trips: state.trips.filter((trip) => trip.id !== id),
          visits: state.visits.filter((visit) => visit.tripId !== id)
        })),
      addVisit: (tripId, values) => {
        const now = dayjs().toISOString();
        const nextVisit: TravelVisit = {
          id: nanoid(),
          tripId,
          city: values.city.trim(),
          country: values.country.trim(),
          latitude: values.latitude,
          longitude: values.longitude,
          startedAt: values.startedAt,
          endedAt: values.endedAt?.trim() || undefined,
          note: values.note?.trim() || undefined,
          createdAt: now,
          updatedAt: now
        };

        set((state) => ({
          visits: [...state.visits, nextVisit]
        }));

        return nextVisit;
      },
      updateVisit: (id, values) => {
        const currentVisit = get().visits.find((visit) => visit.id === id);

        if (!currentVisit) {
          return undefined;
        }

        const nextVisit: TravelVisit = {
          ...currentVisit,
          city: values.city.trim(),
          country: values.country.trim(),
          latitude: values.latitude,
          longitude: values.longitude,
          startedAt: values.startedAt,
          endedAt: values.endedAt?.trim() || undefined,
          note: values.note?.trim() || undefined,
          updatedAt: dayjs().toISOString()
        };

        set((state) => ({
          visits: state.visits.map((visit) => (visit.id === id ? nextVisit : visit))
        }));

        return nextVisit;
      },
      removeVisit: (id) =>
        set((state) => ({
          visits: state.visits.filter((visit) => visit.id !== id)
        })),
      resetVisits: () =>
        set({
          trips: initialTravelTrips,
          visits: initialTravelVisits
        })
    }),
    {
      name: "heeby-travel-store",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<TravelStore> | undefined;

        if (!state?.visits) {
          return persistedState as TravelStore;
        }

        if (state.trips?.length) {
          return {
            ...state,
            visits: state.visits.map((visit) => ({
              ...visit,
              tripId: visit.tripId ?? legacyTripId
            }))
          } satisfies Partial<TravelStore>;
        }

        const now = dayjs().toISOString();

        return {
          ...state,
          trips: [createLegacyTrip(now)],
          visits: state.visits.map((visit) => ({
            ...visit,
            tripId: visit.tripId ?? legacyTripId
          }))
        } satisfies Partial<TravelStore>;
      },
      storage: createJSONStorage(() => localStorage)
    }
  )
);
