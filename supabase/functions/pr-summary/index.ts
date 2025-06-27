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
    const { prompt, modelId, userId } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate PR summary with OpenAI
    const model = modelId || "gpt-4o";
    
    const response = await openai.createChatCompletion({
      model: model === "gpt-4o" ? "gpt-4" : model, // Adjust model as needed
      messages: [
        {
          role: "system",
          content: `You are an expert code reviewer who specializes in analyzing pull requests. 
          Provide a comprehensive, insightful analysis of the pull request in the exact JSON format requested.
          Focus on identifying key changes, potential issues, security considerations, and actionable feedback.
          Be specific and detailed in your analysis, highlighting both strengths and areas for improvement.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
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

    const prSummary = JSON.parse(jsonMatch[0]);

    // Save to Supabase if user ID is provided
    if (userId && userId !== 'anonymous') {
      try {
        const { data, error } = await supabase
          .from("pull_request_summaries")
          .insert({
            user_id: userId,
            summary: prSummary.summary,
            key_changes: prSummary.keyChanges,
            potential_issues: prSummary.potentialIssues,
            suggested_feedback: prSummary.suggestedFeedback,
            security_considerations: prSummary.securityConsiderations,
            testing_recommendations: prSummary.testingRecommendations,
            model: modelId,
            confidence: prSummary.confidence || 0.85,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error("Error saving PR summary to Supabase:", error);
        }
      } catch (error) {
        console.error("Failed to save PR summary to Supabase:", error);
      }
    }

    return new Response(
      JSON.stringify(prSummary),
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