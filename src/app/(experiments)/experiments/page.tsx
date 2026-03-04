"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Experiment {
  id: string;
  name: string;
  species: string;
  targetGene: string;
  guideSequence: string;
  deliveryMethod: string;
  generation: string;
  status: "planned" | "active" | "completed" | "archived";
  startDate: string;
  notes: string;
  phenotypes: PhenotypeEntry[];
  genotyping: GenotypingEntry[];
}

interface PhenotypeEntry {
  id: string;
  date: string;
  trait: string;
  value: string;
  notes: string;
}

interface GenotypingEntry {
  id: string;
  date: string;
  method: string;
  editDetected: boolean;
  editType: string;
  zygosity: string;
  notes: string;
}

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-purple-100 text-purple-800",
  archived: "bg-gray-100 text-gray-800",
};

const GENERATION_OPTIONS = ["T0", "T1", "T2", "T3", "T4"];

const DELIVERY_METHODS = [
  "Agrobacterium-mediated",
  "Protoplast (PEG)",
  "Protoplast (RNP)",
  "Biolistic",
  "Floral dip",
  "Viral vector",
  "Other",
];

const SPECIES_OPTIONS = [
  "Arabidopsis",
  "Rice",
  "Tomato",
  "Wheat",
  "Maize",
  "Tobacco",
  "Lettuce",
  "Potato",
  "Soybean",
  "Pepper",
  "Other",
];

