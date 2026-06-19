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
</script>

<h2 class="font-display text-2xl font-semibold text-roast">{t('calc.tool.abv')}</h2>
<p class="mt-1 text-sm text-roast-soft">{t('calc.desc.abv')}</p>
<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
	<label class="block">
		<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.start')}</span>
		<input
			type="number"
			min="1"
			step="0.001"
			bind:value={abvOg}
			class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
		/>
	</label>
	<label class="block">
		<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.final')}</span>
		<input
			type="number"
			min="0.99"
			step="0.001"
			bind:value={abvFg}
			class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
		/>
	</label>
</div>
