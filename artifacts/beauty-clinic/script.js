/* ════════════════════════════════════════════
   LUMIÈRE AESTHETIC CLINIC — MAIN SCRIPT
   Vanilla JS, no dependencies
   ════════════════════════════════════════════ */

'use strict';

/* ── Utility ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ════════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════════ */
function initNavbar() {
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');
  const navLinkItems = $$('.nav-link');

  // Scroll state
  const handleScroll = () => {
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('scrolled', scrolled);

    // Update active link based on section in view
    const sections = $$('section[id]');
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });

    navLinkItems.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ════════════════════════════════════════════
   SCROLL REVEAL ANIMATIONS
   ════════════════════════════════════════════ */
function initScrollReveal() {
  const elements = $$('.reveal, .reveal-left, .reveal-right');

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        setTimeout(() => {
          el.classList.add('visible');
        }, Number(delay));
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════
   ANIMATED COUNTERS
   ════════════════════════════════════════════ */
function initCounters() {
  const counters = $$('.stat-number[data-target]');
  if (!counters.length) return;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════
   TESTIMONIALS SLIDER
   ════════════════════════════════════════════ */
function initTestimonialsSlider() {
  const track = $('#testimonialsTrack');
  const prevBtn = $('#testimPrev');
  const nextBtn = $('#testimNext');
  const dotsContainer = $('#testimDots');

  if (!track) return;

  const cards = $$('.testimonial-card', track);
  const total = cards.length;
  let current = 0;
  let autoTimer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function getCardWidth() {
    if (!cards[0]) return 0;
    const style = getComputedStyle(track);
    const gap = parseInt(style.gap || '24', 10);
    return cards[0].offsetWidth + gap;
  }

  function updateDots() {
    $$('.slider-dot', dotsContainer).forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    updateDots();
  }

  prevBtn?.addEventListener('click', () => {
    goTo(current - 1);
    resetAutoPlay();
  });

  nextBtn?.addEventListener('click', () => {
    goTo(current + 1);
    resetAutoPlay();
  });

  // Touch/swipe
  let startX = 0;
  let dragging = false;

  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    dragging = true;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (!dragging) return;
    const delta = startX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? goTo(current + 1) : goTo(current - 1);
    }
    dragging = false;
    resetAutoPlay();
  }, { passive: true });

  // Auto play
  function startAutoPlay() {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoTimer);
    startAutoPlay();
  }

  // Update on resize
  window.addEventListener('resize', debounce(() => goTo(current), 200));

  startAutoPlay();
  goTo(0);
}

/* ════════════════════════════════════════════
   BEFORE/AFTER SLIDERS
   ════════════════════════════════════════════ */
function initBASliders() {
  const sliders = $$('[data-slider]');

  sliders.forEach(slider => {
    const afterEl = $('.ba-after', slider);
    const handle = $('.ba-handle', slider);
    let active = false;
    let pct = 50;

    function update(x) {
      const rect = slider.getBoundingClientRect();
      pct = Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100));
      afterEl.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = `${pct}%`;
    }

    // Mouse
    slider.addEventListener('mousedown', e => {
      active = true;
      update(e.clientX);
      e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
      if (active) update(e.clientX);
    });

    window.addEventListener('mouseup', () => { active = false; });

    // Touch
    slider.addEventListener('touchstart', e => {
      active = true;
      update(e.touches[0].clientX);
    }, { passive: true });

    slider.addEventListener('touchmove', e => {
      if (active) update(e.touches[0].clientX);
    }, { passive: true });

    slider.addEventListener('touchend', () => { active = false; });

    // Initial position
    afterEl.style.clipPath = `inset(0 50% 0 0)`;
    handle.style.left = '50%';
    handle.style.transform = 'translateX(-50%)';
  });
}

/* ════════════════════════════════════════════
   GALLERY FILTER TABS
   ════════════════════════════════════════════ */
function initGalleryTabs() {
  const tabs = $$('.gallery-tab');
  const items = $$('.gallery-item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.tab;

      items.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (show) {
          item.classList.remove('hidden');
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 10);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
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
  const form = $('#bookingForm');
  const success = $('#formSuccess');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      form.style.opacity = '0';
      form.style.transform = 'translateY(10px)';
      form.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

      setTimeout(() => {
        form.style.display = 'none';
        success.style.display = 'block';
        success.style.opacity = '0';
        success.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => {
          success.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          success.style.opacity = '1';
          success.style.transform = 'translateY(0)';
        });
      }, 400);
    }, 1200);
  });
}

/* ════════════════════════════════════════════
   NEWSLETTER FORM
   ════════════════════════════════════════════ */
function initNewsletterForm() {
  const form = $('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const btn = form.querySelector('button');

    btn.textContent = '✓';
    btn.style.background = '#059669';
    input.value = '';
    input.placeholder = 'Subscribed!';

    setTimeout(() => {
      btn.textContent = 'Subscribe';
      btn.style.background = '';
      input.placeholder = 'your@email.com';
    }, 3000);
  });
}

/* ════════════════════════════════════════════
   BACK TO TOP
   ════════════════════════════════════════════ */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ════════════════════════════════════════════
   SMOOTH SCROLL
   ════════════════════════════════════════════ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navH + 1;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ════════════════════════════════════════════
   HERO PARALLAX (subtle)
   ════════════════════════════════════════════ */
function initParallax() {
  const orbs = $$('.hero-orb');
  if (!orbs.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        orbs[0] && (orbs[0].style.transform = `translateY(${scrollY * 0.2}px)`);
        orbs[1] && (orbs[1].style.transform = `translateY(${scrollY * -0.15}px)`);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ════════════════════════════════════════════
   CURSOR GLOW (desktop)
   ════════════════════════════════════════════ */
function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip mobile

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.06), transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  let visible = false;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    if (!visible) { glow.style.opacity = '1'; visible = true; }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    visible = false;
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
  initNewsletterForm();
  initBackToTop();
  initSmoothScroll();
  initParallax();
  initCursorGlow();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
