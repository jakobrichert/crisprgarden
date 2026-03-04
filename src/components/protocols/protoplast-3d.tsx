"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float } from "@react-three/drei";
import * as THREE from "three";

/** 3D: Protoplast transformation with RNP delivery */

function Protoplast({ wallRemoved }: { wallRemoved: boolean }) {
  const membraneRef = useRef<THREE.Mesh>(null);
  const wallRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (membraneRef.current) {
      // Protoplast "breathes" — slight oscillation
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      membraneRef.current.scale.set(s, s, s);
    }
    if (wallRef.current) {
      const mat = wallRef.current.material as THREE.MeshStandardMaterial;
      const targetOpacity = wallRemoved ? 0 : 0.25;
      mat.opacity += (targetOpacity - mat.opacity) * 0.02;
      if (wallRemoved) {
        wallRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.01);
      }
    }
  });

  return (
    <group>
      {/* Cell wall (dissolves) */}
      <mesh ref={wallRef}>
        <icosahedronGeometry args={[2, 2]} />
        <meshStandardMaterial
          color="#4ade80"
          transparent
          opacity={0.25}
          wireframe
          roughness={0.8}
        />
      </mesh>
      {/* Cell membrane (round protoplast) */}
      <mesh ref={membraneRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#bbf7d0"
          transparent
          opacity={0.2}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Nucleus */}
      <mesh position={[0.2, 0.1, 0]}>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial color="#7c3aed" transparent opacity={0.5} />
      </mesh>
      {/* Chloroplasts */}
      {[
        [-0.6, 0.5, 0.8],
        [0.7, -0.4, 0.6],
        [-0.3, -0.7, -0.5],
        [0.5, 0.6, -0.7],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      ))}
    </group>
  );
}

function EnzymeParticles({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 40; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2.2 + Math.random() * 0.3;
      pts.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ));
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (ref.current && visible) {
      ref.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        // Converge toward cell
        const target = positions[i].clone().normalize().multiplyScalar(1.6);
        mesh.position.lerp(target, 0.003);
        mesh.scale.setScalar(0.6 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.3);
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <tetrahedronGeometry args={[0.06]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.6} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function RNPComplex({ visible, entering }: { visible: boolean; entering: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      if (entering) {
        groupRef.current.position.lerp(new THREE.Vector3(0.2, 0.1, 0), 0.008);
        groupRef.current.scale.lerp(new THREE.Vector3(0.6, 0.6, 0.6), 0.008);
      }
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, 0, 2.5]}>
      {/* Cas9 protein */}
      <mesh>
        <dodecahedronGeometry args={[0.35]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.3}
          roughness={0.4}
        />
      </mesh>
      {/* sgRNA */}
      <mesh position={[0.2, 0.2, 0]}>
        <torusGeometry args={[0.2, 0.04, 8, 16, Math.PI]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

function PEGMolecules({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref}>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <Float key={i} speed={2} floatIntensity={0.3}>
            <mesh position={[Math.cos(angle) * 1.8, Math.sin(angle) * 0.5, Math.sin(angle) * 1.8]}>
              <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
              <meshStandardMaterial
                color="#06b6d4"
                transparent
                opacity={0.5}
                emissive="#06b6d4"
                emissiveIntensity={0.3}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

function Scene({ step }: { step: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[0, 0, 3]} intensity={0.4} color="#22c55e" />

      <Protoplast wallRemoved={step >= 1} />
      <EnzymeParticles visible={step >= 1} />
      <RNPComplex visible={step >= 2} entering={step >= 3} />
      <PEGMolecules visible={step >= 3} />

      {step === 0 && (
        <Html position={[2.5, 1.5, 0]} center>
          <div className="rounded bg-green-600 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            Intact plant cell
          </div>
        </Html>
      )}
      {step >= 1 && (
        <Html position={[2.5, 0, 0]} center>
          <div className="rounded bg-yellow-600 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            Cellulase + Macerozyme
          </div>
        </Html>
      )}
      {step >= 2 && (
        <Html position={[0, 0, 3.2]} center>
          <div className="rounded bg-purple-600 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            Cas9-sgRNA RNP
          </div>
        </Html>
      )}
      {step >= 3 && (
        <Html position={[-2.5, 0, 0]} center>
          <div className="rounded bg-cyan-600 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            PEG 4000
          </div>
        </Html>
      )}

      <OrbitControls enableZoom enablePan={false} minDistance={4} maxDistance={15} />
    </>
  );
}

const STEPS = [
  { title: "Plant Cell", desc: "An intact plant cell with cell wall (green wireframe), membrane, nucleus (purple), and chloroplasts." },
  { title: "Cell Wall Removal", desc: "Cellulase and Macerozyme enzymes (yellow) digest the cell wall, creating a spherical protoplast — a naked cell." },
  { title: "RNP Assembly", desc: "Cas9 protein (purple) is pre-loaded with sgRNA (green) to form a ribonucleoprotein complex. No foreign DNA involved." },
  { title: "PEG Transfection", desc: "PEG 4000 (cyan) creates transient pores in the membrane, allowing the RNP complex to enter the cell and reach the nucleus." },
];

export function Protoplast3D() {
  const [step, setStep] = useState(0);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="h-[420px]">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true }}>
          <Scene step={step} />
        </Canvas>
      </div>
      <div className="border-t p-3">
        <div className="flex items-center gap-1.5 mb-2">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-purple-500" : "bg-muted"}`} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{STEPS[step].title}</p>
            <p className="text-xs text-muted-foreground max-w-md">{STEPS[step].desc}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded border px-2.5 py-1 text-xs disabled:opacity-30 hover:bg-muted">Back</button>
            <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1} className="rounded bg-purple-600 px-2.5 py-1 text-xs text-white disabled:opacity-30 hover:bg-purple-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
