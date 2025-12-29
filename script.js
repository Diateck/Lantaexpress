// Slide-in animation for featured items on mobile using IntersectionObserver
document.addEventListener('DOMContentLoaded', function () {
  function isMobile() {
    return window.innerWidth <= 600;
  }

  const cards = Array.from(document.querySelectorAll('.item-cards .item-card'));
  if (!cards.length) return;

  // Fallback for browsers without IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    // simple immediate reveal for older browsers
    cards.forEach((card, idx) => {
      if ((idx + 1) % 2 === 0) card.classList.add('slide-in-right');
      else card.classList.add('slide-in-left');
    });
    return;
  }

  function observeCards() {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const idx = cards.indexOf(card);

        // alternate left/right
        if ((idx + 1) % 2 === 0) card.classList.add('slide-in-right');
        else card.classList.add('slide-in-left');

        // small stagger based on index for a polished look
        const stagger = Math.min(160, idx * 40);
        card.style.transitionDelay = stagger + 'ms';

        // stop observing once animated
        obs.unobserve(card);
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    cards.forEach(c => observer.observe(c));
  }

  if (isMobile()) observeCards();

  // Re-evaluate on resize if crossing mobile boundary
  let lastMobile = isMobile();
  window.addEventListener('resize', () => {
    const nowMobile = isMobile();
    if (nowMobile && !lastMobile) {
      // became mobile: observe
      observeCards();
    }
    lastMobile = nowMobile;
  });

  // Sidebar category filter (items.html)
  const sidebarItems = document.querySelectorAll('.sidebar ul li[data-category]');
  const categorySections = document.querySelectorAll('.category-section');
  function showCategory(cat) {
    categorySections.forEach(sec => {
      if (sec.dataset && sec.dataset.category === cat) {
        sec.classList.add('active');
        sec.style.display = '';
      } else {
        sec.classList.remove('active');
        sec.style.display = 'none';
      }
    });
  }
  if (sidebarItems.length) {
    sidebarItems.forEach(li => {
      li.addEventListener('click', (e) => {
        const cat = li.dataset.category;
        sidebarItems.forEach(x => x.classList.remove('active'));
        li.classList.add('active');
        showCategory(cat);
        // scroll into view of the main content area
        const mainContent = document.querySelector('.main-content') || document.querySelector('main');
        if (mainContent) mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // initialize: show home-office sections
    const activeLi = document.querySelector('.sidebar ul li.active');
    if (activeLi) showCategory(activeLi.dataset.category || 'home-office');
  }
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
