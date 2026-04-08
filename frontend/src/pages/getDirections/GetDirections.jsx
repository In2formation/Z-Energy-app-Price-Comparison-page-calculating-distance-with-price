import { useEffect, useMemo, useState } from "react";
import {
  FaArrowUpRightFromSquare,
  FaChevronDown,
  FaChevronLeft,
} from "react-icons/fa6";
import { FaDirections } from "react-icons/fa";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./GetDirections.module.css";
import MainFooter from "../../common/MainFooter";
import Button from "../../common/Button";
import zLogo from "../../assets/Z Energy NZ_logo1.png";
import AIChatbot from "../../common/AIChatbot";
import {
  DEFAULT_STATION,
  buildFuelPriceCards,
  resolveSelectedStationWithSource,
} from "./helpers/getDirectionsHelpers";
import "leaflet/dist/leaflet.css";

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function formatOpeningHours(hoursObj) {
  if (!hoursObj || Object.keys(hoursObj).length === 0) return [];
  return DAY_ORDER
    .filter((day) => hoursObj[day])
    .map((day) => [day.charAt(0).toUpperCase() + day.slice(1), hoursObj[day]]);
}

const promoCards = [
  {
    title: "Pay in App",
    copy: "The easy, secure way to fuel up and go. No cash or cards to hand over.",
    action: "Learn more",
  },
  {
    title: "Trailer Hire",
    copy: "We've got the top-quality Hireace trailers to move your things from A to B.",
    action: "Learn more",
  },
  {
    title: "Pre-order Coffee",
    copy: "Pre-order and pre-pay in your Z App using your debit or credit card.",
    action: "See how",
  },
];

const NZ_BOUNDS = [
  [-48.0, 165.0],
  [-33.0, 180.0],
];

function isInNZ(lat, lng) {
  return lat >= -48.0 && lat <= -33.0 && lng >= 165.0 && lng <= 180.0;
}

