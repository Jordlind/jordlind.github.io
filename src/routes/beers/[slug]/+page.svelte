<script lang="ts">
	import { base } from '$app/paths';
	import { locale, t } from '$lib/i18n';
	import { localizedContent, isFallback } from '$lib/content/beers';
	import BeerGallery from '$lib/components/BeerGallery.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const content = $derived(localizedContent(data.beer, $locale));
	const fallback = $derived(isFallback(data.beer, $locale));

	function formatDate(value: string | null, loc: string): string {
		if (!value) return '';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		return date.toLocaleDateString(loc === 'sv' ? 'sv-SE' : 'en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{content?.name ?? 'Beer'} · Jordlind</title>
	{#if content?.tagline}
		<meta name="description" content={content.tagline} />
	{/if}
</svelte:head>

{#if content}
	<article class="mx-auto max-w-5xl px-4 py-10">
		<a
			href="{base}/beers"
			class="inline-flex items-center gap-1 text-sm font-medium text-amber-deep hover:underline"
		>
			← {$t('beer.back')}
		</a>

		<div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Photo -->
			<div class="relative aspect-4/5 overflow-hidden rounded-2xl border border-malt bg-malt shadow-sm">
				{#key data.beer.slug}
					<BeerGallery images={data.beer.images} alt={content.name} emojiClass="text-8xl" />
				{/key}
			</div>

			<!-- Summary -->
			<div class="flex flex-col">
				<div class="flex items-center gap-3">
					<h1 class="font-display text-4xl font-bold text-roast">{content.name}</h1>
					<span
						class="rounded-full px-3 py-1 text-xs font-semibold {content.available
							? 'bg-hop text-foam'
							: 'bg-roast/80 text-cream'}"
					>
						{content.available ? $t('beer.available') : $t('beer.soldOut')}
					</span>
				</div>

				{#if content.tagline}
					<p class="mt-3 text-lg text-roast-soft italic">{content.tagline}</p>
				{/if}

				<dl class="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-malt/50 p-5">
					{#if content.style}
						<div>
							<dt class="text-xs tracking-wide text-roast-soft uppercase">{$t('beer.style')}</dt>
							<dd class="font-semibold text-roast">{content.style}</dd>
						</div>
					{/if}
					{#if content.abv != null}
						<div>
							<dt class="text-xs tracking-wide text-roast-soft uppercase">{$t('beer.abv')}</dt>
							<dd class="font-semibold text-roast">{content.abv}%</dd>
						</div>
					{/if}
					{#if content.ibu != null}
						<div>
							<dt class="text-xs tracking-wide text-roast-soft uppercase">{$t('beer.ibu')}</dt>
							<dd class="font-semibold text-roast">{content.ibu}</dd>
						</div>
					{/if}
					{#if content.brewed}
						<div>
							<dt class="text-xs tracking-wide text-roast-soft uppercase">{$t('beer.brewed')}</dt>
							<dd class="font-semibold text-roast">{formatDate(content.brewed, $locale)}</dd>
						</div>
					{/if}
				</dl>
			</div>
		</div>

		<!-- Recipe -->
		<div class="mt-12">
			<h2 class="font-display text-3xl font-bold text-amber-deep">{$t('beer.recipe')}</h2>
			{#if fallback}
				<p class="mt-2 rounded-lg bg-amber/15 px-4 py-2 text-sm text-roast-soft">
					{$t('beer.noTranslation')}
				</p>
			{/if}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="recipe mt-4 max-w-3xl">{@html content.recipeHtml}</div>
		</div>
	</article>
{/if}
