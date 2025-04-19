
export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Checklist {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  public_access_id: string | null;
  is_public: boolean;
}

export interface ChecklistWithItems extends Checklist {
  items: ChecklistItem[];
  is_public: boolean;
  public_access_id: string | null;
}
