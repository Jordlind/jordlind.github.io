<script lang="ts">
	import { t } from '$lib/i18n';
	const year = new Date().getFullYear();
</script>

<footer class="mt-16 border-t border-malt bg-roast text-cream">
	<div
		class="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center text-sm sm:flex-row sm:justify-between sm:text-left"
	>
		<p class="font-display text-lg font-bold text-amber">🍺 Jordlind</p>
		<p class="text-cream/70">© {year} Jordlind · {$t('footer.rights')}</p>
	</div>
</footer>
