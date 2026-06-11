<script lang="ts">
	import { locale, setLocale } from '$lib/i18n';
	import { locales, type Locale } from '$lib/i18n/translations';

	const labels: Record<Locale, string> = { sv: 'SV', en: 'EN' };
</script>

<div class="inline-flex overflow-hidden rounded-full border border-amber/40 text-sm">
	{#each locales as code (code)}
		<button
			type="button"
			class="px-3 py-1 font-semibold transition-colors {$locale === code
				? 'bg-amber-deep text-foam'
				: 'bg-transparent text-roast-soft hover:bg-malt'}"
			aria-pressed={$locale === code}
			onclick={() => setLocale(code)}
		>
			{labels[code]}
		</button>
	{/each}
</div>
