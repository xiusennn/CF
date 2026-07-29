# ToolHub — Free Online Tools (Cloudflare Workers, FREE plan)

A fast, privacy-first tools site. Every tool runs **client-side in the browser** —
no uploads, no accounts, no server CPU. Built CNAGT-native (ES modules,
static-first) to stay inside the Cloudflare free-plan limits.

## What's inside
72 fully-working tools across 8 categories:
- **Text & Data:** word counter, case converter, remove duplicate lines, lorem ipsum, text diff
- **Developer:** JSON formatter, Base64, URL encode/decode, hash (SHA-1/256/384/512), UUID, Unix timestamp
- **Image (100% local):** compressor, resizer, format converter (PNG/JPG/WebP)
- **Color & Design:** color converter, palette generator, WCAG contrast checker
- **Web & SEO:** UTM builder, slug generator, password generator
- **Business Calculators:** profit margin, ROAS/ACOS, break-even, loan payment, percentage
- **AI & Prompts:** prompt library, token counter, AI cost calculator, free API directory, and an AI Tools Directory of 100+ hand-picked tools (chat, image, video, audio, writing, coding, agents, prompts)

## v16: AI Stack & Agent Skills directory

The AI & Prompts section now includes **AI Stack & Agent Skills** (`/tools/ai-ecosystem-directory.html`):
- 19 curated website-integration components across RAG, orchestration, vector search, model gateways, observability, automation and MCP.
- A searchable 44-capability Agent Skills map across engineering, growth, research, operations and site-specific workflows.
- Trusted source libraries, verification guidance and a metadata-only safety boundary: ToolHub links upstream projects and does not execute third-party Skill code.

Catalog data lives in `public/assets/js/ecosystem.js`; update it through reviewed changes, then run `npm run build` and the test suite.

## Architecture
```
public/            <- pre-rendered static assets (served free & unlimited)
  index.html       <- generated homepage
  tools/*.html     <- generated one page per tool (SEO landing pages)
  assets/css/app.css
  assets/js/core.js <- pure logic (shared by browser + tests)
  assets/js/ui.js   <- per-tool UI wiring
  assets/js/app.js  <- theme + homepage search/filter
src/index.js       <- Cloudflare Worker (security headers, routing)
wrangler.toml      <- Workers config (ASSETS binding, observability)
build/             <- static-site generator (build.mjs + tools.config.mjs)
tests/             <- unit tests + real-browser (Playwright) tests
```

## Build
```bash
node build/build.mjs        # regenerate homepage + all tool pages
```
Add a tool by appending one entry to `build/tools.config.mjs` and a handler in
`public/assets/js/ui.js` (logic goes in `core.js`).

## Test (proves every tool works — no manual clicking)
```bash
node tests/core.test.mjs                     # 46 unit tests on the logic
node tests/server.mjs &                       # local static server :8787
node tests/browser.test.mjs                   # 50 real-browser interaction tests
```

## Deploy to Cloudflare (free plan)
```bash
npx wrangler deploy         # after `npx wrangler login`
```
Then set your real domain in `build/build.mjs` (`SITE`) and rebuild for correct
canonical/sitemap URLs.

## Roadmap (next waves)
- Expand catalog toward 80+ first-party tools (master prompt §7.1 / §33).
- Add the AI-tool catalog + task-recommendation layer (§30/§31) with D1.
- 30+ locales via locale packs (translate after features are complete).
