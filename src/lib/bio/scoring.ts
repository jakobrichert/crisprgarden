/**
 * On-target efficiency scoring for sgRNA candidates
 *
 * Heuristic scoring based on features from:
 * - Doench et al. 2016 (Rule Set 2) feature engineering
 * - Xu et al. 2015 (position-specific nucleotide preferences)
 *
 * This provides a fast, dependency-free approximation.
 * For full Azimuth/Rule Set 2 accuracy, use the Python sidecar.
 */

import type { PamMatch, ScoredGuide, ScoreBreakdown } from "./types";
import { seedTm } from "./tm";
import { longestPolyT, selfComplementarityScore } from "./sequence";

/**
 * Position-weighted nucleotide preferences for SpCas9 guides (20-mer)
 * Values represent the preference weight at each position (0 = PAM-distal, 19 = PAM-proximal)
 * Derived from Doench 2016 / Xu 2015 large-scale screening data
 */
const POSITION_WEIGHTS: Record<string, number[]> = {
  // Preferred nucleotides at each position (simplified from full model)
  G: [
    0, 0, 0, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.15, 0.2, 0.15,
    0.3,
  ],
  C: [
    0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0.1, 0, 0, 0.1, 0, 0, 0.1, 0.1, 0.15,
    0.2, 0,
  ],
  A: [
    0, 0, 0.1, 0, 0.1, 0, 0, 0, 0.1, 0, 0.1, 0, 0, 0.1, 0, 0, 0, 0, 0,
    -0.1,
  ],
  T: [
    0, 0.1, 0, 0.1, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, -0.1, -0.15,
    -0.1, -0.2,
  ],
};

/**
 * Score a single guide RNA candidate using heuristic features
 */
export function scoreGuide(pamMatch: PamMatch): ScoredGuide {
  const guide = pamMatch.guideSequence.toUpperCase();
  const breakdown = computeScoreBreakdown(guide);

  // Weighted combination of features
  const heuristicScore = Math.max(
    0,
    Math.min(
      1,
      0.5 + // base score
        breakdown.gcScore * 0.25 +
        breakdown.positionWeightScore * 0.3 +
        breakdown.seedTmScore * 0.15 -
        breakdown.selfCompScore * 0.15 -
        breakdown.polyTScore * 0.15
    )
  );

  return {
    ...pamMatch,
    heuristicScore: Math.round(heuristicScore * 1000) / 1000,
    combinedScore: Math.round(heuristicScore * 1000) / 1000,
    scoreBreakdown: breakdown,
  };
}

function computeScoreBreakdown(guide: string): ScoreBreakdown {
  return {
    gcScore: computeGcScore(guide),
    positionWeightScore: computePositionWeightScore(guide),
    seedTmScore: computeSeedTmScore(guide),
    selfCompScore: selfComplementarityScore(guide),
    polyTScore: computePolyTScore(guide),
  };
}

/**
 * GC content score: optimal range is 40-70%
 * Penalize guides outside this range
 */
function computeGcScore(guide: string): number {
  let gc = 0;
  for (const b of guide) {
    if (b === "G" || b === "C") gc++;
  }
  const gcPct = gc / guide.length;

  if (gcPct >= 0.4 && gcPct <= 0.7) {
    // Optimal range — peak at 50-60%
    const distFromOptimal = Math.abs(gcPct - 0.55);
    return 1 - distFromOptimal * 2;
  }
  if (gcPct < 0.4) {
    return gcPct / 0.4; // Linear ramp up
  }
  return Math.max(0, 1 - (gcPct - 0.7) * 5); // Sharp penalty above 70%
}

/**
 * Position-weighted nucleotide preference score
 * Accounts for position-specific base preferences in active guides
 */
function computePositionWeightScore(guide: string): number {
  // Only works for 20-mers; for others, skip
  if (guide.length !== 20) return 0.5;

  let score = 0;
  for (let i = 0; i < 20; i++) {
    const base = guide[i];
    const weights = POSITION_WEIGHTS[base];
    if (weights) {
      score += weights[i];
    }
  }

  // Normalize to 0-1 range (typical raw scores range from ~-0.5 to ~1.5)
  return Math.max(0, Math.min(1, (score + 0.5) / 2));
}

/**
 * Seed region Tm score
 * The seed region (PAM-proximal 8bp) should have moderate Tm
 * Too low = weak binding, too high = off-target tolerance
 */
function computeSeedTmScore(guide: string): number {
  const tm = seedTm(guide, 8);

  // Optimal seed Tm: ~20-30°C for 8-mer
  if (tm >= 20 && tm <= 30) return 1;
  if (tm < 20) return Math.max(0, tm / 20);
  return Math.max(0, 1 - (tm - 30) / 20);
}

/**
 * Poly-T penalty
 * Stretches of 4+ Ts terminate Pol III transcription (U6/H1 promoters)
 */
function computePolyTScore(guide: string): number {
  const maxT = longestPolyT(guide);
  if (maxT <= 3) return 0; // No penalty
  if (maxT === 4) return 0.5; // Moderate penalty
  return 1; // Severe penalty for 5+ consecutive Ts
}

/**
 * Score and rank a batch of guide candidates
 * Returns sorted by combinedScore descending (best first)
 */
export function scoreAndRankGuides(pamMatches: PamMatch[]): ScoredGuide[] {
  return pamMatches
    .map(scoreGuide)
    .sort((a, b) => b.combinedScore - a.combinedScore);
}
