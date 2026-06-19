import {
	abvFromOgFg,
	apparentAttenuation,
	colorFromMalts,
	estimateRecipeAbv,
	ibuForAddition,
	ibuForAdditionNoGravity,
	primingSugarGrams,
	type Fermentable,
	type FermentableType,
	type HopAddition,
	type MaltAddition,
	type PrimingSugarType
} from './brewing';
import type { BeerRecipeData } from '$lib/types';

/** The four values the recipe builder can compute. */
export type MetricId = 'abv' | 'ibu' | 'color' | 'priming';
export const METRIC_IDS: MetricId[] = ['abv', 'ibu', 'color', 'priming'];

export type BuilderMalt = { id: number; name: string; weightKg: number; colorEbc: number };
export type BuilderHop = {
	id: number;
	name: string;
	grams: number;
	alphaAcidPercent: number;
	boilMinutes: number;
};

/**
 * A single, manually editable recipe that drives every result. It mirrors the
 * calculation-relevant parts of a real beer recipe plus a few estimation-only
 * parameters (efficiency, yeast attenuation, priming settings).
 */
export interface BuilderRecipe {
	batchVolumeL: number;
	og: number;
	fg: number;
	useOgForIbu: boolean;
	mashTempC: number;
	efficiencyPercent: number;
	yeastAttenuationPercent: number;
	primingTempC: number;
	targetCo2Vol: number;
	sugarType: PrimingSugarType;
	malts: BuilderMalt[];
	hops: BuilderHop[];
}

export interface RecipeMetrics {
	abv: number;
	attenuation: number;
	ibu: number;
	color: { mcu: number; srm: number; ebc: number };
	priming: { grams: number; residualCo2: number; deltaCo2: number };
}

export function createDefaultRecipe(): BuilderRecipe {
	return {
		batchVolumeL: 20,
		og: 1.058,
		fg: 1.012,
		useOgForIbu: true,
		mashTempC: 67,
		efficiencyPercent: 75,
		yeastAttenuationPercent: 78,
		primingTempC: 20,
		targetCo2Vol: 2.4,
		sugarType: 'dextrose',
		malts: [
			{ id: 1, name: 'Pilsnermalt', weightKg: 4.8, colorEbc: 4 },
			{ id: 2, name: 'Münchnermalt', weightKg: 0.7, colorEbc: 18 }
		],
		hops: [{ id: 1, name: 'Saaz', grams: 20, alphaAcidPercent: 10, boilMinutes: 60 }]
	};
}

/** Infer an extract-potential category from a malt's name/colour. */
export function guessFermentableType(name: string, colorEbc: number | null): FermentableType {
	const n = name.toLowerCase();
	if (/socker|sugar|candi|dextro|honey|honung|syrup|sirap/.test(n)) return 'sugar';
	if (/crystal|caramel|karamell|caramunch|cara|kristall/.test(n)) return 'crystal';
	if (/munich|münchner|munchner|vienna|wiener/.test(n)) return 'viennaMunich';
	if (/flak|fling|oat|havre|wheat|vete|rye|råg|rag/.test(n)) return 'flaked';
	if ((colorEbc ?? 0) >= 60) return 'crystal';
	return 'base';
}

function toMaltAdditions(malts: BuilderMalt[]): MaltAddition[] {
	return malts.map((malt) => ({
		id: malt.id,
		name: malt.name,
		weightKg: malt.weightKg,
		colorEbc: malt.colorEbc
	}));
}

function toFermentables(malts: BuilderMalt[]): Fermentable[] {
	return malts.map((malt) => ({
		id: malt.id,
		name: malt.name,
		weightKg: malt.weightKg,
		type: guessFermentableType(malt.name, malt.colorEbc)
	}));
}

function toHopAdditions(hops: BuilderHop[]): HopAddition[] {
	return hops.map((hop) => ({
		id: hop.id,
		grams: hop.grams,
		alphaAcidPercent: hop.alphaAcidPercent,
		boilMinutes: hop.boilMinutes
	}));
}

export function computeRecipeMetrics(recipe: BuilderRecipe): RecipeMetrics {
	const volume = recipe.batchVolumeL;
	const hops = toHopAdditions(recipe.hops);

	const ibu = hops.reduce(
		(sum, hop) =>
			sum +
			(recipe.useOgForIbu
				? ibuForAddition(hop, recipe.og, volume)
				: ibuForAdditionNoGravity(hop, volume)),
		0
	);

	return {
		abv: abvFromOgFg(recipe.og, recipe.fg),
		attenuation: apparentAttenuation(recipe.og, recipe.fg),
		ibu,
		color: colorFromMalts(toMaltAdditions(recipe.malts), volume),
		priming: primingSugarGrams({
			volumeL: volume,
			targetCo2Vol: recipe.targetCo2Vol,
			beerTempC: recipe.primingTempC,
			sugarType: recipe.sugarType
		})
	};
}

/** Estimate OG/FG/attenuation from the grain bill, efficiency, yeast and mash. */
export function estimateGravity(recipe: BuilderRecipe): {
	og: number;
	fg: number;
	attenuation: number;
} {
	const { og, fg, attenuation } = estimateRecipeAbv({
		fermentables: toFermentables(recipe.malts),
		efficiencyPercent: recipe.efficiencyPercent,
		volumeL: recipe.batchVolumeL,
		baseAttenuationPercent: recipe.yeastAttenuationPercent,
		mashTempC: recipe.mashTempC
	});
	return { og, fg, attenuation };
}

function gravityToSg(value: number): number {
	if (value >= 1000) return value / 1000;
	return value;
}

const SUGAR_PATTERN = /socker|sugar|candi|dextro|honey|honung|syrup|sirap/i;

/** Build a fully editable recipe from imported canonical beer recipe data. */
export function recipeFromBeerData(data: BeerRecipeData): BuilderRecipe {
	const base = createDefaultRecipe();

	const malts: BuilderMalt[] = data.malts.map((malt, index) => ({
		id: index + 1,
		name: malt.name,
		weightKg: malt.weightKg,
		colorEbc: malt.colorEbc ?? 0
	}));

	// Sugar additions become malt rows so they still count toward OG estimation.
	const sugarRows: BuilderMalt[] = data.additions
		.filter((addition) => SUGAR_PATTERN.test(addition.name))
		.map((addition, index) => {
			const match = addition.amount.match(/([\d.,]+)\s*kg/i);
			const weightKg = match ? parseFloat(match[1].replace(',', '.')) : 0;
			return { id: malts.length + index + 1, name: addition.name, weightKg, colorEbc: 0 };
		})
		.filter((row) => row.weightKg > 0);

	const hops: BuilderHop[] = data.hops.map((hop, index) => ({
		id: index + 1,
		name: hop.name,
		grams: hop.grams,
		alphaAcidPercent: hop.alphaAcidPercent,
		boilMinutes: hop.boilMinutes
	}));

	const grainBill = [...malts, ...sugarRows];

	return {
		...base,
		batchVolumeL: data.water.batchVolumeL,
		og: gravityToSg(data.og),
		fg: gravityToSg(data.fg),
		mashTempC: data.mash?.tempC ?? base.mashTempC,
		malts: grainBill.length > 0 ? grainBill : base.malts,
		hops: hops.length > 0 ? hops : base.hops
	};
}
