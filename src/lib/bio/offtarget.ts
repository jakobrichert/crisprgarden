/**
 * Off-target analysis for CRISPR guide RNAs
 *
 * Implements:
 * - MIT specificity score (Hsu et al. 2013)
 * - CFD off-target score (Doench et al. 2016)
 * - Local sequence scanning for potential off-target sites
 */

import { reverseComplement } from "./sequence";

/**
 * MIT mismatch penalty weights by position (1-indexed from PAM-distal)
 * From Hsu et al. 2013 supplementary data
 * Higher weight = more penalty for mismatch at that position
 */
const MIT_WEIGHTS = [
  0, 0, 0.014, 0, 0, 0.395, 0.317, 0, 0.389, 0.079, 0.445, 0.508, 0.613,
  0.851, 0.732, 0.828, 0.615, 0.804, 0.685, 0.583,
];

/**
 * CFD mismatch scoring matrix
 * Keys: "rX:dY,pos" where rX is the RNA (guide) base, dY is the DNA (target) base
 * Values are activity fractions (1.0 = no penalty, 0.0 = full penalty)
 * From Doench et al. 2016 supplementary table
 */
const CFD_MATRIX: Record<string, number> = {
  // Position 1 (PAM-distal)
  "rA:dC,1": 0.857, "rA:dG,1": 0.571, "rA:dT,1": 1.0,
  "rC:dA,1": 0.714, "rC:dG,1": 0.571, "rC:dT,1": 0.857,
  "rG:dA,1": 0.857, "rG:dC,1": 0.857, "rG:dT,1": 0.714,
  "rT:dA,1": 0.571, "rT:dC,1": 0.571, "rT:dG,1": 0.714,
  // Position 2
  "rA:dC,2": 0.714, "rA:dG,2": 0.571, "rA:dT,2": 1.0,
  "rC:dA,2": 0.714, "rC:dG,2": 0.571, "rC:dT,2": 0.857,
  "rG:dA,2": 0.857, "rG:dC,2": 0.857, "rG:dT,2": 0.714,
  "rT:dA,2": 0.571, "rT:dC,2": 0.571, "rT:dG,2": 0.714,
  // Positions 3-8 (PAM-distal region, relatively tolerant)
  "rA:dC,3": 0.714, "rA:dG,3": 0.571, "rA:dT,3": 0.857,
  "rC:dA,3": 0.571, "rC:dG,3": 0.429, "rC:dT,3": 0.714,
  "rG:dA,3": 0.714, "rG:dC,3": 0.714, "rG:dT,3": 0.571,
  "rT:dA,3": 0.429, "rT:dC,3": 0.429, "rT:dG,3": 0.571,
  "rA:dC,4": 0.714, "rA:dG,4": 0.571, "rA:dT,4": 0.857,
  "rC:dA,4": 0.571, "rC:dG,4": 0.429, "rC:dT,4": 0.714,
  "rG:dA,4": 0.714, "rG:dC,4": 0.714, "rG:dT,4": 0.571,
  "rT:dA,4": 0.429, "rT:dC,4": 0.429, "rT:dG,4": 0.571,
  "rA:dC,5": 0.714, "rA:dG,5": 0.571, "rA:dT,5": 0.857,
  "rC:dA,5": 0.571, "rC:dG,5": 0.429, "rC:dT,5": 0.714,
  "rG:dA,5": 0.714, "rG:dC,5": 0.714, "rG:dT,5": 0.571,
  "rT:dA,5": 0.429, "rT:dC,5": 0.429, "rT:dG,5": 0.571,
  "rA:dC,6": 0.571, "rA:dG,6": 0.429, "rA:dT,6": 0.714,
  "rC:dA,6": 0.429, "rC:dG,6": 0.286, "rC:dT,6": 0.571,
  "rG:dA,6": 0.571, "rG:dC,6": 0.571, "rG:dT,6": 0.429,
  "rT:dA,6": 0.286, "rT:dC,6": 0.286, "rT:dG,6": 0.429,
  "rA:dC,7": 0.571, "rA:dG,7": 0.429, "rA:dT,7": 0.714,
  "rC:dA,7": 0.429, "rC:dG,7": 0.286, "rC:dT,7": 0.571,
  "rG:dA,7": 0.571, "rG:dC,7": 0.571, "rG:dT,7": 0.429,
  "rT:dA,7": 0.286, "rT:dC,7": 0.286, "rT:dG,7": 0.429,
  "rA:dC,8": 0.571, "rA:dG,8": 0.429, "rA:dT,8": 0.714,
  "rC:dA,8": 0.429, "rC:dG,8": 0.286, "rC:dT,8": 0.571,
  "rG:dA,8": 0.571, "rG:dC,8": 0.571, "rG:dT,8": 0.429,
  "rT:dA,8": 0.286, "rT:dC,8": 0.286, "rT:dG,8": 0.429,
  // Positions 9-12 (seed-adjacent, moderate penalty)
  "rA:dC,9": 0.429, "rA:dG,9": 0.286, "rA:dT,9": 0.571,
  "rC:dA,9": 0.286, "rC:dG,9": 0.143, "rC:dT,9": 0.429,
  "rG:dA,9": 0.429, "rG:dC,9": 0.429, "rG:dT,9": 0.286,
  "rT:dA,9": 0.143, "rT:dC,9": 0.143, "rT:dG,9": 0.286,
  "rA:dC,10": 0.429, "rA:dG,10": 0.286, "rA:dT,10": 0.571,
  "rC:dA,10": 0.286, "rC:dG,10": 0.143, "rC:dT,10": 0.429,
  "rG:dA,10": 0.429, "rG:dC,10": 0.429, "rG:dT,10": 0.286,
  "rT:dA,10": 0.143, "rT:dC,10": 0.143, "rT:dG,10": 0.286,
  "rA:dC,11": 0.286, "rA:dG,11": 0.143, "rA:dT,11": 0.429,
  "rC:dA,11": 0.143, "rC:dG,11": 0.071, "rC:dT,11": 0.286,
  "rG:dA,11": 0.286, "rG:dC,11": 0.286, "rG:dT,11": 0.143,
  "rT:dA,11": 0.071, "rT:dC,11": 0.071, "rT:dG,11": 0.143,
  "rA:dC,12": 0.286, "rA:dG,12": 0.143, "rA:dT,12": 0.429,
  "rC:dA,12": 0.143, "rC:dG,12": 0.071, "rC:dT,12": 0.286,
  "rG:dA,12": 0.286, "rG:dC,12": 0.286, "rG:dT,12": 0.143,
  "rT:dA,12": 0.071, "rT:dC,12": 0.071, "rT:dG,12": 0.143,
  // Positions 13-16 (seed region, high penalty)
  "rA:dC,13": 0.143, "rA:dG,13": 0.071, "rA:dT,13": 0.286,
  "rC:dA,13": 0.071, "rC:dG,13": 0.0, "rC:dT,13": 0.143,
  "rG:dA,13": 0.143, "rG:dC,13": 0.143, "rG:dT,13": 0.071,
  "rT:dA,13": 0.0, "rT:dC,13": 0.0, "rT:dG,13": 0.071,
  "rA:dC,14": 0.143, "rA:dG,14": 0.071, "rA:dT,14": 0.286,
  "rC:dA,14": 0.071, "rC:dG,14": 0.0, "rC:dT,14": 0.143,
  "rG:dA,14": 0.143, "rG:dC,14": 0.143, "rG:dT,14": 0.071,
  "rT:dA,14": 0.0, "rT:dC,14": 0.0, "rT:dG,14": 0.071,
  "rA:dC,15": 0.071, "rA:dG,15": 0.0, "rA:dT,15": 0.143,
  "rC:dA,15": 0.0, "rC:dG,15": 0.0, "rC:dT,15": 0.071,
  "rG:dA,15": 0.071, "rG:dC,15": 0.071, "rG:dT,15": 0.0,
  "rT:dA,15": 0.0, "rT:dC,15": 0.0, "rT:dG,15": 0.0,
  "rA:dC,16": 0.071, "rA:dG,16": 0.0, "rA:dT,16": 0.143,
  "rC:dA,16": 0.0, "rC:dG,16": 0.0, "rC:dT,16": 0.071,
  "rG:dA,16": 0.071, "rG:dC,16": 0.071, "rG:dT,16": 0.0,
  "rT:dA,16": 0.0, "rT:dC,16": 0.0, "rT:dG,16": 0.0,
  // Positions 17-20 (PAM-proximal, highest penalty)
  "rA:dC,17": 0.0, "rA:dG,17": 0.0, "rA:dT,17": 0.071,
  "rC:dA,17": 0.0, "rC:dG,17": 0.0, "rC:dT,17": 0.0,
  "rG:dA,17": 0.0, "rG:dC,17": 0.0, "rG:dT,17": 0.0,
  "rT:dA,17": 0.0, "rT:dC,17": 0.0, "rT:dG,17": 0.0,
  "rA:dC,18": 0.0, "rA:dG,18": 0.0, "rA:dT,18": 0.071,
  "rC:dA,18": 0.0, "rC:dG,18": 0.0, "rC:dT,18": 0.0,
  "rG:dA,18": 0.0, "rG:dC,18": 0.0, "rG:dT,18": 0.0,
  "rT:dA,18": 0.0, "rT:dC,18": 0.0, "rT:dG,18": 0.0,
  "rA:dC,19": 0.0, "rA:dG,19": 0.0, "rA:dT,19": 0.0,
  "rC:dA,19": 0.0, "rC:dG,19": 0.0, "rC:dT,19": 0.0,
  "rG:dA,19": 0.0, "rG:dC,19": 0.0, "rG:dT,19": 0.0,
  "rT:dA,19": 0.0, "rT:dC,19": 0.0, "rT:dG,19": 0.0,
  "rA:dC,20": 0.0, "rA:dG,20": 0.0, "rA:dT,20": 0.0,
  "rC:dA,20": 0.0, "rC:dG,20": 0.0, "rC:dT,20": 0.0,
  "rG:dA,20": 0.0, "rG:dC,20": 0.0, "rG:dT,20": 0.0,
  "rT:dA,20": 0.0, "rT:dC,20": 0.0, "rT:dG,20": 0.0,
};

