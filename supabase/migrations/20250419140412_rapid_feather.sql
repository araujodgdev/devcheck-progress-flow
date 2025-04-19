/*
  # Enhanced Project Management Schema

  1. Updates to Projects Table
    - Add new fields for dates, status, priority
    - Add audit fields for change tracking
  
  2. Updates to Checklists
    - Add new fields for deadlines and assignments
    - Add status tracking per item
    
  3. New Tables
    - project_history for tracking changes
    - project_members for team management
*/

-- Enum types for status and priority
CREATE TYPE project_status AS ENUM ('in_progress', 'completed', 'paused');
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE checklist_item_status AS ENUM ('pending', 'in_progress', 'completed');

-- Update projects table
ALTER TABLE projects 
ADD COLUMN start_date date,
ADD COLUMN end_date date,
ADD COLUMN status project_status DEFAULT 'in_progress',
ADD COLUMN priority priority_level DEFAULT 'medium',
ADD COLUMN owner_id uuid REFERENCES auth.users(id),
ADD COLUMN is_archived boolean DEFAULT false,
ADD COLUMN updated_at timestamptz DEFAULT now();

-- Create project history table
CREATE TABLE project_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  field_name text NOT NULL,
  old_value text,
  new_value text,
  change_type text NOT NULL
);

-- Update checklists table
ALTER TABLE checklists
ADD COLUMN due_date date,
ADD COLUMN owner_id uuid REFERENCES auth.users(id),
ADD COLUMN updated_at timestamptz DEFAULT now();

-- Update checklist_items table
ALTER TABLE checklist_items
ADD COLUMN due_date date,
ADD COLUMN assignee_id uuid REFERENCES auth.users(id),
ADD COLUMN status checklist_item_status DEFAULT 'pending',
ADD COLUMN updated_at timestamptz DEFAULT now();

-- Create project members table
CREATE TABLE project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL,
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE project_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Project history policies
CREATE POLICY "Users can view project history they have access to"
  ON project_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_history.project_id
      AND (
        user_id = auth.uid()
        OR is_public = true
        OR id IN (SELECT project_id FROM shared_projects WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can create project history for their projects"
  ON project_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_history.project_id
      AND user_id = auth.uid()
    )
  );

-- Project members policies
CREATE POLICY "Users can view project members they have access to"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND (
        user_id = auth.uid()
        OR is_public = true
        OR id IN (SELECT project_id FROM shared_projects WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Project owners can manage project members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at
    BEFORE UPDATE ON checklists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at
    BEFORE UPDATE ON checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to log project changes
CREATE OR REPLACE FUNCTION log_project_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.title != OLD.title THEN
      INSERT INTO project_history (project_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, auth.uid(), 'title', OLD.title, NEW.title, 'update');
    END IF;
    
    IF NEW.description != OLD.description THEN
      INSERT INTO project_history (project_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, auth.uid(), 'description', OLD.description, NEW.description, 'update');
    END IF;
    
    IF NEW.status != OLD.status THEN
      INSERT INTO project_history (project_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, auth.uid(), 'status', OLD.status::text, NEW.status::text, 'update');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project changes
CREATE TRIGGER log_project_changes_trigger
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION log_project_changes();