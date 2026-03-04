"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

interface GuideResultsTableProps {
  guides: GuideResult[];
  selectedGuide: GuideResult | null;
  onSelectGuide: (guide: GuideResult) => void;
}

function scoreColor(score: number): string {
  if (score >= 0.7) return "text-green-600";
  if (score >= 0.5) return "text-yellow-600";
  return "text-red-600";
}

function scoreBadge(score: number): "default" | "secondary" | "destructive" {
  if (score >= 0.7) return "default";
  if (score >= 0.5) return "secondary";
  return "destructive";
}

export function GuideResultsTable({
  guides,
  selectedGuide,
  onSelectGuide,
}: GuideResultsTableProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">
        Guide RNA Candidates ({guides.length})
      </h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Guide Sequence (5&apos;→3&apos;)</TableHead>
              <TableHead className="w-16">PAM</TableHead>
              <TableHead className="w-16">Strand</TableHead>
              <TableHead className="w-20">Position</TableHead>
              <TableHead className="w-16">GC%</TableHead>
              <TableHead className="w-20">Score</TableHead>
              <TableHead className="w-24">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guides.map((guide) => (
              <TableRow
                key={`${guide.position}-${guide.strand}`}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedGuide?.position === guide.position &&
                    selectedGuide?.strand === guide.strand
                    ? "bg-green-50 dark:bg-green-950/20"
                    : "hover:bg-muted/50"
                )}
                onClick={() => onSelectGuide(guide)}
              >
                <TableCell className="font-medium text-muted-foreground">
                  {guide.rank}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  <span className="select-all">{guide.guideSequence}</span>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {guide.pamSequence}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {guide.strand === "+" ? "Sense" : "Anti"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{guide.position}</TableCell>
                <TableCell
                  className={cn(
                    "text-sm font-medium",
                    guide.gcContent >= 40 && guide.gcContent <= 70
                      ? "text-green-600"
                      : "text-yellow-600"
                  )}
                >
                  {guide.gcContent}%
                </TableCell>
                <TableCell>
                  <Badge variant={scoreBadge(guide.combinedScore)}>
                    {(guide.combinedScore * 100).toFixed(0)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-xs text-muted-foreground underline">
                        Breakdown
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="w-64">
                      <div className="space-y-1 text-xs">
                        <ScoreBar
                          label="GC Content"
                          value={guide.scoreBreakdown.gcScore}
                        />
                        <ScoreBar
                          label="Position Weight"
                          value={guide.scoreBreakdown.positionWeightScore}
                        />
                        <ScoreBar
                          label="Seed Tm"
                          value={guide.scoreBreakdown.seedTmScore}
                        />
                        <ScoreBar
                          label="Self-Comp (penalty)"
                          value={guide.scoreBreakdown.selfCompScore}
                          inverted
                        />
                        <ScoreBar
                          label="Poly-T (penalty)"
                          value={guide.scoreBreakdown.polyTScore}
                          inverted
                        />
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  inverted = false,
}: {
  label: string;
  value: number;
  inverted?: boolean;
}) {
  const pct = Math.round(value * 100);
  const color = inverted
    ? value > 0.5
      ? "bg-red-500"
      : value > 0.2
        ? "bg-yellow-500"
        : "bg-green-500"
    : value > 0.6
      ? "bg-green-500"
      : value > 0.3
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right">{pct}%</span>
    </div>
  );
}
