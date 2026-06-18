import type { Locale } from '$lib/i18n/translations';

/** Structured data parsed from a beer markdown file's frontmatter. */
export interface BeerMeta {
	slug: string;
	name: string;
	style: string;
	abv: number | null;
	ibu: number | null;
	ebc: number | null;
	og: number | null;
	fg: number | null;
	brewed: string | null;
	images: string[];
	tagline: string;
	available: boolean;
	order: number;
}

/** A beer's content for a single language: metadata + rendered recipe. */
export interface BeerContent extends BeerMeta {
	recipeHtml: string;
}

/** A beer aggregated across all available languages. */
export interface Beer {
	slug: string;
	order: number;
	images: string[];
	content: Partial<Record<Locale, BeerContent>>;
}
