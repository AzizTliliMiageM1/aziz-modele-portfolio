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
    if (window.innerWidth > 650) closeMenu();
  });

  const revealItems = document.querySelectorAll('[data-reveal]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

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

  dialog?.addEventListener('pointerdown', (event) => {
    pointerStartX = event.clientX;
  });
  dialog?.addEventListener('pointerup', (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(distance) < 70) return;
    showPhoto(activePhoto + (distance < 0 ? 1 : -1));
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
    submitText.textContent = 'Envoi en cours';
    formStatus.textContent = '';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Envoi impossible');
      submitText.textContent = 'Message envoyé';
      formStatus.textContent = 'Merci, votre message a bien été envoyé.';
      form.reset();
    } catch {
      submitButton.disabled = false;
      submitText.textContent = 'Réessayer';
      formStatus.textContent = 'Le message n’a pas pu être envoyé. Écrivez directement à aziz.tlili900@gmail.com.';
    }
  });
});
