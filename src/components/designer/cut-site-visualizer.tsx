"use client";

import { useRef, useEffect, useMemo } from "react";
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

interface CutSiteVisualizerProps {
  sequenceLength: number;
  guides: GuideResult[];
  selectedGuide: GuideResult | null;
  onSelectGuide: (guide: GuideResult) => void;
}

export function CutSiteVisualizer({
  sequenceLength,
  guides,
  selectedGuide,
  onSelectGuide,
}: CutSiteVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sortedGuides = useMemo(
    () => [...guides].sort((a, b) => a.cutPosition - b.cutPosition),
    [guides]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { left: 60, right: 20, top: 40, bottom: 30 };
    const trackY = height / 2;
    const trackWidth = width - padding.left - padding.right;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Scale function: sequence position -> canvas x
    const xScale = (pos: number) =>
      padding.left + (pos / sequenceLength) * trackWidth;

    // Draw the sequence track (thick horizontal bar)
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(padding.left, trackY - 6, trackWidth, 12);

    // Draw position labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";

    const tickCount = Math.min(10, Math.ceil(sequenceLength / 100));
    for (let i = 0; i <= tickCount; i++) {
      const pos = Math.round((i / tickCount) * sequenceLength);
      const x = xScale(pos);
      ctx.fillText(pos.toString(), x, height - 8);
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, trackY + 8);
      ctx.lineTo(x, height - 22);
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = "#374151";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("5'", padding.left - 20, trackY + 4);
    ctx.textAlign = "right";
    ctx.fillText("3'", width - padding.right + 18, trackY + 4);

    // Draw cut sites as markers
    for (const guide of sortedGuides) {
      const x = xScale(guide.cutPosition);
      const isSelected =
        selectedGuide?.position === guide.position &&
        selectedGuide?.strand === guide.strand;
      const isTopStrand = guide.strand === "+";
      const markerY = isTopStrand ? trackY - 20 : trackY + 20;

      // Cut line
      ctx.strokeStyle = isSelected ? "#16a34a" : "#9ca3af";
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, trackY - 8);
      ctx.lineTo(x, trackY + 8);
      ctx.stroke();

      // Score-colored triangle marker
      const score = guide.combinedScore;
      const color =
        score >= 0.7 ? "#16a34a" : score >= 0.5 ? "#ca8a04" : "#dc2626";

      ctx.fillStyle = isSelected ? color : color + "80";
      ctx.beginPath();
      if (isTopStrand) {
        ctx.moveTo(x, markerY + 10);
        ctx.lineTo(x - 5, markerY);
        ctx.lineTo(x + 5, markerY);
      } else {
        ctx.moveTo(x, markerY - 10);
        ctx.lineTo(x - 5, markerY);
        ctx.lineTo(x + 5, markerY);
      }
      ctx.closePath();
      ctx.fill();

      // Rank label for selected or top 5
      if (isSelected || guide.rank <= 5) {
        ctx.fillStyle = isSelected ? "#16a34a" : "#6b7280";
        ctx.font = isSelected ? "bold 10px sans-serif" : "10px sans-serif";
        ctx.textAlign = "center";
        const labelY = isTopStrand ? markerY - 4 : markerY + 14;
        ctx.fillText(`#${guide.rank}`, x, labelY);
      }
    }

    // Legend
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#6b7280";
    ctx.fillText("▲ Sense strand guides", padding.left, 14);
    ctx.fillText("▼ Antisense strand guides", padding.left, 26);

    const legendX = width / 2;
    ctx.fillStyle = "#16a34a";
    ctx.fillRect(legendX, 8, 8, 8);
    ctx.fillStyle = "#6b7280";
    ctx.fillText("Score ≥70", legendX + 12, 16);

    ctx.fillStyle = "#ca8a04";
    ctx.fillRect(legendX + 80, 8, 8, 8);
    ctx.fillStyle = "#6b7280";
    ctx.fillText("50-69", legendX + 92, 16);

    ctx.fillStyle = "#dc2626";
    ctx.fillRect(legendX + 140, 8, 8, 8);
    ctx.fillStyle = "#6b7280";
    ctx.fillText("<50", legendX + 152, 16);
  }, [sequenceLength, sortedGuides, selectedGuide]);

  // Handle click on canvas to select nearest guide
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 60, right: 20 };
    const trackWidth = rect.width - padding.left - padding.right;

    // Convert click x to sequence position
    const seqPos = ((x - padding.left) / trackWidth) * sequenceLength;

    // Find nearest guide
    let nearest: GuideResult | null = null;
    let minDist = Infinity;
    for (const g of guides) {
      const dist = Math.abs(g.cutPosition - seqPos);
      if (dist < minDist) {
        minDist = dist;
        nearest = g;
      }
    }

    // Only select if click was reasonably close (within 2% of sequence length)
    if (nearest && minDist < sequenceLength * 0.02) {
      onSelectGuide(nearest);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Cut Site Map
          {selectedGuide && (
            <span className="ml-2 font-normal text-muted-foreground">
              — Selected: #{selectedGuide.rank} at position{" "}
              {selectedGuide.cutPosition} ({selectedGuide.strand} strand)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          className="h-[120px] w-full cursor-crosshair"
          onClick={handleCanvasClick}
        />
      </CardContent>
    </Card>
  );
}
