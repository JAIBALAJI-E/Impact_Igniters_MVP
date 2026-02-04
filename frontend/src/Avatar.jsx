import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useFBX, useAnimations, OrbitControls, Environment, Html } from "@react-three/drei";

/**
 * Loads the avatar model from /avatar.fbx
 * Plays animations based on the 'action' prop.
 */
function Model({ action }) {
  const group = useRef();

  // Load the FBX model
  const fbx = useFBX("/avatar.fbx");

  // Extract animations
  const { actions, names } = useAnimations(fbx.animations, group);

  // State to store matched animation for debug display
  const [currentAnim, setCurrentAnim] = useState("None");

  useEffect(() => {
    // 1. Stop all current animations
    Object.values(actions).forEach((act) => act.stop());

    // 2. Find animation
    const fmtAction = action.replace(" ", "").toLowerCase();

    // Fuzzy matching
    let foundAnim = names.find(key => key.toLowerCase().includes(fmtAction));

    // Fallbacks
    if (!foundAnim) {
      if (action === "HELLO") foundAnim = names.find(k => k.toLowerCase().includes("hello"));
      if (action === "THANK YOU") foundAnim = names.find(k => k.toLowerCase().includes("thank"));
      if (action === "YES") foundAnim = names.find(k => k.toLowerCase().includes("yes"));
      if (action === "NO") foundAnim = names.find(k => k.toLowerCase().includes("no"));
    }

    // Default to Idle if still not found
    if (!foundAnim) {
      foundAnim = names.find(k => k.toLowerCase().includes("idle"));
    }

    setCurrentAnim(foundAnim || "None");

    const targetAction = actions[foundAnim];
    if (targetAction) {
      targetAction.reset().fadeIn(0.5).play();
    }

    return () => {
      if (targetAction) targetAction.fadeOut(0.5);
    };
  }, [action, actions, names]);

  return (
    <group ref={group} dispose={null}>
      {/* Scale increased to 3 based on user feedback (tiny avatar) */}
      <primitive object={fbx} scale={3} position={[0, -3, 0]} />
    </group>
  );
}

export default function Avatar({ action }) {
  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        background: "linear-gradient(135deg, #1e1e1e, #2a2a2a)",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #444",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        position: "relative"
      }}
    >
      <div style={{ position: "absolute", top: 10, left: 10, color: "#888", fontSize: "0.8rem", zIndex: 10 }}>
        Avatar Action: {action}
      </div>

      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
        <ambientLight intensity={0.9} />
        <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={1} />
        <directionalLight position={[-5, 5, 5]} intensity={1} />
        <Environment preset="city" />

        <React.Suspense fallback={<Html center>Loading 3D Model...</Html>}>
          <Model action={action} />
        </React.Suspense>

        <OrbitControls enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}
