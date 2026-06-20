// DOM Utilities and Helpers

/**
 * Escapes HTML characters to prevent XSS.
 * @param {string} val 
 * @returns {string}
 */
export function escapeHtml(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Splits a comma-separated string into a trimmed, non-empty array of items.
 * @param {string} value 
 * @returns {string[]}
 */
export function listFromCsv(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

/**
 * Helper to build DOM elements programmatically.
 * @param {string} tag 
 * @param {Object} attrs 
 * @param {Array|string} children 
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  
  // Set Attributes
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = val;
    } else if (key.startsWith('on') && typeof val === 'function') {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, val);
    } else if (key === 'style' && typeof val === 'object') {
      Object.assign(el.style, val);
    } else if (val === true) {
      el.setAttribute(key, '');
    } else if (val !== false && val !== null && val !== undefined) {
      el.setAttribute(key, val);
    }
  }

  // Set Children
  if (typeof children === 'string') {
    el.textContent = children;
  } else if (children instanceof Node) {
    el.appendChild(children);
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
  }

  return el;
}

/**
 * Displays a Toast notification at the bottom right.
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>',
    error: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
  };

  let dismissTimeout = null;

  const closeToast = () => {
    if (dismissTimeout) clearTimeout(dismissTimeout);
    toast.remove();
  };

  const toast = createElement('div', {
    className: `toast toast-${type}`
  }, [
    createElement('div', { className: 'toast-icon' }),
    createElement('div', { className: 'toast-message' }, message),
    createElement('button', {
      className: 'toast-close-btn',
      'aria-label': 'Cerrar notificación',
      onClick: closeToast
    }, '×')
  ]);

  toast.querySelector('.toast-icon').innerHTML = icons[type] || icons.info;

  container.appendChild(toast);

  dismissTimeout = setTimeout(closeToast, 4000);
}

/**
 * Animates a numeric counter from 0 (or its current value) to targetValue.
 * @param {HTMLElement} element 
 * @param {number} targetValue 
 * @param {number} duration 
 */
export function animateCountUp(element, targetValue, duration = 800) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = String(targetValue);
    return;
  }

  const start = parseInt(element.textContent, 10) || 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(start + (targetValue - start) * eased);
    
    element.textContent = String(currentValue);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
