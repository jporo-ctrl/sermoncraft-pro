export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      sermon: "GET test works"
    });
  }

  if (req.method === "POST") {
    return res.status(200).json({
      sermon: "POST test works"
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}