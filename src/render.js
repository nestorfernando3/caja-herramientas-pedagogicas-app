// Consolidated UI Rendering Engine (Hero, Stats, Categories, Cards, Form, Editor, Scroll reveal)
import { state, openModal, shareTool, highlightText, matchesQuery, exportDatabase } from './state';
import { createElement, escapeHtml, listFromCsv, showToast, animateCountUp } from './utils/dom';

function getContrastColor(hexColor) {
  if (!hexColor || hexColor.charAt(0) !== '#') return '#ffffff';
  const hex = hexColor.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

/* ==========================================================================
   1. Component: Hero Section
   ========================================================================== */
export function renderHero() {
  const appTitle = document.getElementById('appTitle');
  const appSubtitle = document.getElementById('appSubtitle');

  if (appTitle && state.meta.name) appTitle.textContent = state.meta.name;
  if (appSubtitle && state.meta.description) appSubtitle.textContent = state.meta.description;

  const heroMetricCategories = document.getElementById('heroMetricCategories');
  const heroMetricTools = document.getElementById('heroMetricTools');
  if (heroMetricCategories) {
    heroMetricCategories.textContent = state.categories.filter(c => c.isPublished).length;
  }
  if (heroMetricTools) {
    heroMetricTools.textContent = state.tools.filter(t => t.status === 'published').length;
  }
}

/* ==========================================================================
   2. Component: Statistics Grid
   ========================================================================== */
export function renderStats() {
  const container = document.getElementById('estadisticas');
  if (!container) return;

  container.innerHTML = '';

  const publishedToolsCount = state.tools.filter(t => t.status === 'published').length;
  const pendingToolsCount = state.customTools.filter(t => t.status === 'pending').length;

  const stats = [
    {
      label: 'Categorías',
      value: state.categories.length,
      icon: '<path d="M4 6h16V4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16v-2H4V6zm16 2H8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10H8v-8h12v8z"/>'
    },
    {
      label: 'Herramientas',
      value: publishedToolsCount,
      icon: '<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>'
    },
    {
      label: 'Mis Favoritas',
      value: state.favorites.length,
      icon: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>'
    },
    {
      label: 'Pendientes',
      value: pendingToolsCount,
      icon: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>'
    }
  ];

  stats.forEach((s, idx) => {
    const card = createElement('article', {
      className: 'stat',
      style: { animationDelay: `${idx * 80}ms` }
    }, [
      createElement('div', { className: 'icon' }),
      createElement('p', { className: 'label' }, s.label),
      createElement('p', { className: 'value' }, '0')
    ]);

    card.querySelector('.icon').innerHTML = `<svg viewBox="0 0 24 24">${s.icon}</svg>`;
    container.appendChild(card);

    const valueEl = card.querySelector('.value');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCountUp(valueEl, s.value, 800);
          observer.unobserve(valueEl);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(valueEl);
  });
}

/* ==========================================================================
   3. Component: Tool Cards Grid
   ========================================================================== */
export function renderToolCards(tools, container) {
  if (!container) return;
  container.innerHTML = '';

  const query = state.filterQuery;

  tools.forEach((tool, idx) => {
    const isFav = state.favorites.includes(tool.id);
    const category = state.categories.find(c => c.id === tool.categoryId);
    const catColor = category ? category.color : 'var(--color-primary)';
    const categoryName = category ? category.name : '';

    const digitalChips = (tool.digitalOptions || [])
      .map(opt => `<span class="tool-card-option-chip">💻 ${highlightText(opt, query)}</span>`)
      .join('');
    const analogChips = (tool.analogOptions || [])
      .map(opt => `<span class="tool-card-option-chip">✏️ ${highlightText(opt, query)}</span>`)
      .join('');
    const chipsHTML = `<div class="tool-card-options-preview">${digitalChips}${analogChips}</div>`;

    const tagsHTML = (tool.tags || [])
      .map(tag => `<span class="pill">#${highlightText(tag, query)}</span>`)
      .join(' ');

    const card = createElement('article', {
      className: 'tool-card',
      style: {
        '--category-color': catColor,
        animationDelay: `${idx * 40}ms`
      },
      onClick: (e) => {
        if (!e.target.closest('button') && !e.target.closest('a') && !e.target.closest('.pill')) {
          openModal(tool);
        }
      }
    });

    card.innerHTML = `
      <button class="tool-card-fav-btn ${isFav ? 'is-favorite' : ''}" aria-label="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}" title="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
        <svg viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
      <div class="tool-card-header">
        <span class="tool-card-category-pill">${highlightText(categoryName, query)}</span>
        <h3 class="tool-card-title">${highlightText(tool.title, query)}</h3>
      </div>
      <p class="tool-card-summary">${highlightText(tool.summary, query)}</p>
      ${chipsHTML}
      <div class="tool-card-callout">
        <strong>💡 Tip:</strong> ${highlightText(tool.tip, query)}
      </div>
      <div class="tool-card-tags">${tagsHTML}</div>
      <div class="tool-card-meta">
        <span class="tool-card-author">Por: ${highlightText(tool.authorName, query)}</span>
        <div class="tool-card-actions">
          <button class="tool-card-btn share-btn" aria-label="Compartir" title="Compartir">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.8 2.04.8 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            Compartir
          </button>
        </div>
      </div>
    `;

    card.querySelector('.tool-card-fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      state.toggleFavorite(tool.id);
    });

    card.querySelector('.share-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      shareTool(tool);
    });

    container.appendChild(card);
  });
}

