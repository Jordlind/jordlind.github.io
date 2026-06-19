import yaml from 'js-yaml';
import { effectiveGravity, type BuilderRecipe, type RecipeMetrics } from './recipe';

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

/**
 * A plain, serialisable object that mirrors the canonical recipe YAML schema
 * (`src/content/recipes/*.yml`) so an export can be dropped straight into the
 * content folder, with the live computed results attached for reference.
 */
export function recipeToObject(recipe: BuilderRecipe, metrics: RecipeMetrics) {
	const { og, fg } = effectiveGravity(recipe);
	return {
		batchVolumeL: recipe.batchVolumeL,
		mashWaterL: recipe.mashWaterL,
		spargeWaterL: recipe.spargeWaterL,
		preBoilVolumeL: recipe.preBoilVolumeL,
		og: gravityPoints(og),
		fg: gravityPoints(fg),
		mash: { tempC: recipe.mashTempC },
		malts: recipe.malts.map((malt) => ({
			name: malt.name,
			weightKg: malt.weightKg,
			colorEbc: malt.colorEbc
		})),
		hops: recipe.hops.map((hop) => ({
			name: hop.name,
			grams: hop.grams,
			alphaAcidPercent: hop.alphaAcidPercent,
			boilMinutes: hop.boilMinutes
		})),
		priming: {
			tempC: recipe.primingTempC,
			targetCo2Vol: recipe.targetCo2Vol,
			sugarType: recipe.sugarType
		},
		estimated: {
			abv: round(metrics.abv, 1),
			ibu: round(metrics.ibu, 1),
			ebc: round(metrics.color.ebc, 1)
		}
	};
}

export function recipeToYaml(recipe: BuilderRecipe, metrics: RecipeMetrics): string {
	return yaml.dump(recipeToObject(recipe, metrics), { lineWidth: 100, noRefs: true });
}

export function recipeToJson(recipe: BuilderRecipe, metrics: RecipeMetrics): string {
	return JSON.stringify(recipeToObject(recipe, metrics), null, 2);
}

export function recipeToMarkdown(
	recipe: BuilderRecipe,
	metrics: RecipeMetrics,
	t: (key: string) => string,
	nf: Intl.NumberFormat
): string {
	const { og, fg } = effectiveGravity(recipe);
	const lines: string[] = [];

	lines.push(`# ${t('calc.export.recipeHeading')}`);
	lines.push('');
	lines.push(
		`**${t('calc.abv')}:** ${nf.format(metrics.abv)} %  ·  ` +
			`**${t('calc.totalIbu')}:** ${nf.format(metrics.ibu)}  ·  ` +
			`**${t('calc.colorEbc')}:** ${nf.format(metrics.color.ebc)}`
	);
	lines.push('');

	lines.push(`## ${t('calc.build.section.water')}`);
	lines.push(`- ${t('calc.water.mash')}: ${recipe.mashWaterL}`);
	lines.push(`- ${t('calc.water.sparge')}: ${recipe.spargeWaterL}`);
	lines.push(`- ${t('calc.water.preBoil')}: ${recipe.preBoilVolumeL}`);
	lines.push(`- ${t('calc.water.batch')}: ${recipe.batchVolumeL}`);
	lines.push('');

	lines.push(`## ${t('calc.grainBill')}`);
	lines.push(`| ${t('calc.fieldName')} | ${t('calc.maltWeight')} | ${t('calc.maltColor')} |`);
	lines.push('| --- | --- | --- |');
	for (const malt of recipe.malts) {
		lines.push(`| ${malt.name || '–'} | ${malt.weightKg} | ${malt.colorEbc} |`);
	}
	lines.push('');

	lines.push(`## ${t('calc.hops')}`);
	lines.push(
		`| ${t('calc.fieldName')} | ${t('calc.hopAmount')} | ${t('calc.alphaAcid')} | ${t('calc.boilTime')} |`
	);
	lines.push('| --- | --- | --- | --- |');
	for (const hop of recipe.hops) {
		lines.push(
			`| ${hop.name || '–'} | ${hop.grams} | ${hop.alphaAcidPercent} | ${hop.boilMinutes} |`
		);
	}
	lines.push('');

	lines.push(`## ${t('calc.build.section.gravity')}`);
	lines.push(`- ${t('calc.start')}: ${og.toFixed(3)}`);
	lines.push(`- ${t('calc.final')}: ${fg.toFixed(3)}`);
	lines.push(`- ${t('calc.abv.estimate.mashTemp')}: ${recipe.mashTempC}`);
	lines.push('');

	lines.push(`## ${t('calc.build.section.priming')}`);
	lines.push(`- ${t('calc.temp')}: ${recipe.primingTempC}`);
	lines.push(`- ${t('calc.targetCo2')}: ${recipe.targetCo2Vol}`);
	lines.push(`- ${t('calc.sugarType')}: ${t(`calc.sugar.${recipe.sugarType}`)}`);
	lines.push('');

	return lines.join('\n');
}

export function serializeRecipe(
	format: ExportFormat,
	recipe: BuilderRecipe,
	metrics: RecipeMetrics,
	t: (key: string) => string,
	nf: Intl.NumberFormat
): string {
	switch (format) {
		case 'json':
			return recipeToJson(recipe, metrics);
		case 'markdown':
			return recipeToMarkdown(recipe, metrics, t, nf);
		default:
			return recipeToYaml(recipe, metrics);
	}
}
