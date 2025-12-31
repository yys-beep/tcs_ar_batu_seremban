import React, { useMemo, useState, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
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
  rotaion = [0, 0, 0], 
  scale = 1, 
  texturePath, 
  fallbackColor = "#ea580c" 
}) => {
  
  const [loadError, setLoadError] = useState(false);
  
  // 1. Safe Load Texture
  let texture: THREE.Texture | null = null;
  try {
    texture = texturePath ? useTexture(texturePath) : null;
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1); 
      texture.center.set(0.5, 0.5);
      texture.colorSpace = THREE.SRGBColorSpace; 
    }
  } catch (e) {
    console.warn("Texture failed to load:", texturePath);
  }

  // 2. Load Geometry with Error Catching
  let obj: THREE.Group | null = null;
  try {
    obj = useLoader(OBJLoader, '/models/white_mesh.obj') as THREE.Group;
  } catch (e) {
    if (!loadError) {
      console.error("3D Model /models/white_mesh.obj not found. Using fallback sphere.");
      setLoadError(true);
    }
  }

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture || null,
    color: texture ? '#ffffff' : fallbackColor,
    roughness: 1.0, 
    metalness: 0.0,
  }), [texture, fallbackColor]);

  // 3. Clone and Apply Material
  const content = useMemo(() => {
    if (loadError || !obj) {
      // Fallback geometric shape if file is missing
      return (
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    }

    const clone = obj.clone(true);
    
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        // Auto-generate UV coordinates (Spherical Mapping)
        // This ensures the Batik image wraps around the stone shape properly.
        if (mesh.geometry) {
             mesh.geometry.computeBoundingBox();
             const box = mesh.geometry.boundingBox!;
             const center = new THREE.Vector3();
             box.getCenter(center);
             const pos = mesh.geometry.attributes.position;
             const uvArray = new Float32Array(pos.count * 2);
             for (let i = 0; i < pos.count; i++) {
                 const x = pos.getX(i) - center.x;
                 const y = pos.getY(i) - center.y;
                 const z = pos.getZ(i) - center.z;
                 const radius = Math.sqrt(x*x + y*y + z*z);
                 const u = 0.5 + (Math.atan2(z, x) / (2 * Math.PI));
                 const v = 0.5 - (Math.asin(y / radius) / Math.PI);
                 uvArray[i * 2] = u;
                 uvArray[i * 2 + 1] = v;
             }
             mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
             mesh.geometry.attributes.uv.needsUpdate = true;
        }

        mesh.material = material;
      }
    });
    return <primitive object={clone} />;
    
  }, [obj, material, loadError]);

  const s = Array.isArray(scale) ? scale : [scale, scale, scale] as [number, number, number];

    return (
    <group position={position} rotation={rotation} scale={s}>
      {content}
    </group>
  );
};

export default BatuSerembanModel;