/* ==========================================================================
   4. Component: Categories Container (Accordions)
   ========================================================================== */
export function renderCategories() {
  const container = document.getElementById('categoriesContainer');
  const message = document.getElementById('repositoryMessage');
  
  if (!container) return;

  container.innerHTML = '';

  const query = state.filterQuery;
  const filterCat = state.filterCategory;
  const showFavs = state.showOnlyFavorites;

  const activeCategories = state.categories.filter(c => {
    if (filterCat && filterCat !== c.id) return false;
    return c.isPublished;
  });

  let totalVisibleTools = 0;
  let openedAny = false;

  activeCategories.forEach((cat) => {
    let tools = state.tools.filter(t => {
      if (t.categoryId !== cat.id) return false;
      if (t.status !== 'published') return false;
      if (showFavs && !state.favorites.includes(t.id)) return false;
      return matchesQuery(t, query);
    });

    if (state.sortBy === 'title') {
      tools = [...tools].sort((a, b) => a.title.localeCompare(b.title, 'es'));
    } else {
      tools = [...tools].sort((a, b) => (b.publishedAt || b.createdAt || '').localeCompare(a.publishedAt || a.createdAt || ''));
    }

    if (tools.length === 0 && (query || showFavs || filterCat)) return;

    totalVisibleTools += tools.length;

    const section = createElement('section', {
      className: 'category',
      style: { '--category-color': cat.color }
    });

    const textColor = getContrastColor(cat.color);
    const baseLabel = `${cat.name} — ${tools.length} herramienta${tools.length !== 1 ? 's' : ''}`;
    
    // Determine if accordion should open by default
    const isSearchOrFilterActive = query || showFavs || filterCat;
    let shouldOpen = false;
    if (isSearchOrFilterActive) {
      shouldOpen = true;
    } else {
      if (state.openCategoryId === cat.id) {
        shouldOpen = true;
        openedAny = true;
      } else if (state.openCategoryId === null && !openedAny) {
        shouldOpen = true;
        openedAny = true;
        state.openCategoryId = cat.id; // Initialize it
      }
    }

    const button = createElement('button', {
      className: 'category-head',
      style: { background: cat.color, color: textColor },
      'aria-expanded': shouldOpen ? 'true' : 'false',
      'aria-controls': `panel-${cat.id}`,
      'data-label-base': baseLabel,
      'aria-label': `${baseLabel}. ${shouldOpen ? 'Contraer' : 'Expandir'} sección`,
      onClick: () => toggleAccordion(button, panel, cat.id)
    }, [
      cat.name,
      createElement('span', { 
        className: 'category-head-badge',
        style: {
          background: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          color: textColor
        }
      }, String(tools.length))
    ]);

    const panel = createElement('div', {
      id: `panel-${cat.id}`,
      className: `category-panel ${shouldOpen ? 'open' : ''}`,
      role: 'region',
      'aria-labelledby': button.id
    });

    const content = createElement('div', { className: 'category-panel-content' }, [
      createElement('div', { className: 'category-description-wrapper' }, [
        createElement('p', { className: 'category-description' }, cat.description)
      ]),
      createElement('div', { className: 'tools-grid' })
    ]);

    panel.appendChild(content);
    section.appendChild(button);
    section.appendChild(panel);
    container.appendChild(section);

    const grid = content.querySelector('.tools-grid');
    renderToolCards(tools, grid);
  });

  if (totalVisibleTools === 0) {
    container.innerHTML = '';
    const emptyState = createElement('div', { className: 'empty-state', role: 'status' }, [
      createElement('div', { className: 'empty-state-icon' }),
      createElement('h3', { className: 'empty-state-title' }, 'No encontramos nada por aquí'),
      createElement('p', { className: 'empty-state-body' }, 'Intenta con otras palabras o limpia los filtros para ver todas las herramientas.'),
      createElement('button', {
        className: 'button button-ghost',
        onClick: () => {
          const searchInput = document.getElementById('searchInput');
          const categoryFilter = document.getElementById('categoryFilter');
          
          if (searchInput) searchInput.value = '';
          if (categoryFilter) categoryFilter.value = '';
          
          state.setFilters({
            query: '',
            categoryId: '',
            showOnlyFavorites: false
          });
        }
      }, 'Limpiar filtros')
    ]);

    emptyState.querySelector('.empty-state-icon').innerHTML = `
      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
    `;
    container.appendChild(emptyState);
  }

  if (message) {
    if (totalVisibleTools === 0) {
      message.className = 'message error';
      message.textContent = 'No se encontraron herramientas con los filtros seleccionados.';
    } else {
      message.className = 'message';
      message.textContent = `${totalVisibleTools} estrategia(s) ${showFavs ? 'favorita(s)' : ''} encontrada(s).`;
    }
  }
}

