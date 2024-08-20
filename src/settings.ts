import joplin from "api";
import { SettingItem, SettingItemSubType, SettingItemType, SettingStorage } from "api/types";
import { PluginSettings } from "./types";
import localization from "./localization";
import { isMobile } from "./utils/isMobile";

export const registerSettings = async (applySettings: (settings: PluginSettings)=>void) => {
	const sectionName = 'viewer-extended-options';
	await joplin.settings.registerSection(sectionName, {
		label: localization.settings__appName,
		description: localization.settings__description,
		iconName: 'fas fa-file-alt',
	});

	const defaultSettingOptions = {
		section: sectionName,
		public: true,
		type: SettingItemType.Bool,
		storage: SettingStorage.File,
	};

	const settingsSpec: Record<keyof PluginSettings, SettingItem> = {
		fontFamily: {
			...defaultSettingOptions,
			type: SettingItemType.String,
			value: '',
			// font_family was added after the types were last updated
			subType: 'font_family' as unknown as SettingItemSubType,
			label: localization.setting__fontFamily,
		},
		fontSize: {
			...defaultSettingOptions,
			type: SettingItemType.Int,
			value: 12,
			minimum: 8,
			maximum: 30,
			label: localization.setting__fontSize,
		},
		maxWidth: {
			...defaultSettingOptions,
			type: SettingItemType.Int,
			value: 0,
			minimum: 0,
			maximum: 1000,
			label: localization.setting__maximumWidth,
		},
		paginate: {
			...defaultSettingOptions,
			value: await isMobile(),
			label: localization.setting__paginate,
		},
		textAlign: {
			...defaultSettingOptions,
			type: SettingItemType.String,
			value: '',
			isEnum: true,
			label: localization.setting__textAlign,
			options: {
				'unset': localization.setting__textAlign__unset,
				'start': localization.setting__textAlign__start,
				'end': localization.setting__textAlign__end,
				'center': localization.setting__textAlign__center,
				'justify': localization.setting__textAlign__justify,
			},
		},
	};

	const readSettings = async () => {
		const result: Record<string, any> = {};
		for (const key in settingsSpec) {
			result[key] = await joplin.settings.value(key);
		}
		return result as PluginSettings;
	};
	await joplin.settings.registerSettings(settingsSpec);
	await joplin.settings.onChange(async () => {
		applySettings(await readSettings());
	});

	const settings = await readSettings();
	applySettings(settings);
	return settings;
};