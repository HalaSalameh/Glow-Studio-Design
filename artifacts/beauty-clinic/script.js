/* =============================================
   QM GLOW CENTER — script.js
   Vanilla JavaScript — no frameworks
   ============================================= */

(function () {
  'use strict';

  /* ---- Navbar scroll effect ---- */
  const nav = document.getElementById('mainNav');
  function handleScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
  }
  window.addEventListener('scroll', handleScroll, { passive: true });

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /* ---- Scroll-triggered animations ---- */
  const animateEls = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var delay = entry.target.style.animationDelay || '0s';
        var ms = parseFloat(delay) * 1000;
        setTimeout(function () {
          entry.target.classList.add('visible');
        }, ms);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  animateEls.forEach(function (el) { observer.observe(el); });

  /* ---- Smooth scroll for all anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();

      var navHeight = nav ? nav.offsetHeight : 80;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: top, behavior: 'smooth' });

      var bsCollapse = document.getElementById('navMenu');
      if (bsCollapse && bsCollapse.classList.contains('show')) {
        var collapseInstance = bootstrap.Collapse.getInstance(bsCollapse);
        if (collapseInstance) collapseInstance.hide();
      }
    });
  });

  /* ---- Contact form handling ---- */
  var form = document.getElementById('bookingForm');
  var submitBtn = document.getElementById('submitBtn');
  var formMsg = document.getElementById('formMsg');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var inputs = form.querySelectorAll('[required]');
      var valid = true;
      inputs.forEach(function (input) {
        if (!input.value.trim()) valid = false;
      });

      if (!valid) {
        showMsg('Please fill in all required fields before submitting.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book My Free Consultation';
        showMsg('Thank you! We\'ve received your request and will contact you within 24 hours to confirm your consultation.', 'success');
        form.reset();
      }, 1400);
    });
  }

  function showMsg(text, type) {
    formMsg.className = type === 'success' ? 'form-msg-success' : 'form-msg-error';
    formMsg.textContent = text;
    formMsg.style.display = 'block';
    setTimeout(function () {
      formMsg.style.display = 'none';
    }, 6000);
  }

  /* ---- Parallax blob effect on hero ---- */
  var blob1 = document.querySelector('.hero-blob-1');
  var blob2 = document.querySelector('.hero-blob-2');

  window.addEventListener('mousemove', function (e) {
    var x = e.clientX / window.innerWidth;
    var y = e.clientY / window.innerHeight;
    if (blob1) {
      blob1.style.transform = 'translate(' + (x * 20) + 'px, ' + (y * 20) + 'px)';
    }
    if (blob2) {
      blob2.style.transform = 'translate(' + (-x * 15) + 'px, ' + (-y * 15) + 'px)';
    }
  });

  /* ---- Hero visible immediately ---- */
  document.querySelectorAll('.hero-section [data-animate]').forEach(function (el) {
    setTimeout(function () {
      el.classList.add('visible');
    }, parseFloat(el.style.animationDelay || '0') * 1000 + 100);
  });

})();
