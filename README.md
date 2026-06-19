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

Each beer uses three files with the same slug:

- `src/content/recipes/<slug>.yml` for canonical brewing data
- `src/content/beers/<slug>.en.md` for English text
- `src/content/beers/<slug>.sv.md` for Swedish text

The part before `.sv`/`.en` becomes the page URL (e.g. `belgisk-tripel` →
`/beers/belgisk-tripel`).

```markdown
---
name: Belgian Tripel
style: Belgian Tripel
tagline: Deceptively smooth and golden — strong, dry and dangerously drinkable.
---

# Recipe (23 litres)

A short intro paragraph about the beer.

## Malt

...the rest of the recipe in Markdown (tables, lists, headings all work)...
```

Canonical recipe example (`src/content/recipes/belgian-tripel.yml`):

```yaml
batchVolumeL: 23
mashWaterL: 16.3
preBoilVolumeL: 27
og: 1080
fg: 1013
hops:
  - name: Saaz
    grams: 65
    alphaAcidPercent: 3.9
    boilMinutes: 60
    expectedIbu: 29.2
malts:
  - name: Pilsner malt
    weightKg: 5.5
    colorEbc: 4
    expectedSharePercent: 96
meta:
  brewed: 2026-06-14
  images:
    - light-beer.svg
  status: available
```

When a canonical recipe file exists, ABV/IBU/EBC/OG/FG are automatically computed
from it and shared by both language pages.

- The body should start with a single `#` heading — it becomes the page's recipe
  title. Use `##` for the sections below it (Malt, Hops, …).
- Numeric brew fields (`abv`, `ibu`, `ebc`, `og`, `fg`) are computed from canonical
  recipe data and should not be added to markdown frontmatter.
- Shared metadata (`brewed`, `images`/`image`, `status`) also belongs in
  canonical recipe YAML (`meta:`), not per-language markdown.
- Use `images:` for a list of photos (a left/right carousel appears automatically
  when there's more than one). A single `image:` value also works.
- Put explicit beer photos in `static/beers/photos/` and reference them like
  `photos/my-beer.jpg` in `meta.images`.
- Placeholder art is automatic when `meta.images` is empty/missing: the site
  picks `static/beers/placeholders/placeholder-ebc-<bucket>.svg` from the beer's
  computed EBC (or `placeholders/beer-bottle.svg` if no EBC is available).
- `status:` controls lifecycle badges/sections (`available`, `planned`, `archived`, `none`).

### Edit the About page

Edit `src/content/pages/about.sv.md` and `src/content/pages/about.en.md`.

### UI text (menus, labels)

Lives in `src/lib/i18n/translations.ts`.

## Develop locally

```bash
npm install
npm run dev          # start the dev server
npm run recipes:check # validate recipe structure and locale pairing
npm run build        # production build (what GitHub Pages runs)
npm run preview      # preview the production build
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the static
site and publishes it to GitHub Pages.

> Note: the repository is named `jordlind.github.io` so the site is served from the
> root URL. `BASE_PATH` in the deploy workflow is therefore empty. If the repo is
> ever renamed to a regular project repo, set `BASE_PATH` to `/<repo-name>`.
