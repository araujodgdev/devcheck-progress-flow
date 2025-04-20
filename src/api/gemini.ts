import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

type ChecklistItem = Database['public']['Tables']['checklist_items']['Row'];
type ChecklistInsert = Database['public']['Tables']['checklist_items']['Insert'];
type Checklist = Database['public']['Tables']['checklists']['Row'];

interface GeneratedItem {
  title: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
}

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

/**
 * Converts a relative date string like "1 week", "2 months" to an ISO date string
 */
function convertRelativeDateToISODate(relativeDate: string | null): string | null {
  if (!relativeDate) return null;
  
  // Ignore labels that aren't actual dates
  if (relativeDate.toLowerCase() === 'start date' ||
      relativeDate.toLowerCase() === 'end date' ||
      relativeDate.toLowerCase() === 'none' ||
      relativeDate.toLowerCase() === 'n/a') {
    return null;
  }
  
  const today = new Date();
  
  // Match patterns like "1 day", "2 weeks", "3 months"
  const match = relativeDate.match(/^(\d+)\s+(day|days|week|weeks|month|months)$/i);
  if (!match) return null;
  
  const amount = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  if (unit === 'day' || unit === 'days') {
    return format(addDays(today, amount), 'yyyy-MM-dd');
  }
  
  if (unit === 'week' || unit === 'weeks') {
    return format(addWeeks(today, amount), 'yyyy-MM-dd');
  }
  
  if (unit === 'month' || unit === 'months') {
    return format(addMonths(today, amount), 'yyyy-MM-dd');
  }
  
  return null;
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
    const generatedItems = JSON.parse(jsonMatch[0]) as GeneratedItem[];

    // Create checklist in Supabase
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        title: `${projectName} Checklist`,
        project_id: projectId,
        description: 'Automatically generated checklist',
        is_public: false,
        owner_id: userId
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // Create checklist items
    const { data: savedItems, error: itemsError } = await supabase
      .from('checklist_items')
      .insert(
        generatedItems.map((item: GeneratedItem, index: number) => ({
          checklist_id: checklist.id,
          content: item.title,
          status: 'pending' as Database['public']['Enums']['checklist_item_status'],
          order: index,
          due_date: convertRelativeDateToISODate(item.due_date)
        }))
      )
      .select();

    if (itemsError) {
      console.error("Error inserting checklist items:", itemsError);
      throw itemsError;
    }

    return {
      checklistId: checklist.id,
      items: savedItems
    };
  } catch (error) {
    console.error('Error generating checklist:', error);
    throw error;
  }
}
