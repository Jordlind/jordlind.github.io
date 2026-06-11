import yaml from 'js-yaml';
import { marked } from 'marked';
import type { Beer, BeerContent, BeerMeta } from '$lib/types';
import { locales, type Locale } from '$lib/i18n/translations';

// Eagerly import every beer markdown file as raw text. Files are named
// `<slug>.<locale>.md`, e.g. `midsommar-saison.sv.md`.
const files = import.meta.glob('/src/content/beers/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
	const match = raw.match(FRONTMATTER);
	if (!match) {
		return { data: {}, body: raw };
	}
	const data = (yaml.load(match[1]) as Record<string, unknown>) ?? {};
	return { data, body: match[2] };
}

// Accepts an `images:` list and/or a single `image:` value, in any order,
// and returns a de-duplicated list of filenames.
function parseImages(data: Record<string, unknown>): string[] {
	const result: string[] = [];
	if (Array.isArray(data.images)) {
		for (const item of data.images) {
			if (item != null) result.push(String(item));
		}
	}
	if (data.image != null) result.push(String(data.image));
	return [...new Set(result)];
}

function toContent(slug: string, raw: string): BeerContent {
	const { data, body } = parseFrontmatter(raw);
	const meta: BeerMeta = {
		slug,
		name: String(data.name ?? slug),
		style: String(data.style ?? ''),
		abv: data.abv != null ? Number(data.abv) : null,
		ibu: data.ibu != null ? Number(data.ibu) : null,
		brewed: data.brewed != null ? String(data.brewed) : null,
		images: parseImages(data),
		tagline: String(data.tagline ?? ''),
		available: data.available !== false,
		order: data.order != null ? Number(data.order) : 999
	};
	return { ...meta, recipeHtml: marked.parse(body, { async: false }) as string };
}

function buildBeers(): Map<string, Beer> {
	const beers = new Map<string, Beer>();

	for (const [path, raw] of Object.entries(files)) {
		const fileName = path.split('/').pop() ?? '';
		const nameMatch = fileName.match(/^(.+)\.([a-z]{2})\.md$/);
		if (!nameMatch) continue;

		const [, slug, localeRaw] = nameMatch;
		const locale = localeRaw as Locale;
		if (!locales.includes(locale)) continue;

		const content = toContent(slug, raw);
		const existing = beers.get(slug);
		if (existing) {
			existing.content[locale] = content;
		} else {
			beers.set(slug, {
				slug,
				order: content.order,
				images: content.images,
				content: { [locale]: content }
			});
		}
	}

	// Keep order/images in sync from whichever locale has them.
	for (const beer of beers.values()) {
		for (const c of Object.values(beer.content)) {
			if (c) {
				if (c.order !== 999) beer.order = c.order;
				if (c.images.length > 0) beer.images = c.images;
			}
		}
	}

	return beers;
}

const beerMap = buildBeers();

function sortBeers(a: Beer, b: Beer): number {
	if (a.order !== b.order) return a.order - b.order;
	const aDate = pickAny(a)?.brewed ?? '';
	const bDate = pickAny(b)?.brewed ?? '';
	return bDate.localeCompare(aDate);
}

function pickAny(beer: Beer): BeerContent | undefined {
	for (const locale of locales) {
		if (beer.content[locale]) return beer.content[locale];
	}
	return undefined;
}

/** All beers, sorted by `order` then most-recently brewed. */
export function getAllBeers(): Beer[] {
	return [...beerMap.values()].sort(sortBeers);
}

/** Slugs for prerendering dynamic routes. */
export function getBeerSlugs(): string[] {
	return [...beerMap.keys()];
}

/** Look up a single beer by slug. */
export function getBeer(slug: string): Beer | undefined {
	return beerMap.get(slug);
}

/** Resolve a beer's content for a locale, falling back to any other language. */
export function localizedContent(beer: Beer, locale: Locale): BeerContent | undefined {
	return beer.content[locale] ?? pickAny(beer);
}

/** True when the requested locale is missing and we fell back to another. */
export function isFallback(beer: Beer, locale: Locale): boolean {
	return !beer.content[locale] && pickAny(beer) !== undefined;
}
