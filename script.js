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
      formStatus.textContent = 'Unable to send. Please email aziz.tlili900@gmail.com.';
    }
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('has-motion');

  const titleLines = gsap.utils.toArray('.hero-title__line > span');
  const heroPhoto = document.querySelector('.hero__photo');
  const desktopCanvas = window.matchMedia('(min-width: 1001px)').matches;
  const heroTimeline = gsap.timeline({ defaults: { ease: 'power4.out' } });

  gsap.set(titleLines, { yPercent: 118 });
  gsap.set(heroPhoto, { clipPath: 'inset(0 0 100% 0)', scale: desktopCanvas ? 1.075 : 1 });
  heroTimeline
    .to(titleLines, { yPercent: 0, duration: 0.95, stagger: 0.12 }, 0.12)
    .to(heroPhoto, { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: 1.3, ease: 'power3.inOut' }, 0.2);

  gsap.to(heroPhoto, {
    yPercent: -6,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.65 },
  });

  gsap.utils.toArray('[data-motion="photo"]').forEach((frame) => {
    const image = frame.querySelector('img');
    const caption = frame.querySelector('.look__caption');
    gsap.fromTo(image, { clipPath: 'inset(0 0 100% 0)', scale: 1.06 }, {
      clipPath: 'inset(0 0 0% 0)',
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top 88%', end: 'top 34%', scrub: 0.7 },
    });
    gsap.fromTo(caption, { yPercent: 105, opacity: 0 }, {
      yPercent: 0,
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out',
      scrollTrigger: { trigger: frame, start: 'top 62%', toggleActions: 'play none none reverse' },
    });
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

  gsap.fromTo('.profile-section__image', { clipPath: 'inset(0 0 100% 0)', scale: 1.035 }, {
    clipPath: 'inset(0 0 0% 0)',
    scale: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.profile-section', start: 'top 80%', end: 'top 32%', scrub: 0.65 },
  });

  ScrollTrigger.refresh();
});
