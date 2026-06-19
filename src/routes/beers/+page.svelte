<script lang="ts">
	import { locale, t } from '$lib/i18n';
	import { getAllBeers, localizedContent } from '$lib/content/beers';
	import BeerCard from '$lib/components/BeerCard.svelte';

	type SortMode = 'date-desc' | 'date-asc' | 'style' | 'name';
	type SectionMode = 'all' | 'available' | 'planned' | 'archived';

	const beers = getAllBeers();
	let sortMode = $state<SortMode>('date-desc');
	let sectionMode = $state<SectionMode>('all');

	function onSortChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value as SortMode;
		sortMode = value;
	}

	function onSectionChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value as SectionMode;
		sectionMode = value;
	}

	const sortedBeers = $derived.by(() => {
		const mode = sortMode;
		const loc = $locale;
		return [...beers].sort((a, b) => {
			const contentA = localizedContent(a, loc);
			const contentB = localizedContent(b, loc);

			if (mode === 'style') {
				const styleA = contentA?.style ?? '';
				const styleB = contentB?.style ?? '';
				const byStyle = styleA.localeCompare(styleB, loc);
				if (byStyle !== 0) return byStyle;
			}

			if (mode === 'name') {
				const nameA = contentA?.name ?? a.slug;
				const nameB = contentB?.name ?? b.slug;
				return nameA.localeCompare(nameB, loc);
			}

			if (mode === 'date-desc' || mode === 'date-asc') {
				const dateA = contentA?.brewed ?? '';
				const dateB = contentB?.brewed ?? '';
				const cmp = dateA.localeCompare(dateB);
				if (cmp !== 0) return mode === 'date-desc' ? -cmp : cmp;
			}

			const fallbackDateA = contentA?.brewed ?? '';
			const fallbackDateB = contentB?.brewed ?? '';
			const fallbackCmp = fallbackDateB.localeCompare(fallbackDateA);
			if (fallbackCmp !== 0) return fallbackCmp;
			return a.slug.localeCompare(b.slug);
		});
	});

	const visibleBeers = $derived.by(() => {
		const loc = $locale;
		const section = sectionMode;

		if (section === 'all') return sortedBeers;

		return sortedBeers.filter((beer) => {
			const status = localizedContent(beer, loc)?.status ?? 'none';
			if (section === 'available') return status === 'available' || status === 'none';
			if (section === 'planned') return status === 'planned';
			return status === 'archived';
		});
	});

	const sectionTitleKey = $derived.by(() => {
		if (sectionMode === 'available') return 'beers.section.current';
		if (sectionMode === 'planned') return 'beers.section.planned';
		if (sectionMode === 'archived') return 'beers.section.archived';
		return 'beers.section.all';
	});
</script>

<svelte:head>
	<title>{$t('beers.title')} · Jordlind</title>
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-16">
	<div class="mb-10 text-center">
		<h1 class="font-display text-4xl font-bold text-amber-deep">{$t('beers.title')}</h1>
		<p class="mx-auto mt-3 max-w-xl text-roast-soft">{$t('beers.intro')}</p>
		<div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
			<div class="inline-flex items-center gap-2 rounded-full border border-malt bg-foam px-3 py-2">
				<label for="section-mode" class="font-medium text-roast-soft">{$t('beers.filter.label')}</label>
				<select
					id="section-mode"
					bind:value={sectionMode}
					onchange={onSectionChange}
					class="rounded-full border border-malt bg-cream px-3 py-1 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
				>
					<option value="all">{$t('beers.filter.all')}</option>
					<option value="available">{$t('beers.filter.available')}</option>
					<option value="planned">{$t('beers.filter.planned')}</option>
					<option value="archived">{$t('beers.filter.archived')}</option>
				</select>
			</div>

			<div class="inline-flex items-center gap-2 rounded-full border border-malt bg-foam px-3 py-2">
				<label for="sort-mode" class="font-medium text-roast-soft">{$t('beers.sort.label')}</label>
				<select
					id="sort-mode"
					bind:value={sortMode}
					onchange={onSortChange}
					class="rounded-full border border-malt bg-cream px-3 py-1 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
				>
					<option value="date-desc">{$t('beers.sort.dateDesc')}</option>
					<option value="date-asc">{$t('beers.sort.dateAsc')}</option>
					<option value="style">{$t('beers.sort.style')}</option>
					<option value="name">{$t('beers.sort.name')}</option>
				</select>
			</div>
		</div>
	</div>

	{#if sortedBeers.length > 0}
		{#if visibleBeers.length > 0}
			<section>
				<h2 class="mb-4 font-display text-2xl font-semibold text-roast">{$t(sectionTitleKey)}</h2>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each visibleBeers as beer (beer.slug)}
						<BeerCard {beer} />
					{/each}
				</div>
			</section>
		{:else}
			<p class="text-center text-roast-soft">{$t('beers.emptyFiltered')}</p>
		{/if}
	{:else}
		<p class="text-center text-roast-soft">{$t('beers.empty')}</p>
	{/if}
</section>
