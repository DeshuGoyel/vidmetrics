import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

function RotatingGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x += 0.0005;
    }
  });

  const points = useMemo(() => {
    const p: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      const phi = Math.acos(-1 + (2 * i) / 20);
      const theta = Math.sqrt(20 * Math.PI) * phi;
      p.push(new THREE.Vector3(
        2 * Math.cos(theta) * Math.sin(phi),
        2 * Math.sin(theta) * Math.sin(phi),
        2 * Math.cos(phi)
      ));
    }
    return p;
  }, []);

  return (
    <group ref={groupRef}>
      <Sphere args={[2, 32, 32]}>
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.15} />
      </Sphere>
      <Sphere args={[1.98, 16, 16]}>
        <meshBasicMaterial color="#2563eb" transparent opacity={0.05} />
      </Sphere>
      {points.map((pos, i) => (
        <Point key={i} position={pos} delay={i * 0.2} />
      ))}
    </group>
  );
}

function Point({ position, delay }: { position: THREE.Vector3; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 3 + delay) * 0.3;
      meshRef.current.scale.set(scale, scale, scale);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(t * 2 + delay) * 0.4;
    }
  });

  return (
    <mesh position={position} ref={meshRef}>
      <icosahedronGeometry args={[0.04, 1]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </mesh>
  );
}

export default function ThreeGlobeInner() {
  return (
    <Canvas 
      camera={{ position: [0, 0, 5.5], fov: 45 }} 
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
      <React.Suspense fallback={null}>
        <RotatingGlobe />
      </React.Suspense>
    </Canvas>
  );
}
