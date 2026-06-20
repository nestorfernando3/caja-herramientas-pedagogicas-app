// Application Bootstrap Entrypoint
import { state, fetchDatabase, initTheme, initFavorites, initModal, checkDeepLinking } from './state';
import { initRouter } from './router';
import { registerPwa } from './utils/pwa';
import { 
  initContributeForm, 
  initEditor, 
  renderHero, 
  renderStats, 
  renderCategories, 
  renderFooter, 
  initScrollObserver 
} from './render';

// Main Application Dynamic Render Loop
function renderDynamicApp() {
  renderStats();
  renderCategories();
  initScrollObserver();
}

// Debounce helper for search input
function debounce(func, timeout = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

// Setup Filters & Interactive listeners
function initFilters() {
  const searchInput = document.getElementById('searchInput');
  const catFilter = document.getElementById('categoryFilter');
  const sortFilter = document.getElementById('sortFilter');

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      state.setFilters({ query: e.target.value });
    }, 150));
  }

  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      state.setFilters({ category: e.target.value });
    });

    // Populate Category Dropdown filter on categories load
    state.subscribe((currState) => {
      const currentSelection = catFilter.value;
      catFilter.innerHTML = '<option value="">Todas las categorías</option>';
      currState.categories
        .filter(c => c.isPublished)
        .forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = cat.name;
          catFilter.appendChild(opt);
        });
      catFilter.value = currentSelection;
    });
  }

  if (sortFilter) {
    sortFilter.addEventListener('change', (e) => {
      state.setFilters({ sortBy: e.target.value });
    });
  }
}

// Bootstrap Application
async function bootstrap() {
  // 1. Setup global hooks & toggles
  initTheme();
  initRouter();
  initFavorites();
  initModal();
  initFilters();
  initContributeForm();
  initEditor();

  // 2. Initial render for static elements
  renderHero();
  renderFooter();
  
  // 3. Subscribe render loop to dynamic changes only
  state.subscribe(() => {
    renderDynamicApp();
  });

  // 4. Load dynamic database & PWA
  await fetchDatabase();
  registerPwa();

  // 5. Initial dynamic render
  renderDynamicApp();

  // 6. Deep linking check (modal triggers)
  checkDeepLinking();
}

bootstrap();
