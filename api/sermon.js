export default function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        sermon: "GET test works"
      });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const prompt =
        typeof body === "string"
          ? body
          : body.prompt || "none";

      return res.status(200).json({
        sermon: `Backend received prompt: ${prompt}`
      });
    }

    return res.status(405).json({
      error: "Method not allowed"
    });
  } catch (err) {
    return res.status(500).json({
      error: "SERVER CRASH",
      detail: String(err)
    });
  }
}