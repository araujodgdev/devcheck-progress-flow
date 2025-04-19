/*
  # Initial database schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `description` (text)
      - `is_public` (boolean)
    - `checklists`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `project_id` (uuid, foreign key to projects)
      - `title` (text)
      - `description` (text)
    - `checklist_items`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `checklist_id` (uuid, foreign key to checklists)
      - `content` (text)
      - `is_completed` (boolean)
      - `order` (integer)
    - `shared_projects`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `project_id` (uuid, foreign key to projects)
      - `user_id` (uuid, foreign key to auth.users)
      - `permission_level` (text)
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false
);

-- Create checklists table
CREATE TABLE IF NOT EXISTS checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  project_id uuid REFERENCES projects NOT NULL,
  title text NOT NULL,
  description text
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  checklist_id uuid REFERENCES checklists NOT NULL,
  content text NOT NULL,
  is_completed boolean DEFAULT false,
  "order" integer NOT NULL
);

-- Create shared_projects table
CREATE TABLE IF NOT EXISTS shared_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  project_id uuid REFERENCES projects NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  permission_level text NOT NULL,
  UNIQUE(project_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can create their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true OR 
         EXISTS (SELECT 1 FROM shared_projects WHERE project_id = projects.id AND user_id = auth.uid()));

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Checklists policies
CREATE POLICY "Users can create checklists for their projects"
  ON checklists
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid()));

CREATE POLICY "Users can view checklists for their projects or shared projects"
  ON checklists
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND is_public = true) OR
    EXISTS (SELECT 1 FROM shared_projects WHERE project_id = checklists.project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update checklists for their projects"
  ON checklists
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete checklists for their projects"
  ON checklists
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid()));

-- Checklist items policies
CREATE POLICY "Users can create checklist items for their checklists"
  ON checklist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM checklists
      JOIN projects ON checklists.project_id = projects.id
      WHERE checklists.id = checklist_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view checklist items for their checklists or shared checklists"
  ON checklist_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM checklists
      JOIN projects ON checklists.project_id = projects.id
      WHERE checklists.id = checklist_id AND (
        projects.user_id = auth.uid() OR 
        projects.is_public = true OR
        EXISTS (SELECT 1 FROM shared_projects WHERE project_id = projects.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can update checklist items for their checklists"
  ON checklist_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM checklists
      JOIN projects ON checklists.project_id = projects.id
      WHERE checklists.id = checklist_id AND (
        projects.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM shared_projects WHERE project_id = projects.id AND user_id = auth.uid() AND permission_level IN ('edit', 'admin'))
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM checklists
      JOIN projects ON checklists.project_id = projects.id
      WHERE checklists.id = checklist_id AND (
        projects.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM shared_projects WHERE project_id = projects.id AND user_id = auth.uid() AND permission_level IN ('edit', 'admin'))
      )
    )
  );

CREATE POLICY "Users can delete checklist items for their checklists"
  ON checklist_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM checklists
      JOIN projects ON checklists.project_id = projects.id
      WHERE checklists.id = checklist_id AND projects.user_id = auth.uid()
    )
  );

-- Shared projects policies
CREATE POLICY "Users can share their own projects"
  ON shared_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can view their shared projects"
  ON shared_projects
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Project owners can update shared projects"
  ON shared_projects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Project owners can delete shared projects"
  ON shared_projects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  );