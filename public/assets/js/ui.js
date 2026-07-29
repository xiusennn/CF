// ui.js — renders and wires each tool's UI, delegating all logic to core.js.
// A tool page sets <body data-tool="json-formatter">; we look up REGISTRY[id].
import * as C from "./core.js";
import { AI_MODELS, APIS, PROMPTS, AI_TOOLS } from "./data.js";
import { AI_CATALOG } from "./catalog.js";
import { AI_STACK, SKILL_CAPABILITIES, SKILL_SOURCES } from "./ecosystem.js";
import { FREE_LLM_PROVIDERS } from "./freeapi.js";
import { LOCAL_SKILLS } from "./skills.js";
import { RR_RECOMMENDED_SKILLS, CATALOG_SOURCE_MAP } from "./external-catalogs.js";
import { ADVISOR_TASKS, MODEL_TRAITS, isDomestic } from "./advisor.js";
import { PROMPT_KITS } from "./promptkits.js";
import { SKILL_REGISTRY_SOURCES, SKILL_REGISTRY, REGISTRY_POLICY } from "./skills-registry.js";

const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, attrs = {}, html = "") => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v; else n.setAttribute(k, v);
  }
  if (html) n.innerHTML = html;
  return n;
};
function copyBtn(getText) {
  const b = el("button", { class: "btn", type: "button" }, "复制");
  b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(getText()); b.textContent = "已复制！"; }
    catch { b.textContent = "复制失败"; }
    setTimeout(() => (b.textContent = "复制"), 1400);
  });
  return b;
}
function ta(value = "", attrs = {}) { const t = el("textarea", { spellcheck: "false", ...attrs }); t.value = value; return t; }
function field(label, control) {
  const f = el("div", { class: "field" });
  if (label) f.appendChild(el("label", {}, label));
  f.appendChild(control);
  return f;
}
function num(value, attrs = {}) { const i = el("input", { type: "number", value: String(value), ...attrs }); return i; }
function text(value = "", attrs = {}) { return el("input", { type: "text", value, ...attrs }); }
function metaBox(pairs) {
  const wrap = el("div", { class: "result-meta" });
  for (const [v, k] of pairs) wrap.appendChild(el("div", { class: "m" }, `<b data-k="${k}">${v}</b><span>${k}</span>`));
  return wrap;
}

