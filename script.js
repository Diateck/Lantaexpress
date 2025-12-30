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

// Category switching within items page (hash + JS-driven)
document.addEventListener('DOMContentLoaded', function () {
  const sidebarLinks = Array.from(document.querySelectorAll('.sidebar a[data-category]'));
  const sections = Array.from(document.querySelectorAll('.category-section'));

  const mapping = {
    'home-office': ['appliances', 'home-kitchen', 'home', 'home-office', 'office-products'],
    'phones-tablets': ['phones-mobile', 'phones-tablets-main', 'phones-accessories', 'tablet-accessories', 'wearables', 'connectivity'],
    'fashion': [
      'fashion-mens-clothing', 'fashion-mens-shoes', 'fashion-mens-accessories',
      'fashion-womens-clothing', 'fashion-womens-shoes', 'fashion-kids-baby',
      'fashion-kids-shoes', 'fashion-unisex', 'fashion-bags-footwear'
    ]
    ,
    'health-beauty': [
      'beauty-skin', 'beauty-hair', 'beauty-makeup', 'beauty-bathbody',
      'health-personal', 'health-medical', 'health-oral', 'fitness-wellness'
    ],
    'electronics': [
      'electronics-television', 'electronics-audio', 'electronics-cameras',
      'electronics-computers', 'electronics-gaming', 'electronics-wearables', 'electronics-networking'
    ]
  };

  function clearActiveSections() {
    sections.forEach(s => s.classList.remove('active'));
  }

  function setActiveSidebar(cat) {
    sidebarLinks.forEach(a => {
      const li = a.closest('li');
      if (!li) return;
      if (a.dataset.category === cat) li.classList.add('active');
      else li.classList.remove('active');
    });
  }

  function showCategory(cat) {
    if (!cat) return;
    clearActiveSections();
    const toShow = mapping[cat] || [cat];
    // Always include the 'appliances' (All Products) board so it's visible across categories
    const combined = Array.from(new Set([].concat(toShow, ['appliances'])));
    combined.forEach(k => {
      document.querySelectorAll(`.category-section[data-category="${k}"]`).forEach(el => el.classList.add('active'));
    });
    setActiveSidebar(cat);
    const first = document.querySelector('.category-section.active');
    if (first) {
      // On small screens, keep the sidebar (category options) visible at the top.
      // Calculate a scroll position that places the active section just below header + sidebar.
      const isMobile = window.innerWidth <= 600;
      if (isMobile) {
        const header = document.querySelector('.header');
        const sidebar = document.querySelector('.sidebar');
        const headerH = header ? header.offsetHeight : 0;
        const sidebarH = sidebar ? sidebar.offsetHeight : 0;
        const sectionTop = first.getBoundingClientRect().top + window.pageYOffset;
        const target = Math.max(0, sectionTop - headerH - sidebarH - 8);
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else {
        first.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  sidebarLinks.forEach(a => {
    a.addEventListener('click', function (e) {
      const cat = this.dataset.category;
      if (!cat) return;
      e.preventDefault();
      history.pushState(null, '', '#' + cat);
      showCategory(cat);
    });
  });

  // Initialize from URL query param, hash, or the already-active sidebar item
  const urlParams = new URLSearchParams(window.location.search);
  const qCat = urlParams.get('category');
  const initialHash = window.location.hash ? window.location.hash.slice(1) : null;
  if (qCat) {
    // keep URL consistent by replacing the hash (so back/forward still works with hashchange)
    history.replaceState(null, '', '#' + qCat);
    showCategory(qCat);
  } else if (initialHash) showCategory(initialHash);
  else {
    const activeAnchor = document.querySelector('.sidebar li.active a[data-category]');
    const defaultCat = activeAnchor ? activeAnchor.dataset.category : (sidebarLinks[0] && sidebarLinks[0].dataset.category);
    if (defaultCat) showCategory(defaultCat);
  }

  window.addEventListener('hashchange', () => {
    const h = window.location.hash ? window.location.hash.slice(1) : null;
    if (h) showCategory(h);
  });

  // Make the All Products board clickable (navigate to home)
  const allProductsSection = document.getElementById('appliances');
  if (allProductsSection) {
    allProductsSection.addEventListener('click', function (e) {
      // If the click is on an internal anchor (like the > link), allow default
      if (e.target && (e.target.closest('a') || e.target.tagName === 'A')) return;
      window.location.href = 'index.html';
    });
  }
});
