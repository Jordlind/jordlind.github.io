<script lang="ts">
	import {
		estimateRecipeAbv,
		fermentablePotential,
		type Fermentable,
		type FermentableType
	} from '$lib/calculators/brewing';
	import type { BeerRecipeData } from '$lib/types';

	let {
		t,
		abvOg = $bindable(),
		abvFg = $bindable(),
		selectedRecipe = null
	}: {
		t: (key: string) => string;
		abvOg: number;
		abvFg: number;
		selectedRecipe?: { slug: string; name: string; recipeData: BeerRecipeData } | null;
	} = $props();

	type AbvMode = 'measured' | 'estimate';
	let mode = $state<AbvMode>('measured');

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

	// --- Recipe estimation mode ---------------------------------------------
	const fermentableTypes: FermentableType[] = ['base', 'viennaMunich', 'crystal', 'flaked', 'sugar'];

	let estVolumeL = $state(20);
	let estEfficiency = $state(75);
	let estBaseAttenuation = $state(78);
	let estMashTempC = $state(67);
	let nextFermentableId = $state(4);
	let fermentables = $state<Fermentable[]>([
		{ id: 1, name: 'Pilsnermalt', weightKg: 4.5, type: 'base' },
		{ id: 2, name: 'Münchnermalt', weightKg: 0.5, type: 'viennaMunich' }
	]);

	function guessFermentableType(name: string, colorEbc: number | null): FermentableType {
		const n = name.toLowerCase();
		if (/socker|sugar|candi|dextro|honey|honung|syrup|sirap/.test(n)) return 'sugar';
		if (/crystal|caramel|karamell|caramunch|cara|kristall/.test(n)) return 'crystal';
		if (/munich|münchner|munchner|vienna|wiener/.test(n)) return 'viennaMunich';
		if (/flak|fling|oat|havre|wheat|vete|rye|råg|rag/.test(n)) return 'flaked';
		if ((colorEbc ?? 0) >= 60) return 'crystal';
		return 'base';
	}

	// Prefill the estimation fields whenever a recipe is imported via the page's
	// `?beer=<slug>` selector, reusing the existing import flow.
	$effect(() => {
		const recipe = selectedRecipe?.recipeData;
		if (!recipe) return;

		estVolumeL = recipe.water.batchVolumeL;
		if (recipe.mash) estMashTempC = recipe.mash.tempC;

		const fromMalts: Fermentable[] = recipe.malts.map((malt, index) => ({
			id: index + 1,
			name: malt.name,
			weightKg: malt.weightKg,
			type: guessFermentableType(malt.name, malt.colorEbc)
		}));

		const fromSugars: Fermentable[] = recipe.additions
			.filter((addition) => /socker|sugar|candi|dextro|honey|honung|syrup|sirap/i.test(addition.name))
			.map((addition, index) => {
				const match = addition.amount.match(/([\d.,]+)\s*kg/i);
				const weightKg = match ? parseFloat(match[1].replace(',', '.')) : 0;
				return {
					id: recipe.malts.length + index + 1,
					name: addition.name,
					weightKg,
					type: 'sugar' as const
				};
			})
			.filter((fermentable) => fermentable.weightKg > 0);

		const next = [...fromMalts, ...fromSugars];
		if (next.length > 0) {
			fermentables = next;
			nextFermentableId = next.length + 1;
		}
	});

	function addFermentable() {
		fermentables = [
			...fermentables,
			{ id: nextFermentableId, name: '', weightKg: 1, type: 'base' }
		];
		nextFermentableId += 1;
	}

	function removeFermentable(id: number) {
		fermentables = fermentables.filter((fermentable) => fermentable.id !== id);
	}

	const estimate = $derived(
		estimateRecipeAbv({
			fermentables,
			efficiencyPercent: estEfficiency,
			volumeL: estVolumeL,
			baseAttenuationPercent: estBaseAttenuation,
			mashTempC: estMashTempC
		})
	);

	// In estimate mode the predicted OG/FG drive the shared ABV/attenuation
	// results panel, so the existing output reacts automatically.
	$effect(() => {
		if (mode !== 'estimate') return;
		abvOg = estimate.og;
		abvFg = estimate.fg;
	});
</script>

<h2 class="font-display text-2xl font-semibold text-roast">{t('calc.tool.abv')}</h2>
<p class="mt-1 text-sm text-roast-soft">
	{mode === 'estimate' ? t('calc.abv.estimate.desc') : t('calc.desc.abv')}