const REGISTRY = {
  "md5-hash"(root) {
    const input = ta(); const output = ta("", { readonly: "" });
    const run = () => { output.value = input.value ? C.md5(input.value) : ""; };
    input.addEventListener("input", run);
    const bar = el("div", { class: "toolbar" }); bar.append(el("span", {}, "MD5（十六进制）"), copyBtn(() => output.value));
    root.append(field("待哈希文本", input), bar, output); run();
  },
  "html-to-markdown"(root) {
    const input = ta(); const output = ta("", { readonly: "" });
    const run = () => { output.value = C.htmlToMarkdown(input.value); };
    const btn = el("button", { class: "btn primary", type: "button" }, "转换"); btn.addEventListener("click", run);
    input.addEventListener("input", run);
    const bar = el("div", { class: "toolbar" }); bar.append(el("span", {}, "Markdown"), copyBtn(() => output.value));
    root.append(field("HTML", input), el("div", { class: "btns" }), btn, bar, output);
  },
  "markdown-to-html"(root) {
    const input = ta(); const output = ta("", { readonly: "" });
    const preview = el("div", { class: "panel", style: "margin-top:0" });
    const run = () => { const html = C.markdownToHtml(input.value); output.value = html; preview.innerHTML = html; };
    input.addEventListener("input", run);
    const bar = el("div", { class: "toolbar" }); bar.append(el("span", {}, "HTML 源码"), copyBtn(() => output.value));
    root.append(field("Markdown", input), bar, output, el("div", { class: "toolbar" }, "<span>预览</span>"), preview); run();
  },
  "json-repair"(root) {
    const input = ta(); const output = ta("", { readonly: "" }); const msg = el("div", { class: "msg" });
    const run = () => {
      const r = C.repairJson(input.value); output.value = r.output;
      if (r.ok) { msg.className = "msg ok"; msg.textContent = "已修复 \u2713 " + r.changes.join(", "); }
      else { msg.className = "msg err"; msg.textContent = "无法完全修复：" + r.error; }
    };
    const btn = el("button", { class: "btn primary", type: "button" }, "修复 JSON"); btn.addEventListener("click", run);
    const bar = el("div", { class: "toolbar" }); bar.append(el("span", {}, "结果"), copyBtn(() => output.value));
    root.append(field("待修复 JSON", input), el("div", { class: "btns" }), btn, msg, bar, output);
  },
  "string-validator"(root) {
    const input = text("", { placeholder: "输入要校验的值" });
    const list = el("div", { class: "result-meta" });
    const LABELS = [["isEmail","Email"],["isURL","URL"],["isIPv4","IPv4"],["isIPv6","IPv6"],["isCreditCard","信用卡"],["isHexColor","HEX 颜色"],["isUUID","UUID"],["isNumeric","数字"],["isSlug","Slug"],["isJSON","JSON"],["isStrongPassword","强密码"]];
    const run = () => {
      const r = C.validateString(input.value); list.innerHTML = "";
      for (const [k, label] of LABELS) { const on = r[k]; list.appendChild(el("div", { class: "m" }, `<b style="color:${on ? "var(--ok)" : "var(--muted)"}">${on ? "\u2713" : "\u2014"}</b><span>${label}</span>`)); }
    };
    input.addEventListener("input", run);
    root.append(field("值", input), list); run();
  },
  "fake-data"(root) {
    const count = num(10, { min: "1", max: "1000" });
    const fmt = el("select", {}); [["json","JSON"],["csv","CSV"]].forEach(([v,l]) => fmt.appendChild(el("option", { value: v }, l)));
    const output = ta("", { readonly: "" });
    const run = () => { const rows = C.fakeData(+count.value || 10); output.value = fmt.value === "csv" ? C.rowsToCsv(rows) : JSON.stringify(rows, null, 2); };
    const btn = el("button", { class: "btn primary", type: "button" }, "生成"); btn.addEventListener("click", run);
    const row = el("div", { class: "row" }); row.append(field("行数", count), field("输出格式", fmt));
    const bar = el("div", { class: "toolbar" }); bar.append(el("span", {}, "输出"), copyBtn(() => output.value));
    root.append(row, el("div", { class: "btns" }), btn, bar, output); run();
  },
  "image-cropper"(root) {
    const drop = el("div", { class: "dropzone" }, "点击选择图片，或拖放到此处");
    const file = el("input", { type: "file", accept: "image/*", class: "hidden" });
    const canvas = el("canvas", { style: "max-width:100%;border:1px solid var(--border);border-radius:8px;cursor:crosshair" });
    const info = el("div", { class: "msg" }); const previews = el("div", { class: "preview-row" });
    const dl = el("a", { class: "btn primary", download: "cropped.png" }, "下载"); dl.style.display = "none";
    let img = null, sel = null, drag = null;
    const draw = () => {
      if (!img) return; const ctx = canvas.getContext("2d"); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0);
      if (sel) { ctx.save(); ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.clearRect(sel.x, sel.y, sel.w, sel.h); ctx.drawImage(img, sel.x, sel.y, sel.w, sel.h, sel.x, sel.y, sel.w, sel.h); ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2; ctx.strokeRect(sel.x, sel.y, sel.w, sel.h); ctx.restore(); }
    };
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) }; };
    canvas.addEventListener("mousedown", (e) => { if (!img) return; drag = pos(e); sel = { x: drag.x, y: drag.y, w: 0, h: 0 }; });
    canvas.addEventListener("mousemove", (e) => { if (!drag) return; const p = pos(e); sel = { x: Math.min(drag.x, p.x), y: Math.min(drag.y, p.y), w: Math.abs(p.x - drag.x), h: Math.abs(p.y - drag.y) }; draw(); });
    window.addEventListener("mouseup", () => { drag = null; });
    const crop = () => {
      if (!img) { info.className = "msg err"; info.textContent = "请先加载图片"; return; }
      const s = sel && sel.w > 2 && sel.h > 2 ? sel : { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
      const c = el("canvas"); c.width = Math.round(s.w); c.height = Math.round(s.h); c.getContext("2d").drawImage(img, s.x, s.y, s.w, s.h, 0, 0, s.w, s.h);
      c.toBlob((blob) => { const url = URL.createObjectURL(blob); previews.innerHTML = ""; previews.append(el("img", { src: url }), el("div", {}, `<b>${Math.round(s.w)}\u00D7${Math.round(s.h)}</b><br>${(blob.size / 1024).toFixed(1)} KB`)); dl.href = url; dl.style.display = "inline-block"; info.className = "msg ok"; info.textContent = "已裁剪 \u2713"; }, "image/png");
    };
    const load = (f) => { if (!f) return; img = new Image(); img.onload = () => { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; sel = null; draw(); info.className = "msg ok"; info.textContent = `已加载 ${img.naturalWidth}\u00D7${img.naturalHeight} \u2014 在图片上拖动以选择裁剪区域`; }; img.src = URL.createObjectURL(f); };
    drop.addEventListener("click", () => file.click());
    file.addEventListener("change", () => load(file.files[0]));
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); load(e.dataTransfer.files[0]); });
    const btn = el("button", { class: "btn primary", type: "button" }, "裁剪"); btn.addEventListener("click", crop);
    root.append(drop, file, canvas, el("div", { class: "btns" }), btn, dl, info, el("div", { class: "toolbar" }, "<span>结果</span>"), previews);
  },
  "word-counter"(root) {
    const input = ta();
    const meta = metaBox([[0,"字数"],[0,"字符"],[0,"无空格"],[0,"句子"],[0,"段落数"],[0,"阅读分钟"]]);
    const run = () => {
      const r = C.wordCount(input.value);
      const set = (k, v) => (meta.querySelector(`[data-k="${k}"]`).textContent = v);
      set("字数", r.words); set("字符", r.chars); set("无空格", r.charsNoSpaces);
      set("句子", r.sentences); set("段落数", r.paragraphs); set("阅读分钟", r.readingTimeMin);
    };
    input.addEventListener("input", run);
    root.append(field("你的文本", input), meta); run();
  },
  "case-converter"(root) {
    const input = ta(); const output = ta("", { readonly: "" });
    const modes = [["upper","UPPER"],["lower","lower"],["title","Title"],["sentence","Sentence"],["camel","camelCase"],["pascal","PascalCase"],["snake","snake_case"],["kebab","kebab-case"],["constant","CONSTANT"]];
    const btns = el("div", { class: "btns" });
    modes.forEach(([m, label]) => { const b = el("button",{class:"btn",type:"button"},label); b.addEventListener("click",()=>{output.value=C.changeCase(input.value,m);}); btns.appendChild(b); });
    const bar = el("div",{class:"toolbar"}); bar.append(el("span",{},"结果"), copyBtn(()=>output.value));
    root.append(field("输入", input), btns, bar, output);
  },
  "remove-duplicates"(root) {
    const input = ta(); const output = ta("",{readonly:""});
    const opts = el("div",{class:"checks"});
    const trim = el("input",{type:"checkbox",checked:""}); const ci = el("input",{type:"checkbox"}); const sort = el("input",{type:"checkbox"});
    opts.append(labelCheck(trim,"去除首尾空格"), labelCheck(ci,"忽略大小写"), labelCheck(sort,"排序 A\u2192Z"));
    const run=()=>{ let out=C.removeDuplicateLines(input.value,{trim:trim.checked,caseInsensitive:ci.checked}); if(sort.checked) out=C.sortLines(out,{caseInsensitive:ci.checked}); output.value=out; };
    const btn=el("button",{class:"btn primary",type:"button"},"处理"); btn.addEventListener("click",run);
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"结果"), copyBtn(()=>output.value));
    root.append(field("输入列表", input), opts, el("div",{class:"btns"}), btn, bar, output);
  },
  "lorem-ipsum"(root) {
    const p=num(3,{min:"1",max:"50"}); const w=num(40,{min:"5",max:"200"}); const output=ta("",{readonly:""});
    const run=()=>output.value=C.loremIpsum(+p.value,+w.value);
    const btn=el("button",{class:"btn primary",type:"button"},"生成"); btn.addEventListener("click",run);
    const row=el("div",{class:"row"}); row.append(field("段落数",p), field("每段词数",w));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"结果"), copyBtn(()=>output.value));
    root.append(row, el("div",{class:"btns"}), btn, bar, output); run();
  },
  "text-diff"(root) {
    const a=ta(); const b=ta(); const out=el("div",{class:"panel",style:"margin-top:0"});
    const run=()=>{ out.innerHTML=""; for(const d of C.lineDiff(a.value,b.value)){ if(d.type==="equal") out.appendChild(el("div",{class:"diff-line"},escapeHtml("  "+d.value)||"&nbsp;")); else if(d.type==="add") out.appendChild(el("div",{class:"diff-line add"},escapeHtml("+ "+d.value)||"&nbsp;")); else out.appendChild(el("div",{class:"diff-line remove"},escapeHtml("- "+d.value)||"&nbsp;")); } };
    const btn=el("button",{class:"btn primary",type:"button"},"对比"); btn.addEventListener("click",run);
    const row=el("div",{class:"row"}); row.append(field("原文",a), field("修改后",b));
    root.append(row, el("div",{class:"btns"}), btn, el("div",{class:"toolbar"},"<span>差异</span>"), out);
  },
  "json-formatter"(root) {
    const input=ta(); const output=ta("",{readonly:""}); const msg=el("div",{class:"msg"});
    const indent=el("select",{}); [["2","2 空格"],["4","4 空格"],["\t","制表符"]].forEach(([v,l])=>indent.appendChild(el("option",{value:v},l)));
    const format=()=>{ const r=C.formatJson(input.value, indent.value==="\t"?"\t":+indent.value); apply(r); };
    const minify=()=>{ const r=C.minifyJson(input.value); apply(r); };
    const apply=(r)=>{ if(r.ok){output.value=r.output; msg.className="msg ok"; msg.textContent="JSON 有效 \u2713";} else {output.value=""; msg.className="msg err"; msg.textContent="JSON 无效："+r.error;} };
    const bF=el("button",{class:"btn primary",type:"button"},"格式化"); bF.addEventListener("click",format);
    const bM=el("button",{class:"btn",type:"button"},"压缩"); bM.addEventListener("click",minify);
    const btns=el("div",{class:"btns"}); btns.append(bF,bM);
    const bar=el("div",{class:"toolbar"}); bar.append(field("缩进",indent), copyBtn(()=>output.value));
    root.append(field("输入 JSON", input), btns, msg, bar, output);
  },
  "base64"(root){ transformPair(root, C.base64Encode, C.base64Decode, "编码","解码"); },
  "url-encode"(root){ transformPair(root, (t)=>C.urlEncode(t,true), C.urlDecode, "编码","解码"); },
  "hash-generator"(root){
    const input=ta(); const output=ta("",{readonly:""});
    const algo=el("select",{}); ["SHA-256","SHA-1","SHA-384","SHA-512"].forEach(a=>algo.appendChild(el("option",{value:a},a)));
    const run=async()=>{ output.value=await C.hashText(input.value, algo.value); };
    input.addEventListener("input",run); algo.addEventListener("change",run);
    const bar=el("div",{class:"toolbar"}); bar.append(field("算法",algo), copyBtn(()=>output.value));
    root.append(field("输入",input), bar, output); run();
  },
  "uuid-generator"(root){
    const count=num(5,{min:"1",max:"500"}); const output=ta("",{readonly:""});
    const run=()=>{ const n=Math.min(500,Math.max(1,+count.value||1)); output.value=Array.from({length:n},()=>C.uuidV4()).join("\n"); };
    const btn=el("button",{class:"btn primary",type:"button"},"生成"); btn.addEventListener("click",run);
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"UUID 列表"), copyBtn(()=>output.value));
    root.append(field("数量",count), el("div",{class:"btns"}), btn, bar, output); run();
  },
  "timestamp"(root){
    const tsIn=text(String(Math.floor(Date.now()/1000))); const dateOut=text("",{readonly:""});
    const isoIn=text(new Date().toISOString().slice(0,19)); const tsOut=text("",{readonly:""});
    const unit=el("select",{}); [["s","秒"],["ms","毫秒"]].forEach(([v,l])=>unit.appendChild(el("option",{value:v},l)));
    const toDate=()=>{ const r=C.timestampToISO(tsIn.value, unit.value); dateOut.value=r||"无效"; };
    const toTs=()=>{ const r=C.isoToTimestamp(isoIn.value, unit.value); tsOut.value=r==null?"无效":String(r); };
    tsIn.addEventListener("input",toDate); unit.addEventListener("change",()=>{toDate();toTs();}); isoIn.addEventListener("input",toTs);
    root.append(field("单位",unit), field("时间戳 \u2192 日期（ISO）",tsIn), dateOut, el("div",{style:"height:10px"}), field("日期（ISO） \u2192 时间戳",isoIn), tsOut); toDate(); toTs();
  },
  "color-converter"(root){
    const hex=text("#6d5efc"); const preview=el("div",{style:"height:56px;border-radius:10px;border:1px solid var(--border)"});
    const rgb=text("",{readonly:""}); const hsl=text("",{readonly:""}); const msg=el("div",{class:"msg"});
    const run=()=>{ const c=C.hexToRgb(hex.value); if(!c){msg.className="msg err";msg.textContent="请输入有效的 HEX，如 #6d5efc";return;} msg.className="msg"; msg.textContent=""; const h=C.rgbToHsl(c.r,c.g,c.b); preview.style.background=C.rgbToHex(c.r,c.g,c.b); rgb.value=`rgb(${c.r}, ${c.g}, ${c.b})`; hsl.value=`hsl(${h.h}, ${h.s}%, ${h.l}%)`; };
    hex.addEventListener("input",run);
    root.append(field("HEX",hex), preview, el("div",{style:"height:12px"}), field("RGB",rgb), field("HSL",hsl), msg); run();
  },
  "palette-generator"(root){
    const hex=text("#6d5efc"); const sw=el("div",{class:"swatches"}); const msg=el("div",{class:"msg"});
    const run=()=>{ const shades=C.generatePalette(hex.value); if(!shades){msg.className="msg err";msg.textContent="请输入有效的 HEX";return;} msg.className="msg"; msg.textContent=""; sw.innerHTML=""; shades.forEach(s=>{ const d=el("div",{class:"swatch",title:s}); d.style.background=s; d.appendChild(el("span",{},s)); d.addEventListener("click",()=>navigator.clipboard.writeText(s)); sw.appendChild(d); }); };
    hex.addEventListener("input",run);
    root.append(field("基础颜色（HEX）",hex), msg, el("div",{class:"toolbar"},"<span>点击色块复制</span>"), sw); run();
  },
  "contrast-checker"(root){
    const fg=text("#ffffff"); const bg=text("#6d5efc"); const prev=el("div",{style:"height:80px;border-radius:10px;display:grid;place-items:center;font-weight:700;font-size:18px;border:1px solid var(--border)"},"示例文字");
    const meta=metaBox([["-","比值"],["-","AA 正常"],["-","AAA 正常"]]);
    const run=()=>{ const r=C.contrastRatio(fg.value,bg.value); prev.style.color=fg.value; prev.style.background=bg.value; const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v; if(r==null){set("比值","无效");set("AA 正常","-");set("AAA 正常","-");return;} set("比值",r+":1"); set("AA 正常", r>=4.5?"通过 \u2713":"未通过"); set("AAA 正常", r>=7?"通过 \u2713":"未通过"); };
    fg.addEventListener("input",run); bg.addEventListener("input",run);
    const row=el("div",{class:"row"}); row.append(field("文字颜色",fg), field("背景色",bg));
    root.append(row, prev, meta); run();
  },
  "utm-builder"(root){
    const url=text("https://example.com"); const src=text("newsletter"); const med=text("email"); const camp=text("launch"); const term=text(""); const cont=text("");
    const out=ta("",{readonly:"",style:"min-height:80px"});
    const run=()=>out.value=C.buildUtm({url:url.value,source:src.value,medium:med.value,campaign:camp.value,term:term.value,content:cont.value})||"请输入有效的 URL";
    [url,src,med,camp,term,cont].forEach(i=>i.addEventListener("input",run));
    const r1=el("div",{class:"row"}); r1.append(field("来源*",src), field("媒介*",med), field("活动*",camp));
    const r2=el("div",{class:"row"}); r2.append(field("关键词",term), field("内容",cont));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"追踪链接"), copyBtn(()=>out.value));
    root.append(field("网站 URL*",url), r1, r2, bar, out); run();
  },
  "slugify"(root){
    const input=text("My Awesome Blog Post!"); const out=text("",{readonly:""});
    const run=()=>out.value=C.slugify(input.value); input.addEventListener("input",run);
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"Slug"), copyBtn(()=>out.value));
    root.append(field("标题 / 文本",input), bar, out); run();
  },
  "password-generator"(root){
    const len=num(16,{min:"4",max:"128"}); const out=text("",{readonly:"",class:"mono"});
    const up=el("input",{type:"checkbox",checked:""}); const lo=el("input",{type:"checkbox",checked:""}); const di=el("input",{type:"checkbox",checked:""}); const sy=el("input",{type:"checkbox",checked:""});
    const opts=el("div",{class:"checks"}); opts.append(labelCheck(up,"A-Z"),labelCheck(lo,"a-z"),labelCheck(di,"0-9"),labelCheck(sy,"!@#"));
    const run=()=>out.value=C.passwordGenerate({length:+len.value,upper:up.checked,lower:lo.checked,digits:di.checked,symbols:sy.checked});
    const btn=el("button",{class:"btn primary",type:"button"},"生成"); btn.addEventListener("click",run);
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"密码"), copyBtn(()=>out.value));
    root.append(field("长度",len), opts, el("div",{class:"btns"}), btn, bar, out); run();
  },
  "profit-margin"(root){
    const cost=num(60); const price=num(100);
    const meta=metaBox([["-","利润"],["-","利润率 %"],["-","加价率 %"]]);
    const run=()=>{ const r=C.profitMargin({cost:cost.value,price:price.value}); const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v; set("利润",r.profit); set("利润率 %",r.marginPct+"%"); set("加价率 %",r.markupPct+"%"); };
    [cost,price].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("成本",cost), field("售价",price));
    root.append(row, meta); run();
  },
  "roas-calculator"(root){
    const rev=num(5000); const spend=num(1000); const meta=metaBox([["-","ROAS"],["-","ACOS %"]]);
    const run=()=>{ const r=C.roas({revenue:rev.value,adSpend:spend.value}); const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v; set("ROAS",r.roas+"x"); set("ACOS %",r.acos+"%"); };
    [rev,spend].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("营收",rev), field("广告支出",spend));
    root.append(row, meta); run();
  },
  "break-even"(root){
    const fc=num(10000); const pp=num(50); const vc=num(30); const meta=metaBox([["-","数量"],["-","营收"]]);
    const run=()=>{ const r=C.breakEven({fixedCosts:fc.value,pricePerUnit:pp.value,variableCostPerUnit:vc.value}); const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v; set("数量", r.units===Infinity?"\u221E":r.units); set("营收", r.revenue===Infinity?"\u221E":r.revenue); };
    [fc,pp,vc].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("固定成本",fc), field("单价",pp), field("单位变动成本",vc));
    root.append(row, meta); run();
  },
  "loan-calculator"(root){
    const p=num(200000); const r=num(5.5,{step:"0.01"}); const m=num(360); const meta=metaBox([["-","月供"],["-","总利息"],["-","总计支付"]]);
    const run=()=>{ const x=C.loanPayment({principal:p.value,annualRatePct:r.value,months:m.value}); const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v; set("月供",x.monthly); set("总利息",x.totalInterest); set("总计支付",x.total); };
    [p,r,m].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("本金",p), field("年利率 %",r), field("月数",m));
    root.append(row, meta); run();
  },
  "percentage"(root){
    const a=num(15); const b=num(200); const meta=metaBox([["-","X% 的 Y"],["-","X 占 Y 的百分比"],["-","变化 X\u2192Y"]]);
    const run=()=>{ const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v; set("X% 的 Y", round(C.percentOf(+a.value,+b.value))); set("X 占 Y 的百分比", round(C.whatPercent(+a.value,+b.value))+"%"); set("变化 X\u2192Y", round(C.percentChange(+a.value,+b.value))+"%"); };
    [a,b].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("X",a), field("Y",b));
    root.append(row, meta); run();
  },
  "image-compressor"(root){ imageTool(root, "compress"); },
  "image-resizer"(root){ imageTool(root, "resize"); },
  "image-converter"(root){ imageTool(root, "convert"); },
  "reverse-text"(root){
    const input=ta("Hello World"); const output=ta("",{readonly:""});
    const mode=el("select",{}); [["chars","字符"],["words","字数"],["lines","行"]].forEach(([v,l])=>mode.appendChild(el("option",{value:v},l)));
    const run=()=>output.value=C.reverseText(input.value, mode.value);
    input.addEventListener("input",run); mode.addEventListener("change",run);
    const bar=el("div",{class:"toolbar"}); bar.append(field("反转方式",mode), copyBtn(()=>output.value));
    root.append(field("输入",input), bar, output); run();
  },
  "find-replace"(root){
    const input=ta("the quick brown fox\nthe lazy dog"); const find=text("the"); const repl=text("THE");
    const output=ta("",{readonly:""}); const msg=el("div",{class:"msg"});
    const rx=el("input",{type:"checkbox"}); const ci=el("input",{type:"checkbox"});
    const opts=el("div",{class:"checks"}); opts.append(labelCheck(rx,"正则"),labelCheck(ci,"忽略大小写"));
    const run=()=>{ const r=C.findReplace(input.value, find.value, repl.value, {regex:rx.checked, caseInsensitive:ci.checked}); if(r.ok){output.value=r.output;msg.className="msg ok";msg.textContent=r.count+" 处替换";}else{output.value="";msg.className="msg err";msg.textContent=r.error;} };
    [input,find,repl].forEach(i=>i.addEventListener("input",run)); [rx,ci].forEach(i=>i.addEventListener("change",run));
    const row=el("div",{class:"row"}); row.append(field("查找",find), field("替换为",repl));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"结果"), copyBtn(()=>output.value));
    root.append(field("文本",input), row, opts, msg, bar, output); run();
  },
  "whitespace-remover"(root){
    const input=ta("  hello   world  \n\n\n  foo  bar  "); const output=ta("",{readonly:""});
    const tl=el("input",{type:"checkbox",checked:""});const cs=el("input",{type:"checkbox",checked:""});const rb=el("input",{type:"checkbox"});const ras=el("input",{type:"checkbox"});
    const opts=el("div",{class:"checks"}); opts.append(labelCheck(tl,"逐行去空格"),labelCheck(cs,"合并空格"),labelCheck(rb,"删除空行"),labelCheck(ras,"删除所有空格"));
    const run=()=>output.value=C.removeWhitespace(input.value,{trimLines:tl.checked,collapseSpaces:cs.checked,removeBlankLines:rb.checked,removeAllSpaces:ras.checked});
    input.addEventListener("input",run); [tl,cs,rb,ras].forEach(i=>i.addEventListener("change",run));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"结果"), copyBtn(()=>output.value));
    root.append(field("输入",input), opts, bar, output); run();
  },
  "text-repeater"(root){
    const input=ta("Hello"); const times=num(5,{min:"1",max:"10000"}); const sep=text("\\n");
    const output=ta("",{readonly:""});
    const run=()=>{ const s=sep.value.replace(/\\n/g,"\n").replace(/\\t/g,"\t"); output.value=C.repeatText(input.value,+times.value,s); };
    [input,times,sep].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("次数",times), field("分隔符（\\n、\\t 或文本）",sep));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"结果"), copyBtn(()=>output.value));
    root.append(field("文本",input), row, bar, output); run();
  },
  "word-frequency"(root){
    const input=ta("the cat sat on the mat the cat ran"); const out=el("div",{class:"panel",style:"margin-top:0;max-height:360px;overflow:auto"});
    const run=()=>{ const rows=C.wordFrequency(input.value); out.innerHTML=""; if(!rows.length){out.textContent="没有词语";return;} rows.slice(0,100).forEach(r=>out.appendChild(el("div",{class:"diff-line"}, `${escapeHtml(r.word)} <span style="float:right;color:var(--brand)">${r.count}</span>`))); };
    input.addEventListener("input",run);
    root.append(field("文本",input), el("div",{class:"toolbar"},"<span>词频（前 100）</span>"), out); run();
  },
  "rot13"(root){
    const input=ta("Hello, World!"); const output=ta("",{readonly:""}); const shift=num(13,{min:"0",max:"25"});
    const run=()=>output.value=C.caesarShift(input.value,+shift.value);
    [input,shift].forEach(i=>i.addEventListener("input",run));
    const bar=el("div",{class:"toolbar"}); bar.append(field("位移（13 = ROT13）",shift), copyBtn(()=>output.value));
    root.append(field("输入",input), bar, output); run();
  },
  "json-to-csv"(root){ okConvert(root, C.jsonToCsv, "JSON（对象数组）", "CSV"); },
  "csv-to-json"(root){ okConvert(root, (t)=>C.csvToJson(t), "CSV（首行为表头）", "JSON"); },
  "html-entities"(root){ transformPair(root, C.htmlEntitiesEncode, C.htmlEntitiesDecode, "编码","解码"); },
  "jwt-decoder"(root){
    const input=ta("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
    const header=ta("",{readonly:""}); const payload=ta("",{readonly:""}); const msg=el("div",{class:"msg"});
    const run=()=>{ const r=C.jwtDecode(input.value); if(!r.ok){header.value="";payload.value="";msg.className="msg err";msg.textContent=r.error;return;} msg.className="msg";msg.textContent=r.expInfo?(r.expInfo.expired?"\u26a0\ufe0f 已过期 "+r.expInfo.expiresAt:"有效期至 "+r.expInfo.expiresAt):""; header.value=JSON.stringify(r.header,null,2); payload.value=JSON.stringify(r.payload,null,2); };
    input.addEventListener("input",run);
    root.append(field("JWT 令牌",input), msg, field("头部",header), field("载荷",payload)); run();
  },
  "number-base"(root){
    const val=text("255"); const from=el("select",{}); const to=el("select",{});
    [["10","十进制 (10)"],["2","二进制 (2)"],["8","八进制 (8)"],["16","十六进制 (16)"]].forEach(([v,l])=>{from.appendChild(el("option",{value:v},l)); to.appendChild(el("option",{value:v},l));});
    to.value="2";
    const out=text("",{readonly:""}); const msg=el("div",{class:"msg"});
    const run=()=>{ const r=C.numberBaseConvert(val.value, +from.value, +to.value); if(r.ok){out.value=r.output;msg.className="msg";msg.textContent="";}else{out.value="";msg.className="msg err";msg.textContent=r.error;} };
    [val,from,to].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("源进制",from), field("目标进制",to));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"结果"), copyBtn(()=>out.value));
    root.append(field("值",val), row, bar, out); run();
  },
  "query-parser"(root){
    const input=text("https://x.com/p?utm_source=nl&id=5&id=6&q=hello world"); const out=ta("",{readonly:""});
    const run=()=>out.value=JSON.stringify(C.parseQueryString(input.value),null,2);
    input.addEventListener("input",run);
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"解析后的 JSON"), copyBtn(()=>out.value));
    root.append(field("URL 或查询字符串",input), bar, out); run();
  },
  "regex-tester"(root){
    const pat=text("\\w+@\\w+\\.\\w+"); const flags=text("gi"); const txt=ta("Contact a@b.com or c@d.org");
    const out=el("div",{class:"panel",style:"margin-top:0"}); const msg=el("div",{class:"msg"});
    const run=()=>{ const r=C.regexTest(pat.value, flags.value, txt.value); if(!r.ok){msg.className="msg err";msg.textContent=r.error;out.innerHTML="";return;} msg.className="msg ok";msg.textContent=r.matches.length+" 处匹配"; out.innerHTML=""; r.matches.forEach(m=>out.appendChild(el("div",{class:"diff-line add"}, escapeHtml(m.match)+` <span style=\"color:var(--text-faint)\">@${m.index}</span>`))); };
    [pat,flags,txt].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("正则表达式",pat), field("标志",flags));
    root.append(row, field("测试字符串",txt), msg, el("div",{class:"toolbar"},"<span>匹配结果</span>"), out); run();
  },
  "unit-length"(root){ unitTool(root, [["m","米"],["km","千米"],["cm","厘米"],["mm","毫米"],["mi","英里"],["yd","码"],["ft","英尺"],["in","英寸"],["nmi","海里"]], C.convertLength, "m","ft", 100); },
  "unit-weight"(root){ unitTool(root, [["g","克"],["kg","千克"],["mg","毫克"],["t","公吨"],["lb","磅"],["oz","盎司"],["st","英石"]], C.convertWeight, "kg","lb", 10); },
  "unit-temperature"(root){ unitTool(root, [["C","摄氏度"],["F","华氏度"],["K","开尔文"]], C.convertTemperature, "C","F", 25); },
  "data-size"(root){ unitTool(root, [["B","字节"],["KB","千字节"],["MB","兆字节"],["GB","吉字节"],["TB","太字节"],["bit","比特"]], C.convertDataSize, "MB","KB", 5); },
  "roman-numeral"(root){
    const numIn=num(2026,{min:"1",max:"3999"}); const romanOut=text("",{readonly:""});
    const romanIn=text("MMXXVI"); const numOut=text("",{readonly:""});
    const toRoman=()=>romanOut.value=C.intToRoman(numIn.value)||"仅支持 1-3999";
    const toNum=()=>{ const r=C.romanToInt(romanIn.value); numOut.value=r==null?"无效":String(r); };
    numIn.addEventListener("input",toRoman); romanIn.addEventListener("input",toNum);
    root.append(field("数字 \u2192 罗马数字（1-3999）",numIn), romanOut, el("div",{style:"height:12px"}), field("罗马数字 \u2192 数字",romanIn), numOut); toRoman(); toNum();
  },
  "aspect-ratio"(root){
    const w=num(1920); const h=num(1080); const meta=metaBox([["-","比值"],["-","小数"]]);
    const run=()=>{ const r=C.aspectRatio(w.value,h.value); const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v; if(!r){set("比值","-");set("小数","-");return;} set("比值",r.ratio); set("小数",r.decimal); };
    [w,h].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("宽度",w), field("高度",h));
    root.append(row, meta); run();
  },
  "gradient-generator"(root){
    const c1=text("#6d5efc"); const c2=text("#23d5ab"); const angle=num(90,{min:"0",max:"360"});
    const prev=el("div",{style:"height:120px;border-radius:12px;border:1px solid var(--border)"}); const out=text("",{readonly:""});
    const run=()=>{ const css=C.cssGradient({angle:+angle.value, stops:[{color:c1.value,pos:0},{color:c2.value,pos:100}]}); prev.style.background=css; out.value="background: "+css+";"; };
    [c1,c2,angle].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("颜色 1",c1), field("颜色 2",c2), field("角度",angle));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"CSS"), copyBtn(()=>out.value));
    root.append(row, prev, el("div",{style:"height:12px"}), bar, out); run();
  },
  "box-shadow"(root){
    const x=num(0);const y=num(10);const blur=num(30);const spread=num(0);const color=text("rgba(0,0,0,0.35)");
    const prev=el("div",{style:"height:130px;display:grid;place-items:center"}); const box=el("div",{style:"width:120px;height:70px;background:var(--brand);border-radius:12px"}); prev.append(box);
    const out=text("",{readonly:""});
    const run=()=>{ const css=C.cssBoxShadow({x:+x.value,y:+y.value,blur:+blur.value,spread:+spread.value,color:color.value}); box.style.boxShadow=css; out.value="box-shadow: "+css+";"; };
    [x,y,blur,spread,color].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("X",x),field("Y",y),field("模糊",blur),field("扩展",spread));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"CSS"), copyBtn(()=>out.value));
    root.append(row, field("颜色",color), prev, bar, out); run();
  },
  "border-radius"(root){
    const tl=num(18);const tr=num(18);const br=num(18);const bl=num(18);
    const prev=el("div",{style:"height:130px;display:grid;place-items:center"}); const box=el("div",{style:"width:150px;height:95px;background:var(--brand);border:1px solid var(--border)"}); prev.append(box);
    const out=text("",{readonly:""});
    const run=()=>{ const css=C.cssBorderRadius({tl:+tl.value,tr:+tr.value,br:+br.value,bl:+bl.value}); box.style.borderRadius=css; out.value="border-radius: "+css+";"; };
    [tl,tr,br,bl].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("左上",tl),field("右上",tr),field("右下",br),field("左下",bl));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"CSS"), copyBtn(()=>out.value));
    root.append(row, prev, bar, out); run();
  },
  "meta-tag-generator"(root){
    const t=text("我的页面标题"); const d=text("160 字以内的简明描述。"); const u=text("https://example.com"); const img=text("https://example.com/og.png");
    const out=ta("",{readonly:"",style:"min-height:170px"});
    const run=()=>out.value=C.metaTags({title:t.value,description:d.value,url:u.value,image:img.value});
    [t,d,u,img].forEach(i=>i.addEventListener("input",run));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"HTML"), copyBtn(()=>out.value));
    root.append(field("Title",t), field("描述",d), field("URL",u), field("图片 URL",img), bar, out); run();
  },
  "robots-generator"(root){
    const dis=ta("/admin\n/cart\n/checkout"); const sm=text("https://example.com/sitemap.xml");
    const out=ta("",{readonly:""});
    const run=()=>out.value=C.robotsTxt({disallow:dis.value.split(/\n+/), sitemap:sm.value});
    [dis,sm].forEach(i=>i.addEventListener("input",run));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"robots.txt"), copyBtn(()=>out.value));
    root.append(field("禁止路径（每行一个）",dis), field("站点地图 URL",sm), bar, out); run();
  },
  "random-string"(root){
    const len=num(24,{min:"1",max:"256"}); const out=text("",{readonly:"",class:"mono"});
    const up=el("input",{type:"checkbox",checked:""});const lo=el("input",{type:"checkbox",checked:""});const di=el("input",{type:"checkbox",checked:""});const sy=el("input",{type:"checkbox"});
    const opts=el("div",{class:"checks"}); opts.append(labelCheck(up,"A-Z"),labelCheck(lo,"a-z"),labelCheck(di,"0-9"),labelCheck(sy,"!@#"));
    const run=()=>out.value=C.randomString({length:+len.value,upper:up.checked,lower:lo.checked,digits:di.checked,symbols:sy.checked});
    const btn=el("button",{class:"btn primary",type:"button"},"生成"); btn.addEventListener("click",run);
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"随机字符串"), copyBtn(()=>out.value));
    root.append(field("长度",len), opts, el("div",{class:"btns"}), btn, bar, out); run();
  },
  "random-number"(root){
    const min=num(1);const max=num(100);const count=num(5,{min:"1",max:"1000"});const uniq=el("input",{type:"checkbox"});
    const out=ta("",{readonly:""});
    const run=()=>out.value=C.randomNumbers({min:+min.value,max:+max.value,count:+count.value,unique:uniq.checked}).join("\n");
    const btn=el("button",{class:"btn primary",type:"button"},"生成"); btn.addEventListener("click",run);
    const row=el("div",{class:"row"}); row.append(field("最小值",min),field("最大值",max),field("数量",count));
    const opts=el("div",{class:"checks"}); opts.append(labelCheck(uniq,"唯一值"));
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"数字"), copyBtn(()=>out.value));
    root.append(row, opts, el("div",{class:"btns"}), btn, bar, out); run();
  },
  "discount"(root){ calcTool(root, [{key:"price",label:"原价",val:100},{key:"percentOff",label:"折扣 %",val:25}], (v)=>{ const r=C.discount({price:v.price,percentOff:v.percentOff}); return {"节省":r.saved,"最终价格":r.final}; }, ["节省","最终价格"]); },
  "tip"(root){ calcTool(root, [{key:"bill",label:"账单金额",val:80},{key:"tipPct",label:"小费 %",val:18},{key:"people",label:"分摊人数",val:2,attrs:{min:"1"}}], (v)=>{ const r=C.tip({bill:v.bill,tipPct:v.tipPct,people:v.people}); return {"小费":r.tip,"合计":r.total,"每人":r.perPerson}; }, ["小费","合计","每人"]); },
  "bmi"(root){ calcTool(root, [{key:"weightKg",label:"体重（kg）",val:70},{key:"heightCm",label:"身高（cm）",val:175}], (v)=>{ const r=C.bmi({weightKg:v.weightKg,heightCm:v.heightCm}); return r?{"BMI":r.bmi,"分类":r.category}:{"BMI":"-","分类":"-"}; }, ["BMI","分类"]); },
  "sales-tax"(root){ calcTool(root, [{key:"amount",label:"金额",val:100},{key:"taxPct",label:"税率 %",val:8.5,attrs:{step:"0.01"}}], (v)=>{ const r=C.salesTax({amount:v.amount,taxPct:v.taxPct}); return {"税额":r.tax,"合计":r.total}; }, ["税额","合计"]); },
  "platform-fee"(root){ calcTool(root, [{key:"price",label:"售价",val:100},{key:"feePct",label:"费率 %",val:15,attrs:{step:"0.1"}},{key:"fixedFee",label:"固定费用",val:0.3,attrs:{step:"0.01"}}], (v)=>{ const r=C.platformFee({price:v.price,feePct:v.feePct,fixedFee:v.fixedFee}); return {"费用":r.fee,"实收":r.net}; }, ["费用","实收"]); },
  "compound-interest"(root){ calcTool(root, [{key:"principal",label:"本金",val:10000},{key:"annualRatePct",label:"年利率 %",val:7,attrs:{step:"0.01"}},{key:"years",label:"年",val:10},{key:"contribution",label:"每月追加",val:100}], (v)=>{ const r=C.compoundInterest({principal:v.principal,annualRatePct:v.annualRatePct,years:v.years,timesPerYear:12,contribution:v.contribution}); return {"最终余额":r.finalBalance,"总利息":r.totalInterest,"累计投入":r.totalContributions}; }, ["最终余额","总利息","累计投入"]); },
  "age"(root){
    const birth=text("1995-06-15",{type:"date"}); const at=text("",{type:"date"});
    const meta=metaBox([["-","年"],["-","月数"],["-","天"],["-","总天数"]]);
    const run=()=>{ const r=C.ageBetween(birth.value, at.value||undefined); const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v; if(!r){["年","月数","天","总天数"].forEach(k=>set(k,"-"));return;} set("年",r.years);set("月数",r.months);set("天",r.days);set("总天数",r.totalDays); };
    [birth,at].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("出生日期",birth), field("截止日期（默认今天）",at));
    root.append(row, meta); run();
  },
  "date-diff"(root){
    const a=text("2026-01-01",{type:"date"}); const b=text("2026-12-31",{type:"date"});
    const meta=metaBox([["-","天"],["-","周"],["-","小时"]]);
    const run=()=>{ const r=C.dateDiff(a.value,b.value); const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v; if(!r){["天","周","小时"].forEach(k=>set(k,"-"));return;} set("天",r.days);set("周",r.weeks);set("小时",r.hours); };
    [a,b].forEach(i=>i.addEventListener("input",run));
    const row=el("div",{class:"row"}); row.append(field("从",a), field("到",b));
    root.append(row, meta); run();
  },
  "token-counter"(root){
    const input=ta("在此粘贴你的提示词，估算它会使用多少 token。");
    const meta=metaBox([["0","预计 token"],["0","字符"],["0","字数"],["0","CJK 字符"]]);
    const note=el("div",{class:"msg"},"仅为估算 \u2014 实际分词器（tiktoken/BPE）因模型而异。经验法则：拉丁文 \u2248 4 字符/token，CJK \u2248 1.5 token/字。");
    const run=()=>{ const r=C.estimateTokens(input.value); const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v; set("预计 token",r.tokens); set("字符",r.chars); set("字数",r.words); set("CJK 字符",r.cjk); };
    input.addEventListener("input",run);
    root.append(field("文本",input), meta, note); run();
  },
  "ai-cost-calculator"(root){
    const model=el("select",{});
    const byProv={}; AI_MODELS.forEach(m=>{(byProv[m.provider]=byProv[m.provider]||[]).push(m);});
    Object.keys(byProv).forEach(prov=>{const og=el("optgroup",{label:prov}); byProv[prov].forEach(m=>og.appendChild(el("option",{value:m.id},`${m.name}  ($${m.in} / $${m.out})`))); model.appendChild(og);});
    const inTok=num(1000,{min:"0"}); const outTok=num(500,{min:"0"}); const reqs=num(1000,{min:"1"});
    const info=el("div",{class:"model-info"});
    const meta=metaBox([["$0","输入费用"],["$0","输出费用"],["$0","每次请求"],["$0","合计"]]);
    const cmpHead=el("div",{class:"section-title small"},"<h3>全模型成本对比（按合计从低到高）</h3>");
    const table=el("div",{class:"cost-table"});
    const cmpWrap=el("div",{class:"cost-compare"}); cmpWrap.append(cmpHead,table);
    const fmt=(n)=> n>=1 ? "$"+n.toFixed(2) : "$"+n.toFixed(4);
    const run=()=>{
      const m=AI_MODELS.find(x=>x.id===model.value)||AI_MODELS[0];
      const r=C.aiCost({inputTokens:+inTok.value,outputTokens:+outTok.value,inPricePerM:m.in,outPricePerM:m.out,requests:+reqs.value});
      const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v;
      set("输入费用","$"+r.inputCost); set("输出费用","$"+r.outputCost); set("每次请求","$"+r.perRequest); set("合计","$"+r.total);
      info.innerHTML=`<b>${m.name}</b> · ${m.provider} · 上下文 ${m.ctx} · ${m.note} · 参考单价 $${m.in} / $${m.out}（每百万 token 输入 / 输出）`;
      const rows=AI_MODELS.map(x=>{const c=C.aiCost({inputTokens:+inTok.value,outputTokens:+outTok.value,inPricePerM:x.in,outPricePerM:x.out,requests:+reqs.value}); return {x, total:+c.total};}).sort((a,b)=>a.total-b.total);
      table.innerHTML="";
      const header=el("div",{class:"ct-row ct-head"}); header.innerHTML=`<span>模型</span><span>厂商</span><span>上下文</span><span>输入价</span><span>输出价</span><span>合计</span>`; table.append(header);
      rows.forEach(({x,total})=>{const tr=el("div",{class:"ct-row"+(x.id===m.id?" ct-active":"")}); tr.innerHTML=`<span class="ct-name">${x.name}</span><span>${x.provider}</span><span>${x.ctx}</span><span>$${x.in}</span><span>$${x.out}</span><span class="ct-total">${fmt(total)}</span>`; table.append(tr);});
    };
    [inTok,outTok,reqs].forEach(i=>i.addEventListener("input",run)); model.addEventListener("change",run);
    const note=el("div",{class:"msg"},"价格为每百万 token 的参考单价（美元），2026 年 7 月核对，且经常变动 —— 请以各服务商官方定价页为准。");
    const links=el("div",{class:"link-row"}); [["OpenAI","https://openai.com/api/pricing/"],["Anthropic","https://www.anthropic.com/pricing"],["Google","https://ai.google.dev/gemini-api/docs/pricing"],["DeepSeek","https://api-docs.deepseek.com/quick_start/pricing"],["阿里通义","https://help.aliyun.com/zh/model-studio/models"],["xAI","https://x.ai/api"]].forEach(([n,u])=>links.append(el("a",{class:"btn sm",href:u,target:"_blank",rel:"noopener"},n+" 定价 ↗")));
    const row=el("div",{class:"row"}); row.append(field("每次请求输入 token",inTok), field("每次请求输出 token",outTok), field("请求数",reqs));
    root.append(field("模型",model), info, row, meta, cmpWrap, note, links); run();
  },
  "free-llm-api"(root){
    const search=text("",{placeholder:"搜索服务商或模型（Qwen、Llama、DeepSeek…）"});
    const type=el("select",{}); ["全部类型",...new Set(FREE_LLM_PROVIDERS.map(p=>p.type))].forEach(t=>type.append(el("option",{value:t},t)));
    const region=el("select",{}); ["全部区域",...new Set(FREE_LLM_PROVIDERS.map(p=>p.region))].forEach(r=>region.append(el("option",{value:r},r)));
    const cnOnly=el("input",{type:"checkbox"});
    const count=el("span",{class:"dir-count"}); const list=el("div",{class:"dir-rows"});
    const render=()=>{const q=search.value.trim().toLowerCase(); let rows=FREE_LLM_PROVIDERS.filter(p=>!q || (p.name+" "+p.models+" "+p.note).toLowerCase().includes(q)); if(type.value!=="全部类型")rows=rows.filter(p=>p.type===type.value); if(region.value!=="全部区域")rows=rows.filter(p=>p.region===region.value); if(cnOnly.checked)rows=rows.filter(p=>p.region==="国内直连"); count.textContent=rows.length+" 个服务商"; list.innerHTML=""; if(!rows.length){list.append(el("div",{class:"msg"},"没有匹配的服务商。"));return;} rows.forEach(p=>{const card=el("details",{class:"dir-drow"}); const sum=el("summary",{class:"dir-row"}); const ico=el("span",{class:"dr-ico"}); ico.textContent=p.name.charAt(0); ico.style.background=p.region==="国内直连"?"linear-gradient(135deg,#E0574C,#f08a7f)":"linear-gradient(135deg,#5E9FE8,#7FB2F0)"; const main=el("div",{class:"dr-main"}); main.append(el("span",{class:"dr-name"},p.name), el("span",{class:"dr-desc"},p.models)); const tags=el("div",{class:"dr-tags"}); const typeCls=p.type==="免费额度"?"ok":"warn"; tags.append(el("span",{class:"badge sm "+typeCls},p.type), el("span",{class:"badge sm "+(p.region==="国内直连"?"ok":"")},p.region), el("span",{class:"badge sm"},p.auth)); const act=el("div",{class:"dr-act"}); act.append(el("a",{class:"btn sm",href:p.url,target:"_blank",rel:"noopener"},"官网 ↗")); sum.append(ico,main,tags,act); const body=el("div",{class:"prov-detail"}); body.innerHTML=`<div class="kv"><b>可用模型</b><span>${p.models}</span></div><div class="kv"><b>免费额度 / 限额</b><span>${p.limits}</span></div><div class="kv"><b>接入说明</b><span>${p.note}</span></div>`; card.append(sum,body); list.append(card);});};
    search.addEventListener("input",render); type.addEventListener("change",render); region.addEventListener("change",render); cnOnly.addEventListener("change",render);
    const credit=el("div",{class:"msg"},"这里只收录可调用大模型的免费 Token / 免费额度 API，不包含天气、汇率等普通公共 API。来源：cheahjs/free-llm-api-resources、mnfst/awesome-free-llm-apis、nejib1/Free-LLM、for-the-zero/Free-LLM-Collection、FreeLLM-API-KeyHub 与官方页面。类型已区分：永久免费层 / 试用 Token / 限速免费；政策会变化，请以官网为准。");
    const row=el("div",{class:"row"}); row.append(field("搜索",search), field("类型",type), field("区域",region));
    const opts=el("div",{class:"checks"}); opts.append(labelCheck(cnOnly,"仅国内直连"));
    const bar=el("div",{class:"toolbar"}); bar.append(count);
    root.append(row, opts, credit, bar, list); render();
  },
  "ai-selector"(root){
    const ctxNum=(s)=>{s=String(s).toUpperCase();let best=0,cur="";for(const ch of s){if((ch>="0"&&ch<="9")||ch==="."){cur+=ch;}else{if(cur){let n=parseFloat(cur);if(ch==="M")n*=1000000;else if(ch==="K")n*=1000;best=Math.max(best,n);}cur="";}}if(cur)best=Math.max(best,parseFloat(cur));return best||1000;};
    const task=el("select",{}); ADVISOR_TASKS.forEach(t=>task.append(el("option",{value:t.id}, t.icon+"  "+t.name)));
    const budget=el("select",{}); [["any","预算不限"],["low","低成本优先"],["free","免费额度优先"]].forEach(([v,l])=>budget.append(el("option",{value:v},l)));
    const deploy=el("select",{}); [["any","部署不限"],["cloud","云 API"],["local","本地私有化"]].forEach(([v,l])=>deploy.append(el("option",{value:v},l)));
    const cn=el("input",{type:"checkbox"}); const oss=el("input",{type:"checkbox"});
    const out=el("div",{class:"advisor-out"});
    const run=()=>{
      const t=ADVISOR_TASKS.find(x=>x.id===task.value)||ADVISOR_TASKS[0];
      let models=AI_MODELS.slice();
      if(deploy.value==="local"||oss.checked) models=models.filter(m=>MODEL_TRAITS[m.id]&&MODEL_TRAITS[m.id].open);
      if(t.prefer==="multimodal") models=models.filter(m=>MODEL_TRAITS[m.id]&&MODEL_TRAITS[m.id].modal);
      if(!models.length) models=AI_MODELS.slice();
      const price=(m)=>m.in+m.out;
      const score=(m)=>{let s=0; const h=(m.name+" "+m.note).toLowerCase();
        if(t.prefer==="cheap") s-=price(m);
        else if(t.prefer==="context") s+=ctxNum(m.ctx)/100000;
        else if(t.prefer==="code"){ if(h.includes("cod")||m.note.indexOf("代码")>=0)s+=60; s-=price(m)*0.3; }
        else if(t.prefer==="chinese"){ if(isDomestic(m.provider))s+=45; s-=price(m)*0.2; }
        else if(t.prefer==="multimodal"){ s+=ctxNum(m.ctx)/200000; s-=price(m)*0.2; }
        if(budget.value==="low"||budget.value==="free") s-=price(m)*0.6;
        if(cn.checked&&isDomestic(m.provider)) s+=25;
        return s;};
      models.sort((a,b)=>score(b)-score(a));
      const topModels=models.slice(0,3);
      let provs=FREE_LLM_PROVIDERS.slice(); if(cn.checked) provs=provs.filter(p=>p.region==="国内直连");
      const showFree=budget.value==="free"||cn.checked; const topProvs=provs.slice(0,3);
      const kwHit=(hay,kws)=>kws.some(k=>hay.toLowerCase().includes(k.toLowerCase()));
      let stack=AI_STACK.filter(x=>kwHit(x.name+" "+x.layer+" "+x.kind+" "+x.desc+" "+x.tags.join(" "), t.stackKw));
      stack.sort((a,b)=>(a.priority>b.priority?1:-1)); if(!stack.length) stack=AI_STACK.filter(x=>x.priority==="P0"); stack=stack.slice(0,5);
      let skills=LOCAL_SKILLS.filter(s=>kwHit(s.name+" "+s.cat+" "+s.desc+" "+s.tags.join(" "), t.skillKw)).slice(0,4);
      const traitBadge=(m)=>{const tr=MODEL_TRAITS[m.id]||{}; return (tr.open?'<span class="badge sm ok">开源权重</span>':'<span class="badge sm">闭源</span>')+(tr.modal?'<span class="badge sm">多模态</span>':'')+(isDomestic(m.provider)?'<span class="badge sm ok">国内直连</span>':'');};
      const modelHtml=topModels.map((m,i)=>`<div class="advisor-pick${i===0?' top':''}"><div class="ap-rank">${i===0?'首选':'备选 '+i}</div><div class="ap-body"><b>${m.name}</b> <span class="ap-prov">${m.provider}</span><div class="ap-meta">上下文 ${m.ctx} · 参考单价 $${m.in}/$${m.out} · ${m.note}</div><div class="dr-tags">${traitBadge(m)}</div></div></div>`).join("");
      const provHtml=showFree&&topProvs.length?`<div class="advisor-sec"><h4>免费 / 低成本接入</h4>${topProvs.map(p=>`<div class="advisor-line"><b>${p.name}</b><span>${p.models}</span><a class="btn sm" href="${p.url}" target="_blank" rel="noopener">官网 ↗</a></div>`).join("")}</div>`:"";
      const stackHtml=stack.length?`<div class="advisor-sec"><h4>推荐技术栈（开源）</h4>${stack.map(x=>`<div class="advisor-line"><b>${x.name}</b><span>${x.layer} · ${x.desc}</span><a class="btn sm" href="${x.url}" target="_blank" rel="noopener">项目 ↗</a></div>`).join("")}</div>`:"";
      const skillHtml=skills.length?`<div class="advisor-sec"><h4>配套 Agent Skill</h4>${skills.map(s=>`<div class="advisor-line"><b>${s.name}</b><span>${s.desc}</span><a class="btn sm" href="/tools/ai-ecosystem-directory.html">查看</a></div>`).join("")}</div>`:"";
      out.innerHTML=`<div class="advisor-why">${t.why}</div><div class="advisor-sec"><h4>推荐模型（按匹配度排序）</h4>${modelHtml}</div>${provHtml}${stackHtml}${skillHtml}`;
    };
    [task,budget,deploy].forEach(s=>s.addEventListener("change",run)); [cn,oss].forEach(c=>c.addEventListener("change",run));
    const intro=el("div",{class:"advisor-intro"},"回答几个问题，立即得到一套可落地的“模型 + 免费 API + 技术栈 + Agent Skill”组合建议。");
    const row=el("div",{class:"row"}); row.append(field("我要做什么",task),field("预算",budget),field("部署方式",deploy));
    const opts=el("div",{class:"checks"}); opts.append(labelCheck(cn,"优先国内直连"),labelCheck(oss,"仅开源可自托管"));
    const note=el("div",{class:"msg"},"建议为编辑经验整理，用于缩小选择范围；上线前请结合数据合规、许可证与实测结果最终决定。");
    root.append(intro,row,opts,out,note); run();
  },
  "ai-cost-sandbox"(root){
    const model=el("select",{}); const byProv={}; AI_MODELS.forEach(m=>{(byProv[m.provider]=byProv[m.provider]||[]).push(m);}); Object.keys(byProv).forEach(prov=>{const og=el("optgroup",{label:prov}); byProv[prov].forEach(m=>og.append(el("option",{value:m.id},`${m.name} ($${m.in}/$${m.out})`))); model.append(og);});
    const daily=num(5000,{min:"1"}); const inTok=num(800,{min:"0"}); const outTok=num(400,{min:"0"}); const selfCost=num(1500,{min:"0"});
    const meta=metaBox([["$0","每日"],["$0","每月"],["$0","每年"],["$0","千次请求"]]);
    const proj=el("div",{class:"cost-table"}); const be=el("div",{class:"msg"}); const info=el("div",{class:"model-info"});
    const money=(n)=>n>=1?"$"+n.toFixed(2):"$"+n.toFixed(4);
    const run=()=>{
      const m=AI_MODELS.find(x=>x.id===model.value)||AI_MODELS[0];
      const perReq=(+inTok.value/1000000*m.in)+(+outTok.value/1000000*m.out);
      const d=+daily.value, day=perReq*d, month=day*30, year=day*365;
      const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v;
      set("每日",money(day)); set("每月",money(month)); set("每年",money(year)); set("千次请求",money(perReq*1000));
      info.innerHTML=`<b>${m.name}</b> · ${m.provider} · 每次请求约 ${money(perReq)}（输入 ${inTok.value} + 输出 ${outTok.value} token）`;
      proj.innerHTML=`<div class="ct-row ct-head"><span>规模</span><span>每日请求</span><span>每月成本</span><span>每年成本</span></div>`+[["当前",1],["×10 增长",10],["×100 规模",100]].map(([lbl,mul])=>`<div class="ct-row"><span class="ct-name">${lbl}</span><span>${(d*mul).toLocaleString()}</span><span>${money(month*mul)}</span><span class="ct-total">${money(year*mul)}</span></div>`).join("");
      const sc=+selfCost.value; const beReq= perReq>0? sc/(perReq*30) : 0;
      be.textContent= sc>0&&perReq>0 ? `算上自建月成本 $${sc}：当每日请求超过约 ${Math.round(beReq).toLocaleString()} 次时，自建的每次单价才可能低于该 API（仅比 token 单价，未计 GPU 闲置、运维与人力）。` : "填写自建月成本以估算盈亏平衡点。";
    };
    [daily,inTok,outTok,selfCost].forEach(i=>i.addEventListener("input",run)); model.addEventListener("change",run);
    const row=el("div",{class:"row"}); row.append(field("每日请求数",daily),field("每次输入 token",inTok),field("每次输出 token",outTok));
    const row2=el("div",{class:"row"}); row2.append(field("自建月成本（美元，可选）",selfCost));
    const note=el("div",{class:"msg"},"用于趋势估算；单价为 2026 年 7 月参考值，实际以各厂商官方定价页为准。");
    root.append(field("模型",model),info,row,meta,el("div",{class:"section-title small"},"<h3>规模推演</h3>"),proj,row2,be,note); run();
  },
  "model-arena"(root){
    const ctxNum=(s)=>{s=String(s).toUpperCase();let best=0,cur="";for(const ch of s){if((ch>="0"&&ch<="9")||ch==="."){cur+=ch;}else{if(cur){let n=parseFloat(cur);if(ch==="M")n*=1000000;else if(ch==="K")n*=1000;best=Math.max(best,n);}cur="";}}if(cur)best=Math.max(best,parseFloat(cur));return best||1000;};
    const COLORS=["#5E9FE8","#E0574C","#72BC8F"]; const AX=["输入性价比","输出性价比","上下文长度","开源权重","多模态"];
    const maxIn=Math.max(...AI_MODELS.map(m=>m.in)),minIn=Math.min(...AI_MODELS.map(m=>m.in));
    const maxOut=Math.max(...AI_MODELS.map(m=>m.out)),minOut=Math.min(...AI_MODELS.map(m=>m.out));
    const maxCtx=Math.max(...AI_MODELS.map(m=>ctxNum(m.ctx)));
    const axisVals=(m)=>{const tr=MODEL_TRAITS[m.id]||{}; return [ (maxIn-m.in)/(maxIn-minIn)*100, (maxOut-m.out)/(maxOut-minOut)*100, Math.log(ctxNum(m.ctx))/Math.log(maxCtx)*100, tr.open?100:15, tr.modal?100:15 ];};
    const mk=(def)=>{const s=el("select",{}); s.append(el("option",{value:""},"— 无 —")); AI_MODELS.forEach(m=>s.append(el("option",{value:m.id},`${m.name} · ${m.provider}`))); if(def)s.value=def; return s;};
    const a=mk("claude-opus-4.8"), b=mk("deepseek-v4-flash"), c=mk("gemini-3.5-flash");
    const chart=el("div",{class:"arena-wrap"}); const table=el("div",{class:"cost-table"});
    const cx=150,cy=145,R=100; const pt=(i,rad)=>{const ang=(-90+i*72)*Math.PI/180; return [cx+Math.cos(ang)*rad, cy+Math.sin(ang)*rad];};
    const run=()=>{
      const chosen=[a,b,c].map(s=>AI_MODELS.find(m=>m.id===s.value)).filter(Boolean);
      let grid=""; [0.25,0.5,0.75,1].forEach(f=>{const pts=AX.map((_,i)=>pt(i,R*f).map(n=>n.toFixed(1)).join(",")).join(" "); grid+=`<polygon points="${pts}" class="ar-grid"/>`;});
      let axes=""; AX.forEach((name,i)=>{const p=pt(i,R); axes+=`<line x1="${cx}" y1="${cy}" x2="${p[0].toFixed(1)}" y2="${p[1].toFixed(1)}" class="ar-axis"/>`; const lp=pt(i,R+20); axes+=`<text x="${lp[0].toFixed(1)}" y="${lp[1].toFixed(1)}" class="ar-label" text-anchor="middle">${name}</text>`;});
      let polys=""; chosen.forEach((m,idx)=>{const vals=axisVals(m); const pts=vals.map((v,i)=>pt(i,R*Math.max(4,v)/100).map(n=>n.toFixed(1)).join(",")).join(" "); polys+=`<polygon points="${pts}" class="ar-poly" style="stroke:${COLORS[idx]};fill:${COLORS[idx]}26"/>`;});
      const legend=chosen.map((m,idx)=>`<span class="ar-leg"><i style="background:${COLORS[idx]}"></i>${m.name}</span>`).join("");
      chart.innerHTML=`<svg viewBox="0 0 300 300" class="arena-radar">${grid}${axes}${polys}</svg><div class="arena-legend">${legend||'请至少选择一个模型'}</div>`;
      table.innerHTML=`<div class="ct-row ct-head"><span>模型</span><span>厂商</span><span>输入价</span><span>输出价</span><span>上下文</span><span>开源/多模态</span></div>`+chosen.map(m=>{const tr=MODEL_TRAITS[m.id]||{}; return `<div class="ct-row"><span class="ct-name">${m.name}</span><span>${m.provider}</span><span>$${m.in}</span><span>$${m.out}</span><span>${m.ctx}</span><span>${tr.open?'开源':'闭源'} / ${tr.modal?'多模态':'文本'}</span></div>`;}).join("");
    };
    [a,b,c].forEach(s=>s.addEventListener("change",run));
    const row=el("div",{class:"row"}); row.append(field("模型 A",a),field("模型 B",b),field("模型 C",c));
    const note=el("div",{class:"msg"},"雷达各轴由真实数据归一化得出：性价比=单价越低越高，上下文为对数缩放；开源权重 / 多模态为公开资料整理，可能随版本变化。");
    root.append(row,chart,el("div",{class:"section-title small"},"<h3>关键参数对比</h3>"),table,note); run();
  },
