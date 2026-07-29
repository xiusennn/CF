// Home page prompt generator (v3) — evidence-based, gate-enforced.
// The UI never releases a prompt below 95. When blocked, it returns the exact,
// prioritised gaps the user must fill — so any RELEASED prompt is genuinely 95+.
import { generateQualityPrompt } from "./prompt-engine-v3.js";

export function assess(spec) {
  return generateQualityPrompt(spec || {});
}

// Render an evidence breakdown (plain text; adapt to your DOM as needed).
export function renderBreakdown(spec) {
  const r = generateQualityPrompt(spec || {});
  const L = [];
  L.push(`结构质量分：${r.score}/100  ·  ${r.passed ? "✅ 可发布" : "⛔ 未达 95，已拦截"}`);
  L.push("");
  for (const d of r.dims) {
    L.push(`【${d.label}】 ${d.earned}/${d.max}`);
    for (const s of d.signals) L.push(`  +${s.points}  依据：${s.evidence}`);
    for (const g of d.gaps) L.push(`  △  建议：${g}`);
  }
  if (r.hard.length) {
    L.push("");
    L.push(`硬门禁必填：${r.hard.join("；")}`);
  }
  return L.join("\n");
}

// Prioritised, actionable next steps to reach 95 (biggest point gaps first).
export function gapsToReach95(spec) {
  const r = generateQualityPrompt(spec || {});
  if (r.passed) return [];
  return r.dims
    .map((d) => ({ label: d.label, missing: d.max - d.earned, gaps: d.gaps }))
    .filter((x) => x.missing > 0 && x.gaps.length)
    .sort((a, b) => b.missing - a.missing)
    .map((x) => `补【${x.label}】(+${x.missing}分)：${x.gaps.join("；")}`);
}

// Main entry used by the home page “Generate” button.
export function generate(spec) {
  const r = generateQualityPrompt(spec || {});
  if (!r.passed) {
    return {
      ok: false,
      score: r.score,
      message: `结构质量分 ${r.score}/100，低于 95 不发布。请补充以下项后重试：`,
      todo: gapsToReach95(spec),
      breakdown: renderBreakdown(spec),
    };
  }
  return { ok: true, score: r.score, prompt: r.prompt, breakdown: renderBreakdown(spec) };
}

export default { assess, generate, renderBreakdown, gapsToReach95 };
