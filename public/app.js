const state = {
  meta: {},
  categories: [],
  tools: [],
  adminKey: localStorage.getItem('editorKey') || '',
  theme: localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
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

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (state.adminKey) {
    headers.set('x-api-key', state.adminKey);
  }

  const response = await fetch(path, { ...options, headers });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body.error || body.errors?.join(', ') || 'Error inesperado';
    throw new Error(message);
  }

  return body;
}

function renderMeta() {
  if (state.meta.name) refs.appTitle.textContent = state.meta.name;
  if (state.meta.description) refs.appSubtitle.textContent = state.meta.description;
  const organization = state.meta.organization ? ` | ${state.meta.organization}` : '';
  refs.footerText.textContent = `© ${new Date().getFullYear()} Repositorio colaborativo docente${organization}`;
}

function renderStats(data) {
  const byStatus = data.byStatus || {};
  const statsConfig = [
    { label: 'Categorías', value: data.categories, icon: '<path d="M4 6h16V4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16v-2H4V6zm16 2H8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10H8v-8h12v8z"/>' },
    { label: 'Herramientas', value: data.tools, icon: '<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>' },
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
        tools = [...tools].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
  refs.repositoryMessage.textContent = `${visibleCount} herramienta(s) mostrada(s)`;

  document.querySelectorAll('.category-head').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.dataset.target);
      const isOpen = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', isOpen);
    });
  });

  // Open the first panel by default if there are results
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
  refs.adminSection.classList.toggle('hidden', !active);
  refs.logoutEditorBtn.classList.toggle('hidden', !active);
  refs.loginEditorBtn.classList.toggle('hidden', active);
}

function renderPendingList(items) {
  if (!state.adminKey) {
    refs.pendingList.innerHTML = '<p class="message">Activa modo editor para revisar propuestas.</p>';
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
            <button class="button button-sm button-primary" data-action="publish" data-id="${tool.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Publicar
            </button>
            <button class="button button-sm button-ghost" data-action="archive" data-id="${tool.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Archivar
            </button>
          </div>
        </article>
      `
    )
    .join('');

  refs.pendingList.querySelectorAll('button[data-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = button.dataset.action === 'publish' ? 'published' : 'archived';
      try {
        await api(`/api/tools/${button.dataset.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
        await refreshAll();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });
  });
}

async function refreshAll() {
  refs.repositoryMessage.textContent = 'Cargando herramientas...';

  try {
    const [metaRes, categoriesRes, toolsRes, statsRes] = await Promise.all([
      api('/api/meta'),
      api('/api/categories'),
      api('/api/tools'),
      api('/api/stats')
    ]);

    state.meta = metaRes.data || {};
    state.categories = categoriesRes.data;
    state.tools = toolsRes.data;

    renderMeta();
    renderCategoryOptions();
    renderStats(statsRes.data);
    renderRepository();

    if (state.adminKey) {
      const pending = await api('/api/tools?includeHidden=true&status=pending');
      renderPendingList(pending.data);
    } else {
      renderPendingList([]);
    }
  } catch (error) {
    refs.repositoryMessage.innerHTML = `<span class="message error">Error: ${escapeHtml(error.message)}</span>`;
  }
}

// Event Listeners
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
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  refs.toolFormMessage.classList.remove('error');
  refs.toolFormMessage.textContent = 'Procesando tu aporte...';

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

  try {
    const res = await api('/api/tools', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    refs.toolForm.reset();
    refs.toolFormMessage.textContent = res.message;
    await refreshAll();
  } catch (error) {
    refs.toolFormMessage.classList.add('error');
    refs.toolFormMessage.textContent = error.message;
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
});

refs.categoryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  refs.categoryFormMessage.classList.remove('error');
  refs.categoryFormMessage.textContent = 'Creando categoría...';

  const payload = {
    name: document.querySelector('#categoryName').value,
    description: document.querySelector('#categoryDescription').value,
    color: document.querySelector('#categoryColor').value,
    position: Number(document.querySelector('#categoryPosition').value),
    isPublished: document.querySelector('#categoryPublished').value === 'true'
  };

  try {
    await api('/api/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    refs.categoryForm.reset();
    document.querySelector('#categoryColor').value = '#0d9488';
    document.querySelector('#categoryPosition').value = 10;
    document.querySelector('#categoryPublished').value = 'true';

    refs.categoryFormMessage.textContent = 'Categoría creada correctamente.';
    await refreshAll();
  } catch (error) {
    refs.categoryFormMessage.classList.add('error');
    refs.categoryFormMessage.textContent = error.message;
  }
});

refs.loginEditorBtn.addEventListener('click', async () => {
  state.adminKey = refs.adminKeyInput.value.trim();
  if (!state.adminKey) {
    alert('Ingresa una clave de editor.');
    return;
  }

  try {
    await api('/api/export');
    localStorage.setItem('editorKey', state.adminKey);
    renderEditorStatus();
    await refreshAll();
  } catch {
    state.adminKey = '';
    refs.adminKeyInput.value = '';
    localStorage.removeItem('editorKey');
    renderEditorStatus();
    refs.pendingList.innerHTML = '<p class="message error">Clave de editor inválida.</p>';
  }
});

refs.logoutEditorBtn.addEventListener('click', async () => {
  state.adminKey = '';
  refs.adminKeyInput.value = '';
  localStorage.removeItem('editorKey');
  renderEditorStatus();
  await refreshAll();
});

refs.exportBtn.addEventListener('click', async () => {
  if (!state.adminKey) {
    alert('Activa modo editor para exportar.');
    return;
  }

  try {
    const payload = await api('/api/export');
    const blob = new Blob([JSON.stringify(payload.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `caja-herramientas-backup-${date}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert('Error al exportar: ' + error.message);
  }
});

async function bootstrap() {
  renderEditorStatus();
  refs.footerText.textContent = `© ${new Date().getFullYear()} Repositorio colaborativo docente`;

  try {
    await refreshAll();
  } catch (error) {
    refs.repositoryMessage.innerHTML = `<span class="message error">No se pudo cargar la aplicación: ${escapeHtml(error.message)}</span>`;
  }
}

bootstrap();
