/// <reference types="@react-three/fiber" />
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Cylinder, Sphere, Tetrahedron, Float, Ring } from '@react-three/drei';
import * as THREE from 'three';

// --- Constants ---
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const BOUNDS = { x: 4.5, yTop: 4.0, yBottom: -5 }; 
const PICKUP_THRESHOLD_Y = -2.0; 

// --- Types ---
enum GameState { IDLE, HOLDING, TOSSING, FALLING, CAUGHT, DROPPED, LEVEL_COMPLETE, GAME_OVER }
type StageAction = 'PICK' | 'PLACE' | 'EXCHANGE';
interface StageConfig { action: StageAction; count: number; message: string; }
interface LevelConfig { id: number; name: string; stages: StageConfig[]; gravity: number; catchRadius: number; initialHandStones: number; initialGroundStones: number; }

const LEVELS: Record<number, LevelConfig> = {
  1: { id: 1, name: "LEVEL 1: BUAH SATU", stages: [{ action: 'PICK', count: 1, message: "PICK 1 STONE" }, { action: 'PICK', count: 1, message: "PICK 1 STONE" }, { action: 'PICK', count: 1, message: "PICK 1 STONE" }, { action: 'PICK', count: 1, message: "PICK 1 STONE" }], gravity: -10, catchRadius: 2.0, initialHandStones: 1, initialGroundStones: 4 },
  2: { id: 2, name: "LEVEL 2: BUAH DUA", stages: [{ action: 'PICK', count: 2, message: "PICK 2 STONES" }, { action: 'PICK', count: 2, message: "PICK 2 STONES" }], gravity: -12, catchRadius: 1.8, initialHandStones: 1, initialGroundStones: 4 },
  3: { id: 3, name: "LEVEL 3: BUAH TIGA", stages: [{ action: 'PICK', count: 3, message: "PICK 3 STONES" }, { action: 'PICK', count: 1, message: "PICK 1 STONE" }], gravity: -14, catchRadius: 1.8, initialHandStones: 1, initialGroundStones: 4 },
  4: { id: 4, name: "LEVEL 4: BUAH EMPAT", stages: [{ action: 'PICK', count: 4, message: "PICK ALL 4 STONES" }], gravity: -15, catchRadius: 1.6, initialHandStones: 1, initialGroundStones: 4 },
  5: { id: 5, name: "LEVEL 5: BUAH LIMA", stages: [{ action: 'PLACE', count: 4, message: "PLACE 4 STONES" }, { action: 'PICK', count: 4, message: "PICK ALL 4" }], gravity: -15, catchRadius: 1.6, initialHandStones: 5, initialGroundStones: 0 },
  6: { id: 6, name: "LEVEL 6: TUKAR", stages: [{ action: 'EXCHANGE', count: 1, message: "EXCHANGE STONE" }, { action: 'EXCHANGE', count: 1, message: "EXCHANGE STONE" }, { action: 'EXCHANGE', count: 1, message: "EXCHANGE STONE" }], gravity: -16, catchRadius: 1.5, initialHandStones: 2, initialGroundStones: 3 },
  7: { id: 7, name: "LEVEL 7: ADVANCED", stages: [{ action: 'PICK', count: 1, message: "PICK 1 (FAST)" }, { action: 'PICK', count: 3, message: "PICK 3 (FAST)" }], gravity: -18, catchRadius: 1.5, initialHandStones: 1, initialGroundStones: 4 },
  8: { id: 8, name: "LEVEL 8: TIMBANG", stages: [{ action: 'PICK', count: 4, message: "CHALLENGE: PICK ALL!" }], gravity: -20, catchRadius: 1.2, initialHandStones: 1, initialGroundStones: 4 },
};

