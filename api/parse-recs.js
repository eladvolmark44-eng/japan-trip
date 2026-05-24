const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 800;
const SYSTEM_PROMPT =
  "You are a Japan travel assistant. Parse the user's text and extract recommendations. " +
  "Return ONLY a JSON object of the shape {\"items\": [...]}, no markdown, no commentary. " +
  "Each item: {\"cat\":\"category\",\"title\":\"name\",\"desc\":\"short description\",\"loc\":\"location or empty\"}. " +
  "Categories must be one of: אטרקציות, מסעדות, קניות, לינה, טיפים כלליים.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing GROQ_API_KEY env var" });
    return;
  }
  const { text } = req.body || {};
  if (!text || !text.trim()) {
    res.status(400).json({ error: "Missing 'text' in request body" });
    return;
  }

  try {
    const upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Parse this into recommendations for a Japan trip:\n\n${text}`,
          },
        ],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(upstream.status).json({ error: "Groq API error", detail });
      return;
    }

    const data = await upstream.json();
    const raw = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      res.status(502).json({ error: "Model returned non-JSON output", raw });
      return;
    }

    const items = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(items)) {
      res.status(502).json({ error: "Model output has no items array", raw });
      return;
    }

    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
