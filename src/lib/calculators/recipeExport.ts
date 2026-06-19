import yaml from 'js-yaml';
import { ibuForAddition } from './brewing';
import {
	createDefaultSections,
	effectiveGravity,
	type BuilderRecipe,
	type RecipeMetrics,
	type SectionState
} from './recipe';
import type { Locale } from '$lib/i18n/translations';

export type ExportFormat = 'yaml' | 'json' | 'markdown';

export const EXPORT_FORMATS: { id: ExportFormat; label: string; ext: string }[] = [
	{ id: 'yaml', label: 'YAML', ext: 'yml' },
	{ id: 'json', label: 'JSON', ext: 'json' },
	{ id: 'markdown', label: 'Markdown', ext: 'md' }
];

function round(value: number, decimals = 0): number {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

/** Express a specific gravity (e.g. 1.058) as integer points (1058), like the canonical recipe YAML. */
function gravityPoints(sg: number): number {
	return Math.round(sg * 1000);
}

/** Turn a recipe name into a filename-friendly slug. */
export function recipeSlug(recipe: BuilderRecipe): string {
	const slug = recipe.name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug || 'recept';
}

/** Per-malt share of the total grain bill, in whole percent. */
function maltSharePercents(recipe: BuilderRecipe): number[] {
	const total = recipe.malts.reduce((sum, malt) => sum + (malt.weightKg || 0), 0);
	if (total <= 0) return recipe.malts.map(() => 0);
	return recipe.malts.map((malt) => Math.round(((malt.weightKg || 0) / total) * 100));
}

/** The localized content block (name/style/tagline/description) for the active locale. */
function contentBlock(recipe: BuilderRecipe, locale: Locale) {
	return {
		[locale]: {
			name: recipe.name,
			style: recipe.style,
			tagline: recipe.tagline,
			description: recipe.description
		}
	};
}

/**
 * A plain, serialisable object that mirrors the consolidated recipe YAML schema
 * (`src/content/recipes/*.yml`). Collapsed sections are omitted from the output,
 * so the export reflects exactly what is enabled in the builder.
 */
export function canonicalRecipeObject(
	recipe: BuilderRecipe,
	sections: SectionState = createDefaultSections(),
	locale: Locale = 'sv'
) {
	const { og, fg } = effectiveGravity(recipe);
	const shares = maltSharePercents(recipe);

	const obj: Record<string, unknown> = {};

	if (sections.identity) obj.content = contentBlock(recipe, locale);

	obj.batchVolumeL = recipe.batchVolumeL;
	if (sections.mash) obj.mashWaterL = recipe.mashWaterL;
	if (sections.boil) obj.preBoilVolumeL = recipe.preBoilVolumeL;

	if (sections.gravity) {
		obj.og = gravityPoints(og);
		obj.fg = gravityPoints(fg);
		obj.efficiencyPercent = recipe.efficiencyPercent;
	}

	if (sections.mash) {
		obj.mash = { tempC: recipe.mashTempC, durationMin: recipe.mashDurationMin };
	}
	if (sections.boil) {
		obj.boil = { durationMin: recipe.boilDurationMin };
		obj.hops = recipe.hops.map((hop) => ({
			name: hop.name,
			grams: hop.grams,
			alphaAcidPercent: hop.alphaAcidPercent,
			boilMinutes: hop.boilMinutes,
			expectedIbu: round(ibuForAddition(hop, og, recipe.batchVolumeL), 1)
		}));
	}
	if (sections.mash) {
		obj.malts = recipe.malts.map((malt, index) => ({
			name: malt.name,
			weightKg: malt.weightKg,
			colorEbc: malt.colorEbc,
			expectedSharePercent: shares[index]
		}));
	}
	if (sections.boil && recipe.additions.length > 0) {
		obj.additions = recipe.additions.map((addition) => ({
			name: addition.name,
			amount: addition.amount,
			...(addition.addAt ? { addAt: addition.addAt } : {})
		}));
	}

	const fermentation: Record<string, number> = {};
	if (sections.fermentation) {
		fermentation.tempC = recipe.fermTempC;
		if (recipe.yeastAttenuationPercent > 0) {
			fermentation.attenuationPercent = recipe.yeastAttenuationPercent;
		}
	}
	if (sections.lagering) {
		if (recipe.lageringWeeks > 0) {
			fermentation.lageringTempC = recipe.lageringTempC;
			fermentation.lageringWeeks = recipe.lageringWeeks;
		}
		if (recipe.readyWeeks > 0) fermentation.readyWeeks = recipe.readyWeeks;
	}
	if (Object.keys(fermentation).length > 0) obj.fermentation = fermentation;
	if (sections.fermentation) obj.yeast = recipe.yeast;

	if (sections.priming) {
		obj.priming = {
			tempC: recipe.primingTempC,
			targetCo2Vol: recipe.targetCo2Vol,
			sugarType: recipe.sugarType
		};
	}

	const meta: Record<string, unknown> = { status: recipe.status };
	if (recipe.brewed) meta.brewed = recipe.brewed;
	obj.meta = meta;

	return obj;
}

export function recipeToYaml(
	recipe: BuilderRecipe,
	sections: SectionState = createDefaultSections(),
	locale: Locale = 'sv'
): string {
	return yaml.dump(canonicalRecipeObject(recipe, sections, locale), {
		lineWidth: 100,
		noRefs: true
	});
}

export function recipeToJson(
	recipe: BuilderRecipe,
	metrics: RecipeMetrics,
	sections: SectionState = createDefaultSections(),
	locale: Locale = 'sv'
): string {
	const { og, fg } = effectiveGravity(recipe);
	return JSON.stringify(
		{
			recipe: canonicalRecipeObject(recipe, sections, locale),
			results: {
				og: round(og, 3),
				fg: round(fg, 3),
				abv: round(metrics.abv, 1),
				ibu: round(metrics.ibu, 1),
				ebc: round(metrics.color.ebc, 1),
				srm: round(metrics.color.srm, 1),
				priming: round(metrics.priming.grams, 1)
			}
		},
		null,
		2
	);
}

type MarkdownLabels = {
	style: string;
	overview: string;
	og: string;
	fg: string;
	abv: string;
	ibu: string;
	colour: string;
	batch: string;
	mash: string;
	mashWater: string;
	mashTemp: string;
	mashTime: string;
	grainBill: string;
	colEbc: string;
	colShare: string;
	boil: string;
	preBoil: string;
	boilTime: string;
	hops: string;
	colAlpha: string;
	colBoilMin: string;
	colIbu: string;
	additions: string;
	colAmount: string;
	colTiming: string;
	fermentation: string;
	fermTemp: string;
	attenuation: string;
	yeast: string;
	conditioning: string;
	lagerTemp: string;
	lagerWeeks: string;
	readyAfter: string;
	priming: string;
	primingTemp: string;
	targetCo2: string;
	sugarType: string;
	weeks: string;
	min: string;
};

const MARKDOWN_LABELS: Record<Locale, MarkdownLabels> = {
	sv: {
		style: 'Stil',
		overview: 'Översikt',
		og: 'OG',
		fg: 'FG',
		abv: 'ABV',
		ibu: 'IBU',
		colour: 'Färg (EBC)',
		batch: 'Satsvolym',
		mash: 'Mäskning',
		mashWater: 'Mäskvatten',
		mashTemp: 'Mäsktemperatur',
		mashTime: 'Mäsktid',
		grainBill: 'Maltnota',
		colEbc: 'EBC',
		colShare: 'Andel',
		boil: 'Kokning',
		preBoil: 'Kokvolym',
		boilTime: 'Koktid',
		hops: 'Humle',
		colAlpha: 'Alfasyra %',
		colBoilMin: 'Koktid (min)',
		colIbu: 'IBU',
		additions: 'Övriga tillsatser',
		colAmount: 'Mängd',
		colTiming: 'Tidpunkt',
		fermentation: 'Jäsning',
		fermTemp: 'Jästemperatur',
		attenuation: 'Utjäsningsgrad',
		yeast: 'Jäst',
		conditioning: 'Lagring & mognad',
		lagerTemp: 'Lagringstemperatur',
		lagerWeeks: 'Lagringstid',
		readyAfter: 'Klar efter',
		priming: 'Kolsättning',
		primingTemp: 'Öltemperatur',
		targetCo2: 'Mål CO₂',
		sugarType: 'Sockertyp',
		weeks: 'veckor',
		min: 'min'
	},
	en: {
		style: 'Style',
		overview: 'Overview',
		og: 'OG',
		fg: 'FG',
		abv: 'ABV',
		ibu: 'IBU',
		colour: 'Colour (EBC)',
		batch: 'Batch volume',
		mash: 'Mash',
		mashWater: 'Mash water',
		mashTemp: 'Mash temperature',
		mashTime: 'Mash time',
		grainBill: 'Grain bill',
		colEbc: 'EBC',
		colShare: 'Share',
		boil: 'Boil',
		preBoil: 'Pre-boil volume',
		boilTime: 'Boil time',
		hops: 'Hops',
		colAlpha: 'Alpha acid %',
		colBoilMin: 'Boil time (min)',
		colIbu: 'IBU',
		additions: 'Other additions',
		colAmount: 'Amount',
		colTiming: 'Timing',
		fermentation: 'Fermentation',
		fermTemp: 'Fermentation temp',
		attenuation: 'Attenuation',
		yeast: 'Yeast',
		conditioning: 'Conditioning & maturation',
		lagerTemp: 'Lagering temperature',
		lagerWeeks: 'Lagering time',
		readyAfter: 'Ready after',
		priming: 'Priming',
		primingTemp: 'Beer temperature',
		targetCo2: 'Target CO₂',
		sugarType: 'Sugar type',
		weeks: 'weeks',
		min: 'min'
	}
};

/** A complete, human-readable Markdown recipe document. */
export function recipeToMarkdown(
	recipe: BuilderRecipe,
	metrics: RecipeMetrics,
	sections: SectionState = createDefaultSections(),
	locale: Locale = 'sv'
): string {
	const L = MARKDOWN_LABELS[locale];
	const { og, fg } = effectiveGravity(recipe);
	const lines: string[] = [];

	const heading = recipe.name.trim() || (locale === 'sv' ? 'Recept' : 'Recipe');
	lines.push(`# ${heading}`);
	if (recipe.style.trim()) lines.push('', `*${recipe.style.trim()}*`);
	if (recipe.tagline.trim()) lines.push('', `> ${recipe.tagline.trim()}`);
	if (sections.identity && recipe.description.trim()) {
		lines.push('', recipe.description.trim());
	}

	// Overview stats
	lines.push('', `## ${L.overview}`, '');
	const stats: string[] = [`- **${L.batch}:** ${round(recipe.batchVolumeL, 1)} L`];
	if (sections.gravity) {
		stats.push(`- **${L.og}:** ${og.toFixed(3)}`);
		stats.push(`- **${L.fg}:** ${fg.toFixed(3)}`);
		stats.push(`- **${L.abv}:** ${round(metrics.abv, 1)} %`);
	}
	if (sections.boil) stats.push(`- **${L.ibu}:** ${round(metrics.ibu, 1)}`);
	if (sections.mash) stats.push(`- **${L.colour}:** ${round(metrics.color.ebc, 1)} EBC`);
	lines.push(...stats);

	// Mash
	if (sections.mash) {
		lines.push('', `## ${L.mash}`, '');
		lines.push(`- **${L.mashWater}:** ${round(recipe.mashWaterL, 1)} L`);
		lines.push(`- **${L.mashTemp}:** ${recipe.mashTempC} °C`);
		lines.push(`- **${L.mashTime}:** ${recipe.mashDurationMin} ${L.min}`);
		lines.push('', `### ${L.grainBill}`, '');
		lines.push(`| ${L.grainBill} | kg | ${L.colEbc} | ${L.colShare} |`);
		lines.push('| --- | ---: | ---: | ---: |');
		const shares = maltSharePercents(recipe);
		recipe.malts.forEach((malt, index) => {
			lines.push(
				`| ${malt.name || '—'} | ${round(malt.weightKg, 2)} | ${round(malt.colorEbc, 0)} | ${shares[index]} % |`
			);
		});
	}

	// Boil
	if (sections.boil) {
		lines.push('', `## ${L.boil}`, '');
		lines.push(`- **${L.preBoil}:** ${round(recipe.preBoilVolumeL, 1)} L`);
		lines.push(`- **${L.boilTime}:** ${recipe.boilDurationMin} ${L.min}`);
		lines.push('', `### ${L.hops}`, '');
		lines.push(`| ${L.hops} | g | ${L.colAlpha} | ${L.colBoilMin} | ${L.colIbu} |`);
		lines.push('| --- | ---: | ---: | ---: | ---: |');
		recipe.hops.forEach((hop) => {
			lines.push(
				`| ${hop.name || '—'} | ${round(hop.grams, 1)} | ${round(hop.alphaAcidPercent, 1)} | ${hop.boilMinutes} | ${round(ibuForAddition(hop, og, recipe.batchVolumeL), 1)} |`
			);
		});
		if (recipe.additions.length > 0) {
			lines.push('', `### ${L.additions}`, '');
			lines.push(`| ${L.additions} | ${L.colAmount} | ${L.colTiming} |`);
			lines.push('| --- | --- | --- |');
			recipe.additions.forEach((addition) => {
				lines.push(`| ${addition.name || '—'} | ${addition.amount || '—'} | ${addition.addAt || '—'} |`);
			});
		}
	}

	// Fermentation
	if (sections.fermentation) {
		lines.push('', `## ${L.fermentation}`, '');
		lines.push(`- **${L.fermTemp}:** ${recipe.fermTempC} °C`);
		if (recipe.yeastAttenuationPercent > 0) {
			lines.push(`- **${L.attenuation}:** ${recipe.yeastAttenuationPercent} %`);
		}
		if (recipe.yeast.trim()) lines.push(`- **${L.yeast}:** ${recipe.yeast.trim()}`);
	}

	// Conditioning
	if (sections.lagering && (recipe.lageringWeeks > 0 || recipe.readyWeeks > 0)) {
		lines.push('', `## ${L.conditioning}`, '');
		if (recipe.lageringWeeks > 0) {
			lines.push(`- **${L.lagerTemp}:** ${recipe.lageringTempC} °C`);
			lines.push(`- **${L.lagerWeeks}:** ${recipe.lageringWeeks} ${L.weeks}`);
		}
		if (recipe.readyWeeks > 0) {
			lines.push(`- **${L.readyAfter}:** ${recipe.readyWeeks} ${L.weeks}`);
		}
	}

	// Priming
	if (sections.priming) {
		lines.push('', `## ${L.priming}`, '');
		lines.push(`- **${L.primingTemp}:** ${recipe.primingTempC} °C`);
		lines.push(`- **${L.targetCo2}:** ${round(recipe.targetCo2Vol, 1)} vol`);
		lines.push(`- **${L.sugarType}:** ${recipe.sugarType}`);
		lines.push(`- **${L.priming} (g):** ${round(metrics.priming.grams, 1)}`);
	}

	return lines.join('\n') + '\n';
}

export function serializeRecipe(
	format: ExportFormat,
	recipe: BuilderRecipe,
	metrics: RecipeMetrics,
	sections: SectionState = createDefaultSections(),
	locale: Locale = 'sv'
): string {
	switch (format) {
		case 'json':
			return recipeToJson(recipe, metrics, sections, locale);
		case 'markdown':
			return recipeToMarkdown(recipe, metrics, sections, locale);
		default:
			return recipeToYaml(recipe, sections, locale);
	}
}
