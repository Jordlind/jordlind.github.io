<script lang="ts">
	import { ebcColor } from '$lib/beerColor';
	import type { MetricId, RecipeMetrics } from '$lib/calculators/recipe';

	let {
		t,
		metrics,
		enabled,
		useOgForIbu,
		numberFormatter
	}: {
		t: (key: string) => string;
		metrics: RecipeMetrics;
		enabled: Record<MetricId, boolean>;
		useOgForIbu: boolean;
		numberFormatter: Intl.NumberFormat;
	} = $props();

	const anyEnabled = $derived(enabled.abv || enabled.ibu || enabled.color || enabled.priming);
</script>

<aside class="space-y-4 lg:sticky lg:top-24 lg:self-start">
	<p class="text-sm font-medium tracking-wide text-roast-soft uppercase">{t('calc.results')}</p>

	{#if !anyEnabled}
		<div class="rounded-2xl border border-dashed border-malt bg-malt/20 p-6 text-sm text-roast-soft">
			{t('calc.build.empty')}
		</div>
	{/if}

	{#if enabled.abv}
		<div class="rounded-2xl border border-malt bg-malt/40 p-6">
			<p class="text-xs font-semibold tracking-wide text-roast-soft uppercase">{t('calc.abv')}</p>
			<p class="mt-1 font-display text-4xl font-bold text-amber-deep">{numberFormatter.format(metrics.abv)}%</p>
			<p class="mt-2 text-sm text-roast-soft">{t('calc.attenuation')}: {numberFormatter.format(metrics.attenuation)}%</p>
			<p class="mt-3 text-xs text-roast-soft/70">{t('calc.formulaAbv')}</p>
		</div>
	{/if}

	{#if enabled.ibu}
		<div class="rounded-2xl border border-malt bg-malt/40 p-6">
			<p class="text-xs font-semibold tracking-wide text-roast-soft uppercase">{t('calc.totalIbu')}</p>
			<p class="mt-1 font-display text-4xl font-bold text-amber-deep">{numberFormatter.format(metrics.ibu)}</p>
			<p class="mt-3 text-xs text-roast-soft/70">{useOgForIbu ? t('calc.formulaIbu') : t('calc.formulaIbuNoOg')}</p>
		</div>
	{/if}

	{#if enabled.color}
		<div class="rounded-2xl border border-malt bg-malt/40 p-6">
			<p class="text-xs font-semibold tracking-wide text-roast-soft uppercase">{t('calc.colorEbc')}</p>
			<div class="mt-1 flex items-center gap-3">
				<span
					class="inline-block size-8 shrink-0 rounded-full border border-roast/20"
					style="background-color: {ebcColor(metrics.color.ebc)}"
					aria-hidden="true"
				></span>
				<p class="font-display text-4xl font-bold text-amber-deep">{numberFormatter.format(metrics.color.ebc)}</p>
			</div>
			<p class="mt-2 text-sm text-roast-soft">{t('calc.colorSrm')}: {numberFormatter.format(metrics.color.srm)}</p>
			<p class="mt-1 text-sm text-roast-soft">{t('calc.mcu')}: {numberFormatter.format(metrics.color.mcu)}</p>
			<p class="mt-3 text-xs text-roast-soft/70">{t('calc.formulaColor')}</p>
		</div>
	{/if}

	{#if enabled.priming}
		<div class="rounded-2xl border border-malt bg-malt/40 p-6">
			<p class="text-xs font-semibold tracking-wide text-roast-soft uppercase">{t('calc.priming')}</p>
			<p class="mt-1 font-display text-4xl font-bold text-amber-deep">{numberFormatter.format(metrics.priming.grams)} g</p>
			<p class="mt-2 text-sm text-roast-soft">{t('calc.residualCo2')}: {numberFormatter.format(metrics.priming.residualCo2)} vol</p>
			<p class="mt-1 text-sm text-roast-soft">{t('calc.addedCo2')}: {numberFormatter.format(metrics.priming.deltaCo2)} vol</p>
			<p class="mt-3 text-xs text-roast-soft/70">{t('calc.formulaPriming')}</p>
		</div>
	{/if}

	{#if anyEnabled}
		<p class="text-sm text-roast-soft">{t('calc.note')}</p>
	{/if}
</aside>
