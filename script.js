// Performant, batched fade/translate reveals using IntersectionObserver
document.addEventListener('DOMContentLoaded', function () {
  const selector = '.features-list .feature, .item-cards .item-card';
  const items = Array.from(document.querySelectorAll(selector));
  if (!items.length) return;

  // Add base 'anim' class so CSS sets initial hidden state
  items.forEach(el => el.classList.add('anim'));
  // Only run animations on mobile and only when device is capable
  const isMobile = () => window.innerWidth <= 600;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 2;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const slowConnection = conn && (/2g|slow-2g/.test(conn.effectiveType));

  if (!isMobile() || prefersReduced || lowMemory || slowConnection) {
    // reveal immediately for non-mobile or constrained devices
    items.forEach(el => el.classList.add('in'));
    // still ensure images lazy-load
    document.querySelectorAll('img').forEach(img => { if (!img.hasAttribute('loading')) img.setAttribute('loading','lazy'); });
    return;
  }

  // rAF-batched reveal queue to limit main-thread work on mobile
  let queue = [];
  let scheduled = false;
  const BATCH = 4; // small batch for mobile
  const STAGGER_MS = 28;

  const flushQueue = () => {
    if (!queue.length) { scheduled = false; return; }
    requestAnimationFrame(() => {
      const batch = queue.splice(0, BATCH);
      batch.forEach((el, idx) => {
        setTimeout(() => {
          try { el.style.willChange = 'opacity, transform'; } catch(e) {}
          el.classList.add('in');
          const onEnd = (ev) => {
            if (ev.propertyName !== 'opacity' && ev.propertyName !== 'transform') return;
            el.style.willChange = '';
            el.removeEventListener('transitionend', onEnd);
          };
          el.addEventListener('transitionend', onEnd);
        }, idx * STAGGER_MS);
      });
      if (queue.length) flushQueue(); else scheduled = false;
    });
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        queue.push(entry.target);
        obs.unobserve(entry.target);
      }
    });
    if (queue.length && !scheduled) { scheduled = true; flushQueue(); }
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => observer.observe(el));

  // Lazy-load images to reduce initial load (if not already set)
  document.querySelectorAll('img').forEach(img => { if (!img.hasAttribute('loading')) img.setAttribute('loading','lazy'); });
});
// Mobile menu toggle for responsive nav
const menuBtn = document.querySelector('.menu-btn');
const navMenu = document.getElementById('main-menu');
if (menuBtn && navMenu) {
  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', !expanded);
    navMenu.classList.toggle('show');
  });
}

// Optional: Pause marquee on hover (for accessibility)
const marquee = document.querySelector('.marquee-track');
if (marquee) {
  marquee.addEventListener('mouseenter', () => {
    marquee.style.animationPlayState = 'paused';
  });
  marquee.addEventListener('mouseleave', () => {
    marquee.style.animationPlayState = 'running';
  });
  // On touch devices pause the marquee when touched to avoid continuous repaints
  marquee.addEventListener('touchstart', () => {
    marquee.style.animationPlayState = 'paused';
  }, { passive: true });
}
