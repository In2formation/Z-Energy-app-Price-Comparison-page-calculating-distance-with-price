//-----Imports------//
import { useEffect, useState } from "react";
import styles from "./GasBuddy.module.css";
import { getStations } from "../../services/api.js";
import BigFooter from "../../common/BigFooter.jsx";
import SmallFooter from "../../common/SmallFooter.jsx";
import GasBuddyHero from "./components/GasBuddyHero.jsx";
import ControlBar from "./components/ControlBar.jsx";
import MapView from "./components/MapView.jsx";
import ResultsList from "./components/ResultsList.jsx";
import AIChatbot from '../../common/AIChatbot';

//Constants
const NZ_CENTER = { lat: -41.2865, lng: 174.7762 };
const NZ_MAX_DISTANCE = 1500;
const EARTH_RADIUS_KM = 6371;
const SEARCH_RADIUS_KM = 100;

//Custom Hooks
//Tracks screen size to determine mobile vs desktop layout rendering
function useWindowSize() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

//Forces page reload on breakpoint changes to prevent layout inconsistencies
function useBreakpointRefresh() {
  useEffect(() => {
    let previousBreakpoint = 
      window.innerWidth < 600 ? 'mobile' : 
      window.innerWidth < 769 ? 'tablet' : 'laptop';

    const handleResize = () => {
      const currentBreakpoint = 
        window.innerWidth < 600 ? 'mobile' : 
        window.innerWidth < 769 ? 'tablet' : 'laptop';
      
      if (currentBreakpoint !== previousBreakpoint) {
        window.location.reload();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
   
  }, []);
}

//Attempts to get user location, falls back to NZ center if denied or unavailable
function useGeolocation() {
  const [userLocation, setUserLocation] = useState(null);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(NZ_CENTER)
    );
  }, []);
  return userLocation;
}

//Fetches all station data once on component mount
function useStations() {
  const [stations, setStations] = useState([]);
  useEffect(() => {
    getStations().then(setStations);
  }, []);
  return stations;
}

//Utility Functions
//Uses Haversine formula to calculate accurate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

//Validates if coordinates are within New Zealand boundaries
function isOutsideNZ(lat, lng) {
  return calculateDistance(lat, lng, NZ_CENTER.lat, NZ_CENTER.lng) > NZ_MAX_DISTANCE;
}

//Determines appropriate zoom level based on search result type for better map context
function getZoomLevel(locationType, locationClass) {
  const isCityOrRegion = locationType === 'administrative' || 
                         locationClass === 'boundary' || 
                         locationClass === 'place' ||
                         locationType === 'postcode';
  return isCityOrRegion ? 11 : 14;
}

//Formats search queries to ensure New Zealand context for geocoding API
function formatSearchQuery(query) {
  const trimmed = query.trim();
  return /^\d{4}$/.test(trimmed) ? `${trimmed}, New Zealand` : `${trimmed} New Zealand`;
}

//Station Processing
//Enriches station data with calculated distances and prices based on current context
function enrichStations(stations, userLocation, searchLocation, clickedStationLocation, fuelType) {
  return stations
    .filter((s) => s?.location?.coordinates)
    .map((station) => {
      const { lat, lng } = station.location.coordinates;
      const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, lat, lng) : Infinity;
      
      //Prioritizes search or clicked location over user location for distance calculations
      const referenceLocation = clickedStationLocation || searchLocation;
      const distanceFromSearch = referenceLocation ? calculateDistance(referenceLocation.lat, referenceLocation.lng, lat, lng) : null;
      
      //Displays distance from most relevant reference point based on user interaction
      const displayDistance = (clickedStationLocation || searchLocation) ? distanceFromSearch : distance;
      
      const price = fuelType && station.fuelPrices?.[fuelType] !== undefined ? station.fuelPrices[fuelType] : null;
      return { ...station, distance, distanceFromSearch, displayDistance, price };
    });
}

//Filters stations based on active price and distance ranges, adapting to different contexts
function filterStations(stations, searchLocation, clickedStationLocation, priceRange, distanceRange, userLocation) {
  return stations.filter((s) => {
    //Excludes stations without valid prices when price filter is active
    if (priceRange[1] > 0) {
      if (s.price === null || s.price === Infinity) return false;
      if (s.price < priceRange[0] || s.price > priceRange[1]) return false;
    }
    
    //Applies distance filtering relative to clicked station, search location, or user location
    if (clickedStationLocation && s.distanceFromSearch !== null) {
      if (distanceRange[1] > 0) {
        if (s.distanceFromSearch < distanceRange[0] || s.distanceFromSearch > distanceRange[1]) {
          return false;
        }
      }
    } else if (searchLocation && s.distanceFromSearch !== null) {
      //Limits search results to 100km radius to keep results relevant
      if (s.distanceFromSearch > SEARCH_RADIUS_KM) return false;
      if (distanceRange[1] > 0) {
        if (s.distanceFromSearch < distanceRange[0] || s.distanceFromSearch > distanceRange[1]) {
          return false;
        }
      }
    } else if (userLocation && !isOutsideNZ(userLocation.lat, userLocation.lng)) {
      if (distanceRange[1] > 0) {
        if (s.distance < distanceRange[0] || s.distance > distanceRange[1]) {
          return false;
        }
      }
    }
    
    return true;
  });
}

