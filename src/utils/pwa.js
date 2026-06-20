// PWA service worker registration and custom install prompt
import { showToast, createElement } from './dom';

let deferredPrompt = null;

export function registerPwa() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('PWA Service Worker registrado con éxito:', reg.scope);
        })
        .catch((err) => {
          console.warn('Error al registrar PWA Service Worker:', err);
        });
    });
  }

  // Handle installation prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    
    // Display custom install invitation toast or banner
    showInstallPromptBanner();
  });

  window.addEventListener('appinstalled', () => {
    console.log('La aplicación fue instalada con éxito.');
    deferredPrompt = null;
    showToast('¡Gracias por instalar Caja de Herramientas Pedagógicas!', 'success');
  });
}

function showInstallPromptBanner() {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const iconContainer = createElement('div', { className: 'toast-icon' });
  iconContainer.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>';

  const banner = createElement('div', {
    className: 'toast toast-info',
    style: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 'var(--spacing-sm)'
    }
  }, [
    createElement('div', {
      style: { display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }
    }, [
      iconContainer,
      createElement('div', { className: 'toast-message' }, '¿Instalar aplicación en tu pantalla de inicio?')
    ]),
    createElement('div', {
      style: { display: 'flex', gap: 'var(--spacing-sm)', alignSelf: 'flex-end' }
    }, [
      createElement('button', {
        className: 'button button-sm button-ghost',
        onClick: () => banner.remove()
      }, 'No, gracias'),
      createElement('button', {
        className: 'button button-sm button-primary',
        onClick: async () => {
          banner.remove();
          if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
          }
        }
      }, 'Instalar')
    ])
  ]);

  container.appendChild(banner);
}
