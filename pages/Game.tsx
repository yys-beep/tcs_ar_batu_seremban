/// <reference types="@react-three/fiber" />
import React, { useRef, useState, useEffect, useMemo } from 'react';
import Webcam from 'react-webcam';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Cylinder, Sphere, Tetrahedron, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

// --- Configuration ---
const MOBILE_CONSTRAINTS = {
  facingMode: "environment",
  width: { ideal: 480 },
  height: { ideal: 640 } 
};

const DESKTOP_CONSTRAINTS = {
  width: 1280,
  height: 720,
  facingMode: "user"
};

const BOUNDS = { x: 4.5, yTop: 4.0, yBottom: -5 }; 
const PICKUP_THRESHOLD_Y = -2.0; 
const TOSS_THRESHOLD_Y = 0.8; 
const RELOAD_THRESHOLD_Y = -1.0; 

// --- Types ---
enum GameState { IDLE, HOLDING, TOSSING, FALLING, CAUGHT, DROPPED, LEVEL_COMPLETE, GAME_OVER }
type StageAction = 'PICK' | 'PLACE' | 'EXCHANGE';
interface StageConfig { action: StageAction; count: number; message: string; }
interface LevelConfig { id: number; name: string; stages: StageConfig[]; gravity: number; catchRadius: number; initialHandStones: number; initialGroundStones: number; }

const LEVELS: Record<number, LevelConfig> = {
  1: { id: 1, name: "LEVEL 1: BUAH SATU", stages: [{ action: 'PICK', count: 1, message: "PICK 1 STONE" }, { action: 'PICK', count: 1, message: "PICK 1 STONE" }, { action: 'PICK', count: 1, message: "PICK 1 STONE" }, { action: 'PICK', count: 1, message: "PICK 1 STONE" }], gravity: -10, catchRadius: 4.5, initialHandStones: 1, initialGroundStones: 4 },
  2: { id: 2, name: "LEVEL 2: BUAH DUA", stages: [{ action: 'PICK', count: 2, message: "PICK 2 STONES" }, { action: 'PICK', count: 2, message: "PICK 2 STONES" }], gravity: -12, catchRadius: 4.0, initialHandStones: 1, initialGroundStones: 4 },
  3: { id: 3, name: "LEVEL 3: BUAH TIGA", stages: [{ action: 'PICK', count: 3, message: "PICK 3 STONES" }, { action: 'PICK', count: 1, message: "PICK 1 STONE" }], gravity: -14, catchRadius: 3.8, initialHandStones: 1, initialGroundStones: 4 },
  4: { id: 4, name: "LEVEL 4: BUAH EMPAT", stages: [{ action: 'PICK', count: 4, message: "PICK ALL 4 STONES" }], gravity: -15, catchRadius: 3.5, initialHandStones: 1, initialGroundStones: 4 },
  5: { id: 5, name: "LEVEL 5: BUAH LIMA", stages: [{ action: 'PLACE', count: 4, message: "PLACE 4 STONES" }, { action: 'PICK', count: 4, message: "PICK ALL 4" }], gravity: -15, catchRadius: 3.5, initialHandStones: 5, initialGroundStones: 0 },
  6: { id: 6, name: "LEVEL 6: TUKAR", stages: [{ action: 'EXCHANGE', count: 1, message: "EXCHANGE STONE" }, { action: 'EXCHANGE', count: 1, message: "EXCHANGE STONE" }, { action: 'EXCHANGE', count: 1, message: "EXCHANGE STONE" }], gravity: -16, catchRadius: 3.2, initialHandStones: 2, initialGroundStones: 3 },
  7: { id: 7, name: "LEVEL 7: ADVANCED", stages: [{ action: 'PICK', count: 1, message: "PICK 1 (FAST)" }, { action: 'PICK', count: 3, message: "PICK 3 (FAST)" }], gravity: -18, catchRadius: 3.0, initialHandStones: 1, initialGroundStones: 4 },
  8: { id: 8, name: "LEVEL 8: TIMBANG", stages: [{ action: 'PICK', count: 4, message: "CHALLENGE: PICK ALL!" }], gravity: -20, catchRadius: 2.8, initialHandStones: 1, initialGroundStones: 4 },
};

