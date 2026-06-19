<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import {
		EXPORT_FORMATS,
		recipeSlug,
		serializeRecipe,
		type ExportFormat
	} from '$lib/calculators/recipeExport';
	import type { BuilderRecipe, RecipeMetrics, SectionState } from '$lib/calculators/recipe';
	import type { Locale } from '$lib/i18n/translations';

	let {
		t,
		recipe,
		metrics,
		sections,
		locale
	}: {
		t: (key: string) => string;
		recipe: BuilderRecipe;
		metrics: RecipeMetrics;
		sections: SectionState;
		locale: Locale;
	} = $props();

	let format = $state<ExportFormat>('yaml');
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	const content = $derived(serializeRecipe(format, recipe, metrics, sections, locale));
	const activeExt = $derived(EXPORT_FORMATS.find((f) => f.id === format)?.ext ?? 'txt');

	function flagCopied() {
		copied = true;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 2000);
	}

	/** Older browsers / insecure contexts: copy via a temporary textarea. */
	function legacyCopy(text: string): boolean {
		try {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			textarea.setAttribute('readonly', '');
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(textarea);
			return ok;
		} catch {
			return false;
		}
	}

	async function copy() {
		if (navigator.clipboard?.writeText) {
			try {
				await navigator.clipboard.writeText(content);
				flagCopied();
				return;
			} catch {
				// fall through to the legacy path below
			}
		}
		if (legacyCopy(content)) flagCopied();
	}

	function download() {
		const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `${recipeSlug(recipe)}.${activeExt}`;
		anchor.click();
		URL.revokeObjectURL(url);
	}
</script>

<section class="mt-8 rounded-2xl border border-malt bg-foam p-6 shadow-sm">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<h2 class="font-display text-2xl font-semibold text-roast">{t('calc.export.title')}</h2>
			<p class="mt-1 max-w-xl text-sm text-roast-soft">{t('calc.export.intro')}</p>
		</div>

		<div class="inline-flex rounded-lg border border-malt bg-cream p-1 text-sm">
			{#each EXPORT_FORMATS as fmt (fmt.id)}
				<button
					type="button"
					onclick={() => (format = fmt.id)}
					class="rounded-md px-3 py-1.5 font-medium transition {format === fmt.id
						? 'bg-amber text-roast shadow-sm'
						: 'text-roast-soft hover:text-roast'}"
				>
					{fmt.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="mt-4 flex flex-wrap gap-2">
		<button
			type="button"
			onclick={copy}
			class="inline-flex items-center gap-2 rounded-full bg-amber-deep px-4 py-2 text-sm font-semibold text-foam transition-colors hover:bg-amber"
		>
			<Icon name={copied ? 'check' : 'copy'} class="size-4" />
			{copied ? t('calc.export.copied') : t('calc.export.copy')}
		</button>
		<button
			type="button"
			onclick={download}
			class="inline-flex items-center gap-2 rounded-full border border-malt px-4 py-2 text-sm font-semibold text-roast transition-colors hover:border-amber hover:text-amber-deep"
		>
			<Icon name="download" class="size-4" />
			{t('calc.export.download')}
		</button>
	</div>

	<pre
		class="mt-4 max-h-96 overflow-auto rounded-xl border border-malt bg-roast/95 p-4 text-xs leading-relaxed text-cream"><code
			>{content}</code
		></pre>
</section>
