/**
 * LLM Provider for VibeCode Build Pipeline
 *
 * This module handles app blueprint generation using AI.
 * Currently uses OpenAI, but designed to be swapped to Claude Sonnet or other providers.
 *
 * Blueprint Structure:
 * - App metadata (name, target platform, auth requirements)
 * - Pages with layouts and sections
 * - Data model (entities and fields)
 * - Navigation structure
 *
 * Future: Swap to Claude Sonnet for better code generation quality
 */

export interface BlueprintPage {
  id: string;
  title: string;
  route: string;
  layout: "dashboard" | "landing" | "form" | "list" | "detail";
  sections: Array<{
    type: string;
    title?: string;
    description?: string;
    fields?: Array<{ name: string; type: string; placeholder?: string; }>;
  }>;
}

export interface DataEntity {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    required?: boolean;
  }>;
}

export interface AppBlueprint {
  appName: string;
  target: "web" | "ios" | "android" | "multi";
  pages: BlueprintPage[];
  dataModel: DataEntity[];
  authRequired: boolean;
  notes?: string;
}

/**
 * Generate an app blueprint from a user prompt
 *
 * @param prompt - User's app idea description
 * @param target - Target platform(s)
 * @returns Structured app blueprint
 *
 * TODO: Replace OpenAI with Claude Sonnet for better code understanding
 * TODO: Add support for real-time streaming of blueprint generation
 */
export async function generateAppBlueprint({
  prompt,
  target,
}: {
  prompt: string;
  target: "web" | "ios" | "android" | "multi";
}): Promise<AppBlueprint> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4-turbo-preview";

  // If no API key, return mock blueprint for development
  if (!apiKey) {
    console.warn(
      "⚠️  OPENAI_API_KEY not set. Using mock blueprint for development."
    );
    return generateMockBlueprint(prompt, target);
  }

  try {
    const systemPrompt = `You are an expert app architect. Generate a detailed app blueprint in JSON format.

The blueprint must include:
1. appName: A catchy name derived from the user's idea
2. target: The platform (${target})
3. pages: Array of page objects with id, title, route, layout type, and sections
4. dataModel: Array of entities with their fields
5. authRequired: Boolean indicating if authentication is needed
6. notes: Any additional implementation notes

Return ONLY valid JSON. No markdown, no code blocks, just the JSON object.`;

    const userPrompt = `Create an app blueprint for: ${prompt}

Requirements:
- Target platform: ${target}
- Include all necessary pages and navigation
- Define a complete data model
- Specify UI sections for each page
- Keep it production-ready and scalable`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Parse JSON from response (handle markdown code blocks if present)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
    }

    const blueprint: AppBlueprint = JSON.parse(jsonStr);

    // Validate blueprint structure
    if (!blueprint.appName || !blueprint.pages || !Array.isArray(blueprint.pages)) {
      throw new Error("Invalid blueprint structure from AI");
    }

    // Ensure target is set correctly
    blueprint.target = target;

    return blueprint;
  } catch (error) {
    console.error("Error generating blueprint with AI:", error);
    console.warn("Falling back to mock blueprint");

    // Fallback to mock blueprint with error note
    const mockBp = generateMockBlueprint(prompt, target);
    mockBp.notes = `AI generation failed: ${error.message}. Using fallback blueprint.`;
    return mockBp;
  }
}

/**
 * Generate a mock blueprint for development/fallback
 * Parses the prompt for keywords to create a relevant structure
 */
function generateMockBlueprint(prompt: string, target: "web" | "ios" | "android" | "multi"): AppBlueprint {
  const lowerPrompt = prompt.toLowerCase();

  // Extract app name (first few words, capitalized)
  const words = prompt.split(" ").filter(w => w.length > 2);
  const appName = words.slice(0, 3).map(w =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).join(" ") || "My App";

  // Detect features
  const hasAuth = lowerPrompt.includes("auth") || lowerPrompt.includes("login") || lowerPrompt.includes("user");
  const hasDashboard = lowerPrompt.includes("dashboard") || lowerPrompt.includes("analytics");
  const hasPayment = lowerPrompt.includes("payment") || lowerPrompt.includes("subscription") || lowerPrompt.includes("checkout");
  const hasProfile = lowerPrompt.includes("profile") || lowerPrompt.includes("account");
  const hasChat = lowerPrompt.includes("chat") || lowerPrompt.includes("message");

  // Build pages based on detected features
  const pages: BlueprintPage[] = [
    {
      id: "home",
      title: "Home",
      route: "/",
      layout: "landing",
      sections: [
        { type: "hero", title: appName, description: "Welcome to your app" },
        { type: "features", title: "Key Features" },
        { type: "cta", title: "Get Started" },
      ],
    },
  ];

  if (hasDashboard) {
    pages.push({
      id: "dashboard",
      title: "Dashboard",
      route: "/dashboard",
      layout: "dashboard",
      sections: [
        { type: "stats", title: "Overview" },
        { type: "chart", title: "Analytics" },
        { type: "list", title: "Recent Activity" },
      ],
    });
  }

  if (hasProfile) {
    pages.push({
      id: "profile",
      title: "Profile",
      route: "/profile",
      layout: "form",
      sections: [
        {
          type: "form",
          title: "Edit Profile",
          fields: [
            { name: "name", type: "text", placeholder: "Your name" },
            { name: "email", type: "email", placeholder: "your@email.com" },
            { name: "bio", type: "textarea", placeholder: "About you" },
          ],
        },
      ],
    });
  }

  // Build data model
  const dataModel: DataEntity[] = [
    {
      name: "User",
      fields: [
        { name: "id", type: "string", required: true },
        { name: "email", type: "string", required: true },
        { name: "name", type: "string", required: false },
        { name: "createdAt", type: "timestamp", required: true },
      ],
    },
  ];

  if (hasDashboard || hasProfile) {
    dataModel.push({
      name: "UserData",
      fields: [
        { name: "userId", type: "string", required: true },
        { name: "data", type: "json", required: true },
        { name: "updatedAt", type: "timestamp", required: true },
      ],
    });
  }

  return {
    appName,
    target,
    pages,
    dataModel,
    authRequired: hasAuth,
    notes: "This is a mock blueprint generated for development. Replace with real AI in production.",
  };
}
