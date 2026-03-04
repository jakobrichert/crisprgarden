"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface DnaSequenceViewerProps {
  sequence: string;
  selectedGuide: GuideResult;
}

const BASE_COLORS: Record<string, string> = {
  A: "text-green-600",
  T: "text-red-500",
  G: "text-yellow-600",
  C: "text-blue-600",
};

export function DnaSequenceViewer({
  sequence,
  selectedGuide,
}: DnaSequenceViewerProps) {
  const { guideStart, guideEnd, pamStart, pamEnd } = useMemo(() => {
    const pamPos = selectedGuide.position;
    const pamLen = selectedGuide.pamSequence.length;
    const guideLen = selectedGuide.guideSequence.length;

    if (selectedGuide.strand === "+") {
      return {
        guideStart: pamPos - guideLen,
        guideEnd: pamPos,
        pamStart: pamPos,
        pamEnd: pamPos + pamLen,
      };
    } else {
      // Antisense: PAM RC is at pamPos, guide is downstream on sense
      return {
        guideStart: pamPos + pamLen,
        guideEnd: pamPos + pamLen + guideLen,
        pamStart: pamPos,
        pamEnd: pamPos + pamLen,
      };
    }
  }, [selectedGuide]);

  const cutPos = selectedGuide.cutPosition;

  // Show a window around the guide (50bp on each side)
  const windowStart = Math.max(0, Math.min(guideStart, pamStart) - 50);
  const windowEnd = Math.min(
    sequence.length,
    Math.max(guideEnd, pamEnd) + 50
  );
  const windowSeq = sequence.slice(windowStart, windowEnd);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Sequence View — Guide #{selectedGuide.rank}
          <span className="ml-2 font-normal text-muted-foreground">
            (positions {windowStart + 1}–{windowEnd}, {selectedGuide.strand === "+" ? "sense" : "antisense"} strand)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Position ruler */}
          <div className="font-mono text-xs text-muted-foreground mb-1 whitespace-pre">
            {Array.from({ length: Math.ceil(windowSeq.length / 10) }, (_, i) => {
              const pos = windowStart + i * 10 + 1;
              return pos.toString().padEnd(10);
            }).join("")}
          </div>

          {/* Sequence with highlighting */}
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
            {windowSeq.split("").map((base, i) => {
              const absPos = windowStart + i;
              const isGuide = absPos >= guideStart && absPos < guideEnd;
              const isPam = absPos >= pamStart && absPos < pamEnd;
              const isCut = absPos === cutPos || absPos === cutPos - 1;

              let className = BASE_COLORS[base] || "text-gray-500";
              let bg = "";

              if (isGuide) {
                bg = "bg-green-200 dark:bg-green-800/50";
                className = "text-green-900 dark:text-green-100 font-bold";
              } else if (isPam) {
                bg = "bg-red-200 dark:bg-red-800/50";
                className = "text-red-900 dark:text-red-100 font-bold";
              }

              return (
                <span key={i} className="relative inline">
                  {isCut && (
                    <span className="absolute -top-3 left-0 text-xs text-red-500 font-bold">
                      ✂
                    </span>
                  )}
                  <span
                    className={`${className} ${bg} ${isCut ? "border-l-2 border-red-500" : ""}`}
                    title={`Position ${absPos + 1}`}
                  >
                    {base}
                  </span>
                </span>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="inline-block w-4 h-3 bg-green-200 rounded-sm" />
              Guide RNA ({selectedGuide.guideSequence.length}bp)
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-4 h-3 bg-red-200 rounded-sm" />
              PAM ({selectedGuide.pamSequence})
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-500 font-bold">✂</span>
              Cut site (position {cutPos + 1})
            </div>
            <div className="flex items-center gap-1">
              Strand: {selectedGuide.strand === "+" ? "Sense (+)" : "Antisense (-)"}
            </div>
          </div>

          {/* Guide details */}
          <div className="mt-3 rounded-lg bg-muted/50 p-3 space-y-1">
            <p className="text-xs">
              <span className="text-muted-foreground">Guide (20-mer):</span>{" "}
              <span className="font-mono font-medium">
                5&apos;-{selectedGuide.guideSequence}-3&apos;
              </span>
            </p>
            <p className="text-xs">
              <span className="text-muted-foreground">Full target + PAM:</span>{" "}
              <span className="font-mono">
                {selectedGuide.strand === "+"
                  ? `5'-${selectedGuide.guideSequence}${selectedGuide.pamSequence}-3'`
                  : `5'-${selectedGuide.pamSequence}${selectedGuide.guideSequence}-3' (antisense)`}
              </span>
            </p>
            <p className="text-xs">
              <span className="text-muted-foreground">
                Order as oligo (for cloning into sgRNA vector):
              </span>{" "}
              <span className="font-mono font-medium select-all">
                {selectedGuide.guideSequence}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
