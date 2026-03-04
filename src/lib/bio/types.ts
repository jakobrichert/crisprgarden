/** Configuration for a CRISPR-associated protein */
export interface CasProteinConfig {
  id: string;
  name: string;
  /** PAM sequence using IUPAC codes (e.g., "NGG", "TTTV") */
  pamSequence: string;
  /** Regex pattern matching the PAM on the sense strand */
  pamRegex: RegExp;
  /** Regex pattern matching the PAM on the antisense strand */
  pamRegexRC: RegExp;
  /** Whether PAM is 3' (SpCas9) or 5' (Cas12a) of the guide */
  pamPosition: "3prime" | "5prime";
  /** Cut offset from PAM on the sense strand (negative = upstream) */
  cutOffsetSense: number;
  /** Cut offset from PAM on the antisense strand */
  cutOffsetAntisense: number;
  /** Length of the guide sequence */
  guideLength: number;
}

/** A PAM site match found in a sequence */
export interface PamMatch {
  /** Position of the PAM in the input sequence (0-based) */
  pamPosition: number;
  /** Which strand the PAM was found on */
  strand: "+" | "-";
  /** The actual PAM sequence found */
  pamSequence: string;
  /** The guide sequence (e.g., 20-mer) */
  guideSequence: string;
  /** Extended context sequence for scoring (30-mer: 4bp + 20bp guide + 3bp PAM + 3bp) */
  contextSequence: string;
  /** Position where the DSB will occur (0-based in input) */
  cutPosition: number;
  /** GC content of the guide (0-1) */
  gcContent: number;
}

/** Scored guide RNA candidate */
export interface ScoredGuide extends PamMatch {
  /** Heuristic on-target score (0-1, higher is better) */
  heuristicScore: number;
  /** Azimuth/Rule Set 2 score if available */
  azimuthScore?: number;
  /** Combined score used for ranking */
  combinedScore: number;
  /** Breakdown of scoring features */
  scoreBreakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  gcScore: number;
  positionWeightScore: number;
  seedTmScore: number;
  selfCompScore: number;
  polyTScore: number;
}

/** Off-target hit for a guide */
export interface OffTargetHit {
  chromosome: string;
  position: number;
  strand: "+" | "-";
  mismatches: number;
  mismatchPositions: number[];
  alignedSequence: string;
  mitScore: number;
  cfdScore: number;
  geneContext?: string;
}

/** Primer pair for verification PCR */
export interface PrimerPair {
  forward: PrimerInfo;
  reverse: PrimerInfo;
  productSize: number;
}

export interface PrimerInfo {
  sequence: string;
  tm: number;
  gcPercent: number;
  position: number;
  length: number;
}

/** Options for primer design */
export interface PrimerDesignOptions {
  minProductSize: number;
  maxProductSize: number;
  optimalTm: number;
  tmTolerance: number;
  primerLengthRange: [number, number];
}

export const DEFAULT_PRIMER_OPTIONS: PrimerDesignOptions = {
  minProductSize: 300,
  maxProductSize: 800,
  optimalTm: 60,
  tmTolerance: 3,
  primerLengthRange: [18, 25],
};
