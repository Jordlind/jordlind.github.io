import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const rootDir = process.cwd();
const recipesDir = path.join(rootDir, 'src/content/recipes');
const locales = ['en', 'sv'];

function listFiles(dirPath) {
	if (!fs.existsSync(dirPath)) return [];
	return fs.readdirSync(dirPath);
}

function numberOrNull(value) {
	if (value == null) return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}

function validateContent(slug, content, errors) {
	if (content == null || typeof content !== 'object') {
		errors.push(`${slug}: missing "content" block with localized text`);
		return;
	}
	for (const locale of locales) {
		const entry = content[locale];
		if (entry == null || typeof entry !== 'object') {
			errors.push(`${slug}: missing content.${locale} block`);
			continue;
		}
		if (!entry.name || String(entry.name).trim() === '') {
			errors.push(`${slug}: content.${locale}.name is required`);
		}
		if (!entry.description || String(entry.description).trim() === '') {
			errors.push(`${slug}: content.${locale}.description is required`);
		}
	}
}

function validateRecipeShape(slug, recipeData, errors) {
	const batchVolumeL = numberOrNull(recipeData.batchVolumeL);
	const og = numberOrNull(recipeData.og);
	const fg = numberOrNull(recipeData.fg);

	if (batchVolumeL == null || batchVolumeL <= 0) {
		errors.push(`${slug}: batchVolumeL must be a positive number`);
	}
	if (og == null || og <= 0) {
		errors.push(`${slug}: og must be a positive number`);
	}
	if (fg == null || fg <= 0) {
		errors.push(`${slug}: fg must be a positive number`);
	}

	const hops = Array.isArray(recipeData.hops) ? recipeData.hops : [];
	const malts = Array.isArray(recipeData.malts) ? recipeData.malts : [];
	if (hops.length === 0) {
		errors.push(`${slug}: at least one hop addition is required`);
	}
	if (malts.length === 0) {
		errors.push(`${slug}: at least one malt addition is required`);
	}

	for (const [index, hop] of hops.entries()) {
		const grams = numberOrNull(hop.grams);
		const alpha = numberOrNull(hop.alphaAcidPercent);
		const boil = numberOrNull(hop.boilMinutes);
		if (grams == null || grams < 0) errors.push(`${slug}: hops[${index}].grams must be >= 0`);
		if (alpha == null || alpha < 0) errors.push(`${slug}: hops[${index}].alphaAcidPercent must be >= 0`);
		if (boil == null || boil < 0) errors.push(`${slug}: hops[${index}].boilMinutes must be >= 0`);
	}

	for (const [index, malt] of malts.entries()) {
		const weight = numberOrNull(malt.weightKg);
		if (weight == null || weight <= 0) errors.push(`${slug}: malts[${index}].weightKg must be > 0`);
		if (malt.colorEbc != null) {
			const color = numberOrNull(malt.colorEbc);
			if (color == null || color < 0)
				errors.push(`${slug}: malts[${index}].colorEbc must be >= 0 when provided`);
		}
	}
}

function run() {
	const errors = [];
	const recipeFiles = listFiles(recipesDir).filter((file) => /\.(yml|yaml)$/i.test(file));

	if (recipeFiles.length === 0) {
		console.error('Recipe validation failed: no recipe files found in src/content/recipes');
		process.exit(1);
	}

	for (const recipeFile of recipeFiles) {
		const slug = recipeFile.replace(/\.(yml|yaml)$/i, '');
		const recipePath = path.join(recipesDir, recipeFile);
		const recipeRaw = fs.readFileSync(recipePath, 'utf8');
		const recipeData = yaml.load(recipeRaw);
		if (!recipeData || typeof recipeData !== 'object') {
			errors.push(`${slug}: recipe YAML does not parse to an object`);
			continue;
		}

		validateContent(slug, recipeData.content, errors);
		validateRecipeShape(slug, recipeData, errors);
	}

	if (errors.length > 0) {
		console.error('Recipe validation failed:\n');
		for (const err of errors) {
			console.error(`- ${err}`);
		}
		process.exit(1);
	}

	console.log(`Recipe validation passed for ${recipeFiles.length} recipes.`);
}

run();
