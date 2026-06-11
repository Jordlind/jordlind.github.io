import yaml from 'js-yaml';
import { marked } from 'marked';
import { locales, type Locale } from '$lib/i18n/translations';

const files = import.meta.glob('/src/content/pages/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export interface PageContent {
	title: string;
	html: string;
}

type PageMap = Record<string, Partial<Record<Locale, PageContent>>>;

function build(): PageMap {
	const pages: PageMap = {};

	for (const [path, raw] of Object.entries(files)) {
		const fileName = path.split('/').pop() ?? '';
		const nameMatch = fileName.match(/^(.+)\.([a-z]{2})\.md$/);
		if (!nameMatch) continue;

		const [, name, localeRaw] = nameMatch;
		const locale = localeRaw as Locale;
		if (!locales.includes(locale)) continue;

		const fmMatch = raw.match(FRONTMATTER);
		const data = fmMatch ? ((yaml.load(fmMatch[1]) as Record<string, unknown>) ?? {}) : {};
		const body = fmMatch ? fmMatch[2] : raw;

		pages[name] ??= {};
		pages[name][locale] = {
			title: String(data.title ?? name),
			html: marked.parse(body, { async: false }) as string
		};
	}

	return pages;
}

const pageMap = build();

/** Resolve a page's content for a locale, falling back to any other language. */
export function getPage(name: string, locale: Locale): PageContent | undefined {
	const entry = pageMap[name];
	if (!entry) return undefined;
	if (entry[locale]) return entry[locale];
	for (const l of locales) {
		if (entry[l]) return entry[l];
	}
	return undefined;
}
