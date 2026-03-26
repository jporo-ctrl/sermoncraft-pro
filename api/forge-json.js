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

    const maxTokens = mode === "fast" ? 900 : 1500;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY.trim(),
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: sys || "You are a powerful AI assistant. Return exactly what the user requests.",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: "AI request failed", detail: text });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (let line of lines) {
        if (!line.startsWith("data:")) continue;
        const json = line.replace("data:", "").trim();
        if (!json || json === "[DONE]") continue;

        try {
          const parsed = JSON.parse(json);
          if (parsed.type === "content_block_delta") {
            const text = parsed.delta?.text;
            if (text) accumulated += text;
          }
        } catch (e) {}
      }
    }

    return res.status(200).json({ result: accumulated });

  } catch (err) {
    return res.status(500).json({
      error: "AI request failed",
      detail: String(err),
    });
  }
}