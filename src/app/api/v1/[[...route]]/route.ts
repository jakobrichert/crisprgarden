import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { findPamSites } from "@/lib/bio/pam";
import { scoreAndRankGuides } from "@/lib/bio/scoring";
import { designVerificationPrimers } from "@/lib/bio/primers";
import { cleanSequence, isValidDNA } from "@/lib/bio/sequence";
import { getCasProteinById, CAS_PROTEINS } from "@/lib/bio/cas-proteins";
import { findLocalOffTargets, calcSpecificityScore } from "@/lib/bio/offtarget";

const app = new Hono().basePath("/api/v1");

// ── Health ─────────────────────────────────────────────
app.get("/health", (c) => c.json({ status: "ok", version: "0.1.0" }));

// ── Cas Proteins ───────────────────────────────────────
app.get("/cas-proteins", (c) => {
  return c.json(
    CAS_PROTEINS.map((cp) => ({
      id: cp.id,
      name: cp.name,
      pamSequence: cp.pamSequence,
      pamPosition: cp.pamPosition,
      guideLength: cp.guideLength,
    }))
  );
});

// ── sgRNA Design ───────────────────────────────────────
const designSchema = z.object({
  sequence: z.string().min(30, "Sequence must be at least 30bp"),
  casProteinId: z.string().default("spcas9"),
  maxResults: z.number().int().min(1).max(200).default(50),
});

app.post("/sgrna/design", async (c) => {
  const body = await c.req.json();
  const result = designSchema.safeParse(body);

  if (!result.success) {
    return c.json({ error: result.error.flatten() }, 400);
  }

  const { sequence: rawSequence, casProteinId, maxResults } = result.data;

  // Clean and validate sequence
  const sequence = cleanSequence(rawSequence);
  if (!isValidDNA(sequence)) {
    return c.json({ error: "Invalid DNA sequence. Use IUPAC nucleotide codes." }, 400);
  }

  // Get Cas protein config
  const casProtein = getCasProteinById(casProteinId);
  if (!casProtein) {
    return c.json(
      { error: `Unknown Cas protein: ${casProteinId}` },
      400
    );
  }

  // Find PAM sites
  const pamMatches = findPamSites(sequence, casProtein);

  if (pamMatches.length === 0) {
    return c.json({
      guides: [],
      summary: {
        totalPamSites: 0,
        casProtein: casProtein.name,
        pamSequence: casProtein.pamSequence,
        sequenceLength: sequence.length,
      },
    });
  }

  // Score and rank guides
  const scoredGuides = scoreAndRankGuides(pamMatches).slice(0, maxResults);

  return c.json({
    guides: scoredGuides.map((g, i) => ({
      rank: i + 1,
      guideSequence: g.guideSequence,
      pamSequence: g.pamSequence,
      strand: g.strand,
      position: g.pamPosition,
      cutPosition: g.cutPosition,
      gcContent: Math.round(g.gcContent * 100),
      heuristicScore: g.heuristicScore,
      combinedScore: g.combinedScore,
      contextSequence: g.contextSequence,
      scoreBreakdown: g.scoreBreakdown,
    })),
    summary: {
      totalPamSites: pamMatches.length,
      returnedGuides: scoredGuides.length,
      casProtein: casProtein.name,
      pamSequence: casProtein.pamSequence,
      sequenceLength: sequence.length,
    },
  });
});

// ── Primer Design ──────────────────────────────────────
const primerSchema = z.object({
  sequence: z.string().min(100, "Need at least 100bp for primer design"),
  cutPosition: z.number().int().min(0),
  minProductSize: z.number().int().min(100).max(2000).default(300),
  maxProductSize: z.number().int().min(200).max(3000).default(800),
});

