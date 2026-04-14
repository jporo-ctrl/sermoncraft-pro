// /api/transcribe.js — OpenAI Whisper transcription
// Uses only Node built-ins — no external package imports

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "25mb",
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OpenAI API key not configured" });

  try {
    // Read raw body into buffer
    const chunks = [];
    await new Promise(function(resolve, reject) {
      req.on("data", function(chunk) { chunks.push(chunk); });
      req.on("end", resolve);
      req.on("error", reject);
    });

    const bodyBuffer = Buffer.concat(chunks);

    if (bodyBuffer.length > 24 * 1024 * 1024) {
      return res.status(413).json({ error: "Audio file too large. Keep recordings under 20 minutes." });
    }

    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
    if (!boundaryMatch) {
      return res.status(400).json({ error: "Invalid multipart request." });
    }

    const boundary = "--" + boundaryMatch[1];

    // Split buffer on boundary
    function splitBuffer(buf, sep) {
      var parts = [];
      var sepBuf = Buffer.from(sep);
      var start = 0;
      while (start < buf.length) {
        var idx = buf.indexOf(sepBuf, start);
        if (idx === -1) { parts.push(buf.slice(start)); break; }
        parts.push(buf.slice(start, idx));
        start = idx + sepBuf.length;
      }
      return parts;
    }

    var parts = splitBuffer(bodyBuffer, boundary);
    var fileBuffer = null;
    var fileType = "audio/webm";
    var fileName = "sermon.webm";

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      // Each part starts with \r\n and has headers then \r\n\r\n then body
      var headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
      if (headerEnd === -1) continue;
      var headerStr = part.slice(0, headerEnd).toString("utf8");
      if (!headerStr.includes('name="file"')) continue;

      // Extract filename
      var fnMatch = headerStr.match(/filename="([^"]+)"/);
      if (fnMatch) fileName = fnMatch[1];

      // Extract content-type
      var ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
      if (ctMatch) fileType = ctMatch[1].trim();

      // Body is after \r\n\r\n, strip trailing \r\n--
      var body = part.slice(headerEnd + 4);
      // Remove trailing \r\n if present
      if (body[body.length - 2] === 13 && body[body.length - 1] === 10) {
        body = body.slice(0, body.length - 2);
      }
      fileBuffer = body;
      break;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: "No audio file found in request. Please try recording again." });
    }

    // Build a new multipart form to send to OpenAI
    const newBoundary = "----SermonCraftBoundary" + Date.now();
    const CRLF = "\r\n";

    var formParts = [];

    // File part
    formParts.push(
      "--" + newBoundary + CRLF +
      'Content-Disposition: form-data; name="file"; filename="' + fileName + '"' + CRLF +
      "Content-Type: " + fileType + CRLF +
      CRLF
    );
    formParts.push(fileBuffer);
    formParts.push(CRLF);

    // Model part
    formParts.push(
      "--" + newBoundary + CRLF +
      'Content-Disposition: form-data; name="model"' + CRLF +
      CRLF +
      "whisper-1" + CRLF
    );

    // Language part
    formParts.push(
      "--" + newBoundary + CRLF +
      'Content-Disposition: form-data; name="language"' + CRLF +
      CRLF +
      "en" + CRLF
    );

    // Closing boundary
    formParts.push("--" + newBoundary + "--" + CRLF);

    var bodyParts = formParts.map(function(p) {
      return Buffer.isBuffer(p) ? p : Buffer.from(p, "utf8");
    });
    var formBody = Buffer.concat(bodyParts);

    var response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "multipart/form-data; boundary=" + newBoundary,
        "Content-Length": String(formBody.length),
      },
      body: formBody,
    });

    var responseText = await response.text();

    if (!response.ok) {
      console.error("Whisper error:", response.status, responseText);
      return res.status(response.status).json({ error: "Transcription failed: " + responseText.slice(0, 300) });
    }

    var data;
    try { data = JSON.parse(responseText); } catch (e) {
      return res.status(500).json({ error: "Unexpected response from Whisper API" });
    }

    return res.status(200).json({ transcript: data.text || "" });

  } catch (err) {
    console.error("Transcribe error:", err);
    return res.status(500).json({ error: err.message || "Transcription failed" });
  }
}
