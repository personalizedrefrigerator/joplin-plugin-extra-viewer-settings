import joplin from "api";
import { SettingItem, SettingItemSubType, SettingItemType, SettingStorage } from "api/types";
import { CodeBlockScrollMode, PluginSettings } from "./types";
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

	const onMobile = await isMobile();

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
			description: localization.setting__fontSize__description,
		},
		maxWidth: {
			...defaultSettingOptions,
			type: SettingItemType.Int,
			value: 0,
			minimum: 0,
			maximum: 1000,
			label: localization.setting__maximumWidth,
			description: localization.setting__maximumWidth__description,
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
		codeBlockScroll: {
			...defaultSettingOptions,
			type: SettingItemType.String,
			value: onMobile ? CodeBlockScrollMode.Wrap : CodeBlockScrollMode.Scroll,
			isEnum: true,
			label: localization.setting__codeBlockScroll,
			options: {
				[CodeBlockScrollMode.Scroll]: localization.setting__codeBlockScroll__scroll,
				[CodeBlockScrollMode.Wrap]: localization.setting__codeBlockScroll__wrap,
			},
		},
		paginate: {
			...defaultSettingOptions,
			value: onMobile,
			label: localization.setting__paginate,
			description: localization.setting__paginate__description,
		},
		showQuickSettings: {
			...defaultSettingOptions,
			value: true,
			label: localization.setting__quickSettingsVisible,
			description: localization.setting__quickSettingsVisible__description,
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