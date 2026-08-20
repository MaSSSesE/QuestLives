import {
  useState,
  useContext,
  useEffect,
  useRef
} from "react";

import { Link } from "react-router-dom";

import { QuestContext } from "../QuestContext";
import PointsGUI from "../GUIS/Points.png";
import SettingsGUI from "../GUIS/Settings.png";

const API_URL =
  "https://quest-lives.vercel.app/api/quest";

const PROOF_AI_URL =
  "http://127.0.0.1:5000/verify-proof";

const ROBLOX_USER_ID =
  "343054291";

// ==========================================================
// INDEXEDDB PROOF STORAGE
// ==========================================================

const PROOF_DB_NAME =
  "QuestLivesProofDatabase";

const PROOF_DB_VERSION =
  1;

const PROOF_STORE_NAME =
  "recordings";

const PROOF_RECORD_ID =
  "current-proof";

function openProofDatabase() {
  return new Promise(
    (resolve, reject) => {
      const request =
        window.indexedDB.open(
          PROOF_DB_NAME,
          PROOF_DB_VERSION
        );

      request.onupgradeneeded =
        () => {
          const database =
            request.result;

          if (
            !database.objectStoreNames.contains(
              PROOF_STORE_NAME
            )
          ) {
            database.createObjectStore(
              PROOF_STORE_NAME
            );
          }
        };

      request.onsuccess =
        () => {
          resolve(
            request.result
          );
        };

      request.onerror =
        () => {
          reject(
            request.error ||
            new Error(
              "Could not open proof storage."
            )
          );
        };
    }
  );
}

async function saveProofToStorage(
  videoBlob,
  questName,
  questReward
) {
  if (!videoBlob) {
    return;
  }

  const database =
    await openProofDatabase();

  return new Promise(
    (resolve, reject) => {
      const transaction =
        database.transaction(
          PROOF_STORE_NAME,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          PROOF_STORE_NAME
        );

      const record = {
        id: PROOF_RECORD_ID,
        videoBlob,
        questName,
        questReward,
        savedAt:
          Date.now()
      };

      const request =
        store.put(
          record,
          PROOF_RECORD_ID
        );

      request.onsuccess =
        () => {
          resolve();
        };

      request.onerror =
        () => {
          reject(
            request.error ||
            new Error(
              "Could not save the recorded proof."
            )
          );
        };

      transaction.oncomplete =
        () => {
          database.close();
        };
    }
  );
}

async function loadProofFromStorage() {
  const database =
    await openProofDatabase();

  return new Promise(
    (resolve, reject) => {
      const transaction =
        database.transaction(
          PROOF_STORE_NAME,
          "readonly"
        );

      const store =
        transaction.objectStore(
          PROOF_STORE_NAME
        );

      const request =
        store.get(
          PROOF_RECORD_ID
        );

      request.onsuccess =
        () => {
          const record =
            request.result;

          database.close();

          resolve(
            record || null
          );
        };

      request.onerror =
        () => {
          database.close();

          reject(
            request.error ||
            new Error(
              "Could not load the saved proof."
            )
          );
        };
    }
  );
}

async function deleteProofFromStorage() {
  try {
    const database =
      await openProofDatabase();

    return new Promise(
      (resolve, reject) => {
        const transaction =
          database.transaction(
            PROOF_STORE_NAME,
            "readwrite"
          );

        const store =
          transaction.objectStore(
            PROOF_STORE_NAME
          );

        const request =
          store.delete(
            PROOF_RECORD_ID
          );

        request.onsuccess =
          () => {
            resolve();
          };

        request.onerror =
          () => {
            reject(
              request.error ||
              new Error(
                "Could not delete the saved proof."
              )
            );
          };

        transaction.oncomplete =
          () => {
            database.close();
          };
      }
    );
  } catch (error) {
    console.error(
      "Could not delete saved proof:",
      error
    );
  }
}

