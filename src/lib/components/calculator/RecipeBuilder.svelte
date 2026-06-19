<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import { estimateGravity, type BuilderRecipe, type MetricId } from '$lib/calculators/recipe';

	let {
		t,
		recipe = $bindable(),
		enabled
	}: {
		t: (key: string) => string;
		recipe: BuilderRecipe;
		enabled: Record<MetricId, boolean>;
	} = $props();

	// Which input sections are relevant for the currently enabled results.
	const showMalts = $derived(enabled.color || enabled.abv);
	const showHops = $derived(enabled.ibu);
	const showGravity = $derived(enabled.abv || enabled.ibu);
	const showPriming = $derived(enabled.priming);

	const estimate = $derived(estimateGravity(recipe));

	const inputClass =
		'w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none';
	const smallInputClass =
		'w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none';

	function addMalt() {
		const nextId = recipe.malts.length > 0 ? Math.max(...recipe.malts.map((m) => m.id)) + 1 : 1;
		recipe.malts = [...recipe.malts, { id: nextId, name: '', weightKg: 0.2, colorEbc: 20 }];
	}

	function removeMalt(id: number) {
		if (recipe.malts.length <= 1) return;
		recipe.malts = recipe.malts.filter((malt) => malt.id !== id);
	}

	function addHop() {
		const nextId = recipe.hops.length > 0 ? Math.max(...recipe.hops.map((h) => h.id)) + 1 : 1;
		recipe.hops = [
			...recipe.hops,
			{ id: nextId, name: '', grams: 20, alphaAcidPercent: 10, boilMinutes: 15 }
		];
	}

	function removeHop(id: number) {
		if (recipe.hops.length <= 1) return;
		recipe.hops = recipe.hops.filter((hop) => hop.id !== id);
	}
</script>

