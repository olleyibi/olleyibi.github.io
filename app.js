'use strict';
document.documentElement.classList.add('js');

// Preserve links shared before the portfolio was split into separate pages.
if (/^\/(?:index(?:\.html)?)?$/.test(location.pathname)) {
  const legacySections = { '#work': 'work.html', '#github': 'work.html#github', '#experience': 'experience.html', '#expertise': 'experience.html#expertise' };
  if (legacySections[location.hash]) location.replace('/' + legacySections[location.hash].replace('.html', '/'));
}
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function updateNavigation() {
  if (!document.body.classList.contains('page-home')) return;
  const section = location.hash === '#skills' ? 'skills' : location.hash === '#contact' ? 'contact' : 'home';
  nav.querySelectorAll('a').forEach(link => {
    if (link.dataset.nav === section) link.setAttribute('aria-current', section === 'home' ? 'page' : 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('hashchange', updateNavigation);
window.addEventListener('popstate', updateNavigation);
updateNavigation();
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('is-open', !isOpen);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('focusin', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    closeMenu();
    menuToggle.focus();
  }
});
matchMedia('(min-width: 901px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
// Limit the mobile menu to the reading area above IBI, including short screens.
const readingPane = document.querySelector('#site-scroll');
const header = document.querySelector('.site-header');
const fitMenu = () => {
  document.documentElement.style.setProperty('--menu-height', `${Math.max(60, readingPane.clientHeight - header.offsetHeight - 8)}px`);
};
if ('ResizeObserver' in window) new ResizeObserver(fitMenu).observe(readingPane);
fitMenu();
// Same-page shortcuts should preserve focus and avoid reloading the homepage.
document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const target = new URL(link.href);
    const route = pathname => pathname.replace(/\/index(?:\.html)?$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (target.origin !== location.origin || route(target.pathname) !== route(location.pathname) || !target.hash) return;
    const section = document.getElementById(decodeURIComponent(target.hash.slice(1)));
    if (!section) return;
    event.preventDefault();
    closeMenu();
    if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
    section.focus({preventScroll:true});
    section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    if (location.hash !== target.hash) history.pushState(null, '', target.hash);
    updateNavigation();
  });
});
document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    let visibleCount = 0;
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
      if (!card.hidden) visibleCount++;
    });
    document.querySelector('#filter-status').textContent = `Showing ${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'}.`;
  });
});
document.querySelector('#copy-email')?.addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText('Ibidamola.olley@gmail.com');
    status.textContent = 'Email address copied.';
  } catch {
    status.textContent = 'Select the email address above to copy it.';
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
