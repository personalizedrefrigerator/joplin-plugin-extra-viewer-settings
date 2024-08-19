interface AppLocalization {
	setting__paginate: string;
	setting__fontSize: string;
	setting__fontFamily: string;
	settings__appName: string;
	settings__description: string;
	setting__textDirection: string;
	setting__textDirection__description: string;
	setting__textDirection__auto: string;
	setting__textDirection__leftToRight: string;
	setting__textDirection__rightToLeft: string;
}

const defaultStrings: AppLocalization = {
	settings__appName: 'Extra viewer settings',
	settings__description: 'Additional settings for Joplin\'s Markdown viewer.',

	setting__textDirection: 'Text direction',
	setting__textDirection__description: 'Overrides the default direction of text in the CodeMirror editor. For most users, this should be set to "auto".',
	setting__textDirection__auto: 'Auto',
	setting__textDirection__leftToRight: 'Left-to-right',
	setting__textDirection__rightToLeft: 'Right-to-left',
	setting__paginate: 'Paginate',
	setting__fontSize: 'Font size',
	setting__fontFamily: 'Font family',
};

const localizations: Record<string, AppLocalization> = {
	en: defaultStrings,

	es: {
		...defaultStrings,
	},
};

let localization: AppLocalization | undefined;

const languages = [...navigator.languages];
for (const language of navigator.languages) {
	const localeSep = language.indexOf('-');

	if (localeSep !== -1) {
		languages.push(language.substring(0, localeSep));
	}
}

for (const locale of languages) {
	if (locale in localizations) {
		localization = localizations[locale];
		break;
	}
}

if (!localization) {
	console.log('No supported localization found. Falling back to default.');
	localization = defaultStrings;
}

export default localization!;
