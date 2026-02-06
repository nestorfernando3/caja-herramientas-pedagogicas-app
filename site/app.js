/* ============ Configuration & State ============ */
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('api')) {
  localStorage.setItem('apiBaseUrl', urlParams.get('api'));
}

const state = {
  meta: {},
  categories: [],
  tools: [],
  adminKey: localStorage.getItem('editorKey') || '',
  theme: localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  apiBaseUrl: localStorage.getItem('apiBaseUrl') || window.CAJA_CONFIG?.apiBaseUrl || '',
  isLocalMode: false
};

const refs = {
  appTitle: document.querySelector('#appTitle'),
  appSubtitle: document.querySelector('#appSubtitle'),
  stats: document.querySelector('#stats'),
  categoriesContainer: document.querySelector('#categoriesContainer'),
  categoryFilter: document.querySelector('#categoryFilter'),
  sortFilter: document.querySelector('#sortFilter'),
  searchInput: document.querySelector('#searchInput'),
  repositoryMessage: document.querySelector('#repositoryMessage'),
  toolCategory: document.querySelector('#toolCategory'),
  toolForm: document.querySelector('#toolForm'),
  toolFormMessage: document.querySelector('#toolFormMessage'),
  pendingList: document.querySelector('#pendingList'),
  adminKeyInput: document.querySelector('#adminKeyInput'),
  loginEditorBtn: document.querySelector('#loginEditorBtn'),
  logoutEditorBtn: document.querySelector('#logoutEditorBtn'),
  exportBtn: document.querySelector('#exportBtn'),
  editorStatus: document.querySelector('#editorStatus'),
  footerText: document.querySelector('#footerText'),
  adminSection: document.querySelector('#adminSection'),
  categoryForm: document.querySelector('#categoryForm'),
  categoryFormMessage: document.querySelector('#categoryFormMessage'),
  themeToggle: document.querySelector('#themeToggle')
};

// Initialize Theme
document.documentElement.setAttribute('data-theme', state.theme);
refs.adminKeyInput.value = state.adminKey;

/* ============ Utilities ============ */
function listFromCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* ============ API Core ============ */
async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (state.adminKey) {
    headers.set('x-api-key', state.adminKey);
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http') ? path : `${state.apiBaseUrl}${cleanPath}`;

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body.error || body.errors?.join(', ') || 'Error inesperado';
    throw new Error(message);
  }

  return response.json();
}

/* ============ Rendering ============ */
function renderMeta() {
  if (state.meta.name) refs.appTitle.textContent = state.meta.name;
  if (state.meta.description) refs.appSubtitle.textContent = state.meta.description;
  const organization = state.meta.organization ? ` | ${state.meta.organization}` : '';
  refs.footerText.textContent = `© ${new Date().getFullYear()} Repositorio colaborativo docente${organization}`;
}

