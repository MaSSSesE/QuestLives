const players = {};


function setPlayerQuest(username, quest) {


  if (!players[username]) {

    players[username] = {};

  }


  players[username].activeQuest = quest;


}



function getPlayerQuest(username) {


  if (!players[username]) {

    return null;

  }


  return players[username].activeQuest || null;


}



module.exports = {

  setPlayerQuest,

  getPlayerQuest

};