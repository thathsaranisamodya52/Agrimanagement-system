// Mobile menu toggle
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => menu.classList.toggle('open'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

// Active nav link on scroll
const links = [...menu.querySelectorAll('a')];
const sections = links.map(a => document.querySelector(a.getAttribute('href')));
window.addEventListener('scroll', () => {
  const y = window.scrollY + 120;
  let idx = 0;
  sections.forEach((s, i) => { if (s && s.offsetTop <= y) idx = i; });
  links.forEach((a, i) => a.classList.toggle('active', i === idx));
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
