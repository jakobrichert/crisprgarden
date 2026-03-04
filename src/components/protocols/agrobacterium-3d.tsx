"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float } from "@react-three/drei";
import * as THREE from "three";

/** 3D: Agrobacterium transferring T-DNA into a plant cell */

function Bacterium({
  position,
  targetPos,
  docking,
}: {
  position: [number, number, number];
  targetPos: [number, number, number];
  docking: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      if (docking) {
        ref.current.position.lerp(new THREE.Vector3(...targetPos), 0.01);
      } else {
        ref.current.position.y =
          position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.2;
      }
      ref.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Rod-shaped body */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.15, 0.5, 8, 16]} />
        <meshStandardMaterial color="#f97316" roughness={0.5} />
      </mesh>
      {/* Flagellum */}
      <mesh position={[-0.45, 0, 0]}>
        <torusGeometry args={[0.12, 0.015, 8, 16, Math.PI * 1.5]} />
        <meshStandardMaterial color="#fb923c" />
      </mesh>
    </group>
  );
}

function TDNA({ visible, progress }: { visible: boolean; progress: number }) {
  const ref = useRef<THREE.Group>(null);

  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let t = 0; t <= 1; t += 0.02) {
      const y = 1.5 - t * 3 * progress;
      const x = Math.sin(t * Math.PI * 3) * 0.2;
      pts.push(new THREE.Vector3(x, y, 0));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [progress]);

  if (!visible) return null;

  return (
    <group ref={ref}>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.03, 8, false]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Cas9 + sgRNA cassette label */}
      {progress > 0.3 && (
        <Html position={[0.5, 1.5 - progress * 1.5, 0]} center>
          <div className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow animate-pulse">
            T-DNA (Cas9 + sgRNA)
          </div>
        </Html>
      )}
    </group>
  );
}

function PlantCell() {
  return (
    <group position={[0, -1.5, 0]}>
      {/* Cell wall */}
      <mesh>
        <boxGeometry args={[3, 2, 2]} />
        <meshStandardMaterial
          color="#4ade80"
          transparent
          opacity={0.15}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Nucleus */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial
          color="#7c3aed"
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Chloroplasts */}
      {[[-0.8, 0.3, 0.5], [0.7, -0.5, -0.3], [-0.5, -0.6, 0.4]].map(
        (pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        )
      )}
    </group>
  );
}

function WoundSite({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <mesh position={[0, -0.5, 1.01]}>
      <circleGeometry args={[0.3, 16]} />
      <meshStandardMaterial
        color="#dc2626"
        emissive="#dc2626"
        emissiveIntensity={0.3}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function AcetoSyringone({ visible }: { visible: boolean }) {
  const particles = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      pts.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          -0.5 + Math.random() * 1.5,
          1.2 + Math.random() * 0.5
        )
      );
    }
    return pts;
  }, []);

  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        mesh.position.x += Math.sin(state.clock.elapsedTime + i) * 0.002;
        mesh.position.y += Math.cos(state.clock.elapsedTime * 0.7 + i) * 0.001;
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref}>
      {particles.map((pos, i) => (
        <mesh key={i} position={pos}>
          <dodecahedronGeometry args={[0.04]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ step }: { step: number }) {
  const tDnaProgress = useRef(0);

  useFrame(() => {
    if (step >= 3) {
      tDnaProgress.current = Math.min(1, tDnaProgress.current + 0.003);
    } else {
      tDnaProgress.current = 0;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[0, 2, 3]} intensity={0.3} color="#f97316" />

      <PlantCell />
      <WoundSite visible={step >= 1} />
      <AcetoSyringone visible={step >= 1} />

      {/* Bacteria */}
      {step >= 0 && (
        <>
          <Bacterium position={[1.5, 1.5, 1]} targetPos={[0.3, -0.3, 1]} docking={step >= 2} />
          <Bacterium position={[-1.2, 1.8, 0.8]} targetPos={[-0.2, -0.4, 0.9]} docking={step >= 2} />
          <Bacterium position={[0.5, 2, 1.2]} targetPos={[0, -0.2, 1]} docking={step >= 2} />
        </>
      )}

      <TDNA visible={step >= 3} progress={tDnaProgress.current} />

      {step >= 2 && (
        <Html position={[2, 0, 1]} center>
          <div className="rounded bg-orange-600 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            Agrobacterium
          </div>
        </Html>
      )}

      <OrbitControls enableZoom enablePan={false} minDistance={4} maxDistance={15} />
    </>
  );
}

const STEPS = [
  { title: "Agrobacterium Culture", desc: "Agrobacterium tumefaciens (orange rods) carrying the binary vector with Cas9 and sgRNA expression cassettes." },
  { title: "Wound & Acetosyringone", desc: "Plant tissue is wounded (red) and acetosyringone (yellow particles) is released, activating Agrobacterium virulence genes." },
  { title: "Bacteria Dock", desc: "Agrobacterium attaches to wounded plant cells. The VirA/VirG two-component system senses acetosyringone and activates T-DNA transfer machinery." },
  { title: "T-DNA Transfer", desc: "The T-DNA strand (red helix) containing Cas9 and sgRNA is transferred through the Type IV secretion system into the plant cell nucleus." },
];

export function Agrobacterium3D() {
  const [step, setStep] = useState(0);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="h-[420px]">
        <Canvas camera={{ position: [0, 0.5, 5], fov: 50 }} gl={{ antialias: true }}>
          <Scene step={step} />
        </Canvas>
      </div>
      <div className="border-t p-3">
        <div className="flex items-center gap-1.5 mb-2">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-orange-500" : "bg-muted"}`} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{STEPS[step].title}</p>
            <p className="text-xs text-muted-foreground max-w-md">{STEPS[step].desc}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded border px-2.5 py-1 text-xs disabled:opacity-30 hover:bg-muted">Back</button>
            <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1} className="rounded bg-orange-600 px-2.5 py-1 text-xs text-white disabled:opacity-30 hover:bg-orange-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
