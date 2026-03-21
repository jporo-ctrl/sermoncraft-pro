import Anthropic from "@anthropic-ai/sdk";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const body = await req.json();
    const { prompt, sys, mode } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
      });
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

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta") {
              const text = chunk.delta?.text || "";
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "AI request failed",
        detail: String(err),
      }),
      { status: 500 }
    );
  }
}