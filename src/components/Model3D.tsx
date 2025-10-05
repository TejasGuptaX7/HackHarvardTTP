"use client";
import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Model3DProps {
  modelPath: string;
}

const Model3D: React.FC<Model3DProps> = ({ modelPath }) => {
  const meshRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, modelPath);

  // Auto-rotate the model
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2; // Slow rotation
    }
  });

  // Center and scale the model
  useEffect(() => {
    if (gltf.scene) {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Center the model
      gltf.scene.position.sub(center);
      
      // Scale the model to fit nicely in view
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      gltf.scene.scale.setScalar(scale);
    }
  }, [gltf]);

  return (
    <group ref={meshRef}>
      <primitive object={gltf.scene} />
    </group>
  );
};

export default Model3D;
