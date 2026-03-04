"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface CropData {
  name: string;
  scientific: string;
  difficulty: string;
  timeline: string;
  methods: string[];
  targets: {
    gene: string;
    fullName: string;
    phenotype: string;
    description: string;
  }[];
  growthConditions: {
    temp: string;
    light: string;
    humidity: string;
  };
  mediaRecipes: {
    name: string;
    use: string;
    components: string;
  }[];
  tips: string[];
  regulatoryNotes: string[];
}

const CROP_DATA: Record<string, CropData> = {
  tomato: {
    name: "Tomato",
    scientific: "Solanum lycopersicum",
    difficulty: "Medium",
    timeline: "6-8 months (transformation to T1 seed)",
    methods: ["Agrobacterium-mediated (cotyledon/leaf disc)"],
    targets: [
      {
        gene: "SlPDS",
        fullName: "Phytoene Desaturase",
        phenotype: "Albino/bleached leaves",
        description: "Best first target — visible phenotype, no molecular screening needed to confirm knockout.",
      },
      {
        gene: "SlCLV3",
        fullName: "CLAVATA3",
        phenotype: "Larger fruits with more locules",
        description: "Partial loss-of-function increases locule number. Creates beefsteak-type tomatoes from cherry types.",
      },
      {
        gene: "SlGABA-TP1",
        fullName: "GABA Transaminase",
        phenotype: "High GABA tomatoes",
        description: "First commercialized CRISPR crop (Japan, 2021). 4-5x higher GABA — health-promoting functional food.",
      },
      {
        gene: "SlDDB1",
        fullName: "DNA Damage-Binding 1",
        phenotype: "Dark green fruits",
        description: "Affects chloroplast development in fruit. Higher sugar and lycopene content.",
      },
    ],
    growthConditions: {
      temp: "22-25°C day / 18-20°C night",
      light: "16h day / 8h night, 150-250 µmol/m²/s",
      humidity: "60-70%",
    },
    mediaRecipes: [
      {
        name: "Co-cultivation Medium",
        use: "Agrobacterium co-cultivation",
        components: "MS salts, 3% sucrose, 100 µM acetosyringone, 0.8% agar, pH 5.8",
      },
      {
        name: "Selection Medium",
        use: "Selecting transformed explants",
        components: "MS salts, 3% sucrose, 2 mg/L zeatin, 0.1 mg/L IAA, 50 mg/L kanamycin, 300 mg/L cefotaxime, 0.8% agar",
      },
      {
        name: "Rooting Medium",
        use: "Root induction from shoots",
        components: "½MS salts, 1.5% sucrose, 0.1 mg/L IBA, 50 mg/L kanamycin, 0.8% agar",
      },
    ],
    tips: [
      "Use Micro-Tom cultivar for faster results (dwarf, 70-90 day generation time)",
      "Cotyledon explants from 7-10 day old seedlings work best",
      "GV3101 is the recommended Agrobacterium strain for tomato",
      "Expect 10-40% transformation efficiency with optimized protocol",
      "For DNA-free editing, use protoplast transformation with RNPs",
    ],
    regulatoryNotes: [
      "US: SDN-1 edits (small indels, no foreign DNA) are not regulated by USDA-APHIS since 2020",
      "EU: Currently regulated as GMOs under ECJ ruling (2018), but legislation is being revised",
      "Japan: Gene-edited crops without foreign DNA can be sold after notification (since 2019)",
      "Always check your local jurisdiction before field trials or sale",
    ],
  },
  arabidopsis: {
    name: "Arabidopsis",
    scientific: "Arabidopsis thaliana",
    difficulty: "Easy",
    timeline: "3-4 months",
    methods: ["Floral dip (simplest)", "Agrobacterium (leaf disc)", "Protoplast"],
    targets: [
      {
        gene: "AtPDS3",
        fullName: "Phytoene Desaturase 3",
        phenotype: "Albino seedlings",
        description: "Same albino phenotype as tomato PDS. Easy visual screening.",
      },
      {
        gene: "TT4",
        fullName: "Transparent Testa 4 (CHS)",
        phenotype: "Yellow/pale seeds (no anthocyanin)",
        description: "Knockout of chalcone synthase. Visible seed color change.",
      },
      {
        gene: "GL1",
        fullName: "GLABROUS 1",
        phenotype: "No trichomes (hairless leaves)",
        description: "Easy to screen under a dissecting microscope or even by eye.",
      },
      {
        gene: "AP1",
        fullName: "APETALA 1",
        phenotype: "Abnormal flowers",
        description: "Floral homeotic gene. Converts petals and sepals.",
      },
    ],
    growthConditions: {
      temp: "22°C constant or 22/18°C day/night",
      light: "16h day / 8h night, 100-150 µmol/m²/s",
      humidity: "50-70%",
    },
    mediaRecipes: [
      {
        name: "½MS Plate",
        use: "Seed germination and selection",
        components: "½MS salts, 1% sucrose, 0.8% agar, pH 5.7. Add hygromycin (25 mg/L) or BASTA for selection.",
      },
      {
        name: "Floral Dip Solution",
        use: "Agrobacterium transformation",
        components: "5% sucrose, 0.05% Silwet L-77, Agrobacterium at OD600 0.8",
      },
    ],
    tips: [
      "Floral dip is the easiest method — no tissue culture required!",
      "Dip 4-6 week old plants with plenty of immature flower buds",
      "Screen T1 seeds on selective plates (hygromycin or BASTA)",
      "Col-0 ecotype is the standard for most experiments",
      "6-week seed-to-seed generation time makes it the fastest model",
    ],
    regulatoryNotes: [
      "Arabidopsis is a model plant — research use is straightforward",
      "No food safety concerns as it's not a crop plant",
      "Standard biosafety level 1 containment is sufficient",
    ],
  },
  rice: {
    name: "Rice",
    scientific: "Oryza sativa",
    difficulty: "Medium",
    timeline: "6-9 months",
    methods: ["Agrobacterium (immature embryo/callus)", "Biolistic", "Protoplast"],
    targets: [
      {
        gene: "OsGW2",
        fullName: "Grain Width 2",
        phenotype: "Larger, heavier grains",
        description: "E3 ubiquitin ligase controlling grain size. Knockout increases yield.",
      },
      {
        gene: "OsWaxy",
        fullName: "Granule-Bound Starch Synthase I",
        phenotype: "Glutinous (sticky) rice",
        description: "Controls amylose content. Important culinary trait.",
      },
      {
        gene: "OsDEP1",
        fullName: "Dense and Erect Panicle 1",
        phenotype: "Dense, erect panicles",
        description: "Truncation leads to shorter, denser panicles with more grains.",
      },
      {
        gene: "OsPDS",
        fullName: "Phytoene Desaturase",
        phenotype: "Albino",
        description: "Standard visual marker for testing editing efficiency.",
      },
    ],
    growthConditions: {
      temp: "28-30°C day / 22-25°C night",
      light: "16h day / 8h night, 200-400 µmol/m²/s",
      humidity: "70-80%",
    },
    mediaRecipes: [
      {
        name: "Callus Induction",
        use: "From mature seed scutellum",
        components: "N6 salts, 2 mg/L 2,4-D, 3% sucrose, 0.3% phytagel, pH 5.8",
      },
      {
        name: "Co-cultivation",
        use: "Agrobacterium co-cultivation",
        components: "N6 salts, 1 mg/L 2,4-D, 10 g/L glucose, 100 µM acetosyringone, 0.3% phytagel",
      },
      {
        name: "Selection",
        use: "Selecting transformed callus",
        components: "N6 salts, 2 mg/L 2,4-D, 50 mg/L hygromycin, 300 mg/L cefotaxime, 3% sucrose, 0.3% phytagel",
      },
      {
        name: "Regeneration",
        use: "Shoot regeneration from callus",
        components: "MS salts, 2 mg/L BAP, 0.5 mg/L NAA, 3% sucrose, 0.3% phytagel",
      },
    ],
    tips: [
      "Japonica varieties (Nipponbare, Kitaake) transform much easier than indica",
      "Use mature seed-derived callus for Agrobacterium method",
      "Hygromycin selection is standard for rice",
      "Expect 30-60% transformation efficiency for japonica",
      "For indica, biolistic or protoplast methods may work better",
    ],
    regulatoryNotes: [
      "US: SDN-1 edited rice is not regulated by USDA",
      "China: Regulations are evolving, SDN-1 may be exempted",
      "Japan: Notification-based system for gene-edited crops",
      "Philippines & India: Case-by-case evaluation",
    ],
  },
  lettuce: {
    name: "Lettuce",
    scientific: "Lactuca sativa",
    difficulty: "Easy",
    timeline: "3-5 months",
    methods: ["Agrobacterium (cotyledon)", "Protoplast (PEG/RNP)"],
    targets: [
      {
        gene: "LsNCED4",
        fullName: "9-cis-epoxycarotenoid dioxygenase 4",
        phenotype: "Delayed senescence",
        description: "Reduced ABA biosynthesis = longer shelf life. Leaves stay green 2x longer.",
      },
      {
        gene: "LsGGP",
        fullName: "GDP-L-galactose phosphorylase",
        phenotype: "Higher vitamin C",
        description: "Promoter editing increases ascorbic acid biosynthesis.",
      },
      {
        gene: "LsPDS",
        fullName: "Phytoene Desaturase",
        phenotype: "Albino",
        description: "Standard visual marker for editing efficiency testing.",
      },
    ],
    growthConditions: {
      temp: "20-22°C day / 16-18°C night",
      light: "16h day / 8h night, 100-200 µmol/m²/s",
      humidity: "60-70%",
    },
    mediaRecipes: [
      {
        name: "Shoot Induction",
        use: "From cotyledon explants",
        components: "MS salts, 0.1 mg/L NAA, 0.1 mg/L BAP, 3% sucrose, 0.8% agar",
      },
    ],
    tips: [
      "One of the easiest vegetables to transform",
      "Protoplast method enables DNA-free editing (no foreign DNA!)",
      "4-5 day old seedling cotyledons are ideal explants",
      "Very fast regeneration — shoots in 2-3 weeks",
      "Great beginner plant for learning tissue culture",
    ],
    regulatoryNotes: [
      "US: SDN-1 lettuce not regulated by USDA",
      "Pairwise (now Hainan Bio) has commercially released gene-edited lettuce in the US",
    ],
  },
  tobacco: {
    name: "Tobacco",
    scientific: "Nicotiana tabacum / N. benthamiana",
    difficulty: "Easy",
    timeline: "4-6 months",
    methods: ["Agrobacterium (leaf disc)"],
    targets: [
      {
        gene: "NtPDS",
        fullName: "Phytoene Desaturase",
        phenotype: "Albino",
        description: "Standard test target. Very high transformation efficiency in tobacco.",
      },
      {
        gene: "NtPDR6",
        fullName: "Pleiotropic Drug Resistance 6",
        phenotype: "Modified alkaloid transport",
        description: "Affects nicotine transport from roots to leaves.",
      },
    ],
    growthConditions: {
      temp: "25-28°C day / 20-22°C night",
      light: "16h day / 8h night, 100-200 µmol/m²/s",
      humidity: "60-70%",
    },
    mediaRecipes: [
      {
        name: "Shoot Induction",
        use: "From leaf disc explants",
        components: "MS salts, 1 mg/L BAP, 0.1 mg/L NAA, 3% sucrose, 100 mg/L kanamycin, 0.8% agar",
      },
      {
        name: "Root Induction",
        use: "Rooting regenerated shoots",
        components: "½MS salts, 1.5% sucrose, 0.8% agar",
      },
    ],
    tips: [
      "N. benthamiana is the easiest plant to transform in the world",
      "Leaf disc method — cut leaves into squares, co-cultivate with Agrobacterium",
      "Shoots appear in 2-3 weeks on selection",
      "N. benthamiana is better for transient assays, N. tabacum for stable lines",
      "Perfect for learning tissue culture before moving to harder crops",
    ],
    regulatoryNotes: [
      "Tobacco is often used as a model/test system before moving to crop plants",
    ],
  },
};

