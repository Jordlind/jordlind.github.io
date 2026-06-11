import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { translations, defaultLocale, locales, type Locale } from './translations';

const STORAGE_KEY = 'jordlind-locale';

function initialLocale(): Locale {
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored && locales.includes(stored as Locale)) {
			return stored as Locale;
		}
		const nav = navigator.language.toLowerCase();
		if (nav.startsWith('sv')) return 'sv';
		if (nav.startsWith('en')) return 'en';
	}
	return defaultLocale;
}

export const locale = writable<Locale>(initialLocale());

if (browser) {
	locale.subscribe((value) => {
		localStorage.setItem(STORAGE_KEY, value);
		document.documentElement.lang = value;
	});
}

export function setLocale(value: Locale) {
	locale.set(value);
}

/** Reactive translator: `$t('nav.home')`. */
export const t = derived(locale, ($locale) => {
	return (key: string): string => translations[$locale][key] ?? key;
});

export { locales, defaultLocale, type Locale };
