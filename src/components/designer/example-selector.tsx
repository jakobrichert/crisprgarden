"use client";

import { EXAMPLE_SEQUENCES } from "@/lib/bio/example-sequences";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ExampleSelectorProps {
  onSelect: (
    sequence: string,
    info: { geneName: string; species: string; description: string }
  ) => void;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export function ExampleSelector({ onSelect }: ExampleSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Start with a well-characterized gene target. These are real gene
        sequences commonly used in plant CRISPR experiments.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {EXAMPLE_SEQUENCES.map((example) => (
          <Card
            key={example.id}
            className="cursor-pointer transition-all hover:border-green-500 hover:shadow-sm"
            onClick={() =>
              onSelect(example.sequence, {
                geneName: `${example.geneName} — ${example.geneFullName}`,
                species: example.species,
                description: `${example.description} ${example.whyTarget}`,
              })
            }
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{example.geneName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {example.species}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {example.geneFullName}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {example.description}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {example.sequence.length} bp
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Expected: {example.expectedPhenotype}
                </span>
              </div>
              <p className="mt-2 text-xs italic text-green-700">
                {example.whyTarget}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