function toggleAccordion(button, panel, catId) {
  const isOpen = panel.classList.contains('open');
  const allPanels = document.querySelectorAll('.category-panel');
  const allButtons = document.querySelectorAll('.category-head');
  
  allPanels.forEach(p => p.classList.remove('open'));
  
  allButtons.forEach(b => {
    b.setAttribute('aria-expanded', 'false');
    const labelBase = b.getAttribute('data-label-base') || '';
    b.setAttribute('aria-label', `${labelBase}. Expandir sección`);
  });

  if (!isOpen) {
    panel.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    const labelBase = button.getAttribute('data-label-base') || '';
    button.setAttribute('aria-label', `${labelBase}. Contraer sección`);
    state.openCategoryId = catId;
  } else {
    state.openCategoryId = null;
  }
}

/* ==========================================================================
   5. Component: Form and Submissions
   ========================================================================== */
export function initContributeForm() {
  const form = document.getElementById('toolForm');
  const catSelect = document.getElementById('toolCategory');
  const formMsg = document.getElementById('toolFormMessage');

  if (!form || !catSelect) return;

  const updateDropdown = () => {
    catSelect.innerHTML = '';
    state.categories
      .filter(c => c.isPublished)
      .forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        catSelect.appendChild(opt);
      });
  };

  updateDropdown();
  state.subscribe(() => updateDropdown());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      id: `tool-custom-${Date.now()}`,
      categoryId: catSelect.value,
      title: document.getElementById('toolTitle').value.trim(),
      summary: document.getElementById('toolSummary').value.trim(),
      digitalOptions: listFromCsv(document.getElementById('toolDigital').value),
      analogOptions: listFromCsv(document.getElementById('toolAnalog').value),
      tip: document.getElementById('toolTip').value.trim(),
      peiConnection: document.getElementById('toolPei').value.trim(),
      tags: listFromCsv(document.getElementById('toolTags').value),
      status: 'pending',
      authorName: document.getElementById('toolAuthor').value.trim(),
      authorEmail: document.getElementById('toolEmail').value.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.addCustomTool(payload);

    // Mailtofallback
    const subject = encodeURIComponent(`Propuesta: ${payload.title}`);
    const body = `Estrategia Pedagógica:\n\n` +
      `- Título: ${payload.title}\n` +
      `- Resumen: ${payload.summary}\n` +
      `- Tip: ${payload.tip}\n` +
      `- PEI: ${payload.peiConnection}\n` +
      `- Autor: ${payload.authorName}\n\n` +
      `Detalle técnico JSON:\n${JSON.stringify(payload, null, 2)}`;

    window.open(`mailto:nestor.BDR@gmail.com?subject=${subject}&body=${encodeURIComponent(body)}`, '_blank');
    form.reset();
    showToast('Propuesta guardada localmente y borrador de correo abierto.', 'success');

    if (formMsg) {
      formMsg.className = 'message success';
      formMsg.textContent = 'Propuesta enviada con éxito.';
      formMsg.classList.remove('hidden');
      setTimeout(() => formMsg.classList.add('hidden'), 5000);
    }
  });
}

/* ==========================================================================
   6. Component: Editorial Panel Mappings
   ========================================================================== */
