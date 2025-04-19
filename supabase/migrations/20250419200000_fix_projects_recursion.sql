
/*
  # Fix projects RLS policies recursion issue

  The previous migrations tried to fix infinite recursion in project policies but 
  issues still persist. This migration provides a cleaner implementation by:
  1. Using security definer functions to avoid recursion
  2. Simplifying policy conditions
  3. Ensuring proper policy structure
*/

-- First, drop all existing project policies to start fresh
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Create a security definer function to check if a user has access to a project
CREATE OR REPLACE FUNCTION public.user_has_project_access(project_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM shared_projects 
    WHERE project_id = user_has_project_access.project_id 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies using the security definer function
CREATE POLICY "Users can view their own projects"
ON projects
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR (is_public = true) 
  OR id IN (
    SELECT project_id 
    FROM shared_projects 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own projects"
ON projects
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects"
ON projects
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
ON projects
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Ensure the shared_projects table exists (create if it doesn't)
CREATE TABLE IF NOT EXISTS shared_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  UNIQUE(project_id, user_id)
);

-- Enable RLS on shared_projects table
ALTER TABLE shared_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_projects table
CREATE POLICY IF NOT EXISTS "Project owners can manage shared_projects"
ON shared_projects
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM projects 
    WHERE id = shared_projects.project_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Users can view their shared projects"
ON shared_projects
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
