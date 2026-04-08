import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import styles from "./MapView.module.css";
import "leaflet/dist/leaflet.css";
import mapPin from "../../../assets/MapPin.png";

const NZ_BOUNDS = {
  SW: [-48.0, 165.0],
  NE: [-33.0, 180.0]
};

const DEFAULT_CENTER = { lat: -41.2865, lng: 174.7762 };
const INITIAL_ZOOM = 6;
const INITIAL_ZOOM_MOBILE = 5;
const MIN_ZOOM = 5;
const MAP_RESIZE_DELAY = 200;
const ZOOM_ADJUSTMENT_DELAY = 150;
const ZOOM_ADJUSTMENT = 0.30;

// === MAP CONTROLLERS ===
function FixMapResize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), MAP_RESIZE_DELAY);
  }, [map]);
  return null;
}

function FitNZOnLoad() {
  const map = useMap();
  useEffect(() => {
    const nzBounds = L.latLngBounds(NZ_BOUNDS.SW, NZ_BOUNDS.NE);
    const width = window.innerWidth;
    
    // Different padding for different screen sizes
    let padding = [10, 10];
    if (width <= 320) {
      padding = [5, 5];
    } else if (width <= 599) {
      padding = [8, 8];
    }
    
    map.fitBounds(nzBounds, { padding });
    
    // Adjust zoom based on screen size
    setTimeout(() => {
      let zoomAdjustment = ZOOM_ADJUSTMENT;
      
      if (width <= 320) {
        zoomAdjustment = -1.0; // Zoom out significantly for 320px
      } else if (width <= 599) {
        zoomAdjustment = -0.5; // Zoom out for mobile
      } else if (width <= 768) {
        zoomAdjustment = 0.0; // No adjustment for tablets
      }
      
      map.setZoom(map.getZoom() + zoomAdjustment);
    }, ZOOM_ADJUSTMENT_DELAY);
  }, [map]);
  return null;
}

function MapTargetController({ mapTarget }) {
  const map = useMap();
  useEffect(() => {
    if (mapTarget) {
      map.setView([mapTarget.lat, mapTarget.lng], mapTarget.zoom || 14);
    }
  }, [map, mapTarget]);
  return null;
}

//Marker Icons
//Orange MapPin icon for Z stations
const zIcon = L.icon({
  iconUrl: mapPin,
  iconSize: [60, 60],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

//Creates appropriate marker based on context - MapPin for Z display or top station, numbered for others
function createNumberedIcon(number, showZ, isClosest) {
  //When no search or filters active, all stations show MapPin
  if (showZ) {
    return zIcon;
  }
  
  //Top closest station always shows MapPin when search or filters are active
  if (isClosest) {
    return zIcon;
  }
  
  //All other stations show numbered markers when search or filters are active
  return L.divIcon({
    html: `<div class="${styles.numberMarker}">${number}</div>`,
    className: styles.leafletMarker,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });
}

//Creates search location marker
function createSearchLocationIcon() {
  return L.divIcon({
    html: `
      <div class="${styles.searchMarkerContainer}">
        <div class="${styles.searchBubble}">You are here</div>
        <div class="${styles.searchMarker}">📍</div>
      </div>
    `,
    className: styles.leafletMarker,
    iconSize: [40, 60],
    iconAnchor: [20, 60],
    popupAnchor: [0, -60],
    tooltipAnchor: [0, -60]
  });
}

// === HELPER FUNCTIONS ===
function isWithinNZBounds(lat, lng) {
  return lat < NZ_BOUNDS.NE[0] && lat > NZ_BOUNDS.SW[0] && 
         lng > NZ_BOUNDS.SW[1] && lng < NZ_BOUNDS.NE[1];
}

function shouldShowZ(searchLocation, clickedStationLocation, hasSlidersActive) {
  return !searchLocation && !clickedStationLocation && !hasSlidersActive;
}

function isClosestStation(clickedStationLocation, station) {
  if (!clickedStationLocation) return false;
  return station.location.coordinates.lat === clickedStationLocation.lat && 
         station.location.coordinates.lng === clickedStationLocation.lng;
}

function MapRefSetter({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    
    // Completely disable scroll wheel zoom
    map.scrollWheelZoom.disable();
    
    // Get the map container element
    const container = map.getContainer();
    
    // Set default cursor to pointer (normal cursor)
    container.style.cursor = 'default';
    
    // Handle mouse down/up for cursor
    const handleMouseDown = () => {
      container.style.cursor = 'grabbing';
    };
    
    const handleMouseUp = () => {
      container.style.cursor = 'default';
    };
    
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [map, mapRef]);
  return null;
}

// === MAIN COMPONENT ===
function MapView({ stations, mapTarget, searchLocation, clickedStationLocation, hasSlidersActive, onStationClick }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const isMobile = window.innerWidth <= 768;
  const initialZoom = window.innerWidth <= 599 ? INITIAL_ZOOM_MOBILE : INITIAL_ZOOM;

  const handleZoomIn = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setZoom(leafletMapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setZoom(leafletMapRef.current.getZoom() - 1);
    }
  };

  return (
    <div className={styles.mapWrapper} ref={mapRef}>
      <div className={styles.zoomControls}>
        <button className={styles.zoomButton} onClick={handleZoomIn} title="Zoom In">+</button>
        <button className={styles.zoomButton} onClick={handleZoomOut} title="Zoom Out">−</button>
      </div>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={initialZoom}
        zoomSnap={0.1}
        zoomDelta={0.1}
        minZoom={MIN_ZOOM}
        maxBounds={[NZ_BOUNDS.SW, NZ_BOUNDS.NE]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={false}
        className={styles.mapContainer}
      >
        <FixMapResize />
        <FitNZOnLoad />
        <MapTargetController mapTarget={mapTarget} />
        <MapRefSetter mapRef={leafletMapRef} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {searchLocation && (
          <Marker 
            position={[searchLocation.lat, searchLocation.lng]} 
            icon={createSearchLocationIcon()}
            zIndexOffset={1000}
          >
            <Popup>
              <strong>Search Location</strong><br />
              {searchLocation.address || `${searchLocation.lat.toFixed(4)}, ${searchLocation.lng.toFixed(4)}`}
            </Popup>
          </Marker>
        )}

        {stations
          .filter((s) => isWithinNZBounds(s.location.coordinates.lat, s.location.coordinates.lng))
          .map((station, index) => {
            const { lat, lng } = station.location.coordinates;
            const showZ = shouldShowZ(searchLocation, clickedStationLocation, hasSlidersActive);
            const isClosest = isClosestStation(clickedStationLocation, station);
            const isFirstStation = (searchLocation || hasSlidersActive) && index === 0;

            return (
              <Marker
                key={station._id}
                position={[lat, lng]}
                icon={createNumberedIcon(index + 1, showZ, isClosest || isFirstStation)}
                eventHandlers={{ click: () => onStationClick?.(station) }}
              >
                <Popup>
                  <strong>{station.name}</strong><br />
                  {station.location.city}<br />
                  {station.price !== Infinity ? `$${station.price} / L` : "No price available"}<br />
                  {station.displayDistance !== Infinity ? `${station.displayDistance.toFixed(2)} km away` : ""}
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}

export default MapView;
