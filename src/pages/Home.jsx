import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useContext } from "react";

import { QuestContext } from "../QuestContext";

import QuestLivesLogo from "../GUIS/QuestLives.png";
import PointsGUI from "../GUIS/Points.png";

function Home() {
  const { currentQuest } = useContext(QuestContext);

  const areas = [
    "THE CITY",
    "FANTASY ISLAND",
    "MEDIEVAL VILLAGE",
    "SCIENCE LAB",
    "ZOMBIE APOCALYPSE",
    "PIRATE ISLAND",
    "SUSHI RESTAURANT",
    "OUTER SPACE",
    "MONSTER WORLD",
    "CYBERPUNK",
    "PARK",
    "THE RUINS",
    "ZOO",
    "HOUSE",
    "TREE ISLAND",
    "FISHING ISLAND",
    "FARM",
    "TOWN",
    "DUNGEON",
    "TRAIN AREA",
    "RANDOM ANIMAL AREA",
    "PREHISTORIC TIMES",
    "THE STREET",
    "FOREST",
    "WAR",
  ];

  const questName = currentQuest?.name || "NO TICKET QUEST YET";

  const questDescription =
    currentQuest?.description ||
    "Spin the quest wheel in Roblox to receive your next real-world adventure.";

  const questReward = currentQuest?.reward || 0;

  return (
    <motion.main
      className="homePage"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="homeHero">
        <div className="heroGlow heroGlowOne" />
        <div className="heroGlow heroGlowTwo" />

        <div className="heroContent">
          <div className="heroBadge">
            <span className="heroBadgeDot" />
            REAL WORLD QUESTING
          </div>

          <img
            src={QuestLivesLogo}
            className="heroLogo"
            alt="Quest Lives"
          />

          <h1>
            THE WORLD
            <br />
            IS YOUR QUEST.
          </h1>

          <p className="heroDescription">
            Complete real-world challenges, earn points,
            discover new adventures, and build your Quest
            Lives journey one quest at a time.
          </p>

          <div className="heroButtons">
            <Link
              to="/submit-proof"
              className="primaryHeroButton"
            >
              <span>START QUESTING</span>
              <span className="buttonArrow">→</span>
            </Link>

            <a
              href="#areas"
              className="secondaryHeroButton"
            >
              EXPLORE AREAS
            </a>
          </div>
        </div>

        <div className="heroVisual">
          <div className="heroVisualGlow" />

          <div className="heroOrb">
            <div className="heroOrbInner">
              <img
                src={PointsGUI}
                alt=""
              />
            </div>
          </div>

          <div className="floatingCard floatingCardTop">
            <span className="floatingCardLabel">
              QUEST STATUS
            </span>

            <strong>READY</strong>
          </div>

          <div className="floatingCard floatingCardBottom">
            <span className="floatingCardLabel">
              TICKET QUEST
            </span>

            <strong>
              +{questReward}
            </strong>

            <small>POINTS</small>
          </div>
        </div>
      </section>

      {/* =====================================================
          YOUR ADVENTURE
          ===================================================== */}

      <section className="adventureSection">
        <div className="sectionIntro">
          <span className="sectionEyebrow">
            YOUR JOURNEY
          </span>

          <h2>YOUR ADVENTURE</h2>

          <p>
            Every quest moves you forward.
          </p>
        </div>

        <div className="adventureStats">
          <div className="adventureStat pointsStat">
            <span className="statNumber">0</span>

            <span className="statLabel">
              POINTS
            </span>

            <span className="statDescription">
              Earned from completed quests
            </span>
          </div>

          <div className="adventureStat ticketsStat">
            <span className="statNumber">0</span>

            <span className="statLabel">
              TICKETS
            </span>

            <span className="statDescription">
              Ready for your next adventure
            </span>
          </div>

          <div className="adventureStat questsStat">
            <span className="statNumber">0</span>

            <span className="statLabel">
              QUESTS
            </span>

            <span className="statDescription">
              Adventures completed
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          YOUR TICKET QUEST
          ===================================================== */}

      <section className="featuredQuestSection">
        <div className="featuredQuestVisual">
          <div className="featuredQuestOverlay" />

          <div className="featuredQuestContent">
            <span className="sectionEyebrow">
              YOUR TICKET QUEST
            </span>

            <h2>{questName}</h2>

            <p>{questDescription}</p>

            <div className="featuredQuestReward">
              <span>REWARD</span>

              <strong>
                +{questReward}
              </strong>

              <small>POINTS</small>
            </div>

            <Link
              to="/submit-proof"
              className="featuredQuestButton"
            >
              VIEW QUEST
              <span>→</span>
            </Link>
          </div>

          {/* =================================================
              RIGHT SIDE QUEST PANEL
              ================================================= */}

          <div className="featuredQuestSide">
            <div className="ticketIcon">
              T
            </div>

            <span className="ticketLabel">
              TICKET QUEST
            </span>

            <strong>1</strong>

            <span className="ticketText">
              TICKET REQUIRED
            </span>

            <div className="ticketDivider" />

            <span className="ticketHint">
              Spin your quest wheel in Roblox
              to receive your next adventure.
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          ALL AREAS
          ===================================================== */}

      <section
        className="discoverSection"
        id="areas"
      >
        <div className="sectionIntro">
          <span className="sectionEyebrow">
            EXPLORE
          </span>

          <h2>ALL AREAS</h2>

          <p>
            Unlock new worlds as you progress through Quest Lives.
          </p>
        </div>

        <div className="worldGrid">
          {areas.map((area, index) => (
            <div
              className="worldCard lockedWorld"
              key={area}
            >
              <span className="worldNumber">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="worldCardContent">
                <h3>{area}</h3>

                <span className="worldStatus">
                  LOCKED
                </span>
              </div>

              <span className="worldArrow">
                →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <section className="homeFinalCTA">
        <div className="finalCTAGlow" />

        <span className="sectionEyebrow">
          YOUR NEXT ADVENTURE AWAITS
        </span>

        <h2>
          READY TO
          <br />
          QUEST?
        </h2>

        <p>
          There's always another challenge waiting.
        </p>

        <Link
          to="/submit-proof"
          className="finalCTAButton"
        >
          START YOUR QUEST
          <span>→</span>
        </Link>
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="homeFooter">
        <img
          src={QuestLivesLogo}
          alt="Quest Lives"
        />

        <span>QUEST LIVES</span>

        <small>
          THE WORLD IS YOUR QUEST.
        </small>
      </footer>
    </motion.main>
  );
}

export default Home;