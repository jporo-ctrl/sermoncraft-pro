import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    const { prompt, sys, mode } = body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const selectedModel =
      mode === "fast"
        ? "claude-haiku-4-5-20251001"
        : "claude-sonnet-4-6";

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY.trim(),
    });

    const response = await client.messages.create({
      model: selectedModel,
      max_tokens: mode === "fast" ? 900 : 1500,
      system:
        sys ||
        "You are a powerful sermon-generating assistant. Write clearly, biblically, with strong structure and practical application.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      cache_control: { type: "ephemeral" },
    });

    const text =
      response?.content
        ?.filter((item) => item.type === "text")
        ?.map((item) => item.text)
        ?.join("\n") || "No response generated";

    return res.status(200).json({
      sermon: text,
      model: selectedModel,
      mode: mode || "deep",
    });
  } catch (err) {
    return res.status(500).json({
      error: "AI request failed",
      detail: String(err),
    });
  }
}