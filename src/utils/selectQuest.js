import quests from "../data/Quests";
import activeQuest from "../data/ActiveQuest";


function selectQuest() {


  const randomIndex = Math.floor(
    Math.random() * quests.length
  );


  activeQuest.quest = quests[randomIndex];


  return activeQuest.quest;


}


export default selectQuest;