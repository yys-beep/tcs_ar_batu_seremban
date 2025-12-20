/// <reference types="@react-three/fiber" />
import React, { useState, useRef, useMemo, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
// FIX: Import OBJLoader to load your custom shape
import { OBJLoader } from 'three-stdlib';

const LevelInfo = [
  { id: 1, title: "Buah Satu", desc: "Toss one, pick ONE, catch.", stonesToPick: 1 },
  { id: 2, title: "Buah Dua", desc: "Toss one, pick TWO at once, catch.", stonesToPick: 2 },
  { id: 3, title: "Buah Tiga", desc: "Pick three, then pick one.", stonesToPick: 3 },
  { id: 4, title: "Buah Empat", desc: "Toss one, pick ALL FOUR, catch.", stonesToPick: 4 },
  { id: 5, title: "Buah Lima", desc: "Place stones, then catch.", stonesToPick: 4 }, 
  { id: 6, title: "Tukar", desc: "Exchange held stone with ground stone.", stonesToPick: 1 },
  { id: 7, title: "Advanced", desc: "Fast pace multi-catch.", stonesToPick: 2 },
  { id: 8, title: "Timbang", desc: "Sweep all stones in one motion.", stonesToPick: 4 },
];

// Target Stones Colors (User Selectable)
const GROUND_STONE_COLORS = [
  "#ea580c", // Heritage Orange
  "#06b6d4", // Neon Cyan
  "#facc15", // Bright Yellow
  "#d946ef", // Neon Magenta
  "#ef4444", // Bright Red
];

const MOTHER_STONE_COLOR = "#ffffff"; 

const VIDEO_CONSTRAINTS = {
  facingMode: "environment",
  width: { ideal: 720 },
  height: { ideal: 1280 }
};

// --- NEW COMPONENT: Loads your custom 3D file ---
const BatuShape = ({ color, scale = 1, rotation = [0,0,0] }: any) => {
  // Load the OBJ file
  const obj = useLoader(OBJLoader, '/models/white_mesh.obj') as THREE.Group;
  
  // Clone it so we can have many stones with different colors
  const clone = useMemo(() => {
    const c = obj.clone();
    c.traverse((child: any) => {
      if (child.isMesh) {
        // Apply the specific color (White for Mother, Color for Ground)
        child.material = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.6,
          metalness: 0.1,
        });
      }
    });
    return c;
  }, [obj, color]);

  return <primitive object={clone} scale={[scale, scale, scale]} rotation={rotation} />;
};

const CameraRig = ({ zoomLevel }: { zoomLevel: number }) => {
    const { camera } = useThree();
    useFrame(() => {
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, zoomLevel, 0.1);
    });
    return null;
};

