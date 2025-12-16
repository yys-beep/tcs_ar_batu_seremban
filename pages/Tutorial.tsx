/// <reference types="@react-three/fiber" />
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Tetrahedron, Stars, Float } from '@react-three/drei';

const LevelInfo = [
  { id: 1, title: "Buah Satu", desc: "Throw 5 stones on the ground. Toss one stone, pick up one from the ground, then catch the tossed one. Repeat until all 4 ground stones are collected." },
  { id: 2, title: "Buah Dua", desc: "Similar to Level 1, but pick up two stones at a time. Do this twice to collect all 4 stones." },
  { id: 3, title: "Buah Tiga", desc: "First, toss and pick up three stones at once. Then, toss and pick up the remaining one stone." },
  { id: 4, title: "Buah Empat", desc: "Toss one stone, then pick up all four remaining stones from the ground at once." },
  { id: 5, title: "Buah Lima", desc: "Toss one stone and 'Place' four stones on the ground. Then toss again and 'Pick' all four up." },
  { id: 6, title: "Tukar (Exchange)", desc: "Start with 2 stones in hand. Toss one, exchange the other held stone with one on the ground, then catch. Repeat until all ground stones are exchanged." },
  { id: 7, title: "Advanced", desc: "Toss two stones (simulated), pick up one stone from the ground, then catch the falling stones. Repeat until finished." },
  { id: 8, title: "Timbang (Challenge)", desc: "The 'provocation' round. Toss one stone and you must sweep up all four ground stones in one swift motion to catch it." },
];

const Stone = ({ position, color }: { position: [number, number, number], color: string }) => (
  <Float speed={4} rotationIntensity={1} floatIntensity={0.5}>
    <Tetrahedron args={[0.4, 0]} position={position}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </Tetrahedron>
    <Tetrahedron args={[0.42, 0]} position={position}>
      <meshStandardMaterial color="white" wireframe transparent opacity={0.2} />
    </Tetrahedron>
  </Float>
);

const Tutorial: React.FC = () => {
  const [level, setLevel] = useState(1);

  return (
    <div className="min-h-screen pt-20 bg-heritage-black flex flex-col md:flex-row">
      {/* Sidebar Controls */}
      <div className="w-full md:w-1/3 p-8 border-r border-heritage-orange/10 overflow-y-auto z-10 bg-heritage-black h-[calc(100vh-80px)]">
        <h2 className="text-4xl font-serif text-heritage-cream mb-2">Tutorial</h2>
        <p className="text-heritage-gray mb-8">Master the 8 traditional levels of Batu Seremban.</p>
        
        <div className="space-y-3">
          {LevelInfo.map((info) => (
            <button
              key={info.id}
              onClick={() => setLevel(info.id)}
              className={`w-full text-left p-5 border transition-all duration-300 group transform hover:-translate-y-1 ${
                level === info.id
                  ? 'border-heritage-orange bg-heritage-orange/10'
                  : 'border-heritage-gray/20 hover:border-heritage-orange/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className={`font-serif text-lg ${level === info.id ? 'text-heritage-orange' : 'text-white group-hover:text-heritage-cream'}`}>
                  Level {info.id}: {info.title}
                </h3>
              </div>
              <p className={`text-xs mt-2 transition-colors ${level === info.id ? 'text-heritage-cream' : 'text-heritage-gray'}`}>
                {info.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="w-full md:w-2/3 h-[50vh] md:h-auto relative bg-gradient-to-br from-zinc-900 to-black border-l border-heritage-orange/10">
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
           <h3 className="text-heritage-orange font-bold text-3xl font-serif mb-2 opacity-90">Training Simulation</h3>
           <p className="text-white/60 text-sm max-w-md leading-relaxed">{LevelInfo[level-1].desc}</p>
        </div>
        
        <div className="absolute bottom-6 right-6 z-10 text-right pointer-events-none">
           <div className="text-heritage-gray text-xs mb-1 tracking-widest uppercase">Current Object</div>
           <div className="text-heritage-cream font-bold text-lg">TRADITIONAL BATU</div>
        </div>

        <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ea580c" />
          <pointLight position={[-10, -5, -10]} intensity={0.5} color="#fff" />
          
          <group position={[0, -0.5, 0]}>
            {/* Visual representation of stones based on level */}
            <Stone position={[0, 0, 0]} color="#ea580c" />
            <Stone position={[-1.2, -1, 0.5]} color="#52525b" />
            <Stone position={[1.2, -1, 0.5]} color="#52525b" />
            <Stone position={[-0.5, -1, -0.5]} color="#52525b" />
            <Stone position={[0.5, -1, -0.5]} color="#52525b" />
            
            {/* Animated Path Ring */}
            <mesh rotation={[1.6, 0, 0]} position={[0, level * 0.3, 0]}>
              <torusGeometry args={[2.5, 0.02, 16, 100]} />
              <meshBasicMaterial color="#ea580c" transparent opacity={0.2} />
            </mesh>
          </group>
          
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          <OrbitControls autoRotate autoRotateSpeed={1} enablePan={false} minDistance={4} maxDistance={10} />
        </Canvas>
      </div>
    </div>
  );
};

export default Tutorial;