import { useState, useEffect } from "react";
import ResultsTable from "./ResultsTable.jsx";
import styles from "./ResultsList.module.css";

const MOBILE_BREAKPOINT = 768; // breakpoint for responsive layout
const DEFAULT_MAX_DISTANCE = 100; // fallback distance if none provided

// Different labels for fuel types depending on device size
// WHY: Shorter labels are easier to read on mobile, while desktop can show full names.
const FUEL_TYPE_LABELS = {
  mobile: {
    "Regular Unleaded (91)": "91 Unleaded",
    "Premium Unleaded (95/98)": "98 Premium",
    "Diesel": "Diesel"
  },
  desktop: {
    "Regular Unleaded (91)": "Regular Fuel",
    "Premium Unleaded (95/98)": "Premium Fuel",
    "Diesel": "Diesel"
  }
};

// Helper to pick correct label based on device type
function getFuelTypeLabel(fuelType, isMobile) {
  const labels = isMobile ? FUEL_TYPE_LABELS.mobile : FUEL_TYPE_LABELS.desktop;
  return labels[fuelType] || "";
}

function ResultsList({ stations, fuelType, distanceRange, hasSlidersActive }) {
  // Track whether user is on mobile or desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  
  useEffect(() => {
    // Update state when window resizes
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Display label adjusted for device type
  const displayFuelType = getFuelTypeLabel(fuelType, isMobile);
  // Use provided distance range or fallback default
  const maxDistance = distanceRange?.[1] || DEFAULT_MAX_DISTANCE;

  return (
    <div className={styles.resultsSection}>
      {/* Header showing fuel type and distance filter */}
      <div className={styles.priceHeader}>
        <div className={styles.fuelTypeLabel}>{displayFuelType}</div>
        <div className={styles.distanceRangeLabel}>Within {maxDistance} km</div>
      </div>

      {/* Desktop layout */}
      <div className={styles.desktopOnly}>
        <div className={styles.resultsScrollContainer}>
          {/* WHY: ResultsTable handles rendering of station rows. 
              limitResults ensures filtering when sliders are active. */}
          <ResultsTable stations={stations} limitResults={hasSlidersActive} />
          <ul className={styles.tableOverlay}></ul>
        </div>
      </div>

      {/* Mobile layout */}
      <div className={styles.mobileOnly}>
        <div className={styles.resultsScrollContainer}>
          <ResultsTable stations={stations} limitResults={hasSlidersActive} />
          <ul className={styles.tableOverlay}></ul>
        </div>
      </div>
    </div>
  );
}

export default ResultsList;