// ==========================================================
// PERSISTENT PROOF REVIEW SYSTEM
// ==========================================================

let persistentReview = {
  active: false,
  status: "waiting",
  confidence: null,
  reason: "",
  questName: "",
  questReward: 0
};

let persistentReviewPromise = null;

const reviewListeners =
  new Set();

function notifyReviewListeners() {
  reviewListeners.forEach(
    (listener) => {
      try {
        listener({
          ...persistentReview
        });
      } catch (error) {
        console.error(
          "Review listener error:",
          error
        );
      }
    }
  );
}

function subscribeToReview(
  listener
) {
  reviewListeners.add(
    listener
  );

  listener({
    ...persistentReview
  });

  return () => {
    reviewListeners.delete(
      listener
    );
  };
}

// ==========================================================
// LOCAL AI ANALYSIS
// ==========================================================

async function analyzeProofWithLocalAI(
  recordedVideo,
  questName
) {
  if (!recordedVideo) {
    throw new Error(
      "No camera recording is available."
    );
  }

  if (
    !recordedVideo.type.startsWith(
      "video/"
    )
  ) {
    throw new Error(
      "Only camera video recordings are accepted."
    );
  }

  console.log(
    "Sending camera footage to local Qwen3-VL..."
  );

  const formData =
    new FormData();

  formData.append(
    "proof",
    recordedVideo,
    "quest-lives-camera-proof.webm"
  );

  formData.append(
    "quest",
    questName
  );

  const response =
    await fetch(
      PROOF_AI_URL,
      {
        method: "POST",
        body: formData
      }
    );

  const responseText =
    await response.text();

  console.log(
    "Local AI raw response:",
    responseText
  );

  let data;

  try {
    data =
      JSON.parse(
        responseText
      );
  } catch (parseError) {
    console.error(
      "Could not parse local AI response:",
      parseError
    );

    throw new Error(
      `Proof AI returned an invalid response. Server status: ${response.status}`
    );
  }

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data.error ||
      `Local AI proof analysis failed with status ${response.status}.`
    );
  }

  if (
    typeof data.approved !==
    "boolean"
  ) {
    throw new Error(
      "The proof AI returned an invalid approval result."
    );
  }

  return {
    approved:
      data.approved,

    confidence:
      data.confidence ??
      0,

    reason:
      data.reason ||
      "The AI did not provide an explanation."
  };
}

// ==========================================================
// APPROVE QUEST
// ==========================================================

async function approveQuestPersistent() {
  try {
    console.log(
      "Sending quest approval to Quest Lives API..."
    );

    const response =
      await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            action:
              "approve",

            userId:
              ROBLOX_USER_ID
          })
        }
      );

    const data =
      await response.json();

    console.log(
      "Quest approval API response:",
      data
    );

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ||
        `Quest approval failed with status ${response.status}`
      );
    }

    return true;
  } catch (error) {
    console.error(
      "Failed to approve quest:",
      error
    );

    return false;
  }
}

// ==========================================================
// START PERSISTENT REVIEW
// ==========================================================

