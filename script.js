// Slide-in animation for featured items on mobile
document.addEventListener('DOMContentLoaded', function () {
  function isMobile() {
    return window.innerWidth <= 600;
  }
  function animateFeaturedItems() {
    if (!isMobile()) return;
    const cards = document.querySelectorAll('.item-cards .item-card');
    const triggerBottom = window.innerHeight * 0.95;
    cards.forEach((card, idx) => {
      const cardTop = card.getBoundingClientRect().top;
      if (cardTop < triggerBottom) {
        if ((idx + 1) % 2 === 0) {
          card.classList.add('slide-in-left');
        } else {
          card.classList.add('slide-in-right');
        }
      }
    });
  }
  window.addEventListener('scroll', animateFeaturedItems);
  window.addEventListener('resize', animateFeaturedItems);
  animateFeaturedItems();
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