</p>

<div class="mt-4 inline-flex rounded-lg border border-malt bg-cream p-1 text-sm">
	<button
		type="button"
		onclick={() => (mode = 'measured')}
		class="rounded-md px-3 py-1.5 font-medium transition {mode === 'measured'
			? 'bg-amber text-roast shadow-sm'
			: 'text-roast-soft hover:text-roast'}"
	>
		{t('calc.abv.mode.measured')}
	</button>
	<button
		type="button"
		onclick={() => (mode = 'estimate')}
		class="rounded-md px-3 py-1.5 font-medium transition {mode === 'estimate'
			? 'bg-amber text-roast shadow-sm'
			: 'text-roast-soft hover:text-roast'}"
	>
		{t('calc.abv.mode.estimate')}
	</button>
</div>

{#if mode === 'estimate'}
	<p class="mt-4 text-sm text-roast-soft">{t('calc.abv.estimate.intro')}</p>

	<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
		<label class="block">
			<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.volume')}</span>
			<input
				type="number"
				min="1"
				step="0.5"
				bind:value={estVolumeL}
				class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
			/>
		</label>
		<label class="block">
			<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.abv.estimate.efficiency')}</span>
			<input
				type="number"
				min="40"
				max="100"
				step="1"
				bind:value={estEfficiency}
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
				bind:value={estBaseAttenuation}
				class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
			/>
			<span class="mt-1 block text-xs text-roast-soft/70">{t('calc.abv.estimate.attenuationHint')}</span>
		</label>
		<label class="block">
			<span class="mb-1 block text-sm font-medium text-roast-soft">{t('calc.abv.estimate.mashTemp')}</span>
			<input
				type="number"
				min="60"
				max="72"
				step="0.5"
				bind:value={estMashTempC}
				class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
			/>
			<span class="mt-1 block text-xs text-roast-soft/70">{t('calc.abv.estimate.mashTempHint')}</span>
		</label>
	</div>

	<div class="mt-6">
		<div class="flex items-center justify-between">
			<h3 class="font-display text-lg font-semibold text-roast">{t('calc.abv.estimate.fermentables')}</h3>
			<button
				type="button"
				onclick={addFermentable}
				class="rounded-full border border-amber px-3 py-1 text-sm font-semibold text-amber-deep transition hover:bg-amber hover:text-roast"
			>
				+ {t('calc.abv.estimate.addFermentable')}
			</button>
		</div>

		<div class="mt-3 space-y-3">
			{#each fermentables as fermentable (fermentable.id)}
				<div class="grid grid-cols-1 gap-3 rounded-lg border border-malt/60 bg-cream/60 p-3 sm:grid-cols-[2fr_1fr_1.5fr_auto]">
					<label class="block">
						<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.abv.estimate.fermentableName')}</span>
						<input
							type="text"
							bind:value={fermentable.name}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
					<label class="block">
						<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.abv.estimate.weight')}</span>
						<input
							type="number"
							min="0"
							step="0.05"
							bind:value={fermentable.weightKg}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
					<label class="block">
						<span class="mb-1 block text-xs font-medium text-roast-soft">{t('calc.abv.estimate.type')}</span>
						<select
							bind:value={fermentable.type}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						>
							{#each fermentableTypes as type (type)}
								<option value={type}>{t(`calc.abv.ferment.${type}`)} ({fermentablePotential(type)})</option>
							{/each}
						</select>
					</label>
					<div class="flex items-end">
						<button
							type="button"
							onclick={() => removeFermentable(fermentable.id)}
							class="rounded-lg border border-malt px-3 py-2 text-sm text-roast-soft transition hover:border-roast hover:text-roast"
							aria-label={t('calc.abv.estimate.remove')}
						>
							×
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-malt/60 bg-cream/60 px-4 py-3 text-sm sm:max-w-md">
		<div>
			<span class="block text-roast-soft/70">{t('calc.abv.estimate.estimatedOg')}</span>
			<span class="font-display text-xl font-semibold text-amber-deep">{estimate.og.toFixed(3)}</span>
		</div>
		<div>
			<span class="block text-roast-soft/70">{t('calc.abv.estimate.estimatedFg')}</span>
			<span class="font-display text-xl font-semibold text-amber-deep">{estimate.fg.toFixed(3)}</span>
		</div>
	</div>
{:else}
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
{/if}
