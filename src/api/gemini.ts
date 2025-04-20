// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenerativeAI } from '@google/generative-ai';

// Interface para os itens da checklist
export interface ChecklistItem {
  title: string;
  priority: string;
  due_date: string;
}

// Interface para os parâmetros de entrada
export interface GenerateChecklistParams {
  projectName: string;
  projectDescription: string;
  projectType: string;
  teamSize: string;
  duration: string;
  complexity: string;
}

// Função principal que gera a checklist
export async function generateChecklist({
  projectName,
  projectDescription,
  projectType,
  teamSize,
  duration,
  complexity
}: GenerateChecklistParams): Promise<ChecklistItem[]> {
  try {
    const apiKey = "AIzaSyAOvu0OM9pCUjNpzniOE3eKhaU1A1iJ_qk"
    
    if (!apiKey) {
      throw new Error('A chave da API Gemini não está configurada');
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
    - due_date (string): Relative time from project start (e.g., "1 week", "2 months")
    
    For example:
    [
      {
        "title": "Define project scope",
        "priority": "high",
        "due_date": "1 week"
      }
    ]`;

    // Chamar a API do Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extrair o JSON do texto
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error('Falha ao extrair o JSON da resposta');
    }

    // Parse do JSON
    const checklistItems: ChecklistItem[] = JSON.parse(jsonMatch[0]);
    return checklistItems;
  } catch (error) {
    console.error('Erro ao gerar checklist:', error);
    throw error;
  }
}

// Hook de exemplo para usar com React Query
// 
// import { useMutation } from '@tanstack/react-query';
// import { generateChecklist } from '@/api/gemini';
// 
// export function useGenerateChecklist() {
//   return useMutation({
//     mutationFn: generateChecklist,
//     onError: (error) => {
//       console.error('Erro ao gerar a checklist:', error);
//     }
//   });
// }
//
// Uso:
// const generateMutation = useGenerateChecklist();
// 
// const handleGenerate = async () => {
//   try {
//     const items = await generateMutation.mutateAsync({
//       projectName: "Nome do projeto",
//       projectDescription: "Descrição do projeto",
//       projectType: "software",
//       teamSize: "small",
//       duration: "1 month",
//       complexity: "medium"
//     });
//     console.log(items);
//   } catch (error) {
//     console.error(error);
//   }
// };
  