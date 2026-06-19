import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const rootDir = process.cwd();
const beersDir = path.join(rootDir, 'src/content/beers');
const recipesDir = path.join(rootDir, 'src/content/recipes');
const locales = ['en', 'sv'];
const forbiddenFrontmatterKeys = ['abv', 'ibu', 'ebc', 'og', 'fg', 'brewed', 'images', 'image', 'available'];

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

function listFiles(dirPath) {
	if (!fs.existsSync(dirPath)) return [];
	return fs.readdirSync(dirPath);
}

function parseFrontmatter(filePath) {
	const raw = fs.readFileSync(filePath, 'utf8');
	const match = raw.match(FRONTMATTER);
	if (!match) return {};
	const data = yaml.load(match[1]);
	if (data && typeof data === 'object') return data;
	return {};
}

function numberOrNull(value) {
	if (value == null) return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}

function collectBeerSlugs() {
	const slugs = new Map();
	for (const fileName of listFiles(beersDir)) {
		const match = fileName.match(/^(.+)\.(en|sv)\.md$/);
		if (!match) continue;
		const [, slug, locale] = match;
		const entry = slugs.get(slug) ?? new Set();
		entry.add(locale);
		slugs.set(slug, entry);
	}
	return slugs;
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
			if (color == null || color < 0) errors.push(`${slug}: malts[${index}].colorEbc must be >= 0 when provided`);
		}
	}
}

function run() {
	const errors = [];
	const beerSlugs = collectBeerSlugs();

	for (const [slug, slugLocales] of beerSlugs.entries()) {
		for (const locale of locales) {
			if (!slugLocales.has(locale)) {
				errors.push(`${slug}: missing ${locale} markdown file`);
			}
		}

		const recipePath = path.join(recipesDir, `${slug}.yml`);
		if (!fs.existsSync(recipePath)) {
			errors.push(`${slug}: missing canonical recipe file at src/content/recipes/${slug}.yml`);
			continue;
		}

		const recipeRaw = fs.readFileSync(recipePath, 'utf8');
		const recipeData = yaml.load(recipeRaw);
		if (!recipeData || typeof recipeData !== 'object') {
			errors.push(`${slug}: recipe YAML does not parse to an object`);
			continue;
		}

		validateRecipeShape(slug, recipeData, errors);

		for (const locale of locales) {
			const mdPath = path.join(beersDir, `${slug}.${locale}.md`);
			if (!fs.existsSync(mdPath)) continue;
			const frontmatter = parseFrontmatter(mdPath);
			for (const key of forbiddenFrontmatterKeys) {
				if (Object.hasOwn(frontmatter, key)) {
					errors.push(`${slug}.${locale}.md: frontmatter key "${key}" must live in canonical recipe YAML`);
				}
			}
		}
	}

	for (const recipeFile of listFiles(recipesDir)) {
		const match = recipeFile.match(/^(.+)\.yml$/);
		if (!match) continue;
		const slug = match[1];
		if (!beerSlugs.has(slug)) {
			errors.push(`recipe ${recipeFile}: no matching markdown files in src/content/beers`);
		}
	}

	if (errors.length > 0) {
		console.error('Recipe validation failed:\n');
		for (const err of errors) {
			console.error(`- ${err}`);
		}
		process.exit(1);
	}

	console.log(`Recipe validation passed for ${beerSlugs.size} beer slugs.`);
}

run();
