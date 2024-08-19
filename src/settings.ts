import joplin from "api";
import { SettingItem, SettingItemType, SettingStorage } from "api/types";
import { PluginSettings } from "./types";
import localization from "./localization";

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
			label: localization.setting__fontFamily,
		},
		fontSize: {
			...defaultSettingOptions,
			type: SettingItemType.String,
			value: '',
			label: localization.setting__fontSize,
		},
		paginate: {
			...defaultSettingOptions,
			value: true,
			label: localization.setting__paginate,
		},
	};

	const readSettings = async () => {
		const result: Record<string, any> = {};
		for (const key in settingsSpec) {
			result[key] = (await joplin.settings.value(key)) ?? true;
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