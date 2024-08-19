import joplin from 'api';
import { registerSettings } from './settings';
import { PluginSettings } from './types';
import { ContentScriptType, ModelType } from 'api/types';
import { contentScriptId, savedLocationUserDataId } from './constants';

joplin.plugins.register({
	onStart: async function() {
		let lastSettings: PluginSettings;
		let contentScriptRegistered = false;
		lastSettings = await registerSettings((settings: PluginSettings) => {
			lastSettings = settings;

			// Calling editor.execCommand before a content script is registered can cause
			// errors to be logged.
			if (contentScriptRegistered) {
				try {
					joplin.commands.execute('editor.execCommand', {
						name: 'cm6-extended-settings-update',
						args: [ settings ],
					});
				} catch (error) {
					console.info(
						'Failed to load settings. On mobile, this can happen if the editor is not currently open. Error: ', error
					);
				}
			}
		});


		await joplin.contentScripts.register(ContentScriptType.MarkdownItPlugin, contentScriptId, './contentScript/contentScript.js');
		await joplin.contentScripts.onMessage(contentScriptId, async (message: unknown) => {
			if (message === 'getSettings') {
				contentScriptRegistered = true;
				return lastSettings;
			}
			
			const selectedNoteId = (await joplin.workspace.selectedNoteIds())[0];

			if (message === 'getLocation') {
				if (!selectedNoteId) {
					console.log('no selected note');
					return 0;
				}

				const data = await joplin.data.userDataGet(ModelType.Note, selectedNoteId, savedLocationUserDataId);
				return {
					location: data || 0,
					noteId: selectedNoteId,
				};
			} else if (typeof message === 'object' && 'location' in message && 'noteId' in message) {
				if (!selectedNoteId || message.noteId !== selectedNoteId) return;

				await joplin.data.userDataSet(
					ModelType.Note,
					selectedNoteId,
					savedLocationUserDataId,
					message.location,
				);
			} else {
				console.warn('unknown message', message);
			}
		});
	},
});
