import React, { useEffect, useRef } from 'react';

const BlinkMorse = ({ morseSequence, decodedText, isBlinking, blinkType, onClear }) => {
    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        padding: "20px",
        boxSizing: "border-box",
        color: "#fff",
        fontFamily: "'Rajdhani', sans-serif"
    };

    const eyeContainerStyle = {
        position: "relative",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        border: "2px solid #333",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0,0,0,0.5)",
        boxShadow: isBlinking
            ? (blinkType === "dash"
                ? "0 0 30px #bc13fe" // Purple for DASH
                : "0 0 30px #00f3ff" // Cyan for DOT
            )
            : "inset 0 0 20px rgba(0,0,0,0.8)",
        transition: "all 0.1s ease"
    };

    const eyeIconStyle = {
        fontSize: "3rem",
        opacity: isBlinking ? 1 : 0.3,
        transform: isBlinking ? "scale(1.2)" : "scale(1)",
        transition: "all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    };

    return (
        <div style={containerStyle}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h2 style={{ color: "#00f3ff", margin: 0, textTransform: "uppercase", letterSpacing: "2px", fontSize: "1.5rem" }}>
                    <span style={{ marginRight: "10px" }}>👁️</span>
                    Blink Terminal
                </h2>
                <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "5px" }}>
                    BLINK 1x = DOT • | BLINK 2x = DASH —
                </div>
            </div>

            {/* VISUAL FEEDBACK */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <div style={eyeContainerStyle}>
                    <div style={eyeIconStyle}>
                        {isBlinking ? (blinkType === "dash" ? "▬" : "●") : "👁"}
                    </div>
                </div>
                <div style={{ marginTop: "20px", fontFamily: "monospace", fontSize: "1.2rem", height: "30px", color: isBlinking ? "#fff" : "transparent" }}>
                    {isBlinking ? (blinkType === "dash" ? "DASH" : "DOT") : "_"}
                </div>
            </div>

            {/* TERMINAL DISPLAY */}
            <div style={{ width: "100%", background: "#050505", border: "1px solid #333", borderRadius: "10px", padding: "15px", marginBottom: "15px", position: "relative", overflow: "hidden" }}>
                {/* Scanline Effect */}
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 2px, 3px 100%", pointerEvents: "none", zIndex: 10 }}></div>

                <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "0.7rem", color: "#666", display: "block", marginBottom: "5px" }}>RAW SIGNAL STREAM</label>
                    <div style={{ fontFamily: "'Courier New', monospace", fontSize: "1.5rem", color: "#00f3ff", letterSpacing: "5px", minHeight: "30px", overflowX: "auto", whiteSpace: "nowrap" }}>
                        {morseSequence || <span style={{ opacity: 0.3, animation: "blink 1s infinite" }}>_</span>}
                    </div>
                </div>

                <div style={{ borderTop: "1px solid #222", paddingTop: "10px" }}>
                    <label style={{ fontSize: "0.7rem", color: "#666", display: "block", marginBottom: "5px" }}>DECODED MESSAGE</label>
                    <div style={{ fontFamily: "'Courier New', monospace", fontSize: "2rem", color: "#bc13fe", fontWeight: "bold", minHeight: "40px", textShadow: "0 0 10px rgba(188, 19, 254, 0.5)" }}>
                        {decodedText || <span style={{ opacity: 0.2 }}>WAITING_FOR_INPUT...</span>}
                    </div>
                </div>
            </div>

            <button
                onClick={onClear}
                style={{
                    background: "transparent",
                    border: "1px solid #444",
                    color: "#aaa",
                    padding: "10px 30px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontSize: "0.8rem",
                    transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = "#ef4444"; e.target.style.color = "#ef4444"; }}
                onMouseLeave={(e) => { e.target.style.borderColor = "#444"; e.target.style.color = "#aaa"; }}
            >
                Reset System
            </button>
        </div>
    );
};
export default BlinkMorse;
