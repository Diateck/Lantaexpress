// Global small-screen + spinner helpers
function isSmallScreen() { return window.innerWidth <= 600; }

function createSpinner() {
  if (document.getElementById('global-spinner')) return;
  const s = document.createElement('div');
  s.id = 'global-spinner';
  s.setAttribute('aria-hidden', 'true');
  s.style.position = 'fixed';
  s.style.left = '0';
  s.style.top = '0';
  s.style.right = '0';
  s.style.bottom = '0';
  s.style.display = 'flex';
  s.style.alignItems = 'center';
  s.style.justifyContent = 'center';
  s.style.background = 'rgba(0,0,0,0.35)';
  s.style.zIndex = '99999';
  s.innerHTML = '<div style="width:56px;height:56px;border-radius:50%;border:6px solid rgba(255,255,255,0.65);border-top-color:var(--green,#00886a);box-shadow:0 2px 8px rgba(0,0,0,0.12);animation:gx-spin 1s linear infinite"></div>';
  if (!document.getElementById('global-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'global-spinner-style';
    style.textContent = '@keyframes gx-spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(style);
  }
  document.body.appendChild(s);
}

function removeSpinner() {
  const el = document.getElementById('global-spinner');
  if (el) el.parentNode.removeChild(el);
}

// Show spinner for navigation clicks on small screens (captures early)
document.addEventListener('click', function (ev) {
  try {
    if (!isSmallScreen()) return;
    const el = ev.target && ev.target.closest ? ev.target.closest('a,button') : null;
    if (!el) return;
    if (el.hasAttribute && el.hasAttribute('data-no-spinner')) return;
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') || '';
      const lower = href.toLowerCase();
      if (!href) return;
      if (lower.startsWith('#') || lower.startsWith('mailto:') || lower.startsWith('tel:')) return;
      if (el.target === '_blank' || el.hasAttribute('download')) return;
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
      } catch (e) { return; }
      createSpinner();
      setTimeout(removeSpinner, 4000);
    }
    if (el.tagName === 'BUTTON') {
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (type === 'submit' || type === '') return;
      if (el.hasAttribute('formaction') || el.dataset.href) {
        createSpinner();
        setTimeout(removeSpinner, 4000);
      }
    }
  } catch (err) { console.warn('spinner click handler error', err); }
}, true);

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

    const axTotal = document.getElementById('ax-total-sales');
    const axOrders = document.getElementById('ax-orders');
    const axAvailable = document.getElementById('ax-available');
    const axConversion = document.getElementById('ax-conversion');
    const axChart = document.getElementById('ax-sales-chart');
    const axOrdersTable = document.querySelector('#ax-orders-table tbody');
    const axProductsList = document.getElementById('ax-products-list');

    if (!axTotal && !axChart) return; // not on dashboard

    // Demo dataset (frontend-only)
    const axDemo = {
      totalSales: 180500,
      orders: 128,
      available: 42000,
      conversion: 2.4,
      daily: Array.from({length:30}, (_,i)=> Math.round(1500 + Math.sin(i/4)*600 + Math.random()*900)),
      recentOrders: [
        {id:'ORD-201', date:'2026-01-01', amount:12000, status:'Delivered'},
        {id:'ORD-200', date:'2025-12-29', amount:8500, status:'Shipped'},
        {id:'ORD-199', date:'2025-12-21', amount:4300, status:'Processing'}
      ],
      products: [
        {name:'Portable Speaker', price:7500, img:'assets/powerbanks.jpg'},
        {name:'Wireless Charger', price:4200, img:'assets/powerbanks.jpg'},
        {name:'Phone Case', price:900, img:'assets/powerbanks.jpg'}
      ]
    };

    function formatN(n){ return '₦' + Number(n).toLocaleString(); }

    // fill KPI values (simple text; animation can be added later)
    if (axTotal) axTotal.textContent = formatN(axDemo.totalSales);
    if (axOrders) axOrders.textContent = String(axDemo.orders);
    if (axAvailable) axAvailable.textContent = formatN(axDemo.available);
    if (axConversion) axConversion.textContent = String(axDemo.conversion) + '%';

    // populate orders table
    if (axOrdersTable) {
      axOrdersTable.innerHTML = '';
      axDemo.recentOrders.forEach(o => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${o.id}</td><td>${o.date}</td><td>${formatN(o.amount)}</td><td>${o.status}</td>`;
        axOrdersTable.appendChild(tr);
      });
    }

    // products list
    if (axProductsList) {
      axProductsList.innerHTML = '';
      axDemo.products.forEach(p => {
        const el = document.createElement('div'); el.className = 'ax-product';
        el.innerHTML = `<img src="${p.img}" alt="${p.name}"><div style="margin-top:.45rem;font-weight:600">${p.name}</div><div class="muted">${formatN(p.price)}</div>`;
        axProductsList.appendChild(el);
      });
    }

    // lightweight SVG area chart renderer
    function drawAxChart(){
      if (!axChart) return;
      const w = Math.max(320, axChart.clientWidth || 640);
      const h = Math.max(120, axChart.clientHeight || 200);
      const data = axDemo.daily;
      const max = Math.max(...data);
      const pad = 12; const step = (w - pad*2) / (data.length - 1);
      let path='';
      data.forEach((v,i)=>{ const x = pad + i*step; const y = pad + (1 - v/max) * (h - pad*2); path += (i===0?'M':' L') + x.toFixed(1) + ' ' + y.toFixed(1); });
      const area = path + ` L ${w-pad} ${h-pad} L ${pad} ${h-pad} Z`;
      const svg = ` <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`+
        `<defs><linearGradient id="axG" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="rgba(0,136,106,0.12)"/><stop offset="100%" stop-color="rgba(0,136,106,0.02)"/></linearGradient></defs>`+
        `<path d="${area}" fill="url(#axG)" stroke="none"/>`+
        `<path d="${path}" fill="none" stroke="var(--green)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`+
        `</svg>`;
      axChart.innerHTML = svg;
    }

    window.addEventListener('resize', drawAxChart);
    // Defer initial chart draw to avoid blocking initial paint — use idle callback when available
    if ('requestIdleCallback' in window) requestIdleCallback(drawAxChart, { timeout: 500 });
    else setTimeout(drawAxChart, 120);

    // Optimize category images for faster first paint on mobile/slow networks
    function optimizeCategoryImages() {
      try {
        const imgs = document.querySelectorAll('.category-section img');
        imgs.forEach(img => {
          try { img.loading = 'lazy'; img.decoding = 'async'; } catch (e) {}
        });
      } catch (e) { /* ignore */ }
    }
    if (document.readyState !== 'loading') optimizeCategoryImages();
    else document.addEventListener('DOMContentLoaded', optimizeCategoryImages);

    // sidebar mobile behavior: convert to horizontal tabs on small screens (CSS handles most)
    const sidebarItems = Array.from(document.querySelectorAll('.ax-sidebar nav ul li'));
    sidebarItems.forEach(li => li.addEventListener('click', () => {
      sidebarItems.forEach(x => x.classList.remove('active'));
      li.classList.add('active');
      // future: toggle sections by data-section
    }));
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
  console.debug('items: category init', { sidebarLinks: sidebarLinks.length, sections: sections.length });

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
    console.debug('items: showCategory()', cat);
    clearActiveSections();
    const toShow = mapping[cat] || [cat];
    // Always include the 'appliances' (All Products) board so it's visible across categories
    const combined = Array.from(new Set([].concat(toShow, ['appliances'])));
    combined.forEach(k => {
      const els = Array.from(document.querySelectorAll(`.category-section[data-category="${k}"]`));
      els.forEach(el => el.classList.add('active'));
      if (els.length) console.debug('items: activated category', k, els.length);
      else console.debug('items: no section found for', k);
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
  console.debug('items: init params', { qCat, initialHash });
  if (qCat) {
    // keep URL consistent by replacing the hash (so back/forward still works with hashchange)
    history.replaceState(null, '', '#' + qCat);
    showCategory(qCat);
  } else if (initialHash) showCategory(initialHash);
  else {
    const activeAnchor = document.querySelector('.sidebar li.active a[data-category]');
    const defaultCat = activeAnchor ? activeAnchor.dataset.category : (sidebarLinks[0] && sidebarLinks[0].dataset.category);
    console.debug('items: defaultCat', defaultCat);
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

/* ====================
   Account / Dashboard JS
   (All account-related scripts live here; runs only when `#account-dashboard` exists)
   ==================== */
function initAccountPage() {
  const root = document.getElementById('account-dashboard');
  if (!root) return; // not on account page

  // Demo current user (in production replace with server-provided user object)
  const currentUser = window.currentUser || { name: 'Jane Doe', role: 'buyer', avatar: '', email: 'jane@example.com' };

  // Elements
  const sidebar = root.querySelector('.ax-sidebar');
  const main = root.querySelector('.ax-main');
  const topBar = root.querySelector('.ax-topbar');

  // Build sidebar items based on role
  function buildSidebar() {
    const items = [
      { id: 'overview', label: 'Home / Overview' },
      { id: 'messages', label: 'Messages' }
    ];

    // Profile & Settings with dropdown
    items.push({ id: 'profile', label: 'Profile & Settings', children: [
      { id: 'account-info', label: 'Account Info' },
      { id: 'change-password', label: 'Change Password' },
      { id: 'payment-methods', label: 'Payment Methods' },
      { id: 'address-book', label: 'Address Book' }
    ]});

    if (currentUser.role === 'buyer') {
      items.push({ id: 'orders', label: 'Orders', children: [
        { id: 'orders-pending', label: 'Pending Orders' },
        { id: 'orders-completed', label: 'Completed Orders' },
        { id: 'orders-cancelled', label: 'Cancelled Orders' }
      ]});
      items.push({ id: 'wishlist', label: 'Wishlist' });
    }

    if (currentUser.role === 'seller') {
      items.push({ id: 'products', label: 'Products / Inventory', children: [
        { id: 'products-all', label: 'All Products' },
        { id: 'products-add', label: 'Add New Product' },
        { id: 'products-low', label: 'Low Stock Products' }
      ]});
      items.push({ id: 'sales', label: 'Sales / Orders', children: [
        { id: 'sales-pending', label: 'Pending Orders' },
        { id: 'sales-completed', label: 'Completed Orders' },
        { id: 'sales-returned', label: 'Returned Orders' }
      ]});
      items.push({ id: 'wallet', label: 'Wallet & Withdrawal', children: [
        { id: 'wallet-balance', label: 'Wallet Balance' },
        { id: 'wallet-requests', label: 'Withdrawal Requests' }
      ]});
      items.push({ id: 'analytics', label: 'Analytics' });
      items.push({ id: 'promos', label: 'Promotions / Discounts', children: [
        { id: 'promos-active', label: 'Active Promotions' },
        { id: 'promos-create', label: 'Create New Promo' }
      ]});
    }

    // Render
    sidebar.innerHTML = '<nav class="ax-side-nav"><ul></ul></nav>';
    const ul = sidebar.querySelector('ul');
    items.forEach(it => {
      const li = document.createElement('li'); li.className = 'ax-side-item';
      const a = document.createElement('a'); a.href = '#'+it.id; a.textContent = it.label; a.dataset.id = it.id; a.className = 'ax-side-link';
      li.appendChild(a);
      if (it.children) {
        const sub = document.createElement('ul'); sub.className = 'ax-side-sub';
        it.children.forEach(c => { const cli = document.createElement('li'); const ca = document.createElement('a'); ca.href = '#'+c.id; ca.textContent = c.label; ca.dataset.id = c.id; ca.className='ax-side-link-sub'; cli.appendChild(ca); sub.appendChild(cli); });
        li.appendChild(sub);
        // toggler
        a.addEventListener('click', (e) => { e.preventDefault(); li.classList.toggle('open'); });
      } else {
        a.addEventListener('click', (e) => { e.preventDefault(); activateSection(it.id); });
      }
      ul.appendChild(li);
    });
  }

  // Activate a named section panel inside main
  function activateSection(id) {
    // Hide existing
    main.querySelectorAll('.ax-section').forEach(s => s.style.display = 'none');
    const panel = main.querySelector('[data-section="'+id+'"]');
    if (panel) panel.style.display = '';
  }

  // Render main default panels and widgets
  function buildMain() {
    main.innerHTML = `
      <div class="ax-topbar-row"><div class="ax-welcome">Welcome, ${currentUser.name}</div><div class="ax-actions"><input id="ax-search" placeholder="Search orders, products..."/></div></div>
      <div class="ax-cards">
        <div class="ax-card" data-widget="kpi1"><div class="ax-card-title">Pending Orders</div><div class="ax-card-value" id="kpi-pending">0</div></div>
        <div class="ax-card" data-widget="kpi2"><div class="ax-card-title">Wishlist</div><div class="ax-card-value" id="kpi-wish">0</div></div>
        <div class="ax-card" data-widget="kpi3"><div class="ax-card-title">Recent Viewed</div><div class="ax-card-value" id="kpi-recent">0</div></div>
      </div>

      <div class="ax-sections">
        <section class="ax-section" data-section="overview" style="display:block">
          <h3>Overview</h3>
          <div id="ax-overview-chart" style="min-height:140px"></div>
        </section>
        <section class="ax-section" data-section="orders" style="display:none">
          <h3>Orders</h3>
          <div id="ax-orders-table">Loading orders...</div>
        </section>
        <section class="ax-section" data-section="products" style="display:none">
          <h3>Products</h3>
          <div id="ax-products-table">Loading products...</div>
        </section>
      </div>
    `;

    // Fill demo KPIs and tables after small delay to show loading state
    setTimeout(() => {
      const demo = {
        pending: 4,
        wishlist: 12,
        recent: 7,
        orders: [
          {id:'ORD-300', product:'Portable Speaker', status:'Pending'},
          {id:'ORD-299', product:'Phone Case', status:'Shipped'}
        ],
        products: [
          {name:'Portable Speaker', stock:12, price:7500},
          {name:'Wireless Charger', stock:3, price:4200}
        ]
      };
      const kp = document.getElementById('kpi-pending'); if (kp) kp.textContent = String(demo.pending);
      const kw = document.getElementById('kpi-wish'); if (kw) kw.textContent = String(demo.wishlist);
      const kr = document.getElementById('kpi-recent'); if (kr) kr.textContent = String(demo.recent);

      const ot = document.getElementById('ax-orders-table'); if (ot) {
        const t = document.createElement('table'); t.className='ax-table'; t.innerHTML = '<thead><tr><th>OrderID</th><th>Product</th><th>Status</th><th>Action</th></tr></thead>';
        const tb = document.createElement('tbody'); demo.orders.forEach(o => { const tr=document.createElement('tr'); tr.innerHTML=`<td>${o.id}</td><td>${o.product}</td><td>${o.status}</td><td><button class='ax-btn' data-order='${o.id}'>View</button></td>`; tb.appendChild(tr); }); t.appendChild(tb); ot.innerHTML=''; ot.appendChild(t);
      }

      const pt = document.getElementById('ax-products-table'); if (pt) {
        const t = document.createElement('table'); t.className='ax-table'; t.innerHTML = '<thead><tr><th>Product</th><th>Stock</th><th>Price</th><th>Actions</th></tr></thead>';
        const tb = document.createElement('tbody'); demo.products.forEach(p => { const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.name}</td><td>${p.stock}</td><td>${p.price}</td><td><button class='ax-btn'>Edit</button></td>`; tb.appendChild(tr); }); t.appendChild(tb); pt.innerHTML=''; pt.appendChild(t);
      }

      // draw a tiny sparkline chart
      const ch = document.getElementById('ax-overview-chart'); if (ch) {
        const w = Math.max(320, ch.clientWidth || 480); const h = 120; const data = Array.from({length:20}, ()=>Math.round(400+Math.random()*800)); const max=Math.max(...data); const pad=6; const step=(w-pad*2)/(data.length-1); let path=''; data.forEach((v,i)=>{ const x=pad+i*step; const y=pad+(1-(v/max))*(h-pad*2); path += (i===0? 'M':' L')+x.toFixed(1)+' '+y.toFixed(1); }); const area = path+` L ${w-pad} ${h-pad} L ${pad} ${h-pad} Z`; ch.innerHTML = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="axG2" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="rgba(0,136,106,0.14)"/><stop offset="100%" stop-color="rgba(0,136,106,0.02)"/></linearGradient></defs><path d="${area}" fill="url(#axG2)" stroke="none"/><path d="${path}" fill="none" stroke="var(--green)" stroke-width="2"/></svg>`;
      }

    }, 350);
  }

  // Wire up responsive sidebar collapse
  function wireSidebarToggle() {
    const btn = root.querySelector('.ax-sidebar-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => root.classList.toggle('ax-sidebar-collapsed'));
  }

  // Init sequence
  buildSidebar(); buildMain(); wireSidebarToggle();
  // show initial overview
  activateSection('overview');
}

// Run account init when page is ready
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAccountPage); else initAccountPage();
