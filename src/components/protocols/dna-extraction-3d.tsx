"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float } from "@react-three/drei";
import * as THREE from "three";

/** 3D visualization of DNA extraction from a plant cell */

function PlantCell({ burst }: { burst: boolean }) {
  const wallRef = useRef<THREE.Mesh>(null);
  const membraneRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (wallRef.current) {
      const targetScale = burst ? 1.4 : 1;
      const targetOpacity = burst ? 0.1 : 0.3;
      wallRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.02
      );
      const mat = wallRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity += (targetOpacity - mat.opacity) * 0.02;
    }
    if (membraneRef.current) {
      const targetScale = burst ? 1.3 : 0.85;
      membraneRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.02
      );
    }
  });

  return (
    <group>
      {/* Cell wall */}
      <mesh ref={wallRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#4ade80"
          transparent
          opacity={0.3}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Cell membrane */}
      <mesh ref={membraneRef}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshStandardMaterial
          color="#86efac"
          transparent
          opacity={0.15}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Nucleus */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshStandardMaterial
          color="#7c3aed"
          transparent
          opacity={0.4}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

function DnaStrands({ released }: { released: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  const strands = useMemo(() => {
    const items: { curve: THREE.CatmullRomCurve3; color: string }[] = [];
    for (let s = 0; s < 6; s++) {
      const pts: THREE.Vector3[] = [];
      const angle0 = (s / 6) * Math.PI * 2;
      for (let t = 0; t <= 1; t += 0.02) {
        const y = -2.5 + t * 5;
        const angle = angle0 + y * 1.2;
        const r = 0.3 + t * 0.1;
        pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
      items.push({
        curve: new THREE.CatmullRomCurve3(pts),
        color: s % 2 === 0 ? "#3b82f6" : "#60a5fa",
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      if (released) {
        groupRef.current.position.y +=
          (3 - groupRef.current.position.y) * 0.01;
        groupRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.01);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {strands.map((s, i) => (
        <mesh key={i}>
          <tubeGeometry args={[s.curve, 64, 0.03, 8, false]} />
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={released ? 0.3 : 0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function CTABMolecules({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  const positions = useMemo(() => {
    const pos: THREE.Vector3[] = [];
    for (let i = 0; i < 30; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2.5 + Math.random() * 0.5;
      pos.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) - 0.5,
          r * Math.cos(phi)
        )
      );
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (groupRef.current && visible) {
      groupRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const target = positions[i].clone().multiplyScalar(0.6);
        mesh.position.lerp(target, 0.005);
        mesh.scale.setScalar(
          0.8 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.2
        );
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <octahedronGeometry args={[0.08]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

function EthanolLayer({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <Float speed={1} floatIntensity={0.2}>
      <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.3, 32]} />
        <meshStandardMaterial
          color="#a5f3fc"
          transparent
          opacity={0.3}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

function Scene({ step }: { step: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[-3, 2, 3]} intensity={0.4} color="#4ade80" />

      <PlantCell burst={step >= 2} />
      <CTABMolecules visible={step >= 1} />
      <DnaStrands released={step >= 2} />
      <EthanolLayer visible={step >= 3} />

      {step >= 1 && (
        <Html position={[2.5, 2, 0]} center>
          <div className="rounded bg-yellow-600 px-2 py-1 text-[10px] text-white font-medium whitespace-nowrap shadow">
            CTAB buffer
          </div>
        </Html>
      )}
      {step >= 2 && (
        <Html position={[-2, 2.5, 0]} center>
          <div className="rounded bg-blue-600 px-2 py-1 text-[10px] text-white font-medium whitespace-nowrap shadow">
            DNA released
          </div>
        </Html>
      )}
      {step >= 3 && (
        <Html position={[0, 4.5, 0]} center>
          <div className="rounded bg-cyan-600 px-2 py-1 text-[10px] text-white font-medium whitespace-nowrap shadow">
            Ethanol precipitation
          </div>
        </Html>
      )}

      <OrbitControls enableZoom enablePan={false} minDistance={4} maxDistance={15} />
    </>
  );
}

const STEPS = [
  { title: "Plant Cell", desc: "Fresh leaf tissue with intact cell walls (green) and nucleus (purple) containing genomic DNA." },
  { title: "Lysis", desc: "CTAB buffer (yellow particles) disrupts the cell membrane and denatures proteins, releasing cellular contents." },
  { title: "DNA Release", desc: "DNA strands (blue helices) are freed from the nucleus. Chloroform extraction removes proteins and lipids." },
  { title: "Precipitation", desc: "Ice-cold ethanol (cyan layer) precipitates DNA out of solution. The pellet is washed and resuspended in TE buffer." },
];

export function DnaExtraction3D() {
  const [step, setStep] = React.useState(0);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="h-[420px]">
        <Canvas camera={{ position: [0, 1, 6], fov: 50 }} gl={{ antialias: true }}>
          <Scene step={step} />
        </Canvas>
      </div>
      <div className="border-t p-3">
        <div className="flex items-center gap-1.5 mb-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-green-500" : "bg-muted"}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{STEPS[step].title}</p>
            <p className="text-xs text-muted-foreground max-w-md">{STEPS[step].desc}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded border px-2.5 py-1 text-xs disabled:opacity-30 hover:bg-muted">Back</button>
            <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1} className="rounded bg-green-600 px-2.5 py-1 text-xs text-white disabled:opacity-30 hover:bg-green-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
