<script lang="ts">
	import type { PrimingSugarType } from '$lib/calculators/brewing';

	let {
		t,
		batchVolumeL = $bindable(),
		primingTempC = $bindable(),
		targetCo2Vol = $bindable(),
		sugarType = $bindable()
	}: {
		t: (key: string) => string;
		batchVolumeL: number;
		primingTempC: number;
		targetCo2Vol: number;
		sugarType: PrimingSugarType;
	} = $props();
</script>

<h2 class="font-display text-2xl font-semibold text-roast">{t('calc.tool.priming')}</h2>
<p class="mt-1 text-sm text-roast-soft">{t('calc.desc.priming')}</p>
<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
	<label class="block">
		<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.volume')}</span>
		<input
			type="number"
			min="0.1"
			step="0.1"
			bind:value={batchVolumeL}
			class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
		/>
	</label>
	<label class="block">
		<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.temp')}</span>
		<input
			type="number"
			min="0"
			step="0.1"
			bind:value={primingTempC}
			class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
		/>
	</label>
	<label class="block">
		<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.targetCo2')}</span>
		<input
			type="number"
			min="0"
			step="0.1"
			bind:value={targetCo2Vol}
			class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
		/>
	</label>
	<label class="block">
		<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.sugarType')}</span>
		<select
			bind:value={sugarType}
			class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
		>
			<option value="dextrose">{t('calc.sugar.dextrose')}</option>
			<option value="sucrose">{t('calc.sugar.sucrose')}</option>
			<option value="dme">{t('calc.sugar.dme')}</option>
		</select>
	</label>
</div>
