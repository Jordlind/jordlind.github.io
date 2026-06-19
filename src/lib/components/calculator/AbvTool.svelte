<script lang="ts">
	let {
		t,
		abvOg = $bindable(),
		abvFg = $bindable()
	}: {
		t: (key: string) => string;
		abvOg: number;
		abvFg: number;
	} = $props();

	let useGravityPoints = $state(false);

	// Gravity points: OG 1.058 → 58, FG 1.012 → 12
	const ogPoints = $derived(Math.round((abvOg - 1) * 1000));
	const fgPoints = $derived(Math.round((abvFg - 1) * 1000));
	const consumedPoints = $derived(Math.max(0, ogPoints - fgPoints));

	function setOgFromPoints(e: Event) {
		const val = +(e.currentTarget as HTMLInputElement).value;
		if (!Number.isNaN(val)) abvOg = 1 + val / 1000;
	}

	function setFgFromPoints(e: Event) {
		const val = +(e.currentTarget as HTMLInputElement).value;
		if (!Number.isNaN(val)) abvFg = 1 + val / 1000;
	}
</script>

<h2 class="font-display text-2xl font-semibold text-roast">{t('calc.tool.abv')}</h2>
<p class="mt-1 text-sm text-roast-soft">{t('calc.desc.abv')}</p>

<label class="mt-4 inline-flex items-center gap-2 text-sm text-roast-soft">
	<input type="checkbox" bind:checked={useGravityPoints} class="h-4 w-4 accent-amber-deep" />
	{t('calc.abv.usePoints')}
</label>

<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
	<div>
		<label class="block">
			<span class="mb-1 block text-sm font-medium text-roast-soft">
				{useGravityPoints ? t('calc.abv.ogPoints') : t('calc.start')}
			</span>
			{#if useGravityPoints}
				<input
					type="number"
					min="0"
					max="300"
					step="1"
					value={ogPoints}
					oninput={setOgFromPoints}
					class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
				/>
			{:else}
				<input
					type="number"
					min="1"
					step="0.001"
					bind:value={abvOg}
					class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
				/>
			{/if}
		</label>
		<p class="mt-1 text-xs text-roast-soft/70">
			{useGravityPoints ? t('calc.abv.hintPoints') : t('calc.abv.hintSg')} &mdash;
			{useGravityPoints ? t('calc.abv.convertedSg') : t('calc.abv.convertedPoints')}:
			{useGravityPoints ? abvOg.toFixed(3) : ogPoints}
		</p>
	</div>
	<div>
		<label class="block">
			<span class="mb-1 block text-sm font-medium text-roast-soft">
				{useGravityPoints ? t('calc.abv.fgPoints') : t('calc.final')}
			</span>
			{#if useGravityPoints}
				<input
					type="number"
					min="0"
					max="300"
					step="1"
					value={fgPoints}
					oninput={setFgFromPoints}
					class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
				/>
			{:else}
				<input
					type="number"
					min="0.99"
					step="0.001"
					bind:value={abvFg}
					class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
				/>
			{/if}
		</label>
		<p class="mt-1 text-xs text-roast-soft/70">
			{useGravityPoints ? t('calc.abv.hintPoints') : t('calc.abv.hintSg')} &mdash;
			{useGravityPoints ? t('calc.abv.convertedSg') : t('calc.abv.convertedPoints')}:
			{useGravityPoints ? abvFg.toFixed(3) : fgPoints}
		</p>
	</div>
</div>

{#if consumedPoints > 0}
	<div class="mt-5 inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-malt/60 bg-cream/60 px-4 py-2 text-sm">
		<span class="font-medium text-roast">{t('calc.abv.consumed')}:</span>
		<span class="font-semibold text-amber-deep">{consumedPoints} pts</span>
		<span class="text-roast-soft/70">&mdash; {t('calc.abv.consumedHint')}</span>
	</div>
{/if}
