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
page URL (e.g. `belgisk-tripel` → `/beers/belgisk-tripel`).

```markdown
---
name: Belgian Tripel
style: Belgian Tripel
abv: 9.1
ibu: 30
ebc: 11.4
og: 1080
fg: 1013
brewed: 2026-06-14
images:
  - light-beer.svg
  - amber-beer.svg
tagline: Deceptively smooth and golden — strong, dry and dangerously drinkable.
available: true
order: 1
---

# Recipe (23 litres)

A short intro paragraph about the beer.

## Malt

...the rest of the recipe in Markdown (tables, lists, headings all work)...
```

- The body should start with a single `#` heading — it becomes the page's recipe
  title. Use `##` for the sections below it (Malt, Hops, …).
- `abv`, `ibu`, `ebc`, `og` and `fg` are optional. When present they appear in the
  stats grid; `ebc` also renders a small colour swatch. Missing ones show `-`.
- Use `images:` for a list of photos (a left/right carousel appears automatically
  when there's more than one). A single `image:` value also works. Placeholder
  art is available: `light-beer.svg`, `amber-beer.svg`, `dark-beer.svg` and
  `beer-bottle.svg`.
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