// --- MediaPipe Hook (Updated for Exact Viewport Mapping) ---
const useMediaPipeInput = (webcamRef: React.RefObject<Webcam>, isMobile: boolean, facingMode: string) => {
  const handPos = useRef(new THREE.Vector3(0, -3, 0)); 
  const isPinching = useRef(false);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const lastVideoTime = useRef(-1);
  
  // Get the EXACT size of the 3D world at current depth
  const { viewport } = useThree(); 

  useEffect(() => {
    const setupModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.3,
          minHandPresenceConfidence: 0.3,
          minTrackingConfidence: 0.3
        });
      } catch (err) {
        console.error("Failed to load MediaPipe:", err);
      }
    };
    setupModel();
  }, []);

  useFrame(() => {
    if (!landmarkerRef.current || !webcamRef.current?.video || webcamRef.current.video.readyState !== 4) return;

    const video = webcamRef.current.video;
    if (video.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = video.currentTime;
      const result = landmarkerRef.current.detectForVideo(video, performance.now());

      if (result.landmarks && result.landmarks.length > 0) {
        const landmarks = result.landmarks[0];
        
        // FIX: Coordinate Mapping
        // 0.5 is center. 
        // If facingMode is 'user' (selfie), we mirror (multiply by negative width).
        // If facingMode is 'environment' (back), we DON'T mirror (multiply by positive width).
        
        let xMultiplier = viewport.width; // Use exact screen width
        let yMultiplier = viewport.height; // Use exact screen height
        
        // CORRECTION: Usually MediaPipe x=0 is Left. 
        // If webcam is mirrored on screen, x movement needs to be flipped to match visual.
        // If user says "Real Right is Model Left", we need to FLIP the sign.
        
        let x;
        if (facingMode === 'user') {
             // Selfie Mode: Standard Mirror
             x = -(landmarks[8].x - 0.5) * xMultiplier;
        } else {
             // Back Camera: User reported inverted controls. 
             // We REMOVE the negative sign to fix "Right hand = Left Model".
             // Now Right Hand (x>0.5) => Positive X (Right Model)
             x = (landmarks[8].x - 0.5) * xMultiplier; 
        }

        // Adjust Y (Up is 0 in MediaPipe usually, Down is 1)
        // In 3js, Up is Positive. So we invert Y.
        let y = -(landmarks[8].y - 0.55) * yMultiplier; 

        // Clamp to screen edges
        x = Math.max(-viewport.width/2 + 0.5, Math.min(viewport.width/2 - 0.5, x));
        y = Math.max(-viewport.height/2 + 0.5, Math.min(viewport.height/2 - 0.5, y));

        // Smooth movement
        handPos.current.lerp(new THREE.Vector3(x, y, 0), 0.5); 

        const dx = landmarks[4].x - landmarks[8].x;
        const dy = landmarks[4].y - landmarks[8].y;
        isPinching.current = Math.sqrt(dx*dx + dy*dy) < 0.08;
      }
    }
  });

  return { handPos, isPinching };
};

