import { createContext, useEffect, useState } from "react";
import quests from "./data/Quests";

export const QuestContext = createContext();

const API_URL =
  "https://quest-lives.vercel.app/api/quest";

const ROBLOX_USER_ID =
  "343054291";

//==================================================
// GET STARTING QUEST
//==================================================

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

//==================================================
// GET STARTING PLAYER STATS
//==================================================

function getStartingStats() {
  const savedStats =
    localStorage.getItem("questLivesStats");

  if (savedStats) {
    try {
      return JSON.parse(savedStats);
    } catch {
      localStorage.removeItem("questLivesStats");
    }
  }

  return {
    points: 0,
    tickets: 0,
    questsCompleted: 0,
  };
}

//==================================================
// QUEST PROVIDER
//==================================================

export function QuestProvider({ children }) {
  const [currentQuest, setCurrentQuest] =
    useState(getStartingQuest);

  const [playerStats, setPlayerStats] =
    useState(getStartingStats);

  const [loadingQuest, setLoadingQuest] =
    useState(true);

  const [connectionError, setConnectionError] =
    useState(false);

  //==================================================
  // LOAD PLAYER DATA FROM ROBLOX / NEON
  //==================================================

  useEffect(() => {
    async function loadPlayerDataFromRoblox() {
      try {
        setLoadingQuest(true);
        setConnectionError(false);

        const response = await fetch(
          `${API_URL}?userId=${ROBLOX_USER_ID}`
        );

        if (response.status === 404) {
          console.log(
            "No saved Roblox player data found yet."
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
          data.player
        ) {
          const player =
            data.player;

          //==============================================
          // LOAD CURRENT QUEST
          //==============================================

          if (player.current_quest) {
            const quest = {
              name:
                player.current_quest.name,

              description:
                player.current_quest.description,

              reward:
                player.current_quest.reward,
            };

            setCurrentQuest(quest);

            localStorage.setItem(
              "currentQuest",
              JSON.stringify(quest)
            );

            console.log(
              "Quest loaded from Roblox:",
              quest
            );
          }

          //==============================================
          // LOAD PLAYER STATS
          //==============================================

          const updatedStats = {
            points:
              Number(player.points) || 0,

            tickets:
              Number(player.tickets) || 0,

            questsCompleted:
              Number(player.quests_completed) || 0,
          };

          setPlayerStats(
            updatedStats
          );

          localStorage.setItem(
            "questLivesStats",
            JSON.stringify(updatedStats)
          );

          console.log(
            "Player stats loaded from Roblox:",
            updatedStats
          );
        } else {
          console.log(
            "No player data was found."
          );
        }
      } catch (error) {
        console.error(
          "Failed to load player data from Quest Lives API:",
          error
        );

        setConnectionError(true);
      } finally {
        setLoadingQuest(false);
      }
    }

    loadPlayerDataFromRoblox();
  }, []);

  //==================================================
  // LOCAL QUEST SPIN
  //==================================================

  function spinQuest() {
    console.log(
      "Spinning Quest Lives quest..."
    );

    if (
      !quests ||
      quests.length === 0
    ) {
      console.error(
        "Quest list is empty."
      );

      return;
    }

    const randomIndex =
      Math.floor(
        Math.random() *
        quests.length
      );

    const newQuest =
      quests[randomIndex];

    console.log(
      "New quest selected:",
      newQuest
    );

    setCurrentQuest(
      newQuest
    );

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

        setCurrentQuest,

        spinQuest,

        playerStats,

        setPlayerStats,

        loadingQuest,

        connectionError,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
}