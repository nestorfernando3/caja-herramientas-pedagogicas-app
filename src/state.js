// Global Application State, Data API, and Core Logic (Theme, Favorites, Sharing, Modal, Search)
import { escapeHtml, showToast, listFromCsv, createElement } from './utils/dom';

/* ==========================================================================
   1. Dynamic State Manager
   ========================================================================== */
const STATE_KEY_THEME = 'caja-theme';
const STATE_KEY_EDITOR_KEY = 'caja-editor-key';
const STATE_KEY_FAVORITES = 'caja-favorites';
const STATE_KEY_CUSTOM_CATEGORIES = 'caja-custom-categories';
const STATE_KEY_CUSTOM_TOOLS = 'caja-custom-tools';
const EDITOR_SECRET_KEY = 'BDR2026'; // Key to unlock editor actions locally

export const state = {
  meta: {
    name: 'Caja de Herramientas Pedagógicas',
    description: 'Repositorio vivo y colaborativo de estrategias didácticas para docentes.',
    organization: 'IED Brisas del Río'
  },
  categories: [],
  tools: [],
  favorites: JSON.parse(localStorage.getItem(STATE_KEY_FAVORITES)) || [],
  adminKey: localStorage.getItem(STATE_KEY_EDITOR_KEY) || '',
  theme: localStorage.getItem(STATE_KEY_THEME) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  
  customCategories: JSON.parse(localStorage.getItem(STATE_KEY_CUSTOM_CATEGORIES)) || [],
  customTools: JSON.parse(localStorage.getItem(STATE_KEY_CUSTOM_TOOLS)) || [],
  openCategoryId: null,

  // UI Filters State
  filterQuery: '',
  filterCategory: '',
  sortBy: 'recent',
  showOnlyFavorites: false,

  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(listener => listener(this));
  },

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem(STATE_KEY_THEME, theme);
    this.notify();
  },

  setAdminKey(key) {
    this.adminKey = key;
    if (key) {
      localStorage.setItem(STATE_KEY_EDITOR_KEY, key);
    } else {
      localStorage.removeItem(STATE_KEY_EDITOR_KEY);
    }
    this.notify();
  },

  toggleFavorite(toolId) {
    if (this.favorites.includes(toolId)) {
      this.favorites = this.favorites.filter(id => id !== toolId);
    } else {
      this.favorites.push(toolId);
    }
    localStorage.setItem(STATE_KEY_FAVORITES, JSON.stringify(this.favorites));
    this.notify();
  },

  addCustomCategory(category) {
    this.customCategories.push(category);
    localStorage.setItem(STATE_KEY_CUSTOM_CATEGORIES, JSON.stringify(this.customCategories));
    this.notify();
  },

  addCustomTool(tool) {
    this.customTools.push(tool);
    localStorage.setItem(STATE_KEY_CUSTOM_TOOLS, JSON.stringify(this.customTools));
    this.notify();
  },

  updateCustomToolStatus(toolId, status) {
    const customTool = this.customTools.find(t => t.id === toolId);
    if (customTool) {
      customTool.status = status;
      customTool.updatedAt = new Date().toISOString();
      if (status === 'published') {
        customTool.publishedAt = new Date().toISOString();
      }
      localStorage.setItem(STATE_KEY_CUSTOM_TOOLS, JSON.stringify(this.customTools));
      this.notify();
    }
  },

  setFilters({ query, category, sortBy, showOnlyFavorites }) {
    if (query !== undefined) this.filterQuery = query;
    if (category !== undefined) this.filterCategory = category;
    if (sortBy !== undefined) this.sortBy = sortBy;
    if (showOnlyFavorites !== undefined) this.showOnlyFavorites = showOnlyFavorites;
    this.notify();
  }
};

/* ==========================================================================
   2. API and Database Caching
   ========================================================================== */
export async function fetchDatabase() {
  try {
    const res = await fetch('/data/db.json');
    if (!res.ok) throw new Error('No se pudo cargar la base de datos.');
    const db = await res.json();
    
    state.meta = db.meta || state.meta;

    // Merge static and custom categories
    const staticCategories = db.categories || [];
    const customCats = state.customCategories || [];
    const categoriesMap = new Map();
    staticCategories.forEach(c => categoriesMap.set(c.id, c));
    customCats.forEach(c => categoriesMap.set(c.id, c));
    state.categories = Array.from(categoriesMap.values()).sort((a, b) => a.position - b.position);

    // Merge static and custom tools
    const staticTools = db.tools || [];
    const customTls = state.customTools || [];
    const toolsMap = new Map();
    staticTools.forEach(t => toolsMap.set(t.id, t));
    customTls.forEach(t => toolsMap.set(t.id, t));

    state.tools = Array.from(toolsMap.values());
    state.notify();
  } catch (error) {
    console.error('Error fetching database:', error);
    showToast('Error cargando los datos. Cargando base de datos vacía.', 'error');
  }
}

