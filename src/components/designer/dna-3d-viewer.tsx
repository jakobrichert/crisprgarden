"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Dna3DViewerProps {
  guideSequence: string;
  pamSequence: string;
  strand: "+" | "-";
  cutPosition: number;
  score: number;
}

const BASE_COLORS: Record<string, string> = {
  A: "#22c55e", // green
  T: "#ef4444", // red
  G: "#eab308", // yellow
  C: "#3b82f6", // blue
};

const COMPLEMENT: Record<string, string> = {
  A: "T",
  T: "A",
  G: "C",
  C: "G",
};

function HBond({
  from,
  to,
  color,
  opacity,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const mid = useMemo(
    () => new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5),
    [from, to]
  );
  const dir = useMemo(
    () => new THREE.Vector3().subVectors(to, from),
    [from, to]
  );
  const len = useMemo(() => dir.length() - 0.3, [dir]);
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    return q;
  }, [dir]);

  return (
    <mesh ref={ref} position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[0.02, 0.02, Math.max(0.1, len), 4]} />
      <meshStandardMaterial
        color={color}
        opacity={opacity}
        transparent={opacity < 1}
      />
    </mesh>
  );
}

function DnaHelix({
  guideSequence,
  pamSequence,
  cutPosition,
}: {
  guideSequence: string;
  pamSequence: string;
  cutPosition: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const fullSeq = guideSequence + pamSequence;
  const guideLen = guideSequence.length;

  // Slowly rotate
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const basePairs = useMemo(() => {
    const pairs: {
      pos: THREE.Vector3;
      pos2: THREE.Vector3;
      base: string;
      comp: string;
      index: number;
      isGuide: boolean;
      isPam: boolean;
      isCut: boolean;
    }[] = [];

    const rise = 0.34; // 3.4 Å per base pair (scaled)
    const radius = 1.0; // helix radius
    const twist = (2 * Math.PI) / 10; // 10 bp per turn

    for (let i = 0; i < fullSeq.length; i++) {
      const angle = i * twist;
      const y = (i - fullSeq.length / 2) * rise;

      // Sense strand position
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      // Antisense strand (offset by π)
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      const base = fullSeq[i];
      const comp = COMPLEMENT[base] || "N";

      pairs.push({
        pos: new THREE.Vector3(x1, y, z1),
        pos2: new THREE.Vector3(x2, y, z2),
        base,
        comp,
        index: i,
        isGuide: i < guideLen,
        isPam: i >= guideLen,
        isCut: i === guideLen - 3 || i === guideLen - 4, // Cut site ~3bp from PAM
      });
    }

    return pairs;
  }, [fullSeq, guideLen]);

  // Backbone curves
  const senseBackbone = useMemo(() => {
    const points = basePairs.map((bp) => bp.pos);
    return new THREE.CatmullRomCurve3(points);
  }, [basePairs]);

  const antisenseBackbone = useMemo(() => {
    const points = basePairs.map((bp) => bp.pos2);
    return new THREE.CatmullRomCurve3(points);
  }, [basePairs]);

  return (
    <group ref={groupRef}>
      {/* Sense backbone */}
      <mesh>
        <tubeGeometry args={[senseBackbone, 100, 0.08, 8, false]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Antisense backbone */}
      <mesh>
        <tubeGeometry args={[antisenseBackbone, 100, 0.08, 8, false]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Base pairs */}
      {basePairs.map((bp, i) => {
        const midpoint = new THREE.Vector3()
          .addVectors(bp.pos, bp.pos2)
          .multiplyScalar(0.5);

        // Color coding
        let senseColor = BASE_COLORS[bp.base] || "#888";
        let antiColor = BASE_COLORS[bp.comp] || "#888";

        // Highlight guide RNA region with glow
        const emissiveIntensity = bp.isGuide ? 0.3 : bp.isPam ? 0.5 : 0;
        const pamEmissive = bp.isPam ? "#ff4444" : "#000000";
        const guideEmissive = bp.isGuide ? "#44ff44" : "#000000";

        return (
          <group key={i}>
            {/* Sense strand base (sphere) */}
            <mesh position={bp.pos}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial
                color={senseColor}
                emissive={bp.isGuide ? guideEmissive : pamEmissive}
                emissiveIntensity={emissiveIntensity}
                metalness={0.2}
                roughness={0.5}
              />
            </mesh>

            {/* Antisense strand base (sphere) */}
            <mesh position={bp.pos2}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial
                color={antiColor}
                metalness={0.2}
                roughness={0.5}
              />
            </mesh>

            {/* Hydrogen bond (connecting line between bases) */}
            <HBond
              from={bp.pos}
              to={bp.pos2}
              color={bp.isCut ? "#ff0000" : "#e2e8f0"}
              opacity={bp.isCut ? 1 : 0.6}
            />

            {/* Cut site indicator */}
            {bp.isCut && (
              <mesh position={midpoint}>
                <torusGeometry args={[0.3, 0.05, 8, 16]} />
                <meshStandardMaterial
                  color="#ff0000"
                  emissive="#ff0000"
                  emissiveIntensity={0.5}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Labels */}
      <Html position={[0, (guideLen / 2) * 0.34 + 1, 0]} center>
        <div className="rounded bg-green-600 px-2 py-0.5 text-xs text-white font-medium whitespace-nowrap">
          Guide RNA ({guideLen}bp)
        </div>
      </Html>

      <Html
        position={[
          0,
          -(fullSeq.length / 2 - guideLen) * 0.34 - 0.5,
          0,
        ]}
        center
      >
        <div className="rounded bg-red-600 px-2 py-0.5 text-xs text-white font-medium whitespace-nowrap">
          PAM ({pamSequence})
        </div>
      </Html>

      <Html position={[1.5, 0, 0]} center>
        <div className="rounded bg-red-500/90 px-2 py-0.5 text-xs text-white font-bold whitespace-nowrap">
          Cut site
        </div>
      </Html>
    </group>
  );
}

export function Dna3DViewer({
  guideSequence,
  pamSequence,
  strand,
  cutPosition,
  score,
}: Dna3DViewerProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Guide + PAM on DNA
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 text-xs"
            >
              Green = Guide RNA
            </Badge>
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 text-xs"
            >
              Red = PAM
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full rounded-lg border bg-gradient-to-b from-slate-900 to-slate-800">
          <Canvas
            camera={{ position: [3, 2, 3], fov: 50 }}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <directionalLight position={[-5, -5, -5]} intensity={0.3} />
            <pointLight position={[0, 0, 3]} intensity={0.5} color="#22c55e" />

            <DnaHelix
              guideSequence={guideSequence}
              pamSequence={pamSequence}
              cutPosition={cutPosition}
            />

            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              autoRotate={false}
              minDistance={2}
              maxDistance={10}
            />
          </Canvas>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Drag to rotate, scroll to zoom. Green = guide RNA binding region, Red = PAM
          sequence, Red ring = double-strand break site.
          {strand === "+" ? " Sense strand shown." : " Antisense strand target shown."}
        </p>
      </CardContent>
    </Card>
  );
}
