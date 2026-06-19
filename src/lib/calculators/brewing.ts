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

export function abvFromOgFg(og: number, fg: number): number {
	const safeOg = Math.max(1, og);
	const safeFg = Math.max(0.9, fg);
	return Math.max(0, (safeOg - safeFg) * 131.25);
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
