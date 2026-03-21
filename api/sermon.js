export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      sermon: "GET test works"
    });
  }

if (req.method === "POST") {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { prompt, sys, web } = body;

    return res.status(200).json({
      sermon: `Backend received prompt: ${prompt || "none"} | sys: ${sys ? "yes" : "no"} | web: ${String(web)}`
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      detail: String(error)
    });
  }
}