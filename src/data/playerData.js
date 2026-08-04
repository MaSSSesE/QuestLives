const savedData = localStorage.getItem("questLivesPlayer");


const playerData = savedData

  ? JSON.parse(savedData)

  : {

      connected: false,

      username: "Guest Player",

      robloxId: null,

      points: 0,

      questsCompleted: 0,

      rank: "New Player"

    };



export function savePlayerData() {

  localStorage.setItem(

    "questLivesPlayer",

    JSON.stringify(playerData)

  );

}



export default playerData;