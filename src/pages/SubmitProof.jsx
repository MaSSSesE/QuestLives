import { useState, useContext } from "react";
import { QuestContext } from "../QuestContext";

import PointsGUI from "../GUIS/Points.png";


function SubmitProof() {

  const { currentQuest, spinQuest } = useContext(QuestContext);

  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState("");
  const [fileType, setFileType] = useState("");

  const [status, setStatus] = useState("waiting");
  const [confidence, setConfidence] = useState(null);





  function handleFileChange(event) {

    const selectedFile = event.target.files[0];


    if (selectedFile) {

      setFile(selectedFile);

      setFileURL(
        URL.createObjectURL(selectedFile)
      );

      setFileType(selectedFile.type);

      setStatus("waiting");

      setConfidence(null);

    }

  }








  function submitProof() {

    if (!file || status === "checking") {
      return;
    }



    setStatus("checking");



    setTimeout(() => {


      const score =
        Math.floor(Math.random() * 41) + 60;



      setConfidence(score);



      if (score >= 75) {

        setStatus("approved");

      } else {

        setStatus("rejected");

      }



    }, 3000);


  }








  function retry() {

    setFile(null);

    setFileURL("");

    setFileType("");

    setConfidence(null);

    setStatus("waiting");

  }








  function spinAgain() {

    spinQuest();

    retry();

  }









  return (


    <div className="page">



      <h1>
        📸 Submit Proof
      </h1>








      <div className="questInfoCard">


        <h2>
          🎯 Current Quest
        </h2>



        <h3>
          {currentQuest.name}
        </h3>



        <p>
          Upload a picture or video proving you completed your quest.
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
          📤 Submit Your Proof
        </h2>



        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
        />








        {file && (

          <div>


            <h3>
              📂 Proof Preview
            </h3>






            {fileType.startsWith("image") && (

              <img
                src={fileURL}
                alt="Proof"
                width="300"
                style={{
                  borderRadius: "15px"
                }}
              />

            )}








            {fileType.startsWith("video") && (

              <video

                width="300"

                controls

                style={{
                  borderRadius: "15px"
                }}

              >

                <source src={fileURL}/>

              </video>

            )}






            <p>
              File:
              <br />
              {file.name}
            </p>



          </div>

        )}







        {status === "waiting" && file && (

          <button onClick={submitProof}>
            Submit the Proof!
          </button>

        )}



      </div>









      {status === "checking" && (


        <div className="aiCard">


          <h2>
            🤖 QLAI
          </h2>



          <p>
            Analyzing proof...
          </p>



          <h3>
            Processing...
          </h3>



        </div>


      )}










      {status === "approved" && (


        <div className="approvedBox">



          <h2>
            ✅ YOUR QUEST GOT APPROVED! NOW YOU GET THESE POINTS!
          </h2>




          <h3>
            Confidence you are right: {confidence}%
          </h3>




          <p>

            <img
              src={PointsGUI}
              className="smallPointsIcon"
              alt="Points"
            />

            +{currentQuest.reward} Points

          </p>





          <button onClick={spinAgain}>

            Go to the Roblox game to spin again!

          </button>



        </div>


      )}









      {status === "rejected" && (


        <div className="rejectedBox">



          <h2>
            ❌ YOUR QUEST GOT REJECTED BECAUSE YOU DIDN'T DO IT CORRECTLY! YOU DON'T GET ANY POINTS!
          </h2>





          <h3>
            🤖 AI Confidence: {confidence}%
          </h3>





          <p>
            The proof does not clearly match the quest requirements.
          </p>





          <button onClick={retry}>

            Click to try again!

          </button>




        </div>


      )}






    </div>


  );


}


export default SubmitProof;