/**
 * Verification primer design for CRISPR screening
 * Designs PCR primer pairs flanking the cut site
 */

import type { PrimerPair, PrimerInfo, PrimerDesignOptions } from "./types";
import { DEFAULT_PRIMER_OPTIONS } from "./types";
import { calculateTm } from "./tm";
import { gcContent, reverseComplement, selfComplementarityScore } from "./sequence";

/**
 * Design verification primer pairs flanking a CRISPR cut site
 *
 * @param sequence - The full DNA sequence
 * @param cutPosition - Position of the DSB (0-based)
 * @param options - Primer design parameters
 * @returns Array of primer pairs sorted by quality
 */
export function designVerificationPrimers(
  sequence: string,
  cutPosition: number,
  options: Partial<PrimerDesignOptions> = {}
): PrimerPair[] {
  const opts = { ...DEFAULT_PRIMER_OPTIONS, ...options };
  const upper = sequence.toUpperCase();
  const pairs: PrimerPair[] = [];

  const [minLen, maxLen] = opts.primerLengthRange;

  // Generate forward primer candidates (upstream of cut)
  const fwdCandidates = generatePrimerCandidates(
    upper,
    cutPosition,
    "forward",
    opts
  );

  // Generate reverse primer candidates (downstream of cut)
  const revCandidates = generatePrimerCandidates(
    upper,
    cutPosition,
    "reverse",
    opts
  );

  // Find compatible pairs
  for (const fwd of fwdCandidates) {
    for (const rev of revCandidates) {
      const productSize = rev.position + rev.length - fwd.position;

      if (
        productSize < opts.minProductSize ||
        productSize > opts.maxProductSize
      ) {
        continue;
      }

      // Check Tm compatibility (within 3°C of each other)
      if (Math.abs(fwd.tm - rev.tm) > 5) continue;

      pairs.push({ forward: fwd, reverse: rev, productSize });
    }
  }

  // Sort by quality: prefer pairs with Tm near optimal and close Tm match
  pairs.sort((a, b) => {
    const aScore = primerPairScore(a, opts);
    const bScore = primerPairScore(b, opts);
    return bScore - aScore;
  });

  return pairs.slice(0, 10); // Return top 10 pairs
}

function generatePrimerCandidates(
  seq: string,
  cutPos: number,
  direction: "forward" | "reverse",
  opts: PrimerDesignOptions
): PrimerInfo[] {
  const [minLen, maxLen] = opts.primerLengthRange;
  const candidates: PrimerInfo[] = [];

  if (direction === "forward") {
    // Forward primers: 50-400bp upstream of cut site
    for (let offset = 50; offset < 400; offset += 10) {
      for (let len = minLen; len <= maxLen; len++) {
        const start = cutPos - offset - len;
        if (start < 0) continue;

        const primerSeq = seq.slice(start, start + len);
        if (!isValidPrimer(primerSeq)) continue;

        const tm = calculateTm(primerSeq);
        if (Math.abs(tm - opts.optimalTm) > opts.tmTolerance * 2) continue;

        candidates.push({
          sequence: primerSeq,
          tm,
          gcPercent: Math.round(gcContent(primerSeq) * 100),
          position: start,
          length: len,
        });
      }
    }
  } else {
    // Reverse primers: 50-400bp downstream of cut site
    for (let offset = 50; offset < 400; offset += 10) {
      for (let len = minLen; len <= maxLen; len++) {
        const end = cutPos + offset + len;
        if (end > seq.length) continue;

        const primerSeqSense = seq.slice(end - len, end);
        const primerSeq = reverseComplement(primerSeqSense);
        if (!isValidPrimer(primerSeq)) continue;

        const tm = calculateTm(primerSeq);
        if (Math.abs(tm - opts.optimalTm) > opts.tmTolerance * 2) continue;

        candidates.push({
          sequence: primerSeq,
          tm,
          gcPercent: Math.round(gcContent(primerSeq) * 100),
          position: end - len,
          length: len,
        });
      }
    }
  }

  // Sort by how close Tm is to optimal
  candidates.sort(
    (a, b) =>
      Math.abs(a.tm - opts.optimalTm) - Math.abs(b.tm - opts.optimalTm)
  );

  return candidates.slice(0, 20); // Keep top 20 per direction
}

/** Basic primer validity checks */
function isValidPrimer(seq: string): boolean {
  // Must be all standard bases
  if (!/^[ATGC]+$/.test(seq)) return false;

  // GC content between 30-70%
  const gc = gcContent(seq);
  if (gc < 0.3 || gc > 0.7) return false;

  // GC clamp: last 2 bases should include G or C (but not all G/C)
  const last2 = seq.slice(-2);
  const last2gc = (last2.match(/[GC]/g) || []).length;
  if (last2gc === 0) return false; // No GC clamp

  // No runs of 4+ same base
  if (/(.)\1{3,}/.test(seq)) return false;

  // Low self-complementarity
  if (selfComplementarityScore(seq) > 0.6) return false;

  return true;
}

/** Score a primer pair (higher is better) */
function primerPairScore(pair: PrimerPair, opts: PrimerDesignOptions): number {
  let score = 100;

  // Penalize Tm deviation from optimal
  score -= Math.abs(pair.forward.tm - opts.optimalTm) * 2;
  score -= Math.abs(pair.reverse.tm - opts.optimalTm) * 2;

  // Penalize Tm mismatch between forward and reverse
  score -= Math.abs(pair.forward.tm - pair.reverse.tm) * 3;

  // Prefer product sizes around 400-600bp
  const idealProduct = 500;
  score -= Math.abs(pair.productSize - idealProduct) * 0.05;

  // Prefer GC content near 50%
  score -= Math.abs(pair.forward.gcPercent - 50) * 0.3;
  score -= Math.abs(pair.reverse.gcPercent - 50) * 0.3;

  return score;
}

export { isValidPrimer };
