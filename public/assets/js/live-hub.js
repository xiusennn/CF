// Live Intelligence Hub: same-origin calls to cached Worker routes.
// All external source labels and timestamps are rendered with the data.
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v || "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const ago = (iso) => {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins || 1} 分钟前`;
  if (mins < 1440) return `${Math.floor(mins / 60)} 小时前`;
  return `${Math.floor(mins / 1440)} 天前`;
};
async function request(url) {
  const r = await fetch(url, { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error("live source unavailable");
  return r.json();
}
function sourceLine(root, data) {
  const node = root.querySelector("[data-live-source]");
  if (node && data && data.source) node.textContent = `${data.source} · 更新于 ${ago(data.fetchedAt)}`;
}
async function loadTrending() {
  const root = $("#github-trending-list");
  if (!root) return;
  try {
    // Static snapshot written by build/sync-trending.mjs every 6 hours. Served
    // from the edge: no Worker CPU and no Worker request quota consumed.
    const data = await request("/assets/data/trending.json");
    sourceLine(root, data);
    if (!data.items || !data.items.length) throw new Error("empty");
    root.querySelector("[data-live-items]").innerHTML = data.items.slice(0, 5).map((x, i) => `<a class="live-repo" href="${esc(x.url)}" target="_blank" rel="noopener"><span class="live-rank">${String(i + 1).padStart(2, "0")}</span><span class="live-repo-main"><b>${esc(x.fullName)}</b><small>${esc(x.description || "GitHub 热门开源项目")}</small><em>${esc(x.language || "Open source")}</em></span><span class="live-stars">★ ${esc(x.weeklyStars ? "+" + x.weeklyStars + " 本周" : (x.stars || "查看"))}</span></a>`).join("");
  } catch (_) {
    root.classList.add("live-unavailable");
    const note = root.querySelector("[data-live-items]");
    if (note) note.innerHTML = '<div class="live-error">实时周榜暂不可用。可直接使用下方 GitHub 项目搜索。</div>';
  }
}
async function loadNews() {
  const root = $("#ai-news-list");
  if (!root) return;
  try {
    const data = await request("/api/ai-news");
    sourceLine(root, data);
    if (!data.items || !data.items.length) throw new Error("empty");
    root.querySelector("[data-live-items]").innerHTML = data.items.slice(0, 5).map((x) => `<a class="live-news" href="${esc(x.url)}" target="_blank" rel="noopener"><span class="live-news-kind ${x.category === "安全" ? "risk" : ""}">${esc(x.category)}</span><b>${esc(x.title)}</b><small>${ago(x.createdAt)} · ${Number(x.points || 0)} points · ${Number(x.comments || 0)} 评论</small></a>`).join("");
  } catch (_) {
    root.classList.add("live-unavailable");
    const note = root.querySelector("[data-live-items]");
    if (note) note.innerHTML = '<div class="live-error">实时新闻暂不可用。新闻源恢复后会自动刷新。</div>';
  }
}
async function githubSearch(query) {
  const box = $("#github-search-results");
  if (!box) return;
  const q = String(query || "").trim();
  if (q.length < 2) { box.innerHTML = '<p class="gh-search-note">请输入至少 2 个字符搜索 GitHub 项目。</p>'; return; }
  box.innerHTML = '<p class="gh-search-note">正在检索 GitHub 项目…</p>';
  try {
    const data = await request("/api/github/search?q=" + encodeURIComponent(q));
    if (!data.items || !data.items.length) { box.innerHTML = '<p class="gh-search-note">没有找到相关仓库。试试更短的英文关键词。</p>'; return; }
    box.innerHTML = `<p class="gh-search-note">GitHub REST Search · ${esc(data.query)} · ${data.items.length} 个结果</p>` + data.items.map((x) => `<a class="gh-result" href="${esc(x.url)}" target="_blank" rel="noopener"><span><b>${esc(x.fullName)}</b><small>${esc(x.description)}</small><em>${esc(x.language)}${x.topics && x.topics.length ? " · " + esc(x.topics.join(" · ")) : ""}</em></span><strong>★ ${Number(x.stars || 0).toLocaleString("en-US")}</strong></a>`).join("");
  } catch (_) {
    const url = "https://github.com/search?type=repositories&q=" + encodeURIComponent(q);
    box.innerHTML = `<p class="gh-search-note">实时接口暂不可用。<a href="${url}" target="_blank" rel="noopener">直接在 GitHub 搜索 “${esc(q)}” ↗</a></p>`;
  }
}
function bindSearch() {
  const form = $("#github-project-form");
  const input = $("#github-project-search");
  if (!form || !input) return;
  form.addEventListener("submit", (e) => { e.preventDefault(); githubSearch(input.value); });
}
document.addEventListener("DOMContentLoaded", () => { loadTrending(); loadNews(); bindSearch(); });