//Sorts stations by distance when filters are active, otherwise by user-selected sort mode
function sortStations(stations, searchLocation, clickedStationLocation, hasSlidersActive, sortMode) {
  return [...stations].sort((a, b) => {
    if (searchLocation || clickedStationLocation || hasSlidersActive) {
      return searchLocation || clickedStationLocation ? a.distanceFromSearch - b.distanceFromSearch : a.distance - b.distance;
    }
    if (sortMode === "price") return a.price - b.price;
    if (sortMode === "distance") return a.distance - b.distance;
    return 0;
  });
}

//Main Component
function GasBuddy() {
  //State Management
  const [fuelType, setFuelType] = useState("");
  const [sortMode, setSortMode] = useState("price");
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [distanceRange, setDistanceRange] = useState([0, 0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapTarget, setMapTarget] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [clickedStationLocation, setClickedStationLocation] = useState(null);
  const [resetOverlays, setResetOverlays] = useState(false);

  //Initialize Custom Hooks
  const isMobile = useWindowSize();
  const userLocation = useGeolocation();
  const stations = useStations();
  useBreakpointRefresh();

  //Event Handlers
  //Handles address search and resets filters to show fresh results
  async function handleSearch(lat, lon, locationType, locationClass) {
    //Clears all filters to prevent confusing results when searching new location
    setPriceRange([0, 0]);
    setDistanceRange([0, 0]);
    setFuelType("");
    setClickedStationLocation(null);
    setResetOverlays(true);
    setTimeout(() => setResetOverlays(false), 100);

    if (lat && lon) {
      const searchLoc = { lat: parseFloat(lat), lng: parseFloat(lon), address: searchQuery };
      setSearchLocation(searchLoc);
      setMapTarget({ ...searchLoc, zoom: getZoomLevel(locationType, locationClass) });
      return;
    }
    if (!searchQuery.trim()) return;
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formatSearchQuery(searchQuery))}&countrycodes=nz`
    );
    const results = await response.json();
    if (results.length > 0) {
      const { lat, lon, type, class: locClass, display_name } = results[0];
      const searchLoc = { lat: parseFloat(lat), lng: parseFloat(lon), address: display_name };
      setSearchLocation(searchLoc);
      setMapTarget({ ...searchLoc, zoom: getZoomLevel(type, locClass) });
    }
  }

  //Centers map on user's current location and shows pin when requested
  function handleUseLocation() {
    //Default to Nelson, NZ since geolocation may not work or be outside NZ
    const nelsonLocation = {
      lat: -41.2710,
      lng: 173.2840,
      address: "Nelson, New Zealand"
    };
    
    setSearchLocation(nelsonLocation);
    setMapTarget({ ...nelsonLocation, zoom: 10 });
    
    //Set distance range to 100km radius
    setDistanceRange([0, 100]);
    
    //Clear other filters for fresh view
    setPriceRange([0, 0]);
    setFuelType("");
    setClickedStationLocation(null);
  }

  //Sets clicked station as reference point and scrolls to control bar for filter interaction
  function handleStationClick(station) {
    const stationLocation = {
      lat: station.location.coordinates.lat,
      lng: station.location.coordinates.lng,
    };
    setClickedStationLocation(stationLocation);
    
    //Zooms to station for detailed view
    setMapTarget({ ...stationLocation, zoom: 14 });
    
    //Brings control bar into view so user can adjust filters relative to clicked station
    setTimeout(() => {
      document.querySelector('[class*="controlBar"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  //Data Processing Pipeline
  const enrichedStations = enrichStations(stations, userLocation, searchLocation, clickedStationLocation, fuelType);
  const filteredStations = filterStations(enrichedStations, searchLocation, clickedStationLocation, priceRange, distanceRange, userLocation);
  const hasSlidersActive = priceRange[1] > 0 || distanceRange[1] > 0;
  const sortedStations = sortStations(filteredStations, searchLocation, clickedStationLocation, hasSlidersActive, sortMode);

  return (
    <div className={styles.page}>
      <div className={styles.pageWrapper}>
      
      <GasBuddyHero
        searchTerm={searchQuery}
        setSearchTerm={setSearchQuery}
        onGetLocation={handleUseLocation}
        onSearch={handleSearch}
      />

      <div className={styles.mapBorder}></div>

      <MapView 
        stations={sortedStations} 
        mapTarget={mapTarget} 
        searchLocation={searchLocation} 
        clickedStationLocation={clickedStationLocation}
        hasSlidersActive={hasSlidersActive}
        onStationClick={handleStationClick}
      />

      <br />

      <ControlBar
        sortMode={sortMode}
        fuelType={fuelType}
        onSortChange={setSortMode}
        onFuelTypeChange={setFuelType}
        priceRange={priceRange}
        distanceRange={distanceRange}
        onPriceChange={setPriceRange}
        onDistanceChange={setDistanceRange}
        resetOverlays={resetOverlays}
      />

      <ResultsList stations={sortedStations} fuelType={fuelType} distanceRange={distanceRange} hasSlidersActive={hasSlidersActive} />

      <div className={styles.aiSection}>
        <AIChatbot />
      </div>

      {isMobile ? <SmallFooter /> : <><BigFooter /><SmallFooter /></>}
      </div>
    </div>
  );
}

export default GasBuddy;
