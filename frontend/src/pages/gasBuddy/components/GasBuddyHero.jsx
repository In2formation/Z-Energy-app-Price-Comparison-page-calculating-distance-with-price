import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TbCurrentLocationFilled } from "react-icons/tb";
import styles from "./GasBuddyHero.module.css";
import Button from "../../../common/Button.jsx";

const DEBOUNCE_DELAY = 200; // delay to avoid firing API calls on every keystroke
const MIN_SEARCH_LENGTH = 3; // only search when user has typed enough characters
const SUGGESTION_LIMIT = 5; // limit suggestions to keep dropdown manageable

function GasBuddyHero({ searchTerm, setSearchTerm, onGetLocation, onSearch }) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]); // holds fetched location suggestions
  const [showSuggestions, setShowSuggestions] = useState(false); // controls dropdown visibility
  const debounceTimer = useRef(null); // keeps track of debounce timeout across renders

  useEffect(() => {
    // If search term is too short, clear suggestions and hide dropdown
    if (searchTerm.trim().length < MIN_SEARCH_LENGTH) {
      if (suggestions.length > 0) setSuggestions([]);
      if (showSuggestions) setShowSuggestions(false);
      return;
    }

    // Clear any existing debounce timer before setting a new one
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Debounce API call so we don’t overload the server with requests
    debounceTimer.current = setTimeout(async () => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm.trim())}&countrycodes=nz&limit=${SUGGESTION_LIMIT}`
      );
      const results = await response.json();
      setSuggestions(results); // update suggestions list
      setShowSuggestions(results.length > 0); // show dropdown only if results exist
    }, DEBOUNCE_DELAY);

    // Cleanup: clear timer when component unmounts or searchTerm changes
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // When user clicks a suggestion, update search term and trigger search
  function handleSuggestionClick(suggestion) {
    setSearchTerm(suggestion.display_name);
    setShowSuggestions(false);
    onSearch(suggestion.lat, suggestion.lon, suggestion.type, suggestion.class);
  }

  // Allow pressing Enter to trigger search without clicking
  function handleKeyDown(e) {
    if (e.key === "Enter" && searchTerm.trim()) {
      setShowSuggestions(false);
      onSearch();
    }
  }

  return (
    <div className={styles.heroContainer}>
      <div className={styles.orangeContainer}>
        <h2 className={styles.heroTitle}>Compare Prices</h2>

        {/* Search bar with live suggestions */}
        <div className={styles.searchBarContainer}>
          <input
            className={styles.searchBar}
            type="text"
            placeholder="Address or postcode"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className={styles.suggestionsDropdown}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Option to use current location instead of typing */}
        <div className={styles.locationContainer}>
          <span className={styles.locationText} onClick={onGetLocation}>
            <TbCurrentLocationFilled className={styles.locationIcon} />
            or use my current location
          </span>
        </div>

        {/* Back button for desktop view */}
        <div className={styles.desktopBackButton}>
          <Button
            variant="outline"
            size="large"
            text="Back"
            onClick={() => navigate("/find-a-station")}
          />
        </div>
      </div>

      {/* Back button for mobile view */}
      <div className={styles.whiteContainer}>
        <Button
          className={styles.mobileBackButton}
          variant="outline"
          size="small"
          text="Back"
          onClick={() => navigate("/find-a-station")}
        />
      </div>
    </div>
  );
}

export default GasBuddyHero;