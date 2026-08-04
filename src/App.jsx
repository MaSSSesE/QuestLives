import { useContext } from "react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { QuestContext } from "./QuestContext";

import QuestLivesLogo from "./GUIS/QuestLives.png";
import PointsGUI from "./GUIS/Points.png";

import QuestPage from "./pages/QuestPage";
import SubmitProof from "./pages/SubmitProof";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

import "./App.css";

import DashboardIcon from "./GUIS/Dashboard.png";
import QuestIcon from "./GUIS/Quests.png";
import ProofIcon from "./GUIS/Proof.png";
import LeaderboardIcon from "./GUIS/Leaderboard.png";
import ProfileIcon from "./GUIS/Profile.png";



function Dashboard() {


  const { currentQuest } = useContext(QuestContext);





  return (

    <>


      <header>

        <h1>
          Quest Lives
        </h1>


      
          
      


      </header>






      <section className="stats">


        <h2>

          <img
            src={PointsGUI}
            className="smallPointsIcon"
            alt="Points"
          />

          Your Stats

        </h2>



        <p>
          Points: 0
        </p>


        <p>
          Quests Completed: 0
        </p>


        <p>
          Rank: New Player
        </p>



      </section>








      <section className="quest">


        <h2>
          🎯 Current Quest
        </h2>




        {currentQuest ? (

          <>


            <h3>
              {currentQuest.name}
            </h3>



            <p>
                When you complete this quest in real life, you will get Points!
            </p>




            <p>

              <img
                src={PointsGUI}
                className="smallPointsIcon"
                alt="Points"
              />

              Reward: {currentQuest.reward} Points

            </p>




            <p>
              Your proof has to be a video/image.
            </p>



          </>



        ) : (


          <p>
            Loading quest...
          </p>


        )}



      </section>








      <section className="leaderboard">


        <h2>
          🏆 Leaderboard
        </h2>



        <p>
          #1 Player - ??? Points
        </p>



        <p>
          #2 Player - ??? Points
        </p>



        <p>
          #3 Player - ??? Points
        </p>



      </section>



    </>

  );


}









function AnimatedPage({ children }) {


  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 25
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      exit={{
        opacity: 0,
        y: -25
      }}

      transition={{
        duration: 0.35
      }}

    >

      {children}

    </motion.div>

  );


}









function AnimatedRoutes() {


  const location = useLocation();



  return (

    <Routes location={location} key={location.pathname}>


      <Route path="/" element={
        <AnimatedPage>
          <Dashboard />
        </AnimatedPage>
      } />



      <Route path="/quests" element={
        <AnimatedPage>
          <QuestPage />
        </AnimatedPage>
      } />



      <Route path="/submit-proof" element={
        <AnimatedPage>
          <SubmitProof />
        </AnimatedPage>
      } />



      <Route path="/leaderboard" element={
        <AnimatedPage>
          <Leaderboard />
        </AnimatedPage>
      } />



      <Route path="/profile" element={
        <AnimatedPage>
          <Profile />
        </AnimatedPage>
      } />



    </Routes>

  );


}









function App() {


  return (

    <div className="app">



      <nav className="navbar">


        <img
          src={QuestLivesLogo}
          className="navbarLogo"
          alt="Quest Lives Logo"
        />




        <div className="navLinks">


          <Link to="/">
            <button className="guiButton">
              <img
                src={DashboardIcon}
                className="guiIcon"
                alt="Dashboard"
              />
            </button>
          </Link>




          <Link to="/quests">
            <button className="guiButton">
              <img
                src={QuestIcon}
                className="guiIcon"
                alt="Quests"
              />
            </button>
          </Link>




          <Link to="/submit-proof">
            <button className="guiButton">
              <img
                src={ProofIcon}
                className="guiIcon"
                alt="Proof"
              />
            </button>
          </Link>




          <Link to="/leaderboard">
            <button className="guiButton">
              <img
                src={LeaderboardIcon}
                className="guiIcon"
                alt="Leaderboard"
              />
            </button>
          </Link>




          <Link to="/profile">
            <button className="guiButton">
              <img
                src={ProfileIcon}
                className="guiIcon"
                alt="Profile"
              />
            </button>
          </Link>



        </div>


      </nav>





      <AnimatedRoutes />



    </div>

  );


}



export default App;