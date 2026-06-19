<script lang="ts">
	import { ICONS, type IconName } from '$lib/icons/library';

	let {
		name,
		title,
		class: className = 'size-5'
	}: {
		name: IconName;
		title?: string;
		class?: string;
	} = $props();

	const icon = $derived(ICONS[name]);
</script>

<svg
	viewBox={icon.viewBox}
	fill="currentColor"
	class={className}
	role={title ? 'img' : 'presentation'}
	aria-label={title}
	aria-hidden={title ? undefined : true}
>
	{#if title}
		<title>{title}</title>
	{/if}
	<path d={icon.path}></path>
</svg>
