
import type { Database } from '@/integrations/supabase/types';

export type ChecklistItem = Database['public']['Tables']['checklist_items']['Row'];
export type ChecklistItemInsert = Database['public']['Tables']['checklist_items']['Insert'];
export type Checklist = Database['public']['Tables']['checklists']['Row'];
export type ChecklistInsert = Database['public']['Tables']['checklists']['Insert'];

export interface ChecklistWithItems extends Checklist {
  items: ChecklistItem[];
}
