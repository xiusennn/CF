# ToolHub launch checklist

## Hard release gates
- [ ] Use a custom HTTPS domain; set `SITE_URL` to that canonical domain.
- [ ] Set a monitored `CONTACT_EMAIL`; verify that a real person can receive feedback.
- [ ] If operating in mainland China, complete the applicable filing and display required information before launch.
- [ ] Run `npm run build`, `npm test`, `npm run selfcheck`, `npm run test:browser`, and `npm run release:check`.
- [ ] Review `privacy.html`, `terms.html`, `data-policy.html`, `status.html`, and the external-link disclosure.
- [ ] Verify every external directory item is sourced, not copied, and has a lawful license/use path.
- [ ] Configure Cloudflare DNS, Workers logs, alerting, WAF/rate limits for `/api/*`, and a rollback deployment.

## Deployment
```bash
export SITE_URL=https://tool.cnagt.com
export CONTACT_EMAIL=admin@cnagt.com
export RELEASE_ID=$(date +%F)
npm run deploy
```

## Post-deploy smoke test
- `https://tool.cnagt.com/healthz` returns `{ "ok": true }`.
- Homepage, three workbenches, a text tool, a developer tool, and a directory page load on desktop and mobile.
- `/tools/json-formatter` redirects to the canonical tool page.
- `robots.txt`, `sitemap.xml`, canonical tags and contact link use the real domain.
- Submit the sitemap to Search Console only after the custom domain is live.

Do not declare the site fully operational before the domain, operator contact, and applicable compliance items are complete.
