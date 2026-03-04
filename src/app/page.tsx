import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "sgRNA Designer",
    description:
      "Design guide RNAs for any plant gene. Find PAM sites, score on-target efficiency, predict off-targets, and design verification primers.",
    href: "/designer",
  },
  {
    title: "Experiment Tracker",
    description:
      "Log your CRISPR experiments across generations. Track phenotypes, genotyping results, and lineage from T0 to stable lines.",
    href: "/experiments",
  },
  {
    title: "CRISPR Wizard",
    description:
      "Step-by-step guides tailored to your crop. From target selection to screening — everything customized for your species.",
    href: "/wizard",
  },
  {
    title: "Genome Browser",
    description:
      "Search genes across all plant species. View gene structure, fetch sequences, and pipe directly into the sgRNA designer.",
    href: "/genome",
  },
  {
    title: "Protocol Library",
    description:
      "Detailed protocols for DNA extraction, transformation, screening, and more. Species-specific parameters and reagent lists.",
    href: "/protocols",
  },
  {
    title: "Community",
    description:
      "Share experiments, discuss methods, and learn from other plant breeders. Fork experiments and contribute protocols.",
    href: "/feed",
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="flex flex-col items-center space-y-4 pt-12 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          CRISPR<span className="text-green-600">garden</span>
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          The open-source platform for plant gene editing. Design guides, track
          experiments, follow protocols, and share your results with the
          community.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/designer">Start Designing</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/wizard">CRISPR Wizard</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full transition-colors hover:border-green-600/50">
              <CardHeader>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      <section className="rounded-lg border bg-muted/50 p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">Supported Species</h2>
        <p className="mb-4 text-muted-foreground">
          Works with any plant that has genome data in Ensembl Plants or NCBI
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Arabidopsis",
            "Rice",
            "Tomato",
            "Wheat",
            "Maize",
            "Soybean",
            "Tobacco",
            "Potato",
            "Lettuce",
            "Pepper",
            "Grape",
            "Cotton",
            "Barley",
            "Sorghum",
            "Cassava",
          ].map((sp) => (
            <span
              key={sp}
              className="rounded-full border bg-background px-3 py-1 text-sm"
            >
              {sp}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
