<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
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
	const needOg = $derived(enabled.abv || (enabled.ibu && recipe.useOgForIbu));
	const showGravity = $derived(enabled.abv || enabled.ibu);
	const showPriming = $derived(enabled.priming);

	let showEstimator = $state(false);
	const estimate = $derived(estimateGravity(recipe));

	function applyEstimate() {
		recipe.og = Number(estimate.og.toFixed(3));
		recipe.fg = Number(estimate.fg.toFixed(3));
	}

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
	<!-- Batch -->
	<section>
		<h3 class="font-display text-xl font-semibold text-roast">{t('calc.build.section.batch')}</h3>
		<div class="mt-3 max-w-xs">
			<label class="block">
				<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.volume')}</span>
				<input
					type="number"
					min="0.1"
					step="0.1"
					bind:value={recipe.batchVolumeL}
					class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
				/>
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

			<div class="mb-3 flex items-start gap-2">
				<label class="inline-flex items-center gap-2 text-sm text-roast-soft">
					<input type="checkbox" bind:checked={recipe.useOgForIbu} class="h-4 w-4 accent-amber-deep" />
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

			<div class="space-y-3">
				{#each recipe.hops as hop (hop.id)}
					<div class="grid gap-2 rounded-xl border border-malt/80 bg-cream/60 p-3 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto] md:items-end">
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.maltName')}</span>
							<input
								type="text"
								bind:value={hop.name}
								class="w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
							/>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.hopAmount')}</span>
							<input
								type="number"
								min="0"
								step="0.1"
								bind:value={hop.grams}
								class="w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
							/>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.alphaAcid')}</span>
							<input
								type="number"
								min="0"
								step="0.1"
								bind:value={hop.alphaAcidPercent}
								class="w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
							/>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.boilTime')}</span>
							<input
								type="number"
								min="0"
								step="1"
								bind:value={hop.boilMinutes}
								class="w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
							/>
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

			<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
				{#if needOg}
					<label class="block">
						<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.start')}</span>
						<input
							type="number"
							min="1"
							step="0.001"
							bind:value={recipe.og}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
				{/if}
				{#if enabled.abv}
					<label class="block">
						<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.final')}</span>
						<input
							type="number"
							min="0.99"
							step="0.001"
							bind:value={recipe.fg}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
				{/if}
			</div>

			{#if enabled.abv}
				<div class="mt-4 rounded-xl border border-malt/80 bg-cream/60 p-4">
					<button
						type="button"
						onclick={() => (showEstimator = !showEstimator)}
						class="flex w-full items-center justify-between text-left text-sm font-semibold text-roast"
						aria-expanded={showEstimator}
					>
						<span>{t('calc.build.estimate.toggle')}</span>
						<span class="text-roast-soft">{showEstimator ? '−' : '+'}</span>
					</button>

					{#if showEstimator}
						<p class="mt-3 text-sm text-roast-soft">{t('calc.build.estimate.intro')}</p>

						<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
							<label class="block">
								<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
									{t('calc.abv.estimate.efficiency')}
									<button
										type="button"
										title={t('calc.build.efficiencyHelp')}
										aria-label={t('calc.build.efficiencyHelp')}
										class="text-roast-soft/60 hover:text-roast-soft focus:outline-none"
									>
										<Icon name="info" class="size-4" />
									</button>
								</span>
								<input
									type="number"
									min="40"
									max="100"
									step="1"
									bind:value={recipe.efficiencyPercent}
									class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
								/>
							</label>
							<label class="block">
								<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.abv.estimate.attenuation')}</span>
								<input
									type="number"
									min="50"
									max="100"
									step="1"
									bind:value={recipe.yeastAttenuationPercent}
									class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
								/>
							</label>
							<label class="block">
								<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.abv.estimate.mashTemp')}</span>
								<input
									type="number"
									min="60"
									max="72"
									step="0.5"
									bind:value={recipe.mashTempC}
									class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
								/>
							</label>
						</div>

						<p class="mt-2 text-xs text-roast-soft/70">{t('calc.build.potentialHelp')}</p>

						<div class="mt-4 flex flex-wrap items-center gap-4">
							<div class="text-sm">
								<span class="block text-roast-soft/70">{t('calc.abv.estimate.estimatedOg')}</span>
								<span class="font-display text-xl font-semibold text-amber-deep">{estimate.og.toFixed(3)}</span>
							</div>
							<div class="text-sm">
								<span class="block text-roast-soft/70">{t('calc.abv.estimate.estimatedFg')}</span>
								<span class="font-display text-xl font-semibold text-amber-deep">{estimate.fg.toFixed(3)}</span>
							</div>
							<button
								type="button"
								onclick={applyEstimate}
								class="ml-auto rounded-full border border-amber px-4 py-2 text-sm font-semibold text-amber-deep transition hover:bg-amber hover:text-roast"
							>
								{t('calc.build.estimate.apply')}
							</button>
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
					<input
						type="number"
						min="0"
						step="0.1"
						bind:value={recipe.primingTempC}
						class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.targetCo2')}</span>
					<input
						type="number"
						min="0"
						step="0.1"
						bind:value={recipe.targetCo2Vol}
						class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.sugarType')}</span>
					<select
						bind:value={recipe.sugarType}
						class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
					>
						<option value="dextrose">{t('calc.sugar.dextrose')}</option>
						<option value="sucrose">{t('calc.sugar.sucrose')}</option>
						<option value="dme">{t('calc.sugar.dme')}</option>
					</select>
				</label>
			</div>
		</section>
	{/if}
</div>
