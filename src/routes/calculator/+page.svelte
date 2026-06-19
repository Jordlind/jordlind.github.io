<script lang="ts">
	import {
		abvFromOgFg,
		apparentAttenuation,
		colorFromMalts,
		ibuForAddition,
		primingSugarGrams,
		tinsethUtilization,
		type HopAddition,
		type MaltAddition,
		type PrimingSugarType
	} from '$lib/calculators/brewing';
	import { locale, t } from '$lib/i18n';

	type ToolId = 'ibu' | 'abv' | 'color' | 'priming';

	let activeTool = $state<ToolId>('ibu');

	let batchVolumeL = $state(20);
	let ibuGravity = $state(1.05);
	let abvOg = $state(1.058);
	let abvFg = $state(1.012);
	let primingTempC = $state(20);
	let targetCo2Vol = $state(2.4);
	let sugarType = $state<PrimingSugarType>('dextrose');

	let additions = $state<HopAddition[]>([
		{ id: 1, grams: 20, alphaAcidPercent: 10, boilMinutes: 60 }
	]);
	let nextHopId = $state(2);

	let malts = $state<MaltAddition[]>([
		{ id: 1, name: 'Pilsnermalt', weightKg: 4.8, colorEbc: 4 },
		{ id: 2, name: 'Munchnermalt', weightKg: 0.7, colorEbc: 18 }
	]);
	let nextMaltId = $state(3);

	function addHopAddition() {
		additions.push({ id: nextHopId, grams: 20, alphaAcidPercent: 10, boilMinutes: 15 });
		nextHopId += 1;
	}

	function removeHopAddition(id: number) {
		if (additions.length <= 1) return;
		additions = additions.filter((addition) => addition.id !== id);
	}

	function addMaltAddition() {
		malts.push({ id: nextMaltId, name: 'Specialmalt', weightKg: 0.2, colorEbc: 120 });
		nextMaltId += 1;
	}

	function removeMaltAddition(id: number) {
		if (malts.length <= 1) return;
		malts = malts.filter((malt) => malt.id !== id);
	}

	const tools = $derived([
		{ id: 'ibu' as const, label: $t('calc.tool.ibu') },
		{ id: 'abv' as const, label: $t('calc.tool.abv') },
		{ id: 'color' as const, label: $t('calc.tool.color') },
		{ id: 'priming' as const, label: $t('calc.tool.priming') }
	]);

	const totalIbu = $derived(
		additions.reduce((sum, addition) => {
			return sum + ibuForAddition(addition, ibuGravity, batchVolumeL);
		}, 0)
	);

	const abv = $derived(abvFromOgFg(abvOg, abvFg));
	const attenuation = $derived(apparentAttenuation(abvOg, abvFg));
	const color = $derived(colorFromMalts(malts, batchVolumeL));
	const priming = $derived(
		primingSugarGrams({
			volumeL: batchVolumeL,
			targetCo2Vol,
			beerTempC: primingTempC,
			sugarType
		})
	);

	const numberFormatter = $derived(
		new Intl.NumberFormat($locale === 'sv' ? 'sv-SE' : 'en-US', {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		})
	);
</script>

