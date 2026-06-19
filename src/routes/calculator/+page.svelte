<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import {
		computeRecipeMetrics,
		createDefaultRecipe,
		createDefaultSections,
		recipeFromBeerData,
		type BuilderRecipe,
		type MetricId,
		type SectionState
	} from '$lib/calculators/recipe';
	import { locale, t } from '$lib/i18n';
	import RecipeBuilder from '$lib/components/calculator/RecipeBuilder.svelte';
	import ResultsDashboard from '$lib/components/calculator/ResultsDashboard.svelte';
	import RecipeExport from '$lib/components/calculator/RecipeExport.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const selectedRecipeSlug = $derived(
		browser ? (page.url.searchParams.get('beer')?.trim() ?? '') : ''
	);
	const selectedRecipe = $derived(
		data.recipes.find((recipe) => recipe.slug === selectedRecipeSlug) ?? null
	);

	let recipe = $state<BuilderRecipe>(createDefaultRecipe());
	let sections = $state<SectionState>(createDefaultSections());

	// Import a canonical beer recipe into the builder when ?beer=<slug> is set.
	$effect(() => {
		if (!selectedRecipe?.recipeData) return;
		recipe = recipeFromBeerData(selectedRecipe.recipeData, {
			name: selectedRecipe.name,
			style: selectedRecipe.style,
			tagline: selectedRecipe.tagline,
			brewed: selectedRecipe.brewed,
			status: selectedRecipe.status
		});
	});

	// A collapsed section is excluded from both export and calculations.
	const enabled = $derived<Record<MetricId, boolean>>({
		abv: sections.gravity,
		ibu: sections.boil,
		color: sections.mash,
		priming: sections.priming
	});

	function importBeer(slug: string) {
		const target = slug ? `${base}/calculator?beer=${encodeURIComponent(slug)}` : `${base}/calculator`;
		void goto(target);
	}

	function clearRecipe() {
		recipe = createDefaultRecipe();
		sections = createDefaultSections();
		if (selectedRecipeSlug) void goto(`${base}/calculator`);
	}

	const metrics = $derived(computeRecipeMetrics(recipe));

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
	<div
		class="relative mb-10 overflow-hidden rounded-3xl border border-malt bg-roast p-8 text-cream"
	>
		<div
			class="pointer-events-none absolute inset-0 opacity-20"
			style="background-image: radial-gradient(circle at 18% 20%, var(--color-amber) 0, transparent 45%), radial-gradient(circle at 80% 70%, var(--color-hop) 0, transparent 40%);"
		></div>
		<div class="relative">
			<p class="text-xs tracking-[0.2em] text-cream/70 uppercase">Jordlind Lab</p>
			<h1 class="mt-2 font-display text-4xl font-bold text-cream">{$t('calc.title')}</h1>
			<p class="mt-3 max-w-2xl text-cream/80">{$t('calc.build.subtitle')}</p>

			<div class="mt-4 flex flex-wrap items-end gap-3">
				<label class="min-w-56">
					<span class="mb-1 block text-xs tracking-[0.12em] text-cream/70 uppercase"
						>{$t('calc.import.label')}</span
					>
					<select
						value={selectedRecipeSlug}
						onchange={(event) => importBeer(event.currentTarget.value)}
						class="w-full rounded-lg border border-cream/30 bg-cream/10 px-3 py-2 text-sm text-cream focus:border-amber focus:ring-2 focus:ring-amber/50 focus:outline-none"
					>
						<option value="">{$t('calc.import.placeholder')}</option>
						{#each data.recipes as recipeOption (recipeOption.slug)}
							<option value={recipeOption.slug}>{recipeOption.name}</option>
						{/each}
					</select>
				</label>
				<button
					type="button"
					onclick={clearRecipe}
					title={$t('calc.import.clearHelp')}
					class="rounded-full border border-cream/40 px-4 py-2 text-sm font-semibold text-cream transition hover:bg-cream/10"
				>
					{$t('calc.import.clear')}
				</button>
			</div>

			{#if selectedRecipe}
				<p
					class="mt-4 inline-flex items-center gap-2 rounded-full border border-amber/50 bg-amber/20 px-4 py-1 text-sm text-cream"
				>
					{$t('calc.prefilledFromBeer')}: {selectedRecipe.name}
				</p>
			{:else if selectedRecipeSlug}
				<p
					class="mt-4 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-4 py-1 text-sm text-cream/90"
				>
					{$t('calc.prefillMissing')}
				</p>
			{/if}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<div class="rounded-2xl border border-malt bg-foam p-6 shadow-sm lg:col-span-2">
			<RecipeBuilder t={$t} bind:recipe bind:sections />
		</div>

		<ResultsDashboard t={$t} {metrics} {enabled} {numberFormatter} />
	</div>

	<RecipeExport t={$t} {recipe} {metrics} {sections} locale={$locale} />
</section>