function renderStats(data) {
  const byStatus = data.byStatus || {};
  const statsConfig = [
    { label: 'Categorías', value: data.categories || 0, icon: '<path d="M4 6h16V4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16v-2H4V6zm16 2H8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10H8v-8h12v8z"/>' },
    { label: 'Herramientas', value: data.tools || 0, icon: '<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>' },
    { label: 'Pendientes', value: byStatus.pending || 0, icon: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>' },
    { label: 'Archivadas', value: byStatus.archived || 0, icon: '<path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.01 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.49-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.41l.83-1zM5 19V8h14v11H5zm11-5.5l-4 4-4-4 1.41-1.41L11 13.67V10h2v3.67l1.59-1.59L16 13.5z"/>' }
  ];

  refs.stats.innerHTML = statsConfig
    .map(
      (s, i) => `
        <article class="stat" style="animation-delay: ${i * 100}ms">
          <div class="icon"><svg viewBox="0 0 24 24">${s.icon}</svg></div>
          <p class="label">${s.label}</p>
          <p class="value">${s.value}</p>
        </article>
      `
    )
    .join('');
}

function renderCategoryOptions() {
  const categoryOptions = state.categories
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
    .join('');

  refs.categoryFilter.innerHTML = `<option value="">Todas las categorías</option>${categoryOptions}`;
  refs.toolCategory.innerHTML = categoryOptions;
}

function createToolCard(tool, index) {
  const tags = (tool.tags || [])
    .map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`)
    .join('');
  const digital = (tool.digitalOptions || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
  const analog = (tool.analogOptions || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');

  return `
    <article class="tool-card" style="animation-delay: ${index * 50}ms">
      <h3>${escapeHtml(tool.title)}</h3>
      <p>${escapeHtml(tool.summary)}</p>
      <div style="margin: 0.5rem 0">${tags}</div>
      <h4>Digital</h4>
      <ul>${digital || '<li>No definido</li>'}</ul>
      <h4>Analógico</h4>
      <ul>${analog || '<li>No definido</li>'}</ul>
      <p><strong>Tip:</strong> ${escapeHtml(tool.tip)}</p>
      <p><strong>PEI:</strong> ${escapeHtml(tool.peiConnection)}</p>
      <p><strong>Autor:</strong> ${escapeHtml(tool.authorName)}</p>
    </article>
  `;
}

function renderRepository() {
  const query = refs.searchInput.value.trim().toLowerCase();
  const filterCategory = refs.categoryFilter.value;
  const sortBy = refs.sortFilter.value;

  const filteredCategories = state.categories.filter(c => {
    if (filterCategory && filterCategory !== c.id) return false;
    return true;
  });

  const categoriesHtml = filteredCategories
    .map((category) => {
      let tools = state.tools.filter((tool) => {
        if (tool.categoryId !== category.id) return false;
        if (!query) return true;

        const haystack = [tool.title, tool.summary, ...(tool.tags || [])].join(' ').toLowerCase();
        return haystack.includes(query);
      });

      if (sortBy === 'title') {
        tools = [...tools].sort((a, b) => a.title.localeCompare(b.title, 'es'));
      } else {
        tools = [...tools].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      }

      if (tools.length === 0 && query) return '';
      if (tools.length === 0 && !query && filterCategory) return '';

      const cards = tools.map((t, i) => createToolCard(t, i)).join('');
      return `
        <section class="category">
          <button class="category-head" style="background:${category.color}" data-target="panel-${category.id}">
            ${escapeHtml(category.name)} (${tools.length})
          </button>
          <div id="panel-${category.id}" class="category-panel">
            <p>${escapeHtml(category.description)}</p>
            <div class="tools-grid">${cards}</div>
          </div>
        </section>
      `;
    })
    .join('');

  refs.categoriesContainer.innerHTML = categoriesHtml || '<p class="message">No hay resultados para el filtro actual.</p>';
  const visibleCount = (refs.categoriesContainer.querySelectorAll('.tool-card') || []).length;
  refs.repositoryMessage.innerHTML = state.isLocalMode
    ? `<span class="pill">Modo catálogo activo</span> ${visibleCount} herramientas`
    : `${visibleCount} herramienta(s) mostrada(s)`;

  document.querySelectorAll('.category-head').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.dataset.target);
      const isOpen = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', isOpen);
    });
  });

  const firstPanel = document.querySelector('.category-panel');
  if (firstPanel && !query) {
    firstPanel.classList.add('open');
    const firstBtn = document.querySelector('.category-head');
    if (firstBtn) firstBtn.setAttribute('aria-expanded', 'true');
  }
}

function renderEditorStatus() {
  const active = Boolean(state.adminKey);
  refs.editorStatus.textContent = active ? 'Modo editor: activo' : 'Modo editor: inactivo';
  refs.editorStatus.classList.toggle('active', active);
  refs.adminSection.classList.toggle('hidden', !active || state.isLocalMode);
  refs.logoutEditorBtn.classList.toggle('hidden', !active);
  refs.loginEditorBtn.classList.toggle('hidden', active);

  if (state.isLocalMode) {
    refs.editorStatus.textContent = 'Modo editorial desactivado (Local)';
    refs.loginEditorBtn.classList.add('hidden');
  }
}

function renderPendingList(items) {
  if (state.isLocalMode || !state.adminKey) {
    refs.pendingList.innerHTML = '<p class="message">Modo editorial no disponible en versión estática.</p>';
    return;
  }

  if (items.length === 0) {
    refs.pendingList.innerHTML = '<p class="message">No hay propuestas pendientes.</p>';
    return;
  }

  refs.pendingList.innerHTML = items
    .map(
      (tool, i) => `
        <article class="pending-card" style="animation: fadeInUp 400ms ease-out both; animation-delay: ${i * 100}ms">
          <h3>${escapeHtml(tool.title)}</h3>
          <p>${escapeHtml(tool.summary)}</p>
          <p><strong>Categoría:</strong> ${escapeHtml(tool.category?.name || tool.categoryId)}</p>
          <p><strong>Autor:</strong> ${escapeHtml(tool.authorName)}</p>
          <div class="pending-actions">
            <button class="button button-sm button-primary" data-action="publish" data-id="${tool.id}">Publicar</button>
            <button class="button button-sm button-ghost" data-action="archive" data-id="${tool.id}">Archivar</button>
          </div>
        </article>
      `
    )
    .join('');

  refs.pendingList.querySelectorAll('button[data-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = button.dataset.action === 'publish' ? 'published' : 'archived';
      try {
        await api(`/api/tools/${button.dataset.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
        await refreshAll();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });
  });
}