<svelte:head>
	<title>{$t('calc.title')} · Jordlind</title>
	<meta name="description" content={$t('calc.subtitle')} />
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-16">
	<div class="relative mb-10 overflow-hidden rounded-3xl border border-malt bg-roast p-8 text-cream">
		<div
			class="pointer-events-none absolute inset-0 opacity-20"
			style="background-image: radial-gradient(circle at 18% 20%, var(--color-amber) 0, transparent 45%), radial-gradient(circle at 80% 70%, var(--color-hop) 0, transparent 40%);"
		></div>
		<div class="relative">
			<p class="text-xs tracking-[0.2em] text-cream/70 uppercase">Jordlind Lab</p>
			<h1 class="mt-2 font-display text-4xl font-bold text-cream">{$t('calc.title')}</h1>
			<p class="mt-3 max-w-2xl text-cream/80">{$t('calc.subtitle')}</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<div class="rounded-2xl border border-malt bg-foam p-6 shadow-sm lg:col-span-2">
			<div class="mb-2 text-xs font-semibold tracking-wide text-roast-soft uppercase">{$t('calc.tools')}</div>
			<div class="mb-5 flex flex-wrap gap-2">
				{#each tools as tool (tool.id)}
					<button
						type="button"
						onclick={() => (activeTool = tool.id)}
						class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors {activeTool ===
						tool.id
							? 'border-amber-deep bg-amber-deep text-foam'
							: 'border-malt bg-cream text-roast-soft hover:border-amber hover:text-roast'}"
					>
						{tool.label}
					</button>
				{/each}
			</div>

			{#if activeTool === 'ibu'}
				<h2 class="font-display text-2xl font-semibold text-roast">{$t('calc.tool.ibu')}</h2>
				<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="mb-1 block text-sm font-medium text-roast-soft">{$t('calc.volume')}</span>
						<input
							type="number"
							min="0.1"
							step="0.1"
							bind:value={batchVolumeL}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
					<label class="block">
						<span class="mb-1 block text-sm font-medium text-roast-soft">{$t('calc.gravity')}</span>
						<input
							type="number"
							min="1"
							step="0.001"
							bind:value={ibuGravity}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
				</div>

				<div class="mt-8">
					<div class="mb-3 flex items-center justify-between gap-3">
						<h3 class="font-display text-xl font-semibold text-roast">{$t('calc.hops')}</h3>
						<button
							type="button"
							onclick={addHopAddition}
							class="rounded-full bg-amber-deep px-4 py-2 text-sm font-semibold text-foam transition-colors hover:bg-amber"
						>
							{$t('calc.addHop')}
						</button>
					</div>

					<div class="overflow-x-auto">
						<table class="min-w-full border-collapse text-sm">
							<thead>
								<tr class="border-b border-malt text-left text-roast-soft">
									<th class="px-3 py-2">{$t('calc.hopAmount')}</th>
									<th class="px-3 py-2">{$t('calc.alphaAcid')}</th>
									<th class="px-3 py-2">{$t('calc.boilTime')}</th>
									<th class="px-3 py-2">{$t('calc.utilization')}</th>
									<th class="px-3 py-2">{$t('calc.ibuContribution')}</th>
									<th class="px-3 py-2"></th>
								</tr>
							</thead>
							<tbody>
								{#each additions as addition (addition.id)}
									<tr class="border-b border-malt/70 align-top">
										<td class="px-3 py-2">
											<input
												type="number"
												min="0"
												step="0.1"
												bind:value={addition.grams}
												class="w-28 rounded-lg border border-malt bg-cream px-2 py-1 focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
											/>
										</td>
										<td class="px-3 py-2">
											<input
												type="number"
												min="0"
												step="0.1"
												bind:value={addition.alphaAcidPercent}
												class="w-28 rounded-lg border border-malt bg-cream px-2 py-1 focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
											/>
										</td>
										<td class="px-3 py-2">
											<input
												type="number"
												min="0"
												step="1"
												bind:value={addition.boilMinutes}
												class="w-28 rounded-lg border border-malt bg-cream px-2 py-1 focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
											/>
										</td>
										<td class="px-3 py-2 font-medium text-roast">
											{numberFormatter.format(tinsethUtilization(ibuGravity, addition.boilMinutes) * 100)}%
										</td>
										<td class="px-3 py-2 font-semibold text-amber-deep">
											{numberFormatter.format(ibuForAddition(addition, ibuGravity, batchVolumeL))}
										</td>
										<td class="px-3 py-2 text-right">
											<button
												type="button"
												onclick={() => removeHopAddition(addition.id)}
												class="rounded-full border border-malt px-3 py-1 text-xs font-medium text-roast-soft transition-colors hover:border-amber hover:text-amber-deep disabled:cursor-not-allowed disabled:opacity-50"
												disabled={additions.length === 1}
											>
												{$t('calc.removeHop')}
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{:else if activeTool === 'abv'}
				<h2 class="font-display text-2xl font-semibold text-roast">{$t('calc.tool.abv')}</h2>
				<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="mb-1 block text-sm font-medium text-roast-soft">{$t('calc.start')}</span>
						<input
							type="number"
							min="1"
							step="0.001"
							bind:value={abvOg}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
					<label class="block">
						<span class="mb-1 block text-sm font-medium text-roast-soft">{$t('calc.final')}</span>
						<input
							type="number"
							min="0.99"
							step="0.001"
							bind:value={abvFg}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
				</div>
			{:else if activeTool === 'color'}
				<h2 class="font-display text-2xl font-semibold text-roast">{$t('calc.tool.color')}</h2>
				<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="mb-1 block text-sm font-medium text-roast-soft">{$t('calc.volume')}</span>
						<input
							type="number"
							min="0.1"
							step="0.1"
							bind:value={batchVolumeL}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
				</div>

				<div class="mt-8">
					<div class="mb-3 flex items-center justify-between gap-3">
						<h3 class="font-display text-xl font-semibold text-roast">{$t('calc.grainBill')}</h3>
						<button
							type="button"
							onclick={addMaltAddition}
							class="rounded-full bg-amber-deep px-4 py-2 text-sm font-semibold text-foam transition-colors hover:bg-amber"
						>
							{$t('calc.addMalt')}
						</button>
					</div>
					<div class="overflow-x-auto">
						<table class="min-w-full border-collapse text-sm">
							<thead>
								<tr class="border-b border-malt text-left text-roast-soft">
									<th class="px-3 py-2">{$t('calc.maltName')}</th>
									<th class="px-3 py-2">{$t('calc.maltWeight')}</th>
									<th class="px-3 py-2">{$t('calc.maltColor')}</th>
									<th class="px-3 py-2"></th>
								</tr>
							</thead>
							<tbody>
								{#each malts as malt (malt.id)}
									<tr class="border-b border-malt/70">
										<td class="px-3 py-2">
											<input
												type="text"
												bind:value={malt.name}
												class="w-40 rounded-lg border border-malt bg-cream px-2 py-1 focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
											/>
										</td>
										<td class="px-3 py-2">
											<input
												type="number"
												min="0"
												step="0.01"
												bind:value={malt.weightKg}
												class="w-28 rounded-lg border border-malt bg-cream px-2 py-1 focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
											/>
										</td>
										<td class="px-3 py-2">
											<input
												type="number"
												min="0"
												step="1"
												bind:value={malt.colorEbc}
												class="w-28 rounded-lg border border-malt bg-cream px-2 py-1 focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
											/>
										</td>
										<td class="px-3 py-2 text-right">
											<button
												type="button"
												onclick={() => removeMaltAddition(malt.id)}
												class="rounded-full border border-malt px-3 py-1 text-xs font-medium text-roast-soft transition-colors hover:border-amber hover:text-amber-deep disabled:cursor-not-allowed disabled:opacity-50"
												disabled={malts.length === 1}
											>
												{$t('calc.removeHop')}
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{:else}
				<h2 class="font-display text-2xl font-semibold text-roast">{$t('calc.tool.priming')}</h2>
				<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="mb-1 block text-sm font-medium text-roast-soft">{$t('calc.volume')}</span>
						<input
							type="number"
							min="0.1"
							step="0.1"
							bind:value={batchVolumeL}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
					<label class="block">
						<span class="mb-1 block text-sm font-medium text-roast-soft">{$t('calc.temp')}</span>
						<input
							type="number"
							min="0"
							step="0.1"
							bind:value={primingTempC}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
					<label class="block">
						<span class="mb-1 block text-sm font-medium text-roast-soft">{$t('calc.targetCo2')}</span>
						<input
							type="number"
							min="0"
							step="0.1"
							bind:value={targetCo2Vol}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						/>
					</label>
					<label class="block">
						<span class="mb-1 block text-sm font-medium text-roast-soft">{$t('calc.sugarType')}</span>
						<select
							bind:value={sugarType}
							class="w-full rounded-lg border border-malt bg-cream px-3 py-2 text-roast focus:border-amber focus:ring-2 focus:ring-amber/40 focus:outline-none"
						>
							<option value="dextrose">{$t('calc.sugar.dextrose')}</option>
							<option value="sucrose">{$t('calc.sugar.sucrose')}</option>
							<option value="dme">{$t('calc.sugar.dme')}</option>
						</select>
					</label>
				</div>
			{/if}
		</div>

		<aside class="rounded-2xl border border-malt bg-malt/40 p-6 lg:sticky lg:top-24 lg:self-start">
			<p class="text-sm font-medium tracking-wide text-roast-soft uppercase">{$t('calc.results')}</p>
			{#if activeTool === 'ibu'}
				<p class="mt-2 font-display text-5xl font-bold text-amber-deep">
					{numberFormatter.format(totalIbu)}
				</p>
				<p class="mt-1 text-sm text-roast-soft">{$t('calc.totalIbu')}</p>
			{:else if activeTool === 'abv'}
				<p class="mt-2 font-display text-5xl font-bold text-amber-deep">{numberFormatter.format(abv)}%</p>
				<p class="mt-1 text-sm text-roast-soft">{$t('calc.abv')}</p>
				<p class="mt-3 text-sm text-roast-soft">
					{$t('calc.attenuation')}: {numberFormatter.format(attenuation)}%
				</p>
			{:else if activeTool === 'color'}
				<p class="mt-2 font-display text-5xl font-bold text-amber-deep">
					{numberFormatter.format(color.ebc)}
				</p>
				<p class="mt-1 text-sm text-roast-soft">{$t('calc.colorEbc')}</p>
				<p class="mt-3 text-sm text-roast-soft">{$t('calc.colorSrm')}: {numberFormatter.format(color.srm)}</p>
				<p class="mt-1 text-sm text-roast-soft">{$t('calc.mcu')}: {numberFormatter.format(color.mcu)}</p>
			{:else}
				<p class="mt-2 font-display text-5xl font-bold text-amber-deep">
					{numberFormatter.format(priming.grams)} g
				</p>
				<p class="mt-1 text-sm text-roast-soft">{$t('calc.priming')}</p>
				<p class="mt-3 text-sm text-roast-soft">
					{$t('calc.residualCo2')}: {numberFormatter.format(priming.residualCo2)} vol
				</p>
				<p class="mt-1 text-sm text-roast-soft">
					{$t('calc.addedCo2')}: {numberFormatter.format(priming.deltaCo2)} vol
				</p>
			{/if}

			<div class="mt-8 rounded-xl border border-malt bg-foam/70 p-4 text-sm text-roast-soft">
				<h3 class="font-display text-lg font-semibold text-roast">{$t('calc.formulaTitle')}</h3>
				{#if activeTool === 'ibu'}
					<p class="mt-2">{$t('calc.formulaIbu')}</p>
				{:else if activeTool === 'abv'}
					<p class="mt-2">{$t('calc.formulaAbv')}</p>
				{:else if activeTool === 'color'}
					<p class="mt-2">{$t('calc.formulaColor')}</p>
				{:else}
					<p class="mt-2">{$t('calc.formulaPriming')}</p>
				{/if}
			</div>

			<p class="mt-4 text-sm text-roast-soft">{$t('calc.note')}</p>
		</aside>
	</div>
</section>
