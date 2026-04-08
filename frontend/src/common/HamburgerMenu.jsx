import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./HamburgerMenu.module.css";
import ZLogo from "../assets/Z Energy NZ_symbol.png";
import loginButtonTemplate from "../assets/LoginButton.png";
import { FaArrowRight } from "react-icons/fa";
import MagGlass from "../assets/MagGlass.png";
import MagDivide from "../assets/MagDivide.png";
import ModalExit from "../assets/ModalExit.png";

function HamburgerMenu({ onClose, mode, setMode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        handleClose();
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const LoginButton = (
  <div className={styles.loginWrapper} onClick={handleClose}>
    <img
      src={loginButtonTemplate}
      alt="Login button template"
      className={styles.loginImage}
    />
    <span className={styles.loginContent}>
      Login
      <span className={styles.loginArrow}>
        <FaArrowRight />
      </span>
    </span>
  </div>
);



  return (
    <div className={styles.overlay}>
      <div className={`${styles.menu} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logoContainer}>
          <img src={ZLogo} alt="Z Energy Logo" className={styles.logo} />
        </div>

        <div className={styles.iconRow}>
          <img src={MagGlass} alt="Search" className={styles.clickableIcon} />
          <img src={MagDivide} alt="Divider" />
          <img
            src={ModalExit}
            alt="Close modal"
            className={styles.clickableIcon}
            onClick={handleClose}
          />
        </div>

        {/* toggle buttons */}
        <div className={styles.toggle}>
          <button
            onClick={() => setMode("personal")}
            className={
              mode === "personal" ? styles.activeToggle : styles.inactiveToggle
            }
          >
            For Personal
          </button>
          <button
            onClick={() => setMode("business")}
            className={
              mode === "business" ? styles.activeToggle : styles.inactiveToggle
            }
          >
            For Business
          </button>
        </div>

        {mode === "personal" ? (
          <nav>
            <div>At the station</div>
            <div>Rewards and promotions</div>
            <div>Z App</div>
            <div className={styles.noChevron}>Locations</div>
            <br />
            <hr />
            <Link to="/download">Download Z App</Link>
            <Link to="/about">About Z</Link>
            <div className={styles.loginWrapper}>{LoginButton}</div>
          </nav>
        ) : (
          <nav>
            <div>Z Business Plus</div>
            <div>Z Business fuel card</div>
            <div>Fuels and Services</div>
            <div>Business charging</div>
            <div className={styles.noChevron}>Locations</div>
            <hr />
            <Link to="/download">Download Z App</Link>
            <Link to="/about">About Z</Link>
            <div className={styles.loginWrapper}>{LoginButton}</div>
          </nav>
        )}
      </div>
    </div>
  );
}

export default HamburgerMenu;

