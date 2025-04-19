export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          owner_id: string
          title: string
          description: string | null
          is_public: boolean
          start_date: string | null
          end_date: string | null
          status: 'in_progress' | 'completed' | 'paused'
          priority: 'high' | 'medium' | 'low'
          is_archived: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          owner_id: string
          title: string
          description?: string | null
          is_public?: boolean
          start_date?: string | null
          end_date?: string | null
          status?: 'in_progress' | 'completed' | 'paused'
          priority?: 'high' | 'medium' | 'low'
          is_archived?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          owner_id?: string
          title?: string
          description?: string | null
          is_public?: boolean
          start_date?: string | null
          end_date?: string | null
          status?: 'in_progress' | 'completed' | 'paused'
          priority?: 'high' | 'medium' | 'low'
          is_archived?: boolean
        }
      }
      project_history: {
        Row: {
          id: string
          created_at: string
          project_id: string
          user_id: string
          field_name: string
          old_value: string | null
          new_value: string | null
          change_type: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          user_id: string
          field_name: string
          old_value?: string | null
          new_value?: string | null
          change_type: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          user_id?: string
          field_name?: string
          old_value?: string | null
          new_value?: string | null
          change_type?: string
        }
      }
      project_members: {
        Row: {
          id: string
          created_at: string
          project_id: string
          user_id: string
          role: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          user_id: string
          role: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          user_id?: string
          role?: string
        }
      }
      checklists: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          project_id: string
          owner_id: string
          title: string
          description: string | null
          due_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id: string
          owner_id: string
          title: string
          description?: string | null
          due_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id?: string
          owner_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
        }
      }
      checklist_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          checklist_id: string
          content: string
          status: 'pending' | 'in_progress' | 'completed'
          order: number
          due_date: string | null
          assignee_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          checklist_id: string
          content: string
          status?: 'pending' | 'in_progress' | 'completed'
          order: number
          due_date?: string | null
          assignee_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          checklist_id?: string
          content?: string
          status?: 'pending' | 'in_progress' | 'completed'
          order?: number
          due_date?: string | null
          assignee_id?: string | null
        }
      }
    }
    Enums: {
      project_status: 'in_progress' | 'completed' | 'paused'
      priority_level: 'high' | 'medium' | 'low'
      checklist_item_status: 'pending' | 'in_progress' | 'completed'
    }
  }
}