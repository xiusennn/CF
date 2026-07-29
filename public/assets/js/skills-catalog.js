/* skills-catalog.js — client for /skills.html
 * Loads /assets/data/skills/meta.json, then lazily streams compact shards.
 * Two scopes: "featured" (first shards only, instant) and "full" (all shards,
 * progressive + cancellable). Metadata only; SKILL.md bodies stay upstream.
 */
(function () {
  "use strict";
  var GH = "https://" + "github.com/";
  var RAW = "https://" + "raw.githubusercontent.com/";
  var META_URL = "/assets/data/skills/meta.json";
  var PAGE = 40;
  var FEATURED_TARGET = 20000;

  var $ = function (id) { return document.getElementById(id); };
  var meta = null;
  var shardCache = {};
  var featuredShards = 0;
  var loaded = [];          // records currently available for filtering
  var matches = [];
  var shown = 0;
  var runToken = 0;
  var debounceTimer = 0;

  var nf = new Intl.NumberFormat("en-US");
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function repoUrl(r) { return r.R || GH + r.o + "/" + r.r; }
  function sourceUrl(r) {
    if (r.S) return r.S;
    return r.h ? GH + r.o + "/" + r.r + "/tree/" + r.h + "/" + r.p : repoUrl(r);
  }
  function mdUrl(r) {
    if (r.M) return r.M;
    return r.h ? RAW + r.o + "/" + r.r + "/" + r.h + "/" + r.p + "/SKILL.md" : "";
  }

  function setStatus(text) { var el = $("sk-status"); if (el) el.textContent = text; }
  function setProgress(ratio) {
    var bar = $("sk-progress");
    if (!bar) return;
    bar.hidden = ratio == null;
    if (ratio != null) bar.firstElementChild.style.width = Math.round(ratio * 100) + "%";
  }

  function cacheBust(url) {
    var stamp = meta && meta.generated_at ? meta.generated_at.replace(/[^0-9]/g, "") : "";
    return stamp ? url + "?v=" + stamp : url;
  }

  // Flaky mobile networks drop requests; one dropped shard should not abort a
  // 158k-record scan. Retry twice with backoff before surfacing an error.
  function fetchWithRetry(url, attempt) {
    return fetch(url, { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function (error) {
        if (attempt >= 2) throw error;
        return new Promise(function (resolve) { setTimeout(resolve, 400 * (attempt + 1)); })
          .then(function () { return fetchWithRetry(url, attempt + 1); });
      });
  }

  function fetchShard(name) {
    if (shardCache[name]) return Promise.resolve(shardCache[name]);
    return fetchWithRetry(cacheBust("/assets/data/skills/" + name), 0)
      .then(function (rows) { shardCache[name] = rows; return rows; })
      .catch(function (error) { throw new Error(name + "：" + error.message); });
  }

  // Total download size of a shard list, in MB, for the transfer warning.
  function sizeOf(names) {
    if (!meta || !meta.shards) return 0;
    var bytes = 0;
    var all = meta.shards.concat(meta.curated_shards || []);
    all.forEach(function (s) { if (names.indexOf(s.file) !== -1) bytes += s.bytes || 0; });
    return Math.round(bytes / 1048576);
  }

  /* ---------- filtering ---------- */
  function readFilters() {
    var raw = $("sk-q").value.trim().toLowerCase();
    return {
      terms: raw ? raw.split(/\s+/).filter(Boolean) : [],
      cat: $("sk-cat") ? $("sk-cat").value : "",
      tier: $("sk-tier").value,
      safety: $("sk-safety").value,
      license: $("sk-license").value,
      owner: $("sk-owner").value,
      stars: Number($("sk-stars").value || 0),
      sort: $("sk-sort").value,
      full: $("sk-scope-full").getAttribute("aria-pressed") === "true"
    };
  }
  function keep(r, f) {
    // curatedScope: the default library is the curated set (quality gate +
    // per-repo cap + one canonical copy per duplicate cluster). Switching to
    // 全库 keeps every record available.
    if (!f.full && r.v !== 1) return false;
    if (f.cat && r.k !== f.cat) return false;
    if (f.tier && r.t !== f.tier) return false;
    if (f.safety && r.f !== f.safety) return false;
    if (f.license && (r.l || "(未声明)") !== f.license) return false;
    if (f.owner && r.o !== f.owner) return false;
    if (f.stars && r.s < f.stars) return false;
    if (f.terms.length) {
      var hay = (r.n + " " + r.o + "/" + r.r + " " + r.p + " " + r.d).toLowerCase();
      for (var i = 0; i < f.terms.length; i++) if (hay.indexOf(f.terms[i]) === -1) return false;
    }
    return true;
  }
  function sortRows(rows, mode) {
    var cmp = {
      quality: function (a, b) { return b.q - a.q || b.s - a.s; },
      stars: function (a, b) { return b.s - a.s || b.q - a.q; },
      updated: function (a, b) { return (b.u || "").localeCompare(a.u || "") || b.q - a.q; },
      name: function (a, b) { return a.n.localeCompare(b.n); }
    }[mode] || null;
    return cmp ? rows.sort(cmp) : rows;
  }

  /* ---------- rendering ---------- */
  function card(r) {
    var tier = r.t === "c" ? '<span class="sk-tag core">core · 许可证明确</span>'
                           : '<span class="sk-tag index">index · 仅外链</span>';
    var safety = r.f === "x" ? '<span class="sk-tag risk">高风险 · 请人工复核</span>'
               : r.f === "r" ? '<span class="sk-tag review">需复核</span>' : "";
    var flags = r.g ? '<span class="sk-tag">命中 ' + r.g + " 项安全规则</span>" : "";
    var md = mdUrl(r);
    return '<li class="sk-card">' +
      "<h3>" + esc(r.n) + "</h3>" +
      '<div class="sk-repo">' + esc(r.o + "/" + r.r) + " · " + esc(r.p) + "</div>" +
      (r.d ? "<p>" + esc(r.d) + "</p>" : "<p></p>") +
      '<div class="sk-tags">' + tier + safety + flags +
        '<span class="sk-tag">★ ' + nf.format(r.s) + "</span>" +
        '<span class="sk-tag">质量 ' + r.q + "/100</span>" +
        '<span class="sk-tag">' + esc(r.l || "未声明许可证") + "</span>" +
        (r.u ? '<span class="sk-tag">更新 ' + esc(r.u) + "</span>" : "") +
      "</div>" +
      '<div class="sk-links">' +
        '<a href="' + esc(sourceUrl(r)) + '" target="_blank" rel="noopener nofollow">Skill 目录</a>' +
        (md ? '<a href="' + esc(md) + '" target="_blank" rel="noopener nofollow">SKILL.md 原文</a>' : "") +
        '<a href="' + esc(repoUrl(r)) + '" target="_blank" rel="noopener nofollow">仓库</a>' +
        '<button type="button" data-copy="' + esc(sourceUrl(r)) + '">复制链接</button>' +
      "</div></li>";
  }

  function renderPage(reset) {
    var list = $("sk-list");
    if (reset) { list.innerHTML = ""; shown = 0; }
    var slice = matches.slice(shown, shown + PAGE);
    if (slice.length) list.insertAdjacentHTML("beforeend", slice.map(card).join(""));
    shown += slice.length;
    $("sk-more").hidden = shown >= matches.length;
    $("sk-more").textContent = "再加载 " + Math.min(PAGE, matches.length - shown) + " 条（已显示 " +
      nf.format(shown) + " / " + nf.format(matches.length) + "）";
  }

  function applyFilters(partialNote) {
    var f = readFilters();
    matches = sortRows(loaded.filter(function (r) { return keep(r, f); }), f.sort);
    renderPage(true);
    setStatus("匹配 " + nf.format(matches.length) + " 条（已扫描 " + nf.format(loaded.length) + " / " +
      nf.format(meta.count) + " 条）" + (partialNote || ""));
  }

  /* ---------- shard loading ---------- */
  function loadShards(list, token, onBatch) {
    var i = 0;
    function next() {
      if (token !== runToken) return Promise.resolve("cancelled");
      if (i >= list.length) return Promise.resolve("done");
      var name = list[i++];
      return fetchShard(name).then(function (rows) {
        if (token !== runToken) return "cancelled";
        loaded = loaded.concat(rows);
        setProgress(i / list.length);
        if (onBatch) onBatch(i, list.length);
        return next();
      });
    }
    return next();
  }

  function run() {
    var token = ++runToken;
    var full = $("sk-scope-full").getAttribute("aria-pressed") === "true";
    var names = meta.shards.map(function (s) { return s.file; });
    // The curated scope loads dedicated curated-*.json shards (~6.6 MiB)
    // instead of streaming the whole library to filter it client-side.
    var curated = meta.curated_shards && meta.curated_shards.length
      ? meta.curated_shards.map(function (s) { return s.file; })
      : names.slice(0, featuredShards);
    var target = full ? names : curated;
    void featuredShards;
    loaded = [];
    setProgress(0);
    setStatus(full
      ? "全库搜索中，正在流式加载分片（约 " + sizeOf(target) + " MB，可随时切回精品库）…"
      : "正在加载精品库（已去重、已筛选）…");
    return loadShards(target, token, function (done, total) {
      if (token !== runToken) return;
      applyFilters(full ? "，已加载分片 " + done + "/" + total : "");
    }).then(function (state) {
      if (state === "cancelled" || token !== runToken) return;
      setProgress(null);
      applyFilters(full ? "" : "（精品库：已滤掉低星、停更与重复副本，切换“全库搜索”可看全部）");
    }).catch(function (error) {
      if (token !== runToken) return;
      setProgress(null);
      setStatus("加载分片失败：" + error.message + "。已自动重试 2 次，请检查网络后刷新页面。");
    });
  }

  var scheduleRerun = function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () { applyFilters(); }, 180);
  };

  /* ---------- boot ---------- */
  function fillStats() {
    $("sk-total").textContent = nf.format(meta.count);
    $("sk-core").textContent = nf.format(meta.counts.core);
    $("sk-index").textContent = nf.format(meta.counts.index);
    $("sk-review").textContent = nf.format(meta.counts.review + meta.counts.risky);
    var day = (meta.source_generated_at || meta.generated_at || "").slice(0, 10);
    $("sk-date").textContent = day || "—";
    var ageDays = day ? Math.floor((Date.now() - new Date(day + "T00:00:00Z").getTime()) / 86400000) : 0;
    if (ageDays > 45) {
      var note = document.createElement("p");
      note.className = "sk-stale";
      note.setAttribute("role", "status");
      note.textContent = "数据快照已是 " + ageDays + " 天前（" + day + "），上游仓库可能已变更，请以 SKILL.md 原文为准。";
      var stats = document.querySelector(".sk-stats");
      if (stats && stats.parentNode) stats.parentNode.insertBefore(note, stats.nextSibling);
    }
    var cats = Array.isArray(meta.categories) ? meta.categories : [];
    if ($("sk-cat") && cats.length) {
      $("sk-cat").insertAdjacentHTML("beforeend", cats.map(function (x) {
        return '<option value="' + esc(x.code) + '">' + esc(x.name) + " (" + nf.format(x.count) + ")</option>";
      }).join(""));
    }
    // Must run after the options exist, otherwise ?cat= silently does nothing.
    presetCategory();
    var licenses = meta.facets && meta.facets.licenses ? meta.facets.licenses : [];
    var owners = meta.facets && meta.facets.owners ? meta.facets.owners : [];
    $("sk-license").insertAdjacentHTML("beforeend", licenses.map(function (x) {
      return '<option value="' + esc(x.name) + '">' + esc(x.name) + " (" + nf.format(x.count) + ")</option>";
    }).join(""));
    $("sk-owner").insertAdjacentHTML("beforeend", owners.map(function (x) {
      return '<option value="' + esc(x.name) + '">' + esc(x.name) + " (" + nf.format(x.count) + ")</option>";
    }).join(""));
  }

  // Deep links: /skills?q=... (used by every detail page and by the homepage
  // search box) must pre-fill the box, otherwise those links land on a blank
  // search and look broken.
  function presetQuery() {
    try {
      var params = new URLSearchParams(location.search);
      var q = (params.get("q") || "").trim();
      if (q) $("sk-q").value = q.slice(0, 120);
      if ((params.get("scope") || "") === "full") {
        $("sk-scope-featured").setAttribute("aria-pressed", "false");
        $("sk-scope-full").setAttribute("aria-pressed", "true");
      }
    } catch (error) { /* malformed query string: ignore, show the full catalog */ }
  }

  // Deep link from the homepage chips and the /skills/c/* pages.
  function presetCategory() {
    try {
      var cat = (new URLSearchParams(location.search).get("cat") || "").trim();
      if (cat && $("sk-cat")) $("sk-cat").value = cat;
    } catch (error) { /* malformed query string: ignore */ }
  }

  function bind() {
    presetQuery();
    $("sk-q").addEventListener("input", scheduleRerun);
    ["sk-cat", "sk-tier", "sk-safety", "sk-license", "sk-owner", "sk-stars", "sk-sort"].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener("change", function () { applyFilters(); });
    });
    $("sk-more").addEventListener("click", function () { renderPage(false); });
    $("sk-list").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-copy]");
      if (!button || !navigator.clipboard) return;
      navigator.clipboard.writeText(button.getAttribute("data-copy")).then(function () {
        var old = button.textContent;
        button.textContent = "已复制";
        setTimeout(function () { button.textContent = old; }, 1200);
      });
    });
    ["sk-scope-featured", "sk-scope-full"].forEach(function (id) {
      $(id).addEventListener("click", function () {
        $("sk-scope-featured").setAttribute("aria-pressed", String(id === "sk-scope-featured"));
        $("sk-scope-full").setAttribute("aria-pressed", String(id === "sk-scope-full"));
        run();
      });
    });
  }

  function boot() {
    setStatus("正在加载目录索引…");
    fetch(META_URL)
      .then(function (res) { if (!res.ok) throw new Error("meta.json " + res.status); return res.json(); })
      .then(function (data) {
        meta = data;
        var count = 0;
        featuredShards = 0;
        for (var i = 0; i < meta.shards.length && count < FEATURED_TARGET; i++) {
          count += meta.shards[i].count;
          featuredShards++;
        }
        fillStats();
        bind();
        return run();
      })
      .catch(function (error) {
        setProgress(null);
        setStatus("目录数据尚未生成（" + error.message + "）。请先运行 toolhub.bat 或 npm run build:skills 生成 /assets/data/skills/。");
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
