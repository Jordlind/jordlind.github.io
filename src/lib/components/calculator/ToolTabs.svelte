<script lang="ts">
	type Tool = { id: string; label: string };

	let {
		label,
		tools,
		activeTool = $bindable()
	}: {
		label: string;
		tools: Tool[];
		activeTool: string;
	} = $props();
</script>

<div class="mb-2 text-xs font-semibold tracking-wide text-roast-soft uppercase">{label}</div>
<div class="mb-5 flex flex-wrap gap-2">
	{#each tools as tool (tool.id)}
		<button
			type="button"
			onclick={() => (activeTool = tool.id)}
			class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors {activeTool === tool.id
				? 'border-amber-deep bg-amber-deep text-foam'
				: 'border-malt bg-cream text-roast-soft hover:border-amber hover:text-roast'}"
		>
			{tool.label}
		</button>
	{/each}
</div>
