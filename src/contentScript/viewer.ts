import { contentScriptId } from "../constants";
import { ContentScriptControl, PluginSettings } from "../types";
import { setUpPagination } from "./setUpPagination";
import { setUpToolbar } from "./setUpToolbar";
import { PaginationController } from "./utils/makePaginated";



declare const webviewApi: {
	postMessage(contentScriptId: string, arg: unknown): Promise<any>;
};

const control: ContentScriptControl = {
	setLastLocation: (noteId: string, location: number) => {
		return webviewApi.postMessage(contentScriptId, {
			location,
			noteId,
		});
	},
	getNoteAndLocation: () => {
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
	updateSettings: (settings: PluginSettings) => {
		return webviewApi.postMessage(contentScriptId, {
			newSettings: settings,
		});
	},

	cacheScroll: () => {
		if ('paginationController' in window) {
			const paginationController = window.paginationController as PaginationController;
			return paginationController?.getLocation() ?? -1;
		}
		return -1;
	},
	restoreScroll: (cacheKey) => {
		if (cacheKey >= 0 && 'paginationController' in window) {
			const paginationController = window.paginationController as PaginationController;
			paginationController?.scrollLocationIntoView(cacheKey);
		}
	},
};
setUpPagination(control);
setUpToolbar(control);