export function exportDatabase() {
  const dbData = {
    categories: state.categories,
    tools: state.tools,
    meta: state.meta
  };

  const jsonStr = JSON.stringify(dbData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `caja_herramientas_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast('Base de datos exportada con éxito.', 'success');
}

/* ==========================================================================
   3. Theme Mode Controls
   ========================================================================== */
export function initTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  document.documentElement.setAttribute('data-theme', state.theme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      state.setTheme(state.theme === 'light' ? 'dark' : 'light');
    });
  }

  state.subscribe((currState) => {
    document.documentElement.setAttribute('data-theme', currState.theme);
  });
}

/* ==========================================================================
   4. Favorites Filtering UI
   ========================================================================== */
export function initFavorites() {
  const favFilterBtn = document.getElementById('favoritesFilterBtn');
  const favCountSpan = document.getElementById('favoritesCount');

  if (favFilterBtn) {
    favFilterBtn.addEventListener('click', () => {
      const active = !state.showOnlyFavorites;
      state.setFilters({ showOnlyFavorites: active });
      
      favFilterBtn.classList.toggle('button-primary', active);
      favFilterBtn.classList.toggle('button-ghost', !active);
      favFilterBtn.setAttribute('aria-pressed', active);
      
      showToast(active ? 'Mostrando solo tus favoritas ❤️' : 'Mostrando todo.', 'info');
    });
  }

  state.subscribe((currState) => {
    if (favCountSpan) {
      favCountSpan.textContent = currState.favorites.length;
    }
  });
}

/* ==========================================================================
   5. Sharing Module
   ========================================================================== */
export async function shareTool(tool) {
  const shareUrl = `${window.location.origin}${window.location.pathname}#tool-${tool.id}`;
  const shareTitle = tool.title;
  const shareText = `Estrategia Pedagógica BDR: "${tool.title}" - ${tool.summary}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      });
      showToast('Compartido con éxito.', 'success');
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Error sharing:', err);
      } else {
        return;
      }
    }
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    showToast('Enlace copiado al portapapeles. ¡Compártelo!', 'success');
  } catch (err) {
    console.error('Error copying:', err);
    showToast('No se pudo copiar el enlace.', 'error');
  }
}

export function shareToWhatsApp(tool) {
  const shareUrl = `${window.location.origin}${window.location.pathname}#tool-${tool.id}`;
  const message = `Estrategia Pedagógica: *${tool.title}*\n\n_${tool.summary}_\n\nVer detalle aquí: ${shareUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

/* ==========================================================================
   6. Modal Dialog controller (Deep linking & Focus Trap)
   ========================================================================== */
let activeTool = null;

export function initModal() {
  const dialog = document.getElementById('toolModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const favBtn = document.getElementById('modalFavBtn');
  const shareBtn = document.getElementById('modalShareBtn');

  if (!dialog) return;

  const closeModal = () => {
    dialog.close();
    activeTool = null;
    history.replaceState(null, null, ' ');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeModal();
  });

  dialog.addEventListener('close', () => {
    activeTool = null;
    if (window.location.hash.startsWith('#tool-')) {
      history.replaceState(null, null, ' ');
    }
  });

  if (favBtn) {
    favBtn.addEventListener('click', () => {
      if (activeTool) {
        state.toggleFavorite(activeTool.id);
        updateModalFavButton(activeTool.id);
      }
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (activeTool) shareTool(activeTool);
    });
  }

  // Key trap
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusableEls = dialog.querySelectorAll('button, [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
      const firstFocusable = focusableEls[0];
      const lastFocusable = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });
}

function updateModalFavButton(toolId) {
  const favBtn = document.getElementById('modalFavBtn');
  if (!favBtn) return;

  const isFav = state.favorites.includes(toolId);
  favBtn.classList.toggle('button-primary', isFav);
  favBtn.classList.toggle('button-ghost', !isFav);
  
  const span = favBtn.querySelector('span');
  const svg = favBtn.querySelector('svg');

  if (span) span.textContent = isFav ? 'Favorita ❤️' : 'Agregar a Favoritos';
  if (svg) {
    svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
  }
}

export function openModal(tool) {
  const dialog = document.getElementById('toolModal');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  const authorBadge = document.getElementById('modalAuthorBadge');
  const headerAccent = document.getElementById('modalHeaderAccent');

  if (!dialog || !body) return;

  activeTool = tool;
  history.replaceState(null, null, `#tool-${tool.id}`);

  const category = state.categories.find(c => c.id === tool.categoryId);
  const color = category ? category.color : 'var(--color-primary)';
  headerAccent.style.background = color;
  dialog.style.setProperty('--category-color', color);

  if (title) title.textContent = tool.title;
  if (authorBadge) authorBadge.innerHTML = `Enviado por: <strong>${escapeHtml(tool.authorName)}</strong>`;

  body.innerHTML = '';

  const tagsList = (tool.tags || [])
    .map(tag => `<span class="pill">#${escapeHtml(tag)}</span>`)
    .join(' ');

  const digitalList = (tool.digitalOptions || [])
    .map(opt => `<li>${escapeHtml(opt)}</li>`)
    .join('');
  const analogList = (tool.analogOptions || [])
    .map(opt => `<li>${escapeHtml(opt)}</li>`)
    .join('');

  body.appendChild(createElement('div', { className: 'modal-section' }, [
    createElement('h4', {}, 'Resumen Pedagógico'),
    createElement('p', { className: 'modal-section-content' }, tool.summary)
  ]));

  const digitalUl = createElement('ul', {});
  digitalUl.innerHTML = digitalList ? digitalList : '<li>Ninguno</li>';

  const analogUl = createElement('ul', {});
  analogUl.innerHTML = analogList ? analogList : '<li>Ninguno</li>';

  const optionsGrid = createElement('div', { className: 'modal-options-grid' });
  optionsGrid.appendChild(createElement('div', { className: 'modal-option-box' }, [
    createElement('h5', {}, '💻 Recursos Digitales'),
    digitalUl
  ]));
  optionsGrid.appendChild(createElement('div', { className: 'modal-option-box' }, [
    createElement('h5', {}, '✏️ Recursos Analógicos'),
    analogUl
  ]));
  body.appendChild(optionsGrid);

  body.appendChild(createElement('div', { className: 'modal-highlight-box' }, [
    createElement('strong', {}, '💡 Tip Práctico de Implementación: '),
    createElement('span', {}, tool.tip)
  ]));

  body.appendChild(createElement('div', { className: 'modal-highlight-box accent-box' }, [
    createElement('strong', {}, '🔗 Conexión PEI (Proyecto Educativo Institucional): '),
    createElement('span', {}, tool.peiConnection)
  ]));

  if (tagsList) {
    body.appendChild(createElement('div', { className: 'modal-section' }, [
      createElement('h4', {}, 'Etiquetas Relacionadas'),
      createElement('div', { className: 'tool-card-tags', style: { marginTop: 'var(--spacing-xs)' } }),
    ]));
    body.querySelector('.tool-card-tags').innerHTML = tagsList;
  }

  updateModalFavButton(tool.id);
  dialog.showModal();
  document.getElementById('modalCloseBtn').focus();
}

export function checkDeepLinking() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#tool-')) {
    const toolId = hash.slice(6);
    const tool = state.tools.find(t => t.id === toolId);
    if (tool) {
      setTimeout(() => openModal(tool), 200);
    }
  }
}

/* ==========================================================================
   7. Search Core highlighting logic
   ========================================================================== */
export function highlightText(text, query) {
  const safeText = escapeHtml(text);
  if (!query) return safeText;

  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return safeText.replace(regex, '<mark>$1</mark>');
}

export function matchesQuery(tool, query) {
  if (!query) return true;
  const cleanQuery = query.trim().toLowerCase();

  const title = (tool.title || '').toLowerCase();
  const summary = (tool.summary || '').toLowerCase();
  const tip = (tool.tip || '').toLowerCase();
  const pei = (tool.peiConnection || '').toLowerCase();
  const author = (tool.authorName || '').toLowerCase();
  const tags = (tool.tags || []).map(t => t.toLowerCase()).join(' ');
  const digital = (tool.digitalOptions || []).map(d => d.toLowerCase()).join(' ');
  const analog = (tool.analogOptions || []).map(a => a.toLowerCase()).join(' ');

  return title.includes(cleanQuery) ||
         summary.includes(cleanQuery) ||
         tip.includes(cleanQuery) ||
         pei.includes(cleanQuery) ||
         author.includes(cleanQuery) ||
         tags.includes(cleanQuery) ||
         digital.includes(cleanQuery) ||
         analog.includes(cleanQuery);
}
