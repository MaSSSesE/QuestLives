import { createContext, useState } from "react";
import quests from "./data/Quests";

export const QuestContext = createContext();


function getStartingQuest() {

  const savedQuest = localStorage.getItem("currentQuest");

  if (savedQuest) {
    return JSON.parse(savedQuest);
  }


  const newQuest =
    quests[Math.floor(Math.random() * quests.length)];


  localStorage.setItem(
    "currentQuest",
    JSON.stringify(newQuest)
  );


  return newQuest;
}



export function QuestProvider({ children }) {

  const [currentQuest, setCurrentQuest] =
    useState(getStartingQuest);



  function spinQuest() {

    const newQuest =
      quests[Math.floor(Math.random() * quests.length)];


    setCurrentQuest(newQuest);


    localStorage.setItem(
      "currentQuest",
      JSON.stringify(newQuest)
    );

  }



  return (

    <QuestContext.Provider
      value={{
        currentQuest,
        spinQuest
      }}
    >

      {children}

    </QuestContext.Provider>

  );

}