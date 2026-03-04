export interface ProtocolStep {
  title: string;
  instructions: string[];
  tips?: string[];
  warning?: string;
  duration?: string;
}

export interface Reagent {
  name: string;
  amount: string;
  supplier?: string;
  catalogNo?: string;
  notes?: string;
}

export interface Equipment {
  name: string;
  required: boolean;
  notes?: string;
}

export interface SpeciesNote {
  species: string;
  notes: string;
}

export interface Protocol {
  slug: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  time: string;
  description: string;
  overview: string;
  safetyNotes: string[];
  equipment: Equipment[];
  reagents: Reagent[];
  steps: ProtocolStep[];
  speciesNotes: SpeciesNote[];
  troubleshooting: { problem: string; solution: string }[];
  references: string[];
}

export const protocols: Protocol[] = [
  {
    slug: "dna-extraction",
    title: "DNA Extraction from Plant Tissue",
    category: "Preparation",
    difficulty: "Beginner",
    time: "2-3 hours",
    description:
      "Extract genomic DNA from fresh or frozen plant leaves using CTAB or commercial kits.",
    overview:
      "High-quality genomic DNA is essential for PCR screening of CRISPR edits. This protocol covers the CTAB (cetyltrimethylammonium bromide) method, which works reliably across most plant species. The CTAB method is cost-effective and handles the high polysaccharide and polyphenol content common in plant tissues.",
    safetyNotes: [
      "CTAB is an irritant — wear gloves and eye protection",
      "Chloroform is volatile and toxic — work in a fume hood",
      "Beta-mercaptoethanol is toxic — handle in fume hood only",
      "Isopropanol and ethanol are flammable — keep away from flames",
    ],
    equipment: [
      { name: "Microcentrifuge (≥13,000 rpm)", required: true },
      { name: "Heat block or water bath (65°C)", required: true },
      { name: "Fume hood", required: true },
      { name: "Mortar and pestle", required: true },
      { name: "1.5 mL microcentrifuge tubes", required: true },
      { name: "Micropipettes (P20, P200, P1000)", required: true },
      { name: "Liquid nitrogen", required: false, notes: "Recommended for fresh tissue grinding" },
      { name: "NanoDrop or spectrophotometer", required: false, notes: "For DNA quantification" },
    ],
    reagents: [
      { name: "CTAB extraction buffer", amount: "500 µL per sample", notes: "2% CTAB, 100 mM Tris-HCl pH 8.0, 20 mM EDTA, 1.4 M NaCl, 1% PVP" },
      { name: "Beta-mercaptoethanol", amount: "2 µL per 500 µL buffer", notes: "Add fresh before use" },
      { name: "Chloroform:isoamyl alcohol (24:1)", amount: "500 µL per extraction" },
      { name: "Isopropanol", amount: "500 µL per extraction", notes: "Ice-cold" },
      { name: "70% Ethanol", amount: "500 µL per wash" },
      { name: "RNase A (10 mg/mL)", amount: "2 µL per sample" },
      { name: "TE buffer (10 mM Tris, 1 mM EDTA, pH 8.0)", amount: "50 µL per sample" },
    ],
    steps: [
      {
        title: "Prepare extraction buffer",
        instructions: [
          "Prepare CTAB buffer: 2% (w/v) CTAB, 100 mM Tris-HCl pH 8.0, 20 mM EDTA, 1.4 M NaCl, 1% (w/v) PVP-40.",
          "Pre-warm buffer to 65°C in a water bath.",
          "Add beta-mercaptoethanol to 0.2% (v/v) just before use.",
        ],
        tips: [
          "CTAB buffer can be made in bulk and stored at room temperature (without beta-mercaptoethanol).",
          "PVP helps remove polyphenols — increase to 2% for polyphenol-rich species (grape, tea).",
        ],
      },
      {
        title: "Grind tissue",
        instructions: [
          "Collect 50-100 mg of fresh young leaf tissue (about 1 cm² piece).",
          "Flash-freeze in liquid nitrogen (if available) and grind to fine powder with mortar and pestle.",
          "If no liquid nitrogen: use a bead mill or grind fresh tissue directly with extraction buffer.",
          "Transfer powder to a 1.5 mL tube immediately.",
        ],
        tips: [
          "Young, actively growing leaves give the best yield and quality.",
          "Work quickly — do not let the frozen powder thaw before adding buffer.",
          "For small samples, use a micropestle directly in the tube.",
        ],
      },
      {
        title: "Lyse cells",
        instructions: [
          "Add 500 µL pre-warmed CTAB buffer to the ground tissue.",
          "Mix gently by inverting the tube 5-6 times.",
          "Incubate at 65°C for 30 minutes, mixing by inversion every 10 minutes.",
        ],
        duration: "30 minutes",
      },
      {
        title: "Chloroform extraction",
        instructions: [
          "Add 500 µL chloroform:isoamyl alcohol (24:1). Work in fume hood.",
          "Mix gently by inversion for 5 minutes. Do NOT vortex.",
          "Centrifuge at 13,000 rpm for 10 minutes at room temperature.",
          "Carefully transfer the upper aqueous phase (~400 µL) to a new tube.",
        ],
        warning: "Do not disturb the interface layer. Leave ~50 µL behind rather than risk contamination.",
        tips: [
          "If the aqueous phase is still cloudy, repeat the chloroform extraction.",
        ],
      },
      {
        title: "Precipitate DNA",
        instructions: [
          "Add 0.7 volumes (~280 µL) ice-cold isopropanol to the aqueous phase.",
          "Mix gently by inversion. You may see DNA strands precipitating.",
          "Incubate at -20°C for 20 minutes (or overnight for higher yield).",
          "Centrifuge at 13,000 rpm for 10 minutes at 4°C.",
          "Carefully decant supernatant — the pellet may be invisible.",
        ],
        duration: "30 minutes",
      },
      {
        title: "Wash and dry",
        instructions: [
          "Wash pellet with 500 µL ice-cold 70% ethanol.",
          "Centrifuge at 13,000 rpm for 5 minutes.",
          "Remove ethanol carefully with a pipette.",
          "Air-dry pellet for 5-10 minutes at room temperature.",
        ],
        warning: "Do not over-dry — DNA that is too dry is hard to resuspend.",
      },
      {
        title: "Resuspend and quantify",
        instructions: [
          "Resuspend pellet in 50 µL TE buffer.",
          "Add 2 µL RNase A (10 mg/mL) and incubate at 37°C for 15 minutes.",
          "Quantify DNA using NanoDrop: expect A260/A280 of 1.7-2.0 and A260/A230 > 1.5.",
          "Expected yield: 5-20 µg from 100 mg tissue.",
          "Store at -20°C for long-term storage.",
        ],
      },
    ],
    speciesNotes: [
      { species: "Tomato", notes: "Standard protocol works well. Use young leaves before flowering." },
      { species: "Rice", notes: "Increase CTAB to 3% and NaCl to 2 M for better results with monocot tissue." },
      { species: "Arabidopsis", notes: "Use rosette leaves. Very small tissue — collect multiple plants per extraction." },
      { species: "Wheat", notes: "Young flag leaves work best. Add extra PVP (2%) and use 3% CTAB." },
      { species: "Grape", notes: "Very high polyphenol content — add 5% PVP and consider additional chloroform extraction." },
      { species: "Lettuce", notes: "High water content — use more tissue (200 mg) and blot dry before grinding." },
    ],
    troubleshooting: [
      { problem: "Low yield", solution: "Use more tissue, extend lysis time to 45 min, or incubate isopropanol precipitation overnight at -20°C." },
      { problem: "Brown/degraded DNA", solution: "Tissue was oxidized. Use liquid nitrogen for grinding and add more PVP and beta-mercaptoethanol." },
      { problem: "Low A260/A280 ratio", solution: "Protein contamination. Repeat chloroform extraction step." },
      { problem: "Low A260/A230 ratio", solution: "Polysaccharide or salt contamination. Add an extra ethanol wash or do a second chloroform extraction." },
      { problem: "DNA doesn't dissolve", solution: "Over-dried pellet. Add more TE buffer and incubate at 55°C for 10 minutes." },
    ],
    references: [
      "Doyle, J.J. & Doyle, J.L. (1987) A rapid DNA isolation procedure for small quantities of fresh leaf tissue. Phytochemical Bulletin 19:11-15.",
      "Murray, M.G. & Thompson, W.F. (1980) Rapid isolation of high molecular weight plant DNA. Nucleic Acids Research 8(19):4321-4326.",
    ],
  },
  {
    slug: "sgrna-ivt",
    title: "sgRNA Synthesis (In Vitro Transcription)",
    category: "Guide RNA",
    difficulty: "Intermediate",
    time: "1 day",
    description:
      "Synthesize single guide RNA from a DNA template using T7 RNA polymerase.",
    overview:
      "In vitro transcribed (IVT) sgRNA is used for DNA-free editing via RNP delivery. You create a DNA template with the T7 promoter fused to your guide sequence and scaffold, then transcribe it with T7 RNA polymerase. The resulting sgRNA is purified and combined with Cas protein for direct delivery to plant cells.",
    safetyNotes: [
      "Work in an RNase-free environment — wear gloves at all times",
      "Use RNase-free water, tips, and tubes",
      "Keep reagents on ice to prevent RNA degradation",
    ],
    equipment: [
      { name: "Thermal cycler or heat block", required: true },
      { name: "Microcentrifuge", required: true },
      { name: "NanoDrop / spectrophotometer", required: true },
      { name: "Gel electrophoresis setup", required: false, notes: "To verify sgRNA integrity" },
      { name: "RNase-free tubes and tips", required: true },
    ],
    reagents: [
      { name: "T7 RNA Polymerase kit (e.g. HiScribe, MEGAscript)", amount: "1 reaction", supplier: "NEB / Thermo" },
      { name: "sgRNA DNA template oligos (2×)", amount: "10 µM each", notes: "Forward: T7 promoter + spacer; Reverse: scaffold complement" },
      { name: "dNTPs (for template assembly PCR)", amount: "10 mM each" },
      { name: "High-fidelity DNA polymerase", amount: "1 reaction", notes: "For template assembly" },
      { name: "DNase I (RNase-free)", amount: "2 units" },
      { name: "RNA cleanup kit or phenol:chloroform", amount: "Per kit instructions" },
      { name: "RNase-free water", amount: "As needed" },
    ],
    steps: [
      {
        title: "Design template oligos",
        instructions: [
          "Forward oligo: 5'-TAATACGACTCACTATA[20nt spacer]GTTTTAGAGCTAGAAATAGC-3'",
          "The T7 promoter (TAATACGACTCACTATA) must be followed by a G for efficient transcription.",
          "If your spacer does not start with G, add a G between the T7 promoter and spacer.",
          "Reverse oligo: 5'-AAAAGCACCGACTCGGTGCCACTTTTTCAAGTTGATAACGGACTAGCCTTATTTTAACTTGCTATTTCTAGCTCTAAAAC-3'",
          "This is the universal scaffold reverse complement.",
        ],
        tips: [
          "Order standard desalted oligos — PAGE purification not necessary.",
          "You can use the CRISPRgarden designer to get the 20nt spacer sequence.",
        ],
      },
      {
        title: "Assemble DNA template by overlap PCR",
        instructions: [
          "Mix: 10 µL 5× HF buffer, 1 µL dNTPs (10 mM), 2.5 µL forward oligo (10 µM), 2.5 µL reverse oligo (10 µM), 0.5 µL polymerase, water to 50 µL.",
          "PCR program: 98°C 30s → 35 cycles of (98°C 10s, 55°C 15s, 72°C 15s) → 72°C 2 min.",
          "Expected product: ~120 bp.",
          "Verify on 2% agarose gel (optional but recommended).",
          "Purify with PCR cleanup kit or use directly.",
        ],
        duration: "1.5 hours",
      },
      {
        title: "In vitro transcription",
        instructions: [
          "Set up IVT reaction according to kit instructions (typically at 37°C for 4-16 hours).",
          "Example (HiScribe T7): 2 µL 10× buffer, 2 µL each NTP (ATP, CTP, GTP, UTP), 1 µg template DNA, 2 µL T7 polymerase mix, water to 20 µL.",
          "Incubate at 37°C for 4 hours (minimum) to overnight for maximum yield.",
        ],
        tips: [
          "Overnight incubation at 37°C gives significantly higher yield.",
          "Do not exceed 16 hours to avoid degradation.",
        ],
        duration: "4-16 hours",
      },
      {
        title: "DNase treatment",
        instructions: [
          "Add 2 units DNase I (RNase-free grade) to the IVT reaction.",
          "Incubate at 37°C for 15 minutes.",
          "This removes the DNA template, leaving only sgRNA.",
        ],
        duration: "15 minutes",
      },
      {
        title: "Purify sgRNA",
        instructions: [
          "Option A: RNA cleanup column (e.g. Monarch RNA Cleanup Kit) — follow kit instructions.",
          "Option B: Phenol:chloroform extraction followed by ethanol precipitation.",
          "Option C: Lithium chloride precipitation — add equal volume 7.5 M LiCl, incubate -20°C 30 min, spin 15 min.",
          "Resuspend in RNase-free water.",
        ],
      },
      {
        title: "Quantify and verify",
        instructions: [
          "Measure concentration on NanoDrop (expect 50-200 µg from 20 µL reaction).",
          "A260/A280 should be ~2.0 for pure RNA.",
          "Optional: Run 1 µg on a denaturing gel or 2% agarose to check integrity (~100 nt band).",
          "Aliquot into single-use tubes (5 µg each) and store at -80°C.",
        ],
        tips: [
          "Avoid repeated freeze-thaw — RNA degrades quickly.",
          "Use within 6 months for best activity.",
        ],
      },
    ],
    speciesNotes: [
      { species: "All species", notes: "The sgRNA synthesis protocol is species-independent. The same sgRNA can be used for any delivery method." },
    ],
    troubleshooting: [
      { problem: "No or low RNA yield", solution: "Check template DNA quality and concentration. Ensure T7 promoter sequence is correct. Extend incubation time." },
      { problem: "Degraded RNA (smear on gel)", solution: "RNase contamination. Use fresh RNase-free reagents. Clean workspace with RNaseZap." },
      { problem: "Low editing efficiency with sgRNA", solution: "Check sgRNA integrity on gel. Use freshly thawed aliquot. Increase sgRNA:Cas9 molar ratio (3:1)." },
    ],
    references: [
      "Liang, Z. et al. (2017) Efficient DNA-free genome editing of bread wheat using CRISPR/Cas9 ribonucleoprotein complexes. Nature Communications 8:14261.",
    ],
  },
  {
    slug: "agrobacterium-transformation",
    title: "Agrobacterium-Mediated Transformation",
    category: "Delivery",
    difficulty: "Intermediate",
    time: "3-5 days (plus 6-12 weeks regeneration)",
    description:
      "Deliver CRISPR constructs via Agrobacterium tumefaciens. Works well for tomato, tobacco, Arabidopsis.",
    overview:
      "Agrobacterium-mediated transformation is the most widely used method for delivering CRISPR constructs to dicot plants. The binary vector containing Cas9 and sgRNA expression cassettes is introduced into Agrobacterium, which then transfers the T-DNA to plant cells. This method integrates the construct into the plant genome for stable expression.",
    safetyNotes: [
      "Agrobacterium is a BSL-1 organism — follow standard microbiological practices",
      "Autoclave all contaminated materials before disposal",
      "Work on a clean bench or laminar flow hood for sterile plant work",
      "Kanamycin and other antibiotics may cause allergic reactions — wear gloves",
    ],
    equipment: [
      { name: "Laminar flow hood", required: true },
      { name: "28°C incubator/shaker", required: true },
      { name: "Spectrophotometer (OD600)", required: true },
      { name: "Autoclave", required: true },
      { name: "Growth chamber or greenhouse", required: true },
      { name: "Sterile petri dishes and tools", required: true },
    ],
    reagents: [
      { name: "Agrobacterium strain (GV3101 or LBA4404)", amount: "Glycerol stock" },
      { name: "Binary vector with Cas9 + sgRNA", amount: "Verified construct" },
      { name: "LB media + antibiotics", amount: "100 mL culture", notes: "Rifampicin 25 µg/mL + vector antibiotics" },
      { name: "Acetosyringone (AS)", amount: "200 µM final", notes: "Vir gene inducer" },
      { name: "MS media + hormones", amount: "Varies by species" },
      { name: "Selection antibiotics", amount: "Species-specific", notes: "Typically kanamycin 50-100 µg/mL or hygromycin 25-50 µg/mL" },
      { name: "Cefotaxime or timentin", amount: "250-500 µg/mL", notes: "To eliminate Agrobacterium after co-cultivation" },
    ],
    steps: [
      {
        title: "Prepare Agrobacterium culture",
        instructions: [
          "Streak Agrobacterium containing your binary vector on LB + antibiotics plate.",
          "Grow at 28°C for 2 days.",
          "Pick single colony into 5 mL LB + antibiotics. Grow overnight at 28°C, 220 rpm.",
          "Subculture 1:100 into 50 mL LB + antibiotics. Grow to OD600 = 0.5-0.8 (about 4-6 hours).",
        ],
        duration: "2 days + overnight",
      },
      {
        title: "Prepare infection solution",
        instructions: [
          "Pellet bacteria at 4000 rpm for 10 minutes.",
          "Resuspend in liquid MS + 200 µM acetosyringone to OD600 = 0.3-0.5.",
          "Incubate at room temperature for 1-3 hours (Vir gene induction).",
        ],
        tips: [
          "Acetosyringone activates Agrobacterium virulence genes essential for T-DNA transfer.",
          "Do not exceed OD600 = 1.0 — over-growth causes tissue damage.",
        ],
      },
      {
        title: "Prepare plant explants",
        instructions: [
          "Surface-sterilize seeds or tissue with 70% ethanol (30s) then 1% sodium hypochlorite (10 min).",
          "Rinse 3× with sterile water.",
          "For tomato/tobacco: use leaf discs (0.5-1 cm²) from 3-4 week old in vitro plants.",
          "For Arabidopsis: use floral dip method (dip inflorescences directly into Agrobacterium suspension).",
          "Wound leaf edges slightly with a scalpel to improve transformation.",
        ],
      },
      {
        title: "Infection and co-cultivation",
        instructions: [
          "Submerge explants in Agrobacterium suspension for 10-20 minutes.",
          "Blot gently on sterile filter paper to remove excess bacteria.",
          "Place explants on co-cultivation medium (MS + 200 µM AS, no antibiotics).",
          "Co-cultivate at 22-25°C in the dark for 2-3 days.",
        ],
        warning: "Do not extend co-cultivation beyond 3 days — Agrobacterium overgrowth kills tissue.",
        duration: "2-3 days",
      },
      {
        title: "Selection and regeneration",
        instructions: [
          "Transfer explants to selection medium: MS + selection antibiotic + cefotaxime (to kill Agrobacterium).",
          "For tomato: MS + 2 mg/L zeatin + 0.1 mg/L IAA + 100 µg/mL kanamycin + 250 µg/mL cefotaxime.",
          "For tobacco: MS + 1 mg/L BAP + 0.1 mg/L NAA + 100 µg/mL kanamycin + 250 µg/mL cefotaxime.",
          "Transfer to fresh selection medium every 2 weeks.",
          "Shoots should appear in 3-6 weeks.",
          "Excise shoots and transfer to rooting medium (half-strength MS + selection antibiotic).",
        ],
        duration: "6-12 weeks",
      },
      {
        title: "Screen transformants",
        instructions: [
          "Extract DNA from regenerated plantlets (see DNA Extraction protocol).",
          "PCR screen for Cas9 and sgRNA presence.",
          "Screen for target gene edits using primers flanking the cut site.",
          "Confirm edits by Sanger sequencing.",
          "Expect 10-60% editing efficiency in PCR-positive transformants.",
        ],
      },
    ],
    speciesNotes: [
      { species: "Tomato", notes: "Use Micro-Tom for faster results (60 days seed-to-seed). Cotyledon explants from 8-day seedlings. Zeatin critical for shoot regeneration." },
      { species: "Tobacco", notes: "Easiest species for transformation. Leaf disc method with N. benthamiana gives results in 4 weeks." },
      { species: "Arabidopsis", notes: "Use floral dip method — no tissue culture needed! Dip inflorescences in OD600=0.8 suspension + 0.05% Silwet L-77. Screen T1 seeds on selection plates." },
      { species: "Potato", notes: "Internodal stem segments work best. Use 2 mg/L zeatin, 0.01 mg/L NAA, 0.1 mg/L GA3." },
      { species: "Lettuce", notes: "Cotyledon explants. Very responsive to BAP (1 mg/L). Selection with hygromycin often works better than kanamycin." },
    ],
    troubleshooting: [
      { problem: "No shoots regenerating", solution: "Check hormone concentrations. Reduce antibiotic selection pressure. Try different explant type or younger tissue." },
      { problem: "Agrobacterium overgrowth", solution: "Increase cefotaxime to 500 µg/mL. Reduce co-cultivation time. Blot explants more thoroughly." },
      { problem: "All shoots are escapes (not transformed)", solution: "Increase selection antibiotic. Verify vector antibiotic resistance gene. Use a reporter gene (GFP) to confirm." },
      { problem: "Low editing efficiency", solution: "Test multiple sgRNAs. Check Cas9 expression level. Consider constitutive vs. tissue-specific promoters." },
    ],
    references: [
      "Brooks, C. et al. (2014) Efficient gene editing in tomato in the first generation using the CRISPR/Cas9 system. Plant Physiology 166(3):1292-1297.",
      "Clough, S.J. & Bent, A.F. (1998) Floral dip: a simplified method for Agrobacterium-mediated transformation of Arabidopsis thaliana. Plant Journal 16(6):735-743.",
    ],
  },
  {
    slug: "protoplast-transformation",
    title: "PEG-Mediated Protoplast Transformation",
    category: "Delivery",
    difficulty: "Advanced",
    time: "1-2 days",
    description:
      "DNA-free editing using RNP delivery to protoplasts. No foreign DNA integration.",
    overview:
      "Protoplast transformation delivers pre-assembled Cas9-sgRNA ribonucleoprotein (RNP) complexes directly into plant cells whose cell walls have been enzymatically removed. This is the gold standard for DNA-free genome editing — no foreign DNA is integrated, which is important for regulatory acceptance. PEG (polyethylene glycol) creates transient membrane permeability for RNP uptake.",
    safetyNotes: [
      "Cellulase and macerozyme enzymes may cause allergic reactions",
      "PEG 4000 is an irritant — avoid skin contact",
      "Work in sterile conditions throughout",
    ],
    equipment: [
      { name: "Laminar flow hood", required: true },
      { name: "Orbital shaker (40-50 rpm)", required: true },
      { name: "Inverted microscope", required: true, notes: "To check protoplast quality" },
      { name: "Hemocytometer", required: true, notes: "To count protoplasts" },
      { name: "Nylon mesh filters (40-70 µm)", required: true },
      { name: "Round-bottom tubes or 6-well plates", required: true },
    ],
    reagents: [
      { name: "Cellulase R10", amount: "1.5% (w/v)", supplier: "Yakult" },
      { name: "Macerozyme R10", amount: "0.4% (w/v)", supplier: "Yakult" },
      { name: "Mannitol", amount: "0.4 M in enzyme solution" },
      { name: "CaCl₂", amount: "10 mM" },
      { name: "MES buffer pH 5.7", amount: "20 mM" },
      { name: "BSA", amount: "0.1% (w/v)" },
      { name: "PEG 4000", amount: "40% (w/v) solution" },
      { name: "W5 solution", amount: "As needed", notes: "154 mM NaCl, 125 mM CaCl₂, 5 mM KCl, 2 mM MES pH 5.7" },
      { name: "MMG solution", amount: "As needed", notes: "0.4 M mannitol, 15 mM MgCl₂, 4 mM MES pH 5.7" },
      { name: "Cas9 protein (SpCas9)", amount: "10-30 µg per reaction", supplier: "NEB / IDT" },
      { name: "Purified sgRNA", amount: "10-30 µg per reaction" },
    ],
    steps: [
      {
        title: "Prepare enzyme solution",
        instructions: [
          "Dissolve 1.5% Cellulase R10 and 0.4% Macerozyme R10 in enzyme buffer (0.4 M mannitol, 20 mM MES pH 5.7, 20 mM KCl).",
          "Heat to 55°C for 10 minutes to inactivate DNases/proteases, then cool to room temperature.",
          "Add CaCl₂ to 10 mM and BSA to 0.1%.",
          "Filter-sterilize (0.45 µm).",
        ],
        tips: [
          "Enzyme solution can be prepared in advance and stored at -20°C in aliquots.",
        ],
      },
      {
        title: "Isolate protoplasts",
        instructions: [
          "Cut 20-30 fresh, healthy leaves into 0.5-1 mm strips using a sharp razor blade.",
          "Submerge leaf strips in enzyme solution (10 mL per gram of tissue).",
          "Vacuum infiltrate for 30 minutes in the dark (optional but improves yield).",
          "Incubate at 25°C in the dark with gentle shaking (40 rpm) for 3-5 hours.",
          "Protoplasts should be visible as round, green cells under the microscope.",
        ],
        duration: "3-5 hours",
      },
      {
        title: "Filter and wash protoplasts",
        instructions: [
          "Filter through 40-70 µm nylon mesh into a round-bottom tube.",
          "Centrifuge at 100×g for 2 minutes. Discard supernatant.",
          "Resuspend gently in W5 solution. Let settle on ice for 30 minutes.",
          "Remove W5 and resuspend in MMG solution at 2×10⁵ cells/mL.",
          "Count with hemocytometer — expect 10⁵-10⁶ protoplasts per gram tissue.",
        ],
        warning: "Protoplasts are fragile — never vortex or pipette vigorously. Use cut pipette tips.",
        tips: [
          "Viability should be >80%. Check with FDA staining if available.",
        ],
      },
      {
        title: "Assemble RNP complex",
        instructions: [
          "Mix Cas9 protein (10-30 µg) with sgRNA (10-30 µg) at 1:3 molar ratio.",
          "Incubate at room temperature for 10 minutes.",
          "The RNP complex is now ready for transfection.",
        ],
        tips: [
          "A 1:3 Cas9:sgRNA molar ratio typically gives the best editing efficiency.",
          "Pre-assembled RNP is more stable than free sgRNA.",
        ],
      },
      {
        title: "PEG-mediated transfection",
        instructions: [
          "Add RNP complex to 200 µL protoplasts (4×10⁴ cells) in MMG solution.",
          "Add equal volume (200 µL) of PEG solution (40% PEG 4000, 0.2 M mannitol, 100 mM CaCl₂).",
          "Mix gently by tapping the tube. Incubate at room temperature for 15-20 minutes.",
          "Slowly add 800 µL W5 solution to dilute PEG.",
          "Centrifuge at 100×g for 2 minutes. Remove supernatant.",
          "Resuspend in 1 mL WI solution (0.5 M mannitol, 20 mM KCl, 4 mM MES pH 5.7).",
          "Culture at 25°C in the dark.",
        ],
        duration: "30 minutes",
      },
      {
        title: "Harvest and analyze",
        instructions: [
          "After 24-48 hours, collect protoplasts by gentle centrifugation.",
          "Extract DNA using a micro-scale extraction method.",
          "PCR-amplify the target region.",
          "Analyze edits by T7EI assay, Sanger sequencing, or amplicon deep sequencing.",
          "Expect 10-60% editing efficiency depending on the target and species.",
        ],
        tips: [
          "For plant regeneration from protoplasts: embed in alginate beads or culture in liquid regeneration medium.",
          "Regeneration from protoplasts is species-dependent and often the bottleneck.",
        ],
      },
    ],
    speciesNotes: [
      { species: "Lettuce", notes: "Excellent protoplast regeneration. Use young inner leaves. Editing efficiency 30-60%." },
      { species: "Tobacco", notes: "N. tabacum protoplasts regenerate easily via somatic embryogenesis." },
      { species: "Rice", notes: "Use stem cell-derived protoplasts from 2-week etiolated seedlings." },
      { species: "Arabidopsis", notes: "Use mesophyll protoplasts from 4-week rosettes. Good for transient assays but regeneration is difficult." },
      { species: "Tomato", notes: "Protoplast isolation is possible but regeneration is challenging. Agrobacterium is generally preferred." },
    ],
    troubleshooting: [
      { problem: "Low protoplast yield", solution: "Use younger leaves. Check enzyme activity (may be degraded). Extend digestion time. Optimize vacuum infiltration." },
      { problem: "Low viability (<50%)", solution: "Handle more gently. Check mannitol concentration (osmotic balance). Reduce centrifugation speed." },
      { problem: "Low editing efficiency", solution: "Increase RNP amount. Optimize PEG concentration (try 30-50%). Use more protoplasts. Verify sgRNA activity with in vitro cleavage assay." },
      { problem: "No plant regeneration", solution: "This is the hardest step. Optimize regeneration medium per species. Consider alginate bead culture. Try different genotypes." },
    ],
    references: [
      "Woo, J.W. et al. (2015) DNA-free genome editing in plants with preassembled CRISPR-Cas9 ribonucleoproteins. Nature Biotechnology 33:1162-1164.",
      "Yoo, S.D. et al. (2007) Arabidopsis mesophyll protoplasts: a versatile cell system for transient gene expression analysis. Nature Protocols 2:1565-1572.",
    ],
  },
  {
    slug: "pcr-screening",
    title: "PCR Screening for CRISPR Edits",
    category: "Screening",
    difficulty: "Beginner",
    time: "3-4 hours",
    description:
      "Design primers flanking the cut site and run PCR to detect insertions or deletions.",
    overview:
      "After regenerating transformed plants, PCR screening is the first step to identify which plants carry CRISPR-induced mutations. Primers flanking the Cas9 cut site amplify the target region, and differences in amplicon size or sequence reveal edits. This protocol covers primer design, PCR optimization, and basic gel analysis.",
    safetyNotes: [
      "Ethidium bromide is a mutagen — use SYBR Safe or GelRed as alternatives",
      "UV light from gel imagers can damage eyes — wear UV-blocking glasses",
    ],
    equipment: [
      { name: "Thermal cycler", required: true },
      { name: "Gel electrophoresis apparatus", required: true },
      { name: "UV gel imager or blue light transilluminator", required: true },
      { name: "Micropipettes", required: true },
    ],
    reagents: [
      { name: "Taq or high-fidelity DNA polymerase", amount: "Per reaction" },
      { name: "dNTPs (10 mM each)", amount: "0.5 µL per reaction" },
      { name: "Forward and reverse primers (10 µM)", amount: "1 µL each per reaction" },
      { name: "Template genomic DNA", amount: "50-100 ng per reaction" },
      { name: "Agarose", amount: "For 2% gel" },
      { name: "DNA stain (SYBR Safe)", amount: "Per gel" },
      { name: "DNA ladder (100 bp)", amount: "5 µL per gel" },
    ],
    steps: [
      {
        title: "Design screening primers",
        instructions: [
          "Design primers 150-300 bp upstream and downstream of the Cas9 cut site.",
          "Target amplicon size: 400-800 bp (small enough to detect indels on gel).",
          "Use the CRISPRgarden Primer Designer to auto-generate these primers.",
          "Primer Tm should be 58-62°C, 18-25 bp length, 40-60% GC content.",
          "BLAST primers against the genome to ensure specificity.",
        ],
        tips: [
          "For larger deletions, design additional primers further from the cut site (1-2 kb flanking).",
          "Include a positive control (wild-type DNA) in every experiment.",
        ],
      },
      {
        title: "Set up PCR reactions",
        instructions: [
          "Per 25 µL reaction: 12.5 µL 2× master mix (or: 2.5 µL 10× buffer, 0.5 µL dNTPs, 0.2 µL Taq)",
          "Add 1 µL forward primer (10 µM), 1 µL reverse primer (10 µM).",
          "Add 1 µL template DNA (50-100 ng).",
          "Add water to 25 µL.",
          "Include controls: wild-type DNA (positive), water (negative, no-template).",
        ],
      },
      {
        title: "Run PCR",
        instructions: [
          "PCR program: 95°C 3 min → 35 cycles of (95°C 30s, 58°C 30s, 72°C 45s) → 72°C 5 min → 4°C hold.",
          "Adjust annealing temperature if needed (start at Tm minus 5°C).",
          "For GC-rich targets, add 5% DMSO or use GC-enhancer from the polymerase kit.",
        ],
        duration: "1.5-2 hours",
      },
      {
        title: "Run gel electrophoresis",
        instructions: [
          "Prepare 2% agarose gel in 1× TAE or TBE buffer with DNA stain.",
          "Load 5 µL PCR product + 1 µL 6× loading dye per lane.",
          "Load 100 bp DNA ladder in the first lane.",
          "Run at 100V for 30-45 minutes.",
          "Image gel under UV or blue light.",
        ],
        duration: "45 minutes",
      },
      {
        title: "Interpret results",
        instructions: [
          "Wild-type band: single band at expected size.",
          "Homozygous deletion: single band smaller than wild-type.",
          "Heterozygous edit: two bands (wild-type + edited) or a shifted band.",
          "Large deletion: band significantly smaller or missing.",
          "No band: primer failure or very large deletion — redesign primers.",
          "For definitive results, send positive PCR products for Sanger sequencing.",
        ],
        tips: [
          "Small indels (1-10 bp) are hard to distinguish on gel. Use T7EI assay or sequencing.",
          "Heteroduplex bands (slower migration) may appear — these indicate heterozygous edits.",
        ],
      },
    ],
    speciesNotes: [
      { species: "All species", notes: "PCR screening is universal. Adjust annealing temperature based on primer Tm and species-specific genomic complexity." },
      { species: "Wheat", notes: "Hexaploid — design homeolog-specific primers to distinguish edits in A, B, D genomes." },
      { species: "Tomato", notes: "Standard conditions work well. Use Micro-Tom leaf tissue for quick DNA prep." },
    ],
    troubleshooting: [
      { problem: "No PCR product", solution: "Check DNA quality. Reduce annealing temperature by 2-3°C. Increase template DNA amount. Redesign primers." },
      { problem: "Multiple non-specific bands", solution: "Increase annealing temperature. Use touchdown PCR. Redesign primers for higher specificity." },
      { problem: "All samples look wild-type", solution: "Small indels not visible on gel. Proceed with T7EI assay or Sanger sequencing." },
      { problem: "Faint bands", solution: "Increase cycle number to 38-40. Use more template DNA. Check primer concentration." },
    ],
    references: [
      "Zhu, X. et al. (2020) Applications of CRISPR-Cas in agriculture and plant biotechnology. Nature Reviews Molecular Cell Biology 21:661-677.",
    ],
  },
  {
    slug: "t7-endonuclease-assay",
    title: "T7 Endonuclease I (T7EI) Assay",
    category: "Screening",
    difficulty: "Intermediate",
    time: "4-5 hours",
    description:
      "Detect heteroduplexes formed by CRISPR-induced mutations. Quick screening without sequencing.",
    overview:
      "The T7 Endonuclease I assay detects mismatches in heteroduplex DNA formed when wild-type and mutant alleles re-anneal after denaturation. T7EI cleaves at mismatches, producing two smaller fragments visible on a gel. This is faster and cheaper than sequencing for initial screening of many samples.",
    safetyNotes: [
      "Standard lab safety — gloves, lab coat",
      "Use SYBR Safe instead of ethidium bromide when possible",
    ],
    equipment: [
      { name: "Thermal cycler", required: true },
      { name: "Gel electrophoresis apparatus", required: true },
      { name: "Gel imager", required: true },
    ],
    reagents: [
      { name: "T7 Endonuclease I", amount: "5-10 units per reaction", supplier: "NEB (M0302)" },
      { name: "NEBuffer 2 (10×)", amount: "2 µL per reaction" },
      { name: "PCR product from target region", amount: "200-400 ng" },
      { name: "Agarose", amount: "For 2% gel" },
    ],
    steps: [
      {
        title: "Amplify target region",
        instructions: [
          "PCR-amplify the region flanking the Cas9 cut site (see PCR Screening protocol).",
          "Use high-fidelity polymerase to minimize PCR-introduced errors.",
          "Verify single band on gel before proceeding.",
          "Use 200-400 ng of purified PCR product per reaction.",
        ],
      },
      {
        title: "Denature and re-anneal",
        instructions: [
          "Mix 200-400 ng PCR product + 2 µL 10× NEBuffer 2 + water to 19 µL.",
          "Run the following program in a thermal cycler:",
          "95°C for 5 minutes (full denaturation).",
          "Ramp down to 85°C at -2°C/sec.",
          "Ramp down from 85°C to 25°C at -0.1°C/sec (slow re-annealing).",
          "Hold at 4°C.",
        ],
        tips: [
          "The slow ramp-down is critical — it allows heteroduplex formation between wild-type and mutant strands.",
          "If your cycler doesn't support ramp rate control, use 95°C 5 min → 95°C to 85°C (step -2°C every 1s) → 85°C to 25°C (step -0.1°C every 1s).",
        ],
        duration: "15 minutes",
      },
      {
        title: "T7EI digestion",
        instructions: [
          "Add 1 µL T7 Endonuclease I (10 units/µL) to the re-annealed product.",
          "Mix gently and incubate at 37°C for 15-30 minutes.",
          "Stop reaction by adding 1.5 µL 0.25 M EDTA.",
        ],
        duration: "15-30 minutes",
      },
      {
        title: "Analyze on gel",
        instructions: [
          "Run digested products on 2% agarose gel at 100V for 30-45 minutes.",
          "Include: undigested PCR product (control), T7EI-digested wild-type (negative control), T7EI-digested samples.",
          "Positive result: uncut band + two smaller cleavage bands whose sizes sum to the uncut band.",
          "Example: 600 bp amplicon with cut site at center → ~300 bp + ~300 bp cleavage products.",
        ],
      },
      {
        title: "Estimate editing efficiency",
        instructions: [
          "Measure band intensities using gel analysis software (ImageJ).",
          "Calculate: % editing = 100 × (1 - √(1 - fraction cleaved)).",
          "Fraction cleaved = (sum of cleavage band intensities) / (sum of all band intensities).",
          "Send positive samples for Sanger sequencing to determine exact edit.",
        ],
      },
    ],
    speciesNotes: [
      { species: "All species", notes: "T7EI assay works identically across species — only the PCR amplification step is species-dependent." },
    ],
    troubleshooting: [
      { problem: "No cleavage in any sample", solution: "Check T7EI enzyme activity with a known positive control. Ensure re-annealing program ran correctly." },
      { problem: "Cleavage in wild-type control", solution: "SNPs near the target may form heteroduplexes. Use inbred lines or sequence the WT control." },
      { problem: "Smeared cleavage products", solution: "Reduce T7EI amount or incubation time. Non-specific cleavage from star activity." },
      { problem: "False negatives", solution: "T7EI cannot detect homozygous edits (no heteroduplex forms). Mix sample DNA 1:1 with wild-type DNA before re-annealing." },
    ],
    references: [
      "Vouillot, L. et al. (2015) Comparison of T7E1 and Surveyor mismatch cleavage assays to detect mutations triggered by engineered nucleases. G3: Genes, Genomes, Genetics 5(3):407-415.",
    ],
  },
  {
    slug: "sanger-sequencing-analysis",
    title: "Sanger Sequencing Analysis",
    category: "Screening",
    difficulty: "Intermediate",
    time: "1-2 days (including sequencing turnaround)",
    description:
      "Confirm exact edit sequence using Sanger sequencing. Analyze with ICE or TIDE software.",
    overview:
      "Sanger sequencing provides the definitive confirmation of CRISPR-induced mutations. After PCR amplification of the target region, samples are sent for sequencing and the resulting chromatograms are analyzed to determine the exact nature and frequency of edits. Software tools like ICE (Synthego) and TIDE (Desktop Genetics) can deconvolute mixed chromatograms from heterozygous edits.",
    safetyNotes: [
      "Standard PCR lab safety",
    ],
    equipment: [
      { name: "Access to Sanger sequencing service", required: true, notes: "University core facility or commercial service (Genewiz, Eurofins, etc.)" },
      { name: "Computer with internet", required: true, notes: "For ICE/TIDE analysis" },
    ],
    reagents: [
      { name: "Purified PCR product", amount: "50-100 ng per sequencing reaction" },
      { name: "Sequencing primer (10 µM)", amount: "5 µL per reaction" },
      { name: "PCR cleanup kit", amount: "Per kit instructions" },
    ],
    steps: [
      {
        title: "Prepare PCR product",
        instructions: [
          "PCR-amplify the target region (400-800 bp spanning the cut site).",
          "The cut site should be 150-250 bp from the sequencing primer binding site.",
          "Clean up PCR product with a column kit (e.g., QIAquick) or ExoSAP-IT treatment.",
          "Quantify: need 50-100 ng total in 10-15 µL.",
        ],
      },
      {
        title: "Submit for sequencing",
        instructions: [
          "Send purified PCR product + sequencing primer to your sequencing provider.",
          "Use the forward PCR primer as the sequencing primer (simple and effective).",
          "Most services return results in 24-48 hours.",
          "Request .ab1 files (chromatograms) — you'll need these for analysis.",
        ],
        tips: [
          "Submit both forward and reverse sequencing for important samples.",
          "Include a wild-type control sample sequenced with the same primer.",
        ],
      },
      {
        title: "Analyze with ICE (recommended)",
        instructions: [
          "Go to ice.synthego.com (free online tool).",
          "Upload: edited sample .ab1 file + wild-type control .ab1 file.",
          "Enter the guide sequence (20 bp spacer, no PAM).",
          "ICE will deconvolute the chromatogram and report:",
          "- Editing efficiency (%)",
          "- Indel distribution (size and frequency of each allele)",
          "- Knockout score (% of edits causing frameshifts)",
          "- R² value (quality of deconvolution)",
        ],
        tips: [
          "R² > 0.9 indicates reliable results.",
          "ICE works best with clean, high-quality chromatograms.",
        ],
      },
      {
        title: "Alternative: TIDE analysis",
        instructions: [
          "Go to tide.nki.nl (free online tool).",
          "Upload wild-type and edited .ab1 files.",
          "Enter the guide + PAM sequence.",
          "TIDE reports indel spectrum and editing efficiency.",
          "TIDE is particularly good for detecting specific indel sizes.",
        ],
      },
      {
        title: "Interpret results",
        instructions: [
          "Homozygous wild-type: clean chromatogram, 0% editing.",
          "Heterozygous edit: mixed peaks starting at the cut site, ICE shows two alleles.",
          "Biallelic edits: two different mutations, complex chromatogram.",
          "Homozygous edit: clean chromatogram with insertion or deletion at cut site.",
          "For biallelic samples, consider cloning PCR products into TOPO vector and sequencing individual clones.",
        ],
      },
    ],
    speciesNotes: [
      { species: "All species", notes: "Sequencing analysis is species-independent. Ensure your wild-type control is from the same cultivar/accession." },
      { species: "Wheat", notes: "Hexaploid genome complicates analysis. Use homeolog-specific primers. ICE may report homeologous edits separately." },
    ],
    troubleshooting: [
      { problem: "Low-quality chromatogram", solution: "Improve PCR product purity. Use fresh primer. Reduce template amount if oversaturated." },
      { problem: "ICE shows low R²", solution: "Sequence quality is poor. Re-sequence with fresh PCR product. Try the other primer direction." },
      { problem: "Mixed peaks even in wild-type", solution: "Primers may amplify paralogous regions. Redesign more specific primers." },
      { problem: "Can't resolve biallelic edits", solution: "Clone individual alleles (TOPO cloning) and sequence separately. Or use amplicon NGS." },
    ],
    references: [
      "Hsiau, T. et al. (2019) Inference of CRISPR edits from Sanger trace data. bioRxiv 251082.",
      "Brinkman, E.K. et al. (2014) Easy quantitative assessment of genome editing by sequence trace decomposition. Nucleic Acids Research 42(22):e168.",
    ],
  },
  {
    slug: "biolistics",
    title: "Biolistic / Particle Bombardment",
    category: "Delivery",
    difficulty: "Advanced",
    time: "1 day (plus weeks for regeneration)",
    description:
      "Gold particle-mediated delivery for monocots (wheat, maize, rice) and recalcitrant species.",
    overview:
      "Biolistic (biological + ballistic) delivery uses high-pressure helium to accelerate DNA-coated gold or tungsten microparticles into plant cells. This is the primary transformation method for monocots like wheat, maize, and rice, which are generally recalcitrant to Agrobacterium. The method can deliver DNA plasmids or RNP complexes for DNA-free editing.",
    safetyNotes: [
      "Gene gun operates at high pressure (helium up to 1800 psi) — follow manufacturer safety guidelines",
      "Gold particles are an inhalation hazard — handle in fume hood",
      "Spermidine is an irritant",
      "Wear hearing protection during bombardment",
    ],
    equipment: [
      { name: "Particle delivery system (PDS-1000/He or Biolistic)", required: true, notes: "Bio-Rad PDS-1000/He is most common" },
      { name: "Rupture discs (1100-1350 psi)", required: true },
      { name: "Macrocarrier holders and stopping screens", required: true },
      { name: "Helium tank", required: true },
      { name: "Laminar flow hood", required: true },
      { name: "Vacuum pump", required: true },
    ],
    reagents: [
      { name: "Gold microparticles (0.6 µm)", amount: "60 mg/mL stock", notes: "0.6 µm for DNA, 0.4 µm for RNP" },
      { name: "Plasmid DNA or RNP complex", amount: "5-10 µg per shot" },
      { name: "2.5 M CaCl₂", amount: "50 µL per preparation" },
      { name: "0.1 M Spermidine (free base)", amount: "20 µL per preparation", notes: "Store at -20°C in small aliquots" },
      { name: "100% Ethanol", amount: "For washing gold particles" },
      { name: "Osmoticum medium", amount: "MS + 0.4 M mannitol" },
    ],
    steps: [
      {
        title: "Prepare gold particles",
        instructions: [
          "Weigh 60 mg gold particles (0.6 µm) into a microcentrifuge tube.",
          "Add 1 mL 100% ethanol, vortex vigorously for 3 minutes.",
          "Let settle for 1 minute, remove ethanol.",
          "Wash 3× with sterile water.",
          "Resuspend in 1 mL sterile water (60 mg/mL stock). Store at -20°C.",
        ],
        tips: [
          "Prepare gold stock fresh monthly — particles aggregate over time.",
          "Sonicate briefly if particles clump.",
        ],
      },
      {
        title: "Coat particles with DNA",
        instructions: [
          "Vortex gold stock and take 50 µL (3 mg gold) per bombardment.",
          "While vortexing, add in order: 5-10 µg plasmid DNA, 50 µL 2.5 M CaCl₂, 20 µL 0.1 M spermidine.",
          "Vortex continuously for 3 minutes.",
          "Let settle for 1 minute. Remove supernatant.",
          "Wash with 140 µL 70% ethanol, then 140 µL 100% ethanol.",
          "Resuspend in 24 µL 100% ethanol.",
          "Spread 8 µL per macrocarrier disc (enough for 3 shots). Let dry.",
        ],
        tips: [
          "For RNP delivery: coat gold with pre-assembled Cas9-sgRNA complex instead of DNA. Use 10-20 µg RNP per bombardment.",
          "Keep everything on ice during coating.",
        ],
      },
      {
        title: "Prepare target tissue",
        instructions: [
          "For wheat/maize: use immature embryos (12-14 days post-anthesis, 1-2 mm).",
          "For rice: use embryogenic calli derived from mature seeds (2-3 week culture).",
          "Place explants on osmoticum medium (MS + 0.4 M mannitol) for 4 hours before bombardment.",
          "Arrange 20-30 explants in a 2 cm diameter circle in the center of the plate.",
        ],
        duration: "4 hours pre-treatment",
      },
      {
        title: "Bombardment",
        instructions: [
          "Assemble the gene gun: rupture disc → macrocarrier with DNA-coated gold → stopping screen → target plate.",
          "Set parameters: 1100 psi rupture disc, 6 cm target distance, 27 inches Hg vacuum.",
          "Fire. Each plate gets one shot.",
          "Repeat for all plates.",
          "Return explants to osmoticum medium for 16-24 hours post-bombardment.",
        ],
        tips: [
          "For wheat embryos, 1100 psi works well. Rice calli may need 1350 psi.",
          "Perform 2-3 replicate shots per treatment.",
        ],
      },
      {
        title: "Selection and regeneration",
        instructions: [
          "Transfer to selection medium after 24 hours.",
          "For wheat: MS + 5 mg/L bialaphos or 2 mg/L PPT (phosphinothricin).",
          "For rice: MS + 50 mg/L hygromycin.",
          "Subculture every 2 weeks on fresh selection medium.",
          "Transfer resistant calli to regeneration medium (MS + 2 mg/L kinetin, 0.5 mg/L NAA).",
          "Move regenerating shoots to rooting medium.",
          "Expect 2-10% transformation efficiency.",
        ],
        duration: "8-16 weeks",
      },
    ],
    speciesNotes: [
      { species: "Wheat", notes: "Most established biolistics protocol. Use immature embryos from Fielder or Bobwhite cultivar. Expect 3-8% efficiency." },
      { species: "Maize", notes: "Use Hi-II immature embryos. Higher pressure (1350 psi) often needed. 1-5% efficiency." },
      { species: "Rice", notes: "Both biolistics and Agrobacterium work. Biolistics with mature seed-derived calli. 5-15% efficiency." },
      { species: "Sorghum", notes: "Very recalcitrant. Use immature embryos. Efficiency typically <1%." },
    ],
    troubleshooting: [
      { problem: "No resistant calli", solution: "Check DNA coating quality. Increase DNA amount. Try lower pressure or shorter distance. Verify selection system." },
      { problem: "Low regeneration", solution: "Optimize hormone concentrations. Use fresher source tissue. Some genotypes regenerate better — try different cultivar." },
      { problem: "Transient but no stable expression", solution: "DNA is not integrating. Increase DNA amount. Consider linearized plasmid. Add more selection pressure." },
    ],
    references: [
      "Liang, Z. et al. (2017) Efficient DNA-free genome editing of bread wheat using CRISPR/Cas9 ribonucleoprotein complexes. Nature Communications 8:14261.",
      "Svitashev, S. et al. (2016) Genome editing in maize directed by CRISPR-Cas9 ribonucleoprotein complexes. Nature Communications 7:13274.",
    ],
  },
  {
    slug: "callus-culture",
    title: "Callus Culture & Plant Regeneration",
    category: "Tissue Culture",
    difficulty: "Intermediate",
    time: "4-12 weeks",
    description:
      "Induce callus from transformed tissue and regenerate whole plants. Species-specific media recipes.",
    overview:
      "After delivering CRISPR constructs to plant cells, you need to regenerate whole plants from the transformed tissue. This involves inducing undifferentiated callus growth, selecting for transformed cells, then directing callus to form shoots and roots through carefully balanced plant growth regulators. This protocol provides species-specific media recipes for the most common crops.",
    safetyNotes: [
      "Work in laminar flow hood to maintain sterility",
      "Plant growth regulators (2,4-D, BAP, kinetin) are potential endocrine disruptors — wear gloves",
      "Autoclave all waste media and tissue before disposal",
    ],
    equipment: [
      { name: "Laminar flow hood", required: true },
      { name: "Autoclave", required: true },
      { name: "Growth chamber (25°C, 16h light)", required: true },
      { name: "pH meter", required: true },
      { name: "Analytical balance", required: true },
      { name: "Sterile disposable petri dishes", required: true },
    ],
    reagents: [
      { name: "MS basal medium (Murashige & Skoog)", amount: "4.4 g/L" },
      { name: "Sucrose", amount: "30 g/L" },
      { name: "Phytagel or agar", amount: "3 g/L Phytagel or 8 g/L agar" },
      { name: "2,4-D (auxin)", amount: "Stock: 1 mg/mL in ethanol" },
      { name: "BAP (6-benzylaminopurine, cytokinin)", amount: "Stock: 1 mg/mL in 0.1N NaOH" },
      { name: "Zeatin", amount: "Stock: 1 mg/mL in 0.1N NaOH", notes: "For tomato/potato" },
      { name: "NAA (1-naphthaleneacetic acid)", amount: "Stock: 1 mg/mL in ethanol" },
      { name: "Kinetin", amount: "Stock: 1 mg/mL in 0.1N NaOH" },
      { name: "Selection antibiotic (kanamycin/hygromycin)", amount: "Species-specific" },
      { name: "Cefotaxime", amount: "250 mg/L", notes: "If using Agrobacterium" },
    ],
    steps: [
      {
        title: "Prepare media",
        instructions: [
          "Callus induction medium (CIM): MS + 30 g/L sucrose + auxin (species-specific). pH to 5.7-5.8.",
          "Shoot induction medium (SIM): MS + 30 g/L sucrose + cytokinin + low auxin. pH to 5.7-5.8.",
          "Root induction medium (RIM): Half-strength MS + 15 g/L sucrose ± low auxin. pH to 5.7-5.8.",
          "Add Phytagel (3 g/L) or agar (8 g/L) after pH adjustment.",
          "Autoclave at 121°C for 20 minutes.",
          "Add filter-sterilized antibiotics after cooling to ~55°C.",
          "Pour into petri dishes in laminar flow hood.",
        ],
        tips: [
          "Make media fresh — hormones degrade over time. Use within 2 weeks.",
          "Always check pH before adding gelling agent.",
        ],
      },
      {
        title: "Species-specific media recipes",
        instructions: [
          "TOMATO — CIM: MS + 2 mg/L zeatin + 0.1 mg/L IAA. SIM: MS + 2 mg/L zeatin + 0.1 mg/L IAA. RIM: ½MS + 0.5 mg/L IBA.",
          "TOBACCO — CIM: MS + 1 mg/L BAP + 0.1 mg/L NAA. SIM: same as CIM. RIM: ½MS (no hormones needed).",
          "RICE — CIM: MS + 2 mg/L 2,4-D. SIM: MS + 2 mg/L kinetin + 0.5 mg/L NAA. RIM: ½MS + 0.5 mg/L NAA.",
          "WHEAT — CIM: MS + 2 mg/L 2,4-D + 0.5 mg/L BAP. SIM: MS + 0.2 mg/L BAP. RIM: ½MS.",
          "LETTUCE — CIM: MS + 0.1 mg/L NAA + 0.5 mg/L BAP. SIM: MS + 1 mg/L BAP. RIM: ½MS.",
          "ARABIDOPSIS — Usually skip callus (floral dip method). If needed: MS + 2.5 mg/L 2,4-D.",
          "POTATO — CIM: MS + 2 mg/L zeatin + 0.01 mg/L NAA + 0.1 mg/L GA3. SIM: same as CIM. RIM: ½MS + 0.2 mg/L NAA.",
        ],
      },
      {
        title: "Callus induction",
        instructions: [
          "Place explants (leaf discs, stem segments, embryos) on CIM with selection antibiotic.",
          "Culture at 25°C in the dark for 2-4 weeks.",
          "Subculture to fresh CIM every 2 weeks.",
          "Callus should appear as white/yellowish undifferentiated tissue growing from wound sites.",
          "Discard browning or non-growing tissue.",
        ],
        duration: "2-4 weeks",
      },
      {
        title: "Shoot regeneration",
        instructions: [
          "Transfer healthy, growing callus pieces (3-5 mm) to SIM with selection.",
          "Culture at 25°C, 16h light / 8h dark photoperiod.",
          "Green spots and small shoot primordia should appear in 2-4 weeks.",
          "Subculture to fresh SIM every 2 weeks.",
          "When shoots reach 1-2 cm, excise and transfer to RIM.",
        ],
        duration: "4-8 weeks",
      },
      {
        title: "Rooting and hardening",
        instructions: [
          "Place excised shoots on RIM.",
          "Roots should appear in 1-3 weeks.",
          "When plantlets have 3-5 roots (2-3 cm long), they are ready for hardening.",
          "Gradually open the culture vessel lid over 3-5 days.",
          "Transfer to soil (autoclaved peat:perlite 1:1), cover with transparent dome.",
          "Gradually remove dome over 1-2 weeks.",
          "Move to normal growth conditions.",
        ],
        duration: "2-4 weeks",
      },
    ],
    speciesNotes: [
      { species: "Tomato", notes: "Zeatin is critical — BAP often doesn't work. Use Micro-Tom for fastest regeneration. Cotyledon explants from 8-day seedlings regenerate best." },
      { species: "Tobacco", notes: "Easiest regeneration of all species. Even small callus pieces regenerate readily." },
      { species: "Rice", notes: "Embryogenic calli from mature seeds on 2,4-D medium. Japonica (Nipponbare) regenerates better than indica." },
      { species: "Wheat", notes: "Immature embryo-derived calli. Regeneration genotype-dependent — Fielder, Bobwhite are responsive." },
      { species: "Lettuce", notes: "Fast regeneration (3-4 weeks from callus to shoots). Cotyledon explants work well." },
    ],
    troubleshooting: [
      { problem: "No callus formation", solution: "Check hormone concentrations. Use younger, actively growing tissue. Increase auxin concentration." },
      { problem: "Callus turns brown", solution: "Subculture more frequently. Add activated charcoal (1 g/L) to medium. Increase PVP. Reduce light exposure during callus phase." },
      { problem: "Shoots but no roots", solution: "Transfer to hormone-free or low-auxin medium. Try IBA instead of NAA. Dip stem base in 1 mg/mL IBA for 30 seconds." },
      { problem: "Plants die during hardening", solution: "Harden more gradually. Maintain high humidity initially. Use sterile soil. Check for contamination." },
      { problem: "Albino or vitrified shoots", solution: "Reduce cytokinin concentration. Improve light quality. Add 2 g/L activated charcoal." },
    ],
    references: [
      "Murashige, T. & Skoog, F. (1962) A revised medium for rapid growth and bio assays with tobacco tissue cultures. Physiologia Plantarum 15(3):473-497.",
      "Phillips, G.C. & Garda, M. (2019) Plant tissue culture media and practices: an overview. In Vitro Cellular & Developmental Biology - Plant 55:242-257.",
    ],
  },
];

export function getProtocolBySlug(slug: string): Protocol | undefined {
  return protocols.find((p) => p.slug === slug);
}
