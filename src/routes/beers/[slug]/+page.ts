import { error } from '@sveltejs/kit';
import { getBeer, getBeerSlugs } from '$lib/content/beers';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
	return getBeerSlugs().map((slug) => ({ slug }));
};

export const load: PageLoad = ({ params }) => {
	const beer = getBeer(params.slug);
	if (!beer) {
		error(404, 'Beer not found');
	}
	return { beer };
};
