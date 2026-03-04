import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const crops = [
  {
    name: "Tomato",
    scientific: "Solanum lycopersicum",
    difficulty: "Medium",
    timeline: "6-8 months",
    method: "Agrobacterium",
    targets: ["PDS (albino)", "CLV3 (fruit size)", "GABA-TP (high GABA)"],
    description: "Excellent model for fruit crops. Efficient Agrobacterium transformation, many validated targets.",
  },
  {
    name: "Arabidopsis",
    scientific: "Arabidopsis thaliana",
    difficulty: "Easy",
    timeline: "3-4 months",
    method: "Floral dip",
    targets: ["PDS3 (albino)", "TT4 (no anthocyanin)", "GL1 (no trichomes)"],
    description: "The easiest plant to transform. Floral dip — no tissue culture needed. 6-week generation time.",
  },
  {
    name: "Tobacco",
    scientific: "Nicotiana tabacum / N. benthamiana",
    difficulty: "Easy",
    timeline: "4-6 months",
    method: "Agrobacterium",
    targets: ["PDS (albino)", "NtPDR6 (modified alkaloids)"],
    description: "Very easy tissue culture and regeneration. Great for beginners learning transformation.",
  },
  {
    name: "Lettuce",
    scientific: "Lactuca sativa",
    difficulty: "Easy",
    timeline: "3-5 months",
    method: "Agrobacterium / Protoplast",
    targets: ["LsNCED4 (delayed senescence)", "LsGGP (vitamin C)"],
    description: "Fast growing, easy transformation. Protoplast method enables DNA-free editing.",
  },
  {
    name: "Rice",
    scientific: "Oryza sativa",
    difficulty: "Medium",
    timeline: "6-9 months",
    method: "Agrobacterium / Biolistic",
    targets: ["GW2 (grain size)", "Waxy (glutinous)", "DEP1 (dense panicle)"],
    description: "Most important cereal crop for CRISPR. Efficient Agrobacterium transformation for japonica varieties.",
  },
  {
    name: "Wheat",
    scientific: "Triticum aestivum",
    difficulty: "Hard",
    timeline: "8-12 months",
    method: "Biolistic",
    targets: ["TaMLO (mildew resistance)", "TaGW2 (grain weight)"],
    description: "Hexaploid — need to edit all 3 homeologs. Biolistic delivery, immature embryo culture.",
  },
  {
    name: "Maize",
    scientific: "Zea mays",
    difficulty: "Hard",
    timeline: "8-12 months",
    method: "Agrobacterium / Biolistic",
    targets: ["ZmIPK1A (low phytate)", "waxy (starch quality)"],
    description: "Large genome, requires immature embryo transformation. Hi-II is the standard transformable line.",
  },
  {
    name: "Potato",
    scientific: "Solanum tuberosum",
    difficulty: "Medium",
    timeline: "6-8 months",
    method: "Agrobacterium / Protoplast",
    targets: ["StGBSS (waxy)", "StPPO (non-browning)", "StVInv (low acrylamide)"],
    description: "Tetraploid — need to edit 4 alleles. Protoplast method avoids foreign DNA. Multiple commercial CRISPR potatoes exist.",
  },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function WizardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRISPR Wizard</h1>
        <p className="text-muted-foreground">
          Choose your crop and we&apos;ll walk you through the entire process —
          from choosing a target gene to screening your edited plants
        </p>
      </div>

      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
        <CardContent className="py-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>How it works:</strong> Select a crop below → Choose a target
            trait → We auto-design the best guide RNA → Get a step-by-step
            protocol customized for your species → Order reagents → Track your
            experiment
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {crops.map((crop) => (
          <Link key={crop.name} href={`/wizard/${crop.name.toLowerCase()}`}>
            <Card className="h-full cursor-pointer transition-all hover:border-green-500 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{crop.name}</CardTitle>
                  <Badge className={difficultyColor[crop.difficulty]}>
                    {crop.difficulty}
                  </Badge>
                </div>
                <p className="text-xs italic text-muted-foreground">
                  {crop.scientific}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">{crop.description}</p>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-medium">{crop.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeline:</span>
                    <span className="font-medium">{crop.timeline}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium mb-1">Popular targets:</p>
                  <div className="flex flex-wrap gap-1">
                    {crop.targets.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