const RealisticHand = ({ handRef, isGrabbing }: { handRef: React.RefObject<THREE.Group>, isGrabbing: boolean }) => {
    const skinColor = isGrabbing ? "#86efac" : "#eecfad"; 

    const Finger = ({ x, length, rotZ, grabbing }: any) => (
        <group position={[x, 0.6, 0]} rotation={[0, 0, rotZ]}>
            <Sphere args={[0.13]} position={[0, 0, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
            <Cylinder args={[0.12, 0.13, length/2]} position={[0, length/4, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
            <Sphere args={[0.11]} position={[0, length/2, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
            <group position={[0, length/2, 0]} rotation={[grabbing ? 1.5 : 0.1, 0, 0]}>
                <Cylinder args={[0.1, 0.11, length/2]} position={[0, length/4, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
                <Sphere args={[0.1]} position={[0, length/2, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
            </group>
        </group>
    );

    return (
        <group ref={handRef} scale={[1.3, 1.3, 1.3]}>
            <group scale={[1, 1, 0.6]}>
                <Sphere args={[0.6]} position={[0, 0, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
                <Cylinder args={[0.55, 0.5, 0.8]} position={[0, -0.4, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
            </group>
            
            <Finger x={-0.4} length={0.7} rotZ={0.2} grabbing={isGrabbing} />
            <Finger x={-0.15} length={0.9} rotZ={0.05} grabbing={isGrabbing} />
            <Finger x={0.15} length={1.0} rotZ={-0.05} grabbing={isGrabbing} />
            <Finger x={0.4} length={0.9} rotZ={-0.2} grabbing={isGrabbing} />
            
            <group position={[0.5, -0.2, 0.2]} rotation={[0, -0.5, -0.8]}>
                <Cylinder args={[0.13, 0.15, 0.5]} position={[0, 0.25, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
                <Sphere args={[0.13]} position={[0, 0.5, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
                <group position={[0, 0.5, 0]} rotation={[isGrabbing ? 1.0 : 0, 0, 0]}>
                    <Cylinder args={[0.11, 0.13, 0.4]} position={[0, 0.2, 0]}><meshStandardMaterial color={skinColor} /></Cylinder>
                    <Sphere args={[0.11]} position={[0, 0.4, 0]}><meshStandardMaterial color={skinColor} /></Sphere>
                </group>
            </group>
        </group>
    );
};

const GroundStone = ({ position, visible, color }: { position: [number, number, number], visible: boolean, color: string }) => {
    return (
        <group position={position} scale={visible ? 1 : 0}>
            {/* FIX: Use custom BatuShape instead of Tetrahedron */}
            <BatuShape color={color} scale={0.25} rotation={[Math.random(), Math.random(), 0]} />
        </group>
    );
};

const DemoScene = ({ levelId, groundStoneColor }: { levelId: number, groundStoneColor: string }) => {
  const handGroup = useRef<THREE.Group>(null);
  const stoneRef = useRef<THREE.Group>(null);
  const [phaseText, setPhaseText] = useState("");
  const [stonesVisible, setStonesVisible] = useState(true);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const currentLevel = LevelInfo.find(l => l.id === levelId) || LevelInfo[0];
  
  const groundStonePositions = useMemo(() => {
      const pos: [number, number, number][] = [];
      const count = currentLevel.stonesToPick;
      for(let i=0; i<count; i++) {
          pos.push([(i - (count-1)/2) * 0.5, -1.5, 0.5]); 
      }
      return pos;
  }, [currentLevel]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() % 3.5; 
    
    if (handGroup.current && stoneRef.current) {
      let handY = 0;
      let handRot = -0.5;
      let stoneY = 0;
      let stoneZ = 0.2;
      
      if (t < 1.0) {
        setPhaseText("READY");
        setStonesVisible(true);
        setShowSparkles(false);
        setIsGrabbing(false);
        handY = -0.2;
        stoneY = handY + 0.8;
      } 
      else if (t < 1.4) {
        setPhaseText("TOSS!");
        setIsGrabbing(false);
        const p = (t - 1.0) / 0.4;
        handY = p * 1.5;
        stoneY = handY + 0.8;
      } 
      else if (t < 2.8) {
        const airTime = t - 1.4;
        stoneY = 1.5 + (6 * airTime) - (0.5 * 9.8 * airTime * airTime);
        stoneY += 0.8;

        if (airTime < 0.5) {
            setPhaseText("DIVE");
            setIsGrabbing(false);
            handY = 1.5 - (airTime * 8); 
            handRot = -0.5 + (airTime * 3);
        } else if (airTime < 0.9) {
            setPhaseText(`PICK ${currentLevel.stonesToPick}!`);
            handY = -1.5;
            handRot = 1.0; 
            setIsGrabbing(true); 
            setStonesVisible(false);
        } else {
            setPhaseText("CATCH...");
            setIsGrabbing(false);
            const returnTime = airTime - 0.9;
            handY = -1.5 + (returnTime * 5);
            handRot = 1.0 - (returnTime * 3);
        }
      } 
      else {
        setPhaseText("GOT IT!");
        setIsGrabbing(true);
        setShowSparkles(true);
        handY = 0;
        handRot = -0.5;
        stoneY = 0.8;
      }

      handGroup.current.position.y = THREE.MathUtils.lerp(handGroup.current.position.y, handY, 0.2);
      handGroup.current.rotation.x = THREE.MathUtils.lerp(handGroup.current.rotation.x, handRot, 0.2);
      stoneRef.current.position.y = stoneY;
      stoneRef.current.position.z = stoneZ;
    }
  });

  return (
    <group>
        <Text position={[0, 3.2, 0]} fontSize={0.4} color={MOTHER_STONE_COLOR} anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
            {phaseText}
        </Text>

        {/* MOTHER STONE: Using custom 3D model */}
        <group ref={stoneRef} position={[0, 0.8, 0.2]}>
            <BatuShape color={MOTHER_STONE_COLOR} scale={0.3} />
        </group>

        {/* GROUND STONES */}
        {groundStonePositions.map((pos, i) => (
            <GroundStone key={i} position={pos} visible={stonesVisible} color={groundStoneColor} />
        ))}

        <RealisticHand handRef={handGroup} isGrabbing={isGrabbing} />
        
        {showSparkles && (
            <Sparkles count={20} scale={2} size={4} speed={0.4} opacity={1} color={MOTHER_STONE_COLOR} position={[0, 0.8, 0]} />
        )}

        <gridHelper position={[0, -2.0, 0]} args={[5, 5, 0xffffff, 0xffffff]} />
        <mesh position={[0, -2.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
             <planeGeometry args={[10, 10]} />
             <meshBasicMaterial color="#000" transparent opacity={0.3} />
        </mesh>
    </group>
  );
};

const Tutorial: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(10);
  const [colorIndex, setColorIndex] = useState(0);
  const groundStoneColor = GROUND_STONE_COLORS[colorIndex];

  const handleZoomIn = () => setZoomLevel(prev => Math.max(5, prev - 1)); 
  const handleZoomOut = () => setZoomLevel(prev => Math.min(20, prev + 1));
  const cycleColor = () => setColorIndex((prev) => (prev + 1) % GROUND_STONE_COLORS.length);

  return (
    <div className="h-[100dvh] bg-heritage-black relative overflow-hidden">
      
      {/* AR Background */}
      <div className="absolute inset-0 z-0">
        <Webcam
            audio={false}
            playsInline
            videoConstraints={VIDEO_CONSTRAINTS}
            className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-10">
        <Canvas gl={{ alpha: true }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
          
          <React.Suspense fallback={null}>
             <DemoScene levelId={level} groundStoneColor={groundStoneColor} />
          </React.Suspense>
          
          <CameraRig zoomLevel={zoomLevel} />
          <OrbitControls enableZoom={true} enablePan={false} enableRotate={true} />
        </Canvas>
      </div>

      {/* CONTROLS (Right Side) */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-50">
        
        {/* Color Change Button */}
        <button 
            onClick={cycleColor}
            className="w-12 h-12 rounded-full border-2 border-white/50 hover:border-white transition-all flex items-center justify-center shadow-lg active:scale-95"
            style={{ backgroundColor: groundStoneColor }}
            title="Change Target Color"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black/50 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.828 2.828a2 2 0 010 2.828l-1.657 1.657m-4.242-4.242l-4.242 4.242" />
            </svg>
        </button>

        <div className="h-px bg-white/20 w-8 mx-auto my-2"></div>

        <button 
            onClick={handleZoomIn}
            className="bg-black/60 text-white w-12 h-12 rounded-full border border-white/20 hover:bg-heritage-orange hover:border-heritage-orange transition-colors flex items-center justify-center shadow-lg active:scale-95"
            title="Zoom In"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
        <button 
            onClick={handleZoomOut}
            className="bg-black/60 text-white w-12 h-12 rounded-full border border-white/20 hover:bg-heritage-orange hover:border-heritage-orange transition-colors flex items-center justify-center shadow-lg active:scale-95"
            title="Zoom Out"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
      </div>

      {/* Mobile UI - Bottom Sheet */}
      <div className="absolute bottom-0 left-0 w-full z-20 flex flex-col justify-end">
        <div className="bg-heritage-black/90 backdrop-blur-md border-t border-heritage-orange/30 p-4 rounded-t-2xl pb-8">
            <h3 className="text-heritage-orange font-serif text-lg mb-2 pl-2">Select Training Level</h3>
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x">
                {LevelInfo.map((info) => (
                    <button
                        key={info.id}
                        onClick={() => setLevel(info.id)}
                        className={`flex-shrink-0 w-48 p-3 rounded-xl border snap-start transition-all ${
                            level === info.id 
                            ? 'bg-heritage-orange text-black border-heritage-orange' 
                            : 'bg-zinc-800/50 text-white border-white/10'
                        }`}
                    >
                        <div className="font-bold text-sm mb-1">Level {info.id}</div>
                        <div className="text-xs opacity-80 whitespace-nowrap overflow-hidden text-ellipsis">{info.title}</div>
                    </button>
                ))}
            </div>
            <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-heritage-cream text-xs leading-relaxed">
                    <span className="text-heritage-orange font-bold mr-2">GOAL:</span>
                    {LevelInfo.find(l => l.id === level)?.desc}
                </p>
            </div>
        </div>
      </div>

      <div className="absolute top-20 left-0 w-full z-20 p-6 pointer-events-none">
         <h1 className="text-4xl font-serif text-heritage-cream drop-shadow-lg">Tutorial</h1>
         <p className="text-white/80 text-sm drop-shadow-md">White stone = Toss. Colored stones = Pick.</p>
      </div>

    </div>
  );
};

export default Tutorial;