<script lang="ts">
	import { t } from '$lib/i18n';
	import { getAllBeers } from '$lib/content/beers';
	import BeerCard from '$lib/components/BeerCard.svelte';

	const beers = getAllBeers();
</script>

<svelte:head>
	<title>{$t('beers.title')} · Jordlind</title>
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-16">
	<div class="mb-10 text-center">
		<h1 class="font-display text-4xl font-bold text-amber-deep">{$t('beers.title')}</h1>
		<p class="mx-auto mt-3 max-w-xl text-roast-soft">{$t('beers.intro')}</p>
	</div>

	{#if beers.length > 0}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each beers as beer (beer.slug)}
				<BeerCard {beer} />
			{/each}
		</div>
	{:else}
		<p class="text-center text-roast-soft">{$t('beers.empty')}</p>
	{/if}
</section>
