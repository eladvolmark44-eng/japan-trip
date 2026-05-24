const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 800;
const SYSTEM_PROMPT =
  "You are a Japan travel assistant. Parse the user's text and extract recommendations. " +
  "Return ONLY valid JSON, no markdown. Categories: אטרקציות, מסעדות, קניות, לינה, טיפים כלליים";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing ANTHROPIC_API_KEY env var" });
    return;
  }
  const { text } = req.body || {};
  if (!text || !text.trim()) {
    res.status(400).json({ error: "Missing 'text' in request body" });
    return;
  }

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content:
              `Parse this into recommendations for a Japan trip. Return JSON array: ` +
              `[{"cat":"category","title":"name","desc":"short description","loc":"location or empty"}]\n\n${text}`,
          },
        ],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(upstream.status).json({ error: "Anthropic API error", detail });
      return;
    }

    const data = await upstream.json();
    const raw = data.content?.[0]?.text || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let items;
    try {
      items = JSON.parse(cleaned);
    } catch (parseErr) {
      res.status(502).json({ error: "Model returned non-JSON output", raw });
      return;
    }
    if (!Array.isArray(items)) {
      res.status(502).json({ error: "Model output is not an array", raw });
      return;
    }

    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
