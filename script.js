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
