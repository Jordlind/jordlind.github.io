<script lang="ts">
	import { locale, t } from '$lib/i18n';
	import { getPage } from '$lib/content/pages';

	const content = $derived(getPage('about', $locale));
</script>

<svelte:head>
	<title>{$t('nav.about')} · Jordlind</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-16">
	<h1 class="font-display text-4xl font-bold text-amber-deep">
		{content?.title ?? $t('about.title')}
	</h1>
	{#if content}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="recipe mt-6">{@html content.html}</div>
	{/if}
</section>
