// ----- IMPORTS ----- //
import { useState } from "react";
import styles from "./Header.module.css";
import { Link } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import zSymbol from "../assets/Z Energy NZ_symbol.png";
import zLogo from "../assets/Z Energy NZ_logo1.png";
import { VscSearch } from "react-icons/vsc";
import { FaBars } from "react-icons/fa6";
import { FaChevronDown } from "react-icons/fa";

function Header() {
  const [toggleButton, setToggleButton] = useState("personal");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      {/* ----- MOBILE HEADER ----- */}
      <div className={styles.mobileHeader}>
        <Link to="/">
          <img
            src={zSymbol}
            alt="Z Energy logo symbol"
            className={styles.mobileLogo}
          />
        </Link>
        <div className={styles.iconContainer}>
          <VscSearch className={styles.searchIcon} />
          <FaBars
            className={styles.hamburgerIcon}
            onClick={() => setMenuOpen(true)} // OPEN MENU
          />
        </div>
      </div>

      {/* Hamburger Menu Modal */}
      {menuOpen && (
        <HamburgerMenu
          onClose={() => setMenuOpen(false)} // CLOSE MENU
          mode={toggleButton} // current state
          setMode={setToggleButton} // pass setter so buttons work
        />
      )}

      {/* ----- DESKTOP HEADER ----- */}
      <div className={styles.desktopHeader}>
        <div className={styles.desktopRow1Outer}>
          {/* ROW 1 */}
          <div className={styles.desktopRow1}>
            {/* Logo */}
            <Link to="/">
              <img
                src={zLogo}
                alt="Z Energy Logo"
                className={styles.desktopLogo}
              />
            </Link>
            <div className={styles.toggle}>
              {/* Toggle buttons */}
              <button
                onClick={() => setToggleButton("personal")}
                className={
                  toggleButton === "personal"
                    ? styles.activeToggle
                    : styles.inactiveToggle
                }
              >
                For Personal
              </button>
              <button
                onClick={() => setToggleButton("business")}
                className={
                  toggleButton === "business"
                    ? styles.activeToggle
                    : styles.inactiveToggle
                }
              >
                For Business
              </button>
            </div>

            {/* Nav Links */}
            <div className={styles.navLinks}>
              <a href="#">Download Z App</a>
              <a href="#">About Z</a>
            </div>

            {/* Search and Login */}
            <div className={styles.searchLogin}>
              <VscSearch className={styles.desktopSearchIcon} />
              <button className={styles.loginButton}>Login</button>
            </div>
          </div>
        </div>

        {/* ROW 2 */}
        <div className={styles.desktopRow2Outer}>
          <div className={styles.desktopRow2}>
            {/* Dropdown nav links (non-functional) */}
            <div className={styles.navItem}>
              <span>At the station</span>
              <FaChevronDown className={styles.chevron} />
            </div>
            <div className={styles.navItem}>
              <span>Rewards and Promotions</span>
              <FaChevronDown className={styles.chevron} />
            </div>
            <div className={styles.navItem}>
              <span>Z App</span>
              <FaChevronDown className={styles.chevron} />
            </div>
            <div className={styles.navItem}>
              <span>Locations</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
