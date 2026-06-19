<script lang="ts">
	import { base } from '$app/paths';
	import { locale, t } from '$lib/i18n';
	import { localizedContent, isFallback } from '$lib/content/beers';
	import { ebcColor } from '$lib/beerColor';
	import BeerGallery from '$lib/components/BeerGallery.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const content = $derived(localizedContent(data.beer, $locale));
	const fallback = $derived(isFallback(data.beer, $locale));
	const recipeData = $derived(content?.recipeData ?? null);

	function hopAddedAt(boilMinutes: number, boilDurationMin: number | null): string {
		if (boilMinutes === 0) return $t('beer.recipe.atFlameout');
		if (boilDurationMin != null && boilMinutes >= boilDurationMin) return $t('beer.recipe.atStart');
		return $t('beer.recipe.lastMin').replace('{min}', String(boilMinutes));
	}

	const formatDate = (value: string | null, loc: string): string => {
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

				<a
					href="{base}/calculator?beer={data.beer.slug}"
					class="mt-4 inline-flex w-fit items-center rounded-full border border-amber-deep px-4 py-2 text-sm font-semibold text-amber-deep transition hover:bg-amber-deep hover:text-foam"
				>
					{$t('beer.openInCalculator')}
				</a>

				<dl class="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-malt/50 p-5">
					<div>
						<dt class="text-xs tracking-wide text-roast-soft uppercase">{$t('beer.style')}</dt>
						<dd class="font-semibold text-roast">{content.style ?? '-'}</dd>
					</div>
					<div>
						<dt class="text-xs tracking-wide text-roast-soft uppercase">{$t('beer.abv')}</dt>
						<dd class="font-semibold text-roast">{content.abv ?? '-'}%</dd>
					</div>
					<div>
						<dt class="text-xs tracking-wide text-roast-soft uppercase">{$t('beer.ibu')}</dt>
						<dd class="font-semibold text-roast">{content.ibu ?? '-'}</dd>
					</div>
					<div>
						<dt class="text-xs tracking-wide text-roast-soft uppercase">{$t('beer.ebc')}</dt>
						<dd class="flex items-center gap-2 font-semibold text-roast">
							{#if content.ebc != null}
								<span
									class="inline-block size-4 shrink-0 rounded-full border border-roast/20"
									style="background-color: {ebcColor(content.ebc)}"
									aria-hidden="true"
								></span>
								{content.ebc}
							{:else}
								-
							{/if}
						</dd>
					</div>
					<div>
						<dt class="text-xs tracking-wide text-roast-soft uppercase">{$t('beer.og')}</dt>
						<dd class="font-semibold text-roast">{content.og ?? '-'}</dd>
					</div>
					<div>
						<dt class="text-xs tracking-wide text-roast-soft uppercase">{$t('beer.fg')}</dt>
						<dd class="font-semibold text-roast">{content.fg ?? '-'}</dd>
					</div>
					<div>
						<dt class="text-xs tracking-wide text-roast-soft uppercase">{$t('beer.brewed')}</dt>
						<dd class="font-semibold text-roast">{content.brewed ? formatDate(content.brewed, $locale) : '-'}</dd>
					</div>
				</dl>
			</div>
		</div>

		<!-- Recipe -->
		<div class="mt-12">
			{#if fallback}
				<p class="mb-4 rounded-lg bg-amber/15 px-4 py-2 text-sm text-roast-soft">
					{$t('beer.noTranslation')}
				</p>
			{/if}

			{#if recipeData}
				<div class="space-y-6">

					<!-- Brewer description -->
					{#if content.recipeHtml}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<div class="recipe max-w-3xl text-roast-soft">{@html content.recipeHtml}</div>
					{/if}

					<!-- MASH -->
					<section class="overflow-hidden rounded-2xl border border-malt bg-foam/80 shadow-sm">
						<div class="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-malt bg-malt/30 px-5 py-3">
							<h2 class="font-display text-lg font-bold tracking-wide text-roast uppercase">{$t('beer.recipe.mash')}</h2>
							{#if recipeData.water.mashWaterL != null}
								<span class="text-sm text-roast-soft"><span class="font-semibold text-roast">{recipeData.water.mashWaterL} L</span> {$t('beer.recipe.water')}</span>
							{/if}
							{#if recipeData.mash}
								<span class="text-sm text-roast-soft"><span class="font-semibold text-roast">{recipeData.mash.durationMin} {$t('beer.recipe.min')}</span></span>
								<span class="text-sm text-roast-soft"><span class="font-semibold text-roast">{recipeData.mash.tempC} °C</span></span>
							{/if}
						</div>
						<div class="overflow-x-auto">
							<table class="min-w-full text-sm">
								<thead class="bg-malt/20 text-xs tracking-wide text-roast-soft uppercase">
									<tr>
										<th class="px-5 py-2 text-left font-semibold">{$t('beer.recipe.ingredient')}</th>
										<th class="px-5 py-2 text-right font-semibold">{$t('beer.recipe.amount')}</th>
										<th class="px-5 py-2 text-right font-semibold">{$t('beer.recipe.colorEbc')}</th>
										{#if recipeData.malts.some((m) => m.expectedSharePercent != null)}
											<th class="px-5 py-2 text-right font-semibold">{$t('beer.recipe.share')}</th>
										{/if}
									</tr>
								</thead>
								<tbody>
									{#each recipeData.malts as malt}
										<tr class="border-t border-malt/40 text-roast">
											<td class="px-5 py-2">{malt.name}</td>
											<td class="px-5 py-2 text-right tabular-nums">
												{malt.weightKg >= 1
													? `${malt.weightKg} kg`
													: `${Math.round(malt.weightKg * 1000)} g`}
											</td>
											<td class="px-5 py-2 text-right tabular-nums">{malt.colorEbc ?? '-'}</td>
											{#if recipeData.malts.some((m) => m.expectedSharePercent != null)}
												<td class="px-5 py-2 text-right tabular-nums">{malt.expectedSharePercent != null ? `${malt.expectedSharePercent}%` : '-'}</td>
											{/if}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</section>

					<!-- BOIL -->
					<section class="overflow-hidden rounded-2xl border border-malt bg-foam/80 shadow-sm">
						<div class="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-malt bg-malt/30 px-5 py-3">
							<h2 class="font-display text-lg font-bold tracking-wide text-roast uppercase">{$t('beer.recipe.boil')}</h2>
							{#if recipeData.water.preBoilVolumeL != null}
								<span class="text-sm text-roast-soft"><span class="font-semibold text-roast">{recipeData.water.preBoilVolumeL} L</span> {$t('beer.recipe.water')}</span>
							{/if}
							{#if recipeData.boil}
								<span class="text-sm text-roast-soft"><span class="font-semibold text-roast">{recipeData.boil.durationMin} {$t('beer.recipe.min')}</span></span>
							{/if}
						</div>
						<div class="overflow-x-auto">
							<table class="min-w-full text-sm">
								<thead class="bg-malt/20 text-xs tracking-wide text-roast-soft uppercase">
									<tr>
										<th class="px-5 py-2 text-left font-semibold">{$t('beer.recipe.hop')}</th>
										<th class="px-5 py-2 text-right font-semibold">{$t('beer.recipe.alphaAcid')}</th>
										<th class="px-5 py-2 text-right font-semibold">{$t('beer.recipe.amount')}</th>
										<th class="px-5 py-2 text-right font-semibold">{$t('beer.recipe.ibu')}</th>
										<th class="px-5 py-2 text-left font-semibold">{$t('beer.recipe.addAt')}</th>
									</tr>
								</thead>
								<tbody>
									{#each recipeData.hops as hop}
										<tr class="border-t border-malt/40 text-roast">
											<td class="px-5 py-2">{hop.name}</td>
											<td class="px-5 py-2 text-right tabular-nums">{hop.alphaAcidPercent}%</td>
											<td class="px-5 py-2 text-right tabular-nums">{hop.grams} g</td>
											<td class="px-5 py-2 text-right tabular-nums">{hop.expectedIbu ?? '-'}</td>
											<td class="px-5 py-2 text-roast-soft">{hopAddedAt(hop.boilMinutes, recipeData.boil?.durationMin ?? null)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if recipeData.additions.length > 0}
							<div class="border-t border-malt/40 px-5 py-3">
								<p class="mb-2 text-xs font-semibold tracking-wide text-roast-soft uppercase">{$t('beer.recipe.other')}</p>
								<ul class="space-y-1 text-sm text-roast">
									{#each recipeData.additions as addition}
										<li>
											<span class="font-semibold">{addition.name}</span>
											{#if addition.amount} — {addition.amount}{/if}
											{#if addition.addAt}<span class="text-roast-soft">, {addition.addAt}</span>{/if}
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</section>

					<!-- FERMENTATION -->
					<section class="overflow-hidden rounded-2xl border border-malt bg-foam/80 shadow-sm">
						<div class="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-malt bg-malt/30 px-5 py-3">
							<h2 class="font-display text-lg font-bold tracking-wide text-roast uppercase">{$t('beer.recipe.fermentation')}</h2>
							{#if recipeData.fermentation}
								<span class="text-sm text-roast-soft"><span class="font-semibold text-roast">{recipeData.fermentation.tempC} °C</span></span>
								{#if recipeData.fermentation.lageringTempC != null && recipeData.fermentation.lageringWeeks != null}
									<span class="text-sm text-roast-soft">{$t('beer.recipe.lager')} <span class="font-semibold text-roast">{recipeData.fermentation.lageringWeeks} {$t('beer.recipe.weeks')}</span> {$t('beer.recipe.at')} <span class="font-semibold text-roast">{recipeData.fermentation.lageringTempC} °C</span></span>
								{/if}
								{#if recipeData.fermentation.readyWeeks != null}
									<span class="text-sm text-roast-soft">{$t('beer.recipe.readyAfter')} <span class="font-semibold text-roast">{recipeData.fermentation.readyWeeks} {$t('beer.recipe.weeks')}</span></span>
								{/if}
							{/if}
						</div>
						{#if recipeData.yeast}
							<div class="px-5 py-3 text-sm text-roast">
								<span class="font-semibold text-roast-soft uppercase text-xs tracking-wide">{$t('beer.recipe.yeast')}: </span>{recipeData.yeast}
							</div>
						{/if}
					</section>

				</div>
			{:else}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<div class="recipe max-w-3xl">{@html content.recipeHtml}</div>
			{/if}
		</div>
	</article>
{/if}