// --- 3D Components ---
const MannequinHand = ({ position, stonesInHand, isGrabbing, canToss, isMobile }: { position: THREE.Vector3, stonesInHand: number, isGrabbing: boolean, canToss: boolean, isMobile: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const skinColor = isGrabbing ? "#86efac" : (canToss ? "#ffffff" : "#eecfad");

  useFrame(() => {
    if(group.current) {
      group.current.position.copy(position);
      group.current.rotation.z = -position.x * 0.1;
      const targetRot = isGrabbing ? -0.8 : 0;
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRot, 0.4);
      
      // FIX: Size Increase
      // Made hands significantly bigger (2.0) so they don't look tiny on PC or Phone
      const scale = isMobile ? 2.0 : 2.2;
      group.current.scale.set(scale, scale, scale);
    }
  });

  const Finger = ({ x, length, rotZ = 0 }: { x: number, length: number, rotZ?: number }) => (
    <group position={[x, 0.6, 0]} rotation={[0, 0, rotZ]}>
      <Sphere args={[0.13, 8, 8]} position={[0, 0, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
      <Cylinder args={[0.12, 0.13, length/2, 8]} position={[0, length/4, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
      <Sphere args={[0.11, 8, 8]} position={[0, length/2, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
      <group position={[0, length/2, 0]} rotation={[isGrabbing ? 1.5 : 0.1, 0, 0]}>
         <Cylinder args={[0.1, 0.11, length/2, 8]} position={[0, length/4, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
         <Sphere args={[0.1, 8, 8]} position={[0, length/2, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
      </group>
    </group>
  );

  return (
    <group ref={group}>
      <group scale={[1, 1, 0.6]}>
         <Sphere args={[0.6, 16, 16]} position={[0, 0, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
         <Cylinder args={[0.55, 0.5, 0.8, 16]} position={[0, -0.4, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
      </group>
      <Finger x={-0.4} length={0.7} rotZ={0.2} />
      <Finger x={-0.15} length={0.9} rotZ={0.05} />
      <Finger x={0.15} length={1.0} rotZ={-0.05} />
      <Finger x={0.4} length={0.9} rotZ={-0.2} />
      <group position={[0.5, -0.2, 0.2]} rotation={[0, -0.5, -0.8]}>
        <Cylinder args={[0.13, 0.15, 0.5, 8]} position={[0, 0.25, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
        <Sphere args={[0.13, 8, 8]} position={[0, 0.5, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
        <group position={[0, 0.5, 0]} rotation={[isGrabbing ? 1.0 : 0, 0, 0]}>
           <Cylinder args={[0.11, 0.13, 0.4, 8]} position={[0, 0.2, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
           <Sphere args={[0.11, 8, 8]} position={[0, 0.4, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
        </group>
      </group>
      {Array.from({ length: stonesInHand }).map((_, i) => (
         <Tetrahedron key={i} args={[0.15, 0]} position={[-0.2 + i * 0.15, 0.4, 0.3]}>
            <meshStandardMaterial color="#fbbf24" roughness={0.2} />
         </Tetrahedron>
      ))}
    </group>
  );
};

const BatuSandbag = ({ position, rotation }: { position: THREE.Vector3, rotation: THREE.Euler }) => (
  <group position={position} rotation={rotation}>
    <Float speed={10} rotationIntensity={2} floatIntensity={0}>
      <Tetrahedron args={[0.5, 0]}><meshStandardMaterial color="#ea580c" roughness={0.8} metalness={0.1} /></Tetrahedron>
      <Tetrahedron args={[0.6, 0]}><meshStandardMaterial color="#fbbf24" wireframe transparent opacity={0.5} /></Tetrahedron>
    </Float>
  </group>
);

const GroundStones = ({ count }: { count: number }) => (
    <group position={[0, -5.5, -1]}>
      {Array.from({ length: count }).map((_, i) => (
        <Tetrahedron key={i} args={[0.4, 0]} position={[-1.5 + i * 1, 0, 0]} rotation={[i*2, i*3, i*0.5]}>
           <meshStandardMaterial color="#52525b" roughness={0.6} />
        </Tetrahedron>
      ))}
    </group>
);

// --- Game Logic ---
const GameScene = ({ webcamRef, level, onProgress, onLevelComplete, onFail, isMobile, manualTossRef, facingMode }: any) => {
  // Pass facingMode to the hook to fix the Inverted/Mirror issue
  const { handPos, isPinching } = useMediaPipeInput(webcamRef, isMobile, facingMode);
  const config = LEVELS[level as number];
  
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [stonePos, setStonePos] = useState(new THREE.Vector3());
  const [stoneVel, setStoneVel] = useState(new THREE.Vector3());
  const [stoneRot, setStoneRot] = useState(new THREE.Euler());
  const [message, setMessage] = useState("Scan Hand...");
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stonesOnGround, setStonesOnGround] = useState(0);
  const [stonesInHand, setStonesInHand] = useState(0);
  const [actionPerformed, setActionPerformed] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [canToss, setCanToss] = useState(true);

  useEffect(() => {
    if (!hasStarted && handPos.current.y > -2.9) {
        setHasStarted(true);
        setMessage(config.stages[0].message);
    }
  }, [handPos.current.y]);

  useEffect(() => {
    const stage = config.stages[0];
    setCurrentStageIndex(0);
    setStonesOnGround(config.initialGroundStones);
    setStonesInHand(config.initialHandStones);
    setGameState(GameState.IDLE);
    setMessage(stage.message);
    setActionPerformed(false);
    setCanToss(true);
    onProgress({ stage: 0, totalStages: config.stages.length });
  }, [level, config]);

  const currentStage = config.stages[currentStageIndex];

  const triggerToss = () => {
    if ((gameState === GameState.IDLE || gameState === GameState.HOLDING || gameState === GameState.CAUGHT) && stonesInHand > 0) {
        setStonesInHand(s => s - 1);
        setGameState(GameState.TOSSING);
        setStoneVel(new THREE.Vector3(0, 10, 0)); 
        setActionPerformed(false);
        setMessage(""); 
        setCanToss(false);
    }
  };

  useEffect(() => {
    if (manualTossRef.current) manualTossRef.current.onclick = triggerToss;
  }, [gameState, stonesInHand]);

  useFrame((_, delta) => {
    if (gameState === GameState.LEVEL_COMPLETE || gameState === GameState.GAME_OVER) return;

    if (!canToss && handPos.current.y < RELOAD_THRESHOLD_Y && gameState === GameState.IDLE) setCanToss(true);
    if (canToss && handPos.current.y > TOSS_THRESHOLD_Y && stonesInHand > 0 && gameState === GameState.IDLE) triggerToss();

    if ((gameState === GameState.TOSSING || gameState === GameState.FALLING) && handPos.current.y < PICKUP_THRESHOLD_Y && !actionPerformed) {
      if (currentStage.action === 'PICK' && stonesOnGround >= currentStage.count) {
        setStonesOnGround(s => s - currentStage.count);
        setStonesInHand(s => s + currentStage.count);
        setActionPerformed(true);
      } else if (currentStage.action === 'PLACE' && stonesInHand >= currentStage.count) {
        setStonesOnGround(s => s + currentStage.count);
        setStonesInHand(s => s - currentStage.count);
        setActionPerformed(true);
      } else if (currentStage.action === 'EXCHANGE') {
        setActionPerformed(true);
      }
    }

    switch (gameState) {
      case GameState.IDLE: case GameState.HOLDING: case GameState.CAUGHT:
        const holdPos = handPos.current.clone().add(new THREE.Vector3(0, 0.6, 0.2));
        setStonePos(holdPos);
        if (gameState === GameState.CAUGHT) setTimeout(() => setGameState(GameState.IDLE), 200); 
        break;

      case GameState.TOSSING: case GameState.FALLING:
        let newVel = stoneVel.clone();
        newVel.y += config.gravity * delta;
        let newPos = stonePos.clone().add(newVel.clone().multiplyScalar(delta));

        if (newPos.x > 5) { newPos.x = 5; newVel.x *= -0.6; }
        else if (newPos.x < -5) { newPos.x = -5; newVel.x *= -0.6; }
        if (newPos.y > 5) { newPos.y = 5; newVel.y *= -0.3; }
        
        setStoneVel(newVel);
        setStonePos(newPos);
        setStoneRot(new THREE.Euler(stoneRot.x + delta * 5, stoneRot.y + delta * 3, 0));

        if (newVel.y < 0) setGameState(GameState.FALLING);

        if (gameState === GameState.FALLING && newPos.distanceTo(handPos.current) < config.catchRadius) {
           if (currentStage && !actionPerformed) {
              setMessage("MISSED ACTION!");
           } else {
              setStonesInHand(s => s + 1); 
              const nextStageIndex = currentStageIndex + 1;
              if (nextStageIndex >= config.stages.length) {
                setGameState(GameState.LEVEL_COMPLETE);
                setMessage("LEVEL COMPLETE!");
                onLevelComplete();
              } else {
                setGameState(GameState.CAUGHT);
                setCurrentStageIndex(nextStageIndex);
                setMessage(config.stages[nextStageIndex].message);
                setActionPerformed(false); 
                onProgress({ stage: nextStageIndex, totalStages: config.stages.length });
              }
           }
        }
        if (newPos.y < -6) {
          setGameState(GameState.DROPPED);
          setMessage("DROPPED!");
          onFail();
          setTimeout(() => {
            const stage = config.stages[0];
            setCurrentStageIndex(0);
            setStonesOnGround(config.initialGroundStones);
            setStonesInHand(config.initialHandStones);
            setGameState(GameState.IDLE);
            setMessage(stage.message);
            setActionPerformed(false);
            setCanToss(true);
            onProgress({ stage: 0, totalStages: config.stages.length });
          }, 1500);
        }
        break;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} color="#fbbf24" intensity={1} />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />

      <MannequinHand position={handPos.current} stonesInHand={stonesInHand-1} isGrabbing={isPinching.current} canToss={canToss} isMobile={isMobile} />
      
      {gameState !== GameState.DROPPED && <BatuSandbag position={stonePos} rotation={stoneRot} />}
      <GroundStones count={stonesOnGround} />

      <mesh position={[0, -3.5, 0]}>
        <planeGeometry args={[12, 3]} />
        <meshBasicMaterial color={actionPerformed ? "#22c55e" : "#ea580c"} transparent opacity={0.15} />
      </mesh>
      
      {/* UI scaled for Mobile */}
      <Text position={[0, -2.5, 0]} fontSize={isMobile ? 0.35 : 0.3} color="white" fillOpacity={canToss ? 0.3 : 1}>
         {canToss ? "DIP HAND HERE" : "⬇️ RELOAD"}
      </Text>
      <Text position={[0, 2.0, 0]} fontSize={isMobile ? 0.35 : 0.3} color="white" fillOpacity={canToss ? 1 : 0.3}>
         {canToss ? "⬆️ TOSS" : "WAIT..."}
      </Text>
      <Text position={[0, 3.5, 0]} fontSize={isMobile ? 0.5 : 0.5} color="white" anchorX="center" anchorY="middle">{message}</Text>
    </>
  );
};

// --- Main Game Component ---
const Game: React.FC<{ onGameOver: () => void }> = ({ onGameOver }) => {
  const webcamRef = useRef<Webcam>(null);
  const manualTossRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMemo(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), []);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState({ stage: 0, totalStages: 1 });
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMsg, setOverlayMsg] = useState("");
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');

  const currentConfig = LEVELS[level];
  const progressPercent = ((progress.stage) / progress.totalStages) * 100;

  const handleLevelComplete = () => {
    setOverlayMsg(`LEVEL ${level} PASSED!`);
    setShowOverlay(true);
    setTimeout(() => {
       if (level < 8) setLevel(l => l + 1);
       else { setOverlayMsg("CHAMPION!"); onGameOver(); }
       setShowOverlay(false);
    }, 2500);
  };

  const videoConstraints = isMobile 
    ? MOBILE_CONSTRAINTS
    : DESKTOP_CONSTRAINTS;

  return (
    <div className="h-[100dvh] w-full bg-heritage-black relative overflow-hidden">
      <Webcam
        key={facingMode} 
        ref={webcamRef} audio={false} mirrored={facingMode === 'user'}
        playsInline={true} muted={true}
        className={`absolute inset-0 w-full h-full opacity-30 pointer-events-none ${fitMode === 'cover' ? 'object-cover' : 'object-contain bg-black'}`}
        videoConstraints={videoConstraints}
      />
      
      <div className="absolute inset-0 z-10">
        {/* FIX: Moved Camera CLOSER (Z=8) so it looks big on PC/Mobile */}
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 8], fov: isMobile ? 75 : 50 }}>
          <GameScene 
             webcamRef={webcamRef} 
             level={level} 
             onProgress={setProgress} 
             onLevelComplete={handleLevelComplete} 
             onFail={() => {}} 
             isMobile={isMobile}
             manualTossRef={manualTossRef}
             facingMode={facingMode}
          />
        </Canvas>
      </div>

      <button 
        ref={manualTossRef}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-heritage-orange/90 active:bg-heritage-orange text-white w-20 h-20 rounded-full border-4 border-white/20 shadow-xl flex items-center justify-center font-bold tracking-widest animate-pulse"
      >
        TOSS
      </button>

      {/* Top Banner (Level Info) */}
      <div className={`absolute ${isMobile ? 'top-4 left-1/2 transform -translate-x-1/2 w-[90%]' : 'top-24 left-6 w-64'} z-20 pointer-events-none`}>
        <div className="bg-heritage-black/80 border border-heritage-orange/50 p-3 rounded-lg backdrop-blur-md shadow-lg text-center md:text-left flex flex-col items-center md:items-start">
          <h3 className="text-heritage-orange font-serif text-lg font-bold">{currentConfig.name}</h3>
          <p className="text-heritage-gray text-[10px] uppercase tracking-widest mb-1 h-4">{currentConfig.stages[progress.stage]?.message}</p>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-1">
             <div className="bg-heritage-orange h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Control Buttons (Bottom Corners) */}
      <div className="absolute bottom-6 left-6 z-50">
        <button onClick={() => setFitMode(prev => prev === 'cover' ? 'contain' : 'cover')} className="bg-black/60 text-white w-12 h-12 rounded-full border border-white/20 hover:bg-heritage-orange transition-colors flex items-center justify-center">
            {fitMode === 'cover' ? (
                <span className="text-[10px] font-bold">UNZOOM</span>
            ) : (
                <span className="text-[10px] font-bold">FILL</span>
            )}
        </button>
      </div>
      
      <div className="absolute bottom-6 right-6 z-50">
        <button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} className="bg-black/60 text-white w-12 h-12 rounded-full border border-white/20 hover:bg-heritage-orange transition-colors flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      {showOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-heritage-black/90 backdrop-blur-sm">
          <div className="text-center animate-bounce">
            <h1 className="text-5xl font-serif text-heritage-orange mb-4 drop-shadow-[0_0_15px_rgba(234,88,12,0.8)]">{overlayMsg}</h1>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;