# Jordlind 🍺

The website for **Jordlind**, a small family brewery run by **Alexander Jordan**
and **Dan Lindgren** — a son-in-law and a father-in-law who brew beer in their
spare time.

The name mixes our surnames (**Jord**an + **Lind**gren). _Jord_ ("earth") stands
for being down-to-earth — honest ingredients and honest craft. _Lind_ is the
linden tree, a symbol of comfort, stability and calm.

Live site: **https://jordlind.github.io/**

## Tech

- [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5) with `adapter-static`
- [Tailwind CSS v4](https://tailwindcss.com/)
- Content authored in Markdown (no database) — beers and pages are plain `.md`
  files with YAML frontmatter
- Bilingual (Swedish / English) via a small i18n store
- Deployed to GitHub Pages from `main` via GitHub Actions

## Editing content

All content lives under `src/content/` and is plain text — edit, commit, and push
to `main`; the site rebuilds and redeploys automatically.

### Add or edit a beer

Each beer is two Markdown files (one per language) in `src/content/beers/`,
named `<slug>.sv.md` and `<slug>.en.md`. The part before `.sv`/`.en` becomes the
page URL (e.g. `summer-saison` → `/beers/summer-saison`).

```markdown
---
name: Summer Saison
style: Saison / Farmhouse Ale
abv: 6.2
ibu: 28
brewed: 2025-06-21
images:
  - summer-saison.svg
  - summer-saison-2.svg
tagline: A bright, peppery saison for long summer evenings.
available: true
order: 1
---

## Recipe

...the recipe in Markdown (tables, lists, headings all work)...
```

- Use `images:` for a list of photos (a left/right carousel appears automatically
  when there's more than one). A single `image:` value also works.
- Put image files in `static/beers/` and reference them by filename.
- `available: false` shows a "Sold out" badge.
- `order:` controls sort order (lower comes first).

### Edit the About page

Edit `src/content/pages/about.sv.md` and `src/content/pages/about.en.md`.

### UI text (menus, labels)

Lives in `src/lib/i18n/translations.ts`.

## Develop locally

```bash
npm install
npm run dev          # start the dev server
npm run build        # production build (what GitHub Pages runs)
npm run preview      # preview the production build
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the static
site and publishes it to GitHub Pages.

> Note: the repository is named `jordlind.github.io` so the site is served from the
> root URL. `BASE_PATH` in the deploy workflow is therefore empty. If the repo is
> ever renamed to a regular project repo, set `BASE_PATH` to `/<repo-name>`.
