import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────
export const strandEnum = pgEnum("strand", ["+", "-"]);
export const pamPositionEnum = pgEnum("pam_position", ["3prime", "5prime"]);
export const experimentStatusEnum = pgEnum("experiment_status", [
  "planned",
  "active",
  "completed",
  "archived",
]);
export const visibilityEnum = pgEnum("visibility", [
  "private",
  "unlisted",
  "public",
]);
export const genotypingMethodEnum = pgEnum("genotyping_method", [
  "pcr",
  "t7ei",
  "sanger",
  "ngs",
]);
export const editTypeEnum = pgEnum("edit_type", [
  "knockout",
  "insertion",
  "deletion",
  "substitution",
]);
export const zygosityEnum = pgEnum("zygosity", [
  "homozygous",
  "heterozygous",
  "biallelic",
  "chimeric",
  "wild_type",
]);

// ── Species & Genomes ──────────────────────────────────
export const species = pgTable("species", {
  id: serial("id").primaryKey(),
  commonName: text("common_name").notNull(),
  scientificName: text("scientific_name").notNull(),
  ensemblName: text("ensembl_name"),
  ncbiTaxonId: integer("ncbi_taxon_id"),
  genomeVersion: text("genome_version"),
  genomeSizeMb: real("genome_size_mb"),
  difficultyRating: text("difficulty_rating"), // easy, medium, hard
  recommendedMethods: text("recommended_methods"), // JSON array
  isPreIndexed: boolean("is_pre_indexed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Cas Proteins ───────────────────────────────────────
export const casProteins = pgTable("cas_proteins", {
  id: serial("id").primaryKey(),
  casId: text("cas_id").notNull().unique(), // e.g., "spcas9"
  name: text("name").notNull(),
  pamSequence: text("pam_sequence").notNull(),
  pamPosition: pamPositionEnum("pam_position").notNull(),
  cutOffsetSense: integer("cut_offset_sense").notNull(),
  cutOffsetAntisense: integer("cut_offset_antisense").notNull(),
  guideLength: integer("guide_length").notNull(),
  notes: text("notes"),
});

// ── sgRNA Design Sessions ──────────────────────────────
export const designSessions = pgTable("design_sessions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  speciesId: integer("species_id").references(() => species.id),
  casProteinId: integer("cas_protein_id").references(() => casProteins.id),
  targetGene: text("target_gene"),
  inputSequence: text("input_sequence").notNull(),
  sequenceSource: text("sequence_source"), // "manual" | "ensembl" | "ncbi"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// ── Candidate sgRNAs ───────────────────────────────────
export const candidateGuides = pgTable("candidate_guides", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .references(() => designSessions.id)
    .notNull(),
  sequence: text("sequence").notNull(),
  pamSite: text("pam_site").notNull(),
  strand: strandEnum("strand").notNull(),
  positionInInput: integer("position_in_input").notNull(),
  gcContent: real("gc_content").notNull(),
  onTargetScore: real("on_target_score"),
  offTargetScore: real("off_target_score"),
  offTargetCount: integer("off_target_count"),
  contextSequence: text("context_sequence"),
  cutPosition: integer("cut_position"),
  isSelected: boolean("is_selected").default(false),
});

// ── Off-target Hits ────────────────────────────────────
export const offTargetHits = pgTable("off_target_hits", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id")
    .references(() => candidateGuides.id)
    .notNull(),
  chromosome: text("chromosome"),
  position: integer("position"),
  strand: strandEnum("strand"),
  mismatches: integer("mismatches").notNull(),
  mismatchPositions: text("mismatch_positions"), // JSON array
  alignedSequence: text("aligned_sequence"),
  score: real("score"),
  geneContext: text("gene_context"),
});

// ── Primer Pairs ───────────────────────────────────────
export const primerPairs = pgTable("primer_pairs", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id")
    .references(() => candidateGuides.id)
    .notNull(),
  forwardSequence: text("forward_sequence").notNull(),
  reverseSequence: text("reverse_sequence").notNull(),
  forwardTm: real("forward_tm"),
  reverseTm: real("reverse_tm"),
  productSize: integer("product_size"),
  forwardPosition: integer("forward_position"),
  reversePosition: integer("reverse_position"),
});

// ── Experiments ────────────────────────────────────────
export const experiments = pgTable("experiments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id"),
  speciesId: integer("species_id").references(() => species.id),
  targetGene: text("target_gene").notNull(),
  guideId: integer("guide_id").references(() => candidateGuides.id),
  guideSequenceManual: text("guide_sequence_manual"),
  deliveryMethod: text("delivery_method"),
  generation: text("generation").default("T0"),
  parentExperimentId: integer("parent_experiment_id"),
  status: experimentStatusEnum("status").default("planned"),
  visibility: visibilityEnum("visibility").default("private"),
  startDate: timestamp("start_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// ── Phenotype Observations ─────────────────────────────
export const phenotypeObservations = pgTable("phenotype_observations", {
  id: serial("id").primaryKey(),
  experimentId: integer("experiment_id")
    .references(() => experiments.id)
    .notNull(),
  observationDate: timestamp("observation_date").notNull(),
  traitName: text("trait_name").notNull(),
  traitValue: text("trait_value"),
  quantitativeValue: real("quantitative_value"),
  unit: text("unit"),
  photoPath: text("photo_path"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Genotyping Results ─────────────────────────────────
export const genotypingResults = pgTable("genotyping_results", {
  id: serial("id").primaryKey(),
  experimentId: integer("experiment_id")
    .references(() => experiments.id)
    .notNull(),
  method: genotypingMethodEnum("method").notNull(),
  resultDate: timestamp("result_date"),
  editDetected: boolean("edit_detected"),
  editType: editTypeEnum("edit_type"),
  editDescription: text("edit_description"),
  alleleSummary: text("allele_summary"),
  zygosity: zygosityEnum("zygosity"),
  sequenceData: text("sequence_data"),
  gelImagePath: text("gel_image_path"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Crop Profiles ──────────────────────────────────────
export const cropProfiles = pgTable("crop_profiles", {
  id: serial("id").primaryKey(),
  speciesId: integer("species_id")
    .references(() => species.id)
    .notNull(),
  targetGenesJson: text("target_genes_json"), // JSON array of known target genes
  growthConditionsJson: text("growth_conditions_json"), // temp, light, media
  timelineWeeks: integer("timeline_weeks"), // Typical T0 to T1 timeline
  mediaRecipesJson: text("media_recipes_json"), // Species-specific media
  regulatoryNotes: text("regulatory_notes"),
});

// ── Published Studies ──────────────────────────────────
export const publishedStudies = pgTable("published_studies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors"),
  journal: text("journal"),
  year: integer("year"),
  doi: text("doi"),
  pmid: text("pmid"),
  speciesId: integer("species_id").references(() => species.id),
  targetGene: text("target_gene"),
  editType: text("edit_type"),
  casProtein: text("cas_protein"),
  deliveryMethod: text("delivery_method"),
  summary: text("summary"),
  url: text("url"),
});

// ── Gene Cache ─────────────────────────────────────────
export const geneCache = pgTable("gene_cache", {
  id: serial("id").primaryKey(),
  speciesId: integer("species_id").references(() => species.id),
  geneId: text("gene_id").notNull(),
  geneName: text("gene_name"),
  chromosome: text("chromosome"),
  startPosition: integer("start_position"),
  endPosition: integer("end_position"),
  strand: text("strand"),
  description: text("description"),
  biotype: text("biotype"),
  exonsJson: text("exons_json"),
  sequenceDna: text("sequence_dna"),
  sequenceCds: text("sequence_cds"),
  fetchedAt: timestamp("fetched_at").defaultNow(),
});
