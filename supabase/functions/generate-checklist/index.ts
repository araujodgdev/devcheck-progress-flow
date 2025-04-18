
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectName, projectDescription, projectType, teamSize, duration, complexity } = await req.json();

    // Create a prompt for Gemini that includes project details
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

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    });

    const data = await response.json();
    
    // Parse the response from Gemini
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      // Extract the JSON part from the response
      let jsonResponse;
      try {
        // Look for JSON array in the response
        const jsonMatch = aiResponse.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback if no clear JSON format is found
          throw new Error("Failed to extract JSON from response");
        }
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        return new Response(JSON.stringify({ error: "Failed to parse checklist items from AI response" }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ items: jsonResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: "Failed to generate checklist" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-checklist function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
