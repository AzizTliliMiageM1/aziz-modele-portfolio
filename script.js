document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');

  function closeMenu() {
    menuToggle?.setAttribute('aria-expanded', 'false');
    siteNav?.classList.remove('is-open');
  }

  menuToggle?.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav?.classList.toggle('is-open', !expanded);
  });

  siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 680) closeMenu();
  });

  const progress = document.querySelector('.page-progress span');
  let progressFrame = false;
  window.addEventListener('scroll', () => {
    if (progressFrame) return;
    progressFrame = true;
    requestAnimationFrame(() => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${range > 0 ? window.scrollY / range : 0})`;
      progressFrame = false;
    });
  }, { passive: true });

  const dialog = document.querySelector('.lightbox');
  const lightboxImage = document.querySelector('.lightbox__image');
  const lightboxCaption = document.querySelector('.lightbox__caption');
  const lightboxCount = document.querySelector('.lightbox__count');
  const photos = Array.from(document.querySelectorAll('[data-photo]'));
  let activePhoto = 0;
  let pointerStartX = null;

  function showPhoto(index) {
    activePhoto = (index + photos.length) % photos.length;
    const source = photos[activePhoto];
    const image = source.querySelector('img');
    lightboxImage.src = source.dataset.photo;
    lightboxImage.alt = image ? image.alt : '';
    lightboxCaption.textContent = source.dataset.caption || '';
    lightboxCount.textContent = `${String(activePhoto + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  }

  photos.forEach((photo, index) => {
    photo.addEventListener('click', () => {
      showPhoto(index);
      dialog.showModal();
      document.querySelector('.lightbox__close')?.focus();
    });
  });

  document.querySelector('.lightbox__close')?.addEventListener('click', () => dialog.close());
  document.querySelector('.lightbox__step--previous')?.addEventListener('click', () => showPhoto(activePhoto - 1));
  document.querySelector('.lightbox__step--next')?.addEventListener('click', () => showPhoto(activePhoto + 1));
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog?.addEventListener('pointerdown', (event) => { pointerStartX = event.clientX; });
  dialog?.addEventListener('pointerup', (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(distance) > 70) showPhoto(activePhoto + (distance < 0 ? 1 : -1));
  });

  document.addEventListener('keydown', (event) => {
    if (!dialog?.open) return;
    if (event.key === 'ArrowRight') showPhoto(activePhoto + 1);
    if (event.key === 'ArrowLeft') showPhoto(activePhoto - 1);
  });

  const form = document.querySelector('.contact-form');
  const submitButton = form?.querySelector('.submit-button');
  const submitText = submitButton?.querySelector('span:first-child');
  const formStatus = form?.querySelector('.form-status');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    submitButton.disabled = true;
    submitText.textContent = 'Sending';
    formStatus.textContent = '';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Submission failed');
      submitText.textContent = 'Inquiry sent';
      formStatus.textContent = 'Thank you. Your message has been sent.';
      form.reset();
    } catch {
      submitButton.disabled = false;
      submitText.textContent = 'Try again';
      formStatus.textContent = 'Unable to send. Please email mdaziz.tlili@gmail.com directly.';
    }
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('has-motion');

  const titleLines = gsap.utils.toArray('.hero-title__line > span');
  const heroPhoto = document.querySelector('.hero__photo');
  const entry = document.querySelector('.entry-sequence');
  const entryLeft = entry?.querySelector('.entry-sequence__panel--left');
  const entryRight = entry?.querySelector('.entry-sequence__panel--right');

  gsap.set(titleLines, { yPercent: 118 });
  gsap.set(heroPhoto, { clipPath: 'inset(0 0 100% 0)', scale: 1.12 });
  gsap.set(['.hero__eyebrow', '.hero__statement', '.hero__actions'], { y: 20, opacity: 0 });

  if (entry && entryLeft && entryRight) {
    entry.classList.add('is-active');
    const entryFailsafe = window.setTimeout(() => entry.classList.remove('is-active'), 4000);
    gsap.set('.entry-sequence__word', { scale: 0.76, opacity: 0 });
    gsap.set('.entry-sequence__line', { scaleX: 0, transformOrigin: 'center center' });
    gsap.set(['.entry-sequence__index', '.entry-sequence__edition'], { opacity: 0 });

    gsap.timeline({
      defaults: { ease: 'power4.out' },
      onComplete: () => {
        window.clearTimeout(entryFailsafe);
        entry.classList.remove('is-active');
      },
    })
      .to('.entry-sequence__word', { scale: 1, opacity: 1, duration: 0.62, ease: 'expo.out' }, 0.08)
      .to('.entry-sequence__line', { scaleX: 1, duration: 0.42 }, 0.34)
      .to(['.entry-sequence__index', '.entry-sequence__edition'], { opacity: 1, duration: 0.32, stagger: 0.08 }, 0.32)
      .to('.entry-sequence__signature', { opacity: 0, duration: 0.28 }, 0.96)
      .to(entryLeft, { xPercent: -100, duration: 1.05, ease: 'power4.inOut' }, 1.08)
      .to(entryRight, { xPercent: 100, duration: 1.05, ease: 'power4.inOut' }, 1.08)
      .to(heroPhoto, { clipPath: 'inset(0)', scale: 1, duration: 1.2, ease: 'power3.inOut' }, 1.12)
      .to(titleLines, { yPercent: 0, duration: 0.88, stagger: 0.1, ease: 'power4.out' }, 1.22)
      .to(['.hero__eyebrow', '.hero__statement', '.hero__actions'], { y: 0, opacity: 1, duration: 0.52, stagger: 0.08 }, 1.58);
  } else {
    gsap.set(heroPhoto, { clipPath: 'inset(0)', scale: 1 });
    gsap.set(titleLines, { yPercent: 0 });
    gsap.set(['.hero__eyebrow', '.hero__statement', '.hero__actions'], { y: 0, opacity: 1 });
  }

  gsap.to(heroPhoto, {
    yPercent: -6,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.65 },
  });

  gsap.utils.toArray('[data-motion="photo"]').forEach((frame, index) => {
    const stage = frame.querySelector('.look__stage');
    const image = stage?.querySelector('img');
    const caption = frame.querySelector('.look__caption');
    const indexTag = frame.querySelector('.look__index');
    if (!stage || !image || !caption || !indexTag) return;

    const rotation = index % 2 === 0 ? -3.5 : 3.5;
    const photoTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: frame,
        start: 'top 92%',
        end: 'center 42%',
        scrub: 0.65,
        invalidateOnRefresh: true,
      },
    });

    photoTimeline.fromTo(stage, {
      y: 42,
      scale: 0.94,
      rotationY: rotation,
      opacity: 0.72,
    }, {
      y: 0,
      scale: 1,
      rotationY: 0,
      opacity: 1,
      duration: 1,
      ease: 'none',
    }, 0);
    photoTimeline.fromTo(image, {
      scale: 1.2,
      yPercent: 5,
      clipPath: 'inset(8% 9%)',
      filter: 'saturate(0.86) contrast(1.02)',
    }, {
      scale: 1,
      yPercent: 0,
      clipPath: 'inset(0)',
      filter: 'saturate(1.08) contrast(1.05)',
      duration: 1,
      ease: 'none',
    }, 0);
    photoTimeline.fromTo(indexTag, { opacity: 0, scale: 0.72, rotation: -18 }, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.42,
      ease: 'none',
    }, 0.14);
    photoTimeline.fromTo(caption, { opacity: 0, y: 14 }, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'none',
    }, 0.32);
  });

  gsap.utils.toArray('[data-motion="heading"]').forEach((heading) => {
    gsap.fromTo(heading, { y: 28, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 84%', toggleActions: 'play none none reverse' },
    });
  });

  gsap.fromTo('.profile-manifesto > span', { yPercent: 110, opacity: 0 }, {
    yPercent: 0,
    opacity: 1,
    duration: 0.85,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.profile-manifesto', start: 'top 82%', toggleActions: 'play none none reverse' },
  });

  gsap.to('.signal-strip__track', { xPercent: -50, duration: 24, repeat: -1, ease: 'none' });
  ScrollTrigger.refresh();
});
