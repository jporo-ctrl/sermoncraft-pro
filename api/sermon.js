export default async function handler(req, res) {
  try {
    const { prompt, sys, mode } = req.body;

    const maxTokens = mode === "deep" ? 4000 : 2000;

    const response = await fetch("https://api.anthropic.com/v1/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY
      },
      body: JSON.stringify({
        model: "claude-2.1",
        max_tokens_to_sample: maxTokens,
        temperature: 0.7,
        prompt:
          "\n\nHuman: " +
          (sys ? sys + "\n\n" : "") +
          prompt +
          "\n\nAssistant:"
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).send(text);
    }

    const data = await response.json();

    const text = data.completion || "";

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(text);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}