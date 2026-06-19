<script lang="ts">
	import {
		abvFromOgFg,
		apparentAttenuation,
		colorFromMalts,
		ibuForAddition,
		ibuForAdditionNoGravity,
		primingSugarGrams,
		type HopAddition,
		type MaltAddition,
		type PrimingSugarType
	} from '$lib/calculators/brewing';
	import { locale, t } from '$lib/i18n';
	import ToolTabs from '$lib/components/calculator/ToolTabs.svelte';
	import IbuTool from '$lib/components/calculator/IbuTool.svelte';
	import AbvTool from '$lib/components/calculator/AbvTool.svelte';
	import ColorTool from '$lib/components/calculator/ColorTool.svelte';
	import PrimingTool from '$lib/components/calculator/PrimingTool.svelte';
	import ResultsPanel from '$lib/components/calculator/ResultsPanel.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const selectedRecipeSlug = $derived(data.requestedSlug ?? '');

	type ToolId = 'ibu' | 'abv' | 'color' | 'priming';

	function gravityToSg(value: number): number {
		if (value >= 1000) return value / 1000;
		return value;
	}

	let activeTool = $state<ToolId>('ibu');

	let batchVolumeL = $state(20);
	let ibuGravity = $state(1.05);
	let ibuUseOg = $state(true);
	let abvOg = $state(1.058);
	let abvFg = $state(1.012);
	let primingTempC = $state(20);
	let targetCo2Vol = $state(2.4);
	let sugarType = $state<PrimingSugarType>('dextrose');

	let additions = $state<HopAddition[]>([
		{ id: 1, grams: 20, alphaAcidPercent: 10, boilMinutes: 60 }
	]);
	let malts = $state<MaltAddition[]>([
		{ id: 1, name: 'Pilsnermalt', weightKg: 4.8, colorEbc: 4 },
		{ id: 2, name: 'Munchnermalt', weightKg: 0.7, colorEbc: 18 }
	]);

	$effect(() => {
		const recipe = data.prefill?.recipeData ?? null;
		if (!recipe) return;

		batchVolumeL = recipe.water.batchVolumeL;
		ibuGravity = gravityToSg(recipe.og);
		abvOg = gravityToSg(recipe.og);
		abvFg = gravityToSg(recipe.fg);

		additions = recipe.hops.map((hop, index) => ({
			id: index + 1,
			grams: hop.grams,
			alphaAcidPercent: hop.alphaAcidPercent,
			boilMinutes: hop.boilMinutes
		}));

		const prefillMalts = recipe.malts
			.filter((malt) => malt.colorEbc != null)
			.map((malt, index) => ({
				id: index + 1,
				name: malt.name,
				weightKg: malt.weightKg,
				colorEbc: malt.colorEbc ?? 0
			}));
		if (prefillMalts.length > 0) malts = prefillMalts;
	});

	const tools = $derived([
		{ id: 'ibu' as const, label: $t('calc.tool.ibu') },
		{ id: 'abv' as const, label: $t('calc.tool.abv') },
		{ id: 'color' as const, label: $t('calc.tool.color') },
		{ id: 'priming' as const, label: $t('calc.tool.priming') }
	]);

	const totalIbu = $derived(
		additions.reduce((sum, addition) => {
			return sum + (ibuUseOg ? ibuForAddition(addition, ibuGravity, batchVolumeL) : ibuForAdditionNoGravity(addition, batchVolumeL));
		}, 0)
	);

	const abv = $derived(abvFromOgFg(abvOg, abvFg));
	const attenuation = $derived(apparentAttenuation(abvOg, abvFg));
	const color = $derived(colorFromMalts(malts, batchVolumeL));
	const priming = $derived(
		primingSugarGrams({
			volumeL: batchVolumeL,
			targetCo2Vol,
			beerTempC: primingTempC,
			sugarType
		})
	);

	const numberFormatter = $derived(
		new Intl.NumberFormat($locale === 'sv' ? 'sv-SE' : 'en-US', {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		})
	);
</script>

<svelte:head>
	<title>{$t('calc.title')} · Jordlind</title>
	<meta name="description" content={$t('calc.subtitle')} />
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-16">
	<div class="relative mb-10 overflow-hidden rounded-3xl border border-malt bg-roast p-8 text-cream">
		<div
			class="pointer-events-none absolute inset-0 opacity-20"
			style="background-image: radial-gradient(circle at 18% 20%, var(--color-amber) 0, transparent 45%), radial-gradient(circle at 80% 70%, var(--color-hop) 0, transparent 40%);"
		></div>
		<div class="relative">
			<p class="text-xs tracking-[0.2em] text-cream/70 uppercase">Jordlind Lab</p>
			<h1 class="mt-2 font-display text-4xl font-bold text-cream">{$t('calc.title')}</h1>
			<p class="mt-3 max-w-2xl text-cream/80">{$t('calc.subtitle')}</p>

			<form method="GET" action="" class="mt-4 flex flex-wrap items-end gap-3">
				<label class="min-w-56">
					<span class="mb-1 block text-xs tracking-[0.12em] text-cream/70 uppercase">{$t('calc.import.label')}</span>
					<select
						name="beer"
						class="w-full rounded-lg border border-cream/30 bg-cream/10 px-3 py-2 text-sm text-cream focus:border-amber focus:ring-2 focus:ring-amber/50 focus:outline-none"
					>
						<option value="">{$t('calc.import.placeholder')}</option>
						{#each data.recipes as recipe}
							<option value={recipe.slug} selected={selectedRecipeSlug === recipe.slug}>{recipe.name}</option>
						{/each}
					</select>
				</label>
				<button
					type="submit"
					class="rounded-full border border-amber px-4 py-2 text-sm font-semibold text-cream transition hover:bg-amber hover:text-roast"
				>
					{$t('calc.import.button')}
				</button>
			</form>

			{#if data.prefill}
				<p class="mt-4 inline-flex items-center gap-2 rounded-full border border-amber/50 bg-amber/20 px-4 py-1 text-sm text-cream">
					{$t('calc.prefilledFromBeer')}: {data.prefill.name}
				</p>
			{:else if data.requestedSlug}
				<p class="mt-4 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-4 py-1 text-sm text-cream/90">
					{$t('calc.prefillMissing')}
				</p>
			{/if}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<div class="rounded-2xl border border-malt bg-foam p-6 shadow-sm lg:col-span-2">
			<ToolTabs label={$t('calc.tools')} bind:activeTool {tools} />

			{#if activeTool === 'ibu'}
				<IbuTool t={$t} bind:batchVolumeL bind:ibuGravity bind:ibuUseOg bind:additions />
			{:else if activeTool === 'abv'}
				<AbvTool t={$t} bind:abvOg bind:abvFg />
			{:else if activeTool === 'color'}
				<ColorTool t={$t} bind:batchVolumeL bind:malts />
			{:else}
				<PrimingTool t={$t} bind:batchVolumeL bind:primingTempC bind:targetCo2Vol bind:sugarType />
			{/if}
		</div>

		<ResultsPanel
			t={$t}
			{activeTool}
			{totalIbu}
			{ibuUseOg}
			{abv}
			{attenuation}
			{color}
			{priming}
			{numberFormatter}
		/>
	</div>
</section>
