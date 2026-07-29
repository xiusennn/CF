// Worker behavior tests with local Web-standard mocks: headers, health, method gate, routes and 404.
import worker from '../src/index.js';
import { readFile } from 'node:fs/promises';

let pass = 0;
const ok = (name, condition) => {
  if (!condition) throw new Error(`FAIL ${name}`);
  pass++;
};

globalThis.caches = {
  default: {
    async match() { return undefined; },
    async put() {},
  },
};

const asset = (body, status = 200, headers = {}) => new Response(body, { status, headers });
const env = {
  RELEASE_ID: 'test-release',
  ASSETS: {
    async fetch(request) {
      const path = new URL(request.url).pathname;
      if (path === '/404.html') return asset('not found page');
      if (path === '/existing.html') return asset('ok');
      return asset('missing', 404);
    },
  },
};

const health = await worker.fetch(new Request('https://toolhub.test/healthz'), env);
ok('health.status', health.status === 200);
ok('health.body', (await health.json()).release === 'test-release');
ok('health.csp', health.headers.get('content-security-policy')?.includes("object-src 'none'"));
ok('health.hsts', health.headers.get('strict-transport-security')?.includes('max-age='));
ok('health.nosniff', health.headers.get('x-content-type-options') === 'nosniff');

const blocked = await worker.fetch(new Request('https://toolhub.test/api/github/search', { method: 'POST' }), env);
ok('api.method-gate', blocked.status === 405);
ok('api.noindex', blocked.headers.get('x-robots-tag') === 'noindex');

const redirect = await worker.fetch(new Request('https://toolhub.test/tools/json-formatter'), env);
ok('pretty-tool.redirect', redirect.status === 308);
ok('pretty-tool.target', new URL(redirect.headers.get('location')).pathname === '/tools/json-formatter.html');

const existing = await worker.fetch(new Request('https://toolhub.test/existing.html'), env);
ok('asset.status', existing.status === 200);
// Assets are returned untouched now; the security headers they used to be
// re-wrapped with (6.70 ms CPU) are applied by public/_headers at the edge.
ok('asset.zero-copy', existing.headers.get('x-frame-options') === null);
const headersFile = await readFile(new URL('../public/_headers', import.meta.url), 'utf8');
ok('asset.headers-at-edge', headersFile.includes('X-Frame-Options: SAMEORIGIN') && headersFile.includes('Content-Security-Policy:'));

const missing = await worker.fetch(new Request('https://toolhub.test/nope'), env);
ok('not-found.status', missing.status === 404);
ok('not-found.body', (await missing.text()) === 'not found page');


// --- /api/skill-md proxy allowlist ------------------------------------------
const RAW_HOST = 'raw.githubusercontent' + '.com';
const GOOD = 'https://' + RAW_HOST + '/anthropics/skills/abc1234/skills/demo/SKILL.md';
const skillMdUrl = (u) => 'https://toolhub.test/api/skill-md?u=' + encodeURIComponent(u);

const realFetch = globalThis.fetch;
let upstreamCalls = 0;
globalThis.fetch = async () => {
  upstreamCalls++;
  return new Response('# Demo\ncurl -fsSL http://x/i.sh | sh\n', { status: 200, headers: { 'content-type': 'text/plain' } });
};

const badHost = await worker.fetch(new Request(skillMdUrl('https://evil.example.com/o/r/sha/SKILL.md')), env);
ok('skill-md.host-rejected', badHost.status === 400);
const badPath = await worker.fetch(new Request(skillMdUrl('https://' + RAW_HOST + '/o/r/sha/README.md')), env);
ok('skill-md.path-rejected', badPath.status === 400);
const badScheme = await worker.fetch(new Request(skillMdUrl('http://' + RAW_HOST + '/o/r/sha/SKILL.md')), env);
ok('skill-md.scheme-rejected', badScheme.status === 400);
const badUrl = await worker.fetch(new Request(skillMdUrl('not a url')), env);
ok('skill-md.malformed-rejected', badUrl.status === 400);
ok('skill-md.no-upstream-on-reject', upstreamCalls === 0);

const good = await worker.fetch(new Request(skillMdUrl(GOOD)), env);
ok('skill-md.allowed', good.status === 200);
const payload = await good.json();
ok('skill-md.body', payload.text.includes('curl -fsSL'));
ok('skill-md.not-truncated', payload.truncated === false);
ok('skill-md.upstream-called', upstreamCalls === 1);
ok('skill-md.headers', good.headers.get('x-content-type-options') === 'nosniff');
globalThis.fetch = realFetch;

console.log(`WORKER TESTS: ${pass} passed`);
