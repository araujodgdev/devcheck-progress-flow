/*
  # Fix projects RLS policies

  1. Changes
    - Remove recursive policy conditions that were causing infinite loops
    - Simplify the SELECT policy to avoid recursion
    - Ensure proper access control for project owners and shared users
  
  2. Security
    - Maintain RLS enabled on projects table
    - Update policies to prevent infinite recursion while maintaining security
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Create new, simplified policies
CREATE POLICY "Users can view their own projects"
ON projects
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR is_public = true 
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