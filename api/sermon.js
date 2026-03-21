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

    const rawKey = process.env.ANTHROPIC_API_KEY;

    return res.status(200).json({
      sermon: rawKey
        ? `KEY CHECK: present (${rawKey.slice(0, 7)})`
        : "KEY CHECK: missing"
    });

  } catch (err) {
    return res.status(500).json({
      error: "AI request failed",
      detail: String(err),
    });
  }
}