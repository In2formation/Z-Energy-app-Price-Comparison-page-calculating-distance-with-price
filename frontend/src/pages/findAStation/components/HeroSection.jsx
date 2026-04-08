// ----- IMPORTS ----- //
import { useState } from "react";
import styles from "./HeroSection.module.css";
import Button from "../../../common/Button.jsx";
import { TbCurrentLocationFilled } from "react-icons/tb";
import FilterModal from "./FilterModal.jsx";
import { useNavigate } from "react-router-dom";

function HeroSection({ searchTerm, setSearchTerm, onApply, onGetLocation }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [desktopService, setDesktopService] = useState("");
  const [desktopStationType, setDesktopStationType] =useState("");
  const [desktopFuelType, setDesktopFuelType] = useState("");

  const handleIsFilterOpen = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const navigate = useNavigate();

  const handleDesktopApply = () => {
    onApply({
      service: desktopService,
      stationType: desktopStationType,
      fuelType: desktopFuelType,
    });
  };

  return (
    // ----- HERO SECTION CONTENT ----- //
    <div className={styles.heroContainer}>
      {/* ----- Orange section ----- */}
      <div className={styles.orangeContainer}>
        <h2 className={styles.heroTitle}>Find a station</h2>
        <div className={styles.searchBarContainer}>
          <input
            className={styles.searchBar}
            type="text"
            placeholder="Z Station/Truck Stop/Air Stop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.locationContainer}>
          <span className={styles.locationText} onClick={onGetLocation}>
            <TbCurrentLocationFilled className={styles.locationIcon} />
            or use my current location
          </span>
        </div>
        <div className={styles.desktopBackButton}>
          <Button variant="outline" size="large" text="Back" onClick={() => navigate('/')} />
        </div>
      </div>

      {/* ----- White section below the orange section ----- */}
      <div className={styles.whiteContainer}>
        <Button
          className={styles.mobileBackButton}
          variant="outline"
          size="small"
          text="Back"
          onClick={() => navigate('/')}
        />
        <button className={styles.filterButton} onClick={handleIsFilterOpen}>
          Filters
        </button>
      </div>
      {/* Filter Modal */}
      {isFilterOpen && (
        <FilterModal onClose={handleIsFilterOpen} onApply={onApply} />
      )}

      {/* Desktop Filters - always visible rather than a modal */}
      <div className={styles.desktopFilters}>
        <h6 className={styles.desktopFiltersTitle}>Filters</h6>
        <div className={styles.desktopFiltersRow}>
          <div className={styles.desktopFilterGroup}>
            <label className={styles.desktopFilterLabel}>Services</label>
            <select
              className={styles.desktopSelect}
              value={desktopService}
              onChange={(e) => setDesktopService(e.target.value)}
            >
              <option value="">Select a service or services</option>
              <option value="Car Wash">Car Wash</option>
              <option value="Shop">Shop</option>
              <option value="Toilets">Toilets</option>
            </select>
          </div>
          <div className={styles.desktopFilterGroup}>
            <label className={styles.desktopFilterLabel}>Station Type</label>
            <select
              className={styles.desktopSelect}
              value={desktopStationType}
              onChange={(e) => setDesktopStationType(e.target.value)}
            >
              <option value="">Select a station type</option>
              <option value="Z station">Z Station</option>
              <option value="Truck Stop">Truck Stop</option>
              <option value="Air Stop">Air Stop</option>
            </select>
          </div>
          <div className={styles.desktopFilterGroup}>
            <label className={styles.desktopFilterLabel}>Fuel Type</label>
            <select
              className={styles.desktopSelect}
              value={desktopFuelType}
              onChange={(e) => setDesktopFuelType(e.target.value)}
            >
              <option value="">Select a fuel type</option>
              <option value="91 Unleaded">91 Unleaded</option>
              <option value="95 Premium">95 Premium</option>
              <option value="Diesel">Diesel</option>
            </select>
          </div>
          <Button variant="dark" size="small" text="Apply Filters" onClick={handleDesktopApply} />
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
