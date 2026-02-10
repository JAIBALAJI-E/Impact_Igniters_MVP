// ... imports
import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFBX, useAnimations, OrbitControls, Environment, Html, Center } from '@react-three/drei';

/**
 * Hand Skeleton Component
 * Renders 3D spheres for hand landmarks.
 */
function HandSkeleton({ landmarks }) {
  if (!landmarks || landmarks.length === 0) return null;

  return (
    <group>
      {landmarks.map((hand, handIndex) => (
        <group key={handIndex}>
          {hand.map((lm, lmIndex) => (
            <mesh
              key={lmIndex}
              position={[(lm.x - 0.5) * -5, -(lm.y - 0.5) * 5, -lm.z * 5]}
            >
              {/* 
                 Mapping: 
                 x: mirrored and centered 
                 y: inverted (MediaPipe top-left origin vs Three.js bottom-left)
                 z: scaled
               */}
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshStandardMaterial color={handIndex === 0 ? "#00ffff" : "#ff00ff"} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/**
 * Avatar Model Component
 * Loads avatar.fbx and handles animations/controls.
 */
function Model({ sign, scale, rotationY }) {
  // ... existing Model code ...
  const group = useRef();
  // Load the FBX model
  const fbx = useFBX('/avatar.fbx');
  // Get animations from the FBX
  const { actions, names } = useAnimations(fbx.animations, group);

  useEffect(() => {
    // Stop all previous actions
    Object.values(actions).forEach(action => action.stop());

    if (sign && sign !== "No sign detected") {
      // Clean the sign text for matching (e.g. "THANK YOU" -> "thank")
      const search = sign.toLowerCase().replace(" ", "");

      // Attempt to find a matching animation
      // 1. Exact match (case insensitive)
      // 2. Partial match
      let clip = names.find(n => n.toLowerCase() === search)
        || names.find(n => n.toLowerCase().includes(search));

      // Fallbacks
      if (!clip) {
        if (search.includes("hello")) clip = names.find(n => n.toLowerCase().includes("wave") || n.toLowerCase().includes("hello"));
        if (search.includes("thank")) clip = names.find(n => n.toLowerCase().includes("thank") || n.toLowerCase().includes("bow"));
        if (search.includes("yes")) clip = names.find(n => n.toLowerCase().includes("nod") || n.toLowerCase().includes("yes"));
        if (search.includes("no")) clip = names.find(n => n.toLowerCase().includes("shake") || n.toLowerCase().includes("no"));
      }

      if (clip) {
        const action = actions[clip];
        action.reset().fadeIn(0.5).play();
        console.log(`Playing animation: ${clip} for sign: ${sign}`);
      } else {
        // Idle
        const idle = names.find(n => n.toLowerCase().includes("idle"));
        if (idle) actions[idle].reset().fadeIn(0.5).play();
      }
    } else {
      // Idle state
      const idle = names.find(n => n.toLowerCase().includes("idle"));
      if (idle) actions[idle].reset().fadeIn(0.5).play();
    }

  }, [sign, actions, names]);

  return (
    <group ref={group} rotation={[0, rotationY, 0]}>
      <Center top>
        <primitive
          object={fbx}
          scale={scale}
        />
      </Center>
    </group>
  );
}

// ... ErrorFallback and Loader ...

function ErrorFallback() {
  return (
    <Html center>
      <div style={{ color: '#ef4444', textAlign: 'center', width: '300px', background: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '10px' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Failed to load 3D Model</p>
        <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#ccc' }}>
          Please ensure <code>avatar.fbx</code> is present in the <code>public/</code> folder.
        </p>
      </div>
    </Html>
  );
}

function Loader() {
  return <Html center><div style={{ color: 'white' }}>Loading Avatar...</div></Html>;
}

export default function Avatar({ sign, landmarks }) {
  // Manual Controls State
  const [scale, setScale] = useState(0.012);
  const [rotationY, setRotationY] = useState(0);
  const [manualInput, setManualInput] = useState(""); // Manual overridden sign

  // Constants
  const MIN_SCALE = 0.001;
  const MAX_SCALE = 0.05;

  // Sign to use: Manual input takes precedence, otherwise parsed prediction
  const activeSign = manualInput.length > 0 ? manualInput : sign;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* 3D Canvas Area */}
      <div style={{
        width: '100%',
        height: '500px',
        background: 'linear-gradient(to bottom, #1a1a1a, #2a2a2a)',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={1} />
          <directionalLight position={[-5, 5, 5]} intensity={0.8} />
          <Environment preset="city" />

          <React.Suspense fallback={<Loader />}>
            <Model sign={activeSign} scale={scale} rotationY={rotationY} />
            {/* Render Real-time Hand Skeleton */}
            <HandSkeleton landmarks={landmarks} />
          </React.Suspense>

          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      {/* Info & Controls Section */}
      <div style={{
        width: '100%',
        marginTop: '20px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>

        {/* Action Display & Manual Input */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px 0' }}>
            Current Action
          </h3>

          <div style={{ marginBottom: '15px' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: activeSign && activeSign !== "No sign detected" ? '#4ade80' : '#666',
              textShadow: activeSign && activeSign !== "No sign detected" ? '0 0 20px rgba(74, 222, 128, 0.3)' : 'none'
            }}>
              {activeSign || "Waiting for input..."}
            </div>
          </div>

          {/* Manual Text Input */}
          <input
            type="text"
            placeholder="Type action name manually..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            style={{
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #444',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontSize: '1rem',
              width: '80%',
              maxWidth: '300px',
              textAlign: 'center'
            }}
          />
        </div>

        {/* Adjustments Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Scale Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: '0.9rem' }}>
              <span>Avatar Scale</span>
              <span style={{ fontFamily: 'monospace', color: '#888' }}>{scale.toFixed(4)}</span>
            </label>
            <input
              type="range"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step={0.0001}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#4ade80' }}
            />
          </div>

          {/* Rotation Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: '0.9rem' }}>
              <span>Rotation Y</span>
              <span style={{ fontFamily: 'monospace', color: '#888' }}>{Math.round(rotationY * (180 / Math.PI))}°</span>
            </label>
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step={0.1}
              value={rotationY}
              onChange={(e) => setRotationY(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#4ade80' }}
            />
          </div>

        </div>
      </div>

    </div>
  );
}

// Preload the model
useFBX.preload('/avatar.fbx');
