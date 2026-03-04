"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const casProteins = [
  {
    id: "spcas9",
    name: "SpCas9",
    pam: "NGG",
    desc: "Most widely used, 20bp guide",
  },
  {
    id: "spcas9-hf1",
    name: "SpCas9-HF1",
    pam: "NGG",
    desc: "High-fidelity, fewer off-targets",
  },
  {
    id: "espcas9",
    name: "eSpCas9(1.1)",
    pam: "NGG",
    desc: "Enhanced specificity",
  },
  {
    id: "spcas9-ng",
    name: "SpCas9-NG",
    pam: "NG",
    desc: "Relaxed PAM, broader targeting",
  },
  {
    id: "cas12a",
    name: "Cas12a (Cpf1)",
    pam: "TTTV",
    desc: "5' PAM, staggered cut, AT-rich targets",
  },
  {
    id: "cas12b",
    name: "Cas12b (C2c1)",
    pam: "TTN",
    desc: "Compact, thermostable variants",
  },
];

interface CasProteinSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CasProteinSelector({
  value,
  onChange,
}: CasProteinSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Cas Protein</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select Cas protein" />
        </SelectTrigger>
        <SelectContent>
          {casProteins.map((cp) => (
            <SelectItem key={cp.id} value={cp.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{cp.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {cp.pam}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