app.post("/sgrna/primers", async (c) => {
  const body = await c.req.json();
  const result = primerSchema.safeParse(body);

  if (!result.success) {
    return c.json({ error: result.error.flatten() }, 400);
  }

  const { sequence: rawSequence, cutPosition, minProductSize, maxProductSize } =
    result.data;
  const sequence = cleanSequence(rawSequence);

  if (!isValidDNA(sequence)) {
    return c.json({ error: "Invalid DNA sequence." }, 400);
  }

  if (cutPosition >= sequence.length) {
    return c.json({ error: "Cut position is beyond sequence length." }, 400);
  }

  const primers = designVerificationPrimers(sequence, cutPosition, {
    minProductSize,
    maxProductSize,
  });

  return c.json({
    primers: primers.map((p, i) => ({
      rank: i + 1,
      forward: p.forward,
      reverse: p.reverse,
      productSize: p.productSize,
    })),
    cutPosition,
    sequenceLength: sequence.length,
  });
});

// ── Off-Target Analysis ──────────────────────────────────
const offTargetSchema = z.object({
  guideSequence: z.string().length(20, "Guide must be exactly 20bp"),
  fullSequence: z.string().min(30, "Need sequence context for off-target scanning"),
  maxMismatches: z.number().int().min(1).max(5).default(4),
  onTargetPosition: z.number().int().optional(),
});

app.post("/sgrna/offtargets", async (c) => {
  const body = await c.req.json();
  const result = offTargetSchema.safeParse(body);

  if (!result.success) {
    return c.json({ error: result.error.flatten() }, 400);
  }

  const { guideSequence, fullSequence, maxMismatches, onTargetPosition } = result.data;

  const cleanedSeq = cleanSequence(fullSequence);
  if (!isValidDNA(cleanedSeq)) {
    return c.json({ error: "Invalid DNA sequence." }, 400);
  }

  const offTargets = findLocalOffTargets(
    guideSequence,
    cleanedSeq,
    maxMismatches,
    onTargetPosition
  );

  const specificityScore = calcSpecificityScore(
    offTargets.map((ot) => ot.mitScore)
  );

  return c.json({
    offTargets: offTargets.map((ot) => ({
      position: ot.position,
      strand: ot.strand,
      sequence: ot.sequence,
      pam: ot.pam,
      mismatches: ot.mismatches,
      mismatchPositions: ot.mismatchPositions,
      mitScore: Math.round(ot.mitScore * 1000) / 1000,
      cfdScore: Math.round(ot.cfdScore * 1000) / 1000,
    })),
    summary: {
      totalOffTargets: offTargets.length,
      specificityScore,
      byMismatchCount: Array.from({ length: maxMismatches }, (_, i) => ({
        mismatches: i + 1,
        count: offTargets.filter((ot) => ot.mismatches === i + 1).length,
      })),
    },
  });
});

