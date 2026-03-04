"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Text } from "@react-three/drei";
import * as THREE from "three";

/** 3D: Gel electrophoresis for PCR screening — DNA bands migrating */

function GelCassette() {
  return (
    <group>
      {/* Gel box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5, 0.3, 3]} />
        <meshStandardMaterial
          color="#e2e8f0"
          transparent
          opacity={0.4}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* Gel slab */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[4.5, 0.15, 2.5]} />
        <meshStandardMaterial
          color="#dbeafe"
          transparent
          opacity={0.6}
          roughness={0.8}
        />
      </mesh>
      {/* Buffer */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[4.8, 0.1, 2.8]} />
        <meshStandardMaterial
          color="#bfdbfe"
          transparent
          opacity={0.2}
        />
      </mesh>
      {/* Electrode + (red) */}
      <mesh position={[0, 0.25, -1.4]}>
        <boxGeometry args={[4.2, 0.05, 0.05]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
      {/* Electrode - (black) */}
      <mesh position={[0, 0.25, 1.4]}>
        <boxGeometry args={[4.2, 0.05, 0.05]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

function Well({ x, label }: { x: number; label: string }) {
  return (
    <group position={[x, 0.35, 1]}>
      <mesh>
        <boxGeometry args={[0.3, 0.08, 0.15]} />
        <meshStandardMaterial color="#1e3a5f" transparent opacity={0.8} />
      </mesh>
      <Html position={[0, 0.4, 0]} center>
        <div className="text-[8px] text-muted-foreground font-medium whitespace-nowrap">
          {label}
        </div>
      </Html>
    </group>
  );
}

interface BandDef {
  x: number;
  targetZ: number;
  size: number;
  color: string;
  label?: string;
  glow?: boolean;
}

function DnaBand({
  band,
  running,
  progress,
}: {
  band: BandDef;
  running: boolean;
  progress: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ref.current && running) {
      const currentZ = 0.9 + (band.targetZ - 0.9) * Math.min(1, progress);
      ref.current.position.z = currentZ;
    }
  });

  const width = 0.25;
  const height = 0.04;

  return (
    <mesh ref={ref} position={[band.x, 0.35, 0.9]}>
      <boxGeometry args={[width, height, 0.08]} />
      <meshStandardMaterial
        color={band.color}
        emissive={band.glow ? band.color : "#000"}
        emissiveIntensity={band.glow ? 0.8 : 0}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function Scene({ step }: { step: number }) {
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    if (step >= 2) {
      progressRef.current = Math.min(1, progressRef.current + delta * 0.15);
    }
  });

  // Lane definitions
  const bands: BandDef[] = useMemo(
    () => [
      // Ladder (lane 0)
      { x: -1.8, targetZ: -0.8, size: 1000, color: "#9ca3af" },
      { x: -1.8, targetZ: -0.5, size: 750, color: "#9ca3af" },
      { x: -1.8, targetZ: -0.2, size: 500, color: "#9ca3af" },
      { x: -1.8, targetZ: 0.1, size: 300, color: "#9ca3af" },
      { x: -1.8, targetZ: 0.3, size: 200, color: "#9ca3af" },
      { x: -1.8, targetZ: 0.5, size: 100, color: "#9ca3af" },
      // Wild-type (lane 1) — single band at ~600bp
      { x: -0.9, targetZ: -0.35, size: 600, color: "#3b82f6", glow: true },
      // Heterozygous edit (lane 2) — WT band + smaller band
      { x: 0, targetZ: -0.35, size: 600, color: "#3b82f6", glow: true },
      { x: 0, targetZ: -0.05, size: 450, color: "#22c55e", glow: true },
      // Homozygous edit (lane 3) — single smaller band
      { x: 0.9, targetZ: -0.05, size: 450, color: "#22c55e", glow: true },
      // Large deletion (lane 4) — very small band
      { x: 1.8, targetZ: 0.25, size: 250, color: "#f59e0b", glow: true },
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 3]} intensity={0.6} />
      {/* UV light effect */}
      <pointLight position={[0, 2, 0]} intensity={step >= 3 ? 0.8 : 0} color="#818cf8" />

      <GelCassette />

      {/* Wells */}
      <Well x={-1.8} label="Ladder" />
      <Well x={-0.9} label="WT" />
      <Well x={0} label="Het" />
      <Well x={0.9} label="Homo" />
      <Well x={1.8} label="Del" />

      {/* DNA bands */}
      {step >= 1 &&
        bands.map((band, i) => (
          <DnaBand
            key={i}
            band={band}
            running={step >= 2}
            progress={progressRef.current}
          />
        ))}

      {/* Arrow showing migration direction */}
      {step >= 2 && (
        <Html position={[2.8, 0.35, 0]} center>
          <div className="flex flex-col items-center text-[9px] text-muted-foreground">
            <span>-</span>
            <span>|</span>
            <span>v</span>
            <span>+</span>
          </div>
        </Html>
      )}

      {/* Size labels when done */}
      {step >= 3 && (
        <>
          <Html position={[-2.3, 0.35, -0.8]} center>
            <span className="text-[8px] text-muted-foreground">1kb</span>
          </Html>
          <Html position={[-2.3, 0.35, -0.35]} center>
            <span className="text-[8px] text-muted-foreground">600</span>
          </Html>
          <Html position={[-2.3, 0.35, -0.05]} center>
            <span className="text-[8px] text-muted-foreground">450</span>
          </Html>
          <Html position={[-2.3, 0.35, 0.25]} center>
            <span className="text-[8px] text-muted-foreground">250</span>
          </Html>
        </>
      )}

      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

const STEPS = [
  {
    title: "Prepare Gel",
    desc: "A 2% agarose gel is cast with wells for loading samples. Buffer fills the chamber with electrodes at each end.",
  },
  {
    title: "Load Samples",
    desc: "PCR products are loaded into wells: DNA ladder (size reference), wild-type control, and edited plant samples.",
  },
  {
    title: "Run Electrophoresis",
    desc: "Electric current drives negatively-charged DNA toward the positive electrode. Smaller fragments migrate faster through the gel matrix.",
  },
  {
    title: "Interpret Results",
    desc: "Under UV light: WT shows 600bp band. Heterozygous edit has WT + smaller (450bp) band. Homozygous shows only the smaller band. Large deletion gives a 250bp band.",
  },
];

export function GelElectrophoresis3D() {
  const [step, setStep] = useState(0);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="h-[420px]">
        <Canvas
          camera={{ position: [0, 4, 5], fov: 45 }}
          gl={{ antialias: true }}
        >
          <Scene step={step} />
        </Canvas>
      </div>
      <div className="border-t p-3">
        <div className="flex items-center gap-1.5 mb-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i <= step ? "bg-blue-500" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{STEPS[step].title}</p>
            <p className="text-xs text-muted-foreground max-w-md">
              {STEPS[step].desc}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="rounded border px-2.5 py-1 text-xs disabled:opacity-30 hover:bg-muted"
            >
              Back
            </button>
            <button
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              disabled={step === STEPS.length - 1}
              className="rounded bg-blue-600 px-2.5 py-1 text-xs text-white disabled:opacity-30 hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
