// ----- IMPORTS ----- //
import { useNavigate } from "react-router-dom";
import styles from "./StationList.module.css";

function StationList({ stations }) {
  const navigate = useNavigate();

  return (
    // Station List section to left of map on Desktop view //
    <div className={styles.stationListContainer}>
      <p className={styles.stationCount}>{stations.length} stations found</p>
      <div className={styles.stationList}>
        {stations.map((station) => (
          <div
            key={station._id}
            className={styles.stationCard}
            role="button"
            tabIndex={0}
            // Takes the user to Eleanor's 'Get Directions' page when they click on one of the stations 
            // displayed in the station list on the left of the map. Desktop view only. //
            onClick={() => navigate("/get-directions", { state: { station } })}
            onKeyDown={(e) => e.key === "Enter" && navigate("/get-directions", { state: { station } })}
          >
            <h3 className={styles.stationName}>{station.name}</h3>
            <p className={styles.stationAddress}>{station.location.address}</p>
            <div className={styles.stationAmenities}>
              {station.amenities.map((amenity, index) => (
                <p key={index} className={styles.amenity}>
                  {amenity}
                </p>
              ))}
            </div>
            <div className={styles.fuelTypes}>
              {Object.keys(station.fuelPrices || {}).map((fuelType, index) => (
                <p key={index} className={styles.fuelType}>
                  {fuelType}
                </p>
              ))}
            </div>
            <hr className={styles.divider} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default StationList;
