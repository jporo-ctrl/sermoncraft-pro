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
    const { prompt, sys, mode } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const model =
      mode === "fast"
        ? "claude-haiku-4-5-20251001"
        : "claude-sonnet-4-6";

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const stream = await client.messages.stream({
      model,
      max_tokens: mode === "fast" ? 900 : 1500,
      system:
        sys ||
        "You are a powerful sermon-generating assistant. Write clearly, biblically, structured.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta") {
        const text = chunk.delta?.text || "";
        res.write(text);
      }
    }

    return res.end();
  } catch (err) {
    return res.status(500).json({
      error: "AI request failed",
      detail: String(err),
    });
  }
}