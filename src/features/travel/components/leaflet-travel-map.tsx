"use client";

import { Fragment, useEffect, useMemo } from "react";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer, Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap
} from "react-leaflet";
import { formatTravelPeriod, sortTravelVisits } from "@/features/travel/lib/travel-map";
import type { TravelVisit } from "@/features/travel/lib/travel-types";

type LeafletTravelMapProps = {
  visits: TravelVisit[];
  compact?: boolean;
};

const WORLD_BOUNDS: L.LatLngBoundsExpression = [
  [-60, -180],
  [85, 180]
];

const routeOptions = {
  color: "#2563eb",
  weight: 4,
  opacity: 0.9,
  lineCap: "round",
  lineJoin: "round"
} satisfies L.PathOptions;

const routeGlowOptions = {
  color: "#93c5fd",
  weight: 10,
  opacity: 0.3,
  lineCap: "round",
  lineJoin: "round"
} satisfies L.PathOptions;

const compactRouteOptions = {
  color: "#2563eb",
  weight: 3,
  opacity: 0.84,
  dashArray: "10 10",
  lineCap: "round",
  lineJoin: "round"
} satisfies L.PathOptions;

const compactRouteGlowOptions = {
  color: "#93c5fd",
  weight: 8,
  opacity: 0.22,
  dashArray: "10 10",
  lineCap: "round",
  lineJoin: "round"
} satisfies L.PathOptions;

const latestVisitIcon = L.divIcon({
  className: "travel-map-latest-icon",
  html: `
    <span class="travel-map-latest-pin">
      <span class="travel-map-latest-core"></span>
    </span>
  `,
  iconSize: [30, 42],
  iconAnchor: [15, 38],
  popupAnchor: [0, -32]
});

export function LeafletTravelMap({
  visits,
  compact = false
}: LeafletTravelMapProps) {
  const sortedVisits = useMemo(() => sortTravelVisits(visits), [visits]);
  const positions = useMemo(
    () => sortedVisits.map((visit) => [visit.latitude, visit.longitude] as L.LatLngTuple),
    [sortedVisits]
  );

  return (
    <MapContainer
      bounds={WORLD_BOUNDS}
      scrollWheelZoom={!compact}
      zoomControl={!compact}
      dragging
      worldCopyJump
      className={compact ? "h-[280px] w-full" : "h-[520px] w-full"}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
      />

      <TravelMapViewport positions={positions} compact={compact} />

      {positions.length > 1 ? (
        <>
          <Polyline
            positions={positions}
            pathOptions={compact ? compactRouteGlowOptions : routeGlowOptions}
          />
          <Polyline
            positions={positions}
            pathOptions={compact ? compactRouteOptions : routeOptions}
          />
        </>
      ) : null}

      {sortedVisits.map((visit, index) => {
        const isLatest = index === sortedVisits.length - 1;
        const isFirst = index === 0;
        const radius = compact ? (isLatest ? 7 : 5) : isLatest ? 9 : isFirst ? 8 : 6;
        const outerRadius = radius + (compact ? 4 : 6);

        return (
          <Fragment key={visit.id}>
            <CircleMarker
              center={[visit.latitude, visit.longitude]}
              radius={outerRadius}
              interactive={false}
              pathOptions={{
                stroke: false,
                fillColor: isLatest ? "#f472b6" : "#60a5fa",
                fillOpacity: isLatest ? 0.24 : 0.18
              }}
            />
            {isLatest ? (
              <Marker
                position={[visit.latitude, visit.longitude]}
                icon={latestVisitIcon}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -28]}
                  className="travel-order-tooltip"
                >
                  {`Stop ${String(index + 1).padStart(2, "0")} · Latest`}
                </Tooltip>
                <Popup className="travel-map-popup" closeButton={false} offset={[0, -20]}>
                  <div className="travel-popup-card">
                    <p className="travel-popup-eyebrow">
                      Stop {String(index + 1).padStart(2, "0")} · Latest
                    </p>
                    <p className="travel-popup-title">
                      {visit.city}, {visit.country}
                    </p>
                    <p className="travel-popup-period">{formatTravelPeriod(visit)}</p>
                    <p className="travel-popup-meta">
                      {visit.latitude.toFixed(2)}, {visit.longitude.toFixed(2)}
                    </p>
                    {visit.note ? (
                      <p className="travel-popup-note">{visit.note}</p>
                    ) : null}
                  </div>
                </Popup>
              </Marker>
            ) : (
              <CircleMarker
                center={[visit.latitude, visit.longitude]}
                radius={radius}
                pathOptions={{
                  color: "#eff6ff",
                  weight: 2.5,
                  fillColor: isFirst ? "#0f766e" : "#2563eb",
                  fillOpacity: 0.95
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -10]}
                  className="travel-order-tooltip"
                >
                  {`Stop ${String(index + 1).padStart(2, "0")}`}
                </Tooltip>
                <Popup className="travel-map-popup" closeButton={false} offset={[0, -10]}>
                  <div className="travel-popup-card">
                    <p className="travel-popup-eyebrow">
                      Stop {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="travel-popup-title">
                      {visit.city}, {visit.country}
                    </p>
                    <p className="travel-popup-period">{formatTravelPeriod(visit)}</p>
                    <p className="travel-popup-meta">
                      {visit.latitude.toFixed(2)}, {visit.longitude.toFixed(2)}
                    </p>
                    {visit.note ? (
                      <p className="travel-popup-note">{visit.note}</p>
                    ) : null}
                  </div>
                </Popup>
              </CircleMarker>
            )}
          </Fragment>
        );
      })}
    </MapContainer>
  );
}

type TravelMapViewportProps = {
  positions: L.LatLngTuple[];
  compact: boolean;
};

function TravelMapViewport({ positions, compact }: TravelMapViewportProps) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      map.fitBounds(WORLD_BOUNDS, {
        padding: [24, 24]
      });
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], compact ? 3 : 4);
      return;
    }

    map.fitBounds(L.latLngBounds(positions), {
      padding: compact ? [24, 24] : [36, 36]
    });
  }, [compact, map, positions]);

  return null;
}
