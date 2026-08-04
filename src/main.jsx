import { BrowserRouter } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QuestProvider } from "./QuestContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QuestProvider>
        <App />
      </QuestProvider>
    </BrowserRouter>
  </StrictMode>
);