/* ═══════════════════════════════════════════════
   QM GLOW CENTER — Script
   Vanilla JS · No dependencies beyond Bootstrap 5
   ═══════════════════════════════════════════════ */

'use strict';

const qs  = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];
const dbc = (fn, ms = 80) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

/* ────────────────────────────────────────────
   NAVBAR — scroll state + mobile toggle
──────────────────────────────────────────── */
function initNav() {
  const header  = qs('#siteHeader');
  const toggle  = qs('#navToggle');
  const menu    = qs('#navMenu');
  const links   = qsa('.nav-link');

  if (!header) return;

  /* Scroll: add .scrolled class + active link */
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);

    let active = '';
    qsa('section[id]').forEach(s => {
      if (window.scrollY >= s.offsetTop - 110) active = s.id;
    });
    links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${active}`));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile toggle */
  toggle?.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    menu?.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Close on link click */
  links.forEach(l => l.addEventListener('click', () => {
    toggle?.classList.remove('open');
    menu?.classList.remove('open');
    document.body.style.overflow = '';
  }));

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (header.contains(e.target)) return;
    toggle?.classList.remove('open');
    menu?.classList.remove('open');
    document.body.style.overflow = '';
  });
}

/* ────────────────────────────────────────────
   SMOOTH SCROLL with navbar offset
──────────────────────────────────────────── */
function initScroll() {
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 76;
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = qs(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - navH + 1, behavior: 'smooth' });
    });
  });
}

/* ────────────────────────────────────────────
   SCROLL REVEAL — IntersectionObserver
──────────────────────────────────────────── */
function initReveal() {
  const els = qsa('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      const delay = Number(target.dataset.delay || 0);
      setTimeout(() => target.classList.add('in'), delay);
      io.unobserve(target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -44px 0px' });

  els.forEach(el => io.observe(el));
}

/* ────────────────────────────────────────────
   ANIMATED COUNTERS
──────────────────────────────────────────── */
function initCounters() {
  const els = qsa('[data-target]');
  if (!els.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 4);

  const run = el => {
    const target = parseInt(el.dataset.target, 10);
    const dur = 2200;
    const t0  = performance.now();
    const step = now => {
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
  }, { threshold: 0.7 });

  els.forEach(el => io.observe(el));
}

/* ────────────────────────────────────────────
   BEFORE / AFTER SLIDERS
──────────────────────────────────────────── */
function initBASliders() {
  qsa('[data-slider]').forEach(slider => {
    const after  = qs('.ba-after', slider);
    const drag   = qs('.ba-drag', slider);
    if (!after || !drag) return;

    let active = false;

    function setPos(clientX) {
      const r   = slider.getBoundingClientRect();
      const pct = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
      after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      drag.style.left      = `${pct}%`;
    }

    slider.addEventListener('mousedown', e => { active = true; setPos(e.clientX); e.preventDefault(); });
    window.addEventListener('mousemove', e => { if (active) setPos(e.clientX); });
    window.addEventListener('mouseup',   () => { active = false; });

    slider.addEventListener('touchstart', e => { active = true; setPos(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchmove',  e => { if (active) setPos(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchend',   () => { active = false; });

    /* Init at 50% */
    after.style.clipPath = 'inset(0 50% 0 0)';
    drag.style.left      = '50%';
  });
}

/* ────────────────────────────────────────────
   RESULTS FILTER TABS
──────────────────────────────────────────── */
function initResultsTabs() {
  const tabs  = qsa('.rtab');
  const items = qsa('.result-item');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.dataset.tab;
      items.forEach(item => {
        const match = cat === 'all' || item.dataset.cat === cat;
        if (match) {
          item.classList.remove('hidden');
          item.style.opacity = '0';
          item.style.transform = 'scale(.96) translateY(6px)';
          requestAnimationFrame(() => {
            item.style.transition = 'opacity .4s ease, transform .4s ease';
            item.style.opacity    = '1';
            item.style.transform  = 'none';
          });
        } else {
          item.style.transition = 'opacity .3s ease, transform .3s ease';
          item.style.opacity    = '0';
          item.style.transform  = 'scale(.94)';
          setTimeout(() => item.classList.add('hidden'), 320);
        }
      });
    });
  });
}

/* ────────────────────────────────────────────
   TESTIMONIALS SLIDER
──────────────────────────────────────────── */
function initTestiSlider() {
  const track  = qs('#testiTrack');
  const prev   = qs('#testiPrev');
  const next   = qs('#testiNext');
  const dotsEl = qs('#testiDots');
  if (!track) return;

  const slides = qsa('.testi-slide', track);
  const total  = slides.length;
  let cur = 0, timer;

  /* Build dots */
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'tnav-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Review ${i + 1}`);
    d.addEventListener('click', () => { goTo(i); reset(); });
    dotsEl?.appendChild(d);
  });

  function slideW() {
    const gap = parseInt(getComputedStyle(track).gap || '24', 10);
    return (slides[0]?.offsetWidth || 0) + gap;
  }

  function goTo(idx) {
    cur = (idx + total) % total;
    track.style.transform = `translateX(-${cur * slideW()}px)`;
    qsa('.tnav-dot', dotsEl).forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  function start() { timer = setInterval(() => goTo(cur + 1), 5800); }
  function reset() { clearInterval(timer); start(); }

  prev?.addEventListener('click', () => { goTo(cur - 1); reset(); });
  next?.addEventListener('click', () => { goTo(cur + 1); reset(); });

  /* Touch swipe */
  let sx = 0;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = sx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) { dx > 0 ? goTo(cur + 1) : goTo(cur - 1); reset(); }
  }, { passive: true });

  window.addEventListener('resize', dbc(() => goTo(cur), 160));
  start();
  goTo(0);
}

