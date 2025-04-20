
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ChecklistItem } from "@/types/checklist";

interface GeneratedChecklistItemsProps {
  items: ChecklistItem[];
  selectedItems: string[];
  onToggleItem: (title: string) => void;
}

export function GeneratedChecklistItems({ 
  items, 
  selectedItems, 
  onToggleItem
}: GeneratedChecklistItemsProps) {
  if (items.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">Itens Gerados</h3>
      <div className="border rounded-md p-3 max-h-80 overflow-y-auto">
        {items.map((item, index) => (
          <div 
            key={`item-${item.title}-${index}`} 
            className="flex items-start space-x-2 mb-2 pb-2 border-b last:border-0"
          >
            <Checkbox 
              id={`item-${index}`}
              checked={selectedItems.includes(item.title)}
              onCheckedChange={() => onToggleItem(item.title)}
            />
            <div className="flex-1">
              <Label htmlFor={`item-${index}`} className="font-medium">{item.title}</Label>
              <div className="flex space-x-2 text-sm text-muted-foreground">
                <span>Prioridade: {item.priority}</span>
                <span>•</span>
                <span>Prazo: {item.due_date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
