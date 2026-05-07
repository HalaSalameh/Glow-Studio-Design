/* ═══════════════════════════════════════════
   QM GLOW CENTER — Main Script
   Vanilla JS — no dependencies
═══════════════════════════════════════════ */

'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const debounce = (fn, d = 80) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d); }; };

/* ═══════════════════════════════
   NAVBAR
═══════════════════════════════ */
function initNavbar() {
  const nav   = $('#mainNav');
  const links = $$('.qm-link');

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 60);

    let active = '';
    $$('section[id]').forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) active = s.id;
    });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${active}`));
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Bootstrap handles mobile toggle — just ensure hamburger animates
  const toggler = $('.qm-toggler');
  const menu    = $('#navMenu');
  if (toggler && menu) {
    menu.addEventListener('show.bs.collapse', () => toggler.setAttribute('aria-expanded', 'true'));
    menu.addEventListener('hide.bs.collapse', () => toggler.setAttribute('aria-expanded', 'false'));
  }

  // Close mobile nav on link click
  links.forEach(l => l.addEventListener('click', () => {
    const c = bootstrap.Collapse.getInstance(menu);
    if (c) c.hide();
  }));
}

/* ═══════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════ */
function initSmoothScroll() {
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 80;
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - navH + 1, behavior: 'smooth' });
    });
  });
}

/* ═══════════════════════════════
   SCROLL REVEAL
═══════════════════════════════ */
function initReveal() {
  const els = $$('.anim-reveal, .anim-reveal-left, .anim-reveal-right');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      const delay = Number(target.dataset.delay || 0);
      setTimeout(() => target.classList.add('in'), delay);
      io.unobserve(target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

/* ═══════════════════════════════
   ANIMATED COUNTERS
═══════════════════════════════ */
function initCounters() {
  const counters = $$('.stat-n[data-target]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 4);

  const run = el => {
    const target = parseInt(el.dataset.target, 10);
    const dur    = 2000;
    const t0     = performance.now();
    const step   = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(easeOut(p) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      run(target);
      io.unobserve(target);
    });
  }, { threshold: 0.6 });

  counters.forEach(el => io.observe(el));
}

/* ═══════════════════════════════
   TESTIMONIALS SLIDER
═══════════════════════════════ */
function initTestimonials() {
  const track   = $('#testiTrack');
  const prev    = $('#testiPrev');
  const next    = $('#testiNext');
  const dotsEl  = $('#testiDots');
  if (!track) return;

  const cards = $$('.testi-card', track);
  const total = cards.length;
  let cur = 0, timer;

  // Build dots
  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'testi-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsEl.appendChild(d);
  });

  function cardW() {
    return cards[0] ? cards[0].offsetWidth + parseInt(getComputedStyle(track).gap || '24', 10) : 0;
  }

  function goTo(idx) {
    cur = (idx + total) % total;
    track.style.transform = `translateX(-${cur * cardW()}px)`;
    $$('.testi-dot', dotsEl).forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  function startTimer() { timer = setInterval(() => goTo(cur + 1), 5500); }
  function resetTimer()  { clearInterval(timer); startTimer(); }

  prev?.addEventListener('click', () => { goTo(cur - 1); resetTimer(); });
  next?.addEventListener('click', () => { goTo(cur + 1); resetTimer(); });

  // Swipe
  let sx = 0;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = sx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 44) { dx > 0 ? goTo(cur + 1) : goTo(cur - 1); resetTimer(); }
  }, { passive: true });

  window.addEventListener('resize', debounce(() => goTo(cur), 150));
  startTimer();
  goTo(0);
}

/* ═══════════════════════════════
   BEFORE / AFTER SLIDERS
═══════════════════════════════ */
function initBASliders() {
  $$('[data-slider]').forEach(slider => {
    const after  = $('.ba-after', slider);
    const handle = $('.ba-handle', slider);
    let active = false;

    function update(x) {
      const r   = slider.getBoundingClientRect();
      const pct = Math.max(4, Math.min(96, ((x - r.left) / r.width) * 100));
      after.style.clipPath   = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left      = `${pct}%`;
      handle.style.transform = 'translateX(-50%)';
    }

    slider.addEventListener('mousedown', e => { active = true; update(e.clientX); e.preventDefault(); });
    window.addEventListener('mousemove', e => { if (active) update(e.clientX); });
    window.addEventListener('mouseup', () => { active = false; });

    slider.addEventListener('touchstart', e => { active = true; update(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchmove',  e => { if (active) update(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchend', () => { active = false; });

    // Init
    after.style.clipPath   = 'inset(0 50% 0 0)';
    handle.style.left      = '50%';
    handle.style.transform = 'translateX(-50%)';
  });
}

/* ═══════════════════════════════
   FORM VALIDATION + SUBMIT
═══════════════════════════════ */
function initBookingForm() {
  const form    = $('#bookingForm');
  const success = $('#formSuccess');
  const btn     = $('#submitBtn');
  if (!form) return;

  function validateField(input) {
    const group = input.closest('.qm-form-group');
    const err   = group?.querySelector('.field-error');
    const valid = input.checkValidity() && input.value.trim() !== '';
    input.classList.toggle('error', !valid && input.required);
    err?.classList.toggle('show', !valid && input.required);
    return valid || !input.required;
  }

  // Live validation on blur
  $$('input[required], select[required]', form).forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let allValid = true;
    $$('input[required], select[required]', form).forEach(input => {
      if (!validateField(input)) allValid = false;
    });
    if (!allValid) return;

    // Submit animation
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.style.cssText = 'opacity:0;transform:translateY(8px);transition:.4s ease;pointer-events:none;';
      setTimeout(() => {
        form.style.display = 'none';
        success.style.display = 'block';
        success.style.cssText = 'display:block;opacity:0;transform:translateY(8px);';
        requestAnimationFrame(() => {
          success.style.cssText = 'display:block;opacity:1;transform:translateY(0);transition:.5s ease;';
        });
      }, 420);
    }, 1300);
  });
}

/* ═══════════════════════════════
   NEWSLETTER FORM
═══════════════════════════════ */
function initNlForm() {
  const form = $('#nlForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const btn   = form.querySelector('button');
    btn.textContent = '✓ Done';
    btn.style.background = 'linear-gradient(135deg, #059669, #34D399)';
    input.value = '';
    input.placeholder = 'Thanks for subscribing!';
    setTimeout(() => {
      btn.textContent = 'Subscribe';
      btn.style.background = '';
      input.placeholder = 'your@email.com';
    }, 3500);
  });
}

/* ═══════════════════════════════
   BACK TO TOP
═══════════════════════════════ */
function initBackToTop() {
  const btn = $('#backTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ═══════════════════════════════
   CTA BUTTON PULSE (payment section)
═══════════════════════════════ */
function initCTAPulse() {
  const cta = $('.payment-cta-box .qm-btn-primary');
  if (!cta) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      target.style.animation = isIntersecting
        ? 'none'
        : '';
    });
  }, { threshold: 0.5 });
  io.observe(cta);
}

/* ═══════════════════════════════
   SERVICE CARD HOVER TILT
═══════════════════════════════ */
function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  $$('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - .5) * 5;
      const y = ((e.clientY - r.top)  / r.height - .5) * -5;
      card.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ═══════════════════════════════
   CURSOR GLOW
═══════════════════════════════ */
function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position: 'fixed', pointerEvents: 'none', zIndex: '9999',
    width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(27,79,187,.045), transparent 65%)',
    transform: 'translate(-50%,-50%)',
    transition: 'opacity .3s ease',
    opacity: '0',
  });
  document.body.appendChild(glow);
  let vis = false;
  document.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
    glow.style.left = x + 'px'; glow.style.top = y + 'px';
    if (!vis) { glow.style.opacity = '1'; vis = true; }
  }, { passive: true });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; vis = false; });
}

/* ═══════════════════════════════
   INIT
═══════════════════════════════ */
function init() {
  initNavbar();
  initSmoothScroll();
  initReveal();
  initCounters();
  initTestimonials();
  initBASliders();
  initBookingForm();
  initNlForm();
  initBackToTop();
  initCTAPulse();
  initCardTilt();
  initCursorGlow();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
