import type { Locale } from '$lib/i18n/translations';

export interface RecipeMalt {
	name: string;
	weightKg: number;
	colorEbc: number | null;
	expectedSharePercent: number | null;
}

export interface RecipeHop {
	name: string;
	grams: number;
	alphaAcidPercent: number;
	boilMinutes: number;
	expectedIbu: number | null;
}

export interface RecipeWaterProfile {
	batchVolumeL: number;
	mashWaterL: number | null;
	preBoilVolumeL: number | null;
}

export interface RecipeMash {
	tempC: number;
	durationMin: number;
}

export interface RecipeBoil {
	durationMin: number;
}

export interface RecipeAddition {
	name: string;
	amount: string;
	addAt: string | null;
}

export interface RecipeFermentation {
	tempC: number;
	lageringTempC: number | null;
	lageringWeeks: number | null;
	readyWeeks: number | null;
}

export interface BeerRecipeData {
	og: number;
	fg: number;
	water: RecipeWaterProfile;
	mash: RecipeMash | null;
	boil: RecipeBoil | null;
	malts: RecipeMalt[];
	hops: RecipeHop[];
	additions: RecipeAddition[];
	fermentation: RecipeFermentation | null;
	yeast: string | null;
}

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
	recipeData: BeerRecipeData | null;
}

/** A beer aggregated across all available languages. */
export interface Beer {
	slug: string;
	order: number;
	images: string[];
	content: Partial<Record<Locale, BeerContent>>;
}
