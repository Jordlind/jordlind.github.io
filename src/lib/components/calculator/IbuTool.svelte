<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { ibuForAddition, ibuForAdditionNoGravity, type HopAddition } from '$lib/calculators/brewing';

	let {
		t,
		batchVolumeL = $bindable(),
		ibuGravity = $bindable(),
		ibuUseOg = $bindable(),
		additions = $bindable()
	}: {
		t: (key: string) => string;
		batchVolumeL: number;
		ibuGravity: number;
		ibuUseOg: boolean;
		additions: HopAddition[];
	} = $props();

	function addHopAddition() {
		const nextId = additions.length > 0 ? Math.max(...additions.map((a) => a.id)) + 1 : 1;
		additions = [...additions, { id: nextId, grams: 20, alphaAcidPercent: 10, boilMinutes: 15 }];
	}

	function removeHopAddition(id: number) {
		if (additions.length <= 1) return;
		additions = additions.filter((addition) => addition.id !== id);
	}
</script>

<h2 class="font-display text-2xl font-semibold text-roast">{t('calc.tool.ibu')}</h2>
<p class="mt-1 text-sm text-roast-soft">{t('calc.desc.ibu')}</p>

<div class="mt-4 flex items-start gap-2">
	<label class="inline-flex items-center gap-2 text-sm text-roast-soft">
		<input type="checkbox" bind:checked={ibuUseOg} class="h-4 w-4 accent-amber-deep" />
		{t('calc.ibu.useOg')}
	</label>
	<button
		type="button"
		title={t('calc.ibu.useOgTooltip')}
		aria-label={t('calc.ibu.useOgTooltip')}
		class="mt-[1px] shrink-0 text-roast-soft/60 hover:text-roast-soft focus:outline-none"
	>
		<Icon name="info" class="size-4" />
	</button>
</div>

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
	{#if ibuUseOg}
		<label class="block">
			<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.gravityOg')}</span>
			<input
				type="number"
				min="1"
				step="0.001"
				bind:value={ibuGravity}
				class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
			/>
		</label>
	{/if}
</div>

<div class="mt-8">
	<div class="mb-3 flex items-center justify-between gap-3">
		<h3 class="font-display text-xl font-semibold text-roast">{t('calc.hops')}</h3>
		<button
			type="button"
			onclick={addHopAddition}
			aria-label={t('calc.addHop')}
			title={t('calc.addHop')}
			class="grid size-10 place-items-center rounded-full bg-amber-deep text-foam transition-colors hover:bg-amber"
		>
			<Icon name="plus" class="size-5" />
		</button>
	</div>

	<div class="space-y-3">
		{#each additions as addition (addition.id)}
			<div class="grid gap-2 rounded-xl border border-malt/80 bg-cream/60 p-3 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-end">
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.hopAmount')}</span>
					<input
						type="number"
						min="0"
						step="0.1"
						bind:value={addition.grams}
						class="w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.alphaAcid')}</span>
					<input
						type="number"
						min="0"
						step="0.1"
						bind:value={addition.alphaAcidPercent}
						class="w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.boilTime')}</span>
					<input
						type="number"
						min="0"
						step="1"
						bind:value={addition.boilMinutes}
						class="w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
					/>
				</label>
				<div class="rounded-lg border border-malt bg-cream px-3 py-2 text-sm md:min-w-24">
					<div class="text-[11px] font-medium text-roast-soft">{t('calc.ibuContribution')}</div>
					<div class="font-semibold text-amber-deep">
						{(ibuUseOg
							? ibuForAddition(addition, ibuGravity, batchVolumeL)
							: ibuForAdditionNoGravity(addition, batchVolumeL)
						).toFixed(1)}
					</div>
				</div>
				<button
					type="button"
					onclick={() => removeHopAddition(addition.id)}
					disabled={additions.length === 1}
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
