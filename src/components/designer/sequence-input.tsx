"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMemo } from "react";

interface SequenceInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SequenceInput({ value, onChange }: SequenceInputProps) {
  const stats = useMemo(() => {
    const cleaned = value.replace(/[^ATGCatgcRYSWKMBDHVNryswkmbdhvn]/g, "");
    const len = cleaned.length;
    if (len === 0) return null;

    let gc = 0;
    for (const b of cleaned.toUpperCase()) {
      if (b === "G" || b === "C") gc++;
    }

    return {
      length: len,
      gcPercent: Math.round((gc / len) * 100),
    };
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="sequence">DNA Sequence</Label>
        {stats && (
          <span className="text-xs text-muted-foreground">
            {stats.length.toLocaleString()} bp | {stats.gcPercent}% GC
          </span>
        )}
      </div>
      <Textarea
        id="sequence"
        placeholder={`Paste your DNA sequence here (FASTA format accepted)...\n\n>example_gene\nATGGCTGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG...`}
        className="font-mono text-sm min-h-[200px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        Accepts raw DNA sequence or FASTA format. IUPAC ambiguity codes
        supported. Whitespace and numbers are automatically removed.
      </p>
    </div>
  );
}
