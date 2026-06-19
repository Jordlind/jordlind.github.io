// Beer colour by EBC value.
//
// Based on the standard SRM colour chart (the de-facto hex values used across
// brewing references) converted to EBC, since EBC = SRM × 1.97. Each entry maps
// an EBC value to the approximate beer colour, going from pale straw to deep
// brown/black as the EBC rises — the same ramp you find in brewing books.
export const EBC_COLORS: ReadonlyArray<{ ebc: number; hex: string }> = [
	{ ebc: 2, hex: '#FFE699' },
	{ ebc: 4, hex: '#FFD878' },
	{ ebc: 6, hex: '#FFCA5A' },
	{ ebc: 8, hex: '#FFBF42' },
	{ ebc: 10, hex: '#FBB123' },
	{ ebc: 12, hex: '#F8A600' },
	{ ebc: 14, hex: '#F39C00' },
	{ ebc: 16, hex: '#EA8F00' },
	{ ebc: 18, hex: '#E58500' },
	{ ebc: 20, hex: '#DE7C00' },
	{ ebc: 22, hex: '#D77200' },
	{ ebc: 24, hex: '#CF6900' },
	{ ebc: 26, hex: '#CB6200' },
	{ ebc: 28, hex: '#C35900' },
	{ ebc: 30, hex: '#BB5100' },
	{ ebc: 32, hex: '#B54C00' },
	{ ebc: 33, hex: '#B04500' },
	{ ebc: 35, hex: '#A63E00' },
	{ ebc: 37, hex: '#A13700' },
	{ ebc: 39, hex: '#9B3200' },
	{ ebc: 41, hex: '#952D00' },
	{ ebc: 43, hex: '#8E2900' },
	{ ebc: 45, hex: '#882300' },
	{ ebc: 47, hex: '#821E00' },
	{ ebc: 49, hex: '#7B1A00' },
	{ ebc: 51, hex: '#771900' },
	{ ebc: 53, hex: '#701400' },
	{ ebc: 55, hex: '#6A0E00' },
	{ ebc: 57, hex: '#660D00' },
	{ ebc: 59, hex: '#5E0B00' },
	{ ebc: 61, hex: '#5A0A02' },
	{ ebc: 63, hex: '#600903' },
	{ ebc: 65, hex: '#520907' },
	{ ebc: 67, hex: '#4C0505' },
	{ ebc: 69, hex: '#470606' },
	{ ebc: 71, hex: '#440607' },
	{ ebc: 73, hex: '#3F0708' },
	{ ebc: 75, hex: '#3B0607' },
	{ ebc: 77, hex: '#3A070B' },
	{ ebc: 79, hex: '#36080A' }
];

/** Returns the EBC entry closest to the given EBC value. */
export function closestEbcEntry(ebc: number): { ebc: number; hex: string } {
	let closest = EBC_COLORS[0];
	let smallestDiff = Math.abs(ebc - closest.ebc);
	for (const entry of EBC_COLORS) {
		const diff = Math.abs(ebc - entry.ebc);
		if (diff < smallestDiff) {
			smallestDiff = diff;
			closest = entry;
		}
	}
	return closest;
}

/** Returns the hex colour for the EBC entry closest to the given value. */
export function ebcColor(ebc: number): string {
	return closestEbcEntry(ebc).hex;
}
