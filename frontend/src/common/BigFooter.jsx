import styles from "./BigFooter.module.css";
import zLogo from "../assets/Z Energy NZ_symbol.png";
import {
  FaTiktok,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaLocationDot,
  FaGooglePlay,
  FaApple,
} from "react-icons/fa6";

const NAV_COLUMNS = [
  {
    heading: "At the station",
    links: [
      "Food and drink",
      "Payment options",
      "Station services",
      "EV charging",
      "Fuel types, safety and pricing",
    ],
  },
  {
    heading: "Z App",
    links: [
      "Pay with Z App",
      "Sharetank",
      "Pre-order food and drinks",
      "Help using Z App",
      "Z App terms and conditions",
    ],
  },
  {
    heading: "Rewards and promotions",
    links: [
      "Z Rewards",
      "Fuelup",
      "New World Clubcard",
      "Airpoints™",
      "Promotions",
      "Customer survey",
    ],
  },
  {
    heading: "For businesses",
    links: [
      "Z Business fuel card",
      "Business charging solutions",
      "Fuels and services",
      "Business tips and stories",
    ],
  },
  {
    heading: "About Z",
    links: [
      "Our story",
      "Our people",
      "What we stand for",
      "Sustainability",
      "Our commitment to Te Ao Māori",
      "News",
      "Careers at Z",
      "Corporate centre",
    ],
  },
];

function BigFooter() {
  return (
    <div className={styles.topSection}>
      <div className={styles.logoWrap}>
        <img src={zLogo} alt="Z Energy" className={styles.logo} />
      </div>

      <nav className={styles.navColumns}>
        {NAV_COLUMNS.map((col) => (
          <div key={col.heading} className={styles.column}>
            <h4 className={styles.columnHeading}>{col.heading}</h4>
            {col.links.map((link) => (
              <a key={link} href="/" className={styles.navLink}>
                {link}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.rightPanel}>
        <button type="button" className={styles.contactBtn}>
          <span>Contact us</span>
          <span className={styles.contactIcon}>
            <FaLocationDot />
          </span>
        </button>

        <div className={styles.socials}>
          <a href="/" aria-label="TikTok" className={styles.socialIcon}>
            <FaTiktok />
          </a>
          <a href="/" aria-label="Facebook" className={styles.socialIcon}>
            <FaFacebookF />
          </a>
          <a href="/" aria-label="Instagram" className={styles.socialIcon}>
            <FaInstagram />
          </a>
          <a href="/" aria-label="LinkedIn" className={styles.socialIcon}>
            <FaLinkedinIn />
          </a>
        </div>

        <div className={styles.storeBadges}>
          <a href="/" className={styles.badge}>
            <FaGooglePlay className={styles.badgeIcon} />
            <span className={styles.badgeText}>
              <small>GET IT ON</small>
              Google Play
            </span>
          </a>
          <a href="/" className={styles.badge}>
            <FaApple className={styles.badgeIcon} />
            <span className={styles.badgeText}>
              <small>Download on the</small>
              App Store
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default BigFooter;
