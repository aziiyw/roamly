# vervia

A travel language companion: scan a sign, menu, or ticket in a foreign language and vervia translates it naturally, then keeps the useful words in a little memory book.

## Deploy on GitHub Pages (default, no backend)

vervia runs entirely in the browser — no Vercel, no server. The only thing it needs is a Z.AI key so it can call the `glm-5v-turbo` vision model.

1. **Add your Z.AI key.** Open `config.js` and replace `PASTE-YOUR-THROWAWAY-ZAI-KEY-HERE` with a key from https://z.ai/.
   - ⚠️ **The key is public.** Anyone visiting your site can read it in their browser dev tools. Use a *throwaway* key with a low quota that you can rotate or delete at any time. Do not reuse a key that protects anything important.
2. **Push to GitHub** on the `main` branch.
3. **Enable Pages.** Repo → Settings → Pages → Build and deployment → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
4. Your site goes live at `https://<your-username>.github.io/vervia/` within about a minute.

To rotate a leaked or stale key: delete it at z.ai, generate a new one, update `config.js`, commit, push. Done.

`config.example.js` shows the expected `config.js` shape if you ever need to recreate it.

## Optional: Vercel (if you want a secret key)

If you'd rather keep the key server-side, the project still ships a Vercel serverless function at `api/analyze.js`. On Vercel the browser calls `/api/analyze` and the key stays secret.

1. Create a new Vercel project from this folder.
2. In **Project Settings → Environment Variables**, add `GLM_API_KEY` with a Z.AI key.
3. Deploy.

On Vercel you can leave `config.js` as the placeholder — it's never used; `api/analyze.js` is used instead.
