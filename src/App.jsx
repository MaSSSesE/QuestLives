import { Routes, Route, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import QuestLivesLogo from "./GUIS/QuestLives.png";
import ProofIcon from "./GUIS/Proof.png";

import SubmitProof from "./pages/SubmitProof";

import "./App.css";



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


      <Route
        path="/"
        element={

          <AnimatedPage>

            <SubmitProof />

          </AnimatedPage>

        }
      />


      <Route
        path="/submit-proof"
        element={

          <AnimatedPage>

            <SubmitProof />

          </AnimatedPage>

        }
      />


      <Route
        path="*"
        element={

          <AnimatedPage>

            <SubmitProof />

          </AnimatedPage>

        }
      />


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


          <a
            href="/submit-proof"
            className="proofLink"
          >

            <button className="guiButton">

              <img
                src={ProofIcon}
                className="guiIcon"
                alt="Submit Proof"
              />

            </button>

          </a>


        </div>


      </nav>


      <AnimatedRoutes />


    </div>

  );

}



export default App;