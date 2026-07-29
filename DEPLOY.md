# Deploying ToolHub to Cloudflare Workers

ToolHub is a **static-first Cloudflare Worker**: the Worker (`src/index.js`) only
adds security headers + pretty-URL routing, and all pages in `public/` are served
as free, unlimited static assets. No D1/KV/R2 is required.

## One-click deploy

### Windows
1. Double-click **`deploy.bat`**.
2. Paste your Cloudflare API Token when prompted (or hardcode it at the top).
3. Wait for the browser to open your live site.

### macOS / Linux
```bash
bash deploy.sh
```

## What the script does
1. **Network pre-check** — confirms Cloudflare API is reachable.
2. **`npm install`** — installs Wrangler (first run only).
3. **`wrangler whoami`** — verifies your API token/account.
4. **`node build/build.mjs`** — rebuilds all pages, sitemap and robots.
5. **Unit tests** — runs the fast Node test suite (set `RUN_TESTS=0` to skip).
6. **`wrangler deploy`** — uploads Worker + `public/`, with up to 3 retries.
7. **Warm-up** — pings the homepage, AI Tools Directory and `/healthz`, then opens the site.

## Configuration (top of deploy.bat / deploy.sh)
| Variable | Purpose |
|---|---|
| `CF_TOKEN` | Hardcode your Cloudflare API Token (else you are prompted). |
| `PROXY_URL` | Local proxy for restricted networks, e.g. `http://127.0.0.1:7890`. |
| `DEPLOY_RETRIES` | Retry count for flaky asset uploads (default 3). |
| `RUN_TESTS` | `1` runs unit tests before deploy; `0` skips. |
| `WARM_AFTER_DEPLOY` | `1` warms + auto-opens the site after deploy. |
| `PUBLIC_SITE_URL` | Fallback URL if the `*.workers.dev` URL can't be parsed (set this to your custom domain). |

## Getting a Cloudflare API Token
Cloudflare dashboard → **My Profile → API Tokens → Create Token** → use the
**"Edit Cloudflare Workers"** template. That grants `Workers Scripts:Edit`
(plus the account/zone read scopes Wrangler needs).

## Manual deploy (without the script)
```bash
npm install
npm run build      # node build/build.mjs
npx wrangler deploy
```

## Custom domain
After the first deploy, either add a route in `wrangler.toml`, or in the
Cloudflare dashboard: **Workers & Pages → toolhub → Settings → Domains & Routes**.