export function initEditor() {
  const loginBtn = document.getElementById('loginEditorBtn');
  const logoutBtn = document.getElementById('logoutEditorBtn');
  const keyInput = document.getElementById('adminKeyInput');
  const exportBtn = document.getElementById('exportBtn');
  const statusSpan = document.getElementById('editorStatus');
  const adminSection = document.getElementById('adminSection');
  const catForm = document.getElementById('categoryForm');
  const pendingList = document.getElementById('pendingList');

  if (!loginBtn || !keyInput || !statusSpan) return;

  const updateUI = () => {
    const active = state.adminKey === 'BDR2026';
    statusSpan.textContent = active ? 'Modo editor: ACTIVO' : 'Modo editor: inactivo';
    statusSpan.classList.toggle('active', active);

    if (active) {
      loginBtn.classList.add('hidden');
      keyInput.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
      adminSection.classList.remove('hidden');
      renderPendingList();
    } else {
      loginBtn.classList.remove('hidden');
      keyInput.classList.remove('hidden');
      logoutBtn.classList.add('hidden');
      adminSection.classList.add('hidden');
      pendingList.innerHTML = '<p class="message">Inicia sesión como editor para ver las propuestas pendientes.</p>';
    }
  };

  updateUI();
  state.subscribe(() => updateUI());

  loginBtn.addEventListener('click', () => {
    const entered = keyInput.value.trim();
    if (entered === 'BDR2026') {
      state.setAdminKey(entered);
      keyInput.value = '';
      showToast('Modo editor activado.', 'success');
    } else {
      showToast('Clave inválida.', 'error');
    }
  });

  logoutBtn.addEventListener('click', () => {
    state.setAdminKey('');
    showToast('Sesión de editor finalizada.', 'info');
  });

  if (catForm) {
    catForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('categoryName').value.trim();
      
      const newCat = {
        id: `cat-custom-${Date.now()}`,
        name,
        color: document.getElementById('categoryColor').value,
        position: parseInt(document.getElementById('categoryPosition').value, 10) || 10,
        isPublished: document.getElementById('categoryPublished').value === 'true',
        description: document.getElementById('categoryDescription').value.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      state.addCustomCategory(newCat);
      catForm.reset();
      showToast(`Categoría "${name}" creada.`, 'success');
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportDatabase());
  }

  function renderPendingList() {
    const pending = state.customTools.filter(t => t.status === 'pending');
    if (pending.length === 0) {
      pendingList.innerHTML = '<p class="message success">No hay propuestas pendientes de revisión.</p>';
      return;
    }

    pendingList.innerHTML = '';
    pending.forEach(tool => {
      const parent = state.categories.find(c => c.id === tool.categoryId);
      const card = createElement('article', { className: 'pending-card' }, [
        createElement('h3', {}, tool.title),
        createElement('p', {}, tool.summary),
        createElement('p', {}, `Autor: ${tool.authorName}`),
        createElement('div', { className: 'pending-actions' }, [
          createElement('button', {
            className: 'button button-sm button-primary',
            onClick: () => {
              state.updateCustomToolStatus(tool.id, 'published');
              showToast('Aprobado y publicado.', 'success');
            }
          }, 'Aprobar y Publicar'),
          createElement('button', {
            className: 'button button-sm button-ghost',
            style: { color: 'var(--color-error)', borderColor: 'var(--color-error)' },
            onClick: () => {
              state.updateCustomToolStatus(tool.id, 'archived');
              showToast('Propuesta archivada.', 'info');
            }
          }, 'Archivar')
        ])
      ]);
      pendingList.appendChild(card);
    });
  }
}

/* ==========================================================================
   7. Component: Footer
   ========================================================================== */
export function renderFooter() {
  const text = document.getElementById('footerText');
  if (!text) return;
  const org = state.meta.organization ? ` | ${state.meta.organization}` : '';
  text.innerHTML = `© ${new Date().getFullYear()} Caja de Herramientas Pedagógicas${org}.<br>Desarrollado para el fortalecimiento del Proyecto Educativo Institucional (PEI).`;
}

/* ==========================================================================
   8. Component: Scroll Observer Animations Fallback
   ========================================================================== */
let globalScrollObserver = null;

export function initScrollObserver() {
  if (CSS.supports && CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    return; // Native CSS takes precedence
  }

  if (globalScrollObserver) {
    globalScrollObserver.disconnect();
  }

  globalScrollObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.scroll-reveal').forEach(target => {
    target.classList.add('scroll-reveal-fallback');
    globalScrollObserver.observe(target);
  });
}
