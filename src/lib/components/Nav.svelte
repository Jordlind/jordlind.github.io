<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import LanguageToggle from './LanguageToggle.svelte';

	let open = $state(false);

	const links = $derived([
		{ href: `${base}/`, label: $t('nav.home'), match: (p: string) => p === `${base}/` },
		{
			href: `${base}/beers`,
			label: $t('nav.beers'),
			match: (p: string) => p.startsWith(`${base}/beers`)
		},
		{ href: `${base}/about`, label: $t('nav.about'), match: (p: string) => p === `${base}/about` }
	]);

	const path = $derived(page.url.pathname);
</script>

<header class="sticky top-0 z-50 border-b border-malt bg-foam/90 backdrop-blur">
	<nav class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
		<a href="{base}/" class="flex items-center gap-2" onclick={() => (open = false)}>
			<span class="text-2xl">🍺</span>
			<span class="flex flex-col leading-none">
				<span class="font-display text-xl font-bold text-amber-deep">{$t('nav.brand')}</span>
				<span class="text-xs tracking-wide text-roast-soft uppercase">{$t('nav.tagline')}</span>
			</span>
		</a>

		<div class="hidden items-center gap-6 md:flex">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class="text-sm font-medium transition-colors hover:text-amber-deep {link.match(path)
						? 'text-amber-deep'
						: 'text-roast'}"
				>
					{link.label}
				</a>
			{/each}
			<LanguageToggle />
		</div>

		<div class="flex items-center gap-3 md:hidden">
			<LanguageToggle />
			<button
				type="button"
				class="text-2xl text-roast"
				aria-label="Menu"
				aria-expanded={open}
				onclick={() => (open = !open)}
			>
				{open ? '✕' : '☰'}
			</button>
		</div>
	</nav>

	{#if open}
		<div class="border-t border-malt bg-foam md:hidden">
			<div class="mx-auto flex max-w-5xl flex-col px-4 py-2">
				{#each links as link (link.href)}
					<a
						href={link.href}
						class="py-2 text-sm font-medium {link.match(path)
							? 'text-amber-deep'
							: 'text-roast'}"
						onclick={() => (open = false)}
					>
						{link.label}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</header>
