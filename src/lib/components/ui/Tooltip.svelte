<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		text,
		label
	}: {
		/** The help text shown inside the popover. */
		text: string;
		/** Accessible label for the trigger button. Defaults to the help text. */
		label?: string;
	} = $props();

	let open = $state(false);
	let wrapper: HTMLSpanElement | undefined;

	function handleWindowClick(event: MouseEvent) {
		if (open && wrapper && !wrapper.contains(event.target as Node)) open = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') open = false;
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<span bind:this={wrapper} class="relative inline-flex align-middle">
	<button
		type="button"
		onclick={() => (open = !open)}
		onmouseenter={() => (open = true)}
		onmouseleave={() => (open = false)}
		aria-label={label ?? text}
		aria-expanded={open}
		class="inline-grid size-7 place-items-center rounded-full border border-malt bg-cream text-amber-deep transition-colors hover:border-amber hover:bg-amber/15 focus:ring-2 focus:ring-amber/40 focus:outline-none"
	>
		<Icon name="info" class="size-5" />
	</button>

	{#if open}
		<!-- pt-2 acts as a hover bridge so the popover stays reachable from the button -->
		<span
			role="tooltip"
			class="absolute top-full left-1/2 z-30 block w-64 max-w-[min(16rem,75vw)] -translate-x-1/2 pt-2"
		>
			<span
				class="block rounded-lg border border-malt bg-foam p-3 text-left text-xs leading-relaxed font-normal text-roast normal-case shadow-lg"
			>
				{text}
			</span>
		</span>
	{/if}
</span>
