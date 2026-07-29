# ToolHub operations runbook

## Weekly
- Review Cloudflare request errors, Worker exceptions, latency and 4xx/5xx spikes.
- Check high-intent pages: home, workbenches, Skills Registry, free LLM/API directory, and top ten tools.
- Verify a sample of external links and update/remove stale free-tier claims.
- Review incoming feedback, copyright concerns and security reports.

## Monthly
- Update source timestamps, model/API availability, Skill safety notes and editorial guidance.
- Review Search Console index coverage, sitemap errors, Core Web Vitals and manual actions.
- Review dependency and Cloudflare compatibility-date changes.
- Publish meaningful product or data-policy changes in the changelog.

## Incident priorities
1. Security, exposed secrets, malicious Skill links, phishing, data leakage.
2. Site unavailable, broken build, widespread tool failure.
3. Incorrect third-party pricing/availability or copyright complaints.
4. UI, copy and ordinary feature feedback.

## Safe rollback
Keep the last known-good deployment/version in Cloudflare. If a release creates widespread errors, roll back first, then investigate from logs. Do not use user-entered local-tool content in diagnostics.

## Measurement
Use aggregate Cloudflare traffic/error observability and Search Console for operational decisions. Do not add text, file, JSON, image, key or project-content collection merely to improve metrics.
