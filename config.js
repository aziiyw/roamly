// vervia client-side configuration.
//
// The API keys are HIDDEN — they live inside the Cloudflare Worker, not here.
// The browser calls the proxy; the proxy adds the key and calls the model.
// Visitors can use the site but CANNOT see your keys.
//
// The worker has three routes:
//   POST /            → Z.AI glm-5v-turbo         (GLM_API_KEY secret)
//   POST /api/groq    → Groq qwen/qwen3.6-27b     (GROQ_API_KEY secret)
//   POST /api/mistral → Mistral mistral-small     (MISTRAL_API_KEY secret)
//
// Providers are tried in order: Z.AI first, then Groq, then Mistral.
// To remove a tier, just delete its proxy URL below (and its secret on the
// worker).
//
window.VERVIA_CONFIG = {
  // Z.AI proxy — tried first
  glmProxyUrl: 'https://roamly-proxy.amber-zhangr.workers.dev',

  // Groq proxy — tried if Z.AI fails
  groqProxyUrl: 'https://roamly-proxy.amber-zhangr.workers.dev/api/groq',

  // Mistral proxy — tried if both Z.AI and Groq fail
  mistralProxyUrl: 'https://roamly-proxy.amber-zhangr.workers.dev/api/mistral',

  // No keys here — the worker has them
  glmApiKey: '',

  glmModel: 'glm-5v-turbo',
  glmEndpoint: 'https://api.z.ai/api/paas/v4/chat/completions'
};
