import React, { useState, useEffect, useRef } from 'react';

const SpeechText = () => {
    /* ---------------- CONFIG ---------------- */
    const LANGUAGES = [
        { code: 'en-US', name: 'English (US)' },
        { code: 'hi-IN', name: 'Hindi (हिंदी)' },
        { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
        { code: 'te-IN', name: 'Telugu (తెలుగు)' },
        { code: 'es-ES', name: 'Spanish (Español)' },
        { code: 'fr-FR', name: 'French (Français)' },
        { code: 'de-DE', name: 'German (Deutsch)' },
        { code: 'zh-CN', name: 'Chinese (中文)' },
        { code: 'ja-JP', name: 'Japanese (日本語)' },
        { code: 'ar-SA', name: 'Arabic (العربية)' },
        { code: 'ko-KR', name: 'Korean (한국어)' },
        { code: 'pt-BR', name: 'Portuguese (Português)' },
        { code: 'ru-RU', name: 'Russian (Русский)' },
    ];

    /* ---------------- STATE ---------------- */
    const [selectedLang, setSelectedLang] = useState('en-IN');

    // TTS State
    const [ttsText, setTtsText] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthRef = useRef(window.speechSynthesis);

    // STT State
    const [sttText, setSttText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    /* ---------------- TTS LOGIC ---------------- */
    const handleSpeak = () => {
        if (!synthRef.current) {
            alert("Text-to-Speech is not supported in this browser.");
            return;
        }

        if (isSpeaking) {
            synthRef.current.pause();
            setIsSpeaking(false);
        } else {
            if (synthRef.current.paused && synthRef.current.speaking) {
                synthRef.current.resume();
                setIsSpeaking(true);
            } else {
                const utterance = new SpeechSynthesisUtterance(ttsText || "Please enter some text.");
                utterance.lang = selectedLang; // Set Language

                // Try to find a matching voice
                const voices = synthRef.current.getVoices();
                const matchingVoice = voices.find(v => v.lang === selectedLang || v.lang.startsWith(selectedLang.split('-')[0]));
                if (matchingVoice) utterance.voice = matchingVoice;

                utterance.onend = () => setIsSpeaking(false);
                synthRef.current.speak(utterance);
                setIsSpeaking(true);
            }
        }
    };

    const handleStopSpeak = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    /* ---------------- STT LOGIC ---------------- */
    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = selectedLang; // Initial Language

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setSttText(transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                if (event.error === 'not-allowed') {
                    alert("Microphone access blocked. Please allow perms.");
                    setIsListening(false);
                }
            };

            recognition.onend = () => {
                // If purely 'onend' fires without us stopping, it might be silence timeout. 
                // But we usually want to rely on the boolean state to restart or not.
                // For simplicity, we just sync state.
                setIsListening(false);
            };

            recognitionRef.current = recognition;

        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }

        // Cleanup on unmount
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        }
    }, []); // Run once on mount to create instance? 
    // Actually, if language changes, we need to update the instance property.

    // Effect to update language dynamically
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = selectedLang;
            // If currently listening, we might need to restart to apply lang change?
            // Usually browsers require restart.
            if (isListening) {
                recognitionRef.current.stop();
                // 'onend' will set isListening false.
                // We'd need a way to auto-restart if we wanted seamless switching, 
                // but manual restart is safer for UX.
            }
        }
    }, [selectedLang]);


    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech Recognition is not supported in this browser. Try Chrome.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            // Ensure lang is set before starting
            recognitionRef.current.lang = selectedLang;
            try {
                recognitionRef.current.start();
                setIsListening(true);
                setSttText("");
            } catch (err) {
                console.error("Start error:", err);
            }
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    /* ---------------- RENDER ---------------- */
    return (
        <div className="view-container speech-view" style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "calc(100vh - 80px)",
            padding: "20px",
            gap: "20px"
        }}>

            {/* LANGUAGE SELECTOR BAR */}
            <div className="glass-panel" style={{ padding: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
                <label style={{ color: "var(--primary-color)", fontWeight: "bold", textTransform: "uppercase" }}>Select Language:</label>
                <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "5px",
                        background: "#000",
                        color: "#fff",
                        border: "1px solid var(--primary-color)",
                        fontSize: "1rem",
                        cursor: "pointer",
                        outline: "none"
                    }}
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>*Applies to both Voice & Text</div>
            </div>


            <div style={{ display: "flex", flex: 1, gap: "20px", overflow: "hidden" }}>
                {/* LEFT COLUMN: Text to Speech (TTS) - 50% */}
                <div className="glass-panel" style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    padding: "30px",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <h2 style={{ color: "var(--primary-color)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "2px" }}>
                        🗣️ Text to Speech
                    </h2>

                    <textarea
                        className="avatar-input"
                        style={{
                            width: "100%",
                            height: "200px",
                            resize: "none",
                            fontSize: "1.2rem",
                            marginBottom: "30px",
                            lineHeight: "1.5",
                            padding: "20px",
                            background: "rgba(0,0,0,0.3)",
                            border: "1px solid var(--glass-border)",
                            borderRadius: "10px",
                            color: "#fff"
                        }}
                        placeholder={`Type ${LANGUAGES.find(l => l.code === selectedLang)?.name.split(' ')[0]} text here...`}
                        value={ttsText}
                        onChange={(e) => setTtsText(e.target.value)}
                    />

                    <div style={{ display: "flex", gap: "20px", width: "100%" }}>
                        <button
                            className="avatar-btn"
                            style={{
                                flex: 1,
                                padding: "15px",
                                fontSize: "1.1rem",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                background: isSpeaking ? "var(--secondary-color)" : ""
                            }}
                            onClick={handleSpeak}
                        >
                            {isSpeaking ? "⏸️ Pause" : "▶️ Speak"}
                        </button>

                        <button
                            className="nav-btn"
                            style={{ flex: 1, border: "1px solid #555", color: "#aaa" }}
                            onClick={handleStopSpeak}
                        >
                            ⏹️ Stop
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Voice to Text (STT) - 50% */}
                <div className="glass-panel" style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    padding: "30px",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <h2 style={{ color: "var(--accent-color)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "2px" }}>
                        🎙️ Voice to Text
                    </h2>

                    <div style={{
                        width: "100%",
                        height: "200px",
                        background: "rgba(0,0,0,0.5)",
                        border: `1px solid ${isListening ? "var(--accent-color)" : "var(--glass-border)"}`,
                        borderRadius: "10px",
                        padding: "20px",
                        marginBottom: "30px",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: isListening ? "0 0 20px rgba(10, 255, 165, 0.2)" : "none",
                        transition: "all 0.3s ease"
                    }}>
                        {sttText ? (
                            <p style={{ fontSize: "1.2rem", lineHeight: "1.6", color: "#fff", margin: 0 }}>
                                {sttText}
                            </p>
                        ) : (
                            <p style={{ color: "#666", fontStyle: "italic", margin: "auto", textAlign: "center" }}>
                                {isListening
                                    ? `Listening (${LANGUAGES.find(l => l.code === selectedLang)?.name})...`
                                    : `Click 'Start Listening' and speak in ${LANGUAGES.find(l => l.code === selectedLang)?.name}...`}
                            </p>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: "20px", width: "100%" }}>
                        <button
                            className="avatar-btn"
                            style={{
                                flex: 1,
                                padding: "15px",
                                fontSize: "1.1rem",
                                background: isListening ? "var(--accent-color)" : "",
                                color: isListening ? "#000" : "#fff",
                                borderColor: isListening ? "var(--accent-color)" : "var(--primary-color)"
                            }}
                            onClick={toggleListening}
                        >
                            {isListening ? "Refusing Connection..." : "🎤 Start Listening"}
                        </button>

                        <button
                            className="nav-btn"
                            style={{ flex: 0.5, border: "1px solid #555" }}
                            onClick={() => copyToClipboard(sttText)}
                            title="Copy to Clipboard"
                        >
                            📋 Copy
                        </button>
                    </div>

                    {/* Visualizer Effect */}
                    {isListening && (
                        <div style={{
                            position: "absolute", bottom: 0, left: 0, width: "100%", height: "5px",
                            background: "linear-gradient(90deg, var(--accent-color), var(--primary-color), var(--accent-color))",
                            animation: "slide 2s infinite linear"
                        }} />
                    )}
                </div>
            </div>

        </div>
    );
};

export default SpeechText;
