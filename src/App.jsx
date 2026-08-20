import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import SubmitProof from "./pages/SubmitProof";
import Settings from "./pages/Settings";

import "./App.css";

function AnimatedPage({ children }) {
  return (
    <motion.div
      className="animatedPage"
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -18,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        <Route
          path="/"
          element={
            <Navigate
              to="/submit-proof"
              replace
            />
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
          path="/settings"
          element={
            <AnimatedPage>
              <Settings />
            </AnimatedPage>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/submit-proof"
              replace
            />
          }
        />

      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="app">
      <AnimatedRoutes />
    </div>
  );
}

export default App;