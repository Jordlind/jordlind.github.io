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
				recipeData: content.recipeData
			};
		})
		.filter(
			(item): item is { slug: string; name: string; recipeData: NonNullable<typeof item>['recipeData'] } => item !== null
		);

	return { recipes };
};
