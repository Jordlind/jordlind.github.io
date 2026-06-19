export type IconName = 'plus' | 'x' | 'info' | 'copy' | 'check' | 'download' | 'chevron';

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
	},
	copy: {
		viewBox: '0 0 24 24',
		path: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'
	},
	check: {
		viewBox: '0 0 24 24',
		path: 'M20.3 6.3a1 1 0 0 1 0 1.4l-9.5 9.5a1 1 0 0 1-1.4 0l-4.7-4.7a1 1 0 1 1 1.4-1.4l4 4 8.8-8.8a1 1 0 0 1 1.4 0z'
	},
	download: {
		viewBox: '0 0 24 24',
		path: 'M12 3a1 1 0 0 1 1 1v8.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4l2.3 2.3V4a1 1 0 0 1 1-1zM5 17a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z'
	},
	chevron: {
		viewBox: '0 0 24 24',
		path: 'M6.7 9.3a1 1 0 0 1 1.4 0L12 13.2l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 10.7a1 1 0 0 1 0-1.4z'
	}
};
