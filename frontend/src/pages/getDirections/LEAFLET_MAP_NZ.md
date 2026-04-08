# How the GetDirections Leaflet Map Was Built (NZ Only)

This document explains how the interactive map in `GetDirections.jsx` was set up to stay locked to New Zealand, display custom markers, draw a driving route, and auto-fit the view.

---

## Packages used

```bash
npm install leaflet react-leaflet
```

Also import the Leaflet CSS — without this the map tiles and controls won't render correctly:

```js
import "leaflet/dist/leaflet.css";
```

---

## Step 1 — Define New Zealand bounds

The entire NZ restriction is built around one constant. These are the lat/lng corners of a bounding box that covers both the North and South Islands:

```js
const NZ_BOUNDS = [
  [-48.0, 165.0],  // South-West corner
  [-33.0, 180.0],  // North-East corner
];
```

And a helper to check whether any coordinate actually falls inside NZ (used to validate station coords, user location, and route points before rendering them):

```js
function isInNZ(lat, lng) {
  return lat >= -48.0 && lat <= -33.0 && lng >= 165.0 && lng <= 180.0;
}
```

---

## Step 2 — Set up the MapContainer

`MapContainer` is the root Leaflet component. These are the key props that lock it to NZ:

```jsx
<MapContainer
  center={stationCoords}      // initial centre point [lat, lng]
  zoom={15}                   // initial zoom level
  zoomSnap={0.1}              // allows fractional zoom steps
  zoomDelta={0.1}             // scroll wheel zoom increment
  minZoom={6}                 // prevents zooming out past all of NZ
  maxBounds={NZ_BOUNDS}       // hard boundary — user cannot pan outside NZ
  maxBoundsViscosity={1.0}    // 1.0 = solid wall, map bounces back instantly
  style={{ width: "100%", height: "100%" }}
>
```

| Prop | Purpose |
|------|---------|
| `maxBounds` | Defines the pannable area. The user physically cannot drag the map outside these coordinates. |
| `maxBoundsViscosity` | Controls how "sticky" the boundary is. `1.0` means a hard stop — the map won't drift past the edge at all. |
| `minZoom` | Prevents the user from zooming out so far that NZ becomes a tiny dot. |
| `zoomSnap` / `zoomDelta` | Fine-grained zoom control for a smoother feel. |

---

## Step 3 — Restrict the tile layer to NZ

The `TileLayer` loads the map imagery (OpenStreetMap tiles). Two props stop tiles loading outside NZ:

```jsx
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  noWrap           // prevents the world map from repeating horizontally
  bounds={NZ_BOUNDS}  // only loads tiles within the NZ bounding box
/>
```

---

## Step 4 — Create custom markers

Leaflet's default markers require a PNG file that often breaks with bundlers like Vite. Instead, `L.divIcon()` creates markers from plain HTML/CSS — no image files needed.

These are defined **once at module level** (outside the component) so they're not recreated on every render:

```js
// Orange "Z" marker for the station
const stationIcon = L.divIcon({
  html: '<div style="background:#f36f21;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">Z</div>',
  className: "z-station-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 16],   // centre of the circle sits on the coordinate
  popupAnchor: [0, -16],  // popup appears above the marker
});

// Blue dot for the user's location
const userIcon = L.divIcon({
  html: '<div style="background:#1a2f99;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.28);"></div>',
  className: "user-location-marker",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});
```

Use them on a `Marker` like this:

```jsx
<Marker position={[lat, lng]} icon={stationIcon}>
  <Popup>Station name</Popup>
</Marker>
```

---

## Step 5 — Auto-fit the view with FitRouteBounds

`MapContainer` renders the map once but doesn't re-centre when data changes. To update the view reactively, use the `useMap()` hook inside a **child component**:

