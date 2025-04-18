
export type ChecklistPriority = 'low' | 'medium' | 'high';

export interface Checklist {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  completed: boolean;
  priority: ChecklistPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistWithItems extends Checklist {
  items: ChecklistItem[];
}
