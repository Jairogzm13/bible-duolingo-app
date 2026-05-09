const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { mode, language = "es", knowledgeHint = "beginner", answers = [] } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");

    const lang = language === "en" ? "English" : "Spanish";

    let systemPrompt: string;
    let userPrompt: string;
    let tools: any;
    let toolChoice: any;

    if (mode === "generate") {
      systemPrompt = `You write Bible knowledge quiz questions in ${lang}. Mix Old Testament and New Testament. Adapt difficulty to the stated level. Each question has 4 plausible options and exactly one correct answer (index 0-3). Include a brief explanation citing the reference.`;
      userPrompt = `Generate 8 multiple choice questions to assess a user's Bible knowledge. Their self-reported level: "${knowledgeHint}". Vary topics: Genesis, Exodus, Psalms, Prophets, Gospels, Acts, Epistles, Revelation. Mix easy, medium, and hard.`;
      tools = [{
        type: "function",
        function: {
          name: "return_questions",
          description: "Return assessment questions",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    q: { type: "string" },
                    options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                    answer: { type: "integer", minimum: 0, maximum: 3 },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                    testament: { type: "string", enum: ["OT", "NT"] },
                    reference: { type: "string" },
                    explanation: { type: "string" },
                  },
                  required: ["q", "options", "answer", "difficulty", "testament", "reference", "explanation"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      }];
      toolChoice = { type: "function", function: { name: "return_questions" } };
    } else if (mode === "evaluate") {
      systemPrompt = `You are a Christian Bible mentor. Evaluate quiz performance and assign a tier and personalized note in ${lang}.`;
      userPrompt = `User answered ${answers.filter((a: any) => a.correct).length}/${answers.length} questions correctly. Details: ${JSON.stringify(answers)}. Decide their tier: beginner (0-30%), intermediate (31-60%), advanced (61-85%), scholar (86-100%). Compute knowledge_score 0-100. Write a short encouraging note (3-4 sentences) in ${lang} explaining their level and what they should focus on next.`;
      tools = [{
        type: "function",
        function: {
          name: "return_evaluation",
          parameters: {
            type: "object",
            properties: {
              tier: { type: "string", enum: ["beginner", "intermediate", "advanced", "scholar"] },
              knowledge_score: { type: "integer", minimum: 0, maximum: 100 },
              note: { type: "string" },
              focus_topics: { type: "array", items: { type: "string" } },
            },
            required: ["tier", "knowledge_score", "note", "focus_topics"],
            additionalProperties: false,
          },
        },
      }];
      toolChoice = { type: "function", function: { name: "return_evaluation" } };
    } else if (mode === "leveled_quiz") {
      const tier = body.tier ?? "beginner";
      const topic = body.topic ?? "general";
      systemPrompt = `You write Bible quiz questions in ${lang} adapted to the user's tier.`;
      userPrompt = `Generate 5 multiple-choice questions about "${topic}" at the "${tier}" level. Beginner = simple recall. Intermediate = comprehension. Advanced = interpretation. Scholar = deep theological analysis. Mix OT and NT.`;
      tools = [{
        type: "function",
        function: {
          name: "return_questions",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    q: { type: "string" },
                    options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                    answer: { type: "integer" },
                    reference: { type: "string" },
                    explanation: { type: "string" },
                  },
                  required: ["q", "options", "answer", "reference", "explanation"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      }];
      toolChoice = { type: "function", function: { name: "return_questions" } };
    } else {
      return new Response(JSON.stringify({ error: "invalid mode" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        tools,
        tool_choice: toolChoice,
      }),
    });

    if (r.status === 429) return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "payment_required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) {
      const t = await r.text();
      console.error("ai-assessment gateway", r.status, t);
      return new Response(JSON.stringify({ error: "gateway_error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await r.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) {
      console.error("no tool call returned", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "no_tool_call" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(args, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});