// /api/forge-json.js — JSON API for structured tools (Word Study, Topic Engine, etc.)

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

  // Rate limit: 20 requests per minute per IP
  if (!checkRateLimit(req, 20, 60 * 1000)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment before trying again." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API not configured" });

  const { prompt, sys, mode } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  // Ping/warmup call
  if (prompt === "ping" && sys === "ping") {
    return res.status(200).json({ result: "ok" });
  }

  const deep = mode === "deep";
  const model = deep ? "claude-opus-4-6" : "claude-sonnet-4-6";
  const maxTokens = deep ? 4000 : 2000;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: sys || "You are an expert ministry assistant. Return only valid JSON.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      var errData = await response.json().catch(function() { return {}; });
      return res.status(response.status).json({ error: errData.error?.message || "API error" });
    }

    var data = await response.json();
    var text = data.content?.[0]?.text || "";
    return res.status(200).json({ result: text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
