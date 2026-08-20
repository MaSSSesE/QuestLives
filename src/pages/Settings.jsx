import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SettingsGUI from "../GUIS/Settings.png";

function Settings() {
  const [cameraStatus, setCameraStatus] = useState("unknown");
  const [microphoneStatus, setMicrophoneStatus] = useState("unknown");

  const [cameraMessage, setCameraMessage] = useState("");
  const [microphoneMessage, setMicrophoneMessage] = useState("");

  const [cameraLoading, setCameraLoading] = useState(false);
  const [microphoneLoading, setMicrophoneLoading] = useState(false);

  const [cameraStream, setCameraStream] = useState(null);
  const [microphoneStream, setMicrophoneStream] = useState(null);

  //==================================================
  // CHECK CURRENT PERMISSIONS
  //==================================================

  async function checkPermissions() {
    if (
      navigator.permissions &&
      navigator.permissions.query
    ) {
      try {
        const cameraPermission =
          await navigator.permissions.query({
            name: "camera"
          });

        setCameraStatus(
          cameraPermission.state
        );

        cameraPermission.onchange =
          () => {
            setCameraStatus(
              cameraPermission.state
            );
          };
      } catch (error) {
        console.log(
          "Could not check camera permission:",
          error
        );
      }

      try {
        const microphonePermission =
          await navigator.permissions.query({
            name: "microphone"
          });

        setMicrophoneStatus(
          microphonePermission.state
        );

        microphonePermission.onchange =
          () => {
            setMicrophoneStatus(
              microphonePermission.state
            );
          };
      } catch (error) {
        console.log(
          "Could not check microphone permission:",
          error
        );
      }
    }
  }

  //==================================================
  // INITIAL PERMISSION CHECK
  //==================================================

  useEffect(() => {
    checkPermissions();

    return () => {
      if (cameraStream) {
        cameraStream
          .getTracks()
          .forEach(
            (track) => track.stop()
          );
      }

      if (microphoneStream) {
        microphoneStream
          .getTracks()
          .forEach(
            (track) => track.stop()
          );
      }
    };
  }, []);

  //==================================================
  // TURN ON CAMERA
  //==================================================

  async function turnOnCamera() {
    setCameraLoading(true);
    setCameraMessage("");

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Your browser does not support camera access."
        );
      }

      if (cameraStream) {
        cameraStream
          .getTracks()
          .forEach(
            (track) => track.stop()
          );

        setCameraStream(null);
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

      setCameraStream(
        stream
      );

      setCameraStatus(
        "granted"
      );

      setCameraMessage(
        "Camera access is enabled. Quest Lives can use your camera for proof recordings."
      );

    } catch (error) {
      console.error(
        "Camera permission error:",
        error
      );

      if (
        error.name ===
        "NotAllowedError"
      ) {
        setCameraStatus(
          "denied"
        );

        setCameraMessage(
          "Camera access was blocked. Change the camera permission for Quest Lives in your browser's site permissions, then try again."
        );
      } else if (
        error.name ===
        "NotFoundError"
      ) {
        setCameraStatus(
          "unavailable"
        );

        setCameraMessage(
          "No camera was found on this device."
        );
      } else {
        setCameraStatus(
          "error"
        );

        setCameraMessage(
          error.message ||
          "Quest Lives could not access your camera."
        );
      }

    } finally {
      setCameraLoading(false);
    }
  }

  //==================================================
  // TURN ON MICROPHONE
  //==================================================

  async function turnOnMicrophone() {
    setMicrophoneLoading(true);
    setMicrophoneMessage("");

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Your browser does not support microphone access."
        );
      }

      if (microphoneStream) {
        microphoneStream
          .getTracks()
          .forEach(
            (track) => track.stop()
          );

        setMicrophoneStream(null);
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });

      setMicrophoneStream(
        stream
      );

      setMicrophoneStatus(
        "granted"
      );

      setMicrophoneMessage(
        "Microphone access is enabled. Quest Lives can use your microphone for proof recordings."
      );

    } catch (error) {
      console.error(
        "Microphone permission error:",
        error
      );

      if (
        error.name ===
        "NotAllowedError"
      ) {
        setMicrophoneStatus(
          "denied"
        );

        setMicrophoneMessage(
          "Microphone access was blocked. Change the microphone permission for Quest Lives in your browser's site permissions, then try again."
        );
      } else if (
        error.name ===
        "NotFoundError"
      ) {
        setMicrophoneStatus(
          "unavailable"
        );

        setMicrophoneMessage(
          "No microphone was found on this device."
        );
      } else {
        setMicrophoneStatus(
          "error"
        );

        setMicrophoneMessage(
          error.message ||
          "Quest Lives could not access your microphone."
        );
      }

    } finally {
      setMicrophoneLoading(false);
    }
  }

  //==================================================
  // STATUS HELPERS
  //==================================================

  function getStatusText(status) {
    if (status === "granted") {
      return "ENABLED";
    }

    if (status === "denied") {
      return "BLOCKED";
    }

    if (status === "unavailable") {
      return "UNAVAILABLE";
    }

    if (status === "error") {
      return "ERROR";
    }

    return "NOT ENABLED";
  }

  function getStatusClass(status) {
    if (status === "granted") {
      return "statusEnabled";
    }

    return "statusDisabled";
  }

  //==================================================
  // PAGE
  //==================================================

  return (
    <div className="settingsPage">

      <div className="settingsBackgroundGlow" />

      <div className="settingsHero">

        <div className="settingsHeroTag">

          <span className="settingsHeroDot" />

          QUEST LIVES • SETTINGS

        </div>

        <h1>
          Settings
        </h1>

        <p>
          Manage the camera and microphone permissions
          Quest Lives uses for recording your real-world
          quest proof.
        </p>

      </div>


      <div className="settingsPanel">

        <div className="settingsPanelHeader">

          <div>

            <span className="sectionLabel">
              DEVICE PERMISSIONS
            </span>

            <h2>
              Camera & Microphone
            </h2>

            <p>
              Turn on the devices you want Quest Lives
              to use before submitting proof.
            </p>

          </div>

          <div className="settingsPanelIcon">

            <img
              src={SettingsGUI}
              alt="Settings"
              className="settingsPanelImage"
            />

          </div>

        </div>


        <div className="settingsDivider" />


        {/* CAMERA */}

        <div
          className={
            cameraStatus === "granted"
              ? "deviceCard deviceEnabled"
              : "deviceCard"
          }
        >

          <div className="deviceIcon cameraIcon">
            📷
          </div>


          <div className="deviceContent">

            <div className="deviceTitleRow">

              <div>

                <span className="deviceCategory">
                  VIDEO DEVICE
                </span>

                <h3>
                  Camera
                </h3>

              </div>

              <div
                className={`deviceStatus ${getStatusClass(
                  cameraStatus
                )}`}
              >

                <span className="statusDot" />

                {getStatusText(
                  cameraStatus
                )}

              </div>

            </div>


            <p>
              Allows Quest Lives to record video
              evidence for your completed quests.
            </p>


            <div className="deviceBottom">

              <div className="devicePermission">

                <span>
                  PERMISSION
                </span>

                <strong>
                  {cameraStatus === "granted"
                    ? "CAMERA ACCESS GRANTED"
                    : "CAMERA ACCESS REQUIRED"}
                </strong>

              </div>


              <button
                type="button"
                className={
                  cameraStatus === "granted"
                    ? "deviceButton deviceButtonOn"
                    : "deviceButton deviceButtonOff"
                }
                onClick={turnOnCamera}
                disabled={cameraLoading}
              >
                {cameraLoading
                  ? "CHECKING..."
                  : cameraStatus === "granted"
                    ? "CAMERA ENABLED"
                    : "TURN ON CAMERA"}
              </button>

            </div>


            {cameraMessage && (

              <div
                className={
                  cameraStatus === "denied"
                    ? "deviceMessage deviceMessageError"
                    : "deviceMessage"
                }
              >

                <span>
                  {cameraStatus === "denied"
                    ? "!"
                    : "✓"}
                </span>

                <div>
                  {cameraMessage}
                </div>

              </div>

            )}

          </div>

        </div>


        {/* MICROPHONE */}

        <div
          className={
            microphoneStatus === "granted"
              ? "deviceCard deviceEnabled"
              : "deviceCard"
          }
        >

          <div className="deviceIcon microphoneIcon">
            🎤
          </div>


          <div className="deviceContent">

            <div className="deviceTitleRow">

              <div>

                <span className="deviceCategory">
                  AUDIO DEVICE
                </span>

                <h3>
                  Microphone
                </h3>

              </div>

              <div
                className={`deviceStatus ${getStatusClass(
                  microphoneStatus
                )}`}
              >

                <span className="statusDot" />

                {getStatusText(
                  microphoneStatus
                )}

              </div>

            </div>


            <p>
              Allows Quest Lives to record audio
              alongside your camera proof.
            </p>


            <div className="deviceBottom">

              <div className="devicePermission">

                <span>
                  PERMISSION
                </span>

                <strong>
                  {microphoneStatus === "granted"
                    ? "MICROPHONE ACCESS GRANTED"
                    : "MICROPHONE ACCESS REQUIRED"}
                </strong>

              </div>


              <button
                type="button"
                className={
                  microphoneStatus === "granted"
                    ? "deviceButton deviceButtonOn"
                    : "deviceButton deviceButtonOff"
                }
                onClick={turnOnMicrophone}
                disabled={microphoneLoading}
              >
                {microphoneLoading
                  ? "CHECKING..."
                  : microphoneStatus === "granted"
                    ? "MICROPHONE ENABLED"
                    : "TURN ON MICROPHONE"}
              </button>

            </div>


            {microphoneMessage && (

              <div
                className={
                  microphoneStatus === "denied"
                    ? "deviceMessage deviceMessageError"
                    : "deviceMessage"
                }
              >

                <span>
                  {microphoneStatus === "denied"
                    ? "!"
                    : "✓"}
                </span>

                <div>
                  {microphoneMessage}
                </div>

              </div>

            )}

          </div>

        </div>

      </div>


      <div className="settingsInfoPanel">

        <div className="settingsInfoIcon">
          i
        </div>

        <div>

          <h2>
            How permissions work
          </h2>

          <p>
            Quest Lives cannot override your browser's
            privacy settings. When you turn on a device,
            your browser may ask you to allow access.
            Choose <strong>Allow</strong> to enable the
            device.
          </p>

          <p>
            If you previously selected <strong>Block</strong>,
            you must change the permission in your browser's
            site settings before Quest Lives can use that
            device again.
          </p>

        </div>

      </div>


      <div className="settingsFooter">

        <span className="settingsFooterLine" />

        QUEST LIVES • DEVICE CONTROL

        <span className="settingsFooterLine" />

      </div>


      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "28px"
        }}
      >

        <Link
          to="/submit-proof"
          className="deviceButton deviceButtonOn"
        >
          BACK TO PROOF SUBMISSION
        </Link>

      </div>

    </div>
  );
}

export default Settings;