/**
 * Shared scanning rules for SKILL.md files.
 *
 * These exist so the scheduled refresher (build/sync-skills.mjs) can classify a
 * newly discovered or changed skill with the SAME vocabulary the original
 * snapshot used: safety_flags names, safety tier, license class and a quality
 * score. The in-page reader (public/assets/js/skills-detail.js) mirrors the
 * same rule names so a highlighted line and a badge never disagree.
 *
 * Flag names must stay identical to the upstream snapshot, otherwise the
 * catalog facets would split into "old" and "new" variants of the same flag.
 */

export const SAFETY_RULES = [
	// name, regex, weight ('risky' rules alone are enough to mark a skill risky)
	{ name: "destructive_rm", risky: true, re: /\brm\s+-[a-zA-Z]*[rf][a-zA-Z]*\s|\brmdir\s+\/s\b|Remove-Item[^\n]*-Recurse[^\n]*-Force/i },
	{ name: "remote_pipe_shell", risky: true, re: /\b(curl|wget)\b[^\n|]*\|\s*(sudo\s+)?(ba|z|k)?sh\b/i },
	{ name: "powershell_iex", risky: true, re: /\bIEX\b|Invoke-Expression/i },
	{ name: "obfuscated_eval", risky: true, re: /base64\s+(-d|--decode)[^\n]*\|\s*(ba)?sh|eval\s*\(\s*atob\s*\(|\bFromBase64String\b/i },
	{ name: "exfiltration", risky: true, re: /\b(curl|wget|fetch|requests\.post|http\.post)\b[^\n]*(--data|-d\s|body=|payload=)[^\n]*(env|token|key|secret|\.ssh|password)/i },
	{ name: "privilege_escalation", risky: false, re: /\bsudo\b|\brunas\s+\/user|Start-Process[^\n]*-Verb\s+RunAs/i },
	{ name: "code_execution", risky: false, re: /\b(subprocess\.(run|call|Popen)|child_process|os\.system|exec\s*\(|spawnSync)\b/i },
	{ name: "file_deletion", risky: false, re: /\b(unlink|shutil\.rmtree|fs\.rm|del\s+\/f|truncate\s+-s\s*0)\b/i },
	{ name: "external_executable", risky: false, re: /\b(chmod\s+\+x[^\n]*&&\s*\.\/|\.\/[a-z0-9_.-]+\.(sh|bin|exe|AppImage)\b)/i },
	{ name: "exec_permission", risky: false, re: /\bchmod\s+(\+x|7[0-7][0-7])\b/i },
	{ name: "mentions_secrets", risky: false, re: /\b(api[_-]?key|access[_-]?token|secret[_-]?key|client[_-]?secret|password\s*=|credentials?\.json|\.env\b)/i },
	{ name: "prompt_injection", risky: false, re: /ignore\s+(all\s+)?(previous|prior)\s+instructions|disregard\s+(the\s+)?(above|system)|you\s+are\s+now\s+in\s+developer\s+mode/i },
]

/**
 * Classify SKILL.md text.
 * @param {string} text raw SKILL.md content
 * @returns {{ safety_flags: string[], safety: "safe"|"review"|"risky" }}
 */
export function scanSafety(text) {
	const body = String(text || "")
	const flags = []
	let risky = false
	for (const rule of SAFETY_RULES) {
		if (!rule.re.test(body)) continue
		flags.push(rule.name)
		if (rule.risky) risky = true
	}
	return { safety_flags: flags, safety: risky ? "risky" : flags.length ? "review" : "safe" }
}

const PERMISSIVE = new Set(["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "0BSD", "Unlicense", "CC0-1.0", "MIT-0", "Zlib"])
const SHARE_ALIKE = new Set(["GPL-2.0", "GPL-3.0", "AGPL-3.0", "LGPL-2.1", "LGPL-3.0", "MPL-2.0", "EPL-2.0", "CC-BY-SA-4.0", "OSL-3.0"])

/**
 * Map an SPDX id from the GitHub API to the four classes the catalog filters on.
 * @param {string|null|undefined} spdx
 */
export function licenseClass(spdx) {
	const id = String(spdx || "").trim()
	if (!id || id === "NOASSERTION") return "none"
	if (PERMISSIVE.has(id)) return "permissive"
	if (SHARE_ALIKE.has(id)) return "share_alike"
	return "other"
}

/**
 * Quality score, 36-94 to stay inside the range the existing snapshot uses.
 * Documented on the site so it is not another opaque grade:
 *   50 base + stars (max 20) + freshness (max 14) + license (max 6)
 *   + description quality (max 4) - safety penalty (max 20)
 */
export function qualityScore({ stars = 0, updatedAt = "", licenseClass: klass = "none", description = "", safety = "safe" }) {
	let score = 50
	const s = Number(stars) || 0
	score += s >= 20000 ? 20 : s >= 5000 ? 16 : s >= 1000 ? 12 : s >= 200 ? 8 : s >= 20 ? 4 : 0
	const days = updatedAt ? Math.max(0, (Date.now() - Date.parse(updatedAt + "T00:00:00Z")) / 86400000) : 9999
	score += days <= 7 ? 14 : days <= 30 ? 10 : days <= 90 ? 6 : days <= 365 ? 2 : 0
	score += klass === "permissive" ? 6 : klass === "share_alike" ? 4 : klass === "other" ? 2 : 0
	const desc = String(description || "").trim().length
	score += desc >= 120 ? 4 : desc >= 40 ? 2 : 0
	score -= safety === "risky" ? 20 : safety === "review" ? 6 : 0
	return Math.max(36, Math.min(94, Math.round(score)))
}

/**
 * Pull `name` and `description` out of SKILL.md YAML frontmatter, falling back
 * to the first heading / first paragraph. Kept deliberately small: this is not
 * a YAML parser, and anything unparsable simply falls back.
 */
export function parseSkillMd(text, fallbackName = "") {
	const body = String(text || "")
	let name = ""
	let description = ""
	const fm = body.match(/^---\r?\n([\s\S]*?)\r?\n---/)
	if (fm) {
		const nameLine = fm[1].match(/^name:\s*(.+)$/m)
		const descLine = fm[1].match(/^description:\s*([\s\S]*?)(?:\r?\n[a-zA-Z_-]+:|$)/m)
		if (nameLine) name = nameLine[1].trim().replace(/^["']|["']$/g, "")
		if (descLine) description = descLine[1].trim().replace(/^[>|]\s*/, "").replace(/\s+/g, " ").replace(/^["']|["']$/g, "")
	}
	if (!name) {
		const heading = body.match(/^#\s+(.+)$/m)
		name = heading ? heading[1].trim() : fallbackName
	}
	if (!description) {
		const para = body.replace(/^---[\s\S]*?---/, "").split(/\r?\n\s*\r?\n/).map((x) => x.trim()).find((x) => x && !x.startsWith("#"))
		description = (para || "").replace(/\s+/g, " ").slice(0, 600)
	}
	return { name: name || fallbackName, description }
}
