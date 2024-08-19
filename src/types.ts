
export enum TextDirection {
	Auto = 'auto',
	LeftToRight = 'ltr',
	RightToLeft = 'rtl',
}

export interface PluginSettings {
	// null => default
	fontFamily: string|null;
	fontSize: number|null;
	paginate: boolean;

	textDirection: TextDirection,
}