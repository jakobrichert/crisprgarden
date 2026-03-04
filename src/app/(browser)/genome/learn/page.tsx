"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CrisprMechanism3D = dynamic(
  () =>
    import("@/components/learn/crispr-mechanism-3d").then(
      (m) => m.CrisprMechanism3D
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] rounded-lg border bg-muted animate-pulse" />
    ),
  }
);

const Dna3DViewer = dynamic(
  () =>
    import("@/components/designer/dna-3d-viewer").then((m) => m.Dna3DViewer),
  { ssr: false, loading: () => <div className="h-[400px] rounded-lg border bg-muted animate-pulse" /> }
);

export default function LearnPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">How CRISPR Works</h1>
        <p className="text-muted-foreground">
          An interactive visual guide to CRISPR-Cas9 gene editing in plants
        </p>
      </div>

      {/* Interactive CRISPR Mechanism */}
      <div>
        <h2 className="text-lg font-semibold mb-2">
          See it in action
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          Step through each stage of CRISPR-Cas9 editing. Drag to rotate, scroll to zoom.
        </p>
        <CrisprMechanism3D />
      </div>

      {/* Step 1: The Target */}
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">Step 1</Badge>
          <CardTitle>The Target: Double-Stranded DNA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Every plant cell contains DNA — a double helix made of four
            nucleotide bases: <span className="font-mono text-green-600 font-bold">A</span>denine,
            {" "}<span className="font-mono text-red-500 font-bold">T</span>hymine,
            {" "}<span className="font-mono text-yellow-600 font-bold">G</span>uanine, and
            {" "}<span className="font-mono text-blue-600 font-bold">C</span>ytosine.
            A pairs with T, G pairs with C.
          </p>
          <p className="text-sm text-muted-foreground">
            Genes are specific stretches of DNA that encode proteins. To change
            a plant&apos;s traits, we can precisely edit its genes using CRISPR.
          </p>
        </CardContent>
      </Card>

      {/* Step 2: The Guide */}
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">Step 2</Badge>
          <CardTitle>The Guide RNA: Finding the Target</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            We design a short RNA sequence (the <strong>guide RNA</strong> or{" "}
            <strong>sgRNA</strong>) that matches our target gene. This 20-letter
            code tells the Cas9 protein exactly where to cut.
          </p>
          <p className="text-sm text-muted-foreground">
            The guide can only bind where there&apos;s a <strong>PAM</strong>{" "}
            (Protospacer Adjacent Motif) — a short sequence like{" "}
            <span className="font-mono font-bold text-red-500">NGG</span> that
            Cas9 recognizes first. No PAM = no cutting.
          </p>
          <Dna3DViewer
            guideSequence="ATCGATCGATCGATCGATCG"
            pamSequence="TGG"
            strand="+"
            cutPosition={17}
            score={0.85}
          />
        </CardContent>
      </Card>

      {/* Step 3: The Cut */}
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">Step 3</Badge>
          <CardTitle>The Cut: Double-Strand Break</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Cas9 acts like molecular scissors — it cuts both strands of DNA
            exactly 3 base pairs upstream of the PAM. This creates a{" "}
            <strong>double-strand break</strong> (DSB).
          </p>
          <p className="text-sm text-muted-foreground">
            The cell tries to repair this break, but often makes mistakes —
            inserting or deleting a few bases. If this happens inside a gene, it
            disrupts the gene&apos;s function (a <strong>knockout</strong>).
          </p>
        </CardContent>
      </Card>

      {/* Step 4: The Repair */}
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">Step 4</Badge>
          <CardTitle>The Repair: NHEJ vs HDR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">NHEJ (Non-Homologous End Joining)</h3>
              <p className="text-xs text-muted-foreground">
                The cell glues the broken ends back together, but often adds or
                removes a few bases. This creates <strong>insertions</strong> or{" "}
                <strong>deletions</strong> (indels) that disrupt the gene.
              </p>
              <Badge variant="secondary" className="mt-2">Most common in plants</Badge>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">HDR (Homology-Directed Repair)</h3>
              <p className="text-xs text-muted-foreground">
                If we provide a DNA template, the cell can use it to repair the
                break — allowing precise edits like changing a single letter of
                DNA.
              </p>
              <Badge variant="outline" className="mt-2">Rare in plants, requires template</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 5: Delivery */}
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">Step 5</Badge>
          <CardTitle>Getting CRISPR Into Plants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3 space-y-1">
              <h3 className="font-medium text-sm">Agrobacterium</h3>
              <p className="text-xs text-muted-foreground">
                A soil bacterium naturally transfers DNA into plants. We hijack
                this to deliver CRISPR constructs. Works great for dicots
                (tomato, potato, tobacco).
              </p>
              <Badge variant="outline" className="text-xs">Most popular</Badge>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <h3 className="font-medium text-sm">Biolistics</h3>
              <p className="text-xs text-muted-foreground">
                Shoot DNA-coated gold particles into plant cells with a gene gun.
                Works for monocots (wheat, maize, rice) that resist Agrobacterium.
              </p>
              <Badge variant="outline" className="text-xs">For cereals</Badge>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <h3 className="font-medium text-sm">Protoplast + RNP</h3>
              <p className="text-xs text-muted-foreground">
                Remove cell walls, deliver Cas9 protein + guide RNA directly.
                No foreign DNA ever enters the cell — the cleanest method.
              </p>
              <Badge variant="outline" className="text-xs">DNA-free</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 6: Screening */}
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">Step 6</Badge>
          <CardTitle>Screening for Edits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            After transformation, we need to check which plants were successfully
            edited. Common methods:
          </p>
          <div className="space-y-2">
            {[
              {
                method: "Visual phenotype",
                desc: "Some edits are visible — like albino leaves from PDS knockout",
                ease: "Easiest",
              },
              {
                method: "PCR screening",
                desc: "Amplify the target region, look for size changes on a gel",
                ease: "Easy",
              },
              {
                method: "T7 Endonuclease I assay",
                desc: "Detects mismatches in heteroduplexes from mixed alleles",
                ease: "Medium",
              },
              {
                method: "Sanger sequencing",
                desc: "Read the actual DNA sequence to confirm the exact edit",
                ease: "Best",
              },
            ].map((s) => (
              <div
                key={s.method}
                className="flex items-center justify-between rounded border p-2 text-sm"
              >
                <div>
                  <span className="font-medium">{s.method}</span>
                  <span className="text-muted-foreground"> — {s.desc}</span>
                </div>
                <Badge variant="outline" className="text-xs shrink-0 ml-2">
                  {s.ease}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
