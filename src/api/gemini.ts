import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';

type ChecklistItem = Database['public']['Tables']['checklist_items']['Row'];

// Adicionar um tipo para os valores válidos de prioridade
type PriorityType = 'low' | 'medium' | 'high';

// Interface para os itens gerados pelo modelo Gemini
interface GeneratedItem {
  title: string;
  priority: string;
  due_date: string;
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
        owner_id: userId,
        description: 'Automatically generated checklist'
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // Definir variável para os itens
    let checklistItems = [];

    try {
      // Create checklist items
      const { data: savedItems, error: itemsError } = await supabase
        .from('checklist_items')
        .insert(
          generatedItems.map((item: GeneratedItem, index: number) => {
            // Converter a prioridade para o formato aceito pelo banco
            const priorityValue: PriorityType = 
              item.priority === 'high' ? 'high' : 
              item.priority === 'low' ? 'low' : 'medium';
            
            return {
              checklist_id: checklist.id,
              title: item.title,
              completed: false,
              priority: priorityValue
            };
          })
        )
        .select();

      if (itemsError) {
        console.error("Error inserting checklist items:", itemsError);
        // Mesmo com erro nos itens, retornar a checklist criada
      } else {
        checklistItems = savedItems;
      }
    } catch (itemError) {
      console.error("Failed to create checklist items:", itemError);
      // Continue even if items fail to insert
    }

    return {
      checklistId: checklist.id,
      items: checklistItems
    };
  } catch (error) {
    console.error('Error generating checklist:', error);
    throw error;
  }
}