/* ────────────────────────────────────────────
   BOOKING FORM — validation + submit
──────────────────────────────────────────── */
function initBookingForm() {
  const form    = qs('#bookingForm');
  const success = qs('#formSuccess');
  const submitBtn = qs('#fSubmit');
  if (!form) return;

  function validateFld(input) {
    const wrap = input.closest('.fld');
    const err  = wrap?.querySelector('.fld-err');
    let valid  = true;

    if (input.required) {
      if (input.type === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      } else {
        valid = input.value.trim() !== '';
      }
    }

    input.classList.toggle('has-error', !valid && input.required);
    err?.classList.toggle('show', !valid && input.required);
    return valid || !input.required;
  }

  /* Live feedback */
  qsa('input[required], select[required]', form).forEach(input => {
    input.addEventListener('blur',  () => validateFld(input));
    input.addEventListener('input', () => { if (input.classList.contains('has-error')) validateFld(input); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    qsa('input[required], select[required]', form).forEach(input => {
      if (!validateFld(input)) ok = false;
    });
    if (!ok) return;

    /* Animate submit */
    if (submitBtn) {
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      form.style.cssText = 'opacity:0;transform:translateY(8px);transition:.4s ease;pointer-events:none;';
      setTimeout(() => {
        form.style.display = 'none';
        if (success) {
          success.style.display = 'block';
          success.style.cssText = 'display:block;opacity:0;transform:translateY(10px);';
          requestAnimationFrame(() => {
            success.style.cssText = 'display:block;opacity:1;transform:translateY(0);transition:.5s ease;';
          });
        }
      }, 420);
    }, 1400);
  });
}

/* ────────────────────────────────────────────
   NEWSLETTER
──────────────────────────────────────────── */
function initNl() {
  const form = qs('#nlForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const inp = form.querySelector('input');
    const btn = form.querySelector('button');
    const orig = btn.textContent;
    btn.textContent = '✓ Subscribed';
    btn.style.background = 'linear-gradient(135deg,#059669,#34D399)';
    inp.value = '';
    inp.placeholder = 'Thanks! Check your inbox.';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      inp.placeholder = 'your@email.com';
    }, 3600);
  });
}

/* ────────────────────────────────────────────
   BACK TO TOP
──────────────────────────────────────────── */
function initBackToTop() {
  const btn = qs('#backTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ────────────────────────────────────────────
   SERVICE CARD TILT (desktop only)
──────────────────────────────────────────── */
function initTilt() {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  qsa('.svc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - .5) * 5;
      const y = ((e.clientY - r.top)  / r.height - .5) * -5;
      card.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ────────────────────────────────────────────
   SUBTLE CURSOR GLOW
──────────────────────────────────────────── */
function initCursorGlow() {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  const g = document.createElement('div');
  Object.assign(g.style, {
    position: 'fixed', pointerEvents: 'none', zIndex: '9999',
    width: '280px', height: '280px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,79,186,.04), transparent 65%)',
    transform: 'translate(-50%,-50%)',
    transition: 'opacity .3s ease', opacity: '0',
  });
  document.body.appendChild(g);
  let on = false;
  document.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
    g.style.left = x + 'px'; g.style.top = y + 'px';
    if (!on) { g.style.opacity = '1'; on = true; }
  }, { passive: true });
  document.addEventListener('mouseleave', () => { g.style.opacity = '0'; on = false; });
}

/* ────────────────────────────────────────────
   INIT
──────────────────────────────────────────── */
function init() {
  initNav();
  initScroll();
  initReveal();
  initCounters();
  initBASliders();
  initResultsTabs();
  initTestiSlider();
  initBookingForm();
  initNl();
  initBackToTop();
  initTilt();
  initCursorGlow();
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
