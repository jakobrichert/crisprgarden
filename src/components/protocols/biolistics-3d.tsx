"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

/** 3D: Biolistic particle bombardment — gold particles fired into plant cells */

function GeneGun({ fired }: { fired: boolean }) {
  return (
    <group position={[0, 4, 0]}>
      {/* Gun barrel */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 1, 1.5, 16]} />
        <meshStandardMaterial color="#71717a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Nozzle */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 0.3, 16]} />
        <meshStandardMaterial color="#52525b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Flash when fired */}
      {fired && (
        <mesh position={[0, -1.2, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={2}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

function GoldParticles({
  fired,
  embedded,
}: {
  fired: boolean;
  embedded: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    const pts: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 2;
      const z = (Math.random() - 0.5) * 2;
      pts.push({
        start: new THREE.Vector3(x * 0.3, 2.5, z * 0.3),
        end: new THREE.Vector3(
          x * 0.8,
          -1.5 + Math.random() * 1.5,
          z * 0.8
        ),
      });
    }
    return pts;
  }, []);

  useFrame(() => {
    if (groupRef.current && fired) {
      groupRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const target = embedded ? particles[i].end : particles[i].start;
        mesh.position.lerp(target, embedded ? 0.03 : 0.1);
      });
    }
  });

  if (!fired) return null;

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.start}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function TissueExplants() {
  const positions = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let x = -1.5; x <= 1.5; x += 0.6) {
      for (let z = -1.5; z <= 1.5; z += 0.6) {
        if (Math.sqrt(x * x + z * z) <= 1.5) {
          pts.push(new THREE.Vector3(x, -2, z));
        }
      }
    }
    return pts;
  }, []);

  return (
    <group>
      {/* Petri dish */}
      <mesh position={[0, -2.3, 0]}>
        <cylinderGeometry args={[2, 2, 0.3, 32]} />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Media */}
      <mesh position={[0, -2.1, 0]}>
        <cylinderGeometry args={[1.9, 1.9, 0.15, 32]} />
        <meshStandardMaterial
          color="#d4f4dd"
          transparent
          opacity={0.5}
        />
      </mesh>
      {/* Callus / tissue pieces */}
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#86efac" : "#bbf7d0"}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

function RuptureDisc({ intact }: { intact: boolean }) {
  return (
    <mesh position={[0, 3, 0]}>
      <cylinderGeometry args={[0.6, 0.6, 0.05, 16]} />
      <meshStandardMaterial
        color={intact ? "#a1a1aa" : "#ef4444"}
        metalness={0.5}
        transparent
        opacity={intact ? 0.8 : 0.3}
      />
    </mesh>
  );
}

function HeliumPressure({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <group>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 1,
            3.5 + Math.random() * 0.5,
            (Math.random() - 0.5) * 1,
          ]}
        >
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color="#a5f3fc"
            emissive="#a5f3fc"
            emissiveIntensity={0.5}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ step }: { step: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[0, 3, 2]} intensity={0.3} color="#fbbf24" />

      <TissueExplants />
      <GeneGun fired={step >= 2} />
      <RuptureDisc intact={step < 2} />
      <HeliumPressure visible={step >= 1} />
      <GoldParticles fired={step >= 2} embedded={step >= 3} />

      {step === 0 && (
        <Html position={[2.5, -1.5, 0]} center>
          <div className="rounded bg-green-600 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            Plant tissue on media
          </div>
        </Html>
      )}
      {step >= 1 && (
        <Html position={[2, 3.5, 0]} center>
          <div className="rounded bg-cyan-600 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            He pressure (1100 psi)
          </div>
        </Html>
      )}
      {step >= 2 && (
        <Html position={[-2, 0.5, 0]} center>
          <div className="rounded bg-yellow-600 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow animate-pulse">
            Gold particles + DNA
          </div>
        </Html>
      )}
      {step >= 3 && (
        <Html position={[2.5, -0.5, 0]} center>
          <div className="rounded bg-green-700 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            Particles in cells
          </div>
        </Html>
      )}

      <OrbitControls enableZoom enablePan={false} minDistance={5} maxDistance={18} />
    </>
  );
}

const STEPS = [
  { title: "Target Tissue", desc: "Immature embryos or callus pieces are arranged on osmoticum media in a petri dish. Mannitol helps cells survive the bombardment." },
  { title: "Helium Pressure", desc: "Helium gas (cyan) builds up to 1100 psi behind the rupture disc. DNA-coated gold microparticles (0.6 µm) are loaded on the macrocarrier." },
  { title: "Fire!", desc: "The rupture disc breaks — helium accelerates gold particles (yellow dots) at high velocity toward the plant tissue below." },
  { title: "Particles Embedded", desc: "Gold particles penetrate cell walls and membranes, delivering DNA directly into the cytoplasm and nucleus. DNA dissociates and integrates." },
];

export function Biolistics3D() {
  const [step, setStep] = useState(0);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="h-[420px]">
        <Canvas camera={{ position: [3, 1, 5], fov: 50 }} gl={{ antialias: true }}>
          <Scene step={step} />
        </Canvas>
      </div>
      <div className="border-t p-3">
        <div className="flex items-center gap-1.5 mb-2">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-yellow-500" : "bg-muted"}`} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{STEPS[step].title}</p>
            <p className="text-xs text-muted-foreground max-w-md">{STEPS[step].desc}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded border px-2.5 py-1 text-xs disabled:opacity-30 hover:bg-muted">Back</button>
            <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1} className="rounded bg-yellow-600 px-2.5 py-1 text-xs text-white disabled:opacity-30 hover:bg-yellow-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
