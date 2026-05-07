/* ════════════════════════════════════════════
   LUMIÈRE AESTHETIC CLINIC — SCRIPT v2
   Vanilla JS — no dependencies
   ════════════════════════════════════════════ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, delay = 100) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); };
}

/* ════════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════════ */
function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');
  const links     = $$('.nav-link');

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Active link tracking
    const sections = $$('section[id]');
    let active = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) active = s.id;
    });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${active}`));
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.forEach(l => l.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }));

  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ════════════════════════════════════════════
   SCROLL REVEAL
   ════════════════════════════════════════════ */
function initScrollReveal() {
  const els = $$('.reveal, .reveal-left, .reveal-right, .reveal-up');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      const delay = Number(target.dataset.delay || 0);
      setTimeout(() => target.classList.add('visible'), delay);
      io.unobserve(target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => io.observe(el));
}

/* ════════════════════════════════════════════
   ANIMATED COUNTERS
   ════════════════════════════════════════════ */
function initCounters() {
  const counters = $$('.stat-number[data-target]');
  if (!counters.length) return;

  const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

  const animate = el => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2200;
    const start    = performance.now();
    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOutExpo(p) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      animate(target);
      io.unobserve(target);
    });
  }, { threshold: 0.6 });

  counters.forEach(el => io.observe(el));
}

/* ════════════════════════════════════════════
   TESTIMONIALS SLIDER
   ════════════════════════════════════════════ */
function initTestimonialsSlider() {
  const track = $('#testimonialsTrack');
  const prev  = $('#testimPrev');
  const next  = $('#testimNext');
  const dotsEl = $('#testimDots');
  if (!track) return;

  const cards = $$('.testimonial-card', track);
  const total = cards.length;
  let cur = 0, autoTimer;

  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => { goTo(i); resetAuto(); });
    dotsEl.appendChild(d);
  });

  function cardWidth() {
    if (!cards[0]) return 0;
    const gap = parseInt(getComputedStyle(track).gap || '24', 10);
    return cards[0].offsetWidth + gap;
  }

  function goTo(idx) {
    cur = (idx + total) % total;
    track.style.transform = `translateX(-${cur * cardWidth()}px)`;
    $$('.slider-dot', dotsEl).forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  function startAuto() { autoTimer = setInterval(() => goTo(cur + 1), 5500); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  prev?.addEventListener('click', () => { goTo(cur - 1); resetAuto(); });
  next?.addEventListener('click', () => { goTo(cur + 1); resetAuto(); });

  // Touch swipe
  let sx = 0;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = sx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 44) { dx > 0 ? goTo(cur + 1) : goTo(cur - 1); resetAuto(); }
  }, { passive: true });

  window.addEventListener('resize', debounce(() => goTo(cur), 150));
  startAuto();
  goTo(0);
}

/* ════════════════════════════════════════════
   BEFORE / AFTER SLIDERS
   ════════════════════════════════════════════ */
function initBASliders() {
  $$('[data-slider]').forEach(slider => {
    const after  = $('.ba-after', slider);
    const handle = $('.ba-handle', slider);
    let active = false;

    function update(x) {
      const rect = slider.getBoundingClientRect();
      const pct  = Math.max(4, Math.min(96, ((x - rect.left) / rect.width) * 100));
      after.style.clipPath    = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left       = `${pct}%`;
      handle.style.transform  = 'translateX(-50%)';
    }

    slider.addEventListener('mousedown', e => { active = true; update(e.clientX); e.preventDefault(); });
    window.addEventListener('mousemove', e => { if (active) update(e.clientX); });
    window.addEventListener('mouseup', () => { active = false; });

    slider.addEventListener('touchstart', e => { active = true; update(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchmove',  e => { if (active) update(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchend', () => { active = false; });

    // Init at 50%
    after.style.clipPath   = 'inset(0 50% 0 0)';
    handle.style.left      = '50%';
    handle.style.transform = 'translateX(-50%)';
  });
}

/* ════════════════════════════════════════════
   GALLERY FILTER TABS
   ════════════════════════════════════════════ */
function initGalleryTabs() {
  const tabs  = $$('.gallery-tab');
  const items = $$('.gallery-item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.tab;
      items.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        if (show) {
          item.classList.remove('hidden');
          item.style.opacity = '0';
          item.style.transform = 'scale(0.96) translateY(8px)';
          requestAnimationFrame(() => {
            item.style.transition = 'opacity .4s ease, transform .4s ease';
            item.style.opacity = '1';
            item.style.transform = 'scale(1) translateY(0)';
          });
        } else {
          item.style.transition = 'opacity .3s ease, transform .3s ease';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.94) translateY(6px)';
          setTimeout(() => item.classList.add('hidden'), 300);
        }
      });
    });
  });
}

/* ════════════════════════════════════════════
   BOOKING FORM
   ════════════════════════════════════════════ */
function initBookingForm() {
  const form    = $('#bookingForm');
  const success = $('#formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.style.cssText = 'opacity:0;transform:translateY(10px);transition:.4s ease;';
      setTimeout(() => {
        form.style.display = 'none';
        success.style.display = 'block';
        success.style.cssText = 'display:block;opacity:0;transform:translateY(10px);';
        requestAnimationFrame(() => {
          success.style.cssText = 'display:block;opacity:1;transform:translateY(0);transition:.5s ease;';
        });
      }, 420);
    }, 1200);
  });
}

/* ════════════════════════════════════════════
   NEWSLETTER FORM
   ════════════════════════════════════════════ */
function initNlForm() {
  const form = $('#nlForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const btn   = form.querySelector('button');
    const orig  = btn.textContent;
    btn.textContent = '✓ Done';
    btn.style.background = 'linear-gradient(135deg, #059669, #34D399)';
    input.value = '';
    input.placeholder = 'Subscribed! Thank you ✦';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      input.placeholder = 'your@email.com';
    }, 3500);
  });
}

/* ════════════════════════════════════════════
   BACK TO TOP
   ════════════════════════════════════════════ */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ════════════════════════════════════════════
   SMOOTH SCROLL (for browsers that need it)
   ════════════════════════════════════════════ */
function initSmoothScroll() {
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 84;
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - navH + 1, behavior: 'smooth' });
    });
  });
}

/* ════════════════════════════════════════════
   PARALLAX ORBS (hero)
   ════════════════════════════════════════════ */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const orbs = $$('.hero-orb');
  if (!orbs.length) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      orbs[0]?.style.setProperty('transform', `translateY(${y * 0.22}px)`);
      orbs[1]?.style.setProperty('transform', `translateY(${y * -0.14}px)`);
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

/* ════════════════════════════════════════════
   CURSOR GLOW (desktop only)
   ════════════════════════════════════════════ */
function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position: 'fixed', pointerEvents: 'none', zIndex: '9999',
    width: '340px', height: '340px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(200,168,75,.055) 0%, transparent 68%)',
    transform: 'translate(-50%, -50%)',
    transition: 'opacity .4s ease',
    opacity: '0',
  });
  document.body.appendChild(glow);

  let visible = false;
  document.addEventListener('mousemove', ({ clientX, clientY }) => {
    glow.style.left = clientX + 'px';
    glow.style.top  = clientY + 'px';
    if (!visible) { glow.style.opacity = '1'; visible = true; }
  }, { passive: true });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; visible = false; });
}

/* ════════════════════════════════════════════
   SERVICE CARD TILT (subtle, desktop only)
   ════════════════════════════════════════════ */
function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  $$('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const x   = ((e.clientX - r.left) / r.width  - 0.5) * 6;
      const y   = ((e.clientY - r.top)  / r.height - 0.5) * -6;
      card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════ */
function init() {
  initNavbar();
  initScrollReveal();
  initCounters();
  initTestimonialsSlider();
  initBASliders();
  initGalleryTabs();
  initBookingForm();
  initNlForm();
  initBackToTop();
  initSmoothScroll();
  initParallax();
  initCursorGlow();
  initCardTilt();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
