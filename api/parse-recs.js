const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_OUTPUT_TOKENS = 800;
const SYSTEM_PROMPT =
  "You are a Japan travel assistant. Parse the user's text and extract recommendations. " +
  "Return ONLY a valid JSON array, no markdown, no commentary. " +
  "Categories must be one of: אטרקציות, מסעדות, קניות, לינה, טיפים כלליים. " +
  'Each item shape: {"cat":"category","title":"name","desc":"short description","loc":"location or empty"}.';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing GEMINI_API_KEY env var" });
    return;
  }
  const { text } = req.body || {};
  if (!text || !text.trim()) {
    res.status(400).json({ error: "Missing 'text' in request body" });
    return;
  }

  try {
    const upstream = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  `Parse this into a JSON array of recommendations for a Japan trip:\n\n${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: 0.2,
        },
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(upstream.status).json({ error: "Gemini API error", detail });
      return;
    }

    const data = await upstream.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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
