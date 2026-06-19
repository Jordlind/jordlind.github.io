<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import {
		EXPORT_FORMATS,
		serializeRecipe,
		type ExportFormat
	} from '$lib/calculators/recipeExport';
	import type { BuilderRecipe, RecipeMetrics } from '$lib/calculators/recipe';

	let {
		t,
		recipe,
		metrics,
		numberFormatter
	}: {
		t: (key: string) => string;
		recipe: BuilderRecipe;
		metrics: RecipeMetrics;
		numberFormatter: Intl.NumberFormat;
	} = $props();

	let format = $state<ExportFormat>('yaml');
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	const content = $derived(serializeRecipe(format, recipe, metrics, t, numberFormatter));
	const activeExt = $derived(EXPORT_FORMATS.find((f) => f.id === format)?.ext ?? 'txt');

	async function copy() {
		try {
			await navigator.clipboard.writeText(content);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 2000);
		} catch {
			copied = false;
		}
	}

	function download() {
		const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `recept.${activeExt}`;
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
