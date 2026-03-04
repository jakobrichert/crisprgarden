/**
 * PAM site scanner
 * Finds all valid PAM sites in a DNA sequence for a given Cas protein
 */

import type { CasProteinConfig, PamMatch } from "./types";
import { reverseComplement, gcContent } from "./sequence";

/**
 * Find all PAM sites in a sequence for a given Cas protein.
 * Scans both strands and returns guide sequences with context.
 */
export function findPamSites(
  sequence: string,
  casProtein: CasProteinConfig
): PamMatch[] {
  const upper = sequence.toUpperCase();
  const matches: PamMatch[] = [];

  if (casProtein.pamPosition === "3prime") {
    findPam3Prime(upper, casProtein, matches);
  } else {
    findPam5Prime(upper, casProtein, matches);
  }

  return matches;
}

/**
 * Find PAM sites for 3'-PAM proteins (SpCas9 family)
 * Guide is UPSTREAM of PAM: [guide 20bp][PAM 3bp]
 */
function findPam3Prime(
  seq: string,
  cas: CasProteinConfig,
  matches: PamMatch[]
): void {
  const pamLen = cas.pamSequence.length;
  const guideLen = cas.guideLength;

  // Sense strand: find PAM on sense, guide is upstream
  const pamRegex = new RegExp(
    cas.pamRegex.source,
    cas.pamRegex.flags.replace("g", "") + "g"
  );
  let match: RegExpExecArray | null;

  // Reset regex
  pamRegex.lastIndex = 0;
  while ((match = pamRegex.exec(seq)) !== null) {
    const pamStart = match.index;

    // Guide is upstream of PAM
    const guideStart = pamStart - guideLen;
    if (guideStart < 0) {
      // Advance past this position to avoid infinite loop on zero-length matches
      pamRegex.lastIndex = match.index + 1;
      continue;
    }

    const guideSeq = seq.slice(guideStart, pamStart);
    const pamSeq = seq.slice(pamStart, pamStart + pamLen);

    // Context: 4bp upstream + guide + PAM + 3bp downstream (30-mer for scoring)
    const contextStart = Math.max(0, guideStart - 4);
    const contextEnd = Math.min(seq.length, pamStart + pamLen + 3);
    const contextSeq = seq.slice(contextStart, contextEnd);

    // Cut position: relative to input sequence
    const cutPos = pamStart + cas.cutOffsetSense;

    if (cutPos >= 0 && cutPos <= seq.length) {
      matches.push({
        pamPosition: pamStart,
        strand: "+",
        pamSequence: pamSeq,
        guideSequence: guideSeq,
        contextSequence: contextSeq,
        cutPosition: cutPos,
        gcContent: gcContent(guideSeq),
      });
    }

    // Move past this match position to avoid infinite loops
    pamRegex.lastIndex = match.index + 1;
  }

  // Antisense strand: find reverse complement of PAM on sense strand
  const pamRegexRC = new RegExp(
    cas.pamRegexRC.source,
    cas.pamRegexRC.flags.replace("g", "") + "g"
  );

  pamRegexRC.lastIndex = 0;
  while ((match = pamRegexRC.exec(seq)) !== null) {
    const rcPamStart = match.index;

    // On the antisense strand, the PAM's RC is at rcPamStart
    // The guide on the antisense strand is downstream (after the RC PAM on sense)
    const guideStartOnSense = rcPamStart + pamLen;
    const guideEndOnSense = guideStartOnSense + guideLen;

    if (guideEndOnSense > seq.length) {
      pamRegexRC.lastIndex = match.index + 1;
      continue;
    }

    // Get the guide from the antisense strand
    const guideOnSense = seq.slice(guideStartOnSense, guideEndOnSense);
    const guideSeq = reverseComplement(guideOnSense);
    const pamSeq = reverseComplement(
      seq.slice(rcPamStart, rcPamStart + pamLen)
    );

    // Context for scoring (on antisense strand)
    const contextStartSense = Math.max(0, rcPamStart - 3);
    const contextEndSense = Math.min(seq.length, guideEndOnSense + 4);
    const contextOnSense = seq.slice(contextStartSense, contextEndSense);
    const contextSeq = reverseComplement(contextOnSense);

    // Cut position on sense strand
    const cutPos = rcPamStart + pamLen - cas.cutOffsetAntisense;

    if (cutPos >= 0 && cutPos <= seq.length) {
      matches.push({
        pamPosition: rcPamStart,
        strand: "-",
        pamSequence: pamSeq,
        guideSequence: guideSeq,
        contextSequence: contextSeq,
        cutPosition: cutPos,
        gcContent: gcContent(guideSeq),
      });
    }

    pamRegexRC.lastIndex = match.index + 1;
  }
}

