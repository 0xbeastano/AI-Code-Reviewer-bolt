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
    const { code, language, filePath, reviewId, userId, modelId } = await req.json();

    if (!code || !language || !filePath || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update review status to running
    if (reviewId) {
      await supabase
        .from("code_reviews")
        .update({ status: "running" })
        .eq("id", reviewId)
        .eq("user_id", userId);
    }

    // Analyze code with OpenAI
    const model = modelId || "gpt-4o";
    const prompt = `
You are an expert code reviewer and software engineer with deep expertise in ${language}. Analyze this code file (${filePath}) and provide comprehensive feedback.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please provide a detailed analysis in JSON format with the following structure:
{
  "issues": [
    {
      "id": "unique_id",
      "type": "security|performance|style|bug|smell",
      "severity": "low|medium|high|critical",
      "line": number,
      "column": number,
      "message": "clear description of the issue",
      "rule": "rule_name",
      "suggestion": "how to fix this issue"
    }
  ],
  "suggestions": [
    {
      "id": "unique_id",
      "type": "refactor|optimize|security|style|documentation",
      "priority": "low|medium|high",
      "description": "what improvement to make",
      "before": "original code snippet",
      "after": "improved code snippet",
      "impact": "expected benefit and improvement"
    }
  ],
  "metrics": {
    "complexity": number (0-100, lower is better),
    "maintainability": number (0-100, higher is better),
    "security": number (0-100, higher is better),
    "performance": number (0-100, higher is better),
    "coverage": number (0-100, estimated test coverage),
    "duplicateLines": number,
    "linesOfCode": number
  }
}

Focus on:
1. Security vulnerabilities (XSS, SQL injection, authentication issues, input validation)
2. Performance optimizations (algorithm efficiency, memory usage, async patterns)
3. Code quality (readability, maintainability, best practices, SOLID principles)
4. Bug detection (logic errors, edge cases, type issues, null pointer exceptions)
5. Style improvements (formatting, naming conventions, code organization)
6. Modern language features and patterns

Provide actionable, specific feedback with clear examples. Be thorough but practical.
`;

    const response = await openai.createChatCompletion({
      model: model === "gpt-4o" ? "gpt-4" : model, // Adjust model as needed
      messages: [
        {
          role: "system",
          content: `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization. Provide thorough, actionable feedback in the exact JSON format requested. Focus on practical improvements that will make the code more secure, performant, and maintainable.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
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

    const analysis = JSON.parse(jsonMatch[0]);

    // Update review with analysis results
    if (reviewId) {
      await supabase
        .from("code_reviews")
        .update({
          analysis_results: analysis,
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", reviewId)
        .eq("user_id", userId);
    }

    return new Response(
      JSON.stringify(analysis),
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