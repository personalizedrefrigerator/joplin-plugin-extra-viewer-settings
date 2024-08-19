import { contentScriptId } from "../constants";
import { ContentScriptControl, PluginSettings } from "../types";
import { setUpPagination } from "./setUpPagination";



declare const webviewApi: {
	postMessage(contentScriptId: string, arg: unknown): Promise<any>;
};

const control: ContentScriptControl = {
	setLastLocation: function (noteId: string, location: number): Promise<void> {
		console.log('set last location', location);
		return webviewApi.postMessage(contentScriptId, {
			location,
			noteId,
		});
	},
	getNoteAndLocation: function (): Promise<{ noteId: string; location: number; }> {
		return webviewApi.postMessage(contentScriptId, 'getLocation');
	},
	getSettings: function (): Promise<PluginSettings> {
		return webviewApi.postMessage(contentScriptId, 'getSettings');
	},
	addOnSettingsChangeListener: (listener: () => void) => {
		let removed = false;
		void (async () => {
			while (!removed) {
				await webviewApi.postMessage(contentScriptId, 'waitForSettingsChange');
				if (!removed) {
					listener();
				}
			}
		})();

		return {
			remove: () => {
				removed = true;
			},
		};
	},
	updateSettings: function (settings: PluginSettings): Promise<void> {
		return webviewApi.postMessage(contentScriptId, {
			newSettings: settings,
		});
	}
};
setUpPagination(control);
