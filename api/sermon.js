// /api/sermon.js — Streaming sermon generation with rate limiting

const ipStore = new Map();

function getIP(req) {
  return req.headers["x-real-ip"] || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
}

function checkRateLimit(req, max, windowMs) {
  var ip = getIP(req);
  var now = Date.now();
  var record = ipStore.get(ip);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
    ipStore.set(ip, record);
  }
  record.count++;
  if (ipStore.size > 5000) {
    for (var [k, v] of ipStore.entries()) { if (now > v.resetAt) ipStore.delete(k); }
  }
  return record.count <= max;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit: 30 requests per minute per IP
  if (!checkRateLimit(req, 30, 60 * 1000)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment before generating again." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API not configured" });

  const { prompt, sys, deep } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  const model = deep ? "claude-opus-4-6" : "claude-sonnet-4-6";
  const maxTokens = deep ? 8000 : 5000;

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        stream: true,
        system: sys || "You are an expert sermon writer.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      var errData = await anthropicRes.json().catch(function() { return {}; });
      return res.status(anthropicRes.status).json({ error: errData.error?.message || "API error" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    var reader = anthropicRes.body.getReader();
    var decoder = new TextDecoder();
    var buffer = "";

    while (true) {
      var { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      var lines = buffer.split("\n");
      buffer = lines.pop();
      for (var line of lines) {
        if (!line.startsWith("data: ")) continue;
        var data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          var parsed = JSON.parse(data);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            res.write("data: " + JSON.stringify({ text: parsed.delta.text }) + "\n\n");
          }
        } catch (e) {}
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}
