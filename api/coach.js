// /api/coach.js — AI sermon delivery analysis using Anthropic

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transcript, sermonTitle, duration } = req.body;

  if (!transcript || transcript.trim().length < 100) {
    return res.status(400).json({ error: "Transcript too short to analyze" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Anthropic API key not configured" });
  }

  var wordCount = transcript.trim().split(/\s+/).length;
  var durationMinutes = duration ? Math.round(duration / 60) : null;
  var wordsPerMinute = durationMinutes ? Math.round(wordCount / durationMinutes) : null;

  // Count filler words
  var fillerWords = ["um", "uh", "like", "you know", "basically", "literally", "actually", "right", "okay so", "so um", "and um"];
  var fillerCounts = {};
  var lowerTranscript = transcript.toLowerCase();
  fillerWords.forEach(function(word) {
    var regex = new RegExp("\\b" + word + "\\b", "gi");
    var matches = lowerTranscript.match(regex);
    if (matches && matches.length > 0) fillerCounts[word] = matches.length;
  });
  var totalFillers = Object.values(fillerCounts).reduce(function(a, b) { return a + b; }, 0);

  var systemPrompt = `You are an expert sermon delivery coach with 20 years of experience coaching pastors. 
Analyze the provided sermon transcript and return ONLY a valid JSON object with no markdown, no code fences, no preamble.

The JSON must have this exact structure:
{
  "overallScore": <number 0-100>,
  "grades": {
    "structure": <number 0-100>,
    "clarity": <number 0-100>,
    "engagement": <number 0-100>,
    "scriptureUsage": <number 0-100>,
    "application": <number 0-100>
  },
  "strengths": [<string>, <string>, <string>],
  "improvements": [<string>, <string>, <string>],
  "structureAnalysis": "<paragraph analyzing sermon structure>",
  "clarityAnalysis": "<paragraph analyzing language clarity>",
  "engagementAnalysis": "<paragraph analyzing congregation engagement techniques>",
  "scriptureAnalysis": "<paragraph analyzing scripture usage>",
  "applicationAnalysis": "<paragraph analyzing practical application>",
  "topCoachingTip": "<single most important actionable tip>",
  "encouragement": "<one sentence of genuine pastoral encouragement>"
}`;

  var userPrompt = `Analyze this sermon transcript as a delivery coach.
${sermonTitle ? "Sermon Title: " + sermonTitle : ""}
${wordCount ? "Word Count: " + wordCount : ""}
${wordsPerMinute ? "Estimated Pace: " + wordsPerMinute + " words per minute" : ""}
${totalFillers > 0 ? "Filler words detected: " + JSON.stringify(fillerCounts) + " (total: " + totalFillers + ")" : ""}

TRANSCRIPT:
${transcript.slice(0, 8000)}

Return ONLY the JSON object. No markdown, no explanation.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: userPrompt }],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: "Analysis failed: " + errText });
    }

    const data = await response.json();
    var raw = data.content?.[0]?.text || "";
    var cleaned = raw.replace(/```json|```/g, "").trim();

    try {
      var result = JSON.parse(cleaned);
      return res.status(200).json({
        ...result,
        wordCount,
        wordsPerMinute,
        fillerCounts,
        totalFillers,
        duration: durationMinutes,
      });
    } catch (parseErr) {
      return res.status(500).json({ error: "Failed to parse analysis result" });
    }

  } catch (err) {
    console.error("Coach route error:", err);
    return res.status(500).json({ error: err.message || "Analysis failed" });
  }
}