export default function ExperimentsPage() {
  // Local state (will be backed by DB later)
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedExp, setSelectedExp] = useState<Experiment | null>(null);
  const [showPhenotypeForm, setShowPhenotypeForm] = useState(false);
  const [showGenotypingForm, setShowGenotypingForm] = useState(false);

  // New experiment form state
  const [newExp, setNewExp] = useState({
    name: "",
    species: "",
    targetGene: "",
    guideSequence: "",
    deliveryMethod: "",
    generation: "T0",
    notes: "",
  });

  // New phenotype form
  const [newPhenotype, setNewPhenotype] = useState({
    trait: "",
    value: "",
    notes: "",
  });

  // New genotyping form
  const [newGenotyping, setNewGenotyping] = useState({
    method: "pcr",
    editDetected: false,
    editType: "",
    zygosity: "",
    notes: "",
  });

  function handleCreateExperiment() {
    const exp: Experiment = {
      id: Date.now().toString(),
      ...newExp,
      status: "planned",
      startDate: new Date().toISOString().split("T")[0],
      phenotypes: [],
      genotyping: [],
    };
    setExperiments((prev) => [exp, ...prev]);
    setShowNewForm(false);
    setNewExp({
      name: "",
      species: "",
      targetGene: "",
      guideSequence: "",
      deliveryMethod: "",
      generation: "T0",
      notes: "",
    });
  }

  function handleAddPhenotype() {
    if (!selectedExp) return;
    const entry: PhenotypeEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      ...newPhenotype,
    };
    setExperiments((prev) =>
      prev.map((e) =>
        e.id === selectedExp.id
          ? { ...e, phenotypes: [...e.phenotypes, entry] }
          : e
      )
    );
    setSelectedExp((prev) =>
      prev ? { ...prev, phenotypes: [...prev.phenotypes, entry] } : null
    );
    setShowPhenotypeForm(false);
    setNewPhenotype({ trait: "", value: "", notes: "" });
  }

  function handleAddGenotyping() {
    if (!selectedExp) return;
    const entry: GenotypingEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      ...newGenotyping,
    };
    setExperiments((prev) =>
      prev.map((e) =>
        e.id === selectedExp.id
          ? { ...e, genotyping: [...e.genotyping, entry] }
          : e
      )
    );
    setSelectedExp((prev) =>
      prev ? { ...prev, genotyping: [...prev.genotyping, entry] } : null
    );
    setShowGenotypingForm(false);
    setNewGenotyping({
      method: "pcr",
      editDetected: false,
      editType: "",
      zygosity: "",
      notes: "",
    });
  }

  function updateExpStatus(
    id: string,
    status: "planned" | "active" | "completed" | "archived"
  ) {
    setExperiments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
    if (selectedExp?.id === id) {
      setSelectedExp((prev) => (prev ? { ...prev, status } : null));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Experiments</h1>
          <p className="text-muted-foreground">
            Track CRISPR experiments from transformation to stable lines
          </p>
        </div>
        <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
          <DialogTrigger asChild>
            <Button size="lg">New Experiment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New CRISPR Experiment</DialogTitle>
              <DialogDescription>
                Set up a new experiment to track your gene editing progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Experiment Name</Label>
                <Input
                  placeholder="e.g., SlPDS knockout - Batch 1"
                  value={newExp.name}
                  onChange={(e) =>
                    setNewExp((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Species</Label>
                  <Select
                    value={newExp.species}
                    onValueChange={(v) =>
                      setNewExp((p) => ({ ...p, species: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIES_OPTIONS.map((sp) => (
                        <SelectItem key={sp} value={sp}>
                          {sp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Gene</Label>
                  <Input
                    placeholder="e.g., SlPDS"
                    value={newExp.targetGene}
                    onChange={(e) =>
                      setNewExp((p) => ({ ...p, targetGene: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Guide RNA Sequence (20-mer)</Label>
                <Input
                  className="font-mono"
                  placeholder="ATCGATCGATCGATCGATCG"
                  value={newExp.guideSequence}
                  onChange={(e) =>
                    setNewExp((p) => ({ ...p, guideSequence: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Delivery Method</Label>
                  <Select
                    value={newExp.deliveryMethod}
                    onValueChange={(v) =>
                      setNewExp((p) => ({ ...p, deliveryMethod: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Generation</Label>
                  <Select
                    value={newExp.generation}
                    onValueChange={(v) =>
                      setNewExp((p) => ({ ...p, generation: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENERATION_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any additional details..."
                  value={newExp.notes}
                  onChange={(e) =>
                    setNewExp((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreateExperiment}
                disabled={!newExp.name || !newExp.targetGene}
              >
                Create Experiment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {experiments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <h2 className="text-xl font-semibold">No experiments yet</h2>
              <p className="text-muted-foreground">
                Start by designing a guide RNA in the{" "}
                <a href="/designer" className="text-green-600 underline">
                  sgRNA Designer
                </a>
                , then create an experiment to track your progress.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {["T0 Transformation", "T1 Segregation", "T2 Homozygous"].map(
                  (step) => (
                    <Badge key={step} variant="outline">
                      {step}
                    </Badge>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          {/* Experiment list */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              All Experiments ({experiments.length})
            </h2>
            {experiments.map((exp) => (
              <Card
                key={exp.id}
                className={`cursor-pointer transition-colors ${selectedExp?.id === exp.id ? "border-green-500" : "hover:border-green-300"}`}
                onClick={() => setSelectedExp(exp)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{exp.name}</span>
                    <Badge className={STATUS_COLORS[exp.status] + " text-xs"}>
                      {exp.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{exp.species}</span>
                    <span>|</span>
                    <span className="font-mono">{exp.targetGene}</span>
                    <span>|</span>
                    <span>{exp.generation}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Experiment detail */}
          {selectedExp && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedExp.name}</CardTitle>
                    <div className="flex gap-2">
                      {(["planned", "active", "completed", "archived"] as const).map(
                        (s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant={selectedExp.status === s ? "default" : "outline"}
                            onClick={() => updateExpStatus(selectedExp.id, s)}
                          >
                            {s}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Species:</span>{" "}
                      <span className="font-medium">{selectedExp.species}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>{" "}
                      <span className="font-mono font-medium">
                        {selectedExp.targetGene}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Guide:</span>{" "}
                      <span className="font-mono text-xs">
                        {selectedExp.guideSequence || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Method:</span>{" "}
                      <span>{selectedExp.deliveryMethod || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Generation:</span>{" "}
                      <Badge variant="outline">{selectedExp.generation}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Started:</span>{" "}
                      <span>{selectedExp.startDate}</span>
                    </div>
                  </div>
                  {selectedExp.notes && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {selectedExp.notes}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Phenotype Observations */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Phenotype Observations ({selectedExp.phenotypes.length})
                    </CardTitle>
                    <Dialog
                      open={showPhenotypeForm}
                      onOpenChange={setShowPhenotypeForm}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Add Observation
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Log Phenotype</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div>
                            <Label>Trait</Label>
                            <Input
                              placeholder="e.g., leaf color, plant height, fruit weight"
                              value={newPhenotype.trait}
                              onChange={(e) =>
                                setNewPhenotype((p) => ({
                                  ...p,
                                  trait: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label>Value</Label>
                            <Input
                              placeholder="e.g., albino, 25cm, 150g"
                              value={newPhenotype.value}
                              onChange={(e) =>
                                setNewPhenotype((p) => ({
                                  ...p,
                                  value: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Textarea
                              value={newPhenotype.notes}
                              onChange={(e) =>
                                setNewPhenotype((p) => ({
                                  ...p,
                                  notes: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <Button onClick={handleAddPhenotype} className="w-full">
                            Save Observation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedExp.phenotypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No observations logged yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedExp.phenotypes.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-start gap-3 rounded border p-2 text-sm"
                        >
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {p.date}
                          </span>
                          <div>
                            <span className="font-medium">{p.trait}:</span>{" "}
                            {p.value}
                            {p.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {p.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Genotyping Results */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Genotyping Results ({selectedExp.genotyping.length})
                    </CardTitle>
                    <Dialog
                      open={showGenotypingForm}
                      onOpenChange={setShowGenotypingForm}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Add Result
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Genotyping Result</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div>
                            <Label>Method</Label>
                            <Select
                              value={newGenotyping.method}
                              onValueChange={(v) =>
                                setNewGenotyping((p) => ({ ...p, method: v }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pcr">PCR screening</SelectItem>
                                <SelectItem value="t7ei">
                                  T7 Endonuclease I
                                </SelectItem>
                                <SelectItem value="sanger">
                                  Sanger sequencing
                                </SelectItem>
                                <SelectItem value="ngs">
                                  NGS / Amplicon-seq
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="editDetected"
                              checked={newGenotyping.editDetected}
                              onChange={(e) =>
                                setNewGenotyping((p) => ({
                                  ...p,
                                  editDetected: e.target.checked,
                                }))
                              }
                            />
                            <Label htmlFor="editDetected">Edit detected</Label>
                          </div>
                          {newGenotyping.editDetected && (
                            <>
                              <div>
                                <Label>Edit Type</Label>
                                <Select
                                  value={newGenotyping.editType}
                                  onValueChange={(v) =>
                                    setNewGenotyping((p) => ({
                                      ...p,
                                      editType: v,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="deletion">
                                      Deletion
                                    </SelectItem>
                                    <SelectItem value="insertion">
                                      Insertion
                                    </SelectItem>
                                    <SelectItem value="substitution">
                                      Substitution
                                    </SelectItem>
                                    <SelectItem value="knockout">
                                      Knockout (frameshift)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Zygosity</Label>
                                <Select
                                  value={newGenotyping.zygosity}
                                  onValueChange={(v) =>
                                    setNewGenotyping((p) => ({
                                      ...p,
                                      zygosity: v,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select zygosity" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="homozygous">
                                      Homozygous
                                    </SelectItem>
                                    <SelectItem value="heterozygous">
                                      Heterozygous
                                    </SelectItem>
                                    <SelectItem value="biallelic">
                                      Biallelic
                                    </SelectItem>
                                    <SelectItem value="chimeric">
                                      Chimeric
                                    </SelectItem>
                                    <SelectItem value="wild_type">
                                      Wild type
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                          <div>
                            <Label>Notes</Label>
                            <Textarea
                              placeholder="e.g., -3bp deletion at cut site, confirmed by Sanger"
                              value={newGenotyping.notes}
                              onChange={(e) =>
                                setNewGenotyping((p) => ({
                                  ...p,
                                  notes: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <Button
                            onClick={handleAddGenotyping}
                            className="w-full"
                          >
                            Save Result
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedExp.genotyping.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No genotyping results yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedExp.genotyping.map((g) => (
                        <div
                          key={g.id}
                          className="flex items-start gap-3 rounded border p-2 text-sm"
                        >
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {g.date}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {g.method.toUpperCase()}
                              </Badge>
                              {g.editDetected ? (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Edit detected
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  No edit
                                </Badge>
                              )}
                              {g.editType && (
                                <Badge variant="outline" className="text-xs">
                                  {g.editType}
                                </Badge>
                              )}
                              {g.zygosity && (
                                <Badge variant="outline" className="text-xs">
                                  {g.zygosity}
                                </Badge>
                              )}
                            </div>
                            {g.notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {g.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