// ── Genome Search (Ensembl Plants proxy) ───────────────
app.get("/genome/search", async (c) => {
  const species = c.req.query("species") || "arabidopsis_thaliana";
  const query = c.req.query("query");

  if (!query) {
    return c.json({ error: "Query parameter is required" }, 400);
  }

  try {
    // First try lookup by symbol
    const lookupUrl = `https://rest.ensembl.org/lookup/symbol/${species}/${query}?expand=1`;
    const lookupRes = await fetch(lookupUrl, {
      headers: { "Content-Type": "application/json" },
    });

    if (lookupRes.ok) {
      const gene = await lookupRes.json();
      return c.json({
        results: [
          {
            id: gene.id,
            display_name: gene.display_name || query,
            description: gene.description || "",
            species: gene.species || species,
            biotype: gene.biotype || "gene",
            location: `${gene.seq_region_name}:${gene.start}-${gene.end}`,
          },
        ],
      });
    }

    // If symbol lookup fails, try xrefs search
    const searchUrl = `https://rest.ensembl.org/xrefs/symbol/${species}/${query}?external_db=`;
    const searchRes = await fetch(searchUrl, {
      headers: { "Content-Type": "application/json" },
    });

    if (searchRes.ok) {
      const xrefs = await searchRes.json();
      if (Array.isArray(xrefs) && xrefs.length > 0) {
        // Get details for each xref
        const results = [];
        for (const xref of xrefs.slice(0, 10)) {
          try {
            const detailRes = await fetch(
              `https://rest.ensembl.org/lookup/id/${xref.id}?expand=0`,
              { headers: { "Content-Type": "application/json" } }
            );
            if (detailRes.ok) {
              const detail = await detailRes.json();
              results.push({
                id: detail.id,
                display_name: detail.display_name || xref.id,
                description: detail.description || "",
                species: detail.species || species,
                biotype: detail.biotype || "gene",
                location: `${detail.seq_region_name}:${detail.start}-${detail.end}`,
              });
            }
          } catch {
            // Skip failed lookups
          }
        }
        if (results.length > 0) {
          return c.json({ results });
        }
      }
    }

    // Try direct ID lookup (e.g., AT4G14210 or Solyc03g123760)
    const idRes = await fetch(
      `https://rest.ensembl.org/lookup/id/${query}?expand=0`,
      { headers: { "Content-Type": "application/json" } }
    );

    if (idRes.ok) {
      const gene = await idRes.json();
      return c.json({
        results: [
          {
            id: gene.id,
            display_name: gene.display_name || query,
            description: gene.description || "",
            species: gene.species || species,
            biotype: gene.biotype || "gene",
            location: `${gene.seq_region_name}:${gene.start}-${gene.end}`,
          },
        ],
      });
    }

    return c.json({ results: [] });
  } catch (err) {
    return c.json(
      { error: "Failed to search Ensembl. Check your connection." },
      500
    );
  }
});

// ── Genome Sequence Fetch ──────────────────────────────
app.get("/genome/sequence", async (c) => {
  const id = c.req.query("id");
  const type = c.req.query("type") || "cds"; // "genomic", "cds", "cdna"

  if (!id) {
    return c.json({ error: "Gene ID is required" }, 400);
  }

  try {
    const url = `https://rest.ensembl.org/sequence/id/${id}?type=${type}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      // If CDS fails, try genomic
      if (type === "cds") {
        const fallbackRes = await fetch(
          `https://rest.ensembl.org/sequence/id/${id}?type=genomic`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          return c.json({
            sequence: data.seq,
            type: "genomic",
            id: data.id,
            description: data.desc,
          });
        }
      }
      return c.json({ error: `Could not fetch sequence for ${id}` }, 404);
    }

    const data = await res.json();
    return c.json({
      sequence: data.seq,
      type,
      id: data.id,
      description: data.desc,
    });
  } catch {
    return c.json({ error: "Failed to fetch sequence from Ensembl" }, 500);
  }
});

// ── Species List ───────────────────────────────────────
app.get("/species", async (c) => {
  // For now, return static list. Will query DB when PostgreSQL is set up.
  const speciesList = [
    { id: 1, commonName: "Arabidopsis", scientificName: "Arabidopsis thaliana", difficultyRating: "easy" },
    { id: 2, commonName: "Rice", scientificName: "Oryza sativa", difficultyRating: "medium" },
    { id: 3, commonName: "Tomato", scientificName: "Solanum lycopersicum", difficultyRating: "medium" },
    { id: 4, commonName: "Wheat", scientificName: "Triticum aestivum", difficultyRating: "hard" },
    { id: 5, commonName: "Maize", scientificName: "Zea mays", difficultyRating: "hard" },
    { id: 6, commonName: "Tobacco", scientificName: "Nicotiana tabacum", difficultyRating: "easy" },
    { id: 7, commonName: "Lettuce", scientificName: "Lactuca sativa", difficultyRating: "easy" },
    { id: 8, commonName: "Potato", scientificName: "Solanum tuberosum", difficultyRating: "medium" },
    { id: 9, commonName: "Soybean", scientificName: "Glycine max", difficultyRating: "hard" },
    { id: 10, commonName: "Pepper", scientificName: "Capsicum annuum", difficultyRating: "medium" },
  ];
  return c.json(speciesList);
});

// Export handlers for Next.js
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