"prompt-builder"(root){
    const kit=el("select",{}); const byCat={}; PROMPT_KITS.forEach(k=>{(byCat[k.cat]=byCat[k.cat]||[]).push(k);}); Object.keys(byCat).forEach(cat=>{const og=el("optgroup",{label:cat}); byCat[cat].forEach(k=>og.append(el("option",{value:k.id},k.name))); kit.append(og);});
    const desc=el("div",{class:"model-info"}); const fields=el("div",{class:"pb-fields"}); const out=ta("",{readonly:""}); out.className="pb-out";
    const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"生成的提示词"), copyBtn(()=>out.value));
    let inputs={};
    const assemble=()=>{const k=PROMPT_KITS.find(x=>x.id===kit.value); let s=k.template; [...(k.vars||[]),...(k.extra||[])].forEach(v=>{const val=(inputs[v.k]&&inputs[v.k].value.trim())||("["+v.label+"]"); s=s.split("[["+v.k+"]]").join(val);}); out.value=s;};
    const rebuild=()=>{const k=PROMPT_KITS.find(x=>x.id===kit.value); desc.textContent=k.desc; fields.innerHTML=""; inputs={}; (k.vars||[]).forEach(v=>{const i=text("",{placeholder:v.ph}); inputs[v.k]=i; i.addEventListener("input",assemble); fields.append(field(v.label,i));}); (k.extra||[]).forEach(v=>{const t=ta("",{placeholder:v.ph}); inputs[v.k]=t; t.addEventListener("input",assemble); fields.append(field(v.label,t));}); assemble();};
    kit.addEventListener("change",rebuild);
    const note=el("div",{class:"msg"},"填写字段即可实时拼出可复制的提示词；留空的字段会以 [名称] 占位，粘贴后按需替换。");
    root.append(field("选择提示词类型",kit),desc,fields,bar,out,note); rebuild();
  },
  "password-strength"(root){
    const input=text("",{placeholder:"输入要测试的密码",autocomplete:"off"});
    const bar=el("div",{class:"meter"}); const fill=el("div",{class:"meter-fill"}); bar.appendChild(fill);
    const label=el("div",{class:"meter-label"},"\u2014");
    const meta=metaBox([["0","熵（比特）"],["\u2014","破解时间*"]]);
    const notes=el("div",{class:"panel",style:"margin-top:0"});
    const foot=el("div",{class:"msg"},"*基于每秒 100 亿次猜测（离线快速哈希攻击）估算。仅为启发式参考 \u2014 非泄露库校验。你输入的内容不会离开浏览器。");
    const run=()=>{ const r=C.passwordStrength(input.value); const pct=[8,28,52,76,100][r.score]; fill.style.width=pct+"%"; fill.className="meter-fill s"+r.score; label.textContent=r.label; label.className="meter-label s"+r.score; const set=(k,v)=>meta.querySelector(`[data-k="${k}"]`).textContent=v; set("熵（比特）",r.entropyBits); set("破解时间*",r.crackTime); notes.innerHTML=""; const msgs=[...r.warnings.map(w=>["warn",w]),...r.suggestions.map(s=>["tip",s])]; if(!msgs.length){ notes.appendChild(el("div",{class:"diff-line add"},"看起来很强 \u2014 没有明显弱点。")); } else { msgs.forEach(([t,m])=>notes.appendChild(el("div",{class:"diff-line "+(t==="warn"?"del":"")}, (t==="warn"?"\u26a0\ufe0f ":"\uD83D\uDCA1 ")+escapeHtml(m)))); } };
    input.addEventListener("input",run);
    root.append(field("密码",input), bar, label, meta, notes, foot); run();
  },
  "prompt-library"(root){
    const search=text("",{placeholder:"搜索提示词…"});
    const cat=el("select",{}); ["全部",...new Set(PROMPTS.map(p=>p.cat))].forEach(c=>cat.appendChild(el("option",{value:c},c)));
    const count=el("span",{class:"dir-count"});
    const list=el("div",{class:"dir-rows"});
    const render=()=>{ let items=C.searchItems(PROMPTS,search.value,["title","text","cat"]); if(cat.value!=="全部") items=items.filter(p=>p.cat===cat.value); count.textContent=items.length+" 个提示词"; list.innerHTML=""; if(!items.length){ list.appendChild(el("div",{class:"msg"},"没有匹配的提示词。")); return; } items.forEach(p=>{ const card=el("details",{class:"dir-drow"}); const sum=el("summary",{class:"dir-row"}); const pico=el("span",{class:"dr-ico"}); pico.textContent=(p.title||"?").charAt(0).toUpperCase(); pico.style.background="linear-gradient(135deg,#DE9255,#EAC26B)"; const main=el("div",{class:"dr-main"}); main.append(el("span",{class:"dr-name"},p.title), el("span",{class:"dr-desc"},p.text)); const tags=el("div",{class:"dr-tags"}); tags.append(el("span",{class:"badge sm"},p.cat)); const act=el("div",{class:"dr-act"}); const cb=copyBtn(()=>p.text); cb.addEventListener("click",e=>e.stopPropagation()); act.append(cb, starBtn("prompt:"+p.title, render)); sum.append(pico, main, tags, act); const body=el("pre",{class:"dir-body"}); body.textContent=p.text; card.append(sum, body); list.appendChild(card); }); };
    search.addEventListener("input",render); cat.addEventListener("change",render);
    const credit=el("div",{class:"msg"},"改编自开源项目 awesome-chatgpt-prompts / prompts.chat 合集（CC0）。");
    const row=el("div",{class:"row"}); row.append(field("搜索",search), field("分类",cat));
    const bar=el("div",{class:"toolbar"}); bar.append(count);
    root.append(row, credit, bar, list); render();
  },
  "free-api-directory"(root){
    const search=text("",{placeholder:"搜索 API（天气、加密、笑话…）"});
    const cat=el("select",{}); ["全部",...Array.from(new Set(APIS.map(a=>a.cat))).sort()].forEach(c=>cat.appendChild(el("option",{value:c},c)));
    const noAuth=el("input",{type:"checkbox"}); const favOnly=el("input",{type:"checkbox"});
    const count=el("span",{class:"dir-count"});
    const list=el("div",{class:"dir-rows"});
    const render=()=>{ let items=C.searchItems(APIS,search.value,["name","desc","cat"]); if(cat.value!=="全部") items=items.filter(a=>a.cat===cat.value); if(noAuth.checked) items=items.filter(a=>a.auth==="No"); if(favOnly.checked) items=items.filter(a=>isFav("api:"+a.url)); count.textContent=items.length+" 个 API"; list.innerHTML=""; if(!items.length){ list.appendChild(el("div",{class:"msg"},"没有符合筛选条件的 API。")); return; } items.forEach(a=>{ const row=el("div",{class:"dir-row"}); const ico=el("span",{class:"dr-ico"}); ico.textContent=(a.name||"?").charAt(0).toUpperCase(); ico.style.background="linear-gradient(135deg,#72BC8F,#4dd0a8)"; const main=el("div",{class:"dr-main"}); main.append(el("span",{class:"dr-name"},a.name), el("span",{class:"dr-desc"},a.desc)); const tags=el("div",{class:"dr-tags"}); const authCls=a.auth==="No"?"ok":"warn"; tags.append(el("span",{class:"badge sm "+authCls},a.auth==="No"?"免鉴权":a.auth), el("span",{class:"badge sm "+(a.https?"ok":"warn")},a.https?"HTTPS":"HTTP"), el("span",{class:"badge sm "+(a.cors?"ok":"")},a.cors?"CORS":"无 CORS"), el("span",{class:"badge sm"},a.cat)); const act=el("div",{class:"dr-act"}); const link=el("a",{class:"btn sm",href:a.url,target:"_blank",rel:"noopener"},"文档 \u2197"); act.append(link, copyBtn(()=>a.url), starBtn("api:"+a.url, render)); row.append(ico, main, tags, act); list.appendChild(row); }); };
    search.addEventListener("input",render); cat.addEventListener("change",render); noAuth.addEventListener("change",render); favOnly.addEventListener("change",render);
    const credit=el("div",{class:"msg"},"精选自 public-apis/public-apis 合集（MIT）。免费额度与鉴权要求会变化 \u2014 请在各提供商网站确认。");
    const row=el("div",{class:"row"}); row.append(field("搜索",search), field("分类",cat));
    const opts=el("div",{class:"checks"}); opts.append(labelCheck(noAuth,"仅免鉴权"), labelCheck(favOnly,"\u2605 收藏"));
    const bar=el("div",{class:"toolbar"}); bar.append(count);
    root.append(row, opts, credit, bar, list); render();
  },
  "ai-ecosystem-directory"(root){
    const title=el("div",{class:"ecosystem-intro"},`<span class="eyebrow">精选 · 持续更新</span><h2>搭建更专业的 AI 技术栈</h2><p>从模型、向量库、编排到可观测性的生产级开源组件，配合 ${LOCAL_SKILLS.length} 个已保存到本地、可直接复制使用的 Agent Skill 指令。</p>`);
    const tabs=el("div",{class:"ecosystem-tabs",role:"tablist"});
    const panels=el("div",{class:"ecosystem-panels"});
    const makeTab=(label,id)=>{const b=el("button",{class:"ecosystem-tab",type:"button",role:"tab","aria-controls":id},label); tabs.append(b); return b;};
    const stackTab=makeTab("网站 AI 技术栈", "stack-panel"); const skillTab=makeTab("本地 Agent Skills", "skills-panel"); const sourceTab=makeTab("可信来源", "sources-panel");
    const stackPanel=el("section",{id:"stack-panel",class:"ecosystem-panel",role:"tabpanel"});
    const stackSearch=text("",{placeholder:"搜索 Dify、RAG、向量库、模型网关…"}); const layer=el("select",{}); ["全部层级",...new Set(AI_STACK.map(x=>x.layer))].forEach(x=>layer.append(el("option",{value:x},x)));
    const p0=el("input",{type:"checkbox"}); const stackCount=el("span",{class:"dir-count"}); const stackList=el("div",{class:"dir-list"});
    const renderStack=()=>{const q=stackSearch.value.trim().toLowerCase(); let rows=AI_STACK.filter(x=>!q || [x.name,x.layer,x.desc,x.kind,x.license,...x.tags].join(" ").toLowerCase().includes(q)); if(layer.value!=="全部层级")rows=rows.filter(x=>x.layer===layer.value); if(p0.checked)rows=rows.filter(x=>x.priority==="P0"); stackCount.textContent=`${rows.length} 个已精选组件`; stackList.innerHTML=""; rows.forEach(x=>{const card=el("article",{class:"dir-card ecosystem-card"}); const head=el("div",{class:"dir-head"}); const ico=el("span",{class:"dir-ico"},"✦"); const priority=el("span",{class:"priority priority-"+x.priority.toLowerCase()},x.priority); head.append(ico,el("b",{},x.name),priority); const meta=el("div",{class:"badges"}); meta.append(el("span",{class:"badge"},x.layer),el("span",{class:"badge ok"},x.kind)); const body=el("p",{class:"dir-body plain"},x.desc); const license=el("small",{class:"license"},"许可："+x.license); const bar=el("div",{class:"toolbar"}); bar.append(el("a",{class:"btn",href:x.url,target:"_blank",rel:"noopener"},"查看项目 ↗")); card.append(head,meta,body,license,bar); stackList.append(card);}); if(!rows.length)stackList.append(el("div",{class:"msg"},"没有匹配组件。请尝试更宽的关键词。"));};
    const stackRow=el("div",{class:"row"}); stackRow.append(field("搜索",stackSearch),field("架构层",layer)); const stackOptions=el("div",{class:"checks"}); stackOptions.append(labelCheck(p0,"仅显示 P0 优先级")); const notice=el("div",{class:"ecosystem-notice"},"上线前请逐项核验许可证、维护状态、CVE、数据驻留和模型提供商条款。GitHub 可见不代表可自由商用。"); stackPanel.append(stackRow,stackOptions,notice,stackCount,stackList);
    const skillPanel=el("section",{id:"skills-panel",class:"ecosystem-panel",role:"tabpanel"});
    const skillSearch=text("",{placeholder:"搜索代码审查、SEO、研究、客服、翻译…"}); const skillCat=el("select",{}); ["全部分类",...new Set(LOCAL_SKILLS.map(x=>x.cat))].forEach(x=>skillCat.append(el("option",{value:x},x))); const skillCount=el("span",{class:"dir-count"}); const skillList=el("div",{class:"dir-rows"});
    const downloadSkill=(sk)=>{const blob=new Blob([sk.body],{type:"text/markdown"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=sk.id+".md"; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
    const renderSkills=()=>{const q=skillSearch.value.trim().toLowerCase(); let rows=LOCAL_SKILLS.filter(x=>!q || (x.name+" "+x.cat+" "+x.desc+" "+x.tags.join(" ")).toLowerCase().includes(q)); if(skillCat.value!=="全部分类")rows=rows.filter(x=>x.cat===skillCat.value); skillCount.textContent=`${rows.length} / ${LOCAL_SKILLS.length} 个可复制 Skill`; skillList.innerHTML=""; if(!rows.length){skillList.append(el("div",{class:"msg"},"没有匹配的 Skill。"));return;} rows.forEach(sk=>{const card=el("details",{class:"dir-drow"}); const sum=el("summary",{class:"dir-row"}); const ico=el("span",{class:"dr-ico"}); ico.textContent=sk.name.charAt(0); ico.style.background="linear-gradient(135deg,#5E9FE8,#7FB2F0)"; const main=el("div",{class:"dr-main"}); main.append(el("span",{class:"dr-name"},sk.name), el("span",{class:"dr-desc"},sk.desc)); const tags=el("div",{class:"dr-tags"}); tags.append(el("span",{class:"badge sm"},sk.cat)); const act=el("div",{class:"dr-act"}); const cb=copyBtn(()=>sk.body); cb.addEventListener("click",e=>e.stopPropagation()); const db=el("button",{class:"btn sm",type:"button"},"下载 .md"); db.addEventListener("click",e=>{e.stopPropagation(); downloadSkill(sk);}); act.append(cb, db); sum.append(ico,main,tags,act); const body=el("pre",{class:"dir-body"}); body.textContent=sk.body; card.append(sum,body); skillList.append(card);});};
    const skillRow=el("div",{class:"row"}); skillRow.append(field("搜索能力",skillSearch),field("分类",skillCat)); const skillNote=el("div",{class:"ecosystem-notice"},"以下 Skill 的完整指令已保存在本站，可直接展开查看、一键复制或下载为 .md，粘贴到 Claude、ChatGPT、Cursor 等即用。"); const rrTitle=el("div",{class:"section-title small"},"<h3>rrskill 公开必装推荐</h3>"); const rrGrid=el("div",{class:"skill-grid external-skill-grid"}); RR_RECOMMENDED_SKILLS.forEach(sk=>{const card=el("a",{class:"skill-card external",href:sk.url,target:"_blank",rel:"noopener"}); card.append(el("span",{},sk.cat),el("b",{},sk.name),el("small",{},sk.desc),el("small",{class:"skill-source"},sk.source+" · 查看来源 ↗")); rrGrid.append(card);}); skillPanel.append(skillRow,skillNote,skillCount,skillList,rrTitle,rrGrid);
    const sourcePanel=el("section",{id:"sources-panel",class:"ecosystem-panel",role:"tabpanel"}); const sourceList=el("div",{class:"source-grid"}); SKILL_SOURCES.forEach(x=>sourceList.append(el("article",{class:"source-card"},`<span class="badge ${x.trust==="Official"?"ok":""}">${x.trust}</span><h3>${x.name}</h3><b>${x.count}</b><p>${x.desc}</p><a class="text-link" target="_blank" rel="noopener" href="${x.url}">查看来源 ↗</a>`))); CATALOG_SOURCE_MAP.forEach(x=>sourceList.append(el("article",{class:"source-card"},`<span class="badge">外部目录</span><h3>${x.name}</h3><b>${x.kind}</b><p>${x.coverage}<br>${x.categories.join(" · ")}</p><a class="text-link" target="_blank" rel="noopener" href="${x.url}">查看来源 ↗</a>`))); sourcePanel.append(el("div",{class:"ecosystem-notice"},"上方 Skills 已内置到本站；下列为更大的上游来源库，供你拓展。各库统计口径不同、条目会重叠，因此不相加展示“总数”。",),sourceList);
    panels.append(stackPanel,skillPanel,sourcePanel); const entries=[[stackTab,stackPanel],[skillTab,skillPanel],[sourceTab,sourcePanel]]; const select=(active)=>entries.forEach(([tab,panel])=>{const on=tab===active;tab.classList.toggle("active",on);tab.setAttribute("aria-selected",String(on));panel.hidden=!on;}); entries.forEach(([tab])=>tab.addEventListener("click",()=>select(tab))); stackSearch.addEventListener("input",renderStack); layer.addEventListener("change",renderStack); p0.addEventListener("change",renderStack); skillSearch.addEventListener("input",renderSkills); skillCat.addEventListener("change",renderSkills); root.append(title,tabs,panels); select(stackTab); renderStack(); renderSkills();
  },
  "skills-registry"(root){const q=text("",{placeholder:"搜索 Skill、分类、来源或标签…"});const source=el("select",{});["全部来源",...new Set(SKILL_REGISTRY.map(x=>x.source))].forEach(x=>source.append(el("option",{value:x},x)));const state=el("select",{});["全部状态","本地内容","外部元数据"].forEach(x=>state.append(el("option",{value:x},x)));const count=el("span",{class:"dir-count"});const list=el("div",{class:"dir-rows"});const render=()=>{const n=q.value.toLowerCase();let rows=SKILL_REGISTRY.filter(x=>!n||(x.name+x.category+x.summary+x.source+x.tags.join(" ")).toLowerCase().includes(n));if(source.value!=="全部来源")rows=rows.filter(x=>x.source===source.value);if(state.value!=="全部状态")rows=rows.filter(x=>state.value==="本地内容"?x.content==="local":x.content!=="local");count.textContent=`${rows.length} / ${SKILL_REGISTRY.length} 个已索引 Skill`;list.innerHTML="";rows.forEach(x=>{const r=el("a",{class:"dir-row registry-row",href:x.url,target:x.content==="local"?"_self":"_blank",rel:"noopener"});r.innerHTML=`<span class="dr-ico">${x.content==="local"?"L":"↗"}</span><span class="dr-main"><span class="dr-name">${escapeHtml(x.name)}</span><span class="dr-desc">${escapeHtml(x.summary)}</span></span><span class="dr-tags"><span class="badge sm">${escapeHtml(x.category)}</span><span class="badge sm ${x.content==="local"?"ok":"warn"}">${x.content==="local"?"本地内容":"外部元数据"}</span><span class="badge sm ${x.risk==="reviewed"?"ok":"warn"}">${x.risk==="reviewed"?"已审核":"待审核"}</span></span>`;list.append(r)});};const intro=el("div",{class:"registry-intro"},"<h2>Skills Registry</h2><p>全量索引、内容本地化与安全隔离分层管理。不会自动执行第三方脚本。</p>");const filters=el("div",{class:"row"});filters.append(field("搜索",q),field("来源",source),field("内容状态",state));const policy=el("div",{class:"ecosystem-notice"},`<b>索引层</b>：${REGISTRY_POLICY.metadata}<br><b>本地内容层</b>：${REGISTRY_POLICY.local}<br><b>隔离层</b>：${REGISTRY_POLICY.quarantine}`);const grid=el("div",{class:"source-grid registry-sources"});SKILL_REGISTRY_SOURCES.forEach(x=>grid.append(el("a",{class:"source-card",href:x.url,target:"_blank",rel:"noopener"},`<span class="badge">${x.trust}</span><h3>${x.name}</h3><b>${x.known?x.known.toLocaleString()+"+":"官方"}</b><p>${x.note}</p><small>${x.refresh} · ${x.mode}</small>`)));root.append(intro,filters,policy,count,list,el("div",{class:"section-title small"},"<h3>同步来源注册表</h3>"),grid);[q,source,state].forEach(x=>x.addEventListener(x.tagName==="INPUT"?"input":"change",render));render();},
  "ai-tools-directory"(root){
    const search=text("",{placeholder:"搜索 AI 工具（对话、图像、编程、智能体…）"});
    const cat=el("select",{}); ["全部",...new Set(AI_CATALOG.map(a=>a.cat))].forEach(c=>cat.appendChild(el("option",{value:c},c)));
    const openOnly=el("input",{type:"checkbox"}); const favOnly=el("input",{type:"checkbox"});
    const count=el("span",{class:"dir-count"});
    const list=el("div",{class:"dir-rows"});
    const render=()=>{ let items=C.searchItems(AI_CATALOG,search.value,["name","desc","cat"]); if(cat.value!=="全部") items=items.filter(a=>a.cat===cat.value); if(openOnly.checked) items=items.filter(a=>a.open); if(favOnly.checked) items=items.filter(a=>isFav("ai:"+a.url)); count.textContent=items.length+" 个工具"; list.innerHTML=""; if(!items.length){ list.appendChild(el("div",{class:"msg"},"没有符合筛选条件的 AI 工具。")); return; } items.forEach(a=>{ const row=el("div",{class:"dir-row"}); const ico=el("span",{class:"dr-ico"}); ico.textContent=(a.name||"?").charAt(0).toUpperCase(); const main=el("div",{class:"dr-main"}); main.append(el("span",{class:"dr-name"},a.name), el("span",{class:"dr-desc"},a.desc)); const tags=el("div",{class:"dr-tags"}); tags.append(el("span",{class:"badge sm "+(a.open?"ok":"")},a.open?"开源":"托管")); if(a.tag){ tags.append(el("span",{class:"badge sm warn"},a.tag)); } tags.append(el("span",{class:"badge sm"},a.cat)); if(a.source){ tags.append(el("span",{class:"badge sm source"},a.source)); } const act=el("div",{class:"dr-act"}); const link=el("a",{class:"btn sm",href:a.url,target:"_blank",rel:"noopener"},"访问 \u2197"); act.append(link, copyBtn(()=>a.url), starBtn("ai:"+a.url, render)); row.append(ico, main, tags, act); list.appendChild(row); }); };
    search.addEventListener("input",render); cat.addEventListener("change",render); openOnly.addEventListener("change",render); favOnly.addEventListener("change",render);
    const credit=el("div",{class:"msg"},"精选自 GitHub 高星项目与热门 AI 目录。可用性与定价会变化 \u2014 请在各网站确认。");
    const row=el("div",{class:"row"}); row.append(field("搜索",search), field("分类",cat));
    const opts=el("div",{class:"checks"}); opts.append(labelCheck(openOnly,"仅开源"), labelCheck(favOnly,"\u2605 收藏"));
    const bar=el("div",{class:"toolbar"}); bar.append(count);
    root.append(row, opts, credit, bar, list); render();
  },
};

// ----- shared helpers -----
function labelCheck(input, label){ const l=el("label",{}); l.append(input, document.createTextNode(" "+label)); return l; }
const FAV_KEY="th-favs";
function getFavs(){ try{ return JSON.parse(localStorage.getItem(FAV_KEY)||"{}"); }catch(e){ return {}; } }
function isFav(id){ return !!getFavs()[id]; }
function toggleFav(id){ const f=getFavs(); if(f[id]) delete f[id]; else f[id]=1; try{ localStorage.setItem(FAV_KEY, JSON.stringify(f)); }catch(e){} }
function starBtn(id, onToggle){ const b=el("button",{class:"star",type:"button","aria-label":"切换收藏",title:"收藏"}); const paint=()=>{ const on=isFav(id); b.textContent=on?"\u2605":"\u2606"; b.classList.toggle("on",on); }; b.addEventListener("click",(e)=>{ e.preventDefault(); e.stopPropagation(); toggleFav(id); paint(); if(onToggle) onToggle(); }); paint(); return b; }
function round(n){ return Math.round((n+Number.EPSILON)*100)/100; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function transformPair(root, encFn, decFn, encLabel, decLabel){
  const input=ta(); const output=ta("",{readonly:""}); const msg=el("div",{class:"msg"});
  const enc=()=>{ try{output.value=encFn(input.value); msg.className="msg";}catch(e){msg.className="msg err";msg.textContent=e.message;} };
  const dec=()=>{ try{output.value=decFn(input.value); msg.className="msg";}catch(e){msg.className="msg err";msg.textContent="输入无效";} };
  const bE=el("button",{class:"btn primary",type:"button"},encLabel); bE.addEventListener("click",enc);
  const bD=el("button",{class:"btn",type:"button"},decLabel); bD.addEventListener("click",dec);
  const btns=el("div",{class:"btns"}); btns.append(bE,bD);
  const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"结果"), copyBtn(()=>output.value));
  root.append(field("输入",input), btns, msg, bar, output);
}
// ---- v2 expansion shared factories ----
function calcTool(root, fields, compute, outputs){
  const inputs={}; const row=el("div",{class:"row"});
  fields.forEach(f=>{ const i=num(f.val, f.attrs||{}); inputs[f.key]=i; row.append(field(f.label,i)); });
  const meta=metaBox(outputs.map(o=>["-",o]));
  const run=()=>{ const vals={}; for(const k in inputs) vals[k]=inputs[k].value; const res=compute(vals); for(const k in res){ const t=meta.querySelector(`[data-k="${k}"]`); if(t) t.textContent=res[k]; } };
  Object.values(inputs).forEach(i=>i.addEventListener("input",run));
  root.append(row, meta); run();
}
function okConvert(root, fn, inLabel, outLabel){
  const input=ta(); const output=ta("",{readonly:""}); const msg=el("div",{class:"msg"});
  const run=()=>{ const r=fn(input.value); if(r.ok){output.value=r.output; msg.className="msg"; msg.textContent="";} else {output.value=""; msg.className="msg err"; msg.textContent=r.error;} };
  const btn=el("button",{class:"btn primary",type:"button"},"转换"); btn.addEventListener("click",run);
  const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},outLabel), copyBtn(()=>output.value));
  root.append(field(inLabel,input), el("div",{class:"btns"}), btn, msg, bar, output);
}
function unitTool(root, units, convertFn, defFrom, defTo, defVal){
  const val=num(defVal); const from=el("select",{}); const to=el("select",{});
  units.forEach(([v,l])=>{ from.appendChild(el("option",{value:v},l)); to.appendChild(el("option",{value:v},l)); });
  from.value=defFrom; to.value=defTo;
  const out=text("",{readonly:""});
  const run=()=>{ const r=convertFn(+val.value, from.value, to.value); out.value=r==null?"无效":String(Math.round(r*1e6)/1e6); };
  [val,from,to].forEach(i=>i.addEventListener("input",run));
  const row=el("div",{class:"row"}); row.append(field("从",from), field("到",to));
  const bar=el("div",{class:"toolbar"}); bar.append(el("span",{},"结果"), copyBtn(()=>out.value));
  root.append(field("值",val), row, bar, out); run();
}

