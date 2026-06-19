<script lang="ts">
	import { base } from '$app/paths';
	import { locale, t } from '$lib/i18n';
	import { localizedContent } from '$lib/content/beers';
	import type { Beer } from '$lib/types';
	import BeerGallery from './BeerGallery.svelte';

	let { beer }: { beer: Beer } = $props();

	const content = $derived(localizedContent(beer, $locale));
	const statusClass = $derived.by(() => {
		if (!content) return 'bg-malt text-roast';
		if (content.status === 'available') return 'bg-hop text-foam';
		if (content.status === 'planned') return 'bg-amber text-roast';
		if (content.status === 'archived') return 'bg-roast/80 text-cream';
		return 'bg-malt text-roast';
	});
</script>

{#if content}
	<a
		href="{base}/beers/{beer.slug}"
		class="group flex flex-col overflow-hidden rounded-2xl border border-malt bg-foam shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
	>
		<div class="relative aspect-4/5 overflow-hidden bg-malt">
			<BeerGallery
				images={beer.images}
				alt={content.name}
				imageClass="transition-transform duration-300 group-hover:scale-105"
			/>
			<span
				class="absolute top-3 right-3 z-20 rounded-full px-3 py-1 text-xs font-semibold {statusClass}"
			>
				{$t(`beer.status.${content.status}`)}
			</span>
		</div>

		<div class="flex flex-1 flex-col gap-1 p-4">
			<div class="flex items-start justify-between gap-2">
				<h3 class="font-display text-xl font-bold text-roast group-hover:text-amber-deep">
					{content.name}
				</h3>
				{#if content.abv != null}
					<span class="shrink-0 rounded-full bg-amber/20 px-2 py-0.5 text-sm font-semibold text-amber-deep">
						{content.abv}%
					</span>
				{/if}
			</div>
			{#if content.style}
				<p class="text-xs tracking-wide text-roast-soft uppercase">{content.style}</p>
			{/if}
			{#if content.tagline}
				<p class="mt-1 text-sm text-roast-soft">{content.tagline}</p>
			{/if}
			<span class="mt-3 text-sm font-semibold text-amber-deep">{$t('beers.viewRecipe')} →</span>
		</div>
	</a>
{/if}
