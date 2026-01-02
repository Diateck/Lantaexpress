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

// Mobile spinner: show a lightweight overlay on mobile when navigation or actions occur
(function () {
  function isSmallScreen() {
    return window.innerWidth <= 700;
  }

  function createSpinner() {
    if (document.getElementById('mobile-spinner-overlay')) return document.getElementById('mobile-spinner-overlay');
    const overlay = document.createElement('div');
    overlay.id = 'mobile-spinner-overlay';
    overlay.className = 'mobile-spinner-overlay visible';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';

    const spinner = document.createElement('div');
    spinner.className = 'mobile-spinner';

    const label = document.createElement('div');
    label.className = 'mobile-spinner-label';
    label.textContent = 'Loading...';

    wrapper.appendChild(spinner);
    wrapper.appendChild(label);
    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);
    return overlay;
  }

  function removeSpinner() {
    const el = document.getElementById('mobile-spinner-overlay');
    if (!el) return;
    try { document.body.removeChild(el); } catch (e) {}
  }

  // Intercept mobile nav clicks and show spinner briefly before navigation
  document.addEventListener('click', function (ev) {
    const link = ev.target.closest && ev.target.closest('a');
    if (!link) return;
    // only for small screens
    if (!isSmallScreen()) return;

    const href = link.getAttribute('href');
    if (!href) return;
    // ignore same-page anchors, mailto, javascript, and external blank targets
    if (href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank' || href.startsWith('javascript:')) return;

    // show spinner then navigate
    try {
      ev.preventDefault();
      const overlay = createSpinner();
      // small delay so spinner appears visibly (for very fast navigations)
      const delay = 220;
      setTimeout(() => {
        // navigate
        window.location.assign(href);
        // remove spinner in case navigation is slow or prevented
        setTimeout(removeSpinner, 2000);
      }, delay);
    } catch (err) {
      // fallback: allow navigation
      console.error(err);
      window.location.assign(href);
    }
  }, { passive: false });

  // Show spinner on logistics booking form submit on mobile
  document.addEventListener('submit', function (ev) {
    if (!isSmallScreen()) return;
    const form = ev.target;
    if (!form) return;
    // if form has attribute data-no-spinner, skip
    if (form.dataset && form.dataset.noSpinner) return;
    // show spinner — allow form's submit handler to run
    createSpinner();
    // remove after a timeout in case form is handled via JS
    setTimeout(removeSpinner, 4000);
  }, true);
})();
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
    'agriculture': [
      'agriculture-crop',
      'agriculture-seeds',
      'agriculture-tools',
      'agriculture-fertilizers',
      'agriculture-livestock',
      'agriculture-poultry',
      'agriculture-feed'
    ],
    'computing': [
      'computing-computers', 'computing-components', 'computing-accessories',
      'computing-storage', 'computing-printers', 'computing-networking',
      'computing-power', 'computing-software'
    ],
    'used-properties': [
      'used-home-appliances', 'used-kitchen-appliances', 'used-electronics',
      'used-phones-tablets', 'used-computing-devices', 'used-vehicles',
      'used-power-electrical', 'used-furniture-home'
    ],
    'food-staples': [
      'food-staples-rice', 'food-staples-grains', 'food-staples-ingredients',
      'food-staples-spices', 'food-staples-canned'
    ],
    'garden-outdoors': [
      'garden-tools', 'garden-plants', 'garden-furniture',
      'garden-lawn', 'garden-supplies', 'garden-lighting'
    ],
    // alias for sidebar uses like `garden`
    'garden': [
      'garden-tools', 'garden-plants', 'garden-furniture',
      'garden-lawn', 'garden-supplies', 'garden-lighting'
    ],
    'automobile': [
      'automobile-cars', 'automobile-motorcycles', 'automobile-parts',
      'automobile-tyres', 'automobile-electronics'
    ],
    'sporting-goods': [
      'sports-team', 'sports-fitness', 'sports-outdoor', 'sports-indoor',
      'sports-protective', 'sports-water', 'sports-racquet', 'sports-cycling',
      'sports-apparel'
    ],
    // alias commonly used in sidebar
    'sports': [
      'sports-team', 'sports-fitness', 'sports-outdoor', 'sports-indoor',
      'sports-protective', 'sports-water', 'sports-racquet', 'sports-cycling',
      'sports-apparel'
    ],
    'toys-baby': [
      'baby-care', 'baby-feeding', 'baby-clothing', 'baby-health', 'baby-gear'
    ],
    'baby': [
      'baby-care', 'baby-feeding', 'baby-clothing', 'baby-health', 'baby-gear'
    ],
    // alias so sidebar `data-category="grocery"` or `#grocery` shows the same boards
    'grocery': [
      'food-staples-rice', 'food-staples-grains', 'food-staples-ingredients',
      'food-staples-spices', 'food-staples-canned'
    ],
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

