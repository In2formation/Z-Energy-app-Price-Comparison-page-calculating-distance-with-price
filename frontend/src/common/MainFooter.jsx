import styles from "./MainFooter.module.css";
import BigFooter from "./BigFooter";
import SmallFooter from "./SmallFooter";

function MainFooter() {
  return (
    <footer className={styles.mainFooter} id="top">
      <BigFooter />
      <SmallFooter />
    </footer>
  );
}

export default MainFooter;