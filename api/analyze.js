// LEGACY — Vercel serverless function. Set GLM_API_KEY in Vercel's Environment Variables.
//
// vervia now runs entirely on GitHub Pages and calls GLM client-side via
// config.js + the analyzeImageClientSide() helper in app.js. This function is
// NOT used on Pages. It's kept here so the project still deploys to Vercel as a
// fallback if you ever want a secret key (see README.md → Vercel).
const SYSTEM_PROMPT = `You are vervia, a kind travel-language companion. Analyse a photo containing foreign-language text. Return ONLY valid JSON with this exact shape:
{
  "detectedText":"...",
  "translation":"...",
  "romanisation":"...",
  "naturalNote":"...",
  "vocabulary":[{
    "word":"...", "reading":"...", "meaning":"...", "category":"Food|Transport|Shopping|Hotels|Directions|Signs", "importance":"high|medium", "box":{"x":0,"y":0,"width":0,"height":0}
  }]
}
Choose at most 5 useful, common travel words. Coordinates must be normalized 0–1000 relative to the image, and the translation should sound natural in English.`;

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GLM_API_KEY) return response.status(500).json({ error: 'GLM_API_KEY is not configured on the server.' });

  try {
    const { image } = request.body || {};
    if (!image?.startsWith('data:image/')) return response.status(400).json({ error: 'Please upload an image.' });

    const glmResponse = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GLM_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'glm-5v-turbo',
        messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: image } }, { type: 'text', text: SYSTEM_PROMPT }] }],
        thinking: { type: 'disabled' },
        temperature: 0.2
      })
    });
    if (!glmResponse.ok) throw new Error(`GLM request failed (${glmResponse.status})`);
    const glmData = await glmResponse.json();
    const content = glmData.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.replace(/^```json\s*|\s*```$/g, '').trim());
    return response.status(200).json(json);
  } catch (error) {
    return response.status(500).json({ error: error.message || 'Could not analyse this image.' });
  }
}
