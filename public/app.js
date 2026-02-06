const state = {
  meta: {},
  categories: [],
  tools: [],
  adminKey: localStorage.getItem('editorKey') || ''
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
  categoryFormMessage: document.querySelector('#categoryFormMessage')
};

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
  refs.stats.innerHTML = [
    ['Categorias', data.categories],
    ['Herramientas publicadas', data.tools],
    ['Pendientes', byStatus.pending || 0],
    ['Archivadas', byStatus.archived || 0]
  ]
    .map(
      ([label, value]) =>
        `<article class="stat"><p class="label">${label}</p><p class="value">${value}</p></article>`
    )
    .join('');
}

function renderCategoryOptions() {
  const categoryOptions = state.categories
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
    .join('');

  refs.categoryFilter.innerHTML = `<option value="">Todas las categorias</option>${categoryOptions}`;
  refs.toolCategory.innerHTML = categoryOptions;
}

function createToolCard(tool) {
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
    <article class="tool-card">
      <h3>${escapeHtml(tool.title)}</h3>
      <p>${escapeHtml(tool.summary)}</p>
      <div>${tags}</div>
      <h4>Digital</h4>
      <ul>${digital || '<li>No definido</li>'}</ul>
      <h4>Analogico</h4>
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

  const categoriesHtml = state.categories
    .map((category) => {
      let tools = state.tools.filter((tool) => {
        if (tool.categoryId !== category.id) return false;
        if (filterCategory && filterCategory !== category.id) return false;
        if (!query) return true;

        const haystack = [tool.title, tool.summary, ...(tool.tags || [])].join(' ').toLowerCase();
        return haystack.includes(query);
      });

      if (sortBy === 'title') {
        tools = [...tools].sort((a, b) => a.title.localeCompare(b.title, 'es'));
      } else {
        tools = [...tools].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      }

      if (tools.length === 0) return '';

      const cards = tools.map(createToolCard).join('');
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

  refs.categoriesContainer.innerHTML = categoriesHtml || '<p>No hay resultados para el filtro actual.</p>';

  const visibleCount = (refs.categoriesContainer.querySelectorAll('.tool-card') || []).length;
  refs.repositoryMessage.textContent = `${visibleCount} herramienta(s) mostrada(s)`;

  document.querySelectorAll('.category-head').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.dataset.target);
      panel.classList.toggle('open');
    });
  });

  const firstPanel = document.querySelector('.category-panel');
  if (firstPanel) firstPanel.classList.add('open');
}

function renderEditorStatus() {
  const active = Boolean(state.adminKey);
  refs.editorStatus.textContent = active ? 'Modo editor: activo' : 'Modo editor: inactivo';
  refs.adminSection.classList.toggle('hidden', !active);
}

function renderPendingList(items) {
  if (!state.adminKey) {
    refs.pendingList.innerHTML = '<p>Activa modo editor para revisar propuestas.</p>';
    return;
  }

  if (items.length === 0) {
    refs.pendingList.innerHTML = '<p>No hay propuestas pendientes.</p>';
    return;
  }

  refs.pendingList.innerHTML = items
    .map(
      (tool) => `
        <article class="pending-card">
          <h3>${escapeHtml(tool.title)}</h3>
          <p>${escapeHtml(tool.summary)}</p>
          <p><strong>Categoria:</strong> ${escapeHtml(tool.category?.name || tool.categoryId)}</p>
          <p><strong>Autor:</strong> ${escapeHtml(tool.authorName)}</p>
          <div class="pending-actions">
            <button class="button button-primary" data-action="publish" data-id="${tool.id}">Publicar</button>
            <button class="button button-ghost" data-action="archive" data-id="${tool.id}">Archivar</button>
          </div>
        </article>
      `
    )
    .join('');

  refs.pendingList.querySelectorAll('button[data-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = button.dataset.action === 'publish' ? 'published' : 'archived';
      await api(`/api/tools/${button.dataset.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await refreshAll();
    });
  });
}

async function refreshAll() {
  refs.repositoryMessage.textContent = 'Cargando...';

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
}

refs.searchInput.addEventListener('input', () => renderRepository());
refs.categoryFilter.addEventListener('change', () => renderRepository());
refs.sortFilter.addEventListener('change', () => renderRepository());

refs.toolForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  refs.toolFormMessage.textContent = 'Enviando...';

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
    refs.toolFormMessage.textContent = error.message;
  }
});

refs.categoryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  refs.categoryFormMessage.textContent = 'Creando categoria...';

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
    document.querySelector('#categoryColor').value = '#2a9d8f';
    document.querySelector('#categoryPosition').value = 10;
    document.querySelector('#categoryPublished').value = 'true';

    refs.categoryFormMessage.textContent = 'Categoria creada correctamente.';
    await refreshAll();
  } catch (error) {
    refs.categoryFormMessage.textContent = error.message;
  }
});

refs.loginEditorBtn.addEventListener('click', async () => {
  state.adminKey = refs.adminKeyInput.value.trim();
  localStorage.setItem('editorKey', state.adminKey);
  renderEditorStatus();

  try {
    await api('/api/export');
    await refreshAll();
  } catch {
    state.adminKey = '';
    refs.adminKeyInput.value = '';
    localStorage.removeItem('editorKey');
    renderEditorStatus();
    refs.pendingList.innerHTML = '<p>Clave de editor invalida.</p>';
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
    refs.pendingList.innerHTML = '<p>Activa modo editor para exportar.</p>';
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
    refs.pendingList.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
});

async function bootstrap() {
  renderEditorStatus();
  refs.footerText.textContent = `© ${new Date().getFullYear()} Repositorio colaborativo docente`;

  try {
    await refreshAll();
  } catch (error) {
    refs.repositoryMessage.textContent = `No se pudo cargar la aplicacion: ${error.message}`;
  }
}

bootstrap();
