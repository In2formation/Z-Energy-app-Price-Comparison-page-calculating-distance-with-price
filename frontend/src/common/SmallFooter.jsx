import { useEffect } from "react";
import styles from "./SmallFooter.module.css";
import {
  FaTiktok,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGooglePlay,
  FaApple,
} from "react-icons/fa6";
import ShieldedSite from "../assets/ShieldedSite.png";

const LEGAL_LINKS = ["Privacy", "Terms of use", "Fuel Safety Data Sheets", "Investor relations"];

function SmallFooter() {
  useEffect(() => {
    const embedScript = document.createElement("script");
    embedScript.src = "https://staticcdn.co.nz/embed/embed.js";
    embedScript.async = true;
    document.body.appendChild(embedScript);

    const initShielded = () => {
      if (typeof window.ds07o6pcmkorn !== "function") return;
      try {
        var frameName = new window.ds07o6pcmkorn({
          openElementId: "#shielded-logo",
          modalID: "modal",
        });
        frameName.init();
      } catch {
        // Shielded widget failed to initialise — non-critical, continue silently
      }
    };

    embedScript.onload = () => {
      if (document.readyState === "complete") {
        initShielded();
      } else {
        window.addEventListener("load", initShielded, { once: true });
      }
    };

    embedScript.onerror = () => {
      // Shielded embed script failed to load (e.g. CDN down) — non-critical
    };

    return () => {
      document.body.removeChild(embedScript);
    };
  }, []);

  return (
    <div className={styles.bottomSection}>
      {/* Mobile only: socials + store badges */}
      <div className={styles.mobileTop}>
        <div className={styles.socials}>
          <a href="/" aria-label="TikTok" className={styles.socialIcon}><FaTiktok /></a>
          <a href="/" aria-label="Facebook" className={styles.socialIcon}><FaFacebookF /></a>
          <a href="/" aria-label="Instagram" className={styles.socialIcon}><FaInstagram /></a>
          <a href="/" aria-label="LinkedIn" className={styles.socialIcon}><FaLinkedinIn /></a>
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

      {/* Desktop: divider */}
      <hr className={styles.divider} />

      <div className={styles.bottomBar}>
        <div className={styles.legalLinks}>
          {LEGAL_LINKS.map((item) => (
            <a key={item} href="/" className={styles.legalLink}>
              {item}
            </a>
          ))}
        </div>
        <div className={styles.copyright}>
          <span>
            Z Energy branding and trademarks belong to Z Energy Limited and are used without permission for educational purposes only.{" "}
            <a href="#" id="shielded-logo">
              <img alt="shielded" src={ShieldedSite} height="20" width="20" />
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

export default SmallFooter;
