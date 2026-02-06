const LOCAL_KEY = 'caja_tool_contributions_v1';

const state = {
  meta: {},
  categories: [],
  tools: [],
  localContributions: []
};

const refs = {
  appTitle: document.querySelector('#appTitle'),
  appSubtitle: document.querySelector('#appSubtitle'),
  stats: document.querySelector('#stats'),
  searchInput: document.querySelector('#searchInput'),
  categoryFilter: document.querySelector('#categoryFilter'),
  sortFilter: document.querySelector('#sortFilter'),
  repositoryMessage: document.querySelector('#repositoryMessage'),
  categoriesContainer: document.querySelector('#categoriesContainer'),
  toolCategory: document.querySelector('#toolCategory'),
  contributionForm: document.querySelector('#contributionForm'),
  formMessage: document.querySelector('#formMessage'),
  localContributionsList: document.querySelector('#localContributionsList'),
  downloadContributionsBtn: document.querySelector('#downloadContributionsBtn'),
  clearContributionsBtn: document.querySelector('#clearContributionsBtn'),
  footerText: document.querySelector('#footerText')
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadLocalContributions() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    state.localContributions = raw ? JSON.parse(raw) : [];
  } catch {
    state.localContributions = [];
  }
}

function persistLocalContributions() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state.localContributions));
}

function renderMeta() {
  refs.appTitle.textContent = state.meta.name || 'Caja de Herramientas Pedagogicas';
  refs.appSubtitle.textContent =
    state.meta.description ||
    'Repositorio pedagogico abierto para consultar y compartir estrategias.';
  const organization = state.meta.organization ? ` | ${state.meta.organization}` : '';
  refs.footerText.textContent = `© ${new Date().getFullYear()} Repositorio pedagogico${organization}`;
}

function renderStats() {
  refs.stats.innerHTML = [
    ['Categorias', state.categories.length],
    ['Herramientas base', state.tools.length],
    ['Aportes locales', state.localContributions.length],
    ['Total visible', state.tools.length + state.localContributions.length]
  ]
    .map(
      ([label, value]) =>
        `<article class="stat"><p class="label">${label}</p><p class="value">${value}</p></article>`
    )
    .join('');
}

function renderCategoryOptions() {
  const options = state.categories
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
    .join('');

  refs.categoryFilter.innerHTML = `<option value="">Todas las categorias</option>${options}`;
  refs.toolCategory.innerHTML = options;
}

function toolCard(tool) {
  const tags = (tool.tags || []).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join('');
  const digital = (tool.digitalOptions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const analog = (tool.analogOptions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');

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
      <p><strong>Autor:</strong> ${escapeHtml(tool.authorName || 'Comunidad')}</p>
    </article>
  `;
}

function renderRepository() {
  const query = refs.searchInput.value.trim().toLowerCase();
  const filterCategory = refs.categoryFilter.value;
  const sortBy = refs.sortFilter.value;

  const allTools = [...state.tools, ...state.localContributions];

  const html = state.categories
    .map((category) => {
      let tools = allTools.filter((tool) => {
        if (tool.categoryId !== category.id) return false;
        if (filterCategory && filterCategory !== category.id) return false;

        if (!query) return true;
        const haystack = [tool.title, tool.summary, ...(tool.tags || [])].join(' ').toLowerCase();
        return haystack.includes(query);
      });

      tools =
        sortBy === 'title'
          ? [...tools].sort((a, b) => a.title.localeCompare(b.title, 'es'))
          : [...tools].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

      if (!tools.length) return '';

      return `
        <section class="category">
          <button class="category-head" style="background:${category.color}" data-target="cat-${category.id}">
            ${escapeHtml(category.name)} (${tools.length})
          </button>
          <div id="cat-${category.id}" class="category-panel">
            <p>${escapeHtml(category.description)}</p>
            <div class="tools-grid">${tools.map(toolCard).join('')}</div>
          </div>
        </section>
      `;
    })
    .join('');

  refs.categoriesContainer.innerHTML = html || '<p>No hay resultados para el filtro actual.</p>';
  const count = refs.categoriesContainer.querySelectorAll('.tool-card').length;
  refs.repositoryMessage.textContent = `${count} herramienta(s) mostrada(s)`;

  document.querySelectorAll('.category-head').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.dataset.target);
      panel.classList.toggle('open');
    });
  });

  const first = document.querySelector('.category-panel');
  if (first) first.classList.add('open');
}

function renderLocalContributions() {
  if (state.localContributions.length === 0) {
    refs.localContributionsList.innerHTML = '<p>No hay aportes locales guardados en este navegador.</p>';
    return;
  }

  refs.localContributionsList.innerHTML = state.localContributions
    .map(
      (tool) => `
      <article class="pending-card">
        <h3>${escapeHtml(tool.title)}</h3>
        <p>${escapeHtml(tool.summary)}</p>
        <p><strong>Categoria:</strong> ${escapeHtml(
          state.categories.find((c) => c.id === tool.categoryId)?.name || tool.categoryId
        )}</p>
        <p><strong>Autor:</strong> ${escapeHtml(tool.authorName || 'Comunidad')}</p>
      </article>
    `
    )
    .join('');
}

function handleContributionSubmit(event) {
  event.preventDefault();

  const now = new Date().toISOString();
  const contribution = {
    id: `local-${Date.now()}`,
    categoryId: refs.toolCategory.value,
    title: document.querySelector('#toolTitle').value.trim(),
    summary: document.querySelector('#toolSummary').value.trim(),
    digitalOptions: parseCsv(document.querySelector('#toolDigital').value),
    analogOptions: parseCsv(document.querySelector('#toolAnalog').value),
    tip: document.querySelector('#toolTip').value.trim(),
    peiConnection: document.querySelector('#toolPei').value.trim(),
    tags: parseCsv(document.querySelector('#toolTags').value),
    authorName: document.querySelector('#toolAuthor').value.trim(),
    status: 'local',
    createdAt: now,
    updatedAt: now
  };

  state.localContributions.unshift(contribution);
  persistLocalContributions();

  refs.contributionForm.reset();
  refs.formMessage.textContent = 'Aporte guardado localmente. Puedes descargarlo para compartirlo.';

  renderStats();
  renderRepository();
  renderLocalContributions();
}

function downloadContributions() {
  const payload = {
    exportedAt: new Date().toISOString(),
    source: window.location.href,
    contributions: state.localContributions
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `aportes-caja-herramientas-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function clearContributions() {
  state.localContributions = [];
  persistLocalContributions();
  renderStats();
  renderRepository();
  renderLocalContributions();
}

async function bootstrap() {
  refs.repositoryMessage.textContent = 'Cargando contenido...';
  loadLocalContributions();

  const response = await fetch('./data/db.json');
  const db = await response.json();

  state.meta = db.meta || {};
  state.categories = (db.categories || []).filter((category) => category.isPublished !== false);
  state.tools = (db.tools || []).filter((tool) => tool.status === 'published');

  renderMeta();
  renderCategoryOptions();
  renderStats();
  renderRepository();
  renderLocalContributions();

  refs.searchInput.addEventListener('input', renderRepository);
  refs.categoryFilter.addEventListener('change', renderRepository);
  refs.sortFilter.addEventListener('change', renderRepository);
  refs.contributionForm.addEventListener('submit', handleContributionSubmit);
  refs.downloadContributionsBtn.addEventListener('click', downloadContributions);
  refs.clearContributionsBtn.addEventListener('click', clearContributions);
}

bootstrap().catch((error) => {
  refs.repositoryMessage.textContent = `Error cargando datos: ${error.message}`;
});
