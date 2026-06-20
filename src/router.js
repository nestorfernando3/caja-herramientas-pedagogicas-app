// Navigation Router with Scroll Spy & Hamburger Menu Controls
import { state } from './state';

export function initRouter() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navbarMenu = document.getElementById('navbarMenu');
  const navLinks = document.querySelectorAll('.navbar-link');

  // 1. Hamburger Menu Toggle
  if (hamburgerBtn && navbarMenu) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navbarMenu.classList.toggle('open');
      hamburgerBtn.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navbarMenu.classList.contains('open') && !navbarMenu.contains(e.target) && e.target !== hamburgerBtn) {
        navbarMenu.classList.remove('open');
        hamburgerBtn.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. Smooth Scroll & Close Menu on Click
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      
      // Close mobile menu
      if (navbarMenu) {
        navbarMenu.classList.remove('open');
        hamburgerBtn.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }

      // Perform smooth scroll
      if (targetId === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          const navHeight = document.querySelector('.navbar').offsetHeight || 70;
          const targetOffset = targetSection.offsetTop - navHeight - 10;
          window.scrollTo({ top: targetOffset, behavior: 'smooth' });
        }
      }
    });
  });

  // 3. Scroll Spy (Highlight active nav link based on scroll position)
  const sections = [
    { id: '#hero', el: document.getElementById('hero') },
    { id: '#estadisticas', el: document.getElementById('estadisticas') },
    { id: '#repositorio', el: document.getElementById('repositorio') },
    { id: '#contribuir', el: document.getElementById('contribuir') },
    { id: '#editorial', el: document.getElementById('editorial') }
  ].filter(item => item.el !== null);

  const spyObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px', // Trigger when section is in viewport with more relaxed top/bottom margins
    threshold: 0
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = `#${entry.target.id}`;
        
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === activeId || (activeId === '#hero' && href === '#')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  }, spyObserverOptions);

  sections.forEach(sec => spyObserver.observe(sec.el));
}
