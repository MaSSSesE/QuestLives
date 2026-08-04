import { useContext } from "react";
import { QuestContext } from "../QuestContext";

import PointsGUI from "../GUIS/Points.png";


function QuestPage() {

  const { currentQuest } =
    useContext(QuestContext);



  return (

    <div className="page">


      <h1>
        Current Quest
      </h1>





      <div className="questInfoCard">


        <h2>
          🎯 {currentQuest.name}
        </h2>



        <p>
          <b>
            Complete:
          </b>

          <br />

          Finish this quest in real life, then get points for it!

        </p>


      </div>








      <div className="rewardCard">


        <h2>
          Rewards
        </h2>


        <p>

          <img
            src={PointsGUI}
            className="smallPointsIcon"
            alt="Points"
          />

          +{currentQuest.reward} Points

        </p>


      </div>








      <div className="proofCard">


        <h2>
          📸 Proof Needed
        </h2>



        <p>
          You have to upload proof after completing the quest.
        </p>



      </div>








      <div className="statusCard">


        <h2>
          ⏳ Status
        </h2>



        <p>
          Waiting for completion...
        </p>



      </div>








      <div className="spinCard">


        <h2>
          🎡 Spin Status
        </h2>


        <p>
          Complete your quest correctly and respin the HUGE wheel!
        </p>


      </div>





    </div>

  );

}


export default QuestPage;