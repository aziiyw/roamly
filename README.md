# vervia

A travel language companion: scan a sign, menu, or ticket in a foreign language and vervia translates it naturally, then keeps the useful words in a little memory book.

## Recommended setup: Cloudflare Worker (key stays secret)

The site on GitHub Pages has no backend. To use Z.AI without exposing
your API key in the browser, deploy the included Worker proxy — it holds
the key and forwards requests. Your visitors never see the key.

**One repo + one Worker, about five minutes:**

1. **Deploy the proxy.** See [`worker/README.md`](worker/README.md).
   It's three commands: `wrangler login`, `wrangler deploy`,
   `wrangler secret put GLM_API_KEY`. You'll get a URL like
   `https://roamly-proxy.YOUR-SUBDOMAIN.workers.dev`.
2. **Point the site at the proxy.** Open `config.js` and set:
   ```js
   glmProxyUrl: 'https://roamly-proxy.YOUR-SUBDOMAIN.workers.dev',
   glmApiKey:   '',   // empty — the worker has the key
   ```
3. **Push to GitHub** on the `main` branch.
4. **Enable Pages.** Repo → Settings → Pages → Build and deployment →
   Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
5. Your site goes live at `https://<your-username>.github.io/vervia/`
   within about a minute. Hard-refresh (`Cmd/Ctrl+Shift+R`) to bust the
   cached `config.js`.

To rotate a leaked or stale key: `wrangler secret put GLM_API_KEY`. Done.

## Alternative: put the key directly in `config.js` (easiest, NOT secret)

If you don't want to deploy a Worker, you can paste a key straight into
`config.js`. The key will be public (anyone can read it in browser dev
tools), so use a *throwaway* Z.AI key with a low quota that you can
rotate or delete.

1. Open `config.js` and set `glmApiKey` to a key from https://z.ai/.
2. Push to GitHub, enable Pages (steps3–5 above).

`config.example.js` shows the expected `config.js` shape if you ever need
to recreate it.

## Optional: Vercel (also keeps the key secret)

If you'd rather use Vercel instead of Cloudflare, the project ships a
Vercel serverless function at `api/analyze.js`. On Vercel the browser
calls `/api/analyze` and the key stays secret.

1. Create a new Vercel project from this folder.
2. In **Project Settings → Environment Variables**, add `GLM_API_KEY`
   with a Z.AI key.
3. Deploy.

On Vercel you can leave `config.js` as the placeholder — it's never
used; `api/analyze.js` is used instead.