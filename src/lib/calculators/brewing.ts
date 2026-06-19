export type HopAddition = {
	id: number;
	grams: number;
	alphaAcidPercent: number;
	boilMinutes: number;
};

export type MaltAddition = {
	id: number;
	name: string;
	weightKg: number;
	colorEbc: number;
};

export type PrimingSugarType = 'dextrose' | 'sucrose' | 'dme';

const KG_TO_LB = 2.20462;
const L_TO_GAL = 0.264172;

export function clampPositive(value: number, fallback = 0): number {
	if (Number.isNaN(value) || !Number.isFinite(value)) return fallback;
	return Math.max(0, value);
}

export function tinsethUtilization(gravity: number, boilMinutes: number): number {
	const safeGravity = Math.max(1, gravity);
	const safeBoilTime = clampPositive(boilMinutes);

	if (safeBoilTime === 0) return 0;

	return (
		1.65 *
		Math.pow(0.000125, safeGravity - 1) *
		((1 - Math.exp(-0.04 * safeBoilTime)) / 4.15)
	);
}

export function ibuForAddition(addition: HopAddition, gravity: number, volumeL: number): number {
	const safeVolume = Math.max(0.0001, volumeL);
	const aaFraction = clampPositive(addition.alphaAcidPercent) / 100;
	const grams = clampPositive(addition.grams);
	const utilization = tinsethUtilization(gravity, addition.boilMinutes);

	return (grams * aaFraction * utilization * 1000) / safeVolume;
}

/**
 * Simplified IBU mode: Tinseth time curve without gravity correction.
 * Useful when OG is unknown and you still want a reasonable estimate.
 */
export function ibuForAdditionNoGravity(addition: HopAddition, volumeL: number): number {
	const safeVolume = Math.max(0.0001, volumeL);
	const aaFraction = clampPositive(addition.alphaAcidPercent) / 100;
	const grams = clampPositive(addition.grams);
	const boilTime = clampPositive(addition.boilMinutes);
	const utilization = (1 - Math.exp(-0.04 * boilTime)) / 4.15;

	return (grams * aaFraction * utilization * 1000) / safeVolume;
}

export function abvFromOgFg(og: number, fg: number): number {
	const safeOg = Math.max(1, og);
	const safeFg = Math.max(0.9, fg);
	return Math.max(0, (safeOg - safeFg) * 131.25);
}

export type FermentableType = 'base' | 'viennaMunich' | 'crystal' | 'flaked' | 'sugar';

export type Fermentable = {
	id: number;
	name: string;
	weightKg: number;
	type: FermentableType;
};

/**
 * Simplified extract potential per fermentable type, expressed as gravity
 * points per kg per litre (GP/kg/L). Sugar dissolves fully so it bypasses
 * the mash efficiency that applies to grains.
 */
const FERMENTABLE_PROFILE: Record<FermentableType, { potential: number; mashable: boolean }> = {
	base: { potential: 300, mashable: true },
	viennaMunich: { potential: 295, mashable: true },
	crystal: { potential: 280, mashable: true },
	flaked: { potential: 300, mashable: true },
	sugar: { potential: 385, mashable: false }
};

export function fermentablePotential(type: FermentableType): number {
	return FERMENTABLE_PROFILE[type].potential;
}

/** Gravity points contributed by a single fermentable to the batch. */
export function fermentableGravityPoints(
	fermentable: Fermentable,
	efficiencyPercent: number,
	volumeL: number
): number {
	const safeVolume = Math.max(0.0001, volumeL);
	const weightKg = clampPositive(fermentable.weightKg);
	const { potential, mashable } = FERMENTABLE_PROFILE[fermentable.type];
	const efficiency = mashable ? clampPositive(efficiencyPercent) / 100 : 1;
	return (weightKg * potential * efficiency) / safeVolume;
}

export function estimateOgFromGrainBill(
	fermentables: Fermentable[],
	efficiencyPercent: number,
	volumeL: number
): number {
	const points = fermentables.reduce(
		(sum, fermentable) => sum + fermentableGravityPoints(fermentable, efficiencyPercent, volumeL),
		0
	);
	return 1 + points / 1000;
}

