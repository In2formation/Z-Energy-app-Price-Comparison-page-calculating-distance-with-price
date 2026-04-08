export const DEFAULT_STATION = {
  name: "Z Hutt Rd",
  address: "453 Hutt Road, Lower Hutt 5010",
  phone: "04-5697582",
  coordinates: { lat: -41.2998, lng: 174.8714 },
  fuelPrices: {},
  amenities: [
    "Shop",
    "Toilets",
    "Car Wash",
    "Air Stop",
    "Pre-order Coffee",
    "Z2Go",
    "Trailer Hire",
    "Pay in App",
    "LPG SwapnGo",
    "Compostable Cups",
    "24/7 Pay at Pump",
    "Z Espresso Coffee & Fresh Food",
  ],
  openingHours: {
    monday: "5:00am - 11:59pm",
    tuesday: "5:00am - 11:59pm",
    wednesday: "5:00am - 11:59pm",
    thursday: "5:00am - 11:59pm",
    friday: "5:00am - 11:59pm",
    saturday: "6:00am - 11:59pm",
    sunday: "6:00am - 11:59pm",
  },
};

export const FALLBACK_FUEL_PRICES = [
  { label: "91 Unleaded", price: "$2.059" },
  { label: "95 Unleaded", price: "$2.189" },
  { label: "Diesel", price: "$1.899" },
];

const FUEL_LABELS = [
  { label: "91 Unleaded", key: "Regular Unleaded (91)" },
  { label: "95 Unleaded", key: "Premium Unleaded (95/98)" },
  { label: "Diesel", key: "Diesel" },
];

// Bug fix: timeout prevents loadStation from hanging indefinitely if the API is unresponsive
const FETCH_TIMEOUT_MS = 8000;

function trimTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getGetDirectionsEndpoints() {
  const apiRoot = trimTrailingSlash(
    import.meta.env.VITE_GET_DIRECTIONS_API_URL || import.meta.env.VITE_API_URL || "",
  );

  const stationsEndpoint =
    import.meta.env.VITE_GET_DIRECTIONS_STATIONS_ENDPOINT ||
    (apiRoot ? `${apiRoot}/stations` : "");

  return {
    stations: stationsEndpoint,
    stationById: (stationId) => `${stationsEndpoint}/${encodeURIComponent(stationId)}`,
  };
}

export function toDisplayStation(station) {
  if (!station) return DEFAULT_STATION;

  return {
    name: station.name || DEFAULT_STATION.name,
    address: station.location?.address ?? station.address ?? DEFAULT_STATION.address,
    phone: station.phone || DEFAULT_STATION.phone,
    coordinates: {
      // Bug fix: use ?? instead of || so a valid coordinate of 0 is not treated as falsy
      lat:
        station.location?.coordinates?.lat ??
        station.coordinates?.lat ??
        DEFAULT_STATION.coordinates.lat,
      lng:
        station.location?.coordinates?.lng ??
        station.coordinates?.lng ??
        DEFAULT_STATION.coordinates.lng,
    },
    fuelPrices: station.fuelPrices || {},
    amenities: station.amenities || [],
    openingHours: station.openingHours || {},
  };
}

export function buildFuelPriceCards(station) {
  if (!station?.fuelPrices || Object.keys(station.fuelPrices).length === 0) {
    return FALLBACK_FUEL_PRICES;
  }

  return FUEL_LABELS.map(({ label, key }) => {
    const rawPrice = station.fuelPrices[key];
    return {
      label,
      price: typeof rawPrice === "number" ? `$${rawPrice.toFixed(3)}` : "N/A",
    };
  });
}

export function getSelectionKeys(locationLike) {
  const params = new URLSearchParams(locationLike?.search || "");
  const stationFromState = locationLike?.state?.station;

  const stationId =
    locationLike?.state?.stationId ||
    stationFromState?._id ||
    params.get("stationId") ||
    sessionStorage.getItem("selectedStationId");

  const stationName =
    locationLike?.state?.stationName ||
    stationFromState?.name ||
    params.get("stationName") ||
    sessionStorage.getItem("selectedStationName");

  return { stationFromState, stationId, stationName };
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function resolveSelectedStation(locationLike) {
  const result = await resolveSelectedStationWithSource(locationLike);
  return result.station;
}

export async function resolveSelectedStationWithSource(locationLike) {
  const { stationFromState, stationId, stationName } = getSelectionKeys(locationLike);
  const endpoints = getGetDirectionsEndpoints();

  if (!stationId && !stationName && !stationFromState) {
    if (endpoints.stations) {
      try {
        const all = await fetchJson(endpoints.stations);
        const found = all.find(
          (s) => s?.name?.toLowerCase().trim() === DEFAULT_STATION.name.toLowerCase().trim(),
        );
        if (found) {
          return { station: toDisplayStation(found), source: "api" };
        }
      } catch {
        // fall through to hardcoded fallback
      }
    }
    return { station: DEFAULT_STATION, source: "fallback" };
  }

  if (stationFromState?.name && stationFromState?.location?.coordinates?.lat) {
    const mapped = toDisplayStation(stationFromState);
    sessionStorage.setItem("selectedStationName", mapped.name);
    return { station: mapped, source: "navigation" };
  }

  try {
    if (!endpoints.stations) {
      return { station: DEFAULT_STATION, source: "fallback" };
    }

    let station = null;

    if (stationId) {
      station = await fetchJson(endpoints.stationById(stationId));
    } else if (stationName) {
      const stations = await fetchJson(endpoints.stations);
      station =
        stations.find(
          (item) => item?.name?.toLowerCase().trim() === stationName.toLowerCase().trim(),
        ) || null;
    }

    if (!station) {
      return { station: DEFAULT_STATION, source: "fallback" };
    }

    const mapped = toDisplayStation(station);

    if (station?._id) {
      sessionStorage.setItem("selectedStationId", station._id);
    }
    if (mapped.name) {
      sessionStorage.setItem("selectedStationName", mapped.name);
    }

    return { station: mapped, source: "api" };
  } catch {
    return { station: DEFAULT_STATION, source: "fallback" };
  }
}
