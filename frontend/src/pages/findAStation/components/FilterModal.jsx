// ----- IMPORTS ----- //
import { useState } from "react";
import styles from "./FilterModal.module.css";
import { IoChevronBackOutline } from "react-icons/io5";
import Button from "../../../common/Button.jsx";

function FilterModal({ onClose, onApply }) {
  const [service, setService] = useState("");
  const [stationType, setStationType] = useState("");
  const [fuelType, setFuelType] = useState("");

  const handleApply = () => {
    onApply({ service, stationType, fuelType });
    onClose();
  };

  return (
    <div className={styles.filterModalContainer}>
      <div className={styles.backButtonContainer}>
        <button className={styles.backButton} onClick={onClose}>
          <IoChevronBackOutline className={styles.backIcon} />
          Back
        </button>
      </div>

      <div className={styles.services}>
        <h6 className={styles.servicesTitle}>Services</h6>
        {/* Services dropdown so user can filter the map locations via services 
        offered at the station */}
        <select
          className={styles.servicesBar}
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="" className={styles.placeholderOption}>
            Select a service or services
          </option>
          <option value="car wash">Car wash</option>
          <option value="shop">Shop</option>
          <option value="toilets">Toilets</option>
        </select>
      </div>

      <div className={styles.stationType}>
        <h6 className={styles.stationTitle}>Station Type</h6>
        {/* Station type dropdown so user can filter the map locations via services 
        offered at the station */}
        <select
          className={styles.stationBar}
          value={stationType}
          onChange={(e) => setStationType(e.target.value)}
        >
          <option value="" className={styles.placeholderOption}>
            Select a station type
          </option>
          <option value="z station">Z Station</option>
          <option value="truck stop">Truck Stop</option>
          <option value="air stop">Air Stop</option>
        </select>
      </div>

      <div className={styles.fuelType}>
        <h6 className={styles.fuelTitle}>Fuel Type</h6>
        {/* Fuel type dropdown so user can filter the map locations via services 
        offered at the station */}
        <select
          className={styles.fuelBar}
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
        >
          <option value="" className={styles.placeholderOption}>
            Select a fuel type
          </option>
          <option value="91 Unleaded">91 Unleaded</option>
          <option value="95 Premium">95 Premium</option>
          <option value="Diesel">Diesel</option>
        </select>
      </div>

      {/* The Apply Filters button the user clicks so the chosen filters are applied */}
      <div className={styles.applyFiltersButton}>
        <Button
          variant="dark"
          size="large"
          text="Apply Filters"
          onClick={handleApply}
        />
      </div>
    </div>
  );
}

export default FilterModal;