/**
 * Mash temperature correction to apparent attenuation, in percentage points.
 * Cooler mashes are more fermentable (higher attenuation); hotter mashes leave
 * more residual sugars. Calibrated around a neutral 67 °C.
 */
export function mashTempAttenuationAdjustment(tempC: number): number {
	if (Number.isNaN(tempC)) return 0;
	const delta = 67 - tempC;
	const adjustment = tempC <= 67 ? delta : delta * 2;
	return Math.max(-10, Math.min(6, adjustment));
}

/**
 * Attenuation reduction (percentage points) when crystal/caramel malt makes up
 * more than 10 % of the grain bill: roughly −2 % for every extra 5 % share.
 */
export function crystalAttenuationAdjustment(fermentables: Fermentable[]): number {
	const totalWeight = fermentables.reduce((sum, f) => sum + clampPositive(f.weightKg), 0);
	if (totalWeight <= 0) return 0;
	const crystalWeight = fermentables
		.filter((f) => f.type === 'crystal')
		.reduce((sum, f) => sum + clampPositive(f.weightKg), 0);
	const crystalShare = crystalWeight / totalWeight;
	if (crystalShare <= 0.1) return 0;
	const steps = (crystalShare - 0.1) / 0.05;
	return -(steps * 2);
}

export function estimateRecipeAbv(params: {
	fermentables: Fermentable[];
	efficiencyPercent: number;
	volumeL: number;
	baseAttenuationPercent: number;
	mashTempC: number;
}): { og: number; fg: number; abv: number; attenuation: number } {
	const og = estimateOgFromGrainBill(params.fermentables, params.efficiencyPercent, params.volumeL);
	const ogPoints = (og - 1) * 1000;
	const attenuation = Math.max(
		0,
		Math.min(
			100,
			clampPositive(params.baseAttenuationPercent) +
				mashTempAttenuationAdjustment(params.mashTempC) +
				crystalAttenuationAdjustment(params.fermentables)
		)
	);
	const fgPoints = ogPoints * (1 - attenuation / 100);
	const fg = 1 + fgPoints / 1000;
	const abv = abvFromOgFg(og, fg);

	return { og, fg, abv, attenuation };
}

export function apparentAttenuation(og: number, fg: number): number {
	const points = Math.max(0.0001, (og - 1) * 1000);
	const consumed = Math.max(0, (og - fg) * 1000);
	return Math.max(0, Math.min(100, (consumed / points) * 100));
}

export function colorFromMalts(malts: MaltAddition[], volumeL: number): {
	mcu: number;
	srm: number;
	ebc: number;
} {
	const volumeGal = Math.max(0.0001, volumeL * L_TO_GAL);
	const mcu = malts.reduce((sum, malt) => {
		const weightLb = clampPositive(malt.weightKg) * KG_TO_LB;
		const lovibond = clampPositive(malt.colorEbc) / 1.97;
		return sum + (weightLb * lovibond) / volumeGal;
	}, 0);

	const srm = 1.4922 * Math.pow(Math.max(0, mcu), 0.6859);
	const ebc = srm * 1.97;

	return { mcu, srm, ebc };
}

export function residualCo2ByTempC(tempC: number): number {
	const tempF = tempC * (9 / 5) + 32;
	return 3.0378 - 0.050062 * tempF + 0.00026555 * tempF * tempF;
}

export function primingFactor(type: PrimingSugarType): number {
	switch (type) {
		case 'sucrose':
			return 3.82;
		case 'dme':
			return 5.2;
		case 'dextrose':
		default:
			return 4.0;
	}
}

export function primingSugarGrams(params: {
	volumeL: number;
	targetCo2Vol: number;
	beerTempC: number;
	sugarType: PrimingSugarType;
}): { grams: number; residualCo2: number; deltaCo2: number } {
	const volumeL = Math.max(0, params.volumeL);
	const residualCo2 = Math.max(0, residualCo2ByTempC(params.beerTempC));
	const deltaCo2 = Math.max(0, params.targetCo2Vol - residualCo2);
	const grams = primingFactor(params.sugarType) * volumeL * deltaCo2;

	return { grams, residualCo2, deltaCo2 };
}
