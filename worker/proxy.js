/**
 * Roamly GLM Proxy — Cloudflare Worker
 *
 * This hides your Z.AI API key so visitors can use Roamly without seeing it.
 * The browser calls THIS worker; the worker adds the key and calls GLM.
 *
 * Deploy:
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Name it "roamly-proxy", paste this code, click Deploy
 * 3. Go to Settings → Variables → add GLM_API_KEY with your Z.AI key
 * 4. Copy the worker URL (e.g. https://roamly-proxy.your-subdomain.workers.dev)
 * 5. In Roamly's config.js, set:
 *      glmProxyUrl: 'https://roamly-proxy.your-subdomain.workers.dev/api/analyze'
 *      glmApiKey: ''   (leave empty — the worker has the key now)
 * 6. Push to GitHub. Your key is now hidden from the browser!
 */

const SYSTEM_PROMPT = `You are Roamly, a kind travel-language companion. Analyse a photo containing foreign-language text. Return ONLY valid JSON with this exact shape:
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

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    if (!env.GLM_API_KEY) {
      return json({ error: 'GLM_API_KEY is not set on the worker.' }, 500);
    }

    try {
      const { image } = await request.json();
      if (!image || !image.startsWith('data:image/')) {
        return json({ error: 'Please upload an image.' }, 400);
      }

      const glmResp = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GLM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-5v-turbo',
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: image } },
              { type: 'text', text: SYSTEM_PROMPT },
            ],
          }],
          thinking: { type: 'disabled' },
          temperature: 0.2,
        }),
      });

      if (!glmResp.ok) {
        return json({ error: `GLM request failed (${glmResp.status})` }, 502);
      }

      const glmData = await glmResp.json();
      const content = glmData.choices?.[0]?.message?.content || '';
      return json({ content }, 200);
    } catch (err) {
      return json({ error: err.message || 'Could not analyse this image.' }, 500);
    }
  },
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
