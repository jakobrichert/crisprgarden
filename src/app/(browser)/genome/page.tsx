"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SPECIES_OPTIONS = [
  { value: "arabidopsis_thaliana", label: "Arabidopsis thaliana", common: "Arabidopsis" },
  { value: "oryza_sativa", label: "Oryza sativa", common: "Rice" },
  { value: "solanum_lycopersicum", label: "Solanum lycopersicum", common: "Tomato" },
  { value: "triticum_aestivum", label: "Triticum aestivum", common: "Wheat" },
  { value: "zea_mays", label: "Zea mays", common: "Maize" },
  { value: "glycine_max", label: "Glycine max", common: "Soybean" },
  { value: "nicotiana_tabacum", label: "Nicotiana tabacum", common: "Tobacco" },
  { value: "solanum_tuberosum", label: "Solanum tuberosum", common: "Potato" },
  { value: "lactuca_sativa", label: "Lactuca sativa", common: "Lettuce" },
  { value: "hordeum_vulgare", label: "Hordeum vulgare", common: "Barley" },
  { value: "sorghum_bicolor", label: "Sorghum bicolor", common: "Sorghum" },
  { value: "vitis_vinifera", label: "Vitis vinifera", common: "Grape" },
];

interface GeneResult {
  id: string;
  display_name: string;
  description: string;
  species: string;
  biotype: string;
  location: string;
}

export default function GenomeBrowserPage() {
  const [species, setSpecies] = useState("arabidopsis_thaliana");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeneResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGene, setSelectedGene] = useState<GeneResult | null>(null);
  const [geneSequence, setGeneSequence] = useState<string | null>(null);
  const [fetchingSeq, setFetchingSeq] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedGene(null);
    setGeneSequence(null);

    try {
      const res = await fetch(
        `/api/v1/genome/search?species=${species}&query=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Search failed");
        return;
      }

      setResults(data.results || []);
      if (data.results?.length === 0) {
        setError(`No genes found for "${query}". Try a gene symbol (e.g., PDS, CLV3) or Ensembl ID.`);
      }
    } catch {
      setError("Failed to search. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchSequence(gene: GeneResult) {
    setSelectedGene(gene);
    setFetchingSeq(true);
    setGeneSequence(null);

    try {
      const res = await fetch(`/api/v1/genome/sequence?id=${encodeURIComponent(gene.id)}&type=cds`);
      const data = await res.json();

      if (res.ok) {
        setGeneSequence(data.sequence);
      } else {
        setError(data.error || "Failed to fetch sequence");
      }
    } catch {
      setError("Failed to fetch sequence");
    } finally {
      setFetchingSeq(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Genome Browser</h1>
        <p className="text-muted-foreground">
          Search plant genes across all species in Ensembl Plants. View gene
          details and fetch sequences for guide RNA design.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="w-64">
              <Label className="text-xs">Species</Label>
              <Select value={species} onValueChange={setSpecies}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIES_OPTIONS.map((sp) => (
                    <SelectItem key={sp.value} value={sp.value}>
                      {sp.common} ({sp.label})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label className="text-xs">Gene name, symbol, or Ensembl ID</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., PDS, phytoene desaturase, AT4G14210..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Search Results ({results.length})
          </h2>
          {results.map((gene) => (
            <Card
              key={gene.id}
              className={`cursor-pointer transition-colors ${
                selectedGene?.id === gene.id
                  ? "border-green-500 bg-green-50/50"
                  : "hover:border-green-300"
              }`}
              onClick={() => handleFetchSequence(gene)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{gene.display_name}</CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">{gene.id}</Badge>
                    <Badge variant="secondary" className="text-xs">{gene.biotype}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (geneSequence && selectedGene?.id === gene.id) {
                        window.location.href = `/designer?sequence=${encodeURIComponent(geneSequence)}&gene=${gene.display_name}&species=${gene.species}`;
                      } else {
                        handleFetchSequence(gene);
                      }
                    }}
                  >
                    Design Guides
                  </Button>
                </div>
                <CardDescription>
                  {gene.description || "No description available"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xs text-muted-foreground">
                  Location: {gene.location} | Species: {gene.species?.replace(/_/g, " ")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedGene && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedGene.display_name} — Coding Sequence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fetchingSeq ? (
              <p className="text-sm text-muted-foreground">Fetching sequence from Ensembl...</p>
            ) : geneSequence ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{geneSequence.length} bp</Badge>
                  <Badge variant="outline">
                    GC:{" "}
                    {Math.round(
                      ((geneSequence.match(/[GCgc]/g) || []).length /
                        geneSequence.length) *
                        100
                    )}
                    %
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(geneSequence);
                    }}
                    variant="outline"
                  >
                    Copy
                  </Button>
                  <Button size="sm" asChild>
                    <a
                      href={`/designer`}
                      onClick={() => {
                        // Store in sessionStorage for the designer to pick up
                        sessionStorage.setItem(
                          "crisprgarden_sequence",
                          JSON.stringify({
                            sequence: geneSequence,
                            geneName: selectedGene.display_name,
                            species: selectedGene.species,
                            description: selectedGene.description,
                          })
                        );
                      }}
                    >
                      Open in Designer
                    </a>
                  </Button>
                </div>
                <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed">
                  {geneSequence.match(/.{1,60}/g)?.join("\n")}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click a gene to fetch its coding sequence
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {results.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="mx-auto max-w-md space-y-3">
              <h2 className="text-xl font-semibold">Search Plant Genes</h2>
              <p className="text-sm text-muted-foreground">
                Data is fetched live from{" "}
                <a
                  href="https://plants.ensembl.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 underline"
                >
                  Ensembl Plants
                </a>
                . Try searching for:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "PDS",
                  "CLAVATA3",
                  "GW2",
                  "Waxy",
                  "FT",
                  "AT4G14210",
                  "phytoene desaturase",
                ].map((term) => (
                  <Badge
                    key={term}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => {
                      setQuery(term);
                    }}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
