const WORKSPACE_KEY = 'toolhub.execution.workspace.v1';
const RECENT_KEY = 'toolhub.recent.tools.v1';

function safeRead(key) {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
function safeWrite(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function escapeHtml(value) { return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }

function trackToolVisit() {
  const id = document.body.dataset.tool;
  if (!id) return;
  const title = document.querySelector('.tool-head h1')?.textContent?.trim().replace(/^\S+\s/, '') || id;
  const items = safeRead(RECENT_KEY).filter((item) => item.id !== id);
  items.unshift({ id, title, href: `/tools/${id}.html`, usedAt: new Date().toISOString() });
  safeWrite(RECENT_KEY, items.slice(0, 6));
}
function renderHomeLocal() {
  const recent = document.querySelector('#recent-tools');
  const saved = document.querySelector('#saved-projects');
  if (recent) {
    const items = safeRead(RECENT_KEY);
    recent.innerHTML = items.length ? items.map((item) => `<a href="${escapeHtml(item.href)}"><span>最近工具</span><b>${escapeHtml(item.title)}</b><i>→</i></a>`).join('') : '<p class="local-empty">还没有记录。打开一个工具后会显示在这里。</p>';
  }
  if (saved) {
    const projects = safeRead(WORKSPACE_KEY).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4);
    saved.innerHTML = projects.length ? projects.map((project) => `<a href="/workspace.html"><span>${escapeHtml(project.kind || '本地项目')}</span><b>${escapeHtml(project.goal)}</b><i>→</i></a>`).join('') : '<p class="local-empty">在任一工作台保存项目后，会仅保存在这台设备。</p>';
  }
}
function initProjectForm() {
  const form = document.querySelector('#project-form');
  if (!form) return;
  const mode = document.body.dataset.workbench || '项目';
  const feedback = document.querySelector('#project-feedback');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const goal = String(data.get('goal') || '').trim();
    if (!goal) return;
    const projects = safeRead(WORKSPACE_KEY);
    const now = new Date().toISOString();
    projects.unshift({ id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`), kind: mode === 'content' ? '内容发布' : mode === 'dev' ? '开发调试' : 'Skills 决策', goal, summary: String(data.get('notes') || '').trim(), status: 'Planning', createdAt: now, updatedAt: now });
    safeWrite(WORKSPACE_KEY, projects.slice(0, 50));
    form.reset();
    if (feedback) feedback.textContent = '已保存到本地工作区。';
  });
}

document.addEventListener('DOMContentLoaded', () => { trackToolVisit(); renderHomeLocal(); initProjectForm(); });
