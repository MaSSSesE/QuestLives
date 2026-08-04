import { useState } from "react";
import playerData, { savePlayerData } from "../data/playerData";

import PointsGUI from "../GUIS/Points.png";


function Profile() {


  const [connected, setConnected] = useState(playerData.connected);
  const [loading, setLoading] = useState(false);





  async function connectRoblox() {

    setLoading(true);


    try {

      const response = await fetch(
        "http://localhost:3001/connect-roblox"
      );


      const data = await response.json();


      playerData.connected = data.connected;

      playerData.username = data.username;

      playerData.robloxId = data.robloxId;


      savePlayerData();


      setConnected(true);


    } catch (error) {

      console.log("Connection error:", error);

    }


    setLoading(false);

  }







  function disconnectRoblox() {


    playerData.connected = false;

    playerData.username = "Guest Player";

    playerData.robloxId = null;



    savePlayerData();


    setConnected(false);


  }









  return (


    <section className="profile">





      <h1>
        👤 Player Profile
      </h1>







      <div className="robloxAccount">





        <h2>
          🎮 Roblox Account
        </h2>







        <p>

          Status:

          {" "}

          {connected ? "🟢 Connected" : "🔴 Not Connected"}

        </p>








        {!connected && (


          <button

            className="connectButton"

            onClick={connectRoblox}

            disabled={loading}

          >

            {loading ? "Connecting..." : "Connect Roblox Account"}

          </button>


        )}








        {connected && (


          <>


            <p>

              Username: {playerData.username}

            </p>





            <p>

              Roblox ID: {playerData.robloxId}

            </p>






            <button

              className="disconnectButton"

              onClick={disconnectRoblox}

            >

              Disconnect Roblox Account

            </button>



          </>


        )}







      </div>









      <div className="profileStats">





        <h2>

          <img
            src={PointsGUI}
            className="smallPointsIcon"
            alt="Points"
          />

          Player Stats

        </h2>







        <p>

          <img
            src={PointsGUI}
            className="smallPointsIcon"
            alt="Points"
          />

          Points: {playerData.points}

        </p>







        <p>
          🎯 Quests Completed: {playerData.questsCompleted}
        </p>







        <p>
          🏆 Rank: {playerData.rank}
        </p>







        <p>
          🔥 Quest Streak: 0 Days
        </p>







        <p>
          📅 Member Since: Today
        </p>







      </div>







    </section>


  );


}


export default Profile;