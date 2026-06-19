<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import type { MaltAddition } from '$lib/calculators/brewing';

	let {
		t,
		batchVolumeL = $bindable(),
		malts = $bindable()
	}: {
		t: (key: string) => string;
		batchVolumeL: number;
		malts: MaltAddition[];
	} = $props();

	function addMaltAddition() {
		const nextId = malts.length > 0 ? Math.max(...malts.map((m) => m.id)) + 1 : 1;
		malts = [...malts, { id: nextId, name: 'Specialmalt', weightKg: 0.2, colorEbc: 120 }];
	}

	function removeMaltAddition(id: number) {
		if (malts.length <= 1) return;
		malts = malts.filter((malt) => malt.id !== id);
	}
</script>

<h2 class="font-display text-2xl font-semibold text-roast">{t('calc.tool.color')}</h2>
<p class="mt-1 text-sm text-roast-soft">{t('calc.desc.color')}</p>
<div class="mt-6 max-w-sm">
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
</div>

<div class="mt-8">
	<div class="mb-3 flex items-center justify-between gap-3">
		<h3 class="font-display text-xl font-semibold text-roast">{t('calc.grainBill')}</h3>
		<button
			type="button"
			onclick={addMaltAddition}
			aria-label={t('calc.addMalt')}
			title={t('calc.addMalt')}
			class="grid size-10 place-items-center rounded-full bg-amber-deep text-foam transition-colors hover:bg-amber"
		>
			<Icon name="plus" class="size-5" />
		</button>
	</div>

	<div class="space-y-3">
		{#each malts as malt (malt.id)}
			<div class="grid gap-2 rounded-xl border border-malt/80 bg-cream/60 p-3 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-end">
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.maltName')}</span>
					<input
						type="text"
						bind:value={malt.name}
						class="w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.maltWeight')}</span>
					<input
						type="number"
						min="0"
						step="0.01"
						bind:value={malt.weightKg}
						class="w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.maltColor')}</span>
					<input
						type="number"
						min="0"
						step="1"
						bind:value={malt.colorEbc}
						class="w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
					/>
				</label>
				<button
					type="button"
					onclick={() => removeMaltAddition(malt.id)}
					disabled={malts.length === 1}
					aria-label={t('calc.icon.remove')}
					title={t('calc.removeHop')}
					class="grid size-9 place-items-center self-end rounded-full border border-malt text-roast-soft transition-colors hover:border-amber hover:text-amber-deep disabled:cursor-not-allowed disabled:opacity-50"
				>
					<Icon name="x" class="size-4" />
				</button>
			</div>
		{/each}
	</div>
</div>
