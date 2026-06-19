import { defaultLocale } from '$lib/i18n/translations';
import { getAllBeers, getBeer, localizedContent } from '$lib/content/beers';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const recipes = getAllBeers()
		.map((beer) => {
			const content = localizedContent(beer, defaultLocale);
			if (!content?.recipeData) return null;
			return {
				slug: beer.slug,
				name: content.name
			};
		})
		.filter((item): item is { slug: string; name: string } => item !== null);

	const slug = url.searchParams.get('beer')?.trim();
	if (!slug) {
		return { prefill: null, requestedSlug: null, recipes };
	}

	const beer = getBeer(slug);
	if (!beer) {
		return { prefill: null, requestedSlug: slug, recipes };
	}

	const content = localizedContent(beer, defaultLocale);
	if (!content?.recipeData) {
		return { prefill: null, requestedSlug: slug, recipes };
	}

	return {
		requestedSlug: slug,
		recipes,
		prefill: {
			slug,
			name: content.name,
			recipeData: content.recipeData
		}
	};
};
