/**
 * Melting temperature (Tm) calculation using the nearest-neighbor method
 * Based on SantaLucia 1998 unified parameters
 */

/** Nearest-neighbor enthalpy (kcal/mol) and entropy (cal/mol·K) parameters */
const NN_PARAMS: Record<string, { dH: number; dS: number }> = {
  AA: { dH: -7.9, dS: -22.2 },
  AT: { dH: -7.2, dS: -20.4 },
  AG: { dH: -7.8, dS: -21.0 },
  AC: { dH: -8.4, dS: -22.4 },
  TA: { dH: -7.2, dS: -21.3 },
  TT: { dH: -7.9, dS: -22.2 },
  TG: { dH: -8.5, dS: -22.7 },
  TC: { dH: -8.2, dS: -22.2 },
  GA: { dH: -8.2, dS: -22.2 },
  GT: { dH: -8.4, dS: -22.4 },
  GG: { dH: -8.0, dS: -19.9 },
  GC: { dH: -9.8, dS: -24.4 },
  CA: { dH: -8.5, dS: -22.7 },
  CT: { dH: -7.8, dS: -21.0 },
  CG: { dH: -10.6, dS: -27.2 },
  CC: { dH: -8.0, dS: -19.9 },
};

/** Initiation parameters */
const INIT_GC = { dH: 0.1, dS: -2.8 };
const INIT_AT = { dH: 2.3, dS: 4.1 };

/**
 * Calculate melting temperature using the nearest-neighbor method
 * @param seq - DNA sequence (sense strand, 5' to 3')
 * @param primerConc - Primer concentration in M (default 250nM)
 * @param saltConc - Monovalent salt concentration in M (default 50mM)
 * @returns Temperature in degrees Celsius
 */
export function calculateTm(
  seq: string,
  primerConc: number = 250e-9,
  saltConc: number = 50e-3
): number {
  const upper = seq.toUpperCase();

  if (upper.length < 2) return 0;

  // For very short oligos (< 14 bp), use basic formula
  if (upper.length < 14) {
    return basicTm(upper);
  }

  let totalDH = 0;
  let totalDS = 0;

  // Initiation parameters based on terminal bases
  const firstBase = upper[0];
  const lastBase = upper[upper.length - 1];

  if (firstBase === "G" || firstBase === "C") {
    totalDH += INIT_GC.dH;
    totalDS += INIT_GC.dS;
  } else {
    totalDH += INIT_AT.dH;
    totalDS += INIT_AT.dS;
  }

  if (lastBase === "G" || lastBase === "C") {
    totalDH += INIT_GC.dH;
    totalDS += INIT_GC.dS;
  } else {
    totalDH += INIT_AT.dH;
    totalDS += INIT_AT.dS;
  }

  // Sum nearest-neighbor parameters
  for (let i = 0; i < upper.length - 1; i++) {
    const dinuc = upper[i] + upper[i + 1];
    const params = NN_PARAMS[dinuc];
    if (params) {
      totalDH += params.dH;
      totalDS += params.dS;
    }
  }

  // Convert entropy from cal to kcal
  const totalDS_kcal = totalDS / 1000;

  // Gas constant
  const R = 1.987e-3; // kcal/(mol·K)

  // Salt correction (Owczarzy et al. 2004 simplified)
  const saltCorrection = 16.6 * Math.log10(saltConc);

  // Tm calculation
  // For self-complementary: Tm = dH / (dS + R * ln(C))
  // For non-self-complementary: Tm = dH / (dS + R * ln(C/4))
  const tm =
    (totalDH * 1000) / (totalDS + R * 1000 * Math.log(primerConc / 4)) -
    273.15 +
    saltCorrection;

  return Math.round(tm * 10) / 10;
}

/** Basic Tm formula for short sequences (Wallace rule) */
function basicTm(seq: string): number {
  let at = 0;
  let gc = 0;
  for (const base of seq) {
    if (base === "A" || base === "T") at++;
    else if (base === "G" || base === "C") gc++;
  }
  return 2 * at + 4 * gc;
}

/**
 * Calculate Tm of the seed region (PAM-proximal 8-12 bases)
 * Used as a scoring feature for sgRNA design
 */
export function seedTm(guideSequence: string, seedLength: number = 8): number {
  // Seed region is the PAM-proximal end (last N bases for 3' PAM)
  const seed = guideSequence.slice(-seedLength);
  return calculateTm(seed);
}
