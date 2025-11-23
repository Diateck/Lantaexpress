// Lightweight fade-in using Intersection Observer (professional, performant)
document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.features-list .feature, .item-cards .item-card');
  if (!items || items.length === 0) return;

  // Respect user preference for reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target); // unobserve to avoid extra work
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => observer.observe(el));

  // Lazy-load images (set native loading attribute) to improve performance
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
