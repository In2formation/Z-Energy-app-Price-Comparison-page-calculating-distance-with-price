// ----- IMPORTS ----- //
import styles from "./StationMap.module.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapPin from "../../../assets/MapPin.png"


// Adrian's code to zoom out on the map so our pages match in map view //
function FitNZOnLoad() {
  const map = useMap();
  useEffect(() => {
    const nzBounds = L.latLngBounds([-48.0, 165.0], [-33.0, 180.0]);
    map.fitBounds(nzBounds, { padding: [10, 10] });
    setTimeout(() => {
      map.setZoom(map.getZoom() + 0.3);
    }, 150);
  }, [map]);
  return null;
}

// This takes the user to their location on the map when they click on 
// 'or use ny current location //
function FlyToLocation({ userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation, map]);
  return null;
}

// Adrian's code to show the 'you are here' icon when a user clicks on 
// 'or use my current location'.//
function createUserLocationIcon() {
  return L.divIcon({
    html: `
      <div class="${styles.userLocationContainer}">
        <div class="${styles.userLocationBubble}">You are here</div>
        <div class="${styles.userLocationPin}">📍</div>
      </div>
    `,
    className: styles.leafletMarker,
    iconSize: [40, 60],
    iconAnchor: [20, 60],
    popupAnchor: [0, -60],
  });
}

// The orange Z Icon on the map //
const topIcon = L.icon({
  iconUrl: mapPin,
  iconSize: [60, 60],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Adrian's code to Create numbered marker icons on the map
function createNumberedIcon(number, showZ, isTop) {
    if (showZ) {
    return L.divIcon({
      html: `<div class="${styles.numberMarker}">Z</div>`,
      className: styles.leafletMarker,
      iconSize: [35, 35],
      iconAnchor: [17, 35],
      popupAnchor: [0, -35],
    });
  }
  if (isTop) {
    return topIcon;
  } else {
    return L.divIcon({
      html: `<div class="${styles.numberMarker}">${number}</div>`,
      className: styles.leafletMarker, // wrapper is transparent
      iconSize: [35, 35],
      iconAnchor: [17, 35],
      popupAnchor: [0, -35],
    });
  }
}

function StationMap({ stations, userLocation, hasFiltersActive }) {
  const navigate = useNavigate();
  const showZ = !hasFiltersActive;

  return (
    // Container to hold the map and show NZ zoomed out upon load/refresh //
    <div className={styles.mapWrapper}>
      <MapContainer
        center={[-41.2865, 174.7762]}
        zoom={6}
        style={{ height: "100%", width: "100%", flex: 1 }}
      >
        {/* Adrian's code that fits NZ on the map nicely */}
        <FitNZOnLoad />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Takes the user to their location on the map // */}
        <FlyToLocation userLocation={userLocation} />
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}
          icon={createUserLocationIcon()} />
        )}
        {stations.map((station, index) => (
          <Marker
            key={station._id}
            position={[
              station.location.coordinates.lat,
              station.location.coordinates.lng,
            ]}
            icon={createNumberedIcon(index + 1, showZ, index === 0)}
            // Takes the user to Eleanor's 'Get Directions' page when they click 
            // on the marker on the map for a station. //
            eventHandlers={{
              click: () => navigate("/get-directions", { state: { station } }),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default StationMap;
