"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PrimerInfo {
  sequence: string;
  tm: number;
  gcPercent: number;
  position: number;
  length: number;
}

interface PrimerPairResult {
  rank: number;
  forward: PrimerInfo;
  reverse: PrimerInfo;
  productSize: number;
}

interface PrimerResultsPanelProps {
  sequence: string;
  cutPosition: number;
  guideName?: string;
}

export function PrimerResultsPanel({
  sequence,
  cutPosition,
  guideName,
}: PrimerResultsPanelProps) {
  const [primers, setPrimers] = useState<PrimerPairResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function handleDesignPrimers() {
    setLoading(true);
    setError(null);
    setPrimers([]);

    try {
      const res = await fetch("/api/v1/sgrna/primers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence, cutPosition }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.toString() || "Primer design failed");
        return;
      }

      setPrimers(data.primers || []);
      setExpanded(true);
    } catch {
      setError("Failed to design primers");
    } finally {
      setLoading(false);
    }
  }

  function copyPrimerPair(pair: PrimerPairResult) {
    const text = `Forward: 5'-${pair.forward.sequence}-3' (Tm: ${pair.forward.tm}°C)\nReverse: 5'-${pair.reverse.sequence}-3' (Tm: ${pair.reverse.tm}°C)\nProduct: ${pair.productSize} bp`;
    navigator.clipboard.writeText(text);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Verification Primers
            {guideName && (
              <span className="ml-2 font-normal text-muted-foreground">
                for {guideName}
              </span>
            )}
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDesignPrimers}
            disabled={loading}
          >
            {loading
              ? "Designing..."
              : primers.length > 0
                ? "Redesign"
                : "Design Primers"}
          </Button>
        </div>
      </CardHeader>

      {error && (
        <CardContent className="pt-0">
          <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </div>
        </CardContent>
      )}

      {primers.length > 0 && expanded && (
        <CardContent className="pt-0">
          <p className="mb-2 text-xs text-muted-foreground">
            PCR primers flanking the cut site at position {cutPosition}. Use
            these to amplify the target region and screen for edits.
          </p>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Forward Primer (5&apos;→3&apos;)</TableHead>
                  <TableHead>Reverse Primer (5&apos;→3&apos;)</TableHead>
                  <TableHead className="w-16">Fwd Tm</TableHead>
                  <TableHead className="w-16">Rev Tm</TableHead>
                  <TableHead className="w-20">Product</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {primers.slice(0, 5).map((pair) => (
                  <TableRow key={pair.rank}>
                    <TableCell className="text-muted-foreground">
                      {pair.rank}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {pair.forward.sequence}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {pair.reverse.sequence}
                    </TableCell>
                    <TableCell className="text-xs">
                      {pair.forward.tm}°C
                    </TableCell>
                    <TableCell className="text-xs">
                      {pair.reverse.tm}°C
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {pair.productSize} bp
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => copyPrimerPair(pair)}
                      >
                        Copy
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Tip: For T7 Endonuclease I assay, use the primer pair with a product
            size of 400-600 bp. For simple PCR screening of large indels, any
            pair works.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
