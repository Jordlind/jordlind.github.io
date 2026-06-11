<script lang="ts">
	import { base } from '$app/paths';

	let {
		images,
		alt,
		imageClass = '',
		emojiClass = 'text-6xl'
	}: {
		images: string[];
		alt: string;
		imageClass?: string;
		emojiClass?: string;
	} = $props();

	let index = $state(0);

	const count = $derived(images.length);
	const hasMultiple = $derived(count > 1);
	// Normalised, always-in-bounds index even if `images` changes.
	const current = $derived(count > 0 ? ((index % count) + count) % count : 0);

	function go(event: MouseEvent, delta: number) {
		// Prevent the surrounding card link from navigating.
		event.preventDefault();
		event.stopPropagation();
		index = current + delta;
	}

	function select(event: MouseEvent, target: number) {
		event.preventDefault();
		event.stopPropagation();
		index = target;
	}
</script>

<div class="group/gallery relative h-full w-full">
	{#if images.length > 0}
		{#each images as src, i (src)}
			<img
				src="{base}/beers/{src}"
				{alt}
				loading="lazy"
				class="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 {imageClass} {i ===
				current
					? 'opacity-100'
					: 'opacity-0'}"
				aria-hidden={i !== current}
			/>
		{/each}
	{:else}
		<div class="flex h-full w-full items-center justify-center {emojiClass}">🍺</div>
	{/if}

	{#if hasMultiple}
		<!-- Prev / next arrows: revealed on hover -->
		<button
			type="button"
			aria-label="Previous image"
			class="absolute top-1/2 left-2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-roast/60 text-lg text-foam opacity-0 transition-opacity duration-200 group-hover/gallery:opacity-100 hover:bg-roast/80 focus:opacity-100"
			onclick={(e) => go(e, -1)}
		>
			‹
		</button>
		<button
			type="button"
			aria-label="Next image"
			class="absolute top-1/2 right-2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-roast/60 text-lg text-foam opacity-0 transition-opacity duration-200 group-hover/gallery:opacity-100 hover:bg-roast/80 focus:opacity-100"
			onclick={(e) => go(e, 1)}
		>
			›
		</button>

		<!-- Dot indicators -->
		<div class="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
			{#each images as src, i (src)}
				<button
					type="button"
					aria-label="Show image {i + 1}"
					aria-current={i === current}
					class="h-2 w-2 rounded-full transition-colors {i === current
						? 'bg-foam'
						: 'bg-foam/50 hover:bg-foam/80'}"
					onclick={(e) => select(e, i)}
				></button>
			{/each}
		</div>
	{/if}
</div>
