/// <reference types="@react-three/fiber" />
import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Float, Stars, ContactShadows, Loader } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three-stdlib';

// --- PATHS ---
const BATIK_PATHS = [
    "/textures/batik1.jpg", 
    "/textures/batik2.jpg", 
    "/textures/batik3.jpg", 
    "/textures/batik4.jpg", 
    "/textures/batik5.jpg", 
    "/textures/batik6.jpg", 
    "/textures/batik7.jpg", 
];

// --- 3D Model Component ---
const BatuSerembanModel = ({ position, rotation, texturePath, scale = 1, fallbackColor }: any) => {
  const obj = useLoader(OBJLoader, '/models/white_mesh.obj') as THREE.Group;
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
        texturePath,
        (loadedTex) => {
            loadedTex.wrapS = loadedTex.wrapT = THREE.RepeatWrapping;
            loadedTex.repeat.set(1, 1);
            loadedTex.center.set(0.5, 0.5);
            setTexture(loadedTex);
        },
        undefined,
        (err) => { console.warn("Texture error", err); setTexture(null); }
    );
  }, [texturePath]);

  const clonedObj = useMemo(() => {
    const clone = obj.clone();
    clone.traverse((child: any) => {
      if (child.isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
           mesh.geometry.computeBoundingBox();
           const box = mesh.geometry.boundingBox!;
           const center = new THREE.Vector3();
           box.getCenter(center);
           const posAttribute = mesh.geometry.attributes.position;
           const uvAttribute = new THREE.BufferAttribute(new Float32Array(posAttribute.count * 2), 2);
           for (let i = 0; i < posAttribute.count; i++) {
             const x = posAttribute.getX(i) - center.x;
             const y = posAttribute.getY(i) - center.y;
             const z = posAttribute.getZ(i) - center.z;
             const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
             const v = 0.5 - Math.asin(y / Math.sqrt(x*x + y*y + z*z)) / Math.PI;
             uvAttribute.setXY(i, u, v);
           }
           mesh.geometry.setAttribute('uv', uvAttribute);
           mesh.geometry.attributes.uv.needsUpdate = true;
        }
        mesh.material = new THREE.MeshStandardMaterial({
          map: texture || null,       
          color: texture ? '#ffffff' : fallbackColor, 
          roughness: 1.0,             
          metalness: 0.0,
        });
      }
    });
    return clone;
  }, [obj, texture, fallbackColor]);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <primitive object={clonedObj} position={position} rotation={rotation} scale={[scale, scale, scale]} />
    </Float>
  );
};

// --- The Main 3D Composition ---
const HeroScene = () => {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.1; 
    }
  });
  const GLOBAL_SCALE = 0.5;

  return (
    <group ref={group}>
      <BatuSerembanModel position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]} texturePath={BATIK_PATHS[0]} scale={GLOBAL_SCALE * 1.4} fallbackColor="#ea580c" />
      <BatuSerembanModel position={[2.2, 1.2, 0]} rotation={[1, 1, 0]} texturePath={BATIK_PATHS[1]} scale={GLOBAL_SCALE} fallbackColor="#06b6d4" />
      <BatuSerembanModel position={[-2.2, -1.2, 0]} rotation={[0, 1, 1]} texturePath={BATIK_PATHS[2]} scale={GLOBAL_SCALE} fallbackColor="#d946ef" />
      <BatuSerembanModel position={[0, 2.2, 1.2]} rotation={[1, 0, 1]} texturePath={BATIK_PATHS[3]} scale={GLOBAL_SCALE} fallbackColor="#facc15" />
      <BatuSerembanModel position={[0, -2.2, -1.2]} rotation={[1, 1, 1]} texturePath={BATIK_PATHS[4]} scale={GLOBAL_SCALE} fallbackColor="#84cc16" />
      <BatuSerembanModel position={[1.5, -0.5, 1.8]} rotation={[0, 0, 1]} texturePath={BATIK_PATHS[5]} scale={GLOBAL_SCALE * 0.8} fallbackColor="#3b82f6" />
      <BatuSerembanModel position={[-1.5, 0.5, -1.8]} rotation={[1, 0, 0]} texturePath={BATIK_PATHS[6]} scale={GLOBAL_SCALE * 0.8} fallbackColor="#ef4444" />
    </group>
  );
};