function imageTool(root, mode){
  const drop=el("div",{class:"drop"},"\uD83D\uDCC1 点击或拖放图片到此处 \u2014 本地处理，绝不上传");
  const file=el("input",{type:"file",accept:"image/*",class:"hidden"});
  const controls=el("div",{class:"row"}); const previews=el("div",{class:"preview-row"}); const bar=el("div",{class:"toolbar"}); const msg=el("div",{class:"msg"});
  let img=null, origBlobSize=0;
  const quality=num(0.8,{min:"0.1",max:"1",step:"0.05"}); const w=num(0,{min:"0"}); const h=num(0,{min:"0"});
  const fmt=el("select",{}); [["image/jpeg","JPEG"],["image/png","PNG"],["image/webp","WebP"]].forEach(([v,l])=>fmt.appendChild(el("option",{value:v},l)));
  if(mode==="compress") controls.append(field("质量（0-1）",quality), field("输出格式",fmt));
  if(mode==="resize") controls.append(field("宽度 px（0=自动）",w), field("高度 px（0=自动）",h), field("输出格式",fmt));
  if(mode==="convert") controls.append(field("转换为",fmt));
  const dl=el("a",{class:"btn primary",download:"output"},"下载"); dl.style.display="none";
  const process=()=>{
    if(!img){ msg.className="msg err"; msg.textContent="请先加载图片"; return; }
    let tw=img.naturalWidth, th=img.naturalHeight;
    if(mode==="resize"){ const rw=+w.value||0, rh=+h.value||0; if(rw&&rh){tw=rw;th=rh;} else if(rw){tw=rw;th=Math.round(img.naturalHeight*(rw/img.naturalWidth));} else if(rh){th=rh;tw=Math.round(img.naturalWidth*(rh/img.naturalHeight));} }
    const canvas=el("canvas"); canvas.width=tw; canvas.height=th; const ctx=canvas.getContext("2d"); ctx.drawImage(img,0,0,tw,th);
    const type=fmt.value; const q=mode==="compress"?(+quality.value||0.8):0.92;
    canvas.toBlob((blob)=>{ if(!blob){msg.className="msg err";msg.textContent="导出失败";return;} const url=URL.createObjectURL(blob); const outImg=el("img",{src:url}); const info=el("div",{},`<b>${tw}\u00D7${th}</b><br>${(blob.size/1024).toFixed(1)} KB` + (origBlobSize?`<br><span style="color:var(--ok)">${Math.max(0,Math.round((1-blob.size/origBlobSize)*100))}% 更小</span>`:"")); previews.innerHTML=""; previews.append(outImg,info); const ext=type.split("/")[1].replace("jpeg","jpg"); dl.href=url; dl.download="output."+ext; dl.style.display="inline-block"; msg.className="msg ok"; msg.textContent="完成 \u2713"; }, type, q);
  };
  const load=(f)=>{ if(!f) return; origBlobSize=f.size; const url=URL.createObjectURL(f); img=new Image(); img.onload=()=>{ msg.className="msg ok"; msg.textContent=`已加载 ${img.naturalWidth}\u00D7${img.naturalHeight}, ${(f.size/1024).toFixed(1)} KB`; }; img.src=url; };
  drop.addEventListener("click",()=>file.click());
  file.addEventListener("change",()=>load(file.files[0]));
  drop.addEventListener("dragover",(e)=>{e.preventDefault();drop.classList.add("over");});
  drop.addEventListener("dragleave",()=>drop.classList.remove("over"));
  drop.addEventListener("drop",(e)=>{e.preventDefault();drop.classList.remove("over");load(e.dataTransfer.files[0]);});
  const btn=el("button",{class:"btn primary",type:"button"},mode==="convert"?"转换":mode==="resize"?"调整尺寸":"压缩"); btn.addEventListener("click",process);
  bar.append(el("span",{},"预览"));
  root.append(drop, file, controls, el("div",{class:"btns"}), btn, dl, msg, bar, previews);
}

document.addEventListener("DOMContentLoaded", () => {
  const id = document.body.getAttribute("data-tool");
  const mount = $("#tool-mount");
  if (id && mount && REGISTRY[id]) {
    try { REGISTRY[id](mount); }
    catch (e) { mount.innerHTML = `<div class="msg err" style="display:block">工具加载失败：${e.message}</div>`; }
  }
});
export { REGISTRY };
