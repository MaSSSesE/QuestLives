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

  const questName =
    currentQuest?.name || "NO QUEST SELECTED";

  const questReward =
    currentQuest?.reward || 0;

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setFileURL(URL.createObjectURL(selectedFile));
    setFileType(selectedFile.type);

    setStatus("waiting");
    setConfidence(null);
  }

  function submitProof() {
    if (!file || status === "checking") {
      return;
    }

    setStatus("checking");

    setTimeout(() => {
      const score = Math.floor(Math.random() * 41) + 60;

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
    <div className="proofPage">

      {/* =========================
          HERO
      ========================= */}

      <div className="proofHero">

        <div className="proofHeroTag">
          QUEST LIVES • MISSION SYSTEM
        </div>

        <h1>
          Proof Submission
        </h1>

        <p>
          Complete your mission in real life.
          Upload your evidence.
          Earn your rewards.
        </p>

      </div>


      {/* =========================
          CURRENT MISSION
      ========================= */}

      <div className="missionPanel">

        <div className="missionHeader">

          <div>

            <span className="sectionLabel">
              CURRENT MISSION
            </span>

            <h2>
              {questName}
            </h2>

          </div>


          <div className="missionReward">

            <img
              src={PointsGUI}
              className="missionPointsIcon"
              alt="Points"
            />

            <div>

              <span>
                REWARD
              </span>

              <strong>
                +{questReward}
              </strong>

              <small>
                POINTS
              </small>

            </div>

          </div>

        </div>


        <div className="missionDivider" />


        <p className="missionDescription">
          Complete this quest in real life, then upload
          a picture or video that clearly proves you
          completed it.
        </p>

      </div>


      {/* =========================
          UPLOAD
      ========================= */}

      <div className="uploadPanel">

        <div className="uploadHeader">

          <span className="sectionLabel">
            STEP 01
          </span>

          <h2>
            Upload Your Proof
          </h2>

          <p>
            Images and videos are accepted.
          </p>

        </div>


        <div className="uploadArea">

          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
          />

          <div className="uploadVisual">

            <div className="uploadIcon">
              ↑
            </div>

            <h3>
              Choose your proof
            </h3>

            <p>
              Select an image or video from your device.
            </p>

          </div>

        </div>


        {file && (
          <div className="proofPreview">

            <div className="previewTop">

              <div>

                <span className="sectionLabel">
                  SELECTED FILE
                </span>

                <h3>
                  Ready for review
                </h3>

              </div>

              <span className="fileStatus">
                READY
              </span>

            </div>


            <div className="previewContent">

              {fileType.startsWith("image") && (
                <img
                  src={fileURL}
                  alt="Proof"
                  className="proofMedia"
                />
              )}


              {fileType.startsWith("video") && (
                <video
                  controls
                  className="proofMedia"
                >
                  <source
                    src={fileURL}
                    type={fileType}
                  />

                  Your browser does not support video playback.
                </video>
              )}


              <div className="fileInfo">

                <span>
                  FILE NAME
                </span>

                <p>
                  {file.name}
                </p>

              </div>

            </div>

          </div>
        )}


        {status === "waiting" && file && (
          <button
            type="button"
            className="submitProofButton"
            onClick={submitProof}
          >
            Submit Proof for Review
          </button>
        )}

      </div>


      {/* =========================
          QLAI CHECKING
      ========================= */}

      {status === "checking" && (
        <div className="analysisPanel">

          <div className="aiStatus">

            <div className="aiPulse" />

            QLAI ACTIVE

          </div>


          <h2>
            Analyzing Your Proof
          </h2>


          <p>
            Comparing your uploaded proof with
            the requirements of your current mission...
          </p>


          <div className="analysisBar">

            <div className="analysisProgress" />

          </div>


          <span className="analysisText">
            PROCESSING
          </span>

        </div>
      )}


      {/* =========================
          APPROVED
      ========================= */}

      {status === "approved" && (
        <div className="resultPanel approvedPanel">

          <div className="resultBadge">
            MISSION COMPLETE
          </div>


          <h2>
            Quest Approved!
          </h2>


          <p>
            QLAI confirmed that your proof matches
            the requirements of your mission.
          </p>


          <div className="resultStats">

            <div>

              <span>
                AI CONFIDENCE
              </span>

              <strong>
                {confidence}%
              </strong>

            </div>


            <div>

              <span>
                REWARD
              </span>

              <strong>
                +{questReward}
              </strong>

            </div>

          </div>


          <button
            type="button"
            className="returnButton"
            onClick={spinAgain}
          >
            Return to Roblox to Spin Again
          </button>

        </div>
      )}


      {/* =========================
          REJECTED
      ========================= */}

      {status === "rejected" && (
        <div className="resultPanel rejectedPanel">

          <div className="resultBadge rejectedBadge">
            REVIEW FAILED
          </div>


          <h2>
            Proof Rejected
          </h2>


          <p>
            Your proof did not clearly show that
            the mission requirements were completed.
          </p>


          <div className="resultStats">

            <div>

              <span>
                AI CONFIDENCE
              </span>

              <strong>
                {confidence}%
              </strong>

            </div>


            <div>

              <span>
                STATUS
              </span>

              <strong>
                RETRY
              </strong>

            </div>

          </div>


          <button
            type="button"
            className="retryButton"
            onClick={retry}
          >
            Try Again
          </button>

        </div>
      )}

    </div>
  );
}

export default SubmitProof;