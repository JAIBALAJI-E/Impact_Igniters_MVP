import React from "react";

const MorseReference = () => {
    const morseCode = [
        { char: 'A', code: '.-' }, { char: 'B', code: '-...' },
        { char: 'C', code: '-.-.' }, { char: 'D', code: '-..' },
        { char: 'E', code: '.' }, { char: 'F', code: '..-.' },
        { char: 'G', code: '--.' }, { char: 'H', code: '....' },
        { char: 'I', code: '..' }, { char: 'J', code: '.---' },
        { char: 'K', code: '-.-' }, { char: 'L', code: '.-..' },
        { char: 'M', code: '--' }, { char: 'N', code: '-.' },
        { char: 'O', code: '---' }, { char: 'P', code: '.--.' },
        { char: 'Q', code: '--.-' }, { char: 'R', code: '.-.' },
        { char: 'S', code: '...' }, { char: 'T', code: '-' },
        { char: 'U', code: '..-' }, { char: 'V', code: '...-' },
        { char: 'W', code: '.--' }, { char: 'X', code: '-..-' },
        { char: 'Y', code: '-.--' }, { char: 'Z', code: '--..' },
        { char: '1', code: '.----' }, { char: '2', code: '..---' },
        { char: '3', code: '...--' }, { char: '4', code: '....-' },
        { char: '5', code: '.....' }, { char: '6', code: '-....' },
        { char: '7', code: '--...' }, { char: '8', code: '---..' },
        { char: '9', code: '----.' }, { char: '0', code: '-----' }
    ];

    return (
        <div style={{
            height: "100%",
            background: "#1e1e1e",
            borderLeft: "1px solid #333",
            display: "flex",
            flexDirection: "column",
            boxShadow: "-5px 0 15px rgba(0,0,0,0.3)",
            color: "#fff"
        }}>
            <div style={{
                padding: "15px",
                borderBottom: "1px solid #333",
                background: "#252525",
                textAlign: "center"
            }}>
                <h3 style={{ margin: 0, fontSize: "1rem" }}>Morse Reference</h3>
            </div>

            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                alignContent: "start"
            }}>
                {morseCode.map((item) => (
                    <div key={item.char} style={{
                        background: "#2a2a2a",
                        padding: "8px",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.9rem"
                    }}>
                        <span style={{ fontWeight: "bold", color: "#4ade80" }}>{item.char}</span>
                        <span style={{ fontFamily: "monospace", color: "#ddd" }}>{item.code}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MorseReference;
