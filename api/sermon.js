export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      sermon: "GET test works"
    });
  }

  if (req.method === "POST") {
    try {
      const { prompt, sys, web } = req.body || {};

      return res.status(200).json({
        sermon: `Backend received prompt: ${prompt || "none"}`
      });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}