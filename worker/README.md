# Roamly GLM Proxy (Cloudflare Worker)

This worker hides your Z.AI API key from the browser. The site POSTs the
uploaded image here, the worker adds the key and calls `glm-5v-turbo`, and
streams the result back. Visitors can use the site but can never see your
key.

## One-time setup

1. **Install the Wrangler CLI** (if you don't have it):
   ```
   npm install -g wrangler
   ```
2. **Log in to Cloudflare** — it opens a browser:
   ```
   wrangler login
   ```
3. **Deploy the worker** from this folder:
   ```
   wrangler deploy
   ```
   Wrangler prints the deployed URL, e.g.
   `https://roamly-proxy.YOUR-SUBDOMAIN.workers.dev`.

4. **Set the secret** (your Z.AI key — never committed to git):
   ```
   wrangler secret put GLM_API_KEY
   ```
   Paste your key when prompted. Get one at https://z.ai/.

5. **Point the site at the worker.** Open `../config.js` and set:
   ```js
   glmProxyUrl: 'https://roamly-proxy.YOUR-SUBDOMAIN.workers.dev',
   glmApiKey:   '',   // empty — the worker has the key now
   ```
   (The trailing slash is optional; the value here is what the browser
   POSTs to.)

6. **Commit and push** the site. Hard-refresh
   (`Cmd/Ctrl+Shift+R`) to bust the cached `config.js`.

## Redeploying

After you edit `proxy.js`:

```
wrangler deploy
```

## Rotating the key

```
wrangler secret put GLM_API_KEY
```

(paste the new key when prompted). The worker picks it up on the next
request — no redeploy needed.

## How the request/response shape works

The browser sends:

```
POST <glmProxyUrl>
Content-Type: application/json

{ "image": "data:image/jpeg;base64,..." }
```

The worker returns the same shape `app.js` expects:

```json
{ "content": "<raw model output string>" }
```

If anything goes wrong you'll get `{ "error": "..." }` with a non-2xx
status. `app.js` already handles both shapes.

## Cost / limits

Cloudflare Workers free tier: 100,000 requests/day. More than enough for a
personal site. The Z.AI key still has its own quota — keep it throwaway.