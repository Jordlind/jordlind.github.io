<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import {
		estimateGravity,
		type BuilderRecipe,
		type SectionId,
		type SectionState
	} from '$lib/calculators/recipe';

	let {
		t,
		recipe = $bindable(),
		sections = $bindable()
	}: {
		t: (key: string) => string;
		recipe: BuilderRecipe;
		sections: SectionState;
	} = $props();

	const estimate = $derived(estimateGravity(recipe));

	const inputClass =
		'w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none';
	const smallInputClass =
		'w-full rounded-lg border border-malt bg-cream px-2 py-1 text-sm focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none';

	function toggle(id: SectionId) {
		sections[id] = !sections[id];
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

	function addAddition() {
		const nextId =
			recipe.additions.length > 0 ? Math.max(...recipe.additions.map((a) => a.id)) + 1 : 1;
		recipe.additions = [...recipe.additions, { id: nextId, name: '', amount: '', addAt: '' }];
	}

	function removeAddition(id: number) {
		recipe.additions = recipe.additions.filter((addition) => addition.id !== id);
	}
</script>

{#snippet sectionHead(id: SectionId, title: string, intro: string)}
	<button
		type="button"
		onclick={() => toggle(id)}
		aria-expanded={sections[id]}
		aria-label={sections[id] ? t('calc.build.collapse') : t('calc.build.expand')}
		class="flex w-full items-start justify-between gap-3 text-left"
	>
		<div>
			<h3
				class="font-display text-xl font-semibold {sections[id]
					? 'text-roast'
					: 'text-roast-soft/60'}"
			>
				{title}
			</h3>
			<p class="mt-1 text-sm {sections[id] ? 'text-roast-soft' : 'text-roast-soft/60'}">
				{sections[id] ? intro : t('calc.build.excludedHint')}
			</p>
		</div>
		<span
			class="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-malt text-roast-soft transition-colors hover:border-amber hover:text-amber-deep"
		>
			<Icon name="chevron" class="size-4 transition-transform {sections[id] ? '' : '-rotate-90'}" />
		</span>
	</button>
{/snippet}

<div class="space-y-8">
	<!-- Recipe identity -->
	<section>
		{@render sectionHead('identity', t('calc.build.section.identity'), t('calc.identity.intro'))}
		{#if sections.identity}
			<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-roast-soft"
						>{t('calc.identity.name')}</span
					>
					<input type="text" bind:value={recipe.name} class={inputClass} />
				</label>
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-roast-soft"
						>{t('calc.identity.style')}</span
					>
					<input type="text" bind:value={recipe.style} class={inputClass} />
				</label>
				<label class="block sm:col-span-2">
					<span class="mb-1 block text-sm font-medium text-roast-soft"
						>{t('calc.identity.tagline')}</span
					>
					<input type="text" bind:value={recipe.tagline} class={inputClass} />
				</label>
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-roast-soft"
						>{t('calc.identity.brewed')}</span
					>
					<input type="date" bind:value={recipe.brewed} class={inputClass} />
				</label>
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-roast-soft"
						>{t('calc.identity.status')}</span
					>
					<select bind:value={recipe.status} class={inputClass}>
						<option value="planned">{t('beer.status.planned')}</option>
						<option value="available">{t('beer.status.available')}</option>
						<option value="archived">{t('beer.status.archived')}</option>
						<option value="none">{t('beer.status.none')}</option>
					</select>
				</label>
				<label class="block sm:col-span-2">
					<span class="mb-1 block text-sm font-medium text-roast-soft"
						>{t('calc.identity.description')}</span
					>
					<textarea
						rows="4"
						bind:value={recipe.description}
						placeholder={t('calc.identity.descriptionPlaceholder')}
						class="{inputClass} resize-y"
					></textarea>
				</label>
			</div>
		{/if}
	</section>

	<!-- Mash: water + temp + time + grain bill -->
	<section>
		{@render sectionHead('mash', t('beer.recipe.mash'), t('calc.build.mashIntro'))}
		{#if sections.mash}
			<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end">
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.water.mash')}
						<Tooltip text={t('calc.water.mashHelp')} />
					</span>
					<input
						type="number"
						min="0"
						step="0.1"
						bind:value={recipe.mashWaterL}
						class={inputClass}
					/>
				</label>
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.abv.estimate.mashTemp')}
						<Tooltip text={t('calc.build.mashTempHelp')} />
					</span>
					<input
						type="number"
						min="50"
						max="80"
						step="0.5"
						bind:value={recipe.mashTempC}
						class={inputClass}
					/>
				</label>
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.build.mashDuration')}
						<Tooltip text={t('calc.build.mashDurationHelp')} />
					</span>
					<input
						type="number"
						min="0"
						step="5"
						bind:value={recipe.mashDurationMin}
						class={inputClass}
					/>
				</label>
			</div>

			<div class="mt-5 mb-2 flex items-center justify-between gap-3">
				<h4 class="font-display text-base font-semibold text-roast">{t('calc.grainBill')}</h4>
				<button
					type="button"
					onclick={addMalt}
					aria-label={t('calc.addMalt')}
					title={t('calc.addMalt')}
					class="grid size-10 shrink-0 place-items-center rounded-full bg-amber-deep text-foam transition-colors hover:bg-amber"
				>
					<Icon name="plus" class="size-5" />
				</button>
			</div>
			<div class="space-y-3">
				{#each recipe.malts as malt (malt.id)}
					<div
						class="grid gap-2 rounded-xl border border-malt/80 bg-cream/60 p-3 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-end"
					>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.fieldName')}</span
							>
							<input type="text" bind:value={malt.name} class={smallInputClass} />
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.maltWeight')}</span
							>
							<input
								type="number"
								min="0"
								step="0.01"
								bind:value={malt.weightKg}
								class={smallInputClass}
							/>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.maltColor')}</span>
							<input
								type="number"
								min="0"
								step="1"
								bind:value={malt.colorEbc}
								class={smallInputClass}
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
			<p class="mt-2 text-xs text-roast-soft/70">{t('calc.build.colorNote')}</p>
		{/if}
	</section>

	<!-- Boil: volumes + time + hops + additions -->
	<section>
		{@render sectionHead('boil', t('beer.recipe.boil'), t('calc.build.boilIntro'))}
		{#if sections.boil}
			<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.water.preBoil')}
						<Tooltip text={t('calc.water.preBoilHelp')} />
					</span>
					<input
						type="number"
						min="0"
						step="0.1"
						bind:value={recipe.preBoilVolumeL}
						class={inputClass}
					/>
				</label>
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.water.batch')}
						<Tooltip text={t('calc.water.batchHelp')} />
					</span>
					<input
						type="number"
						min="0.1"
						step="0.1"
						bind:value={recipe.batchVolumeL}
						class={inputClass}
					/>
				</label>
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.build.boilDuration')}
						<Tooltip text={t('calc.build.boilDurationHelp')} />
					</span>
					<input
						type="number"
						min="0"
						step="5"
						bind:value={recipe.boilDurationMin}
						class={inputClass}
					/>
				</label>
			</div>

			<div class="mt-5 mb-2 flex items-center justify-between gap-3">
				<h4 class="font-display text-base font-semibold text-roast">{t('calc.hops')}</h4>
				<button
					type="button"
					onclick={addHop}
					aria-label={t('calc.addHop')}
					title={t('calc.addHop')}
					class="grid size-10 shrink-0 place-items-center rounded-full bg-amber-deep text-foam transition-colors hover:bg-amber"
				>
					<Icon name="plus" class="size-5" />
				</button>
			</div>
			<div class="space-y-3">
				{#each recipe.hops as hop (hop.id)}
					<div
						class="grid gap-2 rounded-xl border border-malt/80 bg-cream/60 p-3 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto] md:items-end"
					>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.fieldName')}</span
							>
							<input type="text" bind:value={hop.name} class={smallInputClass} />
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.hopAmount')}</span>
							<input
								type="number"
								min="0"
								step="0.1"
								bind:value={hop.grams}
								class={smallInputClass}
							/>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.alphaAcid')}</span>
							<input
								type="number"
								min="0"
								step="0.1"
								bind:value={hop.alphaAcidPercent}
								class={smallInputClass}
							/>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.boilTime')}</span>
							<input
								type="number"
								min="0"
								step="1"
								bind:value={hop.boilMinutes}
								class={smallInputClass}
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

			<div class="mt-5 mb-2 flex items-center justify-between gap-3">
				<div>
					<h4 class="font-display text-base font-semibold text-roast">
						{t('calc.build.additions')}
					</h4>
					<p class="mt-1 text-sm text-roast-soft">{t('calc.build.additionsIntro')}</p>
				</div>
				<button
					type="button"
					onclick={addAddition}
					aria-label={t('calc.build.addAddition')}
					title={t('calc.build.addAddition')}
					class="grid size-10 shrink-0 place-items-center rounded-full bg-amber-deep text-foam transition-colors hover:bg-amber"
				>
					<Icon name="plus" class="size-5" />
				</button>
			</div>

			{#if recipe.additions.length > 0}
				<div class="space-y-3">
					{#each recipe.additions as addition (addition.id)}
						<div
							class="grid gap-2 rounded-xl border border-malt/80 bg-cream/60 p-3 md:grid-cols-[1.3fr_1fr_1.2fr_auto] md:items-end"
						>
							<label class="block">
								<span class="mb-1 block text-xs font-medium text-roast-soft"
									>{t('calc.fieldName')}</span
								>
								<input type="text" bind:value={addition.name} class={smallInputClass} />
							</label>
							<label class="block">
								<span class="mb-1 block text-xs font-medium text-roast-soft"
									>{t('calc.build.additionAmount')}</span
								>
								<input type="text" bind:value={addition.amount} class={smallInputClass} />
							</label>
							<label class="block">
								<span class="mb-1 block text-xs font-medium text-roast-soft"
									>{t('calc.build.additionTiming')}</span
								>
								<input
									type="text"
									bind:value={addition.addAt}
									placeholder={t('calc.build.additionTimingPlaceholder')}
									class={smallInputClass}
								/>
							</label>
							<button
								type="button"
								onclick={() => removeAddition(addition.id)}
								aria-label={t('calc.icon.remove')}
								title={t('calc.removeHop')}
								class="grid size-9 place-items-center self-end rounded-full border border-malt text-roast-soft transition-colors hover:border-amber hover:text-amber-deep"
							>
								<Icon name="x" class="size-4" />
							</button>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</section>

	<!-- Wort strength (OG/FG) -->
	<section>
		{@render sectionHead('gravity', t('calc.build.section.gravity'), t('calc.build.gravityHelp'))}
		{#if sections.gravity}
			<div class="mt-3 inline-flex rounded-lg border border-malt bg-cream p-1 text-sm">
				<button
					type="button"
					onclick={() => (recipe.gravityMode = 'estimate')}
					class="rounded-md px-3 py-1.5 font-medium transition {recipe.gravityMode === 'estimate'
						? 'bg-amber text-roast shadow-sm'
						: 'text-roast-soft hover:text-roast'}"
				>
					{t('calc.build.gravity.estimate')}
				</button>
				<button
					type="button"
					onclick={() => (recipe.gravityMode = 'manual')}
					class="rounded-md px-3 py-1.5 font-medium transition {recipe.gravityMode === 'manual'
						? 'bg-amber text-roast shadow-sm'
						: 'text-roast-soft hover:text-roast'}"
				>
					{t('calc.build.gravity.manual')}
				</button>
			</div>

			{#if recipe.gravityMode === 'manual'}
				<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end">
					<label class="block">
						<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
							{t('calc.start')}
							<Tooltip text={t('calc.build.ogHelp')} />
						</span>
						<input type="number" min="1" step="0.001" bind:value={recipe.og} class={inputClass} />
					</label>
					<label class="block">
						<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
							{t('calc.final')}
							<Tooltip text={t('calc.build.fgHelp')} />
						</span>
						<input
							type="number"
							min="0.99"
							step="0.001"
							bind:value={recipe.fg}
							class={inputClass}
						/>
					</label>
				</div>
			{:else}
				<p class="mt-4 text-sm text-roast-soft">{t('calc.build.estimate.intro')}</p>

				<div class="mt-4 max-w-xs">
					<label class="block">
						<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
							{t('calc.abv.estimate.efficiency')}
							<Tooltip text={t('calc.build.efficiencyHelp')} />
						</span>
						<input
							type="number"
							min="40"
							max="100"
							step="1"
							bind:value={recipe.efficiencyPercent}
							class={inputClass}
						/>
					</label>
				</div>

				<p class="mt-2 text-xs text-roast-soft/70">{t('calc.build.attenuationInFerment')}</p>

				<div
					class="mt-4 flex flex-wrap items-center gap-6 rounded-xl border border-malt/80 bg-cream/60 px-4 py-3"
				>
					<div class="text-sm">
						<span class="flex items-center gap-1 text-roast-soft/70">
							{t('calc.abv.estimate.estimatedOg')}
							<Tooltip text={t('calc.build.estimatedHelp')} />
						</span>
						<span class="font-display text-xl font-semibold text-amber-deep"
							>{estimate.og.toFixed(3)}</span
						>
					</div>
					<div class="text-sm">
						<span class="block text-roast-soft/70">{t('calc.abv.estimate.estimatedFg')}</span>
						<span class="font-display text-xl font-semibold text-amber-deep"
							>{estimate.fg.toFixed(3)}</span
						>
					</div>
				</div>
			{/if}
		{/if}
	</section>

	<!-- Fermentation -->
	<section>
		{@render sectionHead(
			'fermentation',
			t('beer.recipe.fermentation'),
			t('calc.build.fermentationIntro')
		)}
		{#if sections.fermentation}
			<div
				class="mt-3 grid gap-2 rounded-xl border border-malt/80 bg-cream/60 p-3 sm:grid-cols-2 sm:items-end"
			>
				<label class="block sm:col-span-2">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.build.yeast')}
						<Tooltip text={t('calc.build.yeastHelp')} />
					</span>
					<input type="text" bind:value={recipe.yeast} class={smallInputClass} />
				</label>
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.abv.estimate.attenuation')}
						<Tooltip text={t('calc.build.attenuationHelp')} />
					</span>
					<input
						type="number"
						min="50"
						max="100"
						step="1"
						bind:value={recipe.yeastAttenuationPercent}
						class={smallInputClass}
					/>
				</label>
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.build.fermTemp')}
						<Tooltip text={t('calc.build.fermTempHelp')} />
					</span>
					<input
						type="number"
						min="0"
						step="0.5"
						bind:value={recipe.fermTempC}
						class={smallInputClass}
					/>
				</label>
			</div>
		{/if}
	</section>

	<!-- Conditioning & maturation -->
	<section>
		{@render sectionHead(
			'lagering',
			t('calc.build.section.lagering'),
			t('calc.build.lageringIntro')
		)}
		{#if sections.lagering}
			<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.build.lageringTemp')}
						<Tooltip text={t('calc.build.lageringTempHelp')} />
					</span>
					<input
						type="number"
						min="0"
						step="0.5"
						bind:value={recipe.lageringTempC}
						class={inputClass}
					/>
				</label>
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.build.lageringWeeks')}
						<Tooltip text={t('calc.build.lageringWeeksHelp')} />
					</span>
					<input
						type="number"
						min="0"
						step="1"
						bind:value={recipe.lageringWeeks}
						class={inputClass}
					/>
				</label>
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.build.readyWeeks')}
						<Tooltip text={t('calc.build.readyWeeksHelp')} />
					</span>
					<input
						type="number"
						min="0"
						step="1"
						bind:value={recipe.readyWeeks}
						class={inputClass}
					/>
				</label>
			</div>
		{/if}
	</section>

	<!-- Priming -->
	<section>
		{@render sectionHead('priming', t('calc.build.section.priming'), t('calc.build.primingIntro'))}
		{#if sections.priming}
			<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.temp')}
						<Tooltip text={t('calc.build.primingTempHelp')} />
					</span>
					<input
						type="number"
						min="0"
						step="0.1"
						bind:value={recipe.primingTempC}
						class={inputClass}
					/>
				</label>
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.targetCo2')}
						<Tooltip text={t('calc.build.targetCo2Help')} />
					</span>
					<input
						type="number"
						min="0"
						step="0.1"
						bind:value={recipe.targetCo2Vol}
						class={inputClass}
					/>
				</label>
				<label class="block">
					<span class="mb-1 flex items-center gap-1 text-sm font-medium text-roast-soft">
						{t('calc.sugarType')}
						<Tooltip text={t('calc.build.sugarTypeHelp')} />
					</span>
					<select bind:value={recipe.sugarType} class={inputClass}>
						<option value="dextrose">{t('calc.sugar.dextrose')}</option>
						<option value="sucrose">{t('calc.sugar.sucrose')}</option>
						<option value="dme">{t('calc.sugar.dme')}</option>
					</select>
				</label>
			</div>
		{/if}
	</section>
</div>
