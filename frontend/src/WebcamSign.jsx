import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { predictSign } from "./api";

export default function WebcamSign({ onPrediction }) {
  const webcamRef = useRef(null);
  const [prediction, setPrediction] = useState("No sign detected");
  const [confidence, setConfidence] = useState(0);
  const [handDetected, setHandDetected] = useState(false);

  // History State
  const [history, setHistory] = useState([]);
  const lastPredRef = useRef("");
  const historyTimeout = useRef(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults(async (results) => {
      if (results.multiHandLandmarks?.length) {
        setHandDetected(true);
        const landmarks = [];
        results.multiHandLandmarks[0].forEach((lm) =>
          landmarks.push(lm.x, lm.y, lm.z)
        );

        if (landmarks.length === 63) {
          try {
            const res = await predictSign(landmarks);
            const pred = res.data.prediction;
            const conf = res.data.confidence || 0;

            setPrediction(pred);
            setConfidence(conf);

            if (pred && onPrediction) {
              onPrediction(pred);
            }

            // History Logic: Add word if stable for 2 seconds (simulated) or if it changes
            // Here we just check if it's a new word with high confidence
            if (pred && pred !== "No sign detected" && conf > 0.85) {
              if (lastPredRef.current !== pred) {
                lastPredRef.current = pred;
                // Debounce adding to history
                clearTimeout(historyTimeout.current);
                historyTimeout.current = setTimeout(() => {
                  setHistory(prev => [...prev, pred].slice(-5)); // Keep last 5
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
        setPrediction("No sign detected");
        setConfidence(0);
        lastPredRef.current = ""; // Reset current word tracker
      }
    });

    if (webcamRef.current?.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current.video });
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  }, [onPrediction]);

  // TTS Helper
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Determine status color and confidence bar color
  const statusColor = handDetected ? "#4ade80" : "#ef4444";
  const statusText = handDetected ? "Hand Detected" : "No Hand Detected";

  let confColor = "#4ade80"; // Green
  if (confidence < 0.6) confColor = "#ef4444"; // Red
  else if (confidence < 0.8) confColor = "#facc15"; // Yellow

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      {/* Big Camera View */}
      <Webcam
        ref={webcamRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Status Bar (Top Left) */}
      <div style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "10px 20px",
        borderRadius: "30px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backdropFilter: "blur(5px)",
        border: `1px solid ${statusColor}`
      }}>
        <div style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: statusColor,
          boxShadow: `0 0 10px ${statusColor}`
        }} />
        <span style={{ color: "#fff", fontWeight: "600", fontSize: "0.9rem" }}>{statusText}</span>
      </div>

      {/* Overlay for Prediction & Confidence */}
      <div style={{
        position: "absolute",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.6)",
        padding: "10px 30px",
        borderRadius: "20px",
        color: "#fff",
        textAlign: "center",
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        minWidth: "200px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <div style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            marginBottom: "5px",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)"
          }}>
            {prediction}
          </div>
          {handDetected && prediction !== "No sign detected" && (
            <button
              onClick={() => speakText(prediction)}
              style={{ background: "transparent", border: "1px solid #fff", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", color: "white", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Speak"
            >
              🔊
            </button>
          )}
        </div>

        {/* Confidence Bar */}
        {handDetected && prediction !== "No sign detected" && (
          <div style={{ width: "100%", background: "#333", height: "6px", borderRadius: "3px", overflow: "hidden", marginTop: "5px" }}>
            <div style={{
              width: `${Math.min(confidence * 100, 100)}%`,
              height: "100%",
              background: confColor,
              transition: "width 0.3s ease-out, background-color 0.3s"
            }} />
          </div>
        )}

        {handDetected && prediction !== "No sign detected" && (
          <div style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "5px" }}>
            Confidence: {Math.round(confidence * 100)}%
            {confidence < 0.7 && <span style={{ color: "#ef4444", marginLeft: "5px" }}>(Low)</span>}
          </div>
        )}
      </div>

      {/* History Log Overlay */}
      {history.length > 0 && (
        <div style={{
          position: "absolute",
          bottom: "160px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.5)",
          padding: "10px 20px",
          borderRadius: "10px",
          color: "#ddd",
          fontSize: "0.9rem",
          backdropFilter: "blur(4px)"
        }}>
          History: {history.join(" ")}
        </div>
      )}
    </div>
  );
}