// --- Advanced Skin+Motion Tracking ---
const useSmartInput = (webcamRef: React.RefObject<Webcam>) => {
  const handPos = useRef(new THREE.Vector3(0, -2, 0));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const prevFrame = useRef<Uint8ClampedArray | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  
  // Mouse fallback
  const mousePos = useRef(new THREE.Vector2(0, 0));
  const lastMouseMoveTime = useRef(0);
  const { viewport } = useThree();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePos.current.set(x, y);
      lastMouseMoveTime.current = Date.now();
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    let targetPos = new THREE.Vector3();
    let isWebcamActive = false;

    if (webcamRef.current?.video && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      if (canvas.width !== VIDEO_WIDTH) { canvas.width = VIDEO_WIDTH; canvas.height = VIDEO_HEIGHT; }
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        const data = ctx.getImageData(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT).data;
        let sumX = 0, sumY = 0, count = 0;

        if (prevFrame.current) {
          // Sampling step 8 for better precision
          for (let i = 0; i < data.length; i += 32) { 
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];

            // 1. SKIN COLOR FILTER (Simple RGB Rule)
            // R > 95, G > 40, B > 20, Max-Min > 15, |R-G| > 15, R > G, R > B
            const isSkin = (r > 95) && (g > 40) && (b > 20) && (r > g) && (r > b) && (Math.abs(r - g) > 15);

            if (!isSkin) continue; // Skip non-skin pixels

            // 2. FACE MASK (Ignore Top 50% of screen to avoid face detection)
            const index = i / 4;
            const y = Math.floor(index / VIDEO_WIDTH);
            if (y < VIDEO_HEIGHT * 0.5) continue; 

            // 3. MOTION CHECK
            const diff = Math.abs(r - prevFrame.current[i]) + 
                         Math.abs(g - prevFrame.current[i+1]) + 
                         Math.abs(b - prevFrame.current[i+2]);
            
            if (diff > 50) { // Motion Threshold
              const x = index % VIDEO_WIDTH;
              sumX += x; sumY += y; count++;
            }
          }
        }
        prevFrame.current = new Uint8ClampedArray(data);

        if (count > 5) {
          const avgX = sumX / count;
          const avgY = sumY / count;
          
          // Map to 3D World
          const targetX = -((avgX / VIDEO_WIDTH) * 12 - 6);
          const targetY = -((avgY / VIDEO_HEIGHT) * 10 - 5);
          targetPos.set(targetX, targetY, 0);
          isWebcamActive = true;
        }
      }
    }

    // Fallback to mouse if webcam is quiet
    if (!isWebcamActive && (Date.now() - lastMouseMoveTime.current < 2000)) {
       targetPos.x = mousePos.current.x * (viewport.width / 2);
       targetPos.y = mousePos.current.y * (viewport.height / 2);
       targetPos.z = 0;
    } else if (!isWebcamActive) {
       targetPos.copy(handPos.current); 
    }

    handPos.current.lerp(targetPos, 0.15);
    const instantVel = targetPos.clone().sub(handPos.current).divideScalar(0.016);
    velocity.current.lerp(instantVel, 0.1);
  });

  return { handPos, velocity };
};