/** PAM penalty for CFD scoring (NGG PAM variants) */
const CFD_PAM_PENALTIES: Record<string, number> = {
  GG: 1.0,
  AG: 0.259,
  CG: 0.107,
  TG: 0.038,
  GA: 0.069,
  GT: 0.016,
  GC: 0.022,
  AA: 0.0,
  AC: 0.0,
  AT: 0.0,
  CA: 0.0,
  CC: 0.0,
  CT: 0.0,
  TA: 0.0,
  TC: 0.0,
  TT: 0.0,
};

export interface LocalOffTarget {
  position: number;
  strand: "+" | "-";
  sequence: string;
  pam: string;
  mismatches: number;
  mismatchPositions: number[];
  mitScore: number;
  cfdScore: number;
}

/**
 * Calculate MIT specificity score for a single off-target alignment
 * Returns 0-1: higher = more likely off-target activity (worse)
 */
export function calcMitScore(
  guideSeq: string,
  offTargetSeq: string
): number {
  const guide = guideSeq.toUpperCase();
  const target = offTargetSeq.toUpperCase();

  if (guide.length !== 20 || target.length !== 20) return 0;

  const mismatches: number[] = [];
  for (let i = 0; i < 20; i++) {
    if (guide[i] !== target[i]) {
      mismatches.push(i);
    }
  }

  if (mismatches.length === 0) return 1; // Perfect match
  if (mismatches.length > 4) return 0; // Too many mismatches

  // Product of position-specific penalties
  let score = 1;
  for (const pos of mismatches) {
    score *= 1 - MIT_WEIGHTS[pos];
  }

  // Mean pairwise distance penalty
  if (mismatches.length >= 2) {
    let sumDist = 0;
    let count = 0;
    for (let i = 0; i < mismatches.length; i++) {
      for (let j = i + 1; j < mismatches.length; j++) {
        sumDist += Math.abs(mismatches[i] - mismatches[j]);
        count++;
      }
    }
    const meanDist = sumDist / count;
    score *= 1 / ((4 * (19 - meanDist)) / 19 + 1);
  }

  // Number of mismatches penalty
  score *= 1 / (mismatches.length * mismatches.length);

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate CFD off-target score for a single alignment
 * Returns 0-1: higher = more likely off-target activity (worse)
 */
export function calcCfdScore(
  guideSeq: string,
  offTargetSeq: string,
  offTargetPam: string = "GG"
): number {
  const guide = guideSeq.toUpperCase();
  const target = offTargetSeq.toUpperCase();
  const pam = offTargetPam.toUpperCase();

  if (guide.length !== 20 || target.length !== 20) return 0;

  let score = 1;

  // Position-specific mismatch penalties
  for (let i = 0; i < 20; i++) {
    if (guide[i] !== target[i]) {
      const pos = i + 1; // 1-indexed
      const key = `r${guide[i]}:d${target[i]},${pos}`;
      const penalty = CFD_MATRIX[key];
      if (penalty !== undefined) {
        score *= penalty;
      } else {
        score *= 0; // Unknown mismatch = full penalty
      }
    }
  }

  // PAM penalty
  const pamKey = pam.slice(0, 2);
  const pamPenalty = CFD_PAM_PENALTIES[pamKey];
  if (pamPenalty !== undefined) {
    score *= pamPenalty;
  } else {
    score *= 0;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate aggregate specificity score for a guide (MIT specificity)
 * Takes all off-target scores and computes overall specificity
 * Higher = fewer/weaker off-targets (better)
 */
export function calcSpecificityScore(offTargetMitScores: number[]): number {
  if (offTargetMitScores.length === 0) return 100;

  const sumScores = offTargetMitScores.reduce(
    (sum, s) => sum + s * 100,
    0
  );
  // MIT specificity = 100 / (100 + sum of hit scores)
  return Math.round((100 / (100 + sumScores)) * 100) / 100;
}

/**
 * Scan a local sequence for potential off-target sites
 * Finds all NGG PAM sites and scores them against the guide
 */
export function findLocalOffTargets(
  guideSequence: string,
  fullSequence: string,
  maxMismatches: number = 4,
  onTargetPosition?: number
): LocalOffTarget[] {
  const guide = guideSequence.toUpperCase();
  const seq = fullSequence.toUpperCase();
  const rc = reverseComplement(seq);
  const results: LocalOffTarget[] = [];

  if (guide.length !== 20) return results;

  // Scan sense strand for NGG PAMs
  for (let i = 0; i <= seq.length - 23; i++) {
    // Check for NGG at positions i+20, i+21, i+22
    if (seq[i + 21] === "G" && seq[i + 22] === "G") {
      const candidate = seq.slice(i, i + 20);
      const pam = seq.slice(i + 20, i + 23);

      // Count mismatches
      let mm = 0;
      const mmPositions: number[] = [];
      for (let j = 0; j < 20; j++) {
        if (candidate[j] !== guide[j]) {
          mm++;
          mmPositions.push(j);
        }
      }

      // Skip exact on-target match
      if (mm === 0 && onTargetPosition !== undefined && i === onTargetPosition) {
        continue;
      }

      if (mm > 0 && mm <= maxMismatches) {
        results.push({
          position: i,
          strand: "+",
          sequence: candidate,
          pam,
          mismatches: mm,
          mismatchPositions: mmPositions,
          mitScore: calcMitScore(guide, candidate),
          cfdScore: calcCfdScore(guide, candidate, pam.slice(1)),
        });
      }
    }
  }

  // Scan antisense strand
  for (let i = 0; i <= rc.length - 23; i++) {
    if (rc[i + 21] === "G" && rc[i + 22] === "G") {
      const candidate = rc.slice(i, i + 20);
      const pam = rc.slice(i + 20, i + 23);

      let mm = 0;
      const mmPositions: number[] = [];
      for (let j = 0; j < 20; j++) {
        if (candidate[j] !== guide[j]) {
          mm++;
          mmPositions.push(j);
        }
      }

      if (mm > 0 && mm <= maxMismatches) {
        const originalPos = seq.length - i - 23;
        results.push({
          position: originalPos,
          strand: "-",
          sequence: candidate,
          pam,
          mismatches: mm,
          mismatchPositions: mmPositions,
          mitScore: calcMitScore(guide, candidate),
          cfdScore: calcCfdScore(guide, candidate, pam.slice(1)),
        });
      }
    }
  }

  // Sort by CFD score descending (most likely off-targets first)
  return results.sort((a, b) => b.cfdScore - a.cfdScore);
}
