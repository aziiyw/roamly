/**
 * vervia vision proxy — Cloudflare Worker
 *
 * Routes:
 *   POST /            → Z.AI glm-5v-turbo (uses GLM_API_KEY secret)
 *   POST /api/groq    → Groq qwen/qwen3.6-27b vision (uses GROQ_API_KEY secret)
 *
 * Both routes accept { "image": "data:image/..." } and return { "content": "..." }
 * shaped to match what app.js's parseGLMJson() expects. app.js falls through to
 * the Groq route if the Z.AI route fails.
 *
 * Secrets (set with `wrangler secret put <NAME>`):
 *   GLM_API_KEY   — Z.AI key
 *   GROQ_API_KEY  — Groq key (free at https://console.groq.com/keys)
 */

const SYSTEM_PROMPT = `You are vervia, a kind travel-language companion. Analyse a photo containing foreign-language text.

Return ONLY a single raw JSON object — no markdown, no code fences, no explanation, no preamble. The JSON must have exactly this shape:
{
  "detectedText":"...",
  "translation":"...",
  "romanisation":"...",
  "naturalNote":"...",
  "vocabulary":[{
    "word":"...", "reading":"...", "meaning":"...", "category":"Food|Transport|Shopping|Hotels|Directions|Signs", "importance":"high|medium", "box":{"x":0,"y":0,"width":0,"height":0}
  }]
}

Rules:
- If the image contains no foreign-language text, return an empty vocabulary array and explain briefly in naturalNote.
- Choose at most 5 useful, common travel words.
- Coordinates in the box must be normalized 0–1000 relative to the image (use 0 if unsure).
- The translation should sound natural in English.`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const url = new URL(request.url);
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: 'Invalid JSON body.' }, 400);
    }
    const image = body?.image;
    if (!image || !image.startsWith('data:image/')) {
      return json({ error: 'Please upload an image.' }, 400);
    }

    if (url.pathname === '/api/groq') {
      return handleGroq(image, env);
    }
    // Default route — Z.AI
    return handleZai(image, env);
  },
};

async function handleZai(image, env) {
  if (!env.GLM_API_KEY) {
    return json({ error: 'GLM_API_KEY is not set on the worker.' }, 500);
  }
  try {
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
      const errBody = await glmResp.text();
      let detail = errBody;
      try { detail = JSON.parse(errBody)?.error?.message || errBody; } catch(e) {}
      return json({ error: `GLM error (${glmResp.status}): ${detail}` }, 502);
    }
    const glmData = await glmResp.json();
    const content = glmData.choices?.[0]?.message?.content || '';
    return json({ content }, 200);
  } catch (err) {
    return json({ error: `GLM request failed: ${err.message || 'unknown'}` }, 502);
  }
}

async function handleGroq(image, env) {
  if (!env.GROQ_API_KEY) {
    return json({ error: 'GROQ_API_KEY is not set on the worker.' }, 500);
  }
  try {
    const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Groq's currently-supported vision model. See
        // https://console.groq.com/docs/vision
        model: 'qwen/qwen3.6-27b',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: image } },
            { type: 'text', text: SYSTEM_PROMPT },
          ],
        }],
        temperature: 0.2,
        // Note: Groq's qwen model sometimes returns JSON wrapped in markdown
        // fences even with response_format set. We let the worker accept any
        // text response and parse it ourselves in app.js's parseGLMJson(),
        // which handles both plain JSON and ```json ... ``` blocks.
      }),
    });
    if (!groqResp.ok) {
      const errBody = await groqResp.text();
      let detail = errBody;
      try { detail = JSON.parse(errBody)?.error?.message || errBody; } catch(e) {}
      return json({ error: `Groq error (${groqResp.status}): ${detail}` }, 502);
    }
    const groqData = await groqResp.json();
    const content = groqData.choices?.[0]?.message?.content || '';
    return json({ content }, 200);
  } catch (err) {
    return json({ error: `Groq request failed: ${err.message || 'unknown'}` }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}