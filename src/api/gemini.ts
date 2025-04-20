
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';

type ChecklistItem = Database['public']['Tables']['checklist_items']['Row'];

export interface GenerateChecklistParams {
  projectName: string;
  projectDescription: string;
  projectType: string;
  teamSize: string;
  duration: string;
  complexity: string;
  userId: string;
  projectId: string;
}

export async function generateChecklistWithItems({
  projectName,
  projectDescription,
  projectType,
  teamSize,
  duration,
  complexity,
  userId,
  projectId
}: GenerateChecklistParams): Promise<{ checklistId: string; items: ChecklistItem[] }> {
  try {
    const apiKey = "AIzaSyAOvu0OM9pCUjNpzniOE3eKhaU1A1iJ_qk";
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Generate a checklist for a project with the following details:
    
    - Project Name: ${projectName}
    - Project Description: ${projectDescription}
    - Project Type: ${projectType}
    - Team Size: ${teamSize}
    - Duration: ${duration}
    - Complexity: ${complexity}
    
    Generate a list of essential checklist items organized by priority (low, medium, high) with appropriate due dates relative to the project duration. 
    Format the response as a valid JSON array with objects having these properties:
    - title (string): Task title
    - priority (string): "low", "medium", or "high"
    - due_date (string): Relative time from project start (e.g., "1 week", "2 months")`;

    // Generate items using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    // Parse items
    const items = JSON.parse(jsonMatch[0]);

    // Create checklist in Supabase
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        title: `${projectName} Checklist`,
        project_id: projectId,
        owner_id: userId,
        description: 'Automatically generated checklist'
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // Create checklist items
    const { data: checklistItems, error: itemsError } = await supabase
      .from('checklist_items')
      .insert(
        items.map((item: any, index: number) => ({
          checklist_id: checklist.id,
          title: item.title,
          priority: item.priority,
          due_date: item.due_date,
          order: index
        }))
      )
      .select();

    if (itemsError) throw itemsError;

    return {
      checklistId: checklist.id,
      items: checklistItems
    };
  } catch (error) {
    console.error('Error generating checklist:', error);
    throw error;
  }
}
