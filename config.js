// vervia client-side configuration.
//
// The API keys are HIDDEN — they live inside the Cloudflare Worker, not here.
// The browser calls the proxy; the proxy adds the key and calls the model.
// Visitors can use the site but CANNOT see your keys.
//
// The worker has two routes:
//   POST /            → Z.AI glm-5v-turbo      (GLM_API_KEY secret)
//   POST /api/groq    → Groq qwen3.6-27b vision (GROQ_API_KEY secret)
//
// Z.AI is tried first; if it fails (rate limit, etc.) the site transparently
// falls back to Groq. To disable Groq, just remove groqProxyUrl below.
//
window.VERVIA_CONFIG = {
  // Z.AI proxy — tries first
  glmProxyUrl: 'https://roamly-proxy.amber-zhangr.workers.dev',

  // Groq proxy — tried if Z.AI fails
  groqProxyUrl: 'https://roamly-proxy.amber-zhangr.workers.dev/api/groq',

  // No keys here — the worker has them
  glmApiKey: '',

  glmModel: 'glm-5v-turbo',
  glmEndpoint: 'https://api.z.ai/api/paas/v4/chat/completions'
};