<div class="space-y-8">
	<!-- Water -->
	<section>
		<h3 class="font-display text-xl font-semibold text-roast">{t('calc.build.section.water')}</h3>
		<p class="mt-1 text-sm text-roast-soft">{t('calc.water.intro')}</p>
		<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
			<label class="block">
				<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
					{t('calc.water.mash')}
					<Tooltip text={t('calc.water.mashHelp')} />
				</span>
				<input type="number" min="0" step="0.1" bind:value={recipe.mashWaterL} class={inputClass} />
			</label>
			<label class="block">
				<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
					{t('calc.water.sparge')}
					<Tooltip text={t('calc.water.spargeHelp')} />
				</span>
				<input type="number" min="0" step="0.1" bind:value={recipe.spargeWaterL} class={inputClass} />
			</label>
			<label class="block">
				<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
					{t('calc.water.preBoil')}
					<Tooltip text={t('calc.water.preBoilHelp')} />
				</span>
				<input type="number" min="0" step="0.1" bind:value={recipe.preBoilVolumeL} class={inputClass} />
			</label>
			<label class="block">
				<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
					{t('calc.water.batch')}
					<Tooltip text={t('calc.water.batchHelp')} />
				</span>
				<input type="number" min="0.1" step="0.1" bind:value={recipe.batchVolumeL} class={inputClass} />
			</label>
		</div>
	</section>

	<!-- Malts -->
	{#if showMalts}
		<section>
			<div class="mb-3 flex items-center justify-between gap-3">
				<h3 class="font-display text-xl font-semibold text-roast">{t('calc.grainBill')}</h3>
				<button
					type="button"
					onclick={addMalt}
					aria-label={t('calc.addMalt')}
					title={t('calc.addMalt')}
					class="grid size-10 place-items-center rounded-full bg-amber-deep text-foam transition-colors hover:bg-amber"
				>
					<Icon name="plus" class="size-5" />
				</button>
			</div>
			<div class="space-y-3">
				{#each recipe.malts as malt (malt.id)}
					<div class="grid gap-2 rounded-xl border border-malt/80 bg-cream/60 p-3 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-end">
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.fieldName')}</span>
							<input type="text" bind:value={malt.name} class={smallInputClass} />
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.maltWeight')}</span>
							<input type="number" min="0" step="0.01" bind:value={malt.weightKg} class={smallInputClass} />
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.maltColor')}</span>
							<input type="number" min="0" step="1" bind:value={malt.colorEbc} class={smallInputClass} />
						</label>
						<button
							type="button"
							onclick={() => removeMalt(malt.id)}
							disabled={recipe.malts.length === 1}
							aria-label={t('calc.icon.remove')}
							title={t('calc.removeHop')}
							class="grid size-9 place-items-center self-end rounded-full border border-malt text-roast-soft transition-colors hover:border-amber hover:text-amber-deep disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Icon name="x" class="size-4" />
						</button>
					</div>
				{/each}
			</div>
			{#if enabled.color}
				<p class="mt-2 text-xs text-roast-soft/70">{t('calc.build.colorNote')}</p>
			{/if}
		</section>
	{/if}

	<!-- Hops -->
	{#if showHops}
		<section>
			<div class="mb-3 flex items-center justify-between gap-3">
				<h3 class="font-display text-xl font-semibold text-roast">{t('calc.hops')}</h3>
				<button
					type="button"
					onclick={addHop}
					aria-label={t('calc.addHop')}
					title={t('calc.addHop')}
					class="grid size-10 place-items-center rounded-full bg-amber-deep text-foam transition-colors hover:bg-amber"
				>
					<Icon name="plus" class="size-5" />
				</button>
			</div>

			<div class="space-y-3">
				{#each recipe.hops as hop (hop.id)}
					<div class="grid gap-2 rounded-xl border border-malt/80 bg-cream/60 p-3 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto] md:items-end">
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.fieldName')}</span>
							<input type="text" bind:value={hop.name} class={smallInputClass} />
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.hopAmount')}</span>
							<input type="number" min="0" step="0.1" bind:value={hop.grams} class={smallInputClass} />
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.alphaAcid')}</span>
							<input type="number" min="0" step="0.1" bind:value={hop.alphaAcidPercent} class={smallInputClass} />
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.boilTime')}</span>
							<input type="number" min="0" step="1" bind:value={hop.boilMinutes} class={smallInputClass} />
						</label>
						<button
							type="button"
							onclick={() => removeHop(hop.id)}
							disabled={recipe.hops.length === 1}
							aria-label={t('calc.icon.remove')}
							title={t('calc.removeHop')}
							class="grid size-9 place-items-center self-end rounded-full border border-malt text-roast-soft transition-colors hover:border-amber hover:text-amber-deep disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Icon name="x" class="size-4" />
						</button>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Gravity & fermentation -->
	{#if showGravity}
		<section>
			<h3 class="font-display text-xl font-semibold text-roast">{t('calc.build.section.gravity')}</h3>
			<p class="mt-1 text-sm text-roast-soft">{t('calc.build.gravityHelp')}</p>

			<div class="mt-3 inline-flex rounded-lg border border-malt bg-cream p-1 text-sm">
				<button
					type="button"
					onclick={() => (recipe.gravityMode = 'manual')}
					class="rounded-md px-3 py-1.5 font-medium transition {recipe.gravityMode === 'manual'
						? 'bg-amber text-roast shadow-sm'
						: 'text-roast-soft hover:text-roast'}"
				>
					{t('calc.build.gravity.manual')}
				</button>
				<button
					type="button"
					onclick={() => (recipe.gravityMode = 'estimate')}
					class="rounded-md px-3 py-1.5 font-medium transition {recipe.gravityMode === 'estimate'
						? 'bg-amber text-roast shadow-sm'
						: 'text-roast-soft hover:text-roast'}"
				>
					{t('calc.build.gravity.estimate')}
				</button>
			</div>

			{#if recipe.gravityMode === 'manual'}
				<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
							{t('calc.start')}
							<Tooltip text={t('calc.build.ogHelp')} />
						</span>
						<input type="number" min="1" step="0.001" bind:value={recipe.og} class={inputClass} />
					</label>
					{#if enabled.abv}
						<label class="block">
							<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
								{t('calc.final')}
								<Tooltip text={t('calc.build.fgHelp')} />
							</span>
							<input type="number" min="0.99" step="0.001" bind:value={recipe.fg} class={inputClass} />
						</label>
					{/if}
				</div>
			{:else}
				<p class="mt-4 text-sm text-roast-soft">{t('calc.build.estimate.intro')}</p>

				<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
					<label class="block">
						<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
							{t('calc.abv.estimate.efficiency')}
							<Tooltip text={t('calc.build.efficiencyHelp')} />
						</span>
						<input type="number" min="40" max="100" step="1" bind:value={recipe.efficiencyPercent} class={inputClass} />
					</label>
					<label class="block">
						<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
							{t('calc.abv.estimate.attenuation')}
							<Tooltip text={t('calc.build.attenuationHelp')} />
						</span>
						<input type="number" min="50" max="100" step="1" bind:value={recipe.yeastAttenuationPercent} class={inputClass} />
					</label>
					<label class="block">
						<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
							{t('calc.abv.estimate.mashTemp')}
							<Tooltip text={t('calc.build.mashTempHelp')} />
						</span>
						<input type="number" min="60" max="72" step="0.5" bind:value={recipe.mashTempC} class={inputClass} />
					</label>
				</div>

				<p class="mt-2 text-xs text-roast-soft/70">{t('calc.build.potentialHelp')}</p>

				<div class="mt-4 flex flex-wrap items-center gap-6 rounded-xl border border-malt/80 bg-cream/60 px-4 py-3">
					<div class="text-sm">
						<span class="flex items-center gap-1 text-roast-soft/70">
							{t('calc.abv.estimate.estimatedOg')}
							<Tooltip text={t('calc.build.estimatedHelp')} />
						</span>
						<span class="font-display text-xl font-semibold text-amber-deep">{estimate.og.toFixed(3)}</span>
					</div>
					{#if enabled.abv}
						<div class="text-sm">
							<span class="block text-roast-soft/70">{t('calc.abv.estimate.estimatedFg')}</span>
							<span class="font-display text-xl font-semibold text-amber-deep">{estimate.fg.toFixed(3)}</span>
						</div>
					{/if}
				</div>
			{/if}
		</section>
	{/if}

	<!-- Priming -->
	{#if showPriming}
		<section>
			<h3 class="font-display text-xl font-semibold text-roast">{t('calc.build.section.priming')}</h3>
			<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.temp')}</span>
					<input type="number" min="0" step="0.1" bind:value={recipe.primingTempC} class={inputClass} />
				</label>
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.targetCo2')}</span>
					<input type="number" min="0" step="0.1" bind:value={recipe.targetCo2Vol} class={inputClass} />
				</label>
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.sugarType')}</span>
					<select bind:value={recipe.sugarType} class={inputClass}>
						<option value="dextrose">{t('calc.sugar.dextrose')}</option>
						<option value="sucrose">{t('calc.sugar.sucrose')}</option>
						<option value="dme">{t('calc.sugar.dme')}</option>
					</select>
				</label>
			</div>
		</section>
	{/if}
</div>
