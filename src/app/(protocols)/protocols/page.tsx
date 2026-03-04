"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { protocols } from "@/lib/protocols/protocol-data";

const categories = [
  "All",
  ...Array.from(new Set(protocols.map((p) => p.category))),
];

const difficultyColor: Record<string, string> = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-yellow-100 text-yellow-800",
  Advanced: "bg-red-100 text-red-800",
};

export default function ProtocolsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? protocols
      : protocols.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Protocol Library</h1>
        <p className="text-muted-foreground">
          Step-by-step protocols for plant CRISPR — from DNA extraction to
          screening for edits. Click any protocol for full details, reagent
          lists, and species-specific notes.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={cat === activeCategory ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((protocol) => (
          <Link key={protocol.slug} href={`/protocols/${protocol.slug}`}>
            <Card className="h-full cursor-pointer transition-colors hover:border-green-500">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {protocol.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${difficultyColor[protocol.difficulty] || ""}`}
                  >
                    {protocol.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-base">{protocol.title}</CardTitle>
                <CardDescription>{protocol.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Estimated time: {protocol.time}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    {protocol.steps.length} steps &rarr;
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
