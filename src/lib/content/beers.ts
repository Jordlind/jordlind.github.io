import yaml from 'js-yaml';
import { marked } from 'marked';
import { abvFromOgFg, colorFromMalts, ibuForAddition } from '$lib/calculators/brewing';
import type {
	Beer,
	BeerContent,
	BeerMeta,
	BeerRecipeData,
	RecipeAddition,
	RecipeHop,
	RecipeMalt
} from '$lib/types';
import { locales, type Locale } from '$lib/i18n/translations';

// Eagerly import every beer markdown file as raw text. Files are named
// `<slug>.<locale>.md`, e.g. `midsommar-saison.sv.md`.
const files = import.meta.glob('/src/content/beers/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

// Optional canonical recipe files, one per beer slug.
const recipeFiles = import.meta.glob('/src/content/recipes/*.{yml,yaml}', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

type CanonicalHop = {
	name: string;
	grams: number;
	alphaAcidPercent: number;
	boilMinutes: number;
	expectedIbu?: number;
};

type CanonicalMalt = {
	name: string;
	weightKg: number;
	colorEbc: number | null;
	expectedSharePercent?: number;
};

type CanonicalRecipe = {
	batchVolumeL: number;
	mashWaterL?: number;
	preBoilVolumeL?: number;
	og: number;
	fg: number;
	mash?: { tempC: number; durationMin: number };
	boil?: { durationMin: number };
	hops: CanonicalHop[];
	malts: CanonicalMalt[];
	additions: { name: string; amount: string; addAt?: string }[];
	fermentation?: {
		tempC: number;
		lageringTempC?: number;
		lageringWeeks?: number;
		readyWeeks?: number;
	};
	yeast?: string;
	builtMeta?: {
		brewed?: string;
		images?: string[];
		available?: boolean;
		order?: number;
	};
};

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
	const match = raw.match(FRONTMATTER);
	if (!match) {
		return { data: {}, body: raw };
	}
	const data = (yaml.load(match[1]) as Record<string, unknown>) ?? {};
	return { data, body: match[2] };
}

function numberOrNull(value: unknown): number | null {
	if (value == null) return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function toGravity(gravityValue: number): number {
	if (gravityValue >= 1000) {
		return gravityValue / 1000;
	}
	return gravityValue;
}

function toGravityPoints(gravityValue: number): number {
	if (gravityValue >= 1000) {
		return Math.round(gravityValue);
	}
	return Math.round(gravityValue * 1000);
}

function parseCanonicalRecipes(): Map<string, CanonicalRecipe> {
	const result = new Map<string, CanonicalRecipe>();

	for (const [path, raw] of Object.entries(recipeFiles)) {
		const fileName = path.split('/').pop() ?? '';
		const slug = fileName.replace(/\.(yml|yaml)$/i, '');
		const data = (yaml.load(raw) as Record<string, unknown>) ?? {};

		const batchVolumeL = numberOrNull(data.batchVolumeL);
		const og = numberOrNull(data.og);
		const fg = numberOrNull(data.fg);

		if (batchVolumeL == null || og == null || fg == null) continue;

		const hopsRaw = Array.isArray(data.hops) ? data.hops : [];
		const hops: CanonicalHop[] = hopsRaw
			.map((hop) => {
				const item = (hop as Record<string, unknown>) ?? {};
				const grams = numberOrNull(item.grams);
				const alphaAcidPercent = numberOrNull(item.alphaAcidPercent);
				const boilMinutes = numberOrNull(item.boilMinutes);
				const expectedIbu = numberOrNull(item.expectedIbu);
				if (grams == null || alphaAcidPercent == null || boilMinutes == null) return null;
				return {
					name: String(item.name ?? 'Hop'),
					grams,
					alphaAcidPercent,
					boilMinutes,
					...(expectedIbu == null ? {} : { expectedIbu })
				};
			})
			.filter((hop): hop is CanonicalHop => hop !== null);

		const maltsRaw = Array.isArray(data.malts) ? data.malts : [];
		const malts: CanonicalMalt[] = maltsRaw
			.map((malt) => {
				const item = (malt as Record<string, unknown>) ?? {};
				const weightKg = numberOrNull(item.weightKg);
				const expectedSharePercent = numberOrNull(item.expectedSharePercent);
				if (weightKg == null) return null;
				return {
					name: String(item.name ?? 'Malt'),
					weightKg,
					colorEbc: numberOrNull(item.colorEbc),
					...(expectedSharePercent == null ? {} : { expectedSharePercent })
				};
			})
			.filter((malt): malt is CanonicalMalt => malt !== null);

		const additionsRaw = Array.isArray(data.additions) ? data.additions : [];
		const additions = additionsRaw
			.map((addition) => {
				const item = (addition as Record<string, unknown>) ?? {};
				if (!item.name) return null;
				return {
					name: String(item.name),
					amount: String(item.amount ?? ''),
					...(item.addAt != null ? { addAt: String(item.addAt) } : {})
				};
			})
			.filter((a): a is { name: string; amount: string; addAt?: string } => a !== null);

		const mashRaw =
			typeof data.mash === 'object' && data.mash != null
				? (data.mash as Record<string, unknown>)
				: undefined;

		const boilRaw =
			typeof data.boil === 'object' && data.boil != null
				? (data.boil as Record<string, unknown>)
				: undefined;

		const fermentationRaw =
			typeof data.fermentation === 'object' && data.fermentation != null
				? (data.fermentation as Record<string, unknown>)
				: undefined;

		const builtMetaRaw =
			typeof data.meta === 'object' && data.meta != null
				? (data.meta as Record<string, unknown>)
				: undefined;

		result.set(slug, {
			batchVolumeL,
			mashWaterL: numberOrNull(data.mashWaterL) ?? undefined,
			preBoilVolumeL: numberOrNull(data.preBoilVolumeL) ?? undefined,
			og,
			fg,
			hops,
			malts,
			additions,
			mash:
				mashRaw &&
				numberOrNull(mashRaw.tempC) != null &&
				numberOrNull(mashRaw.durationMin) != null
					? {
							tempC: numberOrNull(mashRaw.tempC)!,
							durationMin: numberOrNull(mashRaw.durationMin)!
						}
					: undefined,
			boil:
				boilRaw && numberOrNull(boilRaw.durationMin) != null
					? { durationMin: numberOrNull(boilRaw.durationMin)! }
					: undefined,
			fermentation: fermentationRaw && numberOrNull(fermentationRaw.tempC) != null
				? {
						tempC: numberOrNull(fermentationRaw.tempC)!,
						...(numberOrNull(fermentationRaw.lageringTempC) != null
							? { lageringTempC: numberOrNull(fermentationRaw.lageringTempC)! }
							: {}),
						...(numberOrNull(fermentationRaw.lageringWeeks) != null
							? { lageringWeeks: numberOrNull(fermentationRaw.lageringWeeks)! }
							: {}),
						...(numberOrNull(fermentationRaw.readyWeeks) != null
							? { readyWeeks: numberOrNull(fermentationRaw.readyWeeks)! }
							: {})
					}
				: undefined,
			yeast: data.yeast != null ? String(data.yeast) : undefined,
			builtMeta: builtMetaRaw
				? {
					brewed: builtMetaRaw.brewed != null ? String(builtMetaRaw.brewed) : undefined,
					images: Array.isArray(builtMetaRaw.images)
						? builtMetaRaw.images.map((image) => String(image))
						: undefined,
					available: typeof builtMetaRaw.available === 'boolean' ? builtMetaRaw.available : undefined,
					order: numberOrNull(builtMetaRaw.order) ?? undefined
				}
				: undefined
		});
	}

	return result;
}

function toRecipeData(recipe: CanonicalRecipe): BeerRecipeData {
	const malts: RecipeMalt[] = recipe.malts.map((malt) => ({
		name: malt.name,
		weightKg: malt.weightKg,
		colorEbc: malt.colorEbc,
		expectedSharePercent: malt.expectedSharePercent ?? null
	}));

	const hops: RecipeHop[] = recipe.hops.map((hop) => ({
		name: hop.name,
		grams: hop.grams,
		alphaAcidPercent: hop.alphaAcidPercent,
		boilMinutes: hop.boilMinutes,
		expectedIbu: hop.expectedIbu ?? null
	}));

	const additions: RecipeAddition[] = recipe.additions.map((a) => ({
		name: a.name,
		amount: a.amount,
		addAt: a.addAt ?? null
	}));

	return {
		og: toGravityPoints(recipe.og),
		fg: toGravityPoints(recipe.fg),
		water: {
			batchVolumeL: recipe.batchVolumeL,
			mashWaterL: recipe.mashWaterL ?? null,
			preBoilVolumeL: recipe.preBoilVolumeL ?? null
		},
		mash: recipe.mash
			? { tempC: recipe.mash.tempC, durationMin: recipe.mash.durationMin }
			: null,
		boil: recipe.boil ? { durationMin: recipe.boil.durationMin } : null,
		malts,
		hops,
		additions,
		fermentation: recipe.fermentation
			? {
					tempC: recipe.fermentation.tempC,
					lageringTempC: recipe.fermentation.lageringTempC ?? null,
					lageringWeeks: recipe.fermentation.lageringWeeks ?? null,
					readyWeeks: recipe.fermentation.readyWeeks ?? null
				}
			: null,
		yeast: recipe.yeast ?? null
	};
}

function computeDerivedMeta(recipe: CanonicalRecipe): Pick<BeerMeta, 'abv' | 'ibu' | 'ebc' | 'og' | 'fg'> {
	const ogGravity = toGravity(recipe.og);
	const fgGravity = toGravity(recipe.fg);

	const ibu = recipe.hops.reduce((sum, hop, index) => {
		return (
			sum +
			ibuForAddition(
				{
					id: index + 1,
					grams: hop.grams,
					alphaAcidPercent: hop.alphaAcidPercent,
					boilMinutes: hop.boilMinutes
				},
				ogGravity,
				recipe.batchVolumeL
			)
		);
	}, 0);

	const colorInputs = recipe.malts
		.filter((malt): malt is CanonicalMalt & { colorEbc: number } => malt.colorEbc != null)
		.map((malt, index) => ({
			id: index + 1,
			name: malt.name,
			weightKg: malt.weightKg,
			colorEbc: malt.colorEbc
		}));

	const color = colorInputs.length > 0 ? colorFromMalts(colorInputs, recipe.batchVolumeL) : null;

	return {
		abv: Number(abvFromOgFg(ogGravity, fgGravity).toFixed(1)),
		ibu: Number(ibu.toFixed(1)),
		ebc: color ? Number(color.ebc.toFixed(1)) : null,
		og: toGravityPoints(recipe.og),
		fg: toGravityPoints(recipe.fg)
	};
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

function toContent(slug: string, raw: string, canonicalRecipe?: CanonicalRecipe): BeerContent {
	const { data, body } = parseFrontmatter(raw);
	const computed = canonicalRecipe ? computeDerivedMeta(canonicalRecipe) : null;
	const canonicalImages = canonicalRecipe?.builtMeta?.images ?? [];
	const frontmatterImages = parseImages(data);
	const mergedImages = [...new Set([...canonicalImages, ...frontmatterImages])];
	const canonicalOrder = canonicalRecipe?.builtMeta?.order;
	const canonicalBrewed = canonicalRecipe?.builtMeta?.brewed;
	const canonicalAvailable = canonicalRecipe?.builtMeta?.available;
	const canonicalRecipeData = canonicalRecipe ? toRecipeData(canonicalRecipe) : null;

	const meta: BeerMeta = {
		slug,
		name: String(data.name ?? slug),
		style: String(data.style ?? ''),
		abv: computed?.abv ?? (data.abv != null ? Number(data.abv) : null),
		ibu: computed?.ibu ?? (data.ibu != null ? Number(data.ibu) : null),
		ebc: computed?.ebc ?? (data.ebc != null ? Number(data.ebc) : null),
		og: computed?.og ?? (data.og != null ? Number(data.og) : null),
		fg: computed?.fg ?? (data.fg != null ? Number(data.fg) : null),
		brewed: canonicalBrewed ?? (data.brewed != null ? String(data.brewed) : null),
		images: mergedImages,
		tagline: String(data.tagline ?? ''),
		available: canonicalAvailable ?? data.available !== false,
		order: canonicalOrder ?? (data.order != null ? Number(data.order) : 999)
	};
	return {
		...meta,
		recipeHtml: marked.parse(body, { async: false }) as string,
		recipeData: canonicalRecipeData
	};
}

function buildBeers(): Map<string, Beer> {
	const beers = new Map<string, Beer>();
	const recipes = parseCanonicalRecipes();

	for (const [path, raw] of Object.entries(files)) {
		const fileName = path.split('/').pop() ?? '';
		const nameMatch = fileName.match(/^(.+)\.([a-z]{2})\.md$/);
		if (!nameMatch) continue;

		const [, slug, localeRaw] = nameMatch;
		const locale = localeRaw as Locale;
		if (!locales.includes(locale)) continue;

		const content = toContent(slug, raw, recipes.get(slug));
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
