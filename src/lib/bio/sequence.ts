/**
 * Core DNA sequence utilities
 */

const COMPLEMENT_MAP: Record<string, string> = {
  A: "T",
  T: "A",
  G: "C",
  C: "G",
  R: "Y",
  Y: "R",
  S: "S",
  W: "W",
  K: "M",
  M: "K",
  B: "V",
  V: "B",
  D: "H",
  H: "D",
  N: "N",
  a: "t",
  t: "a",
  g: "c",
  c: "g",
};

/** IUPAC ambiguity code expansion */
const IUPAC_MAP: Record<string, string[]> = {
  A: ["A"],
  T: ["T"],
  G: ["G"],
  C: ["C"],
  R: ["A", "G"],
  Y: ["C", "T"],
  S: ["G", "C"],
  W: ["A", "T"],
  K: ["G", "T"],
  M: ["A", "C"],
  B: ["C", "G", "T"],
  D: ["A", "G", "T"],
  H: ["A", "C", "T"],
  V: ["A", "C", "G"],
  N: ["A", "C", "G", "T"],
};

/** Get the complement of a single nucleotide */
export function complement(base: string): string {
  return COMPLEMENT_MAP[base] ?? base;
}

/** Get the reverse complement of a DNA sequence */
export function reverseComplement(seq: string): string {
  return seq.split("").reverse().map(complement).join("");
}

/** Calculate GC content as a fraction (0-1) */
export function gcContent(seq: string): number {
  const upper = seq.toUpperCase();
  let gc = 0;
  let total = 0;
  for (const base of upper) {
    if ("ATGC".includes(base)) {
      total++;
      if (base === "G" || base === "C") gc++;
    }
  }
  return total === 0 ? 0 : gc / total;
}

/** Check if a sequence contains only valid DNA characters (IUPAC) */
export function isValidDNA(seq: string): boolean {
  return /^[ATGCRYSWKMBDHVNatgcryswkmbdhvn]+$/.test(seq);
}

/** Clean and normalize a DNA sequence (remove whitespace, numbers, FASTA headers) */
export function cleanSequence(input: string): string {
  const lines = input.split("\n");
  const seqLines = lines.filter((l) => !l.startsWith(">"));
  return seqLines.join("").replace(/[\s\d]/g, "").toUpperCase();
}

/**
 * Convert an IUPAC pattern to a regex string
 * e.g., "NGG" -> "[ACGT]GG"
 */
export function iupacToRegex(pattern: string): string {
  return pattern
    .toUpperCase()
    .split("")
    .map((char) => {
      const bases = IUPAC_MAP[char];
      if (!bases) return char;
      if (bases.length === 1) return bases[0];
      return `[${bases.join("")}]`;
    })
    .join("");
}

/** Check if base `actual` matches IUPAC code `pattern` */
export function iupacMatch(pattern: string, actual: string): boolean {
  const bases = IUPAC_MAP[pattern.toUpperCase()];
  if (!bases) return false;
  return bases.includes(actual.toUpperCase());
}

/** Find the longest poly-T stretch in a sequence */
export function longestPolyT(seq: string): number {
  let max = 0;
  let current = 0;
  for (const base of seq.toUpperCase()) {
    if (base === "T") {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

/** Check for self-complementarity (potential hairpin/dimer formation) */
export function selfComplementarityScore(seq: string): number {
  const upper = seq.toUpperCase();
  const rc = reverseComplement(upper);
  const len = upper.length;
  let maxRun = 0;

  // Slide the sequence against its reverse complement
  for (let offset = 0; offset < len; offset++) {
    let run = 0;
    for (let i = 0; i + offset < len; i++) {
      if (upper[i] === rc[i + offset]) {
        run++;
        if (run > maxRun) maxRun = run;
      } else {
        run = 0;
      }
    }
  }

  // Normalize: a run of 4+ bases is concerning
  return Math.min(maxRun / 8, 1);
}
