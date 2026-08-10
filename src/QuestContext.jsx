import { createContext, useEffect, useState } from "react";
import quests from "./data/Quests";

export const QuestContext = createContext();

const API_URL =
  "https://quest-lives.vercel.app/api/quest";

const ROBLOX_USER_ID =
  "343054291";

function getStartingQuest() {
  const savedQuest =
    localStorage.getItem("currentQuest");

  if (savedQuest) {
    try {
      return JSON.parse(savedQuest);
    } catch {
      localStorage.removeItem("currentQuest");
    }
  }

  return null;
}

export function QuestProvider({ children }) {
  const [currentQuest, setCurrentQuest] =
    useState(getStartingQuest);

  const [loadingQuest, setLoadingQuest] =
    useState(true);

  const [connectionError, setConnectionError] =
    useState(false);

  //==================================================
  // LOAD QUEST FROM ROBLOX / NEON
  //==================================================

  useEffect(() => {
    async function loadQuestFromRoblox() {
      try {
        setLoadingQuest(true);
        setConnectionError(false);

        const response = await fetch(
          `${API_URL}?userId=${ROBLOX_USER_ID}`
        );

        if (response.status === 404) {
          console.log(
            "No saved Roblox quest found yet."
          );

          setLoadingQuest(false);

          return;
        }

        if (!response.ok) {
          throw new Error(
            `Quest API returned ${response.status}`
          );
        }

        const data =
          await response.json();

        console.log(
          "Quest Lives API response:",
          data
        );

        if (
          data.success &&
          data.player &&
          data.player.current_quest
        ) {
          const quest =
            data.player.current_quest;

          const formattedQuest = {
            name:
              quest.name,

            description:
              quest.description,

            reward:
              quest.reward
          };

          setCurrentQuest(
            formattedQuest
          );

          localStorage.setItem(
            "currentQuest",
            JSON.stringify(
              formattedQuest
            )
          );

          console.log(
            "Quest loaded from Roblox:",
            formattedQuest
          );
        } else {
          console.log(
            "No current quest was found for this Roblox player."
          );
        }
      } catch (error) {
        console.error(
          "Failed to load quest from Quest Lives API:",
          error
        );

        setConnectionError(true);
      } finally {
        setLoadingQuest(false);
      }
    }

    loadQuestFromRoblox();
  }, []);

  //==================================================
  // LOCAL QUEST SPIN
  //==================================================

  function spinQuest() {
    const newQuest =
      quests[
        Math.floor(
          Math.random() * quests.length
        )
      ];

    setCurrentQuest(newQuest);

    localStorage.setItem(
      "currentQuest",
      JSON.stringify(newQuest)
    );
  }

  //==================================================
  // CONTEXT
  //==================================================

  return (
    <QuestContext.Provider
      value={{
        currentQuest,
        spinQuest,
        loadingQuest,
        connectionError
      }}
    >
      {children}
    </QuestContext.Provider>
  );
}