/* ============ Data Management ============ */
async function loadLocalFallback() {
  state.isLocalMode = true;
  try {
    const res = await fetch('./data/db.json');
    if (!res.ok) throw new Error('No local data');
    const db = await res.json();
    state.meta = db.meta || {};
    state.categories = db.categories || [];
    state.tools = (db.tools || []).filter(t => t.status === 'published');

    renderMeta();
    renderCategoryOptions();
    renderStats({
      categories: db.categories.length,
      tools: state.tools.length,
      byStatus: { published: state.tools.length }
    });
    renderRepository();
    renderEditorStatus();
  } catch (err) {
    refs.repositoryMessage.innerHTML = '<span class="message error">Error: El servidor no responde y no se encontró respaldo local.</span>';
  }
}

async function refreshAll() {
  refs.repositoryMessage.textContent = 'Conectando con el servidor...';
  try {
    const [metaRes, categoriesRes, toolsRes, statsRes] = await Promise.all([
      api('/api/meta'),
      api('/api/categories'),
      api('/api/tools'),
      api('/api/stats')
    ]);

    state.meta = metaRes.data || {};
    state.categories = categoriesRes.data || [];
    state.tools = toolsRes.data || [];
    state.isLocalMode = false;

    renderMeta();
    renderCategoryOptions();
    renderStats(statsRes.data);
    renderRepository();
    renderEditorStatus();

    if (state.adminKey) {
      const pending = await api('/api/tools?includeHidden=true&status=pending');
      renderPendingList(pending.data);
    }
  } catch (error) {
    console.warn('API Error, switching to local mode:', error.message);
    await loadLocalFallback();
  }
}

/* ============ Event Listeners ============ */
refs.themeToggle.addEventListener('click', () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('theme', state.theme);
});

refs.searchInput.addEventListener('input', () => renderRepository());
refs.categoryFilter.addEventListener('change', () => renderRepository());
refs.sortFilter.addEventListener('change', () => renderRepository());

refs.toolForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const btn = refs.toolForm.querySelector('button[type="submit"]');
  const originalHtml = btn.innerHTML;

  const payload = {
    categoryId: refs.toolCategory.value,
    title: document.querySelector('#toolTitle').value,
    summary: document.querySelector('#toolSummary').value,
    digitalOptions: listFromCsv(document.querySelector('#toolDigital').value),
    analogOptions: listFromCsv(document.querySelector('#toolAnalog').value),
    tip: document.querySelector('#toolTip').value,
    peiConnection: document.querySelector('#toolPei').value,
    tags: listFromCsv(document.querySelector('#toolTags').value),
    authorName: document.querySelector('#toolAuthor').value,
    authorEmail: document.querySelector('#toolEmail').value
  };

  if (state.isLocalMode) {
    const subject = encodeURIComponent(`Propuesta: ${payload.title}`);
    const body = encodeURIComponent(`Aporte Docente:\n\n${JSON.stringify(payload, null, 2)}`);
    window.open(`mailto:nestor.BDR@gmail.com?subject=${subject}&body=${body}`);
    refs.toolFormMessage.textContent = 'Borrador de correo abierto. ¡Gracias por aportar!';
    refs.toolForm.reset();
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    const res = await api('/api/tools', { method: 'POST', body: JSON.stringify(payload) });
    refs.toolForm.reset();
    refs.toolFormMessage.textContent = res.message;
    await refreshAll();
  } catch (error) {
    refs.toolFormMessage.innerHTML = `<span class="message error">${error.message}</span>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
});

refs.loginEditorBtn.addEventListener('click', async () => {
  state.adminKey = refs.adminKeyInput.value.trim();
  try {
    await api('/api/export');
    localStorage.setItem('editorKey', state.adminKey);
    renderEditorStatus();
    await refreshAll();
  } catch {
    state.adminKey = '';
    localStorage.removeItem('editorKey');
    renderEditorStatus();
    alert('Clave de editor inválida.');
  }
});

refs.logoutEditorBtn.addEventListener('click', () => {
  state.adminKey = '';
  localStorage.removeItem('editorKey');
  renderEditorStatus();
  refreshAll();
});

async function bootstrap() {
  await refreshAll();
}

bootstrap();