function startPersistentReview(
  recordedVideo,
  questName,
  questReward
) {
  if (
    persistentReview.active &&
    persistentReviewPromise
  ) {
    console.log(
      "A QLAI review is already running."
    );

    return persistentReviewPromise;
  }

  persistentReview = {
    active: true,
    status: "checking",
    confidence: null,
    reason: "",
    questName,
    questReward
  };

  notifyReviewListeners();

  console.log(
    "=================================================="
  );

  console.log(
    "QUEST LIVES PERSISTENT QLAI REVIEW STARTED"
  );

  console.log(
    "Quest:",
    questName
  );

  console.log(
    "The review will continue while navigating"
  );

  console.log(
    "between pages inside the React application."
  );

  console.log(
    "=================================================="
  );

  persistentReviewPromise =
    (async () => {
      try {
        const result =
          await analyzeProofWithLocalAI(
            recordedVideo,
            questName
          );

        console.log(
          "FINAL AI RESULT:",
          result
        );

        persistentReview.confidence =
          result.confidence;

        persistentReview.reason =
          result.reason;

        if (
          result.approved
        ) {
          console.log(
            "AI APPROVED PROOF."
          );

          const approvalSuccessful =
            await approveQuestPersistent();

          if (
            approvalSuccessful
          ) {
            persistentReview.status =
              "approved";

            console.log(
              "QUEST APPROVAL SUCCESSFUL."
            );
          } else {
            persistentReview.status =
              "approvalError";

            console.log(
              "QUEST APPROVAL FAILED."
            );
          }
        } else {
          persistentReview.status =
            "rejected";

          console.log(
            "AI REJECTED PROOF."
          );
        }
      } catch (error) {
        console.error(
          "Persistent proof review error:",
          error
        );

        persistentReview.reason =
          error.message ||
          "The proof could not be analyzed.";

        persistentReview.status =
          "analysisError";
      }

      persistentReview.active =
        false;

      notifyReviewListeners();

      console.log(
        "=================================================="
      );

      console.log(
        "QUEST LIVES PERSISTENT QLAI REVIEW FINISHED"
      );

      console.log(
        "Final status:",
        persistentReview.status
      );

      console.log(
        "=================================================="
      );

      return {
        ...persistentReview
      };
    })();

  return persistentReviewPromise;
}

// ==========================================================
// CAMERA STOPPER
// ==========================================================

function stopCameraTracks(
  stream
) {
  if (!stream) {
    return;
  }

  const tracks =
    stream.getTracks();

  tracks.forEach(
    (track) => {
      try {
        track.stop();
      } catch (error) {
        console.error(
          "Could not stop camera track:",
          error
        );
      }
    }
  );
}

// ==========================================================
// COMPONENT
// ==========================================================

