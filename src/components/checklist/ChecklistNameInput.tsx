
import { Label } from "@/components/ui/label";

interface ChecklistNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChecklistNameInput({ value, onChange }: ChecklistNameInputProps) {
  return (
    <div>
      <Label htmlFor="checklistName">Nome da Checklist</Label>
      <input
        id="checklistName"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md p-2 mt-1 w-full"
        placeholder="Nome da checklist"
      />
    </div>
  );
}
