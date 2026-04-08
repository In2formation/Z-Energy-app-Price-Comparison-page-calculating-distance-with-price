import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import zEnergyLogo from "../../../assets/Z Energy NZ_symbol.png";
import styles from "./ResultsTable.module.css";

function ResultsTable({ stations, limitResults }) {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // WHY: Limit results when sliders are active so users don’t get overwhelmed.
  // Default shows all stations, but when filtering we cap at 12 for clarity.
  const displayStations = limitResults ? stations.slice(0, 12) : stations;

  // WHY: Clicking a row navigates to Get Directions page with station details.
  // We pass structured state so the next page has all necessary info.
  const handleRowClick = (station) => {
    navigate("/get-directions", {
      state: {
        station: {
          _id: station._id,
          name: station.name,
          address: station.location?.address || "Address not available",
          phone: station.phone || "Phone not available",
          coordinates: {
            lat: station.location?.coordinates?.lat,
            lng: station.location?.coordinates?.lng,
          },
          fuelPrices: station.fuelPrices || {},
          openingHours: station.openingHours || {},
          amenities: station.amenities || [],
        },
      },
    });
    window.scrollTo(0, 0); // WHY: Reset scroll so user sees top of new page
  };

  // WHY: Add hover styling manually for better control across browsers
  const handleRowHover = (e) => {
    e.currentTarget.classList.add(styles.hovered);
  };

  const handleRowLeave = (e) => {
    e.currentTarget.classList.remove(styles.hovered);
  };

  // WHY: Clean up station names for readability.
  // Z Energy names often include "Z Energy" or "Z" prefixes and commas.
  // We strip those so users see just the placename.
  const getAreaName = (stationName) => {
    if (!stationName) return "Unknown";
    let name = stationName.replace(/^Z Energy\s+/i, "").replace(/^Z\s+/i, "").trim();
    if (name.includes(",")) {
      name = name.split(",")[0].trim();
    }
    return name;
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.contentWrapper}>
        {displayStations && displayStations.length > 0 ? (
          displayStations.map((station, index) => (
            <div
              key={station._id || index}
              className={`${styles.tableRow} ${styles.clickableRow}`}
              onMouseEnter={handleRowHover}
              onMouseLeave={handleRowLeave}
              onClick={() => handleRowClick(station)}
            >
              {/* WHY: Show Z Energy logo for brand consistency */}
              <div className={styles.logoContainer}>
                <img src={zEnergyLogo} alt="Z Energy" className={styles.logo} />
              </div>

              {/* Placename only for clarity */}
              <div className={styles.stationInfo}>
                <p className={styles.stationName}>{getAreaName(station.name)}</p>
              </div>

              {/* Price cell with fallback if unavailable */}
              <div className={styles.dataCell}>
                <div className={styles.divider}></div>
                {station.price !== null && station.price !== undefined && station.price !== Infinity
                  ? `$${station.price.toFixed(2)} P/Litre`
                  : "--"}
              </div>
            </div>
          ))
        ) : (
          // WHY: Show empty state message when no stations match filters
          <div className={styles.emptyState}>No stations found matching your criteria</div>
        )}
      </div>
    </div>
  );
}

export default ResultsTable;
