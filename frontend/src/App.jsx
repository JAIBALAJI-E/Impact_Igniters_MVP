import React, { useState } from "react";
import WebcamSign from "./WebcamSign.jsx";
import MorseInput from "./MorseInput.jsx";
import Avatar from "./Avatar.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [avatarText, setAvatarText] = useState("HELLO");

  const [showInfo, setShowInfo] = useState(false);

  const [ttsText, setTtsText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // TTS Handlers
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.pause();
        setIsSpeaking(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsSpeaking(true);
        } else {
          const utterance = new SpeechSynthesisUtterance(ttsText);
          utterance.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
          setIsSpeaking(true);
        }
      }
    } else {
      alert("Text to Speech not supported in this browser.");
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Handler for prediction updates from Webcam
  const handlePrediction = (pred) => {
    if (pred && pred !== "No sign detected") {
      setAvatarText(pred);
    }
  };

  // Handler for morse text updates
  const handleMorseUpdate = (text) => {
    if (text) {
      setAvatarText(text);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">AI Multimodal Translator</div>
        <div className="nav-links">
          <button
            className={`nav-btn ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Home
          </button>
          <button
            className={`nav-btn ${activeTab === "webcam" ? "active" : ""}`}
            onClick={() => setActiveTab("webcam")}
          >
            Webcam Sign
          </button>
          <button
            className={`nav-btn ${activeTab === "morse" ? "active" : ""}`}
            onClick={() => setActiveTab("morse")}
          >
            Morse Input
          </button>
          <button
            className={`nav-btn ${activeTab === "tts" ? "active" : ""}`}
            onClick={() => setActiveTab("tts")}
          >
            Text to Speech
          </button>
          <button
            className={`nav-btn ${activeTab === "avatar" ? "active" : ""}`}
            onClick={() => setActiveTab("avatar")}
          >
            Avatar
          </button>
          <button
            className="nav-btn"
            style={{ border: "1px solid #444", marginLeft: "20px" }}
            onClick={() => setShowInfo(!showInfo)}
          >
            ℹ️ How it Works
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <ErrorBoundary>
          {activeTab === "home" && (
            <div className="view-container home-view" style={{ textAlign: "center", padding: "2rem" }}>
              <div className="intro-board">
                <h3 className="team-name">Impact Igniters</h3>
                <h1 className="project-title">
                  AI-Multimodal Translator for Sign and Morse Integration <br />
                  <span style={{ fontSize: "0.6em", fontWeight: "normal", color: "#ccc" }}>– Using Deep Learning</span>
                </h1>

                <p className="project-overview">
                  A comprehensive solution bridging communication gaps using Computer Vision and NLP.
                  Seamlessly translates <strong>Sign Language</strong> (Webcam) and <strong>Morse Code</strong> into text.
                  Features <strong>3D Avatar Translation</strong> and <strong>Text-to-Speech Integration</strong> (developed in future).
                  Powered by MediaPipe, LSTM Networks, and React.
                </p>

                <button
                  className="cta-btn"
                  onClick={() => setActiveTab("webcam")}
                >
                  Click to View Project →
                </button>
              </div>
            </div>
          )}

          {activeTab === "webcam" && (
            <div className="view-container webcam-view">
              <div className="webcam-card">
                <WebcamSign onPrediction={handlePrediction} />
              </div>
            </div>
          )}

          {activeTab === "morse" && (
            <div className="view-container morse-view">
              <div className="card glass-panel">
                <MorseInput onTextChange={handleMorseUpdate} />
              </div>
            </div>
          )}

          {activeTab === "avatar" && (
            <div className="view-container avatar-view">
              <div className="card glass-panel" style={{ marginTop: "120px", maxWidth: "600px", textAlign: "center" }}>
                <h2 style={{ color: "var(--primary-color)", marginBottom: "1rem" }}>Feature Coming Soon</h2>
                <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
                  3D Avatar model is in developing state, soon will get updated.
                </p>
              </div>
            </div>
          )}

          {activeTab === "tts" && (
            <div className="view-container tts-view">
              <div className="card glass-panel" style={{ width: "100%", maxWidth: "700px" }}>
                <h2 style={{ color: "var(--primary-color)", marginBottom: "20px" }}>Text to Speech</h2>

                <textarea
                  className="avatar-input"
                  style={{
                    width: "100%",
                    height: "150px",
                    resize: "none",
                    fontSize: "1.2rem",
                    marginBottom: "20px",
                    lineHeight: "1.5"
                  }}
                  placeholder="Enter text here to convert to speech..."
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                />

                <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                  <button
                    className="avatar-btn"
                    style={{ padding: "10px 30px", fontSize: "1.1rem" }}
                    onClick={handleSpeak}
                  >
                    {isSpeaking ? "Pause" : "Speak"}
                  </button>

                  <button
                    className="nav-btn"
                    style={{ border: "1px solid #555" }}
                    onClick={handleStop}
                  >
                    Stop
                  </button>
                </div>
              </div>
            </div>
          )}
        </ErrorBoundary>
      </main>

      {/* Info Modal Overlay */}
      {showInfo && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 1000,
            animation: "fadeIn 0.2s"
          }}
          onClick={() => setShowInfo(false)}
        >
          <div
            style={{
              background: "#1a1a1a", padding: "40px", borderRadius: "20px",
              maxWidth: "600px", width: "90%",
              border: "1px solid #444",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInfo(false)}
              style={{
                position: "absolute", top: "15px", right: "20px",
                background: "transparent", border: "none", color: "#888",
                fontSize: "1.5rem", cursor: "pointer"
              }}
            >
              ×
            </button>
            <h2 style={{ color: "var(--primary-color)", marginTop: 0 }}>System Architecture</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ background: "#333", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>1</div>
                <div>
                  <strong>Input Capture</strong>
                  <div style={{ color: "#aaa", fontSize: "0.9rem" }}>Webcam captures video stream in real-time.</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ background: "#333", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>2</div>
                <div>
                  <strong>Feature Extraction</strong>
                  <div style={{ color: "#aaa", fontSize: "0.9rem" }}>MediaPipe Hands extracts 21 3D landmarks (x, y, z) per hand.</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ background: "#333", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>3</div>
                <div>
                  <strong>Classification</strong>
                  <div style={{ color: "#aaa", fontSize: "0.9rem" }}>LSTM / Neural Network processes landmarks to predict gesture.</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ background: "#333", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>4</div>
                <div>
                  <strong>Multimodal Output</strong>
                  <div style={{ color: "#aaa", fontSize: "0.9rem" }}>Sign is converted to Text, Morse Code, and Audio (TTS).</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #333", fontSize: "0.9rem", color: "#666", textAlign: "center" }}>
              AI Multimodal Translation Project
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
