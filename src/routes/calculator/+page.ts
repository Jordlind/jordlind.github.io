import { defaultLocale } from '$lib/i18n/translations';
import { getAllBeers, localizedContent } from '$lib/content/beers';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	const recipes = getAllBeers()
		.map((beer) => {
			const content = localizedContent(beer, defaultLocale);
			if (!content?.recipeData) return null;
			return {
				slug: beer.slug,
				name: content.name,
				style: content.style,
				tagline: content.tagline,
				brewed: content.brewed,
				status: content.status,
				recipeData: content.recipeData
			};
		})
		.filter((item): item is NonNullable<typeof item> => item !== null);

	return { recipes };
};
