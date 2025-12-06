interface AppLocalization {
	setting__maximumWidth: string;
	setting__maximumWidth__description: string;
	setting__paginate: string;
	setting__paginate__description: string;
	setting__fontSize: string;
	setting__fontSize__description: string;
	setting__fontFamily: string;
	settings__appName: string;
	settings__description: string;

	setting__textAlign: string;
	setting__textAlign__unset: string;
	setting__textAlign__start: string;
	setting__textAlign__end: string;
	setting__textAlign__center: string;
	setting__textAlign__justify: string;

	setting__codeBlockScroll: string;
	setting__codeBlockScroll__scroll: string;
	setting__codeBlockScroll__wrap: string;

	setting__quickSettingsVisible: string;
	setting__quickSettingsVisible__description: string;

	button__close: string;
	label__paginate: string;
}

const defaultStrings: AppLocalization = {
	settings__appName: 'Extra viewer settings',
	settings__description: 'Additional settings for Joplin\'s Markdown viewer.',

	setting__textAlign: 'Text alignment',
	setting__textAlign__unset: 'Unset',
	setting__textAlign__start: 'Start',
	setting__textAlign__end: 'End',
	setting__textAlign__center: 'Center',
	setting__textAlign__justify: 'Justify',

	setting__codeBlockScroll: 'Scroll or wrap codeblocks',
	setting__codeBlockScroll__scroll: 'Scroll',
	setting__codeBlockScroll__wrap: 'Wrap',

	setting__maximumWidth: 'Maximum width',
	setting__maximumWidth__description: 'Maximum width of rendered content in the note viewer. Set this to 0 to use the default.',
	setting__fontSize: 'Font size',
	setting__fontSize__description: 'Text size in points.',
	setting__fontFamily: 'Font family',
	setting__paginate: 'Paginate',
	setting__paginate__description:
		'If enabled, Markdown notes are shown in a paged reading mode. In this mode, reading progress is saved and synced across devices.',

	setting__quickSettingsVisible: 'Show quick settings',
	setting__quickSettingsVisible__description: 'If enabled, shows a gear button that allows quickly changing viewer settings.',

	label__paginate: 'Paginate: ',

	button__close: 'Close',
};

const localizations: Record<string, AppLocalization> = {
	en: defaultStrings,

	es: {
		...defaultStrings,
	},
	hr: {
		settings__appName: 'Dodatne postavke preglednika',
		settings__description: 'Dodatne postavke za Joplinov Markdown preglednik.',

		setting__textAlign: 'Poravnanje teksta',
		setting__textAlign__unset: 'Nepostavljeno',
		setting__textAlign__start: 'Početak',
		setting__textAlign__end: 'Kraj',
		setting__textAlign__center: 'Centrirano',
		setting__textAlign__justify: 'Obostrano poravnanje',

		setting__codeBlockScroll: 'Klizna traka ili prelamanje blokova koda',
		setting__codeBlockScroll__scroll: 'Klizna traka',
		setting__codeBlockScroll__wrap: 'Prelamanje',

		setting__maximumWidth: 'Maksimalna širina',
		setting__maximumWidth__description: 'Maksimalna širina prikazanog sadržaja u pregledniku bilješki. Postavi na 0 za korištenje zadane vrijednosti.',
		setting__fontSize: 'Veličina fonta',
		setting__fontSize__description: 'Veličina teksta u točkama.',
		setting__fontFamily: 'Font',
		setting__paginate: 'Paginiraj',
		setting__paginate__description:
			'Ako je uključeno, Markdown bilješke se prikazuju u modusu čitanja paginiranih stranica. U ovom se modusu napredak čitanja sprema i sinkronizira između uređaja.',

		setting__quickSettingsVisible: 'Prikaži brze postavke',
		setting__quickSettingsVisible__description: 'Ako je uključeno, prikazuje gumb s kotačićem za brzza brzo mijenjanje postavki preglednika.',

		label__paginate: 'Paginiraj: ',

		button__close: 'Zatvori',
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
