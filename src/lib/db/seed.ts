/**
 * Database seed script
 * Populates initial species and Cas protein data
 * Run with: npx tsx src/lib/db/seed.ts
 */

import { db, schema } from "./index";

async function seed() {
  console.log("Seeding database...");

  // ── Cas Proteins ───────────────────────────────────
  await db.insert(schema.casProteins).values([
    {
      casId: "spcas9",
      name: "SpCas9",
      pamSequence: "NGG",
      pamPosition: "3prime",
      cutOffsetSense: -3,
      cutOffsetAntisense: -3,
      guideLength: 20,
      notes: "Most widely used. From Streptococcus pyogenes.",
    },
    {
      casId: "spcas9-hf1",
      name: "SpCas9-HF1",
      pamSequence: "NGG",
      pamPosition: "3prime",
      cutOffsetSense: -3,
      cutOffsetAntisense: -3,
      guideLength: 20,
      notes:
        "High-fidelity variant with reduced off-target activity. Same PAM as SpCas9.",
    },
    {
      casId: "espcas9",
      name: "eSpCas9(1.1)",
      pamSequence: "NGG",
      pamPosition: "3prime",
      cutOffsetSense: -3,
      cutOffsetAntisense: -3,
      guideLength: 20,
      notes:
        "Enhanced specificity Cas9. Reduced off-target effects while maintaining on-target activity.",
    },
    {
      casId: "spcas9-ng",
      name: "SpCas9-NG",
      pamSequence: "NG",
      pamPosition: "3prime",
      cutOffsetSense: -3,
      cutOffsetAntisense: -3,
      guideLength: 20,
      notes:
        "Relaxed PAM variant recognizing NG. Broader targeting range but potentially more off-targets.",
    },
    {
      casId: "cas12a",
      name: "Cas12a (Cpf1)",
      pamSequence: "TTTV",
      pamPosition: "5prime",
      cutOffsetSense: 18,
      cutOffsetAntisense: 23,
      guideLength: 23,
      notes:
        "From Lachnospiraceae bacterium. 5' PAM, staggered cut. Does not require tracrRNA. Useful for AT-rich regions.",
    },
    {
      casId: "cas12b",
      name: "Cas12b (C2c1)",
      pamSequence: "TTN",
      pamPosition: "5prime",
      cutOffsetSense: 17,
      cutOffsetAntisense: 23,
      guideLength: 20,
      notes:
        "Smaller than SpCas9. Thermostable variants available. Good for compact delivery vectors.",
    },
  ]).onConflictDoNothing();

  // ── Species ────────────────────────────────────────
  await db.insert(schema.species).values([
    {
      commonName: "Arabidopsis",
      scientificName: "Arabidopsis thaliana",
      ensemblName: "arabidopsis_thaliana",
      ncbiTaxonId: 3702,
      genomeVersion: "TAIR10",
      genomeSizeMb: 135,
      difficultyRating: "easy",
      recommendedMethods: JSON.stringify(["agrobacterium", "protoplast"]),
    },
    {
      commonName: "Rice",
      scientificName: "Oryza sativa",
      ensemblName: "oryza_sativa",
      ncbiTaxonId: 4530,
      genomeVersion: "IRGSP-1.0",
      genomeSizeMb: 430,
      difficultyRating: "medium",
      recommendedMethods: JSON.stringify([
        "agrobacterium",
        "biolistic",
        "protoplast",
      ]),
    },
    {
      commonName: "Tomato",
      scientificName: "Solanum lycopersicum",
      ensemblName: "solanum_lycopersicum",
      ncbiTaxonId: 4081,
      genomeVersion: "SL3.0",
      genomeSizeMb: 900,
      difficultyRating: "medium",
      recommendedMethods: JSON.stringify(["agrobacterium"]),
    },
    {
      commonName: "Wheat",
      scientificName: "Triticum aestivum",
      ensemblName: "triticum_aestivum",
      ncbiTaxonId: 4565,
      genomeVersion: "IWGSC RefSeq v2.1",
      genomeSizeMb: 17000,
      difficultyRating: "hard",
      recommendedMethods: JSON.stringify(["biolistic", "agrobacterium"]),
    },
    {
      commonName: "Maize",
      scientificName: "Zea mays",
      ensemblName: "zea_mays",
      ncbiTaxonId: 4577,
      genomeVersion: "Zm-B73-REFERENCE-NAM-5.0",
      genomeSizeMb: 2300,
      difficultyRating: "hard",
      recommendedMethods: JSON.stringify(["agrobacterium", "biolistic"]),
    },
    {
      commonName: "Soybean",
      scientificName: "Glycine max",
      ensemblName: "glycine_max",
      ncbiTaxonId: 3847,
      genomeVersion: "Glycine_max_v4.0",
      genomeSizeMb: 1100,
      difficultyRating: "hard",
      recommendedMethods: JSON.stringify(["agrobacterium", "biolistic"]),
    },
    {
      commonName: "Tobacco",
      scientificName: "Nicotiana tabacum",
      ensemblName: "nicotiana_tabacum",
      ncbiTaxonId: 4097,
      genomeVersion: "Ntab-TN90",
      genomeSizeMb: 4500,
      difficultyRating: "easy",
      recommendedMethods: JSON.stringify(["agrobacterium"]),
    },
    {
      commonName: "Potato",
      scientificName: "Solanum tuberosum",
      ensemblName: "solanum_tuberosum",
      ncbiTaxonId: 4113,
      genomeVersion: "SolTub_3.0",
      genomeSizeMb: 840,
      difficultyRating: "medium",
      recommendedMethods: JSON.stringify(["agrobacterium", "protoplast"]),
    },
    {
      commonName: "Lettuce",
      scientificName: "Lactuca sativa",
      ensemblName: "lactuca_sativa",
      ncbiTaxonId: 4236,
      genomeVersion: "Lsat_Salinas_v7",
      genomeSizeMb: 2700,
      difficultyRating: "easy",
      recommendedMethods: JSON.stringify(["agrobacterium", "protoplast"]),
    },
    {
      commonName: "Pepper",
      scientificName: "Capsicum annuum",
      ensemblName: "capsicum_annuum",
      ncbiTaxonId: 4072,
      genomeVersion: "ASM512063v2",
      genomeSizeMb: 3000,
      difficultyRating: "medium",
      recommendedMethods: JSON.stringify(["agrobacterium"]),
    },
    {
      commonName: "Grape",
      scientificName: "Vitis vinifera",
      ensemblName: "vitis_vinifera",
      ncbiTaxonId: 29760,
      genomeVersion: "12X",
      genomeSizeMb: 500,
      difficultyRating: "hard",
      recommendedMethods: JSON.stringify(["agrobacterium"]),
    },
    {
      commonName: "Cotton",
      scientificName: "Gossypium hirsutum",
      ensemblName: "gossypium_hirsutum",
      ncbiTaxonId: 3635,
      genomeVersion: "UTX_HRLQ",
      genomeSizeMb: 2500,
      difficultyRating: "hard",
      recommendedMethods: JSON.stringify(["agrobacterium", "biolistic"]),
    },
    {
      commonName: "Barley",
      scientificName: "Hordeum vulgare",
      ensemblName: "hordeum_vulgare",
      ncbiTaxonId: 4513,
      genomeVersion: "MorexV3",
      genomeSizeMb: 5100,
      difficultyRating: "hard",
      recommendedMethods: JSON.stringify(["agrobacterium", "biolistic"]),
    },
    {
      commonName: "Sorghum",
      scientificName: "Sorghum bicolor",
      ensemblName: "sorghum_bicolor",
      ncbiTaxonId: 4558,
      genomeVersion: "Sorghum_bicolor_NCBIv3",
      genomeSizeMb: 730,
      difficultyRating: "medium",
      recommendedMethods: JSON.stringify(["agrobacterium", "biolistic"]),
    },
    {
      commonName: "Cassava",
      scientificName: "Manihot esculenta",
      ensemblName: "manihot_esculenta",
      ncbiTaxonId: 3983,
      genomeVersion: "Manihot_esculenta_v8",
      genomeSizeMb: 760,
      difficultyRating: "medium",
      recommendedMethods: JSON.stringify(["agrobacterium"]),
    },
  ]).onConflictDoNothing();

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
