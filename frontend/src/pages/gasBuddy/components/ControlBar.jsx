import { useState, useRef, useEffect } from "react";
import styles from "./ControlBar.module.css";
import PriceDistanceIcon from "../../../assets/PriceDistance.png";
import PriceDistanceMobileIcon from "../../../assets/PriceDistanceMobile.png";
import FuelTypeIcon from "../../../assets/MobFuelDropDown.png";
import AdjustersIcon from "../../../assets/Adjusters.png";

const MAX_PRICE = 5;
const MAX_DISTANCE = 100;
const WARNING_DURATION = 3000; // how long to show fuel warning
const MOBILE_BREAKPOINT = 768; // screen width cutoff for mobile UI

// Available fuel types for dropdown
const FUEL_TYPES = [
  "Regular Unleaded (91)",
  "Premium Unleaded (95/98)",
  "Diesel"
];

// Helper to visually update slider background to show progress
function updateSliderBackground(slider, value, max) {
  if (!slider) return;
  const percent = max > 0 ? (value / max) * 100 : 0;
  // Gradient shows filled portion in brand color, rest in grey
  slider.style.background = `linear-gradient(to right, #1E196A 0%, #1E196A ${percent}%, #ddd ${percent}%, #ddd 100%)`;
}

function ControlBar({ fuelType, onFuelTypeChange, priceRange, distanceRange, onPriceChange, onDistanceChange, resetOverlays }) {
  const [showOverlays, setShowOverlays] = useState(false); // controls whether sliders/dropdowns are visible
  const [showFuelWarning, setShowFuelWarning] = useState(false); // warning if user tries sliders without fuel type
  const priceSliderRef = useRef(null); // ref to price slider DOM element
  const distanceSliderRef = useRef(null); // ref to distance slider DOM element

  // Reset overlays when parent signals (e.g. user closes filters elsewhere)
  useEffect(() => {
    if (resetOverlays) {
      setShowOverlays(false);
      setShowFuelWarning(false);
    }
  }, [resetOverlays]);

  // When overlays open, update slider backgrounds to reflect current values
  useEffect(() => {
    if (showOverlays) {
      setTimeout(() => {
        updateSliderBackground(priceSliderRef.current, priceRange[1], Math.max(MAX_PRICE, priceRange[1]));
        updateSliderBackground(distanceSliderRef.current, distanceRange[1], Math.max(MAX_DISTANCE, distanceRange[1]));
      }, 0); // run after DOM paints
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOverlays, priceRange, distanceRange]);

  // Toggle overlays open/closed
  function toggleOverlays() {
    setShowOverlays(!showOverlays);
    setShowFuelWarning(false); // clear warning when toggling
  }

  // If user interacts with sliders before choosing fuel type, show warning
  function handleSliderInteraction() {
    if (!fuelType) {
      setShowFuelWarning(true);
      setTimeout(() => setShowFuelWarning(false), WARNING_DURATION);
    }
  }

  // Handle price slider changes and update gradient
  function handlePriceChange(e) {
    const value = Number(e.target.value);
    onPriceChange([0, value]); // update parent state
    updateSliderBackground(e.target, value, Math.max(MAX_PRICE, value));
  }

  // Handle distance slider changes and update gradient
  function handleDistanceChange(e) {
    const value = Number(e.target.value);
    onDistanceChange([0, value]); // update parent state
    updateSliderBackground(e.target, value, Math.max(MAX_DISTANCE, value));
  }

  return (
    <div className={`${styles.controlBar} ${showOverlays ? styles.controlBarExpanded : ''}`}>
      <div className={styles.centerControls}>
        {/* Show icons when overlays are hidden */}
        {!showOverlays && (
          <>
            <img src={AdjustersIcon} alt="Adjusters" className={styles.sideIcon} onClick={toggleOverlays} />
            <div className={styles.iconWrapper}>
              <button className={styles.controlIcon} onClick={toggleOverlays} title="Price & Distance">
                {/* Switch icon depending on screen size */}
                <img src={window.innerWidth <= MOBILE_BREAKPOINT ? PriceDistanceMobileIcon : PriceDistanceIcon} alt="Price & Distance" />
              </button>
            </div>
            <div className={styles.iconWrapper}>
              <button className={styles.controlIcon} onClick={toggleOverlays} title="Fuel Type">
                <img src={FuelTypeIcon} alt="Fuel Type" />
              </button>
            </div>
          </>
        )}

        {/* Show overlays when expanded */}
        {showOverlays && (
          <div className={styles.overlayContainer}>
            {/* Warning if fuel type not selected */}
            {showFuelWarning && (
              <div className={styles.fuelWarning}>Please select a fuel type first</div>
            )}

            {/* Price slider */}
            <div className={styles.overlayPanel}>
              <div className={styles.filterSection}>
                <div className={styles.filterLabelRow}>
                  <span>${priceRange[1].toFixed(2)}</span>
                  <span>${MAX_PRICE.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(MAX_PRICE, priceRange[1])}
                  step="0.01"
                  value={priceRange[1]}
                  onMouseDown={handleSliderInteraction}
                  onTouchStart={handleSliderInteraction}
                  onChange={handlePriceChange}
                  className={styles.slider}
                  ref={priceSliderRef}
                />
              </div>

              {/* Distance slider */}
              <div className={styles.filterSection}>
                <div className={styles.filterLabelRow}>
                  <span>{distanceRange[1]} km</span>
                  <span>{MAX_DISTANCE} km</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(MAX_DISTANCE, distanceRange[1])}
                  step="1"
                  value={distanceRange[1]}
                  onMouseDown={handleSliderInteraction}
                  onTouchStart={handleSliderInteraction}
                  onChange={handleDistanceChange}
                  className={styles.slider}
                  ref={distanceSliderRef}
                />
              </div>
            </div>

            {/* Fuel type dropdown */}
            <div className={styles.overlayPanelFuel}>
              {FUEL_TYPES.map((type) => (
                <div
                  key={type}
                  className={`${styles.dropdownItem} ${fuelType === type ? styles.selected : ""}`}
                  onClick={() => onFuelTypeChange(type)}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ControlBar;
