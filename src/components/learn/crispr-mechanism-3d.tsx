"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * Interactive step-through visualization of CRISPR-Cas9 editing.
 * Shows proper double helix, Cas9 protein, guide RNA, and DSB.
 */

const HELIX_RADIUS = 1;
const RISE_PER_BP = 0.34;
const TWIST = (2 * Math.PI) / 10.5;
const BP_COUNT = 40;
const GUIDE_START = 14;
const GUIDE_END = 33; // 20bp guide
const PAM_START = 34;
const PAM_END = 36; // NGG
const CUT_INDEX = 31; // 3bp upstream of PAM

const BASE_COLORS = ["#ef4444", "#3b82f6", "#eab308", "#22c55e"];

// ────────────────────────────────────────
// DNA double helix — two offset backbone tubes + colored rungs
// ────────────────────────────────────────

function DoubleHelix({
  step,
  separationProgress,
}: {
  step: number;
  separationProgress: number;
}) {
  const isCut = step >= 4;

  // Build backbone points for both strands
  const { strand1, strand2, rungs } = useMemo(() => {
    const s1: THREE.Vector3[] = [];
    const s2: THREE.Vector3[] = [];
    const r: {
      from: THREE.Vector3;
      to: THREE.Vector3;
      idx: number;
      isGuide: boolean;
      isPam: boolean;
      isCut: boolean;
    }[] = [];

    for (let i = 0; i < BP_COUNT; i++) {
      const y = (i - BP_COUNT / 2) * RISE_PER_BP;
      const angle = i * TWIST;

      const x1 = Math.cos(angle) * HELIX_RADIUS;
      const z1 = Math.sin(angle) * HELIX_RADIUS;
      const x2 = Math.cos(angle + Math.PI) * HELIX_RADIUS;
      const z2 = Math.sin(angle + Math.PI) * HELIX_RADIUS;

      s1.push(new THREE.Vector3(x1, y, z1));
      s2.push(new THREE.Vector3(x2, y, z2));

      const isGuide = i >= GUIDE_START && i <= GUIDE_END;
      const isPam = i >= PAM_START && i <= PAM_END;

      r.push({
        from: new THREE.Vector3(x1, y, z1),
        to: new THREE.Vector3(x2, y, z2),
        idx: i,
        isGuide,
        isPam,
        isCut: i === CUT_INDEX || i === CUT_INDEX + 1,
      });
    }

    return { strand1: s1, strand2: s2, rungs: r };
  }, []);

  const curve1Pre = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        isCut ? strand1.filter((_, i) => i <= CUT_INDEX) : strand1
      ),
    [strand1, isCut]
  );
  const curve1Post = useMemo(
    () =>
      isCut
        ? new THREE.CatmullRomCurve3(
            strand1.filter((_, i) => i >= CUT_INDEX + 2)
          )
        : null,
    [strand1, isCut]
  );
  const curve2Pre = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        isCut ? strand2.filter((_, i) => i <= CUT_INDEX) : strand2
      ),
    [strand2, isCut]
  );
  const curve2Post = useMemo(
    () =>
      isCut
        ? new THREE.CatmullRomCurve3(
            strand2.filter((_, i) => i >= CUT_INDEX + 2)
          )
        : null,
    [strand2, isCut]
  );

  return (
    <group>
      {/* Strand 1 backbone */}
      <mesh>
        <tubeGeometry args={[curve1Pre, 80, 0.06, 8, false]} />
        <meshStandardMaterial color="#60a5fa" roughness={0.4} metalness={0.15} />
      </mesh>
      {curve1Post && (
        <mesh>
          <tubeGeometry args={[curve1Post, 80, 0.06, 8, false]} />
          <meshStandardMaterial color="#60a5fa" roughness={0.4} metalness={0.15} />
        </mesh>
      )}

      {/* Strand 2 backbone */}
      <mesh>
        <tubeGeometry args={[curve2Pre, 80, 0.06, 8, false]} />
        <meshStandardMaterial color="#f87171" roughness={0.4} metalness={0.15} />
      </mesh>
      {curve2Post && (
        <mesh>
          <tubeGeometry args={[curve2Post, 80, 0.06, 8, false]} />
          <meshStandardMaterial color="#f87171" roughness={0.4} metalness={0.15} />
        </mesh>
      )}

      {/* Base pair rungs */}
      {rungs.map((rung) => {
        if (isCut && rung.isCut) return null;

        const mid = new THREE.Vector3()
          .addVectors(rung.from, rung.to)
          .multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(rung.to, rung.from);
        const len = dir.length() * 0.85;
        const q = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );

        // Determine separation for guide region
        let separation = 0;
        if (rung.isGuide && step >= 2) {
          separation = separationProgress * 0.3;
        }

        let color = BASE_COLORS[rung.idx % 4];
        let emissive = "#000";
        let emissiveI = 0;
        if (rung.isGuide && step >= 2) {
          emissive = "#22c55e";
          emissiveI = 0.25;
        }
        if (rung.isPam && step >= 1) {
          color = "#ef4444";
          emissive = "#ef4444";
          emissiveI = 0.35;
        }

        return (
          <group key={rung.idx}>
            {/* Base pair sphere on strand 1 */}
            <mesh position={rung.from}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={emissiveI}
              />
            </mesh>
            {/* Base pair sphere on strand 2 */}
            <mesh position={rung.to}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial
                color={BASE_COLORS[(rung.idx + 2) % 4]}
              />
            </mesh>
            {/* Connecting rung */}
            <mesh position={mid} quaternion={q}>
              <cylinderGeometry args={[0.015, 0.015, len, 4]} />
              <meshStandardMaterial
                color={rung.isGuide && step >= 2 ? "#bbf7d0" : "#cbd5e1"}
                transparent
                opacity={rung.isGuide && step >= 2 ? 0.4 : 0.5}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ────────────────────────────────────────
// Cas9 protein — bilobed clamp shape
// ────────────────────────────────────────

function Cas9({
  visible,
  active,
  targetY,
}: {
  visible: boolean;
  active: boolean;
  targetY: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const startPos = useRef(new THREE.Vector3(5, targetY + 2, 3));

  useFrame((state, delta) => {
    if (!groupRef.current || !visible) return;

    const target = new THREE.Vector3(0, targetY, 0);
    groupRef.current.position.lerp(
      active ? target : startPos.current,
      active ? 0.02 : 0.05
    );

    // Gentle float
    groupRef.current.position.y +=
      Math.sin(state.clock.elapsedTime * 1.2) * 0.01;
    groupRef.current.rotation.y += delta * 0.2;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={startPos.current}>
      {/* REC lobe — recognition */}
      <mesh position={[-0.9, 0, 0.3]}>
        <sphereGeometry args={[0.75, 20, 20]} />
        <meshStandardMaterial
          color="#a78bfa"
          roughness={0.5}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* NUC lobe — nuclease */}
      <mesh position={[0.9, 0, 0.3]}>
        <sphereGeometry args={[0.65, 20, 20]} />
        <meshStandardMaterial
          color="#7c3aed"
          roughness={0.5}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Bridge / central channel */}
      <mesh position={[0, 0, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.35, 1.2, 12, 16]} />
        <meshStandardMaterial
          color="#8b5cf6"
          roughness={0.5}
          transparent
          opacity={0.55}
        />
      </mesh>
      {/* HNH domain indicator */}
      <mesh position={[0.3, -0.2, 0.7]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial
          color="#6d28d9"
          roughness={0.4}
          transparent
          opacity={0.65}
        />
      </mesh>
      {/* RuvC domain indicator */}
      <mesh position={[-0.3, -0.2, 0.7]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial
          color="#5b21b6"
          roughness={0.4}
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  );
}

// ────────────────────────────────────────
// Guide RNA — follows the helix, then extends as a stem-loop
// ────────────────────────────────────────

function GuideRNA({
  visible,
  bound,
}: {
  visible: boolean;
  bound: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  const { helixPart, stemLoop } = useMemo(() => {
    // Guide portion that follows DNA
    const hPts: THREE.Vector3[] = [];
    for (let i = GUIDE_START; i <= GUIDE_END; i++) {
      const y = (i - BP_COUNT / 2) * RISE_PER_BP;
      const angle = i * TWIST;
      const offset = bound ? 0.25 : 0.6;
      hPts.push(
        new THREE.Vector3(
          Math.cos(angle) * (HELIX_RADIUS + offset),
          y,
          Math.sin(angle) * (HELIX_RADIUS + offset)
        )
      );
    }

    // Stem-loop (scaffold) extending away
    const sPts: THREE.Vector3[] = [];
    const lastPt = hPts[hPts.length - 1];
    for (let t = 0; t <= 1; t += 0.05) {
      sPts.push(
        new THREE.Vector3(
          lastPt.x + Math.sin(t * Math.PI * 2) * 0.4 + t * 1.5,
          lastPt.y + t * 1.2,
          lastPt.z + Math.cos(t * Math.PI * 2) * 0.4
        )
      );
    }

    return {
      helixPart: new THREE.CatmullRomCurve3(hPts),
      stemLoop: new THREE.CatmullRomCurve3(sPts),
    };
  }, [bound]);

  useFrame((state) => {
    if (ref.current && visible) {
      // Subtle breathing
      ref.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.01
      );
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref}>
      {/* Spacer region (base-pairing with DNA) */}
      <mesh>
        <tubeGeometry args={[helixPart, 60, 0.045, 8, false]} />
        <meshStandardMaterial
          color="#4ade80"
          emissive="#22c55e"
          emissiveIntensity={0.4}
          roughness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Scaffold stem-loop */}
      <mesh>
        <tubeGeometry args={[stemLoop, 40, 0.035, 8, false]} />
        <meshStandardMaterial
          color="#86efac"
          emissive="#22c55e"
          emissiveIntensity={0.2}
          roughness={0.4}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

// ────────────────────────────────────────
// PAM highlight
// ────────────────────────────────────────

function PamHighlight({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current && visible) {
      ref.current.children.forEach((child) => {
        const m = child as THREE.Mesh;
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity =
          0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref}>
      {[PAM_START, PAM_START + 1, PAM_START + 2].map((i) => {
        if (i >= BP_COUNT) return null;
        const y = (i - BP_COUNT / 2) * RISE_PER_BP;
        const angle = i * TWIST;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * HELIX_RADIUS,
              y,
              Math.sin(angle) * HELIX_RADIUS,
            ]}
          >
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.4}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ────────────────────────────────────────
// Cut site effect — pulsing rings + particles
// ────────────────────────────────────────

function CutEffect({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const cutY = (CUT_INDEX - BP_COUNT / 2) * RISE_PER_BP;

  useFrame((state) => {
    if (ref.current && visible) {
      const t = state.clock.elapsedTime;
      ref.current.rotation.y = t * 2;
      ref.current.scale.setScalar(1 + Math.sin(t * 4) * 0.15);
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[0, cutY, 0]}>
      <mesh>
        <torusGeometry args={[0.8, 0.04, 16, 32]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={1}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[1.1, 0.025, 16, 32]} />
        <meshStandardMaterial
          color="#fca5a5"
          emissive="#ef4444"
          emissiveIntensity={0.5}
          transparent
          opacity={0.35}
        />
      </mesh>
      {/* Spark particles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.95, 0, Math.sin(angle) * 0.95]}
          >
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={1.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ────────────────────────────────────────
// Repair visualization — NHEJ indel
// ────────────────────────────────────────

function RepairIndel({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const cutY = (CUT_INDEX - BP_COUNT / 2) * RISE_PER_BP;

  useFrame((state) => {
    if (ref.current && visible) {
      const progress = Math.min(
        1,
        (state.clock.elapsedTime % 10) * 0.15
      );
      ref.current.scale.setScalar(progress);
      ref.current.children.forEach((child, i) => {
        const m = child as THREE.Mesh;
        m.position.y =
          cutY + Math.sin(i * 1.5) * 0.15 * progress;
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref}>
      {/* Misaligned bases representing indel */}
      {[-0.3, -0.1, 0.1, 0.3].map((offset, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(CUT_INDEX * TWIST + offset * 3) * HELIX_RADIUS * 0.8,
            cutY + offset,
            Math.sin(CUT_INDEX * TWIST + offset * 3) * HELIX_RADIUS * 0.8,
          ]}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// ────────────────────────────────────────
// Main scene
// ────────────────────────────────────────

function Scene({ step }: { step: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const separationRef = useRef(0);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
    // Animate guide binding separation
    const target = step >= 2 ? 1 : 0;
    separationRef.current += (target - separationRef.current) * 0.02;
  });

  const cutY = (CUT_INDEX - BP_COUNT / 2) * RISE_PER_BP;
  const guideEndY = (GUIDE_END - BP_COUNT / 2) * RISE_PER_BP;
  const pamY = ((PAM_START + PAM_END) / 2 - BP_COUNT / 2) * RISE_PER_BP;

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={0.7} castShadow />
      <directionalLight position={[-4, 3, -3]} intensity={0.25} />
      <pointLight
        position={[0, 0, 3]}
        intensity={step >= 2 ? 0.6 : 0.2}
        color="#22c55e"
      />
      <pointLight
        position={[0, cutY, 0]}
        intensity={step >= 3 ? 0.8 : 0}
        color="#ef4444"
        distance={5}
      />

      <group ref={groupRef}>
        <DoubleHelix step={step} separationProgress={separationRef.current} />
        <PamHighlight visible={step >= 1} />
        <Cas9 visible={step >= 1} active={step >= 2} targetY={cutY} />
        <GuideRNA visible={step >= 2} bound={step >= 2} />
        <CutEffect visible={step >= 3 && step < 5} />
        <RepairIndel visible={step >= 4} />

        {/* Labels */}
        {step === 0 && (
          <Html position={[2, 0, 0]} center>
            <div className="rounded-md bg-slate-700 px-2 py-1 text-[11px] text-white font-medium shadow-lg">
              Target DNA
            </div>
          </Html>
        )}
        {step >= 1 && step < 3 && (
          <Html position={[2.5, pamY, 0]} center>
            <div className="rounded-md bg-red-600/90 px-2 py-1 text-[11px] text-white font-medium shadow-lg">
              PAM (NGG)
            </div>
          </Html>
        )}
        {step >= 1 && (
          <Html position={[-2.5, cutY + 0.5, 0]} center>
            <div className="rounded-md bg-purple-600/90 px-2 py-1 text-[11px] text-white font-medium shadow-lg">
              Cas9
            </div>
          </Html>
        )}
        {step >= 2 && (
          <Html position={[2, guideEndY + 1.5, 0]} center>
            <div className="rounded-md bg-green-600/90 px-2 py-1 text-[11px] text-white font-medium shadow-lg">
              sgRNA
            </div>
          </Html>
        )}
        {step >= 3 && step < 5 && (
          <Html position={[-2, cutY - 0.5, 0]} center>
            <div className="rounded-md bg-red-600 px-2 py-1 text-[11px] text-white font-bold shadow-lg animate-pulse">
              Double-strand break
            </div>
          </Html>
        )}
        {step >= 4 && (
          <Html position={[2, cutY, 0]} center>
            <div className="rounded-md bg-amber-600/90 px-2 py-1 text-[11px] text-white font-medium shadow-lg">
              NHEJ repair (indel)
            </div>
          </Html>
        )}
      </group>

      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={4}
        maxDistance={18}
        autoRotate={false}
      />
    </>
  );
}

// ────────────────────────────────────────
// Steps
// ────────────────────────────────────────

const STEPS = [
  {
    title: "Target DNA",
    desc: "A double-stranded DNA helix with two sugar-phosphate backbones (blue and red) connected by base pairs. Each rung is a pair of nucleotides (A-T or G-C).",
    color: "bg-blue-500",
  },
  {
    title: "PAM Recognition",
    desc: "Cas9 (purple) scans the DNA looking for a PAM sequence — NGG for SpCas9. The PAM (red glow) acts as a molecular address that tells Cas9 where it's allowed to cut.",
    color: "bg-purple-500",
  },
  {
    title: "Guide RNA Binds",
    desc: "The 20-nucleotide guide RNA (green) invades the double helix and base-pairs with the target strand. The scaffold stem-loop anchors the sgRNA to Cas9.",
    color: "bg-green-500",
  },
  {
    title: "Double-Strand Break",
    desc: "Cas9's two nuclease domains (HNH and RuvC) each cut one strand, creating a complete double-strand break 3bp upstream of the PAM.",
    color: "bg-red-500",
  },
  {
    title: "Repair (NHEJ)",
    desc: "The cell's NHEJ pathway repairs the break but often introduces small insertions or deletions (indels, yellow) that disrupt the gene — creating a knockout.",
    color: "bg-amber-500",
  },
];

export function CrisprMechanism3D() {
  const [step, setStep] = useState(0);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="h-[520px] bg-gradient-to-b from-slate-950 to-slate-900">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene step={step} />
        </Canvas>
      </div>

      <div className="border-t p-4 space-y-3">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? s.color : "bg-muted"
              }`}
              aria-label={s.title}
            />
          ))}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold">
              <span className="text-muted-foreground mr-1.5 text-sm">
                {step + 1}/{STEPS.length}
              </span>
              {STEPS[step].title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {STEPS[step].desc}
            </p>
          </div>
          <div className="flex gap-2 shrink-0 pt-0.5">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-30 hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              onClick={() =>
                setStep(Math.min(STEPS.length - 1, step + 1))
              }
              disabled={step === STEPS.length - 1}
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-30 hover:bg-green-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
