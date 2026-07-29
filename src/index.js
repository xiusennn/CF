// ToolHub Cloudflare Worker — static assets plus narrowly scoped public-data proxies.
// User-entered tool data is processed in the browser; Worker APIs only fetch public upstream indexes.
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' data: blob: https://avatars.githubusercontent.com; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' blob:; font-src 'self' data:",
};
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=900, s-maxage=1800, stale-while-revalidate=3600", "X-Robots-Tag": "noindex" };
const UPSTREAM_TIMEOUT_MS = 7000;

function withHeaders(resp) {
  const headers = new Headers(resp.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) headers.set(key, value);
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers });
}
function json(data, init = {}) {
  return withHeaders(new Response(JSON.stringify(data), { status: init.status || 200, headers: { ...JSON_HEADERS, ...(init.headers || {}) } }));
}
function textOnly(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}
async function fetchUpstream(input, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("upstream timeout"), UPSTREAM_TIMEOUT_MS);
  try { return await fetch(input, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}
async function cached(request, ttlSeconds, producer) {
  const cache = caches.default;
  const hit = await cache.match(request);
  if (hit) return hit;
  const data = await producer();
  const body = JSON.stringify(data);
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds}`, "X-Robots-Tag": "noindex" };
  await cache.put(request, new Response(body, { headers }));
  return new Response(body, { headers });
}
function ghHeaders() { return { accept: "application/vnd.github+json", "x-github-api-version": "2026-03-10", "user-agent": "ToolHub-Live-Index" }; }
async function githubSearch(query) {
  const q = query.trim().slice(0, 120);
  if (q.length < 2) return { query: q, items: [], note: "请输入至少 2 个字符。" };
  const api = new URL("https://api.github.com/search/repositories");
  api.searchParams.set("q", q); api.searchParams.set("sort", "stars"); api.searchParams.set("order", "desc"); api.searchParams.set("per_page", "12");
  const upstream = await fetchUpstream(api, { headers: ghHeaders() });
  if (!upstream.ok) throw new Error(`GitHub Search ${upstream.status}`);
  const data = await upstream.json();
  return { query: q, source: "GitHub REST Search", fetchedAt: new Date().toISOString(), items: (data.items || []).map((x) => ({ fullName: x.full_name, url: x.html_url, description: x.description || "暂无描述", stars: x.stargazers_count, language: x.language || "—", updatedAt: x.updated_at, topics: (x.topics || []).slice(0, 3) })) };
}
async function aiNews() {
  const queries = ["AI", "prompt injection", "LLM security"];
  const responses = await Promise.all(queries.map(async (query) => {
    const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
    url.searchParams.set("query", query); url.searchParams.set("tags", "story"); url.searchParams.set("hitsPerPage", "8");
    const response = await fetchUpstream(url); if (!response.ok) return [];
    return (await response.json()).hits || [];
  }));
  const seen = new Set();
  const items = responses.flat().filter((item) => item.objectID && !seen.has(item.objectID) && item.title && seen.add(item.objectID))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 12).map((item) => ({
      id: item.objectID, title: item.title, url: item.url || ("https:" + "//news.ycombinator.com/item?id=" + item.objectID),
      discussUrl: "https:" + "//news.ycombinator.com/item?id=" + item.objectID, points: item.points || 0, comments: item.num_comments || 0, createdAt: item.created_at,
      category: /prompt injection|jailbreak|leak|security|vulnerability|exploit/i.test(item.title) ? "安全" : "AI 动态",
    }));
  return { source: "Hacker News · latest AI / prompt-injection / LLM-security", fetchedAt: new Date().toISOString(), items };
}

async function skillMd(rawUrl) {
  const upstream = await fetchUpstream(rawUrl, { headers: { "user-agent": "ToolHub-Skill-Reader", accept: "text/plain" } });
  if (!upstream.ok) throw new Error(`raw SKILL.md ${upstream.status}`);
  const body = await upstream.text();
  // 120 KB is still far above the 99th percentile SKILL.md. The previous 200 KB
  // cap measured p90 7.69 ms CPU against the 10 ms FREE-plan limit, because the
  // body has to be decoded and then re-serialised into the JSON response.
  const MAX_CHARS = 120000;
  const truncated = body.length > MAX_CHARS;
  return { url: rawUrl, truncated, text: truncated ? body.slice(0, MAX_CHARS) : body, fetchedAt: new Date().toISOString() };
}

export default { async fetch(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/healthz") return json({ ok: true, release: env.RELEASE_ID || "unconfigured" }, { headers: { "cache-control": "no-store" } });
  if (url.pathname.startsWith("/api/") && request.method !== "GET") return json({ error: "Method not allowed" }, { status: 405, headers: { allow: "GET", "cache-control": "no-store" } });
  try {
    // Trending is parsed by build/sync-trending.mjs every 6 hours and shipped
    // as a static asset. Parsing it here measured 16.58 ms CPU against the
    // 10 ms FREE-plan limit - and profiling showed the cost was decoding the
    // ~600 KB page (43.76 ms for Response.text()), not the parsing (0.04 ms).
    // This route just forwards to the asset; the homepage reads it directly
    // and normally does not invoke the Worker at all.
    if (url.pathname === "/api/github/trending") {
      const snapshot = await env.ASSETS.fetch(new URL("/assets/data/trending.json", url.origin));
      if (snapshot.status === 404) return json({ source: "GitHub Trending", items: [], note: "快照尚未生成。" });
      return snapshot;
    }
    if (url.pathname === "/api/github/search") {
      const query = url.searchParams.get("q") || "";
      if (query.trim().length < 2) return json({ query, items: [], note: "请输入至少 2 个字符。" });
      return withHeaders(await cached(new Request(`${url.origin}/__cache/github-search?q=${encodeURIComponent(query.trim().toLowerCase())}`), 600, () => githubSearch(query)));
    }
    if (url.pathname === "/api/skill-md") {
      // Allowlist: https + raw.githubusercontent.com + a path ending in SKILL.md.
      // Anything else is refused, so this cannot be used as an open proxy.
      const raw = url.searchParams.get("u") || "";
      let target = null;
      try { target = new URL(raw); } catch { target = null; }
      const allowed = target && target.protocol === "https:" && target.hostname === "raw.githubusercontent" + ".com" && /\/SKILL\.md$/i.test(target.pathname);
      if (!allowed) return json({ error: "只允许读取 GitHub 上的 SKILL.md 原文。" }, { status: 400, headers: { "cache-control": "no-store" } });
      const key = `${url.origin}/__cache/skill-md?u=${encodeURIComponent(target.toString())}`;
      return withHeaders(await cached(new Request(key), 3600, () => skillMd(target.toString())));
    }
    if (url.pathname === "/api/ai-news") return withHeaders(await cached(new Request(`${url.origin}/__cache/ai-news`), 900, aiNews));
  } catch (error) {
    console.error("public upstream request failed", { path: url.pathname, message: String(error?.message || error) });
    return json({ error: "暂时无法获取公开数据，请稍后重试。" }, { status: 502, headers: { "cache-control": "no-store" } });
  }
  const pretty = url.pathname.match(/^\/tools\/([a-z0-9-]+)\/?$/);
  if (pretty) { url.pathname = `/tools/${pretty[1]}.html`; return Response.redirect(url.toString(), 308); }
  const asset = await env.ASSETS.fetch(request);
  // Zero-copy: re-wrapping asset responses to add security headers measured
  // 6.70 ms CPU. public/_headers applies them at the edge at no CPU cost.
  if (asset.status !== 404) return asset;
  const notFound = await env.ASSETS.fetch(new Request(new URL("/404.html", url), request));
  return new Response(notFound.body, { status: 404, headers: notFound.headers });
} };
