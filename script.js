/* ============================================================
   Aziz Modele — Interactive Fashion Film
   Scroll acts as a camera: GSAP ScrollTrigger drives pinned
   scenes, depth layers and transforms. Lenis provides inertial,
   physical scroll momentum instead of the browser's native jump.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Lenis smooth / inertial scroll (light, responsive feel) ---------- */
  let lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 0.45,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 1.6,
    });
    window.__lenis = lenis;

    lenis.on('scroll', () => {
      if (hasGsap) ScrollTrigger.update();
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    if (hasGsap) {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------- Header state + active chapter tracking ---------- */
  const header = document.querySelector('.site-header');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const chapters = Array.from(document.querySelectorAll('.chapter'));
  const progressFill = document.querySelector('.progress-rail__fill');

  function updateHeaderAndProgress() {
    const y = window.scrollY || window.pageYOffset;
    if (header) {
      header.classList.toggle('is-scrolled', y > 40);
    }

    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    const ratio = total > 0 ? Math.min(Math.max(y / total, 0), 1) : 0;
    if (progressFill) {
      progressFill.style.height = `${ratio * 100}%`;
    }
  }

  window.addEventListener('scroll', updateHeaderAndProgress, { passive: true });
  updateHeaderAndProgress();

  if ('IntersectionObserver' in window && navLinks.length && chapters.length) {
    const chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const name = entry.target.getAttribute('data-chapter-name');
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('data-chapter') === name);
        });
      });
    }, { threshold: 0.5, rootMargin: '-40% 0px -40% 0px' });

    chapters.forEach((chapter) => chapterObserver.observe(chapter));
  }

  /* ---------- Custom cursor: always visible, never lost ---------- */
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (cursorDot && cursorRing && !isCoarsePointer) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let seenFirstMove = false;

    window.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (!seenFirstMove) {
        seenFirstMove = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    window.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    window.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });

    function tickRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(tickRing);
    }
    tickRing();

    const hoverTargets = document.querySelectorAll('a, button, .book3d__page, .archive-card, input, textarea');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hover'));
    });
  } else if (cursorDot && cursorRing) {
    cursorDot.style.display = 'none';
    cursorRing.style.display = 'none';
  }

  if (!hasGsap) {
    return;
  }

  /* ---------- Editorial title reveal: each line masked and unveiled on its own ---------- */
  function revealLines(selector, trigger) {
    const el = document.querySelector(selector);
    if (!el) return;
    const lines = el.innerHTML.split(/<br\s*\/?>/i).map((line) => line.trim()).filter(Boolean);
    if (lines.length < 2 && !el.innerHTML.includes('<br')) return;
    el.innerHTML = lines.map((line) => `<span class="reveal-line"><span class="reveal-line__inner">${line}</span></span>`).join('');
    const inners = el.querySelectorAll('.reveal-line__inner');
    gsap.set(inners, { yPercent: 105, opacity: 1 });
    gsap.to(inners, {
      yPercent: 0,
      duration: 0.9,
      ease: 'power4.out',
      stagger: 0.08,
      scrollTrigger: { trigger: trigger || el, start: 'top 85%' },
    });
  }
  revealLines('.book3d-heading', '.chapter--book');
  revealLines('.archive-heading__title', '.chapter--archive');
  revealLines('.frame-caption__title', '.chapter--frame');
  revealLines('.profile-title', '.chapter--profile');

  /* ---------- Magnetic tilt on photo cards (desktop only, subtle) ---------- */
  if (!isCoarsePointer) {
    document.querySelectorAll('.book3d__page, .archive-card').forEach((el) => {
      const setRotX = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const setRotY = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('mousemove', (event) => {
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        setRotY(px * 8);
        setRotX(py * -8);
      });
      el.addEventListener('mouseleave', () => {
        setRotX(0);
        setRotY(0);
      });
    });
  }

  /* ---------- Velocity-reactive tilt: motion visibly answers to scroll speed ---------- */
  if (lenis) {
    const tiltTargets = gsap.utils.toArray('.genesis-hero, .transform-frame').map((el) =>
      gsap.quickTo(el, 'rotate', { duration: 0.7, ease: 'power3.out' })
    );
    lenis.on('scroll', (e) => {
      const tilt = gsap.utils.clamp(-1.4, 1.4, e.velocity * -0.05);
      tiltTargets.forEach((setter) => setter(tilt));
    });
  }

  const mm = gsap.matchMedia();

  mm.add('(min-width: 981px)', () => {
    /* ============================================================
       ACT I — GENESIS
       Fragments of raw photographic material (texture, light, colour
       — not faces) drift in and assemble, breathe, then scatter apart
       to reveal the portrait behind them and, finally, the name.
       ============================================================ */
    const genesisSticky = document.querySelector('.chapter--genesis .chapter-sticky');
    const genesisTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.chapter--genesis',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.35,
        pin: genesisSticky,
        pinSpacing: false,
      },
    });

    const shardMotion = {
      1: { in: { x: 0, y: 40, rotate: -8 }, rest: { rotate: -3 }, out: { x: 0, y: -170, rotate: 6, scale: 1.6 }, inStart: 0, outStart: 0.32 },
      2: { in: { x: -420, y: -300, rotate: -26 }, rest: { rotate: -6 }, out: { x: -600, y: -460, rotate: -34, scale: 1.2 }, inStart: 0.05, outStart: 0.335 },
      3: { in: { x: 440, y: -280, rotate: 24 }, rest: { rotate: 5 }, out: { x: 620, y: -430, rotate: 30, scale: 1.2 }, inStart: 0.07, outStart: 0.35 },
      4: { in: { x: -400, y: 320, rotate: -18 }, rest: { rotate: 4 }, out: { x: -580, y: 470, rotate: -24, scale: 1.2 }, inStart: 0.09, outStart: 0.365 },
      5: { in: { x: 420, y: 300, rotate: 20 }, rest: { rotate: -4 }, out: { x: 600, y: 450, rotate: 26, scale: 1.2 }, inStart: 0.11, outStart: 0.38 },
      6: { in: { x: 0, y: 380, rotate: 10 }, rest: { rotate: 2 }, out: { x: 0, y: 540, rotate: 16, scale: 1.2 }, inStart: 0.13, outStart: 0.395 },
    };

    genesisTl.to('[data-genesis="cue"]', { opacity: 0, ease: 'none', duration: 0.03 }, 0.03);

    /* The seed fragment is visible from the very first frame (no blank
       opening) and breathes gently on its own, independent of scroll. */
    const seed = document.querySelector('[data-genesis-shard="1"]');
    gsap.set(seed, { x: 0, y: 0, rotate: -3, scale: 1, opacity: 1 });
    gsap.to(seed, { scale: 1.04, rotate: -1, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    Object.entries(shardMotion).forEach(([key, motion]) => {
      const el = `[data-genesis-shard="${key}"]`;
      if (key === '1') {
        genesisTl.to(el,
          { x: motion.out.x, y: motion.out.y, rotate: motion.out.rotate, scale: motion.out.scale, opacity: 0, ease: 'power1.in', duration: 0.13 },
          motion.outStart
        );
        return;
      }

      genesisTl
        .fromTo(el,
          { x: motion.in.x, y: motion.in.y, rotate: motion.in.rotate, scale: 0.7, opacity: 0 },
          { x: 0, y: 0, rotate: motion.rest.rotate, scale: 1, opacity: 1, ease: 'power2.out', duration: 0.09 },
          motion.inStart
        )
        .to(el,
          { x: motion.out.x, y: motion.out.y, rotate: motion.out.rotate, scale: motion.out.scale, opacity: 0, ease: 'power1.in', duration: 0.13 },
          motion.outStart
        );
    });

    genesisTl
      .fromTo('[data-genesis="hero"]', { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, ease: 'none', duration: 0.14 }, 0.36)
      .fromTo('.genesis-title__inner', { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.11, stagger: 0.03 }, 0.47)
      .to('.genesis-copy__eyebrow', { opacity: 1, ease: 'none', duration: 0.05 }, 0.45)
      .to('.genesis-copy__dek', { opacity: 1, ease: 'none', duration: 0.05 }, 0.56)
      .to('[data-genesis="hint"]', { opacity: 1, ease: 'none', duration: 0.05 }, 0.58)
      .to({}, { duration: 0.37 }, 0.63);

    /* ============================================================
       CHAPTER 02 — ARCHIVE
       Vertical scroll drives a horizontal camera pan across a strip
       of floating frames. Each card fades/scales/un-tilts in as it
       nears the centre of the pan, staggered along the same scrub.
       ============================================================ */
    const archiveTrack = document.querySelector('[data-archive="track"]');
    if (archiveTrack) {
      const archiveCards = gsap.utils.toArray('.archive-card');

      const archiveSticky = document.querySelector('.chapter--archive .chapter-sticky');
      const archiveTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.chapter--archive',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.2,
          invalidateOnRefresh: true,
          pin: archiveSticky,
          pinSpacing: false,
        },
      });

      archiveTl.to(archiveTrack, {
        x: () => -(archiveTrack.scrollWidth - window.innerWidth),
        ease: 'none',
        duration: 1,
      }, 0);

      archiveCards.forEach((card, index) => {
        const start = index * (0.7 / (archiveCards.length - 1));
        archiveTl.fromTo(card,
          { opacity: 0.15, scale: 0.9, rotate: index % 2 === 0 ? -4 : 4 },
          { opacity: 1, scale: 1, rotate: 0, ease: 'none', duration: 0.3 },
          start
        );
      });

      archiveTl.to('[data-archive="cue"]', { opacity: 0, ease: 'none', duration: 0.2 }, 0.05);

      /* Cursor takes over exploration: move right to pan right, left to pan left */
      const archiveStage = document.querySelector('.archive-stage');
      const archiveCursorLayer = document.querySelector('[data-archive="cursor-layer"]');
      if (archiveStage && archiveCursorLayer) {
        const maxCursorPan = 260;
        const setCursorX = gsap.quickTo(archiveCursorLayer, 'x', { duration: 0.9, ease: 'power3.out' });
        archiveStage.addEventListener('mousemove', (event) => {
          const rect = archiveStage.getBoundingClientRect();
          const ratio = gsap.utils.clamp(0, 1, (event.clientX - rect.left) / rect.width);
          setCursorX((ratio - 0.5) * 2 * -maxCursorPan);
        });
        archiveStage.addEventListener('mouseleave', () => setCursorX(0));
      }
    }

    /* ============================================================
       CHAPTER 05 — THE BOOK
       A literal book: scroll opens the front cover, then turns each
       spread in sequence like real pages, ending on a final plate.
       ============================================================ */
    const book3d = document.querySelector('[data-book3d="book"]');
    if (book3d) {
      const bookSticky = document.querySelector('.chapter--book .chapter-sticky');
      const bookTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.chapter--book',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.25,
          pin: bookSticky,
          pinSpacing: false,
        },
      });

      bookTl
        .to('[data-book3d="index"]', { opacity: 0, ease: 'none', duration: 0.08 }, 0.02)
        .to('[data-book3d="heading"]', { opacity: 0, ease: 'none', duration: 0.08 }, 0.02)
        .to('[data-book3d-leaf="cover"]', { rotateY: -155, ease: 'power2.inOut', duration: 0.22 }, 0.05)
        .to('[data-book3d-leaf="spread-1"]', { rotateY: -155, ease: 'power2.inOut', duration: 0.22 }, 0.4)
        .to('[data-book3d-leaf="spread-2"]', { rotateY: -155, ease: 'power2.inOut', duration: 0.22 }, 0.75);
    }

    /* ============================================================
       CHAPTER 04 — THE FRAME
       The camera stops. One photograph, full-bleed, mostly still —
       a deliberate breath before the next transformation.
       ============================================================ */
    const frameSticky = document.querySelector('.chapter--frame .chapter-sticky');
    const frameTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.chapter--frame',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.4,
        pin: frameSticky,
        pinSpacing: false,
      },
    });

    frameTl
      .fromTo('[data-frame="photo"] img', { scale: 1 }, { scale: 1.06, ease: 'none', duration: 1 }, 0)
      .to('[data-frame="index"]', { opacity: 1, ease: 'none', duration: 0.1 }, 0.08)
      .to('[data-frame="caption"]', { opacity: 1, ease: 'none', duration: 0.14 }, 0.14)
      .to('[data-frame="index"]', { opacity: 0, ease: 'none', duration: 0.1 }, 0.82)
      .to('[data-frame="caption"]', { opacity: 0, ease: 'none', duration: 0.1 }, 0.85);

    /* ============================================================
       CHAPTER 05 — THE ROOM (major WOW moment)
       A framed photograph scales up until it dominates the viewport
       — the visitor appears to walk INTO the photograph — then a new
       editorial message is revealed as if inside that space.
       ============================================================ */
    const transformSticky = document.querySelector('.chapter--transformation .chapter-sticky');
    const transformTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.chapter--transformation',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.2,
        pin: transformSticky,
        pinSpacing: false,
      },
    });

    transformTl
      .to('[data-transform="index"]', { opacity: 0, ease: 'none', duration: 0.06 }, 0.02)
      .to('[data-transform="copy"]', { opacity: 0, y: -20, ease: 'none', duration: 0.06 }, 0.02)
      .to('[data-transform="frame"]', {
        width: 'min(1500px, 92vw)',
        height: 'min(900px, 86vh)',
        borderRadius: '4px',
        ease: 'none',
        duration: 0.25,
      }, 0.05)
      .to('[data-transform="reveal"]', { opacity: 1, ease: 'none', duration: 0.15 }, 0.32)
      .to({}, { duration: 0.47 }, 0.53);

    /* Header nudges to a lighter contrast while inside the immersive frame */
    ScrollTrigger.create({
      trigger: '.chapter--transformation',
      start: 'top top',
      end: 'bottom top',
      onEnter: () => header && header.classList.add('is-scrolled'),
      onLeaveBack: () => {},
    });

    /* ============================================================
       CHAPTER 06 — PROFILE
       The story returns to the person: portrait settles, the name
       resolves, then professional details arrive one row at a time.
       ============================================================ */
    const profileSticky = document.querySelector('.chapter--profile .chapter-sticky');
    const profileTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.chapter--profile',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.3,
        pin: profileSticky,
        pinSpacing: false,
      },
    });

    profileTl
      .fromTo('[data-profile="portrait"]', { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, ease: 'none', duration: 0.22 }, 0.04)
      .to('.profile-intro', { opacity: 1, ease: 'none', duration: 0.1 }, 0.3)
      .to('.profile-detail', { opacity: 1, ease: 'none', duration: 0.08, stagger: 0.06 }, 0.42)
      .to('[data-profile="cta"]', { opacity: 1, ease: 'none', duration: 0.1 }, 0.72);
  });

  /* ---------- Mobile-safe simple reveals (archive uses native scroll-snap instead) ---------- */
  mm.add('(max-width: 980px)', () => {
    /* Genesis, simplified: shards fade in place, fade out together, hero + name reveal */
    const genesisTlMobile = gsap.timeline({
      scrollTrigger: { trigger: '.chapter--genesis', start: 'top top', end: 'bottom top', scrub: 0.3 },
    });
    const mobileSeed = document.querySelector('[data-genesis-shard="1"]');
    gsap.set(mobileSeed, { opacity: 1, scale: 1 });
    gsap.utils.toArray('.genesis-shard').forEach((el, i) => {
      if (el === mobileSeed) return;
      genesisTlMobile.fromTo(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, ease: 'none', duration: 0.08 }, i * 0.03);
    });
    genesisTlMobile
      .to('.genesis-shard', { opacity: 0, scale: 1.15, ease: 'none', duration: 0.08 }, 0.25)
      .fromTo('[data-genesis="hero"]', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.09 }, 0.27)
      .to('.genesis-copy__eyebrow', { opacity: 1, ease: 'none', duration: 0.04 }, 0.3)
      .fromTo('.genesis-title__inner', { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.08, stagger: 0.02 }, 0.32)
      .to('.genesis-copy__dek', { opacity: 1, ease: 'none', duration: 0.04 }, 0.4)
      .to('[data-genesis="hint"]', { opacity: 1, ease: 'none', duration: 0.04 }, 0.42)
      .to('[data-genesis="cue"]', { opacity: 0, ease: 'none', duration: 0.02 }, 0.02)
      .to({}, { duration: 0.54 }, 0.46);

    gsap.utils.toArray('.book3d__page').forEach((pageEl) => {
      gsap.fromTo(pageEl, { opacity: 0, y: 40 }, {
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: { trigger: pageEl, start: 'top 95%', end: 'top 65%', scrub: 0.25 },
      });
    });

    gsap.utils.toArray('.archive-card').forEach((card) => {
      gsap.fromTo(card, { opacity: 0.3, scale: 0.94 }, {
        opacity: 1,
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: card, start: 'left 90%', end: 'left 40%', scrub: 0.25, horizontal: true, scroller: card.closest('.archive-track') },
      });
    });

    gsap.utils.toArray('[data-transform="copy"]').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 20 }, {
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 70%', scrub: 0.25 },
      });
    });
  });

  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });

  /* ---------- Contact form: real submission via FormSubmit ---------- */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    const submitButton = contactForm.querySelector('.form-submit');
    const submitLabel = contactForm.querySelector('.form-submit__text');
    const originalLabel = submitLabel ? submitLabel.textContent : 'Send Inquiry';

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submitButton) submitButton.disabled = true;
      if (submitLabel) submitLabel.textContent = 'Sending…';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Request failed');

        if (submitLabel) submitLabel.textContent = 'Inquiry Sent';
        contactForm.reset();
      } catch (error) {
        if (submitLabel) submitLabel.textContent = 'Error — try again';
        if (submitButton) submitButton.disabled = false;
        setTimeout(() => {
          if (submitLabel) submitLabel.textContent = originalLabel;
        }, 3000);
      }
    });
  }
});
