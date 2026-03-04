"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getProtocolBySlug } from "@/lib/protocols/protocol-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const loading3D = () => (
  <div className="h-[420px] rounded-lg border bg-muted animate-pulse" />
);

const DnaExtraction3D = dynamic(
  () => import("@/components/protocols/dna-extraction-3d").then((m) => m.DnaExtraction3D),
  { ssr: false, loading: loading3D }
);
const Agrobacterium3D = dynamic(
  () => import("@/components/protocols/agrobacterium-3d").then((m) => m.Agrobacterium3D),
  { ssr: false, loading: loading3D }
);
const Protoplast3D = dynamic(
  () => import("@/components/protocols/protoplast-3d").then((m) => m.Protoplast3D),
  { ssr: false, loading: loading3D }
);
const Biolistics3D = dynamic(
  () => import("@/components/protocols/biolistics-3d").then((m) => m.Biolistics3D),
  { ssr: false, loading: loading3D }
);
const GelElectrophoresis3D = dynamic(
  () => import("@/components/protocols/gel-electrophoresis-3d").then((m) => m.GelElectrophoresis3D),
  { ssr: false, loading: loading3D }
);
const CallusCulture3D = dynamic(
  () => import("@/components/protocols/callus-culture-3d").then((m) => m.CallusCulture3D),
  { ssr: false, loading: loading3D }
);

const PROTOCOL_3D: Record<string, React.ComponentType> = {
  "dna-extraction": DnaExtraction3D,
  "agrobacterium-transformation": Agrobacterium3D,
  "protoplast-transformation": Protoplast3D,
  "biolistics": Biolistics3D,
  "pcr-screening": GelElectrophoresis3D,
  "t7-endonuclease-assay": GelElectrophoresis3D,
  "callus-culture": CallusCulture3D,
};

const difficultyColor: Record<string, string> = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-yellow-100 text-yellow-800",
  Advanced: "bg-red-100 text-red-800",
};

export default function ProtocolDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const protocol = getProtocolBySlug(slug);

  if (!protocol) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold">Protocol not found</h1>
        <p className="text-muted-foreground mt-2">
          The protocol &ldquo;{slug}&rdquo; doesn&apos;t exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/protocols">Back to Protocols</Link>
        </Button>
      </div>
    );
  }

  const Viz3D = PROTOCOL_3D[slug];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/protocols"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; All Protocols
        </Link>
        <h1 className="text-3xl font-bold mt-2">{protocol.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">{protocol.category}</Badge>
          <Badge
            variant="outline"
            className={difficultyColor[protocol.difficulty] || ""}
          >
            {protocol.difficulty}
          </Badge>
          <Badge variant="outline">{protocol.time}</Badge>
        </div>
        <p className="text-muted-foreground mt-3">{protocol.overview}</p>
      </div>

      {/* 3D Interactive Visualization */}
      {Viz3D && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Interactive 3D Visualization</CardTitle>
            <CardDescription>
              Step through the process in 3D. Drag to rotate, scroll to zoom.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Viz3D />
          </CardContent>
        </Card>
      )}

      {/* Safety Notes */}
      {protocol.safetyNotes.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-red-800">
              Safety Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {protocol.safetyNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Equipment & Reagents side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {protocol.equipment.map((eq, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                      eq.required ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <div>
                    <span className="font-medium">{eq.name}</span>
                    {!eq.required && (
                      <span className="text-muted-foreground ml-1">
                        (optional)
                      </span>
                    )}
                    {eq.notes && (
                      <p className="text-xs text-muted-foreground">
                        {eq.notes}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reagents</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {protocol.reagents.map((r, i) => (
                <li key={i}>
                  <div className="flex justify-between">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {r.amount}
                    </span>
                  </div>
                  {(r.supplier || r.notes) && (
                    <p className="text-xs text-muted-foreground">
                      {r.supplier && `Supplier: ${r.supplier}. `}
                      {r.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Procedure</h2>
        {protocol.steps.map((step, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800 font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  {step.duration && (
                    <CardDescription>{step.duration}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-1.5 text-sm">
                {step.instructions.map((inst, j) => (
                  <li key={j} className="leading-relaxed">
                    {inst}
                  </li>
                ))}
              </ol>

              {step.warning && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                  <strong>Warning:</strong> {step.warning}
                </div>
              )}

              {step.tips && step.tips.length > 0 && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                  <strong>Tips:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {step.tips.map((tip, k) => (
                      <li key={k}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Species-Specific Notes */}
      {protocol.speciesNotes.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3">Species-Specific Notes</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {protocol.speciesNotes.map((sn, i) => (
              <Card key={i}>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm">{sn.species}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{sn.notes}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Troubleshooting */}
      {protocol.troubleshooting.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3">Troubleshooting</h2>
          <Accordion type="single" collapsible className="w-full">
            {protocol.troubleshooting.map((t, i) => (
              <AccordionItem key={i} value={`ts-${i}`}>
                <AccordionTrigger className="text-sm font-medium">
                  {t.problem}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {t.solution}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* References */}
      {protocol.references.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3">References</h2>
          <ul className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            {protocol.references.map((ref, i) => (
              <li key={i}>{ref}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 pb-8">
        <Button asChild variant="outline">
          <Link href="/protocols">&larr; All Protocols</Link>
        </Button>
        <Button asChild>
          <Link href="/designer">Open sgRNA Designer</Link>
        </Button>
      </div>
    </div>
  );
}
