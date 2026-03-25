import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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

    const model =
      mode === "fast"
        ? "claude-haiku-4-5-20251001"
        : "claude-sonnet-4-6";

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY.trim(),
    });

    const response = await client.messages.create({
      model,
      max_tokens: mode === "fast" ? 900 : 1500,
      system:
        sys ||
        "You are a powerful AI assistant. Return exactly what the user requests.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text =
      response?.content
        ?.filter((item) => item.type === "text")
        ?.map((item) => item.text)
        ?.join("\n") || "";

    return res.status(200).json({ result: text });
  } catch (err) {
    return res.status(500).json({
      error: "AI request failed",
      detail: String(err),
    });
  }
}