import type { CasProteinConfig } from "./types";
import { iupacToRegex, reverseComplement } from "./sequence";

function buildPamRegex(pamPattern: string): RegExp {
  return new RegExp(iupacToRegex(pamPattern), "gi");
}

function buildPamRegexRC(pamPattern: string): RegExp {
  const rc = reverseComplement(pamPattern);
  return new RegExp(iupacToRegex(rc), "gi");
}

/** All supported Cas proteins with their PAM and cutting parameters */
export const CAS_PROTEINS: CasProteinConfig[] = [
  {
    id: "spcas9",
    name: "SpCas9",
    pamSequence: "NGG",
    pamRegex: buildPamRegex("NGG"),
    pamRegexRC: buildPamRegexRC("NGG"),
    pamPosition: "3prime",
    cutOffsetSense: -3, // 3bp upstream of PAM
    cutOffsetAntisense: -3,
    guideLength: 20,
  },
  {
    id: "spcas9-hf1",
    name: "SpCas9-HF1",
    pamSequence: "NGG",
    pamRegex: buildPamRegex("NGG"),
    pamRegexRC: buildPamRegexRC("NGG"),
    pamPosition: "3prime",
    cutOffsetSense: -3,
    cutOffsetAntisense: -3,
    guideLength: 20,
  },
  {
    id: "espcas9",
    name: "eSpCas9(1.1)",
    pamSequence: "NGG",
    pamRegex: buildPamRegex("NGG"),
    pamRegexRC: buildPamRegexRC("NGG"),
    pamPosition: "3prime",
    cutOffsetSense: -3,
    cutOffsetAntisense: -3,
    guideLength: 20,
  },
  {
    id: "spcas9-ng",
    name: "SpCas9-NG",
    pamSequence: "NG",
    pamRegex: buildPamRegex("NG"),
    pamRegexRC: buildPamRegexRC("NG"),
    pamPosition: "3prime",
    cutOffsetSense: -3,
    cutOffsetAntisense: -3,
    guideLength: 20,
  },
  {
    id: "cas12a",
    name: "Cas12a (Cpf1)",
    pamSequence: "TTTV",
    pamRegex: buildPamRegex("TTTV"),
    pamRegexRC: buildPamRegexRC("TTTV"),
    pamPosition: "5prime",
    cutOffsetSense: 18, // Cuts 18bp downstream of PAM on sense
    cutOffsetAntisense: 23, // Cuts 23bp downstream on antisense (staggered)
    guideLength: 23,
  },
  {
    id: "cas12b",
    name: "Cas12b (C2c1)",
    pamSequence: "TTN",
    pamRegex: buildPamRegex("TTN"),
    pamRegexRC: buildPamRegexRC("TTN"),
    pamPosition: "5prime",
    cutOffsetSense: 17,
    cutOffsetAntisense: 23,
    guideLength: 20,
  },
];

export function getCasProteinById(id: string): CasProteinConfig | undefined {
  return CAS_PROTEINS.find((cp) => cp.id === id);
}

export function getCasProteinByName(name: string): CasProteinConfig | undefined {
  return CAS_PROTEINS.find(
    (cp) => cp.name.toLowerCase() === name.toLowerCase()
  );
}
