<script lang="ts">
	import { ebcColor } from '$lib/beerColor';

	type ActiveTool = 'ibu' | 'abv' | 'color' | 'priming';

	let {
		t,
		activeTool,
		totalIbu,
		ibuUseOg,
		abv,
		attenuation,
		color,
		priming,
		numberFormatter
	}: {
		t: (key: string) => string;
		activeTool: ActiveTool;
		totalIbu: number;
		ibuUseOg: boolean;
		abv: number;
		attenuation: number;
		color: { ebc: number; srm: number; mcu: number };
		priming: { grams: number; residualCo2: number; deltaCo2: number };
		numberFormatter: Intl.NumberFormat;
	} = $props();
</script>

<aside class="rounded-2xl border border-malt bg-malt/40 p-6 lg:sticky lg:top-24 lg:self-start">
	<p class="text-sm font-medium tracking-wide text-roast-soft uppercase">{t('calc.results')}</p>
	{#if activeTool === 'ibu'}
		<p class="mt-2 font-display text-5xl font-bold text-amber-deep">{numberFormatter.format(totalIbu)}</p>
		<p class="mt-1 text-sm text-roast-soft">{t('calc.totalIbu')}</p>
	{:else if activeTool === 'abv'}
		<p class="mt-2 font-display text-5xl font-bold text-amber-deep">{numberFormatter.format(abv)}%</p>
		<p class="mt-1 text-sm text-roast-soft">{t('calc.abv')}</p>
		<p class="mt-3 text-sm text-roast-soft">{t('calc.attenuation')}: {numberFormatter.format(attenuation)}%</p>
	{:else if activeTool === 'color'}
		<div class="mt-2 flex items-center gap-3">
			<span
				class="inline-block size-8 shrink-0 rounded-full border border-roast/20"
				style="background-color: {ebcColor(color.ebc)}"
				aria-hidden="true"
			></span>
			<p class="font-display text-5xl font-bold text-amber-deep">{numberFormatter.format(color.ebc)}</p>
		</div>
		<p class="mt-1 text-sm text-roast-soft">{t('calc.colorEbc')}</p>
		<p class="mt-3 text-sm text-roast-soft">{t('calc.colorSrm')}: {numberFormatter.format(color.srm)}</p>
		<p class="mt-1 text-sm text-roast-soft">{t('calc.mcu')}: {numberFormatter.format(color.mcu)}</p>
	{:else}
		<p class="mt-2 font-display text-5xl font-bold text-amber-deep">{numberFormatter.format(priming.grams)} g</p>
		<p class="mt-1 text-sm text-roast-soft">{t('calc.priming')}</p>
		<p class="mt-3 text-sm text-roast-soft">{t('calc.residualCo2')}: {numberFormatter.format(priming.residualCo2)} vol</p>
		<p class="mt-1 text-sm text-roast-soft">{t('calc.addedCo2')}: {numberFormatter.format(priming.deltaCo2)} vol</p>
	{/if}

	<div class="mt-8 rounded-xl border border-malt bg-foam/70 p-4 text-sm text-roast-soft">
		<h3 class="font-display text-lg font-semibold text-roast">{t('calc.formulaTitle')}</h3>
		{#if activeTool === 'ibu'}
			<p class="mt-2">{ibuUseOg ? t('calc.formulaIbu') : t('calc.formulaIbuNoOg')}</p>
		{:else if activeTool === 'abv'}
			<p class="mt-2">{t('calc.formulaAbv')}</p>
		{:else if activeTool === 'color'}
			<p class="mt-2">{t('calc.formulaColor')}</p>
		{:else}
			<p class="mt-2">{t('calc.formulaPriming')}</p>
		{/if}
	</div>

	<p class="mt-4 text-sm text-roast-soft">{t('calc.note')}</p>
</aside>
