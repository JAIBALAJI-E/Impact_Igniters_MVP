import { useState, useRef } from "react";

export default function MorseInput({ onTextChange }) {
  const [morse, setMorse] = useState("");
  const [decoded, setDecoded] = useState("");
  const [history, setHistory] = useState([]);
  const [copyStatus, setCopyStatus] = useState("Copy");
  const [isHolding, setIsHolding] = useState(false);

  const pressStart = useRef(null);
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const dashAlreadyAdded = useRef(false);

  const HOLD_THRESHOLD = 300;   // ms for hold → dash
  const CLICK_DELAY = 250;      // ms for double click

  // Morse dictionary (A–Z)
  const MORSE_MAP = {
    "·–": "A", "–···": "B", "–·–·": "C", "–··": "D",
    "·": "E", "··–·": "F", "––·": "G", "····": "H",
    "··": "I", "·–––": "J", "–·–": "K", "·–··": "L",
    "––": "M", "–·": "N", "–––": "O", "·––·": "P",
    "––·–": "Q", "·–·": "R", "···": "S", "–": "T",
    "··–": "U", "···–": "V", "·––": "W", "–··–": "X",
    "–·––": "Y", "––··": "Z",
    "·––––": "1", "··–––": "2", "···––": "3", "····–": "4", "·····": "5",
    "–····": "6", "––···": "7", "–––··": "8", "––––·": "9", "–––––": "0"
  };

  /* ---------------- PRESS & HOLD ---------------- */

  const handlePressStart = () => {
    pressStart.current = Date.now();
    dashAlreadyAdded.current = false;
    setIsHolding(true);
  };

  const handlePressEnd = () => {
    if (!pressStart.current) return;

    const duration = Date.now() - pressStart.current;

    if (duration >= HOLD_THRESHOLD && !dashAlreadyAdded.current) {
      setMorse(prev => prev + "–");
      dashAlreadyAdded.current = true;
    }

    pressStart.current = null;
    setIsHolding(false);
  };

  /* ---------------- CLICK / DOUBLE CLICK ---------------- */

  const handleClick = () => {
    if (dashAlreadyAdded.current) return;

    clickCount.current += 1;

    if (clickTimer.current) return;

    clickTimer.current = setTimeout(() => {
      if (dashAlreadyAdded.current) {
        resetClickState();
        return;
      }

      if (clickCount.current === 1) {
        setMorse(prev => prev + "·");
      } else if (clickCount.current === 2) {
        setMorse(prev => prev + "–");
        dashAlreadyAdded.current = true;
      }

      resetClickState();
    }, CLICK_DELAY);
  };

  const resetClickState = () => {
    clickCount.current = 0;
    clickTimer.current = null;
  };

  /* ---------------- DECODE ---------------- */

  const decodeMorse = () => {
    if (!morse.trim()) return;

    const letters = morse.trim().split(" ");
    const text = letters.map(l => MORSE_MAP[l] || "?").join("");

    setDecoded(text);
    setHistory(prev => [text, ...prev].slice(0, 5));
    if (onTextChange) onTextChange(text);
  };

  const handleCopy = () => {
    if (!decoded) return;
    navigator.clipboard.writeText(decoded);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus("Copy"), 2000);
  };

  return (
    <div className="morse-view" style={{ width: "100%", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column", padding: "10px", overflow: "hidden" }}>
      <h2 style={{ marginBottom: "10px", color: "var(--primary-color)", textAlign: "center", fontSize: "1.2rem", textTransform: "uppercase", letterSpacing: "2px" }}>
        Manual Morse Terminal
      </h2>

      <div className="morse-container" style={{ display: "flex", width: "100%", height: "100%", gap: "15px" }}>

        {/* LEFT COLUMN: Input Pad (30%) */}
        <div style={{ flex: "0 0 30%", display: "flex", flexDirection: "column" }}>
          <div className="glass-panel" style={{ height: "100%", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <button
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              onClick={handleClick}
              className="avatar-btn"
              style={{
                background: isHolding
                  ? "linear-gradient(135deg, #bc13fe, #00f3ff)" /* Active Gradient */
                  : "rgba(255, 255, 255, 0.05)",
                border: "2px solid var(--primary-color)",
                borderRadius: "20px",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#fff",
                textShadow: "0 0 10px rgba(0,0,0,0.5)",
                cursor: "pointer",
                transition: "all 0.1s ease",
                boxShadow: isHolding ? "0 0 40px rgba(0, 243, 255, 0.6)" : "inset 0 0 20px rgba(0, 243, 255, 0.1)"
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "20px", filter: "drop-shadow(0 0 10px rgba(0, 243, 255, 0.8))" }}>🖱️</div>
              <div style={{ textTransform: "uppercase", letterSpacing: "1px" }}>Click Area</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "10px", fontWeight: "normal" }}>
                CLICK = DOT (·)<br />HOLD = DASH (–)
              </div>
            </button>
          </div>
        </div>

        {/* CENTER COLUMN: Reference Grid (40%) */}
        <div style={{ flex: "0 0 40%", display: "flex", flexDirection: "column" }}>
          <div className="glass-panel" style={{ height: "100%", padding: "15px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--accent-color)", textAlign: "center", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "1px" }}>Morse Reference</h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
              overflowY: "auto",
              paddingRight: "5px",
              flex: 1,
              alignContent: "start"
            }}>
              {Object.entries(MORSE_MAP)
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([code, char]) => (
                  <div
                    key={char}
                    onClick={() => setMorse(prev => prev + code + " ")}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "6px",
                      padding: "8px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      minHeight: "50px"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0, 243, 255, 0.1)"; e.currentTarget.style.borderColor = "var(--primary-color)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
                  >
                    <span style={{ fontWeight: "800", color: "#fff", fontSize: "1rem" }}>{char}</span>
                    <span style={{ fontFamily: "monospace", color: "var(--primary-color)", fontSize: "0.8rem" }}>{code}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output & Controls (30%) */}
        <div style={{ flex: "0 0 30%", display: "flex", flexDirection: "column" }}>
          <div className="glass-panel" style={{ height: "100%", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

            {/* Top: Signal Display */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ background: "#000", padding: "15px", borderRadius: "8px", border: "1px solid #333", minHeight: "60px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)" }}>
                <span style={{ fontSize: "2rem", fontFamily: "monospace", letterSpacing: "3px", color: "var(--primary-color)", wordBreak: "break-all" }}>
                  {morse || <span style={{ opacity: 0.2, fontSize: "0.8rem" }}>_</span>}
                </span>
              </div>

              <div style={{
                background: "rgba(188, 19, 254, 0.05)",
                border: "1px solid rgba(188, 19, 254, 0.3)",
                borderRadius: "8px",
                padding: "15px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "0.8rem", color: "var(--secondary-color)", marginBottom: "5px", textTransform: "uppercase" }}>Decoded Message</div>
                <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#fff", textShadow: "0 0 10px rgba(188, 19, 254, 0.5)" }}>
                  {decoded || <span style={{ opacity: 0.3 }}>...</span>}
                </div>
              </div>
            </div>

            {/* Bottom: Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="nav-btn" onClick={() => setMorse(prev => prev + " ")} style={{ flex: 1, fontSize: "0.8rem" }}>SPACE</button>
                <button className="nav-btn" onClick={() => setMorse("")} style={{ flex: 1, fontSize: "0.8rem", borderColor: "#ef4444", color: "#ef4444" }}>CLEAR</button>
              </div>
              <button className="cta-btn" onClick={decodeMorse} style={{ width: "100%", padding: "12px", fontSize: "1rem" }}>
                DECODE
              </button>

              {/* Tiny Actions */}
              {decoded && (
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
                  <button onClick={() => { const u = new SpeechSynthesisUtterance(decoded); window.speechSynthesis.speak(u); }} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.2rem", opacity: 0.8 }}>🔊</button>
                  <button onClick={handleCopy} style={{ background: "transparent", border: "1px solid #555", borderRadius: "4px", color: "#aaa", fontSize: "0.7rem", padding: "4px 8px", cursor: "pointer" }}>{copyStatus}</button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}