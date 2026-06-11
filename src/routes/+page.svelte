<script lang="ts">
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import { getAllBeers } from '$lib/content/beers';
	import BeerCard from '$lib/components/BeerCard.svelte';

	const latest = getAllBeers().slice(0, 3);
</script>

<svelte:head>
	<title>Jordlind · {$t('nav.tagline')}</title>
	<meta name="description" content={$t('home.heroText')} />
</svelte:head>

<!-- Hero -->
<section class="relative overflow-hidden bg-roast text-cream">
	<div
		class="absolute inset-0 opacity-20"
		style="background-image: radial-gradient(circle at 20% 20%, var(--color-amber) 0, transparent 45%), radial-gradient(circle at 80% 60%, var(--color-hop) 0, transparent 40%);"
	></div>
	<div class="relative mx-auto max-w-5xl px-4 py-24 text-center sm:py-32">
		<p class="mb-4 text-5xl">🍺</p>
		<h1 class="font-display text-4xl font-bold sm:text-6xl">{$t('home.heroTitle')}</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg text-cream/80">{$t('home.heroText')}</p>
		<a
			href="{base}/beers"
			class="mt-8 inline-block rounded-full bg-amber-deep px-8 py-3 font-semibold text-foam transition-colors hover:bg-amber"
		>
			{$t('home.cta')}
		</a>
	</div>
</section>

<!-- Latest beers -->
<section class="mx-auto max-w-5xl px-4 py-16">
	<div class="mb-8 text-center">
		<h2 class="font-display text-3xl font-bold text-amber-deep">{$t('home.latestTitle')}</h2>
		<p class="mt-2 text-roast-soft">{$t('home.latestText')}</p>
	</div>

	{#if latest.length > 0}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each latest as beer (beer.slug)}
				<BeerCard {beer} />
			{/each}
		</div>
		<div class="mt-10 text-center">
			<a
				href="{base}/beers"
				class="inline-block rounded-full border-2 border-amber-deep px-6 py-2 font-semibold text-amber-deep transition-colors hover:bg-amber-deep hover:text-foam"
			>
				{$t('nav.beers')} →
			</a>
		</div>
	{:else}
		<p class="text-center text-roast-soft">{$t('beers.empty')}</p>
	{/if}
</section>

<!-- About CTA -->
<section class="border-t border-malt bg-malt/40">
	<div class="mx-auto max-w-5xl px-4 py-12 text-center">
		<a
			href="{base}/about"
			class="font-display text-xl font-semibold text-amber-deep underline-offset-4 hover:underline"
		>
			{$t('home.aboutCta')} →
		</a>
	</div>
</section>
