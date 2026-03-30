export type TravelSearchCandidate = {
  placeId: number;
  displayName: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

type NominatimSearchItem = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

function getCityLabel(address?: NominatimSearchItem["address"]) {
  return (
    address?.city ??
    address?.town ??
    address?.village ??
    address?.municipality ??
    address?.county ??
    address?.state ??
    ""
  );
}

export function mapNominatimItemToCandidate(
  item: NominatimSearchItem
): TravelSearchCandidate | null {
  const latitude = Number(item.lat);
  const longitude = Number(item.lon);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  const city = getCityLabel(item.address);
  const country = item.address?.country ?? "";

  if (!city || !country) {
    return null;
  }

  return {
    placeId: item.place_id,
    displayName: item.display_name,
    city,
    country,
    latitude,
    longitude
  };
}
