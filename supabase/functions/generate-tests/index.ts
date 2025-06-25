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
    const { code, language, filePath, modelId, userId } = await req.json();

    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate tests with OpenAI
    const model = modelId || "gpt-4o";
    const prompt = `
Generate comprehensive test cases for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide your response in JSON format with the following structure:
{
  "testCode": "Complete test code that can be directly used to test the provided code",
  "testCases": [
    {
      "description": "Description of what this test case verifies",
      "input": "Sample input or parameters",
      "expectedOutput": "Expected result or behavior"
    }
  ],
  "coverage": 85, // Estimated test coverage percentage
  "framework": "Name of the testing framework used (e.g., Jest, pytest)"
}

The test code should:
1. Use the appropriate testing framework for ${language}
2. Include all necessary imports and setup
3. Cover edge cases and main functionality
4. Be well-documented and follow best practices
5. Be ready to run with minimal modifications

For JavaScript/TypeScript, use Jest or Mocha.
For Python, use pytest or unittest.
For other languages, use the most appropriate testing framework.
`;

    const response = await openai.createChatCompletion({
      model: model === "gpt-4o" ? "gpt-4" : model, // Adjust model as needed
      messages: [
        {
          role: "system",
          content: `You are an expert test engineer who specializes in writing comprehensive, effective test suites. Generate practical, runnable test code in the exact JSON format requested.`
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

    const testData = JSON.parse(jsonMatch[0]);

    // Save to Supabase if user ID is provided
    if (userId && userId !== 'anonymous') {
      try {
        const { data, error } = await supabase
          .from("code_tests")
          .insert({
            user_id: userId,
            file_path: filePath,
            language: language,
            model: modelId,
            test_results: testData,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error("Error saving tests to Supabase:", error);
        }
      } catch (error) {
        console.error("Failed to save tests to Supabase:", error);
      }
    }

    return new Response(
      JSON.stringify(testData),
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