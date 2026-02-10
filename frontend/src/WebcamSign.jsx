import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { predictSign } from "./api";
import BlinkMorse from "./BlinkMorse";
import MorseReference from "./MorseReference";

const MORSE_CODE_REVERSE = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
  '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
  '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
  '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
  '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
  '--..': 'Z', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
  '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
  '-----': '0'
};

export default function WebcamSign({ onPrediction, onLandmarks, mode = "sign" }) {
  const webcamRef = useRef(null);

  // -- Hand Sign State --
  const [prediction, setPrediction] = useState("No sign detected");
  const [confidence, setConfidence] = useState(0);
  const [bestGuess, setBestGuess] = useState("");
  const [handDetected, setHandDetected] = useState(false);
  const [numHands, setNumHands] = useState(0);
  const [history, setHistory] = useState([]);
  const lastPredRef = useRef("");
  const historyTimeout = useRef(null);
  const predictionBuffer = useRef([]);
  const BUFFER_SIZE = 7;

  // -- Blink Morse State --
  const [morseSequence, setMorseSequence] = useState("");
  const [decodedText, setDecodedText] = useState("");
  const [isBlinking, setIsBlinking] = useState(false);
  const [blinkType, setBlinkType] = useState(null);

  // Blink Detection Refs
  const blinkStartTime = useRef(0);
  const isEyeClosed = useRef(false);
  const BLINK_THRESHOLD = 0.25;
  const DOUBLE_BLINK_WINDOW = 400;

  const pendingBlink = useRef(null);

  // Reset state when mode changes
  useEffect(() => {
    setPrediction("No sign detected");
    setHandDetected(false);
    setMorseSequence("");
    setDecodedText("");
    setIsBlinking(false);
  }, [mode]);

  const calculateEAR = (landmarks, indices) => {
    // EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
    const p1 = landmarks[indices[0]];
    const p2 = landmarks[indices[1]];
    const p3 = landmarks[indices[2]];
    const p4 = landmarks[indices[3]];
    const p5 = landmarks[indices[4]];
    const p6 = landmarks[indices[5]];

    const dist = (pA, pB) => Math.sqrt(Math.pow(pA.x - pB.x, 2) + Math.pow(pA.y - pB.y, 2));

    const ear = (dist(p2, p6) + dist(p3, p5)) / (2 * dist(p1, p4));
    return ear;
  };

  const handleBlinkEvent = (type) => {
    setBlinkType(type);
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 200);

    if (type === 'dot') {
      setMorseSequence(prev => prev + ".");
    } else {
      setMorseSequence(prev => prev + "-");
    }
  };

  const processBlink = () => {
    const now = Date.now();
    if (pendingBlink.current) {
      clearTimeout(pendingBlink.current);
      pendingBlink.current = null;
      handleBlinkEvent('dash');
    } else {
      pendingBlink.current = setTimeout(() => {
        handleBlinkEvent('dot');
        pendingBlink.current = null;
      }, DOUBLE_BLINK_WINDOW);
    }
  };

  // Check for auto-decoding or space
  useEffect(() => {
    const checkPause = setTimeout(() => {
      if (morseSequence) {
        if (MORSE_CODE_REVERSE[morseSequence]) {
          setDecodedText(prev => prev + MORSE_CODE_REVERSE[morseSequence]);
          setMorseSequence("");
        }
      }
    }, 2000);

    return () => clearTimeout(checkPause);
  }, [morseSequence]);

  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    // Initialize Hands
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onHandsResults);

    // Initialize FaceMesh
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onFaceResults);

    if (webcamRef.current?.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current?.video) {
            if (modeRef.current === "sign") {
              await hands.send({ image: webcamRef.current.video });
            } else {
              await faceMesh.send({ image: webcamRef.current.video });
            }
          }
        },
        width: 1280,
        height: 720
      });
      camera.start();
    }
  }, []);

  const onHandsResults = async (results) => {
    if (modeRef.current !== "sign") return;

    if (onLandmarks) onLandmarks(results.multiHandLandmarks || null);

    if (results.multiHandLandmarks?.length) {
      setHandDetected(true);
      setNumHands(results.multiHandLandmarks.length);

      // ... (Existing Hand Logic) ...
      let lh = new Array(63).fill(0);
      let rh = new Array(63).fill(0);
      results.multiHandLandmarks.forEach((handLandmarks, index) => {
        const classification = results.multiHandedness[index];
        const label = classification.label;
        const flat = [];
        handLandmarks.forEach((lm) => flat.push(lm.x, lm.y, lm.z));
        if (label === "Left") lh = flat;
        else rh = flat;
      });
      const landmarks = [...lh, ...rh];
      if (landmarks.length === 126) {
        try {
          const res = await predictSign(landmarks);
          const rawPred = res.data.prediction;
          const conf = res.data.confidence || 0;
          const guess = res.data.best_guess || "";
          setBestGuess(guess);
          predictionBuffer.current.push(rawPred);
          if (predictionBuffer.current.length > BUFFER_SIZE) predictionBuffer.current.shift();
          const counts = {};
          predictionBuffer.current.forEach(p => { counts[p] = (counts[p] || 0) + 1; });
          const smoothedPred = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
          setPrediction(smoothedPred);
          setConfidence(conf);
          if (onPrediction) onPrediction(smoothedPred);
          if (smoothedPred && smoothedPred !== "No sign detected" && conf > 0.60) {
            if (lastPredRef.current !== smoothedPred) {
              lastPredRef.current = smoothedPred;
              clearTimeout(historyTimeout.current);
              historyTimeout.current = setTimeout(() => {
                setHistory(prev => [smoothedPred, ...prev].slice(0, 20));
              }, 1500);
            }
          }
        } catch {
          setPrediction("No sign detected");
          setConfidence(0);
        }
      }
    } else {
      setHandDetected(false);
      setNumHands(0);
      setPrediction("No sign detected");
      setConfidence(0);
    }
  };

  const onFaceResults = (results) => {
    if (modeRef.current !== "blink") return;

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      const leftEyeIndices = [33, 160, 158, 133, 153, 144];
      const rightEyeIndices = [362, 385, 387, 263, 373, 380];
      const leftEAR = calculateEAR(landmarks, leftEyeIndices);
      const rightEAR = calculateEAR(landmarks, rightEyeIndices);
      const avgEAR = (leftEAR + rightEAR) / 2;

      // Status Check
      if (avgEAR < BLINK_THRESHOLD) {
        if (!isEyeClosed.current) {
          isEyeClosed.current = true;
          blinkStartTime.current = Date.now();
        }
      } else {
        if (isEyeClosed.current) {
          // Eye just opened
          const blinkDuration = Date.now() - blinkStartTime.current;
          isEyeClosed.current = false;
          if (blinkDuration > 50) {
            processBlink();
          }
        }
      }
    }
  };

  const statusColor = numHands > 0 ? "#4ade80" : "#ef4444";
  const statusText = numHands === 0 ? "No Hands Detected" : numHands === 1 ? "One Hand" : "Two Hands";
  let confColor = "#4ade80";
  if (confidence < 0.6) confColor = "#ef4444";
  else if (confidence < 0.8) confColor = "#facc15";

  // --- RENDER ---
  const hudStyle = {
    position: "absolute",
    zIndex: 10,
    pointerEvents: "none"
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#050510", overflow: "hidden", fontFamily: "'Rajdhani', sans-serif" }}>

      {/* COLUMN 1: Webcam (Common) */}
      <div style={{
        flex: mode === "sign" ? "0 0 75%" : "0 0 50%",
        position: "relative",
        height: "100%",
        background: "#000",
        borderRight: "1px solid #1a1a1a",
        transition: "flex 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)"
      }}>
        {/* Webcam Feed */}
        <Webcam ref={webcamRef}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            opacity: 0.8, // Slightly dim for HUD visibility
          }}
        />

        {/* Grid Overlay Effect */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }}></div>

        {/* HUD Elements */}
        {mode === "sign" && (
          <>
            {/* Status Badge */}
            <div style={{ ...hudStyle, top: "20px", left: "20px", background: "rgba(0, 0, 0, 0.6)", padding: "8px 15px", borderLeft: `3px solid ${statusColor}`, backdropFilter: "blur(4px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
                <span style={{ color: "#fff", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>{statusText}</span>
              </div>
            </div>

            {/* Prediction Box */}
            <div style={{ ...hudStyle, bottom: "40px", left: "50%", transform: "translateX(-50%)", width: "auto", minWidth: "300px", textAlign: "center" }}>
              <div style={{
                background: "rgba(10, 10, 20, 0.85)",
                border: "1px solid rgba(0, 243, 255, 0.3)",
                padding: "15px 30px",
                borderRadius: "2px",
                position: "relative",
                clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
              }}>
                <div style={{ fontSize: "0.7rem", color: "#00f3ff", letterSpacing: "2px", marginBottom: "5px", textTransform: "uppercase" }}>Detected Sign</div>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff", textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}>
                  {prediction !== "No sign detected" ? prediction : (bestGuess ? <span style={{ color: "#aaa" }}>{bestGuess}?</span> : <span style={{ opacity: 0.3 }}>...</span>)}
                </div>

                {/* Confidence Bar */}
                {handDetected && (
                  <div style={{ width: "100%", height: "2px", background: "#333", marginTop: "10px", position: "relative" }}>
                    <div style={{
                      width: `${confidence * 100}%`,
                      height: "100%",
                      background: confColor,
                      boxShadow: `0 0 10px ${confColor}`,
                      transition: "width 0.2s"
                    }} />
                    <div style={{ position: "absolute", right: 0, top: "-15px", fontSize: "0.7rem", color: confColor }}>
                      {(confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {mode === "blink" && (
          <div style={{ ...hudStyle, top: "20px", left: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "5px 10px", background: "rgba(0, 0, 0, 0.6)", border: "1px solid #00f3ff", color: "#00f3ff", fontSize: "0.8rem", letterSpacing: "1px" }}>
              FACE MESH ACTIVE
            </div>
          </div>
        )}
      </div>

      {/* COLUMN 2: Blink Interface (Only for Blink Mode) */}
      {mode === "blink" && (
        <div style={{ flex: "0 0 30%", height: "100%", borderRight: "1px solid #1a1a1a", background: "rgba(5, 5, 10, 0.95)" }}>
          <BlinkMorse
            morseSequence={morseSequence}
            decodedText={decodedText}
            isBlinking={isBlinking}
            blinkType={blinkType}
            onClear={() => { setMorseSequence(""); setDecodedText(""); }}
          />
        </div>
      )}

      {/* COLUMN 3: Right Sidebar (History OR Reference) */}
      <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", background: "#080808", borderLeft: "1px solid #222" }}>

        {/* Show Reference Table ONLY in Blink Mode */}
        {mode === "blink" && (
          <div style={{ flex: "1", overflow: "hidden" }}>
            <MorseReference />
          </div>
        )}

        {/* Show Sign History ONLY in Sign Mode */}
        {mode === "sign" && (
          <div style={{ flex: "1", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "15px", borderBottom: "1px solid #1a1a1a", background: "#0a0a10" }}>
              <h2 style={{ color: "#fff", margin: 0, fontSize: "1rem", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase" }}>Translation Log</h2>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>
              {history.map((item, idx) => (
                <div key={idx} style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid #111",
                  color: "#ccc",
                  fontSize: "0.9rem",
                  background: idx === 0 ? "rgba(0, 243, 255, 0.05)" : "transparent",
                  borderLeft: idx === 0 ? "3px solid #00f3ff" : "3px solid transparent",
                  fontFamily: "monospace"
                }}>
                  <span style={{ color: "#555", marginRight: "10px", fontSize: "0.8em" }}>{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
