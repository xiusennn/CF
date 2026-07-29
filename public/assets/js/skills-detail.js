/* Copy-to-clipboard for the install commands on Skill detail pages.
   Kept in a file (not inline) so it stays compatible with a strict CSP. */
(function () {
  "use strict";

  function flash(button, text) {
    var original = button.getAttribute("data-label") || button.textContent;
    button.setAttribute("data-label", original);
    button.textContent = text;
    button.disabled = true;
    setTimeout(function () {
      button.textContent = original;
      button.disabled = false;
    }, 1500);
  }

  function legacyCopy(value) {
    var area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "readonly");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest ? event.target.closest("[data-copy]") : null;
    if (!button) return;
    var value = button.getAttribute("data-copy") || "";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(
        function () {
          flash(button, "\u5df2\u590d\u5236");
        },
        function () {
          flash(button, legacyCopy(value) ? "\u5df2\u590d\u5236" : "\u590d\u5236\u5931\u8d25");
        }
      );
      return;
    }
    flash(button, legacyCopy(value) ? "\u5df2\u590d\u5236" : "\u590d\u5236\u5931\u8d25");
  });
})();

/* ---------- in-page SKILL.md reader with risk highlighting ---------- */
(function () {
  var section = document.querySelector(".sk-reader");
  if (!section) return;
  var button = section.querySelector(".sk-reader-load");
  var status = section.querySelector(".sk-reader-status");
  var body = section.querySelector(".sk-reader-body");

  // Mirrors build/skill-safety.mjs so a highlighted line and the badges above
  // it can never tell the user two different stories.
  var RULES = [
    [/\brm\s+-[a-z]*[rf][a-z]*\s|\brmdir\s+\/s/i, "高危删除命令", "不可逆删除，路径写错就可能清掉真实数据。"],
    [/\b(curl|wget)\b[^\n|]*\|\s*(sudo\s+)?(ba|z|k)?sh\b/i, "远程脚本直接执行", "下载内容未经阅读就直接运行。"],
    [/\bIEX\b|Invoke-Expression/i, "PowerShell 动态执行", "执行动态拼接的命令，难以审计。"],
    [/base64\s+(-d|--decode)|eval\s*\(\s*atob|FromBase64String/i, "混淆后执行", "先解码再执行，常用于隐藏真实行为。"],
    [/\bsudo\b|runas\s+\/user/i, "提权", "要求管理员权限。"],
    [/\b(subprocess\.(run|call|Popen)|child_process|os\.system|spawnSync)\b/i, "执行代码", "会在你的机器上运行脚本或命令。"],
    [/\bchmod\s+(\+x|7[0-7][0-7])\b/i, "修改执行权限", "给文件加上可执行权限。"],
    [/\b(api[_-]?key|access[_-]?token|secret[_-]?key|password\s*=|\.env\b)/i, "涉及密钥 / 凭据", "可能要求你提供凭据，确认它将被发往哪里。"],
    [/ignore\s+(all\s+)?(previous|prior)\s+instructions|disregard\s+(the\s+)?(above|system)/i, "提示词注入风险", "文本在尝试接管模型行为。"]
  ];

  function escapeHtml(v) {
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function render(text, truncated) {
    var lines = text.split(/\r?\n/);
    var hits = 0;
    var out = lines.map(function (line, i) {
      var flags = [];
      for (var k = 0; k < RULES.length; k++) if (RULES[k][0].test(line)) flags.push(RULES[k]);
      var cls = flags.length ? " sk-line-risk" : "";
      if (flags.length) hits++;
      var note = flags.length
        ? '<span class="sk-line-flag">' + flags.map(function (f) { return escapeHtml(f[1]) + "：" + escapeHtml(f[2]); }).join(" ") + "</span>"
        : "";
      return '<li class="sk-line' + cls + '"><span class="sk-line-no">' + (i + 1) + '</span><code>' + escapeHtml(line || " ") + "</code>" + note + "</li>";
    }).join("");
    body.innerHTML = '<ol class="sk-lines">' + out + "</ol>";
    body.hidden = false;
    status.textContent = lines.length + " 行，" + hits + " 行命中安全规则" + (truncated ? "（原文过长，已截断）" : "") + "。";
  }

  button.addEventListener("click", function () {
    var raw = section.getAttribute("data-raw");
    if (!raw) return;
    button.disabled = true;
    status.textContent = "正在取原文…";
    fetch("/api/skill-md?u=" + encodeURIComponent(raw))
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || typeof res.d.text !== "string") throw new Error(res.d.error || "upstream");
        render(res.d.text, !!res.d.truncated);
        button.hidden = true;
      })
      .catch(function () {
        button.disabled = false;
        status.textContent = "取原文失败，请直接打开上方的 GitHub 链接阅读。";
      });
  });
})();
