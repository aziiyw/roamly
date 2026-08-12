// Roamly client-side configuration.
//
// TWO WAYS TO PROVIDE THE API KEY:
//
// OPTION A — PROXY (recommended, key is hidden):
// Deploy the Cloudflare Worker in worker/proxy.js, set GLM_API_KEY as a
// Worker secret, then paste the worker URL below. Leave glmApiKey empty.
// Visitors can use the site but CANNOT see your key.
//
// OPTION B — DIRECT (key is public, simpler):
// Leave glmProxyUrl empty and paste your Z.AI key in glmApiKey.
// Anyone can find the key in their browser dev tools. Use a throwaway key.
//
window.ROAMLY_CONFIG = {
  // OPTION A: paste your worker URL here to hide the key:
  glmProxyUrl: '',  // e.g. 'https://roamly-proxy.yourname.workers.dev/api/analyze'

  // OPTION B: paste your Z.AI key here (public — use throwaway key):
  glmApiKey: '3c1901bbc1054cdd903185e5ad5ee62d.JBRKybarxlENjgva',

  glmModel: 'glm-5v-turbo',
  glmEndpoint: 'https://api.z.ai/api/paas/v4/chat/completions'
};
