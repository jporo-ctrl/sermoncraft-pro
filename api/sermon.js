console.log("ENV KEYS:", Object.keys(process.env));
console.log("ANTHROPIC KEY:", process.env.ANTHROPIC_API_KEY);
export const config = {
  runtime: "nodejs",
};
import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    const { prompt, sys } = body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      system: sys || "You are a powerful sermon-generating assistant.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text =
      response?.content?.[0]?.text || "No response generated";

    return res.status(200).json({
      sermon: text,
    });

  } catch (err) {
    return res.status(500).json({
      error: "AI request failed",
      detail: String(err),
    });
  }
}