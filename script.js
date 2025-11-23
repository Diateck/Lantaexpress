// Performant, batched fade/translate reveals using IntersectionObserver
document.addEventListener('DOMContentLoaded', function () {
  const selector = '.features-list .feature, .item-cards .item-card';
  const items = Array.from(document.querySelectorAll(selector));
  if (!items.length) return;

  // Add base 'anim' class so CSS sets initial hidden state
  items.forEach(el => el.classList.add('anim'));

  // Respect reduced-motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    items.forEach(el => el.classList.add('in'));
    return;
  }

  // rAF-batched reveal queue to limit main-thread work
  let queue = [];
  const flushQueue = () => {
    if (!queue.length) return;
    requestAnimationFrame(() => {
      // reveal a small batch per frame to avoid jank
      const BATCH = 18;
      const batch = queue.splice(0, BATCH);
      batch.forEach(el => {
        // set will-change then toggle class
        try { el.style.willChange = 'opacity, transform'; } catch(e) {}
        el.classList.add('in');
        // cleanup will-change after transition end
        const onEnd = (ev) => {
          if (ev.propertyName !== 'opacity' && ev.propertyName !== 'transform') return;
          el.style.willChange = '';
          el.removeEventListener('transitionend', onEnd);
        };
        el.addEventListener('transitionend', onEnd);
      });
      // if more items queued, schedule another frame
      if (queue.length) flushQueue();
    });
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        queue.push(entry.target);
        obs.unobserve(entry.target);
      }
    });
    if (queue.length) flushQueue();
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => observer.observe(el));

  // Lazy-load images to reduce initial load (if not already set)
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
  });
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
}