function SubmitProof() {
  const {
    currentQuest,
    spinQuest
  } = useContext(
    QuestContext
  );

  // ========================================================
  // CAMERA STATE
  // ========================================================

  const [stream, setStream] =
    useState(null);

  const [recording, setRecording] =
    useState(false);

  const [recordedVideo, setRecordedVideo] =
    useState(null);

  const [videoURL, setVideoURL] =
    useState("");

  // ========================================================
  // RESTORE STATE
  // ========================================================

  const [restoringProof, setRestoringProof] =
    useState(true);

  // ========================================================
  // REVIEW STATE
  // ========================================================

  const [status, setStatus] =
    useState(
      persistentReview.status
    );

  const [confidence, setConfidence] =
    useState(
      persistentReview.confidence
    );

  const [reason, setReason] =
    useState(
      persistentReview.reason
    );

  // ========================================================
  // OTHER STATE
  // ========================================================

  const [cameraError, setCameraError] =
    useState("");

  // ========================================================
  // REFS
  // ========================================================

  const videoRef =
    useRef(null);

  const recorderRef =
    useRef(null);

  const chunksRef =
    useRef([]);

  const streamRef =
    useRef(null);

  const restoredURLRef =
    useRef("");

  // ========================================================
  // QUEST
  // ========================================================

  const questName =
    currentQuest?.name ||
    persistentReview.questName ||
    "NO QUEST SELECTED";

  const questReward =
    currentQuest?.reward ??
    persistentReview.questReward ??
    0;

  // ========================================================
  // CONNECT TO PERSISTENT REVIEW
  // ========================================================

  useEffect(() => {
    const unsubscribe =
      subscribeToReview(
        (review) => {
          setStatus(
            review.status
          );

          setConfidence(
            review.confidence
          );

          setReason(
            review.reason
          );
        }
      );

    return unsubscribe;
  }, []);

  // ========================================================
  // RESTORE SAVED PROOF
  // ========================================================

  useEffect(() => {
    let cancelled =
      false;

    async function restoreSavedProof() {
      try {
        console.log(
          "Checking IndexedDB for a saved Quest Lives proof..."
        );

        const savedProof =
          await loadProofFromStorage();

        if (
          cancelled
        ) {
          return;
        }

        if (
          !savedProof ||
          !savedProof.videoBlob
        ) {
          console.log(
            "No saved proof found."
          );

          setRestoringProof(
            false
          );

          return;
        }

        console.log(
          "Saved Quest Lives proof found."
        );

        const blob =
          savedProof.videoBlob;

        const restoredFile =
          new File(
            [blob],
            "quest-lives-camera-proof.webm",
            {
              type:
                blob.type ||
                "video/webm"
            }
          );

        const restoredURL =
          URL.createObjectURL(
            blob
          );

        restoredURLRef.current =
          restoredURL;

        setRecordedVideo(
          restoredFile
        );

        setVideoURL(
          restoredURL
        );

        if (
          persistentReview.status ===
          "waiting"
        ) {
          setStatus(
            "waiting"
          );
        }

        console.log(
          "Saved proof restored successfully."
        );

        console.log(
          "Proof saved at:",
          new Date(
            savedProof.savedAt
          ).toLocaleString()
        );
      } catch (error) {
        console.error(
          "Could not restore saved proof:",
          error
        );

        setCameraError(
          "The saved proof could not be restored."
        );
      } finally {
        if (
          !cancelled
        ) {
          setRestoringProof(
            false
          );
        }
      }
    }

    restoreSavedProof();

    return () => {
      cancelled =
        true;
    };
  }, []);

  // ========================================================
  // CLEAN UP RESTORED VIDEO URL
  // ========================================================

  useEffect(() => {
    return () => {
      if (
        restoredURLRef.current
      ) {
        URL.revokeObjectURL(
          restoredURLRef.current
        );

        restoredURLRef.current =
          "";
      }
    };
  }, []);

  // ========================================================
  // START CAMERA
  // ========================================================

  async function startCamera() {
    try {
      setCameraError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Your browser does not support camera access."
        );
      }

      if (
        streamRef.current
      ) {
        stopCameraTracks(
          streamRef.current
        );

        streamRef.current =
          null;
      }

      const newStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

      streamRef.current =
        newStream;

      setStream(
        newStream
      );
    } catch (error) {
      console.error(
        "Camera initialization error:",
        error
      );

      setCameraError(
        error.message ||
        "Could not access your camera."
      );
    }
  }

  // ========================================================
  // CAMERA PREVIEW CONNECTION
  // ========================================================

  useEffect(() => {
    if (
      videoRef.current &&
      stream
    ) {
      videoRef.current.srcObject =
        stream;

      videoRef.current.play().catch(
        (error) => {
          console.log(
            "Camera preview play warning:",
            error
          );
        }
      );
    }
  }, [stream]);

  // ========================================================
  // CAMERA TRACK MONITOR
  // ========================================================

  useEffect(() => {
    if (!stream) {
      return;
    }

    const videoTracks =
      stream.getVideoTracks();

    if (
      videoTracks.length === 0
    ) {
      setCameraError(
        "The browser did not provide a camera video track."
      );

      return;
    }

    const cameraTrack =
      videoTracks[0];

    console.log(
      "Camera track started:",
      cameraTrack.label
    );

    const handleEnded =
      () => {
        console.log(
          "CAMERA TRACK ENDED."
        );

        setCameraError(
          "The camera stream stopped."
        );

        setStream(
          null
        );
      };

    cameraTrack.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      cameraTrack.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, [stream]);

  // ========================================================
  // STOP CAMERA WHEN TAB IS HIDDEN
  // ========================================================

  useEffect(() => {
    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "hidden"
      ) {
        console.log(
          "Tab hidden. Turning camera off."
        );

        if (
          recorderRef.current &&
          recorderRef.current.state ===
            "recording"
        ) {
          try {
            recorderRef.current.stop();
          } catch (error) {
            console.error(
              "Could not stop recording:",
              error
            );
          }
        }

        if (
          streamRef.current
        ) {
          stopCameraTracks(
            streamRef.current
          );

          streamRef.current =
            null;
        }

        setStream(
          null
        );
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  // ========================================================
  // STOP CAMERA WHEN LEAVING PAGE
  // ========================================================

  useEffect(() => {
    return () => {
      console.log(
        "Leaving Submit Proof. Turning camera off."
      );

      if (
        recorderRef.current &&
        recorderRef.current.state ===
          "recording"
      ) {
        try {
          recorderRef.current.stop();
        } catch (error) {
          console.error(
            "Could not stop recording:",
            error
          );
        }
      }

      if (
        streamRef.current
      ) {
        stopCameraTracks(
          streamRef.current
        );

        streamRef.current =
          null;
      }
    };
  }, []);

  // ========================================================
  // START RECORDING
  // ========================================================

  function startRecording() {
    const currentStream =
      streamRef.current;

    if (!currentStream) {
      setCameraError(
        "Camera is not available."
      );

      return;
    }

    const videoTracks =
      currentStream.getVideoTracks();

    if (
      videoTracks.length === 0
    ) {
      setCameraError(
        "No camera video track is available."
      );

      return;
    }

    if (
      videoTracks[0].readyState !==
      "live"
    ) {
      setCameraError(
        "The camera is not currently active."
      );

      return;
    }

    if (
      !window.MediaRecorder
    ) {
      setCameraError(
        "Your browser does not support video recording."
      );

      return;
    }

    chunksRef.current =
      [];

    let mimeType =
      "video/webm;codecs=vp9,opus";

    if (
      !MediaRecorder.isTypeSupported(
        mimeType
      )
    ) {
      mimeType =
        "video/webm;codecs=vp8,opus";
    }

    if (
      !MediaRecorder.isTypeSupported(
        mimeType
      )
    ) {
      mimeType =
        "video/webm";
    }

    let recorder;

    try {
      recorder =
        new MediaRecorder(
          currentStream,
          {
            mimeType
          }
        );
    } catch (error) {
      console.error(
        "Could not create MediaRecorder:",
        error
      );

      setCameraError(
        "Your browser could not start video recording."
      );

      return;
    }

    recorderRef.current =
      recorder;

    recorder.ondataavailable =
      (event) => {
        if (
          event.data &&
          event.data.size > 0
        ) {
          chunksRef.current.push(
            event.data
          );
        }
      };

    recorder.onstop =
      async () => {
        const blob =
          new Blob(
            chunksRef.current,
            {
              type:
                recorder.mimeType ||
                "video/webm"
            }
          );

        const newURL =
          URL.createObjectURL(
            blob
          );

        const newFile =
          new File(
            [blob],
            "quest-lives-camera-proof.webm",
            {
              type:
                blob.type ||
                "video/webm"
            }
          );

        setRecordedVideo(
          newFile
        );

        setVideoURL(
          newURL
        );

        setRecording(
          false
        );

        if (
          streamRef.current
        ) {
          stopCameraTracks(
            streamRef.current
          );

          streamRef.current =
            null;
        }

        setStream(
          null
        );

        console.log(
          "Camera recording created."
        );

        console.log(
          "Recording size:",
          blob.size,
          "bytes"
        );

        try {
          await saveProofToStorage(
            blob,
            questName,
            questReward
          );

          console.log(
            "Camera proof saved to IndexedDB."
          );
        } catch (storageError) {
          console.error(
            "Could not save proof to IndexedDB:",
            storageError
          );

          setCameraError(
            "The recording was created, but Quest Lives could not save it for later."
          );
        }
      };

    recorder.onerror =
      (event) => {
        console.error(
          "MediaRecorder error:",
          event
        );

        setRecording(
          false
        );

        setCameraError(
          "There was a problem recording the camera footage."
        );
      };

    recorder.start(
      1000
    );

    setRecording(
      true
    );

    setRecordedVideo(
      null
    );

    if (
      videoURL
    ) {
      URL.revokeObjectURL(
        videoURL
      );

      setVideoURL(
        ""
      );
    }

    setConfidence(
      null
    );

    setReason(
      ""
    );

    setStatus(
      "waiting"
    );

    console.log(
      "Camera recording started."
    );
  }

  // ========================================================
  // STOP RECORDING
  // ========================================================

  function stopRecording() {
    const recorder =
      recorderRef.current;

    if (!recorder) {
      return;
    }

    if (
      recorder.state ===
      "recording"
    ) {
      console.log(
        "Stopping camera recording..."
      );

      recorder.stop();
    }
  }

  // ========================================================
  // SUBMIT PROOF
  // ========================================================

  function submitProof() {
    if (
      !recordedVideo
    ) {
      return;
    }

    if (
      persistentReview.active
    ) {
      console.log(
        "A QLAI review is already running."
      );

      return;
    }

    setStatus(
      "checking"
    );

    setConfidence(
      null
    );

    setReason(
      ""
    );

    startPersistentReview(
      recordedVideo,
      questName,
      questReward
    );
  }

  // ========================================================
  // RETRY
  // ========================================================

  async function retry() {
    if (
      persistentReview.active
    ) {
      console.log(
        "Cannot retry while QLAI is still reviewing."
      );

      return;
    }

    if (
      recording
    ) {
      stopRecording();
    }

    if (
      videoURL
    ) {
      URL.revokeObjectURL(
        videoURL
      );
    }

    await deleteProofFromStorage();

    setRecordedVideo(
      null
    );

    setVideoURL(
      ""
    );

    setConfidence(
      null
    );

    setReason(
      ""
    );

    setStatus(
      "waiting"
    );

    setCameraError(
      ""
    );
  }

  // ========================================================
  // SPIN AGAIN
  // ========================================================

  async function spinAgain() {
    persistentReview = {
      active:
        false,

      status:
        "waiting",

      confidence:
        null,

      reason:
        "",

      questName:
        "",

      questReward:
        0
    };

    persistentReviewPromise =
      null;

    notifyReviewListeners();

    await deleteProofFromStorage();

    spinQuest();

    retry();
  }

  // ========================================================
  // RESTORING SCREEN
  // ========================================================

  if (
    restoringProof
  ) {
    return (
      <div>
        <div className="proofHero">

          <div className="proofHeroTag">
            QUEST LIVES • QUEST SYSTEM
          </div>

          <h1>
            Proof Submission
          </h1>

          <p>
            Restoring your saved proof...
          </p>

        </div>
      </div>
    );
  }

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <div>

      <div className="proofHero">

        <div className="proofHeroTag">
          QUEST LIVES • QUEST SYSTEM
        </div>

        <h1>
          Proof Submission
        </h1>

        <p>
          Complete your quest in real life.
          Record your evidence with your camera.
          Earn your rewards.
        </p>

      </div>


      <div className="missionPanel">

        <div className="missionHeader">

          <div>

            <span className="sectionLabel">
              CURRENT QUEST
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

          Complete this quest in real life,
          then record camera footage that
          clearly proves you completed it.
          Screenshots and uploaded images
          are not accepted.

        </p>

      </div>


      <div className="uploadPanel">

        <div className="uploadHeader">

          <span className="sectionLabel">
            STEP 01
          </span>

          <h2>
            Record Your Proof
          </h2>

          <p>
            Use your camera to record real-world
            footage of your completed quest.
          </p>

        </div>


        <div className="uploadArea">

          {!recordedVideo && (

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                minHeight: "360px",
                boxSizing: "border-box"
              }}
            >

              {/* CAMERA PREVIEW */}

              {stream && (

                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="proofMedia"
                  style={{
                    width: "100%",
                    display: "block"
                  }}
                />

              )}


              {/* CAMERA CONTROLS */}

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "24px",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxSizing: "border-box"
                }}
              >

                {!stream && !recording && (

                  <button
                    type="button"
                    className="submitProofButton"
                    onClick={startCamera}
                    disabled={
                      status === "checking"
                    }
                  >
                    Start Camera
                  </button>

                )}


                {stream &&
                  !recording && (

                    <button
                      type="button"
                      className="submitProofButton"
                      onClick={
                        startRecording
                      }
                    >
                      Start Camera Recording
                    </button>

                )}


                {recording && (

                  <button
                    type="button"
                    className="retryButton"
                    onClick={
                      stopRecording
                    }
                  >
                    Stop Recording
                  </button>

                )}

              </div>

            </div>

          )}


          {recordedVideo && (

            <div>

              <div
                className="previewTop"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  width: "100%",
                  boxSizing: "border-box",
                  overflow: "visible"
                }}
              >

                <div
                  style={{
                    flex: "0 1 auto",
                    minWidth: "max-content",
                    overflow: "visible",
                    paddingLeft: "6px",
                    paddingRight: "8px",
                    boxSizing: "border-box"
                  }}
                >

                  <span
                    className="sectionLabel"
                    style={{
                      display: "inline-block",
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      paddingLeft: "2px"
                    }}
                  >
                    RECORDED FOOTAGE
                  </span>


                  <h3>
                    Ready for AI review
                  </h3>

                </div>


                <span
                  className="fileStatus"
                  style={{
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    paddingLeft: "6px",
                    paddingRight: "6px"
                  }}
                >
                  CAMERA VIDEO
                </span>

              </div>


              <video
                controls
                playsInline
                className="proofMedia"
                src={videoURL}
              />


              <div className="fileInfo">

                <span>
                  RECORDING
                </span>


                <p>
                  Camera footage recorded directly
                  through Quest Lives.
                </p>

              </div>


              {status === "waiting" && (

                <div>

                  <button
                    type="button"
                    className="submitProofButton"
                    onClick={
                      submitProof
                    }
                  >
                    Submit Footage for AI Review
                  </button>


                  <button
                    type="button"
                    className="retryButton"
                    onClick={
                      retry
                    }
                  >
                    Record Again
                  </button>

                </div>

              )}


              {status === "checking" && (

                <div
                  style={{
                    marginTop: "24px",
                    padding: "22px 24px",
                    borderRadius: "14px",
                    border:
                      "1px solid rgba(255, 255, 255, 0.10)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
                    boxSizing: "border-box",
                    width: "100%"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px"
                    }}
                  >

                    <div
                      className="aiPulse"
                      style={{
                        flexShrink: 0
                      }}
                    />


                    <div>

                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          letterSpacing: "1.8px",
                          lineHeight: "1.2"
                        }}
                      >
                        AI ACTIVE
                      </div>


                      <div
                        style={{
                          marginTop: "5px",
                          fontSize: "13px",
                          opacity: "0.65",
                          letterSpacing: "0.2px"
                        }}
                      >
                        Quest Lives AI is reviewing your proof
                      </div>

                    </div>

                  </div>


                  <p
                    style={{
                      margin: "0",
                      lineHeight: "1.65",
                      opacity: "0.78",
                      fontSize: "14px"
                    }}
                  >
                    Your proof is currently being reviewed
                    by Quest Lives AI. You can safely leave
                    this page while the review continues.
                  </p>

                </div>

              )}

            </div>

          )}

        </div>


        {cameraError && (

          <div className="resultPanel rejectedPanel">

            <div className="resultBadge rejectedBadge">
              CAMERA ERROR
            </div>


            <h2>
              Camera Problem
            </h2>


            <p>
              {cameraError}
            </p>


            <button
              type="button"
              className="retryButton"
              onClick={
                startCamera
              }
            >
              Try Camera Again
            </button>

          </div>

        )}

      </div>


      {status === "checking" && (

        <div className="analysisPanel">

          <div className="aiStatus">

            <div className="aiPulse" />

            AI ACTIVE

          </div>


          <h2>
            Analyzing Your Camera Footage
          </h2>


          <p>
            The Quest Lives proof AI is examining
            multiple frames from your recording and
            comparing them with the requirements
            of your current quest.
          </p>


          <p>
            You can safely go to Settings while
            the analysis continues.
          </p>


          <div className="analysisBar">

            <div className="analysisProgress" />

          </div>


          <span className="analysisText">
            AI PROCESSING
          </span>

        </div>

      )}


      {status === "approved" && (

        <div className="resultPanel approvedPanel">

          <div className="resultBadge">
            QUEST COMPLETE
          </div>


          <h2>
            Quest Approved!
          </h2>


          <p>
            The Quest Lives proof AI confirmed
            that your camera footage provides
            sufficient evidence that you completed
            the quest. Your reward has been sent
            to Roblox.
          </p>


          {reason && (

            <p>

              <strong>
                AI:
              </strong>{" "}

              {reason}

            </p>

          )}


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
            onClick={
              spinAgain
            }
          >
            Return to Roblox to Spin Again
          </button>

        </div>

      )}


      {status === "approvalError" && (

        <div className="resultPanel rejectedPanel">

          <div className="resultBadge rejectedBadge">
            CONNECTION ERROR
          </div>


          <h2>
            Quest Approval Failed
          </h2>


          <p>
            The AI approved your camera footage,
            but Quest Lives could not send the
            approval to Roblox. Your reward has
            NOT been given.
          </p>


          {reason && (

            <p>

              <strong>
                AI:
              </strong>{" "}

              {reason}

            </p>

          )}


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
            onClick={
              retry
            }
          >
            Try Again
          </button>

        </div>

      )}


      {status === "analysisError" && (

        <div className="resultPanel rejectedPanel">

          <div className="resultBadge rejectedBadge">
            AI ERROR
          </div>


          <h2>
            Proof Could Not Be Reviewed
          </h2>


          <p>
            {reason ||
              "There was a problem analyzing your camera footage."
            }
          </p>


          <button
            type="button"
            className="retryButton"
            onClick={
              retry
            }
          >
            Try Again
          </button>

        </div>

      )}


      {status === "rejected" && (

        <div className="resultPanel rejectedPanel">

          <div className="resultBadge rejectedBadge">
            REVIEW FAILED
          </div>


          <h2>
            Proof Rejected
          </h2>


          <p>
            The Quest Lives proof AI determined
            that your camera footage did not
            provide enough evidence that the
            quest was completed.
          </p>


          {reason && (

            <p>

              <strong>
                AI:
              </strong>{" "}

              {reason}

            </p>

          )}


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
            onClick={
              retry
            }
          >
            Record New Proof
          </button>

        </div>

      )}


      {/* ==================================================
          SETTINGS BUTTON
          ================================================== */}

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "45px",
          marginBottom: "30px"
        }}
      >

        <Link
          to="/settings"
          className="settingsProofButton"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "auto",
            minWidth: "0",
            padding: "9px 14px",
            borderRadius: "8px",
            textDecoration: "none"
          }}
        >

          <img
            src={SettingsGUI}
            alt="Settings"
            className="settingsProofIcon"
            style={{
              width: "20px",
              height: "20px",
              objectFit: "contain"
            }}
          />


          <span
            style={{
              fontSize: "9px",
              letterSpacing: "1.2px"
            }}
          >
            SETTINGS
          </span>

        </Link>

      </div>

    </div>
  );
}

export default SubmitProof;