const WIZARD_STEPS = [
  { id: 1, title: "Choose Target", description: "Select which gene to edit" },
  { id: 2, title: "Design Guide", description: "Get the best sgRNA for your target" },
  { id: 3, title: "Delivery Method", description: "How to get CRISPR into your plant" },
  { id: 4, title: "Protocol", description: "Step-by-step transformation protocol" },
  { id: 5, title: "Reagents", description: "What you need to order" },
  { id: 6, title: "Track", description: "Start your experiment" },
];

export default function CropWizardPage() {
  const params = useParams();
  const speciesSlug = (params.species as string).toLowerCase();
  const crop = CROP_DATA[speciesSlug];
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  if (!crop) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Crop Not Found</h1>
        <p className="text-muted-foreground">
          We don&apos;t have a wizard for &quot;{speciesSlug}&quot; yet.
        </p>
        <Button asChild>
          <Link href="/wizard">Back to Crop Selection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/wizard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            CRISPR Wizard
          </Link>
          <span className="text-muted-foreground">/</span>
        </div>
        <h1 className="text-3xl font-bold">
          CRISPR Your {crop.name}
        </h1>
        <p className="text-muted-foreground italic">{crop.scientific}</p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1">
        {WIZARD_STEPS.map((step) => (
          <button
            key={step.id}
            className={`flex-1 rounded-lg border p-2 text-center text-xs transition-colors ${
              currentStep === step.id
                ? "border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                : currentStep > step.id
                  ? "border-green-200 bg-green-50/50 text-green-600"
                  : "text-muted-foreground"
            }`}
            onClick={() => setCurrentStep(step.id)}
          >
            <div className="font-medium">
              {currentStep > step.id ? "Done" : `Step ${step.id}`}
            </div>
            <div className="text-xs">{step.title}</div>
          </button>
        ))}
      </div>

      {/* Step 1: Choose Target */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Target Gene</CardTitle>
              <CardDescription>
                These genes have been successfully edited in {crop.name} with
                published protocols and confirmed phenotypes.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {crop.targets.map((target, i) => (
              <Card
                key={target.gene}
                className={`cursor-pointer transition-all ${
                  selectedTarget === i
                    ? "border-green-500 bg-green-50/50 ring-1 ring-green-500"
                    : "hover:border-green-300"
                }`}
                onClick={() => setSelectedTarget(i)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-green-700">
                      {target.gene}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {target.fullName}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">
                    Phenotype: {target.phenotype}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {target.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            size="lg"
            disabled={selectedTarget === null}
            onClick={() => setCurrentStep(2)}
          >
            Continue with{" "}
            {selectedTarget !== null
              ? crop.targets[selectedTarget].gene
              : "..."}
          </Button>
        </div>
      )}

      {/* Step 2: Design Guide */}
      {currentStep === 2 && selectedTarget !== null && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Design Guide RNA for {crop.targets[selectedTarget].gene}
              </CardTitle>
              <CardDescription>
                We&apos;ll fetch the gene sequence and find the best sgRNA
                candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to open the sgRNA Designer with the{" "}
                {crop.targets[selectedTarget].gene} sequence pre-loaded.
              </p>
              <Button asChild>
                <Link href="/designer">
                  Open sgRNA Designer with{" "}
                  {crop.targets[selectedTarget].gene}
                </Link>
              </Button>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            <Button onClick={() => setCurrentStep(3)}>
              Continue to Delivery Method
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Delivery Method */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Recommended Delivery for {crop.name}
              </CardTitle>
              <CardDescription>
                Based on published literature, these methods work best for{" "}
                {crop.scientific}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {crop.methods.map((method) => (
                <div
                  key={method}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Badge variant="default">Recommended</Badge>
                  <span className="font-medium">{method}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Growth Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Temperature:</span>
                  <p className="font-medium">{crop.growthConditions.temp}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Light:</span>
                  <p className="font-medium">{crop.growthConditions.light}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Humidity:</span>
                  <p className="font-medium">{crop.growthConditions.humidity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              Back
            </Button>
            <Button onClick={() => setCurrentStep(4)}>
              Continue to Protocol
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Protocol & Media */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{crop.name} Transformation Protocol</CardTitle>
              <CardDescription>
                Media recipes and step-by-step instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-medium">Media Recipes</h3>
              {crop.mediaRecipes.map((recipe) => (
                <div key={recipe.name} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{recipe.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {recipe.use}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {recipe.components}
                  </p>
                </div>
              ))}

              <h3 className="font-medium mt-4">Tips for {crop.name}</h3>
              <ul className="space-y-1">
                {crop.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-green-600 shrink-0">*</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Button asChild variant="outline">
            <Link href="/protocols">View Full Protocol Library</Link>
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>
              Back
            </Button>
            <Button onClick={() => setCurrentStep(5)}>
              Continue to Reagents
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Reagents */}
      {currentStep === 5 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reagent Checklist</CardTitle>
              <CardDescription>
                What you need to order for your {crop.name} CRISPR experiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { item: "CRISPR vector (e.g., pKSE401, pHSE401)", source: "Addgene", cost: "$75-150" },
                  { item: `Agrobacterium strain (GV3101 or EHA105)`, source: "ABRC, lab stock", cost: "$50-100" },
                  { item: "Guide RNA oligos (2x)", source: "IDT, Sigma", cost: "$10-20" },
                  { item: "MS basal salt mixture", source: "PhytoTech Labs, Sigma", cost: "$30-60" },
                  { item: "Plant hormones (BAP, NAA, 2,4-D, zeatin)", source: "Sigma, PhytoTech", cost: "$50-100" },
                  { item: "Antibiotics (kanamycin or hygromycin, cefotaxime)", source: "Sigma, GoldBio", cost: "$40-80" },
                  { item: "Acetosyringone", source: "Sigma", cost: "$20-30" },
                  { item: "PCR primers for screening (2x)", source: "IDT", cost: "$10" },
                  { item: "Taq polymerase + PCR reagents", source: "NEB, Thermo", cost: "$50-100" },
                  { item: "Phytagel or agar", source: "Sigma, PhytoTech", cost: "$20-40" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>{r.item}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{r.source}</span>
                      <Badge variant="outline">{r.cost}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm font-medium">
                Estimated total: $350-700 (excluding equipment)
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentStep(4)}>
              Back
            </Button>
            <Button onClick={() => setCurrentStep(6)}>
              Continue to Tracking
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: Track */}
      {currentStep === 6 && selectedTarget !== null && (
        <div className="space-y-4">
          <Card className="border-green-500 bg-green-50/50">
            <CardHeader>
              <CardTitle>You&apos;re Ready!</CardTitle>
              <CardDescription>
                Create an experiment to track your {crop.name}{" "}
                {crop.targets[selectedTarget].gene} editing project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-background p-4 space-y-2 text-sm">
                <p>
                  <strong>Species:</strong> {crop.name} ({crop.scientific})
                </p>
                <p>
                  <strong>Target gene:</strong>{" "}
                  {crop.targets[selectedTarget].gene} (
                  {crop.targets[selectedTarget].fullName})
                </p>
                <p>
                  <strong>Expected phenotype:</strong>{" "}
                  {crop.targets[selectedTarget].phenotype}
                </p>
                <p>
                  <strong>Method:</strong> {crop.methods[0]}
                </p>
                <p>
                  <strong>Timeline:</strong> {crop.timeline}
                </p>
              </div>

              <Button size="lg" asChild>
                <Link href="/experiments">
                  Create Experiment in Tracker
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Regulatory notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regulatory Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {crop.regulatoryNotes.map((note, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {note}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Button variant="outline" onClick={() => setCurrentStep(5)}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
