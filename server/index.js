const express = require("express");
const cors = require("cors");
const {
  setPlayerQuest,
  getPlayerQuest
} = require("./questData");


const app = express();


app.use(cors());

app.use(express.json());





app.get("/", (req, res) => {

  res.send("Quest Lives Server Running!");

});





app.post("/set-quest", (req, res) => {


  const { username, quest } = req.body;


  setPlayerQuest(username, quest);


  res.json({

    success: true,

    message: "Quest saved!"

  });


});





app.get("/get-quest/:username", (req, res) => {


  const quest = getPlayerQuest(
    req.params.username
  );


  res.json({

    quest: quest

  });


});
const PORT = 3001;


app.listen(PORT, () => {

  console.log(`Quest Lives Server running on port ${PORT}`);

});
app.get("/connect-roblox", (req, res) => {

  res.json({

    username: "DemoPlayer",

    robloxId: "123456789",

    connected: true

  });

});