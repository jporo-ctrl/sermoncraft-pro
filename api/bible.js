// /api/bible.js — Fetch Bible verse text via API.Bible (scripture.api.bible)
// Uses KJV by default (public domain, no copyright issues)
// API key stored as BIBLE_API_KEY in Vercel env

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST required" });

  const { passage, version } = req.body;
  if (!passage) return res.status(400).json({ error: "passage is required" });

  const apiKey = process.env.BIBLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Bible API not configured" });

  // Bible IDs on API.Bible
  // KJV:  de4e12af7f28f599-02
  // ASV:  685d1470fe4d5c3b-01  (public domain)
  // WEB:  9879dbb7cfe39e4d-04  (public domain, World English Bible)
  const BIBLE_IDS = {
    kjv: "de4e12af7f28f599-02",
    asv: "685d1470fe4d5c3b-01",
    web: "9879dbb7cfe39e4d-04",
  };

  var bibleId = BIBLE_IDS[version] || BIBLE_IDS.kjv;
  var versionName = version === "asv" ? "ASV" : version === "web" ? "WEB" : "KJV";

  try {
    // Search for the passage using API.Bible search endpoint
    var searchUrl = "https://api.scripture.api.bible/v1/bibles/" + bibleId +
      "/search?query=" + encodeURIComponent(passage) + "&limit=5&sort=relevance";

    var searchResp = await fetch(searchUrl, {
      headers: { "api-key": apiKey },
    });
    var searchData = await searchResp.json();

    if (!searchResp.ok) {
      // Fall back to passage endpoint
      return await fetchByPassageId(req, res, bibleId, passage, versionName, apiKey);
    }

    var verses = searchData.data && searchData.data.verses;
    if (verses && verses.length > 0) {
      var combinedText = verses.map(function(v) {
        return v.text ? v.text.replace(/<[^>]+>/g, "").trim() : "";
      }).filter(Boolean).join(" ");

      var reference = verses[0].reference || passage;
      return res.status(200).json({
        reference: reference,
        text: combinedText,
        version: versionName,
        source: "API.Bible — American Bible Society",
      });
    }

    return await fetchByPassageId(req, res, bibleId, passage, versionName, apiKey);

  } catch (err) {
    console.error("Bible API error:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function fetchByPassageId(req, res, bibleId, passage, versionName, apiKey) {
  try {
    // Try passage endpoint with the reference as-is
    var passageId = passage.replace(/\s+/g, ".").replace(/:/g, ".").replace(/-/g, "-");
    var url = "https://api.scripture.api.bible/v1/bibles/" + bibleId +
      "/passages/" + encodeURIComponent(passageId) +
      "?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true";

    var resp = await fetch(url, { headers: { "api-key": apiKey } });
    var data = await resp.json();

    if (resp.ok && data.data && data.data.content) {
      var text = data.data.content.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      return res.status(200).json({
        reference: data.data.reference || passage,
        text: text,
        version: versionName,
        source: "API.Bible — American Bible Society",
      });
    }

    return res.status(404).json({ error: "Passage not found. Please check the reference format (e.g. John 3:16)." });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
