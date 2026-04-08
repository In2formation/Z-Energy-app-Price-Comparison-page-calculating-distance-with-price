import { useState, useRef, useEffect } from "react";
import styles from "./ControlBar.module.css";

function PriceDistanceFilter({
  priceRange,
  distanceRange,
  onPriceChange,
  onDistanceChange,
  onClose,
}) {
  const [open, setOpen] = useState(false);
  const priceSliderRef = useRef(null);
  const distanceSliderRef = useRef(null);

  //Updates slider background to show progress visually
  function updateSliderBackground(slider, value, max) {
    if (!slider) return;
    const percent = max > 0 ? (value / max) * 100 : 0;
    slider.style.background = `linear-gradient(to right, #1E196A 0%, #1E196A ${percent}%, #ddd ${percent}%, #ddd 100%)`;
  }

  //Update slider backgrounds when panel opens or values change
  useEffect(() => {
    if (open) {
      updateSliderBackground(priceSliderRef.current, priceRange[1], Math.max(4, priceRange[1]));
      updateSliderBackground(distanceSliderRef.current, distanceRange[1], Math.max(100, distanceRange[1]));
    }
  }, [open, priceRange, distanceRange]);

  //Handle price slider changes
  function handlePriceChange(e) {
    const value = Number(e.target.value);
    const newPrice = [0, value];
    const maxPrice = Math.max(4, value);
    onPriceChange(newPrice);
    updateSliderBackground(e.target, value, maxPrice);
  }

  //Handle distance slider changes
  function handleDistanceChange(e) {
    const value = Number(e.target.value);
    const newDistance = [0, value];
    const maxDistance = Math.max(100, value);
    onDistanceChange(newDistance);
    updateSliderBackground(e.target, value, maxDistance);
  }

  const maxPrice = Math.max(4, priceRange[1]);
  const maxDistance = Math.max(100, distanceRange[1]);

  //Toggle filter panel open/closed
  function handleToggle() {
    if (open && onClose) {
      onClose();
    }
    setOpen(!open);
  }

  return (
    <div className={styles.filterWrapper}>
      <button className={styles.centerDropdown} onClick={handleToggle}>
        Price & Distance
      </button>

      {open && (
        <div className={styles.filterPanel}>
          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>
              Max Price: $0.00 – ${priceRange[1].toFixed(2)}
            </div>
            <input
              type="range"
              min="0"
              max={maxPrice}
              step="0.01"
              value={priceRange[1]}
              onChange={handlePriceChange}
              className={styles.slider}
              ref={priceSliderRef}
            />
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterLabel}>
              Max Distance: 0 km – {distanceRange[1]} km
            </div>
            <input
              type="range"
              min="0"
              max={maxDistance}
              step="1"
              value={distanceRange[1]}
              onChange={handleDistanceChange}
              className={styles.slider}
              ref={distanceSliderRef}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceDistanceFilter;