// Logistics page: tabs + simple booking form handler
document.addEventListener('DOMContentLoaded', function () {
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const serviceInput = document.getElementById('serviceType');
  const form = document.getElementById('logistics-form');
  const formMessage = document.getElementById('form-message');

  if (tabs.length && serviceInput) {
    tabs.forEach(t => t.addEventListener('click', function () {
      tabs.forEach(x => x.classList.remove('active'));
      this.classList.add('active');
      serviceInput.value = this.dataset.type || 'food';
    }));
  }

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!formMessage) return;
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const phone = (data.get('phone') || '').toString().trim();
    const pickup = (data.get('pickup') || '').toString().trim();
    const dropoff = (data.get('dropoff') || '').toString().trim();

    if (!name || !phone || !pickup || !dropoff) {
      formMessage.style.color = 'crimson';
      formMessage.textContent = 'Please complete the required fields.';
      return;
    }

    // Show friendly success message and reset form (placeholder for real submission)
    formMessage.style.color = 'var(--green)';
    formMessage.textContent = 'Thanks! Pickup requested — our logistics team will contact you shortly.';
    form.reset();
    // keep service type synced to the active tab
    const active = document.querySelector('.tab.active');
    if (serviceInput) serviceInput.value = (active && active.dataset.type) ? active.dataset.type : 'food';

    // Clear message after a few seconds
    setTimeout(() => { if (formMessage) formMessage.textContent = ''; }, 7000);

    // TODO: replace this with a real fetch POST to your backend endpoint
  });
});

// Entrance animations for logistics page elements (staggered)
document.addEventListener('DOMContentLoaded', function () {
  const hero = document.querySelector('.logistics-hero');
  const heading = hero && hero.querySelector('h1');
  const features = Array.from(document.querySelectorAll('.feature'));
  const fadeEls = Array.from(document.querySelectorAll('.fade-in-up'));

  if (heading) {
    heading.classList.add('heading-appear');
    requestAnimationFrame(() => setTimeout(() => heading.classList.add('visible'), 60));
  }

  // stagger features
  features.forEach((f, i) => {
    f.classList.add('fade-in-up');
    setTimeout(() => f.classList.add('visible'), 120 + i * 120);
  });

  // additional fade elements
  fadeEls.forEach((el, i) => setTimeout(() => el.classList.add('visible'), 100 + i * 80));

  // Make the logistics visual participate in the stagger if present
  const visual = document.querySelector('.logistics-visual');
  if (visual) {
    // ensure it has the fade class and schedule its reveal slightly after heading
    visual.classList.add('fade-in-up');
    setTimeout(() => visual.classList.add('visible'), 260);
  }
});

