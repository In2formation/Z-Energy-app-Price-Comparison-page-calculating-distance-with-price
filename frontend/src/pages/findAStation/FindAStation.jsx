// ----- IMPORTS ----- //
import { useState, useEffect } from "react";
import styles from "./FindAStation.module.css";
import Button from "../../common/Button.jsx";
import HeroSection from "./components/HeroSection.jsx";
import StationMap from "./components/StationMap.jsx";
import StationList from "./components/StationList.jsx";
import MainFooter from "../../common/MainFooter.jsx";
import AIChatbot from "../../common/AIChatbot.jsx";
import { useNavigate } from "react-router-dom";

// This function is from Adrian's code to order the stations from
// closest to furthest away to the users location. //
function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function FindAStation() {
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    service: "",
    stationType: "",
    fuelType: "",
  });
  const [userLocation, setUserLocation] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const navigate = useNavigate();

  // Calling the browsers built in geolocation so it can grab
  // the users current location, then stores it in userLocation. //
  const handleGetLocation = () => {
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      // Geolocation error handling so the user can see errors to explain what isn't working and why. //
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location access was denied. Please enable location permissions in your browser.",
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError(
            "Location information is unavailable. Please try again.",
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError(
            "Could not get your location. Please try again or check your browser permissions.",
          );
        }
      },
    );
  };

  // Fetching station data from API endpoint /stations //
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/stations`,
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setStations(data);
      } catch (err) {
        setFetchError("Could not load stations. Please try again later.");
      }
    };
    fetchStations();
  }, []);

  // The station data in the DB is called Z Energy, but we need Z Station on the UI,
  // so this will match the correct data  from the DB when the user searches Z Station. //
  const normaliseSearch = (term) => {
    if ("z station".includes(term.toLowerCase())) return "z energy";
    return term.toLowerCase();
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredStations = stations.filter((station) => {
    // This checks the users search term and checks every station to
    // match the users search term. //
    const term = normaliseSearch(searchTerm);
    const matchesSearch = // checking that the search term appears in the station name or amenity string. //
      searchTerm === "" ||
      station.amenities.some((a) => a.toLowerCase().includes(term)) ||
      station.name.toLowerCase().includes(term);

    // Service Filter //
    const matchesService = // Checking to ensure that the amenity matches exactly with the filter value. //
      filters.service === "" ||
      station.amenities.some(
        (a) => a.toLowerCase() === filters.service.toLowerCase(),
      );

    // Station Type Filter //
    const normalisedType = normaliseSearch(filters.stationType);
    const matchesType = // Checking the name and amenities to see if they include the filter search term. //
      filters.stationType === "" ||
      station.amenities.some((a) => a.toLowerCase().includes(normalisedType)) ||
      station.name.toLowerCase().includes(normalisedType);

    // Fuel Type Filter //
    const matchesFuel = // Checking to ensure the station has a price for the selected fuel. //
      filters.fuelType === "" ||
      station.fuelPrices?.[filters.fuelType] !== undefined;

    return matchesSearch && matchesService && matchesType && matchesFuel;
  });

  // This code is going to sort the stations based on their coordinates 
  // to the users location. //
  const hasFiltersActive =
    filters.service !== "" ||
    filters.stationType !== "" ||
    filters.fuelType !== "" ||
    searchTerm !== "";

  const sortedStations = userLocation
    ? [...filteredStations].sort((a, b) => {
        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.location.coordinates.lat,
          a.location.coordinates.lng,
        );
        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.location.coordinates.lat,
          b.location.coordinates.lng,
        );
        return distA - distB;
      })
    : filteredStations;

  return (
    <div className={styles.page}>
      <div className={styles.surfaceWrap}>
        {/* Orange and white section above the map */}
        <HeroSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onApply={handleApplyFilters}
          onGetLocation={handleGetLocation}
        />

        {/* Error messages for the UI */}
        {fetchError && <p className={styles.errorMessage}>{fetchError}</p>}
        {locationError && (
          <p className={styles.errorMessage}>{locationError}</p>
        )}

        {/* MAP SECTION */}
        <div className={styles.mapSection}>
          {/* List of stations on left of map when in desktop view */}
          <StationList stations={filteredStations} />
          <div className={styles.mapWrapper}>
            <StationMap
              stations={sortedStations}
              userLocation={userLocation}
              hasFiltersActive={hasFiltersActive}
            />
          </div>
        </div>

        {/* BUTTONS BELOW MAP */}
        <div className={styles.buttonContainer}>
          <div className={styles.stackedButtons}>
            <Button
              variant="dark"
              size="small"
              text="Compare Prices"
              onClick={() => navigate("/gas-buddy")}
            />
            <Button
              variant="outline"
              size="small"
              text="Back"
              onClick={() => navigate("/")}
            />
          </div>
          {/* AI Chatbot - mobile view */}
          <div className={styles.aiChatbotWrapper}>
            <AIChatbot className={styles.aiChatbot} />
          </div>
        </div>
        {/* AI Chatbot - desktop view */}
        <div className={styles.desktopAiWrapper}>
          <AIChatbot />
        </div>
        <MainFooter />
      </div>
    </div>
  );
}

export default FindAStation;
