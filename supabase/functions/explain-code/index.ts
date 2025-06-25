import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import { Configuration, OpenAIApi } from "npm:openai@3.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create OpenAI client
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    const configuration = new Configuration({ apiKey: openaiApiKey });
    const openai = new OpenAIApi(configuration);

    // Parse request
    const { code, language, modelId, userId } = await req.json();

    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Explain code with OpenAI
    const model = modelId || "gpt-4o";
    const prompt = `
Please explain the following ${language} code in detail:

\`\`\`${language}
${code}
\`\`\`

Provide your response in JSON format with the following structure:
{
  "explanation": "A clear, detailed explanation of what the code does, how it works, and its purpose",
  "complexity": "An assessment of the code's complexity and readability",
  "keyComponents": ["List of key functions, classes, or components in the code", "With brief descriptions"],
  "potentialIssues": ["List of potential issues, edge cases, or improvements", "That could be addressed"]
}

Be thorough but concise. Focus on helping a developer understand the code's purpose, structure, and potential issues.
`;

    const response = await openai.createChatCompletion({
      model: model === "gpt-4o" ? "gpt-4" : model, // Adjust model as needed
      messages: [
        {
          role: "system",
          content: `You are an expert code explainer who helps developers understand complex code. Provide clear, accurate explanations in the exact JSON format requested.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2500
    });

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error(`No response from OpenAI`);
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Could not parse JSON from OpenAI response`);
    }

    const explanation = JSON.parse(jsonMatch[0]);

    // Save to Supabase if user ID is provided
    if (userId && userId !== 'anonymous') {
      try {
        const { data, error } = await supabase
          .from("code_explanations")
          .insert({
            user_id: userId,
            language: language,
            model: modelId,
            explanation_results: explanation,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error("Error saving explanation to Supabase:", error);
        }
      } catch (error) {
        console.error("Failed to save explanation to Supabase:", error);
      }
    }

    return new Response(
      JSON.stringify(explanation),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});