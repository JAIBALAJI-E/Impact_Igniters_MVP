import React, { useState } from "react";
import WebcamSign from "./WebcamSign.jsx";
import MorseInput from "./MorseInput.jsx";
import Avatar from "./Avatar.jsx";
import SpeechText from "./SpeechText.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [avatarText, setAvatarText] = useState("HELLO");
  const [landmarks, setLandmarks] = useState(null);

  const [showInfo, setShowInfo] = useState(false);

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
            className={`nav-btn ${activeTab === "blink" ? "active" : ""}`}
            onClick={() => setActiveTab("blink")}
          >
            Blink Input
          </button>
          <button
            className={`nav-btn ${activeTab === "morse" ? "active" : ""}`}
            onClick={() => setActiveTab("morse")}
          >
            Manual Morse
          </button>
          <button
            className={`nav-btn ${activeTab === "voice" ? "active" : ""}`}
            onClick={() => setActiveTab("voice")}
          >
            Voice to Text
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
                  Features <strong>3D Avatar Translation</strong> and <strong>Voice-to-Text Integration</strong>.
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

          <div className="view-container webcam-view" style={{ display: (activeTab === "webcam" || activeTab === "blink") ? "flex" : "none" }}>
            <div className="webcam-card">
              <WebcamSign
                mode={activeTab === "webcam" ? "sign" : "blink"}
                onPrediction={handlePrediction}
                onLandmarks={setLandmarks}
              />
            </div>
          </div>

          {activeTab === "morse" && (
            <div className="view-container morse-view">
              <div className="card glass-panel">
                <MorseInput onTextChange={handleMorseUpdate} />
              </div>
            </div>
          )}

          {activeTab === "avatar" && (
            <div className="view-container avatar-view">
              <div className="card glass-panel" style={{ marginTop: "40px", maxWidth: "800px", width: "90%", padding: "0" }}>
                <Avatar sign={avatarText} landmarks={landmarks} />
              </div>
            </div>
          )}

          {activeTab === "voice" && (
            <SpeechText />
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
