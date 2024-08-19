
export interface PluginSettings {
	// null => default
	fontFamily: string|null;
	fontSize: number|null;
	paginate: boolean;
}

type NoteAndLocation = { noteId: string; location: number; };

export interface ContentScriptControl {
	setLastLocation(noteId: string, location: number): Promise<void>;
	getNoteAndLocation(): Promise<NoteAndLocation>;
	getSettings(): Promise<PluginSettings>;
	addOnSettingsChangeListener(listener: ()=>void): { remove: ()=>void };
	updateSettings(settings: PluginSettings): Promise<void>;

	cacheScroll(): number;
	restoreScroll(cacheKey: number): void;
}
