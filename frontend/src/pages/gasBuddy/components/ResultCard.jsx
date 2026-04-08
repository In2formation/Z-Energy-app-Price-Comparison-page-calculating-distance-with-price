import styles from "./ResultCard.module.css";

// Helper function to clean up station names for display
// WHY: Z Energy station names often include "Z Energy" or "Z" prefixes, 
// and sometimes extra commas. This strips those out so the UI shows a 
// concise, user-friendly area name.
const getAreaName = (stationName) => {
  if (!stationName) return "Unknown"; // fallback if no name provided
  let name = stationName.replace(/^Z Energy\s+/i, '').replace(/^Z\s+/i, '').trim();
  if (name.includes(',')) {
    name = name.split(',')[0].trim(); // only show first part before comma
  }
  return name;
};

function ResultCard({ station, fuelType, index }) {
  // Determine price for the selected fuel type
  // WHY: Not all stations have all fuel types, so we check existence first.
  const price =
    station?.fuelPrices && station.fuelPrices[fuelType] !== undefined
      ? station.fuelPrices[fuelType]
      : null;

  return (
    <div className={styles.resultCard}>
      {/* Left side: station info */}
      <div className={styles.resultLeft}>
        {/* Station name with index for ordering */}
        <div className={styles.stationName}>
          {index + 1}. {getAreaName(station.name)}
        </div>

        {/* City name for context */}
        <div className={styles.stationCity}>{station.location.city}</div>

        {/* Distance shown only if valid (Infinity means no distance available) */}
        {station.distance !== Infinity && (
          <div className={styles.stationCity}>
            {station.distance.toFixed(2)} km away
          </div>
        )}
      </div>

      {/* Right side: fuel price */}
      <div className={styles.resultRight}>
        <div className={styles.priceTag}>
          {/* Show price if available, otherwise fallback message */}
          {price !== null ? `$${price} / L` : "No price"}
        </div>
      </div>
    </div>
  );
}

export default ResultCard;
