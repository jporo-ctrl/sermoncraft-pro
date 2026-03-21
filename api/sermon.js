export default async function handler(req, res) {
  const rawKey = process.env.ANTHROPIC_API_KEY;

  return res.status(200).json({
    sermon: rawKey
      ? `KEY CHECK: present (${rawKey.slice(0, 7)})`
      : "KEY CHECK: missing"
  });
}