// Mobile menu toggle for responsive nav
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav ul');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('show');
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
