export default async function handler(req, res) {
  try {
    const { prompt, sys, mode } = req.body;

    const maxTokens = mode === "deep" ? 4000 : 2000;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: maxTokens,
        temperature: 0.7,
        system: sys,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).send(text);
    }

    const data = await response.json();

    const text =
      data?.content?.map(c => c.text).join("") ||
      "";

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(text);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}