"use client";

import { useState } from "react";
import { SequenceInput } from "@/components/designer/sequence-input";
import { CasProteinSelector } from "@/components/designer/cas-protein-selector";
import { ExampleSelector } from "@/components/designer/example-selector";
import { GeneSearchBox } from "@/components/designer/gene-search-box";
import { GuideResultsTable } from "@/components/designer/guide-results-table";
import { CutSiteVisualizer } from "@/components/designer/cut-site-visualizer";
import { PrimerResultsPanel } from "@/components/designer/primer-results-panel";
import { DnaSequenceViewer } from "@/components/designer/dna-sequence-viewer";
import { OffTargetPanel } from "@/components/designer/off-target-panel";
import dynamic from "next/dynamic";

const Dna3DViewer = dynamic(
  () =>
    import("@/components/designer/dna-3d-viewer").then((m) => m.Dna3DViewer),
  { ssr: false, loading: () => <div className="h-[400px] rounded-lg border bg-muted animate-pulse" /> }
);
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface GuideResult {
  rank: number;
  guideSequence: string;
  pamSequence: string;
  strand: "+" | "-";
  position: number;
  cutPosition: number;
  gcContent: number;
  heuristicScore: number;
  combinedScore: number;
  contextSequence: string;
  scoreBreakdown: {
    gcScore: number;
    positionWeightScore: number;
    seedTmScore: number;
    selfCompScore: number;
    polyTScore: number;
  };
}

interface DesignResponse {
  guides: GuideResult[];
  summary: {
    totalPamSites: number;
    returnedGuides: number;
    casProtein: string;
    pamSequence: string;
    sequenceLength: number;
  };
}

export default function DesignerPage() {
  const [sequence, setSequence] = useState("");
  const [sequenceInfo, setSequenceInfo] = useState<{
    geneName?: string;
    species?: string;
    description?: string;
  } | null>(null);
  const [casProteinId, setCasProteinId] = useState("spcas9");
  const [results, setResults] = useState<DesignResponse | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<GuideResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLoadSequence(
    seq: string,
    info?: { geneName?: string; species?: string; description?: string }
  ) {
    setSequence(seq);
    setSequenceInfo(info || null);
    setResults(null);
    setSelectedGuide(null);
    setError(null);
  }

  async function handleDesign() {
    if (!sequence.trim()) {
      setError("Please enter a DNA sequence.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedGuide(null);

    try {
      const res = await fetch("/api/v1/sgrna/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sequence: sequence.trim(),
          casProteinId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.toString() || "Design failed.");
        return;
      }

      setResults(data);
      if (data.guides.length > 0) {
        setSelectedGuide(data.guides[0]);
      }
    } catch {
      setError("Failed to connect to the API. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">sgRNA Designer</h1>
        <p className="text-muted-foreground">
          Design CRISPR guide RNAs for any plant gene — load an example, search
          a database, or paste your own sequence
        </p>
      </div>

      {/* Step 1: Get a sequence */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Step 1
            </Badge>
            Choose Your Target Sequence
          </CardTitle>
          <CardDescription>
            Pick an example gene, search Ensembl Plants, or paste your own DNA
            sequence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="examples" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="examples">Example Genes</TabsTrigger>
              <TabsTrigger value="search">Search Database</TabsTrigger>
              <TabsTrigger value="paste">Paste Sequence</TabsTrigger>
            </TabsList>

            <TabsContent value="examples" className="mt-4">
              <ExampleSelector onSelect={handleLoadSequence} />
            </TabsContent>

            <TabsContent value="search" className="mt-4">
              <GeneSearchBox onSelect={handleLoadSequence} />
            </TabsContent>

            <TabsContent value="paste" className="mt-4">
              <SequenceInput value={sequence} onChange={setSequence} />
            </TabsContent>
          </Tabs>

          {/* Show loaded sequence info */}
          {sequenceInfo && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Loaded: {sequenceInfo.geneName}
                {sequenceInfo.species && (
                  <span className="text-green-600 dark:text-green-400">
                    {" "}
                    ({sequenceInfo.species})
                  </span>
                )}
              </p>
              {sequenceInfo.description && (
                <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                  {sequenceInfo.description}
                </p>
              )}
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                {sequence.replace(/[^ATGCatgc]/g, "").length.toLocaleString()}{" "}
                bp loaded
              </p>
            </div>
          )}

          {/* Show raw sequence when loaded from example/search */}
          {sequence && sequenceInfo && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Show raw sequence
              </summary>
              <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 font-mono text-xs">
                {sequence}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Configure and run */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Step 2
            </Badge>
            Design Guides
          </CardTitle>
          <CardDescription>
            Select your Cas protein and find guide RNA candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <CasProteinSelector
              value={casProteinId}
              onChange={setCasProteinId}
            />
            <Button
              onClick={handleDesign}
              disabled={loading || !sequence.trim()}
              size="lg"
            >
              {loading ? "Designing..." : "Find Guides"}
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && results.guides.length > 0 && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Results
                </Badge>
                {results.summary.totalPamSites} PAM Sites Found
              </CardTitle>
              <CardDescription>
                Showing top {results.summary.returnedGuides} guides for{" "}
                {results.summary.casProtein} ({results.summary.pamSequence}) on
                a {results.summary.sequenceLength.toLocaleString()} bp sequence
              </CardDescription>
            </CardHeader>
          </Card>

          <CutSiteVisualizer
            sequenceLength={results.summary.sequenceLength}
            guides={results.guides}
            selectedGuide={selectedGuide}
            onSelectGuide={setSelectedGuide}
          />

          <GuideResultsTable
            guides={results.guides}
            selectedGuide={selectedGuide}
            onSelectGuide={setSelectedGuide}
          />

          {/* 3D DNA Visualization */}
          {selectedGuide && (
            <Dna3DViewer
              guideSequence={selectedGuide.guideSequence}
              pamSequence={selectedGuide.pamSequence}
              strand={selectedGuide.strand}
              cutPosition={selectedGuide.cutPosition}
              score={selectedGuide.combinedScore}
            />
          )}

          {/* DNA Sequence Viewer with highlighted guide + PAM */}
          {selectedGuide && (
            <DnaSequenceViewer
              sequence={sequence.replace(/[^ATGCatgcRYSWKMBDHVNryswkmbdhvn]/g, "").toUpperCase()}
              selectedGuide={selectedGuide}
            />
          )}

          {/* Off-Target Analysis */}
          {selectedGuide && (
            <OffTargetPanel
              guideSequence={selectedGuide.guideSequence}
              fullSequence={sequence.replace(/[^ATGCatgcRYSWKMBDHVNryswkmbdhvn]/g, "").toUpperCase()}
              onTargetPosition={selectedGuide.position}
            />
          )}

          {/* Primer Design */}
          {selectedGuide && (
            <PrimerResultsPanel
              sequence={sequence.replace(/[^ATGCatgcRYSWKMBDHVNryswkmbdhvn]/g, "").toUpperCase()}
              cutPosition={selectedGuide.cutPosition}
              guideName={`Guide #${selectedGuide.rank}`}
            />
          )}
        </>
      )}

      {results && results.guides.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No PAM sites found for {results.summary.casProtein} (
              {results.summary.pamSequence}) in this sequence.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different Cas protein or check your sequence.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