```jsx
function FitRouteBounds({ destinationCoords, routeCoords, userCoords }) {
  const map = useMap(); // gets access to the Leaflet map instance

  useEffect(() => {
    if (!map) return;

    // Priority 1: a route exists — fit the whole route in view
    if (routeCoords.length > 1) {
      map.fitBounds(routeCoords, { padding: [40, 40], maxZoom: 15 });
      return;
    }

    // Priority 2: user location known — fit both user and station in view
    if (userCoords) {
      const bounds = L.latLngBounds([
        [userCoords.lat, userCoords.lng],
        [destinationCoords.lat, destinationCoords.lng],
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      return;
    }

    // Priority 3: station has valid NZ coordinates — zoom to station
    if (isInNZ(destinationCoords.lat, destinationCoords.lng)) {
      map.setView([destinationCoords.lat, destinationCoords.lng], 15);
      return;
    }

    // Fallback: show all of NZ
    map.fitBounds(NZ_BOUNDS, { padding: [20, 20], maxZoom: 7 });
  }, [map, destinationCoords, routeCoords, userCoords]);

  return null; // renders nothing, just controls the map
}
```

Place it **inside** `MapContainer` so `useMap()` has access to the map context:

```jsx
<MapContainer ...>
  <FitRouteBounds
    destinationCoords={...}
    routeCoords={safeRouteCoords}
    userCoords={safeUserCoords}
  />
  ...
</MapContainer>
```

> **Why a separate component?** `useMap()` can only be called inside a child of `MapContainer`. It cannot be called in the same component that renders `MapContainer`.

---

## Step 6 — Draw the driving route

The route between the user and the station is fetched from OSRM (Open Source Routing Machine), a free public routing API. The result is drawn as an orange polyline on the map.

**Fetch the route:**

```js
const url = `https://router.project-osrm.org/route/v1/driving/
  ${userCoords.lng},${userCoords.lat};
  ${station.coordinates.lng},${station.coordinates.lat}
  ?overview=full&geometries=geojson`;

const data = await fetch(url).then(r => r.json());

// OSRM returns [lng, lat] — Leaflet needs [lat, lng], so swap them
const coords = data?.routes?.[0]?.geometry?.coordinates
  ?.map(([lng, lat]) => [lat, lng]) || [];
```

> Note: OSRM gives coordinates as `[longitude, latitude]` but Leaflet expects `[latitude, longitude]` — the `.map(([lng, lat]) => [lat, lng])` swap is essential.

**Draw it on the map:**

```jsx
{safeRouteCoords.length > 1 && (
  <Polyline
    positions={safeRouteCoords}
    pathOptions={{ color: "#f36f21", weight: 5 }}
  />
)}
```

An `AbortController` is used so the fetch cancels cleanly if the component re-renders before the response arrives:

```js
const controller = new AbortController();
const response = await fetch(url, { signal: controller.signal });

// cleanup:
return () => controller.abort();
```

---

## Step 7 — Validate all coordinates before rendering

Any coordinate from the API, the user's browser, or the route could potentially be outside NZ (bad data, GPS error, etc.). Everything is filtered through `isInNZ()` before it touches the map:

```js
// Station — fall back to DEFAULT_STATION coords if invalid
const hasValidStationCoords = isInNZ(station.coordinates.lat, station.coordinates.lng);
const stationCoords = hasValidStationCoords
  ? [station.coordinates.lat, station.coordinates.lng]
  : [DEFAULT_STATION.coordinates.lat, DEFAULT_STATION.coordinates.lng];

// User location — null if outside NZ
const safeUserCoords =
  userCoords && isInNZ(userCoords.lat, userCoords.lng) ? userCoords : null;

// Route — filter out any points outside NZ
const safeRouteCoords = routeCoords.filter(([lat, lng]) => isInNZ(lat, lng));
```

---

## Summary

| Technique | What it does |
|-----------|-------------|
| `maxBounds` + `maxBoundsViscosity: 1.0` | Hard-locks panning to NZ |
| `minZoom: 6` | Prevents zooming out past NZ |
| `TileLayer noWrap` + `bounds` | Only loads NZ map tiles |
| `isInNZ()` guard | Validates all coordinates before rendering |
| `L.divIcon()` | Custom HTML markers, no broken PNG imports |
| `FitRouteBounds` + `useMap()` | Reactively re-fits the view as data changes |
| OSRM API | Free routing, coordinates swapped lng/lat → lat/lng for Leaflet |
| `AbortController` | Cancels in-flight route fetches on re-render |
