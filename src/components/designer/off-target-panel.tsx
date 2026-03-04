"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OffTarget {
  position: number;
  strand: string;
  sequence: string;
  pam: string;
  mismatches: number;
  mismatchPositions: number[];
  mitScore: number;
  cfdScore: number;
}

interface OffTargetResult {
  offTargets: OffTarget[];
  summary: {
    totalOffTargets: number;
    specificityScore: number;
    byMismatchCount: { mismatches: number; count: number }[];
  };
}

interface OffTargetPanelProps {
  guideSequence: string;
  fullSequence: string;
  onTargetPosition?: number;
}

export function OffTargetPanel({
  guideSequence,
  fullSequence,
  onTargetPosition,
}: OffTargetPanelProps) {
  const [result, setResult] = useState<OffTargetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxMismatches, setMaxMismatches] = useState(4);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/sgrna/offtargets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideSequence,
          fullSequence,
          maxMismatches,
          onTargetPosition,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analysis failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to run off-target analysis");
    } finally {
      setLoading(false);
    }
  }

  // Auto-run on mount
  useEffect(() => {
    if (guideSequence && fullSequence) {
      analyze();
    }
  }, [guideSequence]);

  function specificityBadge(score: number) {
    if (score >= 80)
      return (
        <Badge className="bg-green-100 text-green-800">
          High Specificity ({score})
        </Badge>
      );
    if (score >= 50)
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Moderate Specificity ({score})
        </Badge>
      );
    return (
      <Badge className="bg-red-100 text-red-800">
        Low Specificity ({score})
      </Badge>
    );
  }

  function renderAlignedSequence(guide: string, offTarget: OffTarget) {
    return (
      <span className="font-mono text-xs">
        {offTarget.sequence.split("").map((base, i) => {
          const isMatch = guide[i] === base;
          return (
            <span
              key={i}
              className={
                isMatch
                  ? "text-muted-foreground"
                  : "text-red-600 font-bold underline"
              }
            >
              {base}
            </span>
          );
        })}
        <span className="text-blue-600 ml-0.5">{offTarget.pam}</span>
      </span>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Off-Target Analysis</CardTitle>
            <CardDescription>
              Scanning input sequence for potential off-target sites (up to{" "}
              {maxMismatches} mismatches)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="rounded border px-2 py-1 text-xs"
              value={maxMismatches}
              onChange={(e) => setMaxMismatches(Number(e.target.value))}
            >
              <option value={2}>2 mm</option>
              <option value={3}>3 mm</option>
              <option value={4}>4 mm</option>
            </select>
            <Button size="sm" variant="outline" onClick={analyze} disabled={loading}>
              {loading ? "Scanning..." : "Re-scan"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {loading && (
          <p className="text-sm text-muted-foreground">
            Scanning for off-target sites...
          </p>
        )}

        {result && !loading && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-3 flex-wrap">
              {specificityBadge(result.summary.specificityScore)}
              <Badge variant="outline">
                {result.summary.totalOffTargets} off-target site
                {result.summary.totalOffTargets !== 1 ? "s" : ""} found
              </Badge>
              {result.summary.byMismatchCount.map((mm) => (
                <Badge key={mm.mismatches} variant="secondary" className="text-xs">
                  {mm.mismatches}mm: {mm.count}
                </Badge>
              ))}
            </div>

            {/* Guide reference */}
            <div className="rounded bg-muted p-2">
              <p className="text-xs text-muted-foreground mb-1">Guide sequence:</p>
              <p className="font-mono text-xs tracking-wider">
                {guideSequence}
                <span className="text-muted-foreground ml-1">NGG</span>
              </p>
            </div>

            {/* Off-target list */}
            {result.offTargets.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-green-600 font-medium">
                  No off-target sites found in the input sequence!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Full genome-wide off-target analysis requires a reference
                  genome. This scan only checks within the provided sequence.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 pr-3">Alignment</th>
                      <th className="pb-2 pr-3">Pos</th>
                      <th className="pb-2 pr-3">Strand</th>
                      <th className="pb-2 pr-3">MM</th>
                      <th className="pb-2 pr-3">MIT</th>
                      <th className="pb-2 pr-3">CFD</th>
                      <th className="pb-2">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.offTargets.slice(0, 20).map((ot, i) => (
                      <tr key={i} className="border-b border-dashed">
                        <td className="py-1.5 pr-3">
                          {renderAlignedSequence(guideSequence, ot)}
                        </td>
                        <td className="py-1.5 pr-3 font-mono">{ot.position}</td>
                        <td className="py-1.5 pr-3">{ot.strand}</td>
                        <td className="py-1.5 pr-3">{ot.mismatches}</td>
                        <td className="py-1.5 pr-3">
                          {(ot.mitScore * 100).toFixed(1)}
                        </td>
                        <td className="py-1.5 pr-3">
                          {(ot.cfdScore * 100).toFixed(1)}
                        </td>
                        <td className="py-1.5">
                          {ot.cfdScore > 0.5 ? (
                            <Badge className="bg-red-100 text-red-700 text-[10px]">High</Badge>
                          ) : ot.cfdScore > 0.1 ? (
                            <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">Medium</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 text-[10px]">Low</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.offTargets.length > 20 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Showing top 20 of {result.offTargets.length} off-target sites
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground border-t pt-2">
              MIT score: Hsu et al. 2013 mismatch penalty model. CFD score:
              Doench et al. 2016 cutting frequency determination. Higher scores =
              greater off-target risk. Genome-wide analysis requires a reference
              genome index.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
