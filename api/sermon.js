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
    const { prompt, sys, mode } = req.body;

    const isDeep = mode === "deep";
    const model = isDeep ? "claude-sonnet-4-20250514" : "claude-haiku-4-5-20251001";
    const maxTokens = isDeep ? 12000 : 8000;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens,
        temperature: 0.7,
        system: sys,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).send(text);
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

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
            if (text) {
              res.write(text);
            }
          }
        } catch (e) {}
      }
    }

    res.end();

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}