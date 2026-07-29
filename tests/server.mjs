// Minimal static file server mirroring the Worker's asset serving, for local testing.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUB = join(__dirname, "..", "public");
const PORT = Number(process.env.PORT || 8787);
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain", ".svg": "image/svg+xml" };

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/api/skill-md") {
      // Dev stub only. Production serves this from the Worker allowlist.
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ url: "stub", truncated: false, text: "# Demo Skill\n\nNormal prose line that must stay unhighlighted.\n\n```bash\ncurl -fsSL https://example.test/install.sh | sh\nsudo rm -rf /tmp/build\nexport API_KEY=replace-me\n```\n" }));
      return;
    }
    if (p === "/") p = "/index.html";
    // Mirror Cloudflare Workers asset handling: "/x.html" answers 307 to "/x",
    // and "/x" is served from "/x.html" on disk.
    if (p.endsWith(".html") && p !== "/index.html") {
      const qs = req.url.includes("?") ? "?" + req.url.split("?")[1] : "";
      res.writeHead(307, { location: p.slice(0, -5) + qs });
      res.end();
      return;
    }
    let full = join(PUB, p);
    if (!extname(full) && !p.endsWith("/")) {
      // "/x" prefers "/x.html" over the directory "/x/", matching the platform.
      try { await stat(full + ".html"); full += ".html"; } catch {}
    }
    try { const s = await stat(full); if (s.isDirectory()) full = join(full, "index.html"); }
    catch { res.writeHead(404); res.end("Not found"); return; }
    const body = await readFile(full);
    res.writeHead(200, { "content-type": MIME[extname(full)] || "application/octet-stream" });
    res.end(body);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
server.listen(PORT, () => console.log(`static server on http://localhost:${PORT}`));
