import React, { useMemo, useState, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
// FIX: Import from 'three-stdlib' to solve the TypeScript error
import { OBJLoader } from 'three-stdlib';

interface BatuModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  texturePath?: string;
  fallbackColor?: string;
}

const BatuSerembanModel: React.FC<BatuModelProps> = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = 1, 
  texturePath, 
  fallbackColor = "#ea580c" 
}) => {
  
  // 1. Load the OBJ Model
  // Make sure white_mesh.obj is in /public/models/white_mesh.obj
  const obj = useLoader(OBJLoader, '/models/white_mesh.obj') as THREE.Group;

  // 2. Load the Texture manually (to handle errors gracefully)
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!texturePath) return;

    const loader = new THREE.TextureLoader();
    loader.load(
      texturePath,
      (loadedTex) => {
        loadedTex.wrapS = loadedTex.wrapT = THREE.RepeatWrapping;
        // Adjust these if the pattern looks too big or small on your model
        loadedTex.repeat.set(1, 1); 
        loadedTex.center.set(0.5, 0.5);
        setTexture(loadedTex);
      },
      undefined,
      (err) => console.warn(`Texture failed: ${texturePath}`, err)
    );
  }, [texturePath]);

  // 3. Clone the model so we can use it multiple times with different textures
  const clonedScene = useMemo(() => {
    // Clone the base object
    const clone = obj.clone(true);

    // Traverse the model to apply the material to the mesh
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          map: texture || null,
          color: texture ? '#ffffff' : fallbackColor,
          roughness: 1.0, // Fabric-like
          metalness: 0.0,
        });
      }
    });

    return clone;
  }, [obj, texture, fallbackColor]);

  // Convert single number scale to array if needed
  const scaleArray: [number, number, number] = Array.isArray(scale) ? scale : [scale, scale, scale];

  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      rotation={rotation} 
      scale={scaleArray} 
    />
  );
};

export default BatuSerembanModel;