import { defaultLocale } from '$lib/i18n/translations';
import { getBeer, localizedContent } from '$lib/content/beers';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const slug = url.searchParams.get('beer')?.trim();
	if (!slug) {
		return { prefill: null, requestedSlug: null };
	}

	const beer = getBeer(slug);
	if (!beer) {
		return { prefill: null, requestedSlug: slug };
	}

	const content = localizedContent(beer, defaultLocale);
	if (!content?.recipeData) {
		return { prefill: null, requestedSlug: slug };
	}

	return {
		requestedSlug: slug,
		prefill: {
			slug,
			name: content.name,
			recipeData: content.recipeData
		}
	};
};