// --- NEW Mannequin Hand Component (Smoother, Organic) ---
const MannequinHand = ({ position, stonesInHand, isGrabbing }: { position: THREE.Vector3, stonesInHand: number, isGrabbing: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const skinColor = "#eecfad"; // Lighter, mannequin-like skin tone

  useFrame(() => {
    if(group.current) {
      group.current.position.lerp(position, 0.4);
      group.current.rotation.z = -position.x * 0.1; 
      // Smooth open/close animation
      const targetRot = isGrabbing ? -0.8 : 0;
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRot, 0.1);
    }
  });

  const Finger = ({ x, length, rotZ = 0 }: { x: number, length: number, rotZ?: number }) => (
    <group position={[x, 0.6, 0]} rotation={[0, 0, rotZ]}>
      {/* Knuckle */}
      <Sphere args={[0.13]} position={[0, 0, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
      {/* Proximal Phalanx */}
      <Cylinder args={[0.12, 0.13, length/2]} position={[0, length/4, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
      {/* Joint */}
      <Sphere args={[0.11]} position={[0, length/2, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
      {/* Distal Phalanx */}
      <group position={[0, length/2, 0]} rotation={[isGrabbing ? 1.5 : 0.1, 0, 0]}>
         <Cylinder args={[0.1, 0.11, length/2]} position={[0, length/4, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
         <Sphere args={[0.1]} position={[0, length/2, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
      </group>
    </group>
  );

  return (
    <group ref={group}>
      {/* Palm (Smooth Sphere/Cylinder blend) */}
      <group scale={[1, 1, 0.6]}>
         <Sphere args={[0.6]} position={[0, 0, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
         <Cylinder args={[0.55, 0.5, 0.8]} position={[0, -0.4, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
      </group>

      {/* Fingers */}
      <Finger x={-0.4} length={0.7} rotZ={0.2} />  {/* Pinky */}
      <Finger x={-0.15} length={0.9} rotZ={0.05} /> {/* Ring */}
      <Finger x={0.15} length={1.0} rotZ={-0.05} /> {/* Middle */}
      <Finger x={0.4} length={0.9} rotZ={-0.2} />   {/* Index */}

      {/* Thumb */}
      <group position={[0.5, -0.2, 0.2]} rotation={[0, -0.5, -0.8]}>
        <Cylinder args={[0.13, 0.15, 0.5]} position={[0, 0.25, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
        <Sphere args={[0.13]} position={[0, 0.5, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
        <group position={[0, 0.5, 0]} rotation={[isGrabbing ? 1.0 : 0, 0, 0]}>
           <Cylinder args={[0.11, 0.13, 0.4]} position={[0, 0.2, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
           <Sphere args={[0.11]} position={[0, 0.4, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
        </group>
      </group>

      {/* Held Stones */}
      {Array.from({ length: stonesInHand }).map((_, i) => (
         <Tetrahedron key={i} args={[0.15, 0]} position={[-0.2 + i * 0.15, 0.4, 0.3]}>
            <meshStandardMaterial color="#a1a1aa" roughness={0.5} />
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
    <group position={[0, BOUNDS.yBottom + 0.5, -1]}>
      {Array.from({ length: count }).map((_, i) => (
        <Tetrahedron key={i} args={[0.4, 0]} position={[-1.5 + i * 1, 0, 0]} rotation={[i*2, i*3, i*0.5]}>
           <meshStandardMaterial color="#52525b" roughness={0.6} />
        </Tetrahedron>
      ))}
    </group>
);

const GameScene = ({ webcamRef, level, onProgress, onLevelComplete, onFail }: any) => {
  const { handPos, velocity } = useSmartInput(webcamRef);
  const config = LEVELS[level as number];
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [stonePos, setStonePos] = useState(new THREE.Vector3());
  const [stoneVel, setStoneVel] = useState(new THREE.Vector3());
  const [stoneRot, setStoneRot] = useState(new THREE.Euler());
  const [message, setMessage] = useState("");
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stonesOnGround, setStonesOnGround] = useState(0);
  const [stonesInHand, setStonesInHand] = useState(0);
  const [actionPerformed, setActionPerformed] = useState(false);

  useEffect(() => {
    const stage = config.stages[0];
    setCurrentStageIndex(0);
    setStonesOnGround(config.initialGroundStones);
    setStonesInHand(config.initialHandStones);
    setGameState(GameState.IDLE);
    setMessage(stage.message);
    setActionPerformed(false);
    onProgress({ stage: 0, totalStages: config.stages.length });
  }, [level, config, onProgress]);

  const currentStage = config.stages[currentStageIndex];
  const triggerToss = () => {
    if (gameState === GameState.IDLE || gameState === GameState.HOLDING || gameState === GameState.CAUGHT) {
       if (stonesInHand > 0) {
          setStonesInHand(s => s - 1);
          setGameState(GameState.TOSSING);
          setStoneVel(new THREE.Vector3(0, 8, 0)); 
          setActionPerformed(false);
          setMessage(" "); 
       }
    }
  };

  useEffect(() => {
    const handleClick = () => triggerToss();
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [gameState, stonesInHand]); 

  useFrame((_, delta) => {
    if (gameState === GameState.LEVEL_COMPLETE || gameState === GameState.GAME_OVER) return;

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
        if (velocity.current.y > 3 && stonesInHand > 0) triggerToss();
        if (gameState === GameState.CAUGHT) setTimeout(() => setGameState(GameState.IDLE), 200); 
        break;

      case GameState.TOSSING: case GameState.FALLING:
        let newVel = stoneVel.clone();
        newVel.y += config.gravity * delta;
        let newPos = stonePos.clone().add(newVel.clone().multiplyScalar(delta));

        if (newPos.x > BOUNDS.x) { newPos.x = BOUNDS.x; newVel.x *= -0.6; }
        else if (newPos.x < -BOUNDS.x) { newPos.x = -BOUNDS.x; newVel.x *= -0.6; }
        if (newPos.y > BOUNDS.yTop) { newPos.y = BOUNDS.yTop; newVel.y *= -0.3; }
        
        setStoneVel(newVel);
        setStonePos(newPos);
        setStoneRot(new THREE.Euler(stoneRot.x + delta * 5, stoneRot.y + delta * 3, 0));

        if (newVel.y < 0) setGameState(GameState.FALLING);

        if (gameState === GameState.FALLING && newPos.distanceTo(handPos.current) < config.catchRadius) {
           if (currentStage && !actionPerformed) {
              setMessage("MISSED THE ACTION!");
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
                onProgress({ stage: nextStageIndex, totalStages: config.stages.length });
              }
           }
        }
        if (newPos.y < BOUNDS.yBottom) {
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
            onProgress({ stage: 0, totalStages: config.stages.length });
          }, 1500);
        }
        break;
    }
  });

  const isGrabbing = currentStage && !actionPerformed && (gameState === GameState.TOSSING || gameState === GameState.FALLING);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} color="#fbbf24" intensity={1} />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />

      <MannequinHand position={handPos.current} stonesInHand={stonesInHand-1} isGrabbing={isGrabbing} />
      
      {gameState !== GameState.DROPPED && <BatuSandbag position={stonePos} rotation={stoneRot} />}
      <GroundStones count={stonesOnGround} />

      <mesh position={[0, PICKUP_THRESHOLD_Y - 1, 0]}>
        <planeGeometry args={[12, 3]} />
        <meshBasicMaterial color={actionPerformed ? "#22c55e" : "#ea580c"} transparent opacity={0.15} />
      </mesh>
      <Text position={[0, PICKUP_THRESHOLD_Y - 0.5, 0]} fontSize={0.3} color="white" fillOpacity={0.5}>
         DIP HAND HERE
      </Text>
      <Text position={[0, 2.5, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {message}
      </Text>
    </>
  );
};

// --- Main Game Component ---
const Game: React.FC<{ onGameOver: () => void }> = ({ onGameOver }) => {
  const webcamRef = useRef<Webcam>(null);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState({ stage: 0, totalStages: 1 });
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMsg, setOverlayMsg] = useState("");
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

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

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="h-screen w-full bg-heritage-black relative overflow-hidden">
      <Webcam
        key={facingMode} // Force re-render on switch
        ref={webcamRef} audio={false} mirrored={facingMode === 'user'}
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        videoConstraints={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT, facingMode }}
      />
      
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
          <GameScene webcamRef={webcamRef} level={level} onProgress={setProgress} onLevelComplete={handleLevelComplete} onFail={() => {}} />
        </Canvas>
      </div>

      {/* HUD */}
      <div className="absolute top-24 left-6 z-20 w-80">
        <div className="bg-heritage-black/80 border border-heritage-orange/50 p-4 rounded-lg backdrop-blur-md shadow-lg">
          <h3 className="text-heritage-orange font-serif text-lg font-bold">{currentConfig.name}</h3>
          <p className="text-heritage-gray text-[12px] uppercase tracking-widest mb-2 h-4">{currentConfig.stages[progress.stage]?.message || "Level Complete!"}</p>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-3">
             <div className="bg-heritage-orange h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between text-xs text-heritage-gray mt-2">
             <span>Stage {progress.stage + 1}/{progress.totalStages}</span>
             <span>Level {level}/8</span>
          </div>
        </div>
      </div>

      {/* Camera Toggle Button */}
      <button 
        onClick={toggleCamera}
        className="absolute top-24 right-6 z-50 bg-black/60 text-white p-3 rounded-full border border-white/20 hover:bg-heritage-orange transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <div className="absolute bottom-10 w-full text-center pointer-events-none z-20">
        <p className="text-heritage-cream/90 text-sm font-bold bg-black/60 inline-block px-6 py-2 rounded-full border border-white/10">
           TAP TO TOSS • MOUSE/HAND TO MOVE
        </p>
      </div>

      {showOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-heritage-black/90 backdrop-blur-sm animate-pulse">
          <div className="text-center transform scale-110 transition-transform">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-5xl font-serif text-heritage-orange mb-4 drop-shadow-[0_0_15px_rgba(234,88,12,0.8)]">
              {overlayMsg}
            </h1>
            <p className="text-white text-lg tracking-[0.5em]">NEXT CHALLENGE AWAITS</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;