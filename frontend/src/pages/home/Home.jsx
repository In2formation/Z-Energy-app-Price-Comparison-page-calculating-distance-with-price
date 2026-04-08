/**
 * Purpose:
 * Render the Home page experience with hero content, key actions, service highlights,
 * rewards content, app promotion, and shared footer/chatbot elements.
 *
 * What:
 * This file defines Home page structure, section ordering, action links, and static
 * content blocks that match the agreed UX wireframe direction.
 *
 * Why:
 * Keeping all Home-specific UI composition in one page component makes UX iteration
 * faster and safer without affecting other routes.
 */
import styles from "./Home.module.css";
import AIChatbot from "../../common/AIChatbot";
import { Link } from "react-router-dom";
import BigFooter from "../../common/BigFooter.jsx";
import SmallFooter from "../../common/SmallFooter.jsx";
import heroImage from "../../assets/Landing page image.png";
import mapBackgroundImage from "../../assets/Map Background image.png";
import appImage from "../../assets/App Image.png";
import {
  FaArrowRight,
  FaCircleArrowRight,
  FaGlassWater,
  FaTrailer,
  FaPumpSoap,
  FaUtensils,
  FaGasPump,
  FaCompass,
  FaDollarSign,
  FaArrowsLeftRight,
} from "react-icons/fa6";

// Primary journey actions shown as prominent links near the top of the services area.
const PRIMARY_ACTIONS = [
  {
    id: "find-station",
    label: "Find a Station",
    to: "/find-a-station",
    icon: <FaGasPump />,
  },
  {
    id: "get-directions",
    label: "Get Directions",
    to: "/get-directions",
    icon: <FaCompass />,
  },
  {
    id: "compare-prices",
    label: "Compare Prices",
    to: "/compare-prices",
    icon: (
      <span className={styles.comparePriceIcon} aria-hidden="true">
        <FaDollarSign />
        <FaArrowsLeftRight className={styles.compareArrow} />
        <FaDollarSign />
      </span>
    ),
  },
];

// Station capability highlights shown as compact cards with quick visual scanning.
const STATION_SERVICES = [

  { id: "trailer", label: "Trailer hire", icon: <FaTrailer /> },

  { id: "lpg", label: "LPG bottle swap", icon: <FaGlassWater /> },

  { id: "carwash", label: "Car wash", icon: <FaPumpSoap /> },

  { id: "food", label: "Food and drink", icon: <FaUtensils /> },

];

// Product and loyalty cards that promote value-added offerings beyond fuel.
const REWARD_CARDS = [

  {

    id: "rewards",

    title: "Z Rewards",

    description:

      "Save on gas the easy way with points from every fill-up and selected in-store purchases.",

  },

  {

    id: "business",

    title: "Your business is our business",

    description:

      "Looking after your team and fleet starts here with reliable station support and easy tracking.",

  },

  {

    id: "zapp",

    title: "Z app - it's one pain off your hands",

    description:

      "Plan your drive and pay quickly with your phone so you can get back on the road faster.",

  },

];

function Home() {
  return (
    <section className={styles.page} id="top">
      <div className={styles.surfaceWrap}>
        {/* Hero image anchors the page with a branded station context. */}
        <img src={heroImage} alt="Z Energy station at night" className={styles.heroImage} />

        {/* Intro banner communicates the core value proposition in one glance. */}
        <section className={styles.introPanel}>
          <img
            src={mapBackgroundImage}
            alt="Map background"
            className={styles.mapBackground}
            aria-hidden="true"
          />
          <div className={styles.introCopy}>
            <h1>There where you need us</h1>
          </div>
        </section>

        {/* Services section combines quick actions and service cards. */}
        <section className={styles.servicesSection}>
          <h2>What you need, made easy</h2>
          <p>
            Moving furniture? Hangry for a pie and barista made coffee? Have a dirty car
            that needs some love? We&apos;ve got you covered.
          </p>

          <div className={styles.actionButtonsRow}>
            {PRIMARY_ACTIONS.map((action) => (
              <Link
                key={action.id}
                to={action.to}
                className={styles.actionButton}
              >
                <span className={styles.actionButtonIcon} aria-hidden="true">
                  {action.icon}
                </span>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>

          {/* Service cards surface on-site utilities users often look for first. */}
          <div className={styles.serviceGrid}>
            {STATION_SERVICES.map((service) => (
              <article key={service.id} className={styles.serviceCard}>
                <span className={styles.serviceIcon}>{service.icon}</span>
                <span>{service.label}</span>
                <FaCircleArrowRight className={styles.serviceArrow} />
              </article>
            ))}
          </div>
        </section>

        {/* Rewards section highlights key programs and app value propositions. */}
        <section className={styles.rewardsSection}>
          <h2>Make the most of Z</h2>
          <div className={styles.rewardsGrid}>
            {REWARD_CARDS.map((card) => (
              <article key={card.id} className={styles.rewardCard}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <FaCircleArrowRight className={styles.rewardArrow} />
              </article>
            ))}
          </div>
        </section>

        {/* App feature section draws attention to Sharetank and app onboarding. */}
        <section className={styles.sharetankSection}>
          <div className={styles.sharetankCopy}>
            <h2>
              <span>Z APP</span>
              Sharetank
            </h2>
            <p>
              Sign up for Z app and discover all app features, rewards, and easy payment
              options for every journey.
            </p>
            <Link to="/" className={styles.learnMoreButton}>
              Learn more <FaArrowRight />
            </Link>
          </div>
          <img src={appImage} alt="Z App Sharetank" className={styles.sharetankImage} />
        </section>
      </div>

      {/* Floating assistant remains available while browsing Home content. */}
      <div className={styles.chatSection}>
        <AIChatbot />
      </div>
      <BigFooter />
      <SmallFooter />
    </section>
  );
}

export default Home;