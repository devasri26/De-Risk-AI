import axios from "axios";

export const analyzeProject = async (idea) => {
  try {
    if (!idea) throw new Error("Idea is required");

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not defined in the server environment variables.");
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",

        messages: [
          {
            role: "system",
            content: `
You are a senior software architect and startup evaluator.

You evaluate project ideas like a Y Combinator investor.

You MUST return ONLY valid JSON.
No markdown, no explanation, no text.

IMPORTANT RULES:
- Never return empty arrays
- Always give real meaningful content
- confidenceScore must be between 1 and 100
- Be strict, realistic, and analytical
`
          },
          {
            role: "user",
            content: `
Analyze this project idea deeply:

"${idea}"

Return ONLY JSON in this format:

{
  "risks": [
    {
      "risk": "Name of the risk (e.g. Technical Risk, Scalability Risk, Market Risk)",
      "severity": "High" | "Medium" | "Low",
      "description": "A detailed explanation of the specific risk and why it applies here."
    }
  ],
  "failureReasons": [
    "First specific reason why this project might fail.",
    "Second reason...",
    "Third reason..."
  ],
  "challenges": [
    "First operational/technical challenge.",
    "Second challenge..."
  ],
  "solutions": [
    {
      "challenge": "Core challenge matching one from the list...",
      "solution": "Actionable, technical, or business solution to mitigate this challenge."
    }
  ],
  "confidenceScore": 1-100
}
`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let text = response.data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("Empty response from AI service.");
    }

    // 🧹 SAFE CLEANUP (important for JSON issues)
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🧠 parse safely
    const parsed = JSON.parse(text);

    // Validate fields exist and conform
    return {
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      failureReasons: Array.isArray(parsed.failureReasons) ? parsed.failureReasons : [],
      challenges: Array.isArray(parsed.challenges) ? parsed.challenges : [],
      solutions: Array.isArray(parsed.solutions) ? parsed.solutions : [],
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 50
    };
  } catch (error) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error("OpenRouter Error Details:", errorDetails);
    throw new Error(`AI Service Failed: ${errorDetails}`);
  }
};