interface HomeProps {
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ onStart }) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = "Batu Seremban is a traditional Malaysian game passed down through generations. From ancient seeds and pebbles to the hand-sewn fabric bags we use today, it represents patience and craftsmanship. The goal is to toss and catch stones with agility, progressing from simple levels to the complex Timbang.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; 
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <div className="min-h-screen bg-heritage-black text-white relative flex flex-col">
      
      {/* Spacer for Fixed Navbar */}
      <div className="h-24"></div>

      {/* Main Content Area */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 md:px-24 gap-12 md:gap-0 pb-32">
        
        {/* Text Content */}
        <div className="relative z-10 w-full md:w-1/2 text-center md:text-left mt-10 md:mt-0 order-1 md:order-1">
          <div className="inline-block border border-heritage-orange px-4 py-1 rounded-full text-heritage-orange text-xs font-bold tracking-widest mb-6 uppercase animate-pulse">
            Badan Warisan Malaysia Project
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-heritage-cream mb-6 leading-tight drop-shadow-lg">
            The Art of <br/><span className="text-heritage-orange">Batu Seremban</span>
          </h1>
          <p className="text-lg text-heritage-gray mb-8 font-light max-w-lg mx-auto md:mx-0 drop-shadow-md">
            Discover Malaysia's intangible cultural heritage. Interact with the artifact, listen to the story, and master the technique in Augmented Reality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button 
              onClick={onStart}
              className="bg-heritage-orange hover:bg-orange-700 text-white px-8 py-4 transition-all duration-300 font-bold tracking-wider uppercase shadow-lg shadow-orange-900/50 flex items-center justify-center gap-2 cursor-pointer z-50 relative"
            >
              <span>Start AR Experience</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            
            <button 
              onClick={() => setShowHistoryModal(true)}
              className="bg-zinc-800/50 hover:bg-zinc-700 border border-white/10 text-white px-8 py-4 transition-all duration-300 font-bold tracking-wider uppercase backdrop-blur-sm cursor-pointer z-50 relative"
            >
              Read History
            </button>
          </div>
        </div>

        {/* --- 3D INTERACTIVE SCENE --- */}
        <div className="w-full md:w-1/2 h-[500px] md:h-[80vh] relative z-0 mt-8 md:mt-0 order-2 md:order-2">
            <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={1.5} /> 
                <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} />
                <pointLight position={[-10, -5, -5]} color="#ffffff" intensity={1} /> 
                
                <Suspense fallback={null}>
                   <HeroScene />
                </Suspense>
                
                <ContactShadows resolution={512} scale={20} blur={2} opacity={0.4} far={10} color="#000000" />
                <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
                
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            <Loader />
        </div>
      </section>

      {/* --- AUDIO NARRATION BAR --- */}
      <div className="fixed bottom-0 left-0 w-full bg-heritage-dark/90 backdrop-blur-md border-t border-heritage-orange/20 p-4 z-40 flex items-center justify-between md:justify-center gap-4">
         <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-heritage-gray'}`}></div>
            <span className="text-sm font-serif text-heritage-cream hidden md:inline">Audio Guide: Origins of the Game</span>
            <span className="text-sm font-serif text-heritage-cream md:hidden">Audio Guide</span>
         </div>
         <button 
            onClick={handleSpeak}
            className="flex items-center gap-2 bg-heritage-orange/20 text-heritage-orange border border-heritage-orange/50 px-4 py-2 rounded-full hover:bg-heritage-orange hover:text-white transition-all text-xs font-bold uppercase tracking-wide cursor-pointer"
         >
            {isSpeaking ? <>Stop</> : <>Listen</>}
         </button>
      </div>

      {/* --- HISTORY POP-UP MODAL --- */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-heritage-dark border border-heritage-orange/30 p-8 max-w-2xl w-full rounded-2xl relative shadow-2xl max-h-[80vh] overflow-y-auto">
                <button 
                    onClick={() => setShowHistoryModal(false)}
                    className="absolute top-4 right-4 text-heritage-gray hover:text-white transition-colors cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-3xl font-serif text-heritage-orange mb-6">Origins & Culture</h2>
                
                <div className="space-y-6 text-heritage-cream leading-relaxed">
                    
                    <div>
                        <p>
                            <strong className="text-heritage-gold">Batu Seremban</strong> is a traditional Malaysian game passed down through generations. It has long been a popular pastime among children, especially in rural communities, and is considered part of Malaysia’s cultural heritage.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Evolution of the "Batu" (stones)</h3>
                        <ul className="list-disc pl-5 space-y-1 text-heritage-gray">
                            <li><strong>Ancient Times:</strong> Small stones, beads, fruit seeds, or nutshells.</li>
                            <li><strong>Historical:</strong> Hard wooden pieces were sometimes used.</li>
                            <li><strong>Modern Era:</strong> Today, players use marbles or small fabric bags filled with sand or beans, as seen in this AR experience.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">The Sewing Tradition</h3>
                        <div className="bg-heritage-orange/10 p-4 rounded-r-lg border-l-4 border-heritage-orange">
                            <p>
                                Traditionally, mothers taught their daughters to sew the batu bags themselves, turning the game into a lesson in needlework, patience, and craftsmanship before play even begins.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 border-t border-white/10 pt-4">
                        <h3 className="text-lg font-bold text-heritage-gold mb-2">Objective of the Game</h3>
                        <p className="text-sm text-heritage-gray leading-relaxed">
                            Players throw one stone into the air and use the same hand to pick up the others from the ground, catching the thrown stone before it falls. The game progresses from simple pick-ups (<strong>Buah Satu</strong>) to more advanced techniques (<strong>Timbang, Level 8</strong>), testing agility, timing, and coordination.
                        </p>
                    </div>

                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={() => setShowHistoryModal(false)} className="px-6 py-2 bg-heritage-orange text-white font-bold rounded hover:bg-orange-700 transition-colors cursor-pointer">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;