// Dashboard interactions: simple client-side scaffolding for demo data, section routing, and withdraw modal
(function () {
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  const dashboardNav = qsa('.dashboard-nav ul li');
  const sections = qsa('.dashboard-section');
  const recentSalesTable = qs('#recentSalesTable tbody');
  const payoutHistoryTable = qs('#payoutHistoryTable tbody');
  const totalSoldEl = qs('#totalSold');
  const availableBalanceEl = qs('#availableBalance');
  const pendingPayoutsEl = qs('#pendingPayouts');
  const walletAvailableEl = qs('#walletAvailable');

  // Demo data (frontend-only). Replace with real data from your backend.
  const demo = {
    totalSold: 254000,
    available: 42000,
    pending: 12000,
    recentSales: [
      { id: 'ORD-1001', date: '2025-12-20', amount: 12000, status: 'Delivered' },
      { id: 'ORD-1002', date: '2025-12-18', amount: 8000, status: 'Shipped' },
      { id: 'ORD-1003', date: '2025-12-10', amount: 3000, status: 'Cancelled' }
    ],
    payouts: [
      { id: 'P-9001', date: '2025-11-20', amount: 20000, status: 'Paid' },
      { id: 'P-9002', date: '2025-10-05', amount: 15000, status: 'Paid' }
    ]
  };

  function formatCurrency(n) {
    try { return '₦' + Number(n).toLocaleString(); } catch (e) { return '₦' + n; }
  }

  function renderOverview() {
    if (totalSoldEl) totalSoldEl.textContent = formatCurrency(demo.totalSold);
    if (availableBalanceEl) availableBalanceEl.textContent = formatCurrency(demo.available);
    if (pendingPayoutsEl) pendingPayoutsEl.textContent = formatCurrency(demo.pending);
    if (walletAvailableEl) walletAvailableEl.textContent = formatCurrency(demo.available);

    if (recentSalesTable) {
      recentSalesTable.innerHTML = '';
      demo.recentSales.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.id}</td><td>${s.date}</td><td>${formatCurrency(s.amount)}</td><td>${s.status}</td>`;
        recentSalesTable.appendChild(tr);
      });
    }

    if (payoutHistoryTable) {
      payoutHistoryTable.innerHTML = '';
      demo.payouts.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${p.id}</td><td>${p.date}</td><td>${formatCurrency(p.amount)}</td><td>${p.status}</td>`;
        payoutHistoryTable.appendChild(tr);
      });
    }
  }

  function showSection(name) {
    sections.forEach(sec => {
      if (sec.id === 'section-' + name) {
        sec.style.display = '';
        sec.classList.add('active');
      } else {
        sec.style.display = 'none';
        sec.classList.remove('active');
      }
    });
    dashboardNav.forEach(li => li.classList.toggle('active', li.dataset.section === name));
  }

  // Wire nav clicks
  dashboardNav.forEach(li => {
    li.addEventListener('click', function (e) {
      e.preventDefault();
      const s = this.dataset.section || 'overview';
      if (s === 'wallet') {
        // show wallet section id is 'wallet'
        showSection('wallet');
      } else {
        showSection(s);
      }
    });
  });

  // Modal behavior for withdrawal
  const withdrawModal = qs('#withdrawModal');
  const withdrawForm = qs('#withdrawForm');
  const withdrawBtn = qs('#withdrawBtn');
  const requestWithdrawBtn = qs('#requestWithdrawBtn');
  const withdrawMessage = qs('#withdrawMessage');

  function openModal() {
    if (!withdrawModal) return;
    withdrawModal.style.display = 'flex';
    withdrawModal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    if (!withdrawModal) return;
    withdrawModal.style.display = 'none';
    withdrawModal.setAttribute('aria-hidden', 'true');
    if (withdrawMessage) withdrawMessage.textContent = '';
    if (withdrawForm) withdrawForm.reset();
  }

  // attach to quick action buttons
  if (withdrawBtn) withdrawBtn.addEventListener('click', openModal);
  if (requestWithdrawBtn) requestWithdrawBtn.addEventListener('click', openModal);

  // modal close controls
  qsa('.modal-close').forEach(btn => btn.addEventListener('click', closeModal));
  if (withdrawModal) withdrawModal.addEventListener('click', function (e) {
    if (e.target === withdrawModal) closeModal();
  });

  // dynamic payout details UI in modal
  const payoutDetails = qs('#payoutDetails');
  if (withdrawForm) {
    withdrawForm.method.value = withdrawForm.method.value || 'bank';
    function renderPayoutFields(method) {
      if (!payoutDetails) return;
      payoutDetails.innerHTML = '';
      if (method === 'bank') {
        payoutDetails.innerHTML = `\n              <label>Bank Name\n                <input name="bank" required />\n              </label>\n              <label>Account Number\n                <input name="account" required />\n              </label>\n            `;
      } else {
        payoutDetails.innerHTML = `\n              <label>Mobile Money Number\n                <input name="mobile" required />\n              </label>\n              <label>Network\n                <select name="network">\n                  <option>MTN</option>\n                  <option>Glo</option>\n                  <option>Airtel</option>\n                </select>\n              </label>\n            `;
      }
    }

    renderPayoutFields(withdrawForm.method.value);
    withdrawForm.method.addEventListener('change', function () { renderPayoutFields(this.value); });

    withdrawForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(withdrawForm);
      const amount = Number(fd.get('amount') || 0);
      const min = 1000; // minimum withdrawal threshold (frontend only)
      if (amount < min) {
        if (withdrawMessage) {
          withdrawMessage.style.color = 'crimson';
          withdrawMessage.textContent = `Minimum withdrawal is ₦${min.toLocaleString()}`;
        }
        return;
      }

      // Demo: pretend to submit to server and update UI
      if (withdrawMessage) {
        withdrawMessage.style.color = 'var(--green)';
        withdrawMessage.textContent = 'Withdrawal request sent. Processing...';
      }

      // Update demo balances locally
      demo.available = Math.max(0, demo.available - amount);
      demo.payouts.unshift({ id: 'P-' + Math.floor(Math.random() * 9000 + 1000), date: new Date().toISOString().slice(0,10), amount: amount, status: 'Pending' });
      renderOverview();

      setTimeout(() => {
        if (withdrawMessage) withdrawMessage.textContent = 'Request received. You will be notified when payout is complete.';
        // close modal after a short delay
        setTimeout(closeModal, 1600);
      }, 700);

      // TODO: send to your server via fetch POST, handle validation and errors
    });
  }

  // initialize
  renderOverview();
  showSection('overview');
})();