// Bug fix: sanitise label before injecting into Leaflet innerHTML to prevent XSS
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const stationIcon = L.divIcon({
  html: '<div style="background:#f36f21;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">Z</div>',
  className: "z-station-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function createUserIcon(label) {
  return L.divIcon({
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="position:absolute;bottom:45px;background-color:rgba(255,165,0,0.7);color:white;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;pointer-events:none;z-index:1000;">${escapeHtml(label)}</div>
        <div style="background-color:#f36f21;color:white;border-radius:50%;width:35px;height:35px;font-size:20px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;z-index:999;">📍</div>
      </div>
    `,
    className: "",
    iconSize: [40, 60],
    iconAnchor: [20, 60],
    popupAnchor: [0, -60],
  });
}

// Bug fix: accept primitives (destinationLat/Lng) instead of an object so the useEffect
// dependency array compares by value — an inline object would cause the effect to re-fire
// on every render and continuously re-fit the map bounds.
function FitRouteBounds({ destinationLat, destinationLng, routeCoords, userCoords }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (routeCoords.length > 1) {
      map.fitBounds(routeCoords, { padding: [40, 40], maxZoom: 15 });
      return;
    }

    if (userCoords) {
      const bounds = L.latLngBounds([
        [userCoords.lat, userCoords.lng],
        [destinationLat, destinationLng],
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      return;
    }

    if (isInNZ(destinationLat, destinationLng)) {
      map.setView([destinationLat, destinationLng], 15);
      return;
    }

    map.fitBounds(NZ_BOUNDS, { padding: [20, 20], maxZoom: 7 });
  }, [map, destinationLat, destinationLng, routeCoords, userCoords]);

  return null;
}

function MapViewContainer({ station, userCoords, routeCoords, userLocationLabel }) {
  const hasValidStationCoords = isInNZ(station.coordinates.lat, station.coordinates.lng);
  const stationCoords = hasValidStationCoords
    ? [station.coordinates.lat, station.coordinates.lng]
    : [DEFAULT_STATION.coordinates.lat, DEFAULT_STATION.coordinates.lng];
  const safeUserCoords =
    userCoords && isInNZ(userCoords.lat, userCoords.lng) ? userCoords : null;
  const safeRouteCoords = routeCoords.filter(([lat, lng]) => isInNZ(lat, lng));

  // Bug fix: memoize so the icon object is stable between renders — avoids marker flicker
  const userIcon = useMemo(() => createUserIcon(userLocationLabel), [userLocationLabel]);

  return (
    <MapContainer
      center={stationCoords}
      zoom={15}
      zoomSnap={0.1}
      zoomDelta={0.1}
      minZoom={6}
      maxBounds={NZ_BOUNDS}
      maxBoundsViscosity={1.0}
      className={styles.mapContainer}
      style={{ width: "100%", height: "100%" }}
    >
      <FitRouteBounds
        destinationLat={stationCoords[0]}
        destinationLng={stationCoords[1]}
        routeCoords={safeRouteCoords}
        userCoords={safeUserCoords}
      />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap
        bounds={NZ_BOUNDS}
      />

      {safeRouteCoords.length > 1 && (
        <Polyline positions={safeRouteCoords} pathOptions={{ color: "#f36f21", weight: 5 }} />
      )}

      {safeUserCoords && (
        <Marker position={[safeUserCoords.lat, safeUserCoords.lng]} icon={userIcon}>
          <Popup>{userLocationLabel}</Popup>
        </Marker>
      )}

      <Marker position={stationCoords} icon={stationIcon}>
        <Popup>
          <strong>{station.name}</strong>
          <br />
          {station.address}
          <br />
          {station.phone}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

function GetDirections() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showHours, setShowHours] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [userLocationLabel, setUserLocationLabel] = useState("You are here");
  const [geoError, setGeoError] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [selectedStation, setSelectedStation] = useState(DEFAULT_STATION);
  const [dataSourceStatus, setDataSourceStatus] = useState("fallback");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadStation = async () => {
      try {
        const result = await resolveSelectedStationWithSource(location);
        if (!isCancelled) {
          setSelectedStation(result.station);
          setDataSourceStatus(result.source);
          setIsLoading(false);
        }
      } catch {
        if (!isCancelled) {
          setSelectedStation(DEFAULT_STATION);
          setDataSourceStatus("fallback");
          setIsLoading(false);
        }
      }
    };

    loadStation();

    return () => {
      isCancelled = true;
    };
  }, [location]);

  useEffect(() => {
    let cancelled = false;
    // Bug fix: AbortController lets us cancel the Nominatim fetch if the component unmounts,
    // preventing a state update on an unmounted component
    const nominatimController = new AbortController();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        if (!cancelled) setUserCoords({ lat, lng });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { signal: nominatimController.signal, headers: { "Accept-Language": "en" } },
          );
          if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
          const data = await res.json();
          // Bug fix: use optional chaining — data.address may be undefined on error responses
          const addr = data.address;
          const label =
            addr?.road
              ? `${addr.road}${addr.house_number ? " " + addr.house_number : ""}${addr.suburb ? ", " + addr.suburb : ""}`
              : data.display_name?.split(",")[0] ?? "Your location";
          if (!cancelled) setUserLocationLabel(label);
        } catch (err) {
          if (err.name === "AbortError") return;
          // keep default label on any other error
        }
      },
      () => {
        // Bug fix: surface geolocation failure to the user instead of silently doing nothing
        if (!cancelled) {
          setUserCoords(null);
          setGeoError(true);
        }
      },
    );

    return () => {
      cancelled = true;
      nominatimController.abort();
    };
  }, []);

  useEffect(() => {
    if (!userCoords) {
      setRouteCoords([]);
      return;
    }

    const controller = new AbortController();

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${userCoords.lng},${userCoords.lat};${selectedStation.coordinates.lng},${selectedStation.coordinates.lat}?overview=full&geometries=geojson`;
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();
        const coords =
          data?.routes?.[0]?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];
        setRouteCoords(coords);
      } catch (err) {
        // Bug fix: don't treat a cancelled fetch as a real error
        if (err.name !== "AbortError") {
          setRouteCoords([]);
        }
      }
    };

    fetchRoute();

    return () => controller.abort();
  }, [userCoords, selectedStation.coordinates.lat, selectedStation.coordinates.lng]);

  const fuelPriceCards = buildFuelPriceCards(selectedStation);
  const openingHoursRows = formatOpeningHours(selectedStation.openingHours);

  const handleOpenDirections = () => {
    const base = "https://www.google.com/maps/dir/?api=1";
    const destination = `${selectedStation.coordinates.lat},${selectedStation.coordinates.lng}`;
    const origin = userCoords ? `&origin=${userCoords.lat},${userCoords.lng}` : "";

    window.open(`${base}${origin}&destination=${destination}`, "_blank", "noopener,noreferrer");
  };

  const handleBackToFindStation = () => {
    // Bug fix: window.history.length > 1 is always true in any real browser session.
    // location.key is "default" only when the page was loaded directly (not via navigation).
    if (location.key !== "default") {
      navigate(-1);
      return;
    }
    navigate("/find-a-station");
  };

  return (
    <>
      <section className={styles.page}>
        <div className={styles.contentWrap}>
{dataSourceStatus === "fallback" && !isLoading && (
          <p className={styles.fallbackWarning}>
            Could not load live station data — showing default station.
          </p>
        )}

        <section className={styles.stationCard}>
          <header className={styles.stationHeader}>
            <div className={styles.stationHeaderInner}>
              <div>
                <h1>{isLoading ? "Loading…" : selectedStation.name}</h1>
                <p className={styles.stationHeaderAddress}>{selectedStation.address}</p>
              </div>
              <button
                type="button"
                className={styles.headerDirectionsBtn}
                onClick={handleOpenDirections}
                aria-label="Get directions"
              >
                <FaDirections />
              </button>
            </div>
          </header>

          <div className={styles.heroLayout}>
            <div className={styles.infoPanel}>
              <button type="button" className={styles.backLink} onClick={handleBackToFindStation}>
                <FaChevronLeft />
                Back to find station
              </button>

              <div className={styles.panelBlock}>
                <h2>Fuel Prices</h2>
                <div className={styles.priceGrid}>
                  {fuelPriceCards.map((fuel) => (
                    <article key={fuel.label} className={styles.priceCard}>
                      <span>{fuel.label}</span>
                      <strong>{fuel.price}</strong>
                    </article>
                  ))}
                </div>
              </div>

              <div className={styles.desktopDetails}>
                <h3>{selectedStation.address}</h3>
                <div className={styles.ctaWrapper}>
                  <Button
                    text="Get directions"
                    variant="primary"
                    size="medium"
                    icon="getDirections"
                    onClick={handleOpenDirections}
                  />
                </div>

                {geoError && (
                  <p className={styles.geoErrorNote}>
                    Location access denied — route and distance unavailable.
                  </p>
                )}

                <div className={styles.hoursList}>
                  {openingHoursRows.length > 0 ? (
                    openingHoursRows.map(([day, hours]) => (
                      <div key={day} className={styles.hoursRow}>
                        <span>{day}</span>
                        <span>{hours}</span>
                      </div>
                    ))
                  ) : (
                    <p>Hours not available</p>
                  )}
                </div>

                <a href={`tel:${selectedStation.phone.replace(/[^\d+]/g, "")}`} className={styles.phoneLink}>
                  {selectedStation.phone}
                </a>
              </div>
            </div>

            <div className={styles.mapPanel}>
              <MapViewContainer
                station={selectedStation}
                userCoords={userCoords}
                routeCoords={routeCoords}
                userLocationLabel={userLocationLabel}
              />
              <span className={styles.mapDataBadge}>
                {dataSourceStatus === "api" && "Live Data"}
                {dataSourceStatus === "navigation" && "Selected Station"}
                {dataSourceStatus === "fallback" && "Default Data"}
              </span>
            </div>
          </div>

          <div className={styles.mobileSummary}>
            {geoError && (
              <p className={styles.geoErrorNote}>
                Location access denied — route and distance unavailable.
              </p>
            )}

            <div className={styles.panelBlock}>
              <h2>Fuel Prices</h2>
              <div className={styles.priceGrid}>
                {fuelPriceCards.map((fuel) => (
                  <article key={fuel.label} className={styles.priceCard}>
                    <span>{fuel.label}</span>
                    <strong>{fuel.price}</strong>
                  </article>
                ))}
              </div>
            </div>

            <hr className={styles.mobileDivider} />

            <div className={styles.hoursBox}>
              <button
                type="button"
                className={styles.hoursToggle}
                onClick={() => setShowHours((current) => !current)}
                aria-expanded={showHours}
              >
                Opening Hours
                <FaChevronDown className={showHours ? styles.rotated : ""} />
              </button>

              {showHours && (
                <div className={styles.hoursDropdown}>
                  {openingHoursRows.length > 0 ? (
                    openingHoursRows.map(([day, hours]) => (
                      <div key={day} className={styles.hoursRow}>
                        <span>{day}</span>
                        <span>{hours}</span>
                      </div>
                    ))
                  ) : (
                    <p>Hours not available</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <section className={styles.stationMeta}>
            <div className={styles.metaGroup}>
              <h2>Services</h2>
              <div className={styles.metaGrid}>
                {selectedStation.amenities.length > 0 ? (
                  selectedStation.amenities.map((item) => (
                    <p key={item}>{item}</p>
                  ))
                ) : (
                  <p>No services listed</p>
                )}
              </div>
            </div>

            <div className={styles.metaGroup}>
              <h2>Fuel Types</h2>
              <div className={styles.metaGrid}>
                {fuelPriceCards.map((fuel) => (
                  <p key={fuel.label}>{fuel.label}</p>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.promos}>
            {promoCards.map((card) => (
              <article key={card.title} className={styles.promoCard}>
                <h2>{card.title}</h2>
                <p>{card.copy}</p>
                <button type="button" className={styles.promoButton}>
                  <span>{card.action}</span>
                  <span className={styles.promoButtonIcon}>
                    <FaArrowUpRightFromSquare />
                  </span>
                </button>
              </article>
            ))}
          </section>
        </section>

        <section className={styles.mobileServices}>
          <h2>Our Services</h2>
          <ul>
            {selectedStation.amenities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        </div>
      </section>

      <div className={styles.mobilePreFooter}>
        <img src={zLogo} alt="Z Energy" className={styles.mobilePreFooterLogo} />
        <a href="tel:0800474924" className={styles.mobileContactBtn}>Contact Us</a>
      </div>

      <MainFooter />
      <AIChatbot />
    </>
  );
}

export default GetDirections;
