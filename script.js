/* ═══════════════════════════════════════════════════
   RISTORANTE IMPERIALE — GLOBAL SCRIPTS
   script.js  |  v2.0
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────
     NAVBAR — scroll shrink + hide on scroll down
  ───────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  let lastScrollY = 0;

  function onScroll() {
    const y = window.scrollY;
    if (navbar) {
      navbar.classList.toggle('scrolled', y > 60);
    }
    lastScrollY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─────────────────────────────────────────────────
     MOBILE MENU
  ───────────────────────────────────────────────── */
  const burger     = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  let menuOpen     = false;

  function toggleMenu(open) {
    menuOpen = open;
    if (mobileMenu) {
      mobileMenu.classList.toggle('open', menuOpen);
      mobileMenu.setAttribute('aria-hidden', !menuOpen);
    }
    if (burger) burger.setAttribute('aria-expanded', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    if (burger) {
      const spans = burger.querySelectorAll('span');
      if (menuOpen) {
        spans[0].style.cssText = 'transform:rotate(45deg) translate(4px,4px)';
        spans[1].style.cssText = 'opacity:0';
        spans[2].style.cssText = 'transform:rotate(-45deg) translate(4px,-4px)';
      } else {
        spans.forEach(s => (s.style.cssText = ''));
      }
    }
  }

  if (burger) burger.addEventListener('click', () => toggleMenu(!menuOpen));
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) toggleMenu(false);
  });

  /* ─────────────────────────────────────────────────
     INTERSECTION OBSERVER — scroll reveals
  ───────────────────────────────────────────────── */
  const revealSelector = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const revealEls = document.querySelectorAll(revealSelector);

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );
  revealEls.forEach(el => io.observe(el));

  /* Re-observe when dynamically shown (e.g. menu tabs) */
  window._reObserve = function (container) {
    const els = container.querySelectorAll(revealSelector);
    els.forEach(el => {
      el.classList.remove('visible');
      setTimeout(() => io.observe(el), 30);
    });
  };

  /* ─────────────────────────────────────────────────
     MENU TABS
  ───────────────────────────────────────────────── */
  const menuTabs       = document.querySelectorAll('.menu-tab');
  const menuCategories = document.querySelectorAll('.menu-category');

  menuTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      const cat = this.dataset.category;
      menuTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      menuCategories.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      const target = document.getElementById(cat);
      if (target) {
        target.classList.add('active');
        window._reObserve && window._reObserve(target);
      }
    });
  });

  /* ─────────────────────────────────────────────────
     GALLERY LIGHTBOX
  ───────────────────────────────────────────────── */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src.replace(/w=\d+/, 'w=1400');
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function () {
      const img = this.querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox)      lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) closeLightbox();
  });

  /* Arrow key navigation */
  let galleryItems = [];
  let currentIdx   = -1;
  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    galleryItems.push(item);
    item.addEventListener('click', () => { currentIdx = i; });
  });
  document.addEventListener('keydown', e => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowRight') {
      currentIdx = (currentIdx + 1) % galleryItems.length;
      const img = galleryItems[currentIdx].querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    }
    if (e.key === 'ArrowLeft') {
      currentIdx = (currentIdx - 1 + galleryItems.length) % galleryItems.length;
      const img = galleryItems[currentIdx].querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    }
  });

  /* ─────────────────────────────────────────────────
     TOAST NOTIFICATION
  ───────────────────────────────────────────────── */
  const toast = document.getElementById('toast');
  window._showToast = function (msg, duration = 4200) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  };

  /* ─────────────────────────────────────────────────
     RESERVATION FORM
  ───────────────────────────────────────────────── */
  const reservationForm = document.getElementById('reservation-form');
  const dateInput       = document.getElementById('res-date');

  if (dateInput) {
    /* Set min date to tomorrow */
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const pad = n => String(n).padStart(2, '0');
    const iso = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
    dateInput.min   = iso;
    dateInput.value = iso;
  }

  if (reservationForm) {
    reservationForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('res-name');
      if (!name || !name.value.trim()) { if (name) name.focus(); return; }

      const btn = this.querySelector('[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Confirming…';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = 'Confirmed ✓';
        btn.style.cssText = 'background:#2a5a1a; color:#f4ede0';
        window._showToast('Your table has been reserved. We await your arrival.');
        setTimeout(() => {
          this.reset();
          btn.textContent = orig;
          btn.disabled = false;
          btn.style.cssText = '';
          if (dateInput) dateInput.value = dateInput.min;
        }, 5000);
      }, 1800);
    });
  }

  /* ─────────────────────────────────────────────────
     NEWSLETTER FORM
  ───────────────────────────────────────────────── */
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = this.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Grazie ✓';
      btn.disabled = true;
      window._showToast('Welcome to Il Bollettino. Grazie mille.');
      setTimeout(() => {
        this.reset();
        btn.textContent = orig;
        btn.disabled = false;
      }, 4500);
    });
  }

  /* ─────────────────────────────────────────────────
     PARALLAX — hero background
  ───────────────────────────────────────────────── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    function parallaxHero() {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroBg.style.transform = `scale(1) translateY(${y * 0.28}px)`;
      }
    }
    window.addEventListener('scroll', parallaxHero, { passive: true });
  }

  /* ─────────────────────────────────────────────────
     SMOOTH SCROLL — all hash links
  ───────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const hash   = this.getAttribute('href');
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '80', 10);
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH,
        behavior: 'smooth',
      });
    });
  });

  /* ─────────────────────────────────────────────────
     ACTIVE NAV LINK — highlight based on section
  ───────────────────────────────────────────────── */
  const sections    = document.querySelectorAll('section[id]');
  const navAnchors  = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sections.forEach(s => sectionObserver.observe(s));

  /* ─────────────────────────────────────────────────
     CURSOR TRAIL — subtle gold dots (desktop only)
  ───────────────────────────────────────────────── */
  if (window.matchMedia('(pointer:fine)').matches) {
    let trailCount = 0;
    const MAX_TRAIL = 6;

    document.addEventListener('mousemove', e => {
      if (trailCount >= MAX_TRAIL) return;
      trailCount++;
      const dot = document.createElement('div');
      dot.style.cssText = `
        position:fixed; pointer-events:none; z-index:9998;
        width:4px; height:4px;
        border-radius:50%;
        background:rgba(201,168,76,0.55);
        left:${e.clientX - 2}px;
        top:${e.clientY - 2}px;
        transform:scale(1);
        transition:opacity 0.7s ease, transform 0.7s ease;
      `;
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.opacity = '0';
        dot.style.transform = 'scale(2.5)';
      });
      setTimeout(() => {
        dot.remove();
        trailCount--;
      }, 700);
    });
  }

  /* ─────────────────────────────────────────────────
     TASTING MENU — step reveal (tasting-menu.html)
  ───────────────────────────────────────────────── */
  const courseItems = document.querySelectorAll('.course-item');
  if (courseItems.length) {
    const courseObserver = new IntersectionObserver(
      entries => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            courseObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    courseItems.forEach(item => courseObserver.observe(item));
  }

  /* ─────────────────────────────────────────────────
     PRIVATE DINING — room tab switcher
  ───────────────────────────────────────────────── */
  const roomTabs  = document.querySelectorAll('.room-tab');
  const roomPanes = document.querySelectorAll('.room-pane');
  roomTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      roomTabs.forEach(t => t.classList.remove('active'));
      roomPanes.forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const target = document.getElementById(this.dataset.room);
      if (target) {
        target.classList.add('active');
        window._reObserve && window._reObserve(target);
      }
    });
  });

  /* ─────────────────────────────────────────────────
     COUNTER ANIMATION — stat numbers
  ───────────────────────────────────────────────── */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || el.textContent);
    const suffix = el.dataset.suffix || '';
    const dur    = 1800;
    const step   = 16;
    const steps  = Math.round(dur / step);
    let current  = 0;
    let frame    = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / steps;
      const eased    = 1 - Math.pow(1 - progress, 3);
      current        = Math.round(target * eased);
      el.textContent = current + suffix;
      if (frame >= steps) {
        clearInterval(timer);
        el.textContent = target + suffix;
      }
    }, step);
  }

  const counterEls = document.querySelectorAll('.counter');
  if (counterEls.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => counterObserver.observe(el));
  }

})();
