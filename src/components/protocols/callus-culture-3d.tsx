"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float } from "@react-three/drei";
import * as THREE from "three";

/** 3D: Callus induction and plant regeneration */

function PetriDish({ yPos }: { yPos: number }) {
  return (
    <group position={[0, yPos, 0]}>
      <mesh>
        <cylinderGeometry args={[2.2, 2.2, 0.15, 32]} />
        <meshStandardMaterial color="#e5e7eb" transparent opacity={0.25} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[2, 2, 0.1, 32]} />
        <meshStandardMaterial color="#d4f4dd" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function LeafExplants({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <group position={[0, 0.3, 0]}>
      {[
        [-0.8, 0, 0.5],
        [0.5, 0, -0.3],
        [-0.2, 0, -0.7],
        [0.8, 0, 0.6],
        [-0.5, 0, 0.1],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, i * 1.2, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.3]} />
          <meshStandardMaterial color="#22c55e" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Callus({ visible, size }: { visible: boolean; size: number }) {
  const ref = useRef<THREE.Group>(null);

  const blobs = useMemo(() => {
    const pts: { pos: THREE.Vector3; scale: number; color: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
      const r = 0.3 + Math.random() * 0.4;
      pts.push({
        pos: new THREE.Vector3(
          Math.cos(angle) * r,
          0.2 + Math.random() * 0.3,
          Math.sin(angle) * r
        ),
        scale: 0.15 + Math.random() * 0.15,
        color: Math.random() > 0.3 ? "#fde68a" : "#d9f99d",
      });
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (ref.current && visible) {
      ref.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const targetScale = blobs[i].scale * size;
        mesh.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.02
        );
        mesh.position.y =
          blobs[i].pos.y +
          Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.02;
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref}>
      {blobs.map((blob, i) => (
        <mesh key={i} position={blob.pos}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color={blob.color}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

function Shoots({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current && visible) {
      ref.current.children.forEach((child, i) => {
        const group = child as THREE.Group;
        const targetScale = 1;
        group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.01);
        group.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + i * 2) * 0.05;
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref}>
      {[
        { x: 0, z: 0, h: 1.5 },
        { x: 0.3, z: 0.2, h: 1 },
        { x: -0.2, z: -0.3, h: 0.8 },
      ].map((shoot, i) => (
        <group key={i} position={[shoot.x, 0.4, shoot.z]} scale={[0.01, 0.01, 0.01]}>
          {/* Stem */}
          <mesh position={[0, shoot.h / 2, 0]}>
            <cylinderGeometry args={[0.04, 0.06, shoot.h, 8]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
          {/* Leaves */}
          {Array.from({ length: 3 }).map((_, j) => (
            <mesh
              key={j}
              position={[
                Math.cos((j / 3) * Math.PI * 2) * 0.15,
                shoot.h * 0.6 + j * 0.2,
                Math.sin((j / 3) * Math.PI * 2) * 0.15,
              ]}
              rotation={[0.3, (j / 3) * Math.PI * 2, 0.2]}
            >
              <sphereGeometry args={[0.12, 8, 4]} />
              <meshStandardMaterial color="#4ade80" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Roots({ visible }: { visible: boolean }) {
  const curves = useMemo(() => {
    const roots: THREE.CatmullRomCurve3[] = [];
    for (let i = 0; i < 5; i++) {
      const pts: THREE.Vector3[] = [];
      const angle = (i / 5) * Math.PI * 2;
      for (let t = 0; t <= 1; t += 0.05) {
        pts.push(
          new THREE.Vector3(
            Math.cos(angle) * t * 0.5 + Math.sin(t * 5 + i) * 0.05,
            -t * 1.2,
            Math.sin(angle) * t * 0.5 + Math.cos(t * 3 + i) * 0.05
          )
        );
      }
      roots.push(new THREE.CatmullRomCurve3(pts));
    }
    return roots;
  }, []);

  if (!visible) return null;

  return (
    <group position={[0, 0.15, 0]}>
      {curves.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 32, 0.015, 6, false]} />
          <meshStandardMaterial color="#a16207" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ step }: { step: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 3]} intensity={0.6} />
      <pointLight position={[0, 3, 2]} intensity={0.3} color="#4ade80" />

      <PetriDish yPos={0} />
      <LeafExplants visible={step === 0} />
      <Callus visible={step >= 1} size={step >= 2 ? 1.5 : 1} />
      <Shoots visible={step >= 2} />
      <Roots visible={step >= 3} />

      {step === 0 && (
        <Html position={[2, 1, 0]} center>
          <div className="rounded bg-green-600 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            Leaf disc explants
          </div>
        </Html>
      )}
      {step === 1 && (
        <Html position={[2, 1, 0]} center>
          <div className="rounded bg-yellow-600 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            Callus (2-4 weeks)
          </div>
        </Html>
      )}
      {step === 2 && (
        <Html position={[2, 1.5, 0]} center>
          <div className="rounded bg-green-700 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            Shoot regeneration
          </div>
        </Html>
      )}
      {step === 3 && (
        <Html position={[2, -0.5, 0]} center>
          <div className="rounded bg-amber-700 px-1.5 py-0.5 text-[9px] text-white font-medium whitespace-nowrap shadow">
            Rooting & hardening
          </div>
        </Html>
      )}

      <OrbitControls enableZoom enablePan={false} minDistance={3} maxDistance={12} />
    </>
  );
}

const STEPS = [
  { title: "Explant Preparation", desc: "Leaf discs or stem segments are placed on callus induction medium (MS + auxin + cytokinin) with selection antibiotic." },
  { title: "Callus Induction", desc: "After 2-4 weeks in the dark, undifferentiated callus tissue (yellow/green) grows from wound sites. Only transformed cells survive selection." },
  { title: "Shoot Regeneration", desc: "Callus is transferred to shoot induction medium (high cytokinin). Green shoot primordia emerge and develop into plantlets over 4-8 weeks." },
  { title: "Rooting & Hardening", desc: "Shoots are excised and placed on rooting medium (½ MS ± auxin). Once roots develop, plantlets are gradually hardened off and transferred to soil." },
];

export function CallusCulture3D() {
  const [step, setStep] = useState(0);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="h-[420px]">
        <Canvas camera={{ position: [2, 3, 4], fov: 45 }} gl={{ antialias: true }}>
          <Scene step={step} />
        </Canvas>
      </div>
      <div className="border-t p-3">
        <div className="flex items-center gap-1.5 mb-2">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-green-500" : "bg-muted"}`} />
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