/**
 * Find PAM sites for 5'-PAM proteins (Cas12a/Cpf1)
 * PAM is UPSTREAM of guide: [PAM 4bp][guide 23bp]
 */
function findPam5Prime(
  seq: string,
  cas: CasProteinConfig,
  matches: PamMatch[]
): void {
  const pamLen = cas.pamSequence.length;
  const guideLen = cas.guideLength;

  // Sense strand
  const pamRegex = new RegExp(
    cas.pamRegex.source,
    cas.pamRegex.flags.replace("g", "") + "g"
  );

  let match: RegExpExecArray | null;

  pamRegex.lastIndex = 0;
  while ((match = pamRegex.exec(seq)) !== null) {
    const pamStart = match.index;
    const guideStart = pamStart + pamLen;
    const guideEnd = guideStart + guideLen;

    if (guideEnd > seq.length) {
      pamRegex.lastIndex = match.index + 1;
      continue;
    }

    const guideSeq = seq.slice(guideStart, guideEnd);
    const pamSeq = seq.slice(pamStart, pamStart + pamLen);

    const contextStart = Math.max(0, pamStart - 4);
    const contextEnd = Math.min(seq.length, guideEnd + 3);
    const contextSeq = seq.slice(contextStart, contextEnd);

    // Cas12a cuts downstream of the guide
    const cutPos = pamStart + pamLen + cas.cutOffsetSense;

    if (cutPos >= 0 && cutPos <= seq.length) {
      matches.push({
        pamPosition: pamStart,
        strand: "+",
        pamSequence: pamSeq,
        guideSequence: guideSeq,
        contextSequence: contextSeq,
        cutPosition: cutPos,
        gcContent: gcContent(guideSeq),
      });
    }

    pamRegex.lastIndex = match.index + 1;
  }

  // Antisense strand
  const pamRegexRC = new RegExp(
    cas.pamRegexRC.source,
    cas.pamRegexRC.flags.replace("g", "") + "g"
  );

  pamRegexRC.lastIndex = 0;
  while ((match = pamRegexRC.exec(seq)) !== null) {
    const rcPamStart = match.index;

    // The RC of a 5'-PAM appears on the sense strand with the guide upstream
    const guideEndOnSense = rcPamStart;
    const guideStartOnSense = guideEndOnSense - guideLen;

    if (guideStartOnSense < 0) {
      pamRegexRC.lastIndex = match.index + 1;
      continue;
    }

    const guideOnSense = seq.slice(guideStartOnSense, guideEndOnSense);
    const guideSeq = reverseComplement(guideOnSense);
    const pamSeq = reverseComplement(
      seq.slice(rcPamStart, rcPamStart + pamLen)
    );

    const contextStart = Math.max(0, guideStartOnSense - 3);
    const contextEnd = Math.min(seq.length, rcPamStart + pamLen + 4);
    const contextOnSense = seq.slice(contextStart, contextEnd);
    const contextSeq = reverseComplement(contextOnSense);

    const cutPos = rcPamStart - cas.cutOffsetSense;

    if (cutPos >= 0 && cutPos <= seq.length) {
      matches.push({
        pamPosition: rcPamStart,
        strand: "-",
        pamSequence: pamSeq,
        guideSequence: guideSeq,
        contextSequence: contextSeq,
        cutPosition: cutPos,
        gcContent: gcContent(guideSeq),
      });
    }

    pamRegexRC.lastIndex = match.index + 1;
  }
}
