import { useState, useRef } from "react";

export default function MorseInput({ onTextChange }) {
  const [morse, setMorse] = useState("");
  const [decoded, setDecoded] = useState("");
  const [history, setHistory] = useState([]);
  const clickTimeout = useRef(null);
  const [copyStatus, setCopyStatus] = useState("Copy");

  // Morse dictionary (A–Z)
  const MORSE_MAP = {
    "·–": "A", "–···": "B", "–·–·": "C", "–··": "D",
    "·": "E", "··–·": "F", "––·": "G", "····": "H",
    "··": "I", "·–––": "J", "–·–": "K", "·–··": "L",
    "––": "M", "–·": "N", "–––": "O", "·––·": "P",
    "––·–": "Q", "·–·": "R", "···": "S", "–": "T",
    "··–": "U", "···–": "V", "·––": "W", "–··–": "X",
    "–·––": "Y", "––··": "Z"
  };

  // Single click → dot
  const handleClick = () => {
    clickTimeout.current = setTimeout(() => {
      setMorse((prev) => prev + "·");
    }, 200);
  };

  // Double click → dash
  const handleDoubleClick = () => {
    clearTimeout(clickTimeout.current);
    setMorse((prev) => prev + "–");
  };

  // Decode morse to text
  const decodeMorse = () => {
    if (!morse.trim()) return;

    const letters = morse.trim().split(" ");
    const text = letters
      .map((l) => MORSE_MAP[l] || "?")
      .join("");

    setDecoded(text);
    // Add to history (newest first)
    setHistory(prev => [text, ...prev].slice(0, 5)); // Keep last 5

    if (onTextChange) onTextChange(text);
  };

  const handleCopy = () => {
    if (decoded) {
      navigator.clipboard.writeText(decoded);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus("Copy"), 2000);
    }
  };

  return (
    <div className="morse-view">
      <h2 style={{ marginBottom: "20px", color: "var(--primary-color)" }}>Morse Code Input</h2>

      <div className="morse-container">
        {/* Left Column: Input Area */}
        <div className="morse-main">
          <div className="glass-panel" style={{ maxWidth: "600px" }}>
            <button
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              className="avatar-btn"
              style={{
                padding: "30px",
                fontSize: "20px",
                width: "100%",
                marginBottom: "20px",
                background: "linear-gradient(135deg, #444, #222)",
                border: "1px solid #555"
              }}
            >
              TAP HERE (Click = Dot · / Double = Dash –)
            </button>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="nav-btn" onClick={() => setMorse(morse + " ")}>Space (Next Letter)</button>
              <button className="nav-btn" onClick={() => setMorse("")}>Clear Input</button>
              <button className="avatar-btn" onClick={decodeMorse}>Decode Message</button>
            </div>

            <div style={{ margin: "30px 0", fontSize: "2rem", letterSpacing: "5px", fontFamily: "monospace", minHeight: "40px" }}>
              {morse || <span style={{ opacity: 0.3 }}>... --- ...</span>}
            </div>

            {decoded && (
              <div style={{
                background: "rgba(100, 108, 255, 0.1)",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid var(--primary-color)",
                position: "relative"
              }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", textTransform: "uppercase", opacity: 0.7 }}>Decoded Result</h3>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{decoded}</div>

                <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "5px" }}>
                  <button
                    onClick={() => {
                      const u = new SpeechSynthesisUtterance(decoded);
                      window.speechSynthesis.speak(u);
                    }}
                    style={{
                      background: "transparent",
                      border: "1px solid #555",
                      color: "#aaa",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "0.8rem"
                    }}
                  >
                    🔊
                  </button>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: "transparent",
                      border: "1px solid #555",
                      color: "#aaa",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "0.8rem"
                    }}
                  >
                    {copyStatus}
                  </button>
                </div>
              </div>
            )}

            {/* History Log - Inside Left Column */}
            {history.length > 0 && (
              <div style={{ marginTop: "30px", textAlign: "left" }}>
                <h4 style={{ borderBottom: "1px solid #333", paddingBottom: "10px", color: "#888" }}>Recent History</h4>
                {history.map((item, idx) => (
                  <div key={idx} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#ccc" }}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reference Sheet */}
        <div className="morse-sidebar">
          <h3 style={{ margin: "0 0 15px 0", color: "#fff", borderBottom: "1px solid #333", paddingBottom: "10px" }}>Reference</h3>
          <div className="morse-list">
            {Object.entries(MORSE_MAP).sort((a, b) => a[1].localeCompare(b[1])).map(([code, char]) => (
              <div key={char} className="morse-item" onClick={() => setMorse(morse + code + " ")}>
                <span className="morse-char">{char}</span>
                <span className="morse-code">{code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}