export type IconName = 'plus' | 'x' | 'info';

type IconDef = {
	viewBox: string;
	path: string;
};

export const ICONS: Record<IconName, IconDef> = {
	plus: {
		viewBox: '0 0 24 24',
		path: 'M11 5a1 1 0 0 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5z'
	},
	x: {
		viewBox: '0 0 24 24',
		path: 'M6.7 5.3a1 1 0 0 1 1.4 0L12 9.2l3.9-3.9a1 1 0 1 1 1.4 1.4L13.4 10.6l3.9 3.9a1 1 0 0 1-1.4 1.4L12 12l-3.9 3.9a1 1 0 1 1-1.4-1.4l3.9-3.9-3.9-3.9a1 1 0 0 1 0-1.4z'
	},
	info: {
		viewBox: '0 0 24 24',
		path: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 5a1.2 1.2 0 1 0 0 2.4A1.2 1.2 0 0 0 12 8zm1 4h-2a1 1 0 0 0 0 2h1v3h-1a1 1 0 1 0 0 2h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z'
	}
};
