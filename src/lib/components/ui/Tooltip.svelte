<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		text,
		label
	}: {
		/** The help text shown inside the popover. */
		text: string;
		/** Accessible label for the trigger button. Defaults to a generic hint. */
		label?: string;
	} = $props();

	let open = $state(false);
	let wrapper: HTMLSpanElement | undefined;

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}

	function handleWindowClick(event: MouseEvent) {
		if (open && wrapper && !wrapper.contains(event.target as Node)) close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<span bind:this={wrapper} class="relative inline-flex align-middle">
	<button
		type="button"
		onclick={toggle}
		onmouseenter={() => (open = true)}
		onmouseleave={() => (open = false)}
		aria-label={label ?? text}
		aria-expanded={open}
		class="grid size-6 place-items-center rounded-full text-roast-soft/70 transition-colors hover:bg-malt/60 hover:text-roast focus:ring-2 focus:ring-amber/40 focus:outline-none"
	>
		<Icon name="info" class="size-4" />
	</button>

	{#if open}
		<span
			role="tooltip"
			class="absolute top-full left-1/2 z-30 mt-2 w-64 max-w-[min(16rem,80vw)] -translate-x-1/2 rounded-lg border border-malt bg-foam p-3 text-left text-xs leading-relaxed font-normal text-roast normal-case shadow-lg"
		>
			{text}
		</span>
	{/if}
</span>
