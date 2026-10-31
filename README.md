# Aziz Modele — Portfolio

An editorial model portfolio built as a lightweight static site. The visual selection uses optimized derivatives of the photographs supplied in `PP/`.

## Project structure

```text
index.html
styles.css
script.js
PP/optimized/       # resized JPEGs used by the site
```

## Local preview

```bash
python -m http.server 8000
```

Open <http://localhost:8000> in a browser. There is no build step or runtime framework.

## Features

- Responsive editorial layout with a touch-friendly mobile menu.
- Accessible photo lightbox with keyboard and swipe navigation.
- Reduced-motion support and lazy-loaded gallery images.
- Contact form powered by FormSubmit.

## Deployment

The public site is served from `AzizTliliMiageM1/aziz-modele-portfolio` on GitHub Pages (`master`, repository root).

This development checkout pushes to the private `portfolio-aziz` repository. GitHub Pages is not available for that private repository on the current plan, so pushes there alone do not update the public site. Publish site changes to the public mirror's `master` branch.
