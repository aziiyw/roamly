// vervia client-side configuration.
//
// The API key is now HIDDEN — it lives inside the Cloudflare Worker, not here.
// The browser calls the proxy, the proxy adds the key and calls GLM.
// Visitors can use the site but CANNOT see your key.
//
window.VERVIA_CONFIG = {
  // Proxy URL — the Cloudflare Worker that holds your key
  glmProxyUrl: 'https://roamly-proxy.amber-zhangr.workers.dev',

  // No key here anymore — the proxy has it
  glmApiKey: '',

  glmModel: 'glm-5v-turbo',
  glmEndpoint: 'https://api.z.ai/api/paas/v4/chat/completions'
};
