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
import { Badge } from "@/components/ui/badge";

const SPECIES_OPTIONS = [
  { value: "arabidopsis_thaliana", label: "Arabidopsis thaliana" },
  { value: "oryza_sativa", label: "Oryza sativa (Rice)" },
  { value: "solanum_lycopersicum", label: "Solanum lycopersicum (Tomato)" },
  { value: "triticum_aestivum", label: "Triticum aestivum (Wheat)" },
  { value: "zea_mays", label: "Zea mays (Maize)" },
  { value: "glycine_max", label: "Glycine max (Soybean)" },
  { value: "nicotiana_tabacum", label: "Nicotiana tabacum (Tobacco)" },
  { value: "solanum_tuberosum", label: "Solanum tuberosum (Potato)" },
  { value: "lactuca_sativa", label: "Lactuca sativa (Lettuce)" },
  { value: "capsicum_annuum", label: "Capsicum annuum (Pepper)" },
  { value: "vitis_vinifera", label: "Vitis vinifera (Grape)" },
  { value: "hordeum_vulgare", label: "Hordeum vulgare (Barley)" },
  { value: "sorghum_bicolor", label: "Sorghum bicolor (Sorghum)" },
];

interface SearchResult {
  id: string;
  display_name: string;
  description: string;
  species: string;
  biotype: string;
  location: string;
}

interface GeneSearchBoxProps {
  onSelect: (
    sequence: string,
    info: { geneName: string; species: string; description: string }
  ) => void;
}

export function GeneSearchBox({ onSelect }: GeneSearchBoxProps) {
  const [species, setSpecies] = useState("arabidopsis_thaliana");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSeq, setFetchingSeq] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Search Ensembl Plants REST API
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
        setError(
          `No genes found for "${query}" in ${species.replace("_", " ")}. Try a different gene name or species.`
        );
      }
    } catch {
      setError("Failed to search. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectGene(gene: SearchResult) {
    setFetchingSeq(gene.id);
    setError(null);

    try {
      const res = await fetch(
        `/api/v1/genome/sequence?id=${encodeURIComponent(gene.id)}&type=cds`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch sequence");
        return;
      }

      onSelect(data.sequence, {
        geneName: gene.display_name,
        species: gene.species.replace("_", " "),
        description: gene.description || gene.biotype,
      });
    } catch {
      setError("Failed to fetch gene sequence.");
    } finally {
      setFetchingSeq(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Search the Ensembl Plants database for any gene by name, symbol, or
        description. The coding sequence (CDS) will be fetched automatically.
      </p>

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
                  {sp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label className="text-xs">Gene name or ID</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., PDS, CLAVATA3, AT4G14210..."
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

      {error && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {results.length} result{results.length !== 1 && "s"} found:
          </p>
          <div className="max-h-64 space-y-2 overflow-auto">
            {results.map((gene) => (
              <div
                key={gene.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{gene.display_name}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {gene.id}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {gene.biotype}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {gene.description || "No description"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Location: {gene.location}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSelectGene(gene)}
                  disabled={fetchingSeq === gene.id}
                >
                  {fetchingSeq === gene.id ? "Fetching..." : "Load CDS